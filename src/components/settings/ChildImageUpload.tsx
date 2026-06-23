"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  childId: string;
  currentImage?: string | null;
}

const PRESETS = [
  { path: "/avatars/bunny.svg", label: "토끼" },
  { path: "/avatars/bear.svg", label: "곰" },
  { path: "/avatars/cat.svg", label: "고양이" },
  { path: "/avatars/dog.svg", label: "강아지" },
  { path: "/avatars/frog.svg", label: "개구리" },
  { path: "/avatars/penguin.svg", label: "펭귄" },
  { path: "/avatars/fox.svg", label: "여우" },
  { path: "/avatars/panda.svg", label: "판다" },
  { path: "/avatars/chick.svg", label: "병아리" },
  { path: "/avatars/hamster.svg", label: "햄스터" },
  { path: "/avatars/lion.svg", label: "사자" },
  { path: "/avatars/koala.svg", label: "코알라" },
];

async function compressToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        const SIZE = 256;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d")!;
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ChildImageUpload({ childId, currentImage }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  async function handlePreset(path: string) {
    setShowPicker(false);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/children/${childId}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: path }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "저장에 실패했어요.");
      }
      setPreview(path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 선택해주세요.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const compressed = await compressToSquare(file);
      setPreview(compressed);
      const res = await fetch(`/api/children/${childId}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "저장에 실패했어요.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/children/${childId}/image`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "" }),
      });
      if (!res.ok) throw new Error("삭제에 실패했어요.");
      setPreview(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={() => setShowPicker(true)}
        disabled={saving}
        className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
        style={{ backgroundColor: "#FFD4B8" }}
        title="사진 등록"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="아이 사진" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl flex items-center justify-center w-full h-full">👶</span>
        )}
        {saving ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="absolute bottom-0 inset-x-0 h-4 bg-black/30 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">사진</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {preview && !saving && (
        <button
          onClick={handleRemove}
          className="text-[10px] text-[#C4B5A8] hover:text-[#EF4444] transition-colors"
        >
          삭제
        </button>
      )}
      {error && (
        <p className="text-[10px] text-[#EF4444] text-center max-w-[60px]">{error}</p>
      )}

      {/* 아바타 선택 모달 */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-sm p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-bold text-[#3D3530] text-base mb-4">
              캐릭터 선택
            </h3>

            {/* 3×4 프리셋 그리드 */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {PRESETS.map((p) => (
                <button
                  key={p.path}
                  onClick={() => handlePreset(p.path)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                      preview === p.path
                        ? "ring-[#FF9B7B] scale-105"
                        : "ring-transparent group-hover:ring-[#FFD4B8]"
                    }`}
                  >
                    <Image
                      src={p.path}
                      alt={p.label}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-[#8B7E74]">{p.label}</span>
                </button>
              ))}
            </div>

            {/* 직접 업로드 */}
            <button
              onClick={() => {
                setShowPicker(false);
                inputRef.current?.click();
              }}
              className="w-full py-2.5 rounded-xl border border-[#E8DDD5] text-sm text-[#8B7E74] hover:bg-[#FFF5F0] transition-colors"
            >
              📷 직접 사진 업로드
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

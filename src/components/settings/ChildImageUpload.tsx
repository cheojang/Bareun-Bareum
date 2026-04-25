"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  childId: string;
  currentImage?: string | null;
}

async function compressToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const SIZE = 256;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d")!;
        // 정사각형 중앙 크롭
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
      {/* 아바타 클릭 → 파일 선택 */}
      <button
        onClick={() => inputRef.current?.click()}
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

      {/* 삭제 링크 */}
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
    </div>
  );
}

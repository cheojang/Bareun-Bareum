"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"남아" | "여아" | "">("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("아이 이름 또는 별명을 입력해주세요"); return; }
    if (birthDate && birthDate > today) { setError("생년월일은 오늘 이전 날짜여야 해요"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), birthDate: birthDate || null, gender: gender || null, image: selectedAvatar }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error ?? "오류가 발생했어요");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(160deg, #FFF5EE 0%, #F0FAF8 60%, #EDE9FE 100%)" }}
    >
      <div className="text-center mb-8">
        {/* 아바타 선택 영역 */}
        <button
          type="button"
          onClick={() => setShowAvatarPicker(true)}
          className="relative inline-block mb-4 group"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
            style={{ backgroundColor: "#FFD4B8" }}>
            {selectedAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedAvatar} alt="선택된 캐릭터" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">👶</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FFB38A] border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow">
            ✏️
          </div>
        </button>
        <p className="text-xs text-[#C4B5A8] mb-3">
          {selectedAvatar ? "캐릭터를 변경하려면 탭하세요" : "캐릭터를 선택해보세요 (선택사항)"}
        </p>
        <h1 className="text-2xl font-black text-[#3D3530]">아이 정보를 알려주세요</h1>
        <p className="text-[#8B7E74] mt-2 text-sm">
          아이에게 맞는 단어와 연습법을 추천해드려요
        </p>
      </div>

      <BubbleCard className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#3D3530] mb-2">
              아이 이름 또는 별명 <span className="text-[#FFB38A]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="별명이나 이름을 등록해주세요"
              className="w-full rounded-[16px] border-2 border-[#F0E8E0] bg-white px-4 py-3 text-[#3D3530] placeholder-[#C4B5A8] focus:border-[#FFB38A] focus:outline-none transition-colors"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3530] mb-2">
              성별 <span className="text-[#C4B5A8] font-normal">(선택)</span>
            </label>
            <div className="flex gap-2">
              {(["남아", "여아"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(gender === g ? "" : g)}
                  className={`flex-1 py-3 rounded-[16px] border-2 font-bold text-sm transition-colors ${
                    gender === g
                      ? g === "남아"
                        ? "bg-[#EEF3FF] border-[#8B7EFF] text-[#8B7EFF]"
                        : "bg-[#FFF0F5] border-[#FF8AB0] text-[#FF8AB0]"
                      : "bg-white border-[#F0E8E0] text-[#8B7E74]"
                  }`}
                >
                  {g === "남아" ? "👦 남아" : "👧 여아"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3D3530] mb-2">
              생년월일 <span className="text-[#C4B5A8] font-normal">(선택)</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={today}
              className="w-full rounded-[16px] border-2 border-[#F0E8E0] bg-white px-4 py-3 text-[#3D3530] focus:border-[#FFB38A] focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <BubbleButton
            type="submit"
            variant="peach"
            size="lg"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "저장 중..." : "시작하기 🎉"}
          </BubbleButton>
        </form>
      </BubbleCard>

      {/* 아바타 선택 모달 */}
      {showAvatarPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-sm p-5 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center font-bold text-[#3D3530] text-base mb-4">캐릭터 선택</h3>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {PRESETS.map((p) => (
                <button
                  key={p.path}
                  type="button"
                  onClick={() => { setSelectedAvatar(p.path); setShowAvatarPicker(false); }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                    selectedAvatar === p.path
                      ? "ring-[#FF9B7B] scale-105"
                      : "ring-transparent group-hover:ring-[#FFD4B8]"
                  }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.path} alt={p.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-[#8B7E74]">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAvatarPicker(false)}
              className="w-full py-2.5 rounded-xl border border-[#E8DDD5] text-sm text-[#8B7E74] hover:bg-[#FFF5F0] transition-colors"
            >
              나중에 설정할게요
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

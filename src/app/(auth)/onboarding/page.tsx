"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { BubbleCard } from "@/components/ui/BubbleCard";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"남아" | "여아" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("아이 이름을 입력해주세요"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), birthDate: birthDate || null, gender: gender || null }),
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
        <div className="text-6xl mb-4">👶</div>
        <h1 className="text-2xl font-black text-[#3D3530]">아이 정보를 알려주세요</h1>
        <p className="text-[#8B7E74] mt-2 text-sm">
          아이에게 맞는 단어와 연습법을 추천해드려요
        </p>
      </div>

      <BubbleCard className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#3D3530] mb-2">
              아이 이름 <span className="text-[#FFB38A]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 민준"
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
    </main>
  );
}

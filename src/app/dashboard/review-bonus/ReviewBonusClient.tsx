"use client";

import { useState } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";
import { postJson } from "@/lib/client-fetch";

interface ReviewBonus {
  id: string;
  url: string;
  channel: string;
  status: "approved" | "rejected";
  charCount?: number | null;
  rejectReason?: string | null;
  createdAt: string;
  approvedAt?: string | null;
}

interface Props {
  initialSubmissions: ReviewBonus[];
  initialBonusCount: number;
  initialCanSubmit: boolean;
  trialEndsAt: string | null;
  migrationNeeded: boolean;
}

const CHANNEL_LABELS: Record<string, string> = {
  blog: "블로그",
  sns: "SNS / 인스타그램",
  community: "커뮤니티",
  playstore: "구글 플레이스토어",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function trialDaysLeft(iso: string | null): number {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / (24 * 60 * 60 * 1000)) : 0;
}

export function ReviewBonusClient({
  initialSubmissions,
  initialBonusCount,
  initialCanSubmit,
  trialEndsAt,
  migrationNeeded,
}: Props) {
  const [submissions, setSubmissions] =
    useState<ReviewBonus[]>(initialSubmissions);
  const [bonusCount, setBonusCount] = useState(initialBonusCount);
  const [canSubmit, setCanSubmit] = useState(initialCanSubmit);
  const [currentTrialEndsAt, setCurrentTrialEndsAt] = useState(trialEndsAt);

  const [url, setUrl] = useState("");
  const [channel, setChannel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const daysLeft = trialDaysLeft(currentTrialEndsAt);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !channel) {
      setMessage({ type: "error", text: "URL과 채널을 모두 입력해주세요" });
      return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setMessage({
        type: "error",
        text: "http:// 또는 https://로 시작하는 URL을 입력해주세요",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/review-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), channel }),
      });

      const data = await res.json();

      if (res.ok) {
        // 성공
        setMessage({ type: "success", text: data.message ?? "승인되었어요!" });
        setUrl("");
        setChannel("");

        if (data.newTrialEndsAt) {
          setCurrentTrialEndsAt(data.newTrialEndsAt);
        }

        // 목록 새로고침
        const updated = await fetch("/api/review-bonus").then((r) =>
          r.json().catch(() => null),
        );
        if (updated) {
          setSubmissions(updated.submissions ?? []);
          setBonusCount(updated.bonusCount ?? 0);
          setCanSubmit(updated.canSubmit ?? false);
        }
      } else if (res.status === 422) {
        // 거절
        setMessage({
          type: "error",
          text: data.rejectReason ?? data.message ?? "후기 내용이 기준을 충족하지 못했어요",
        });
        // 거절된 항목도 이력에 추가
        const updated = await fetch("/api/review-bonus").then((r) =>
          r.json().catch(() => null),
        );
        if (updated) {
          setSubmissions(updated.submissions ?? []);
          setBonusCount(updated.bonusCount ?? 0);
          setCanSubmit(updated.canSubmit ?? false);
        }
      } else {
        setMessage({ type: "error", text: data.error ?? "오류가 발생했어요" });
      }
    } catch {
      setMessage({ type: "error", text: "네트워크 오류가 발생했어요. 다시 시도해주세요." });
    } finally {
      setLoading(false);
    }
  }

  if (migrationNeeded) {
    return (
      <div className="px-5 pt-6 max-w-lg mx-auto">
        <div className="bg-[#FFF5EE] border border-[#FFB38A] rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">⚙️</p>
          <p className="font-bold text-[#3D3530]">DB 마이그레이션이 필요해요</p>
          <p className="text-sm text-[#8B7E74] mt-1">
            관리자가 /api/migrate-review-bonus를 실행한 후 이용해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-10">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">후기 인증 혜택 ✍️</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          앱 후기를 작성하고 URL을 제출하면 무료 이용 기간이 1주일 연장돼요
        </p>
      </div>

      {/* 진행 현황 카드 */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ backgroundColor: "#FFF5EE", border: "1.5px solid #F0E8E0" }}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3D3530]">사용 현황</span>
          <span className="text-sm font-semibold text-[#FFB38A]">
            {bonusCount} / 10회
          </span>
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-[#F0E8E0] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${(bonusCount / 10) * 100}%`,
              backgroundColor: bonusCount >= 10 ? "#A8D8CF" : "#FFB38A",
            }}
          />
        </div>

        <p className="text-xs text-[#8B7E74]">
          {bonusCount >= 10
            ? "최대 혜택(10주)을 모두 사용하셨어요"
            : `${10 - bonusCount}회 더 신청할 수 있어요`}
        </p>

        {/* 남은 무료 기간 */}
        {daysLeft > 0 && (
          <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🗓️</span>
            <div>
              <p className="text-xs text-[#8B7E74]">남은 무료 이용 기간</p>
              <p className="font-bold text-[#3D3530]">
                {daysLeft}일 남음{" "}
                <span className="text-xs font-normal text-[#8B7E74]">
                  (~{formatDate(currentTrialEndsAt!)})
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 이용 안내 */}
      <div
        className="rounded-2xl p-4 space-y-1.5"
        style={{ backgroundColor: "#F0FAF8", border: "1.5px solid #A8D8CF" }}
      >
        <p className="text-sm font-bold text-[#3D3530]">📋 이용 규정</p>
        <ul className="text-xs text-[#8B7E74] space-y-1 list-disc list-inside">
          <li>블로그, SNS(인스타그램 등), 커뮤니티, 구글 플레이스토어에 후기 작성</li>
          <li>후기 내용은 200자 이상이어야 해요</li>
          <li>승인 후 7일이 지나야 다음 신청이 가능해요</li>
          <li>최대 10회 (총 10주) 연장 가능해요</li>
          <li>구글 플레이스토어 후기는 자동 승인돼요</li>
        </ul>
      </div>

      {/* 제출 폼 */}
      {canSubmit ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #F0E8E0" }}
          >
            <p className="font-bold text-[#3D3530]">후기 URL 제출</p>

            {/* 채널 선택 */}
            <div>
              <label className="text-xs font-semibold text-[#8B7E74] mb-1.5 block">
                채널 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "blog", label: "블로그" },
                    { value: "sns", label: "SNS / 인스타그램" },
                    { value: "community", label: "커뮤니티" },
                    { value: "playstore", label: "구글 플레이스토어" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setChannel(value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      channel === value
                        ? "border-[#FFB38A] bg-[#FFF5EE] text-[#FFB38A]"
                        : "border-[#F0E8E0] bg-white text-[#8B7E74] hover:border-[#FFB38A]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL 입력 */}
            <div>
              <label
                htmlFor="review-url"
                className="text-xs font-semibold text-[#8B7E74] mb-1.5 block"
              >
                후기 URL
              </label>
              <input
                id="review-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://blog.naver.com/..."
                className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] bg-[#FFF9F5] text-[#3D3530] text-sm focus:outline-none focus:border-[#FFB38A] transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-[#B0A89E] mt-1">
                후기를 작성한 페이지의 주소(URL)를 붙여넣어주세요
              </p>
            </div>

            {/* 메시지 */}
            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-[#F0FAF8] text-[#2D8E7E]"
                    : "bg-[#FFF0F0] text-[#D05050]"
                }`}
              >
                {message.type === "success" ? "✅ " : "❌ "}
                {message.text}
              </div>
            )}

            <BubbleButton
              type="submit"
              variant="peach"
              className="w-full"
              disabled={loading || !url.trim() || !channel}
            >
              {loading ? "확인 중..." : "후기 제출하기"}
            </BubbleButton>
          </div>
        </form>
      ) : bonusCount >= 10 ? (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "#F0FAF8", border: "1.5px solid #A8D8CF" }}
        >
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-[#3D3530]">모든 혜택을 받으셨어요!</p>
          <p className="text-sm text-[#8B7E74] mt-1">
            최대 10주 연장을 모두 사용하셨어요
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "#FFF5EE", border: "1.5px solid #F0E8E0" }}
        >
          <p className="text-2xl mb-2">⏳</p>
          <p className="font-bold text-[#3D3530]">7일 후에 다시 신청할 수 있어요</p>
          <p className="text-sm text-[#8B7E74] mt-1">
            마지막 승인 후 7일이 지나야 새로 신청할 수 있어요
          </p>
        </div>
      )}

      {/* 제출 이력 */}
      {submissions.length > 0 && (
        <div>
          <p className="font-bold text-[#3D3530] mb-3">제출 이력</p>
          <div className="space-y-2">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl px-4 py-3 flex items-start gap-3"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #F0E8E0",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        sub.status === "approved"
                          ? "bg-[#F0FAF8] text-[#2D8E7E]"
                          : "bg-[#FFF0F0] text-[#D05050]"
                      }`}
                    >
                      {sub.status === "approved" ? "승인됨" : "거절됨"}
                    </span>
                    <span className="text-xs text-[#B0A89E]">
                      {CHANNEL_LABELS[sub.channel] ?? sub.channel}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B7E74] truncate">{sub.url}</p>
                  {sub.rejectReason && (
                    <p className="text-xs text-[#D05050] mt-0.5">
                      {sub.rejectReason}
                    </p>
                  )}
                </div>
                <span className="text-xs text-[#B0A89E] shrink-0 mt-0.5">
                  {formatDate(sub.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

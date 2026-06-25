"use client";

import { useState } from "react";
import { BubbleButton } from "@/components/ui/BubbleButton";

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

interface BulkEntry {
  id: string;
  channel: string;
  url: string;
  screenshot: string | null; // base64
  screenshotName: string;
}

interface Props {
  initialSubmissions: ReviewBonus[];
  initialBonusCount: number;
  initialCanSubmit: boolean;
  trialEndsAt: string | null;
  migrationNeeded: boolean;
}

const CHANNEL_OPTIONS = [
  { value: "blog", label: "블로그" },
  { value: "sns", label: "SNS / 인스타그램" },
  { value: "community", label: "커뮤니티" },
  { value: "playstore", label: "구글 플레이스토어" },
] as const;

const CHANNEL_LABELS: Record<string, string> = {
  blog: "블로그",
  sns: "SNS / 인스타그램",
  community: "커뮤니티",
  playstore: "구글 플레이스토어",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
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

function makeBulkEntry(i: number): BulkEntry {
  return { id: `b${i}_${Date.now()}`, channel: "", url: "", screenshot: null, screenshotName: "" };
}

async function uploadScreenshot(base64: string): Promise<string | null> {
  const res = await fetch("/api/review-bonus/screenshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "이미지 업로드에 실패했어요");
  }
  const data = await res.json();
  return data.url ?? null;
}

async function refreshState() {
  return fetch("/api/review-bonus").then((r) => r.json().catch(() => null));
}

// ── 채널 선택 그리드 ─────────────────────────────────────────────────────────
function ChannelSelector({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CHANNEL_OPTIONS.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          disabled={disabled}
          className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
            value === v
              ? "border-[#FFB38A] bg-[#FFF5EE] text-[#FFB38A]"
              : "border-[#F0E8E0] bg-white text-[#8B7E74] hover:border-[#FFB38A]"
          } disabled:opacity-50`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── 개별 후기 입력 카드 (일괄 제출용) ────────────────────────────────────────
function BulkEntryCard({
  entry,
  index,
  onUpdate,
  onRemove,
  canRemove,
  disabled,
}: {
  entry: BulkEntry;
  index: number;
  onUpdate: (id: string, field: keyof BulkEntry, value: string | null) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  disabled: boolean;
}) {
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 파일이 너무 커요 (최대 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate(entry.id, "screenshot", ev.target?.result as string);
      onUpdate(entry.id, "screenshotName", file.name);
      onUpdate(entry.id, "url", "");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: "#FAFAF8", border: "1.5px solid #F0E8E0" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#3D3530]">후기 {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            disabled={disabled}
            className="text-xs text-[#B0A89E] hover:text-[#D05050] transition-colors disabled:opacity-40"
          >
            삭제
          </button>
        )}
      </div>

      <ChannelSelector
        value={entry.channel}
        onChange={(v) => onUpdate(entry.id, "channel", v)}
        disabled={disabled}
      />

      <div className="space-y-2">
        <input
          type="text"
          inputMode="url"
          value={entry.url}
          onChange={(e) => {
            onUpdate(entry.id, "url", e.target.value);
            if (e.target.value) {
              onUpdate(entry.id, "screenshot", null);
              onUpdate(entry.id, "screenshotName", "");
            }
          }}
          placeholder="https://blog.naver.com/..."
          disabled={disabled || !!entry.screenshot}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-[#F0E8E0] bg-white text-[#3D3530] text-sm focus:outline-none focus:border-[#FFB38A] transition-colors disabled:opacity-50"
        />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#F0E8E0]" />
          <span className="text-xs text-[#C4B5A8] font-semibold">또는</span>
          <div className="flex-1 h-px bg-[#F0E8E0]" />
        </div>

        {entry.screenshot ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-[#A8D8CF]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.screenshot}
              alt="캡처본"
              className="w-full max-h-32 object-contain bg-[#F8F8F8]"
            />
            <button
              type="button"
              onClick={() => {
                onUpdate(entry.id, "screenshot", null);
                onUpdate(entry.id, "screenshotName", "");
              }}
              disabled={disabled}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        ) : (
          <label
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#F0E8E0] bg-white cursor-pointer hover:border-[#FFB38A] transition-colors text-xs font-semibold text-[#8B7E74] ${
              entry.url.trim() || disabled ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <span>📷</span>
            <span>캡처본 이미지 선택</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageSelect}
              disabled={disabled || !!entry.url.trim()}
            />
          </label>
        )}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export function ReviewBonusClient({
  initialSubmissions,
  initialBonusCount,
  initialCanSubmit,
  trialEndsAt,
  migrationNeeded,
}: Props) {
  const [submissions, setSubmissions] = useState<ReviewBonus[]>(initialSubmissions);
  const [bonusCount, setBonusCount] = useState(initialBonusCount);
  const [canSubmit, setCanSubmit] = useState(initialCanSubmit);
  const [currentTrialEndsAt, setCurrentTrialEndsAt] = useState(trialEndsAt);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 개별 제출 상태
  const [url, setUrl] = useState("");
  const [channel, setChannel] = useState<string>("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>("");

  // 일괄 제출 상태
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([makeBulkEntry(1)]);

  const daysLeft = trialDaysLeft(currentTrialEndsAt);
  const remainingSlots = Math.max(0, 4 - bonusCount);

  // ── 개별 이미지 선택 ─────────────────────────────────────────────────────
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "이미지 파일이 너무 커요 (최대 5MB)" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string);
      setScreenshotName(file.name);
      setUrl("");
    };
    reader.readAsDataURL(file);
  }

  // ── 개별 제출 ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!channel) {
      setMessage({ type: "error", text: "채널을 선택해주세요" });
      return;
    }
    if (!url.trim() && !screenshot) {
      setMessage({ type: "error", text: "후기 URL 또는 캡처본 이미지 중 하나를 제출해주세요" });
      return;
    }

    let cleanUrl = url.trim();
    if (cleanUrl && !cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;

    setLoading(true);
    setMessage(null);

    try {
      let screenshotUrl: string | null = null;
      if (screenshot) {
        setUploadingImage(true);
        try {
          screenshotUrl = await uploadScreenshot(screenshot);
        } catch (err) {
          setMessage({ type: "error", text: err instanceof Error ? err.message : "이미지 업로드 실패" });
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const res = await fetch("/api/review-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl || undefined,
          screenshotUrl: screenshotUrl || undefined,
          channel,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? "승인되었어요!" });
        setUrl(""); setChannel(""); setScreenshot(null); setScreenshotName("");
        if (data.newTrialEndsAt) setCurrentTrialEndsAt(data.newTrialEndsAt);
      } else if (res.status === 422) {
        setMessage({ type: "error", text: data.rejectReason ?? data.message ?? "후기 내용이 기준을 충족하지 못했어요" });
      } else {
        setMessage({ type: "error", text: data.error ?? "오류가 발생했어요" });
      }

      const updated = await refreshState();
      if (updated) {
        setSubmissions(updated.submissions ?? []);
        setBonusCount(updated.bonusCount ?? 0);
        setCanSubmit(updated.canSubmit ?? false);
      }
    } catch {
      setMessage({ type: "error", text: "네트워크 오류가 발생했어요. 다시 시도해주세요." });
    } finally {
      setLoading(false);
    }
  }

  // ── 일괄 제출 ────────────────────────────────────────────────────────────
  function updateBulkEntry(id: string, field: keyof BulkEntry, value: string | null) {
    setBulkEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function addBulkEntry() {
    setBulkEntries((prev) => [...prev, makeBulkEntry(prev.length + 1)]);
  }

  function removeBulkEntry(id: string) {
    setBulkEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();

    const invalid = bulkEntries.find((e) => !e.channel || (!e.url.trim() && !e.screenshot));
    if (invalid) {
      setMessage({ type: "error", text: "모든 후기에 채널과 URL 또는 캡처본을 입력해주세요" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 스크린샷 먼저 업로드
      const items: { url?: string; screenshotUrl?: string; channel: string }[] = [];
      for (const entry of bulkEntries) {
        let screenshotUrl: string | undefined;
        if (entry.screenshot) {
          setUploadingImage(true);
          try {
            screenshotUrl = (await uploadScreenshot(entry.screenshot)) ?? undefined;
          } catch (err) {
            setMessage({ type: "error", text: err instanceof Error ? err.message : "이미지 업로드 실패" });
            return;
          } finally {
            setUploadingImage(false);
          }
        }
        let cleanUrl = entry.url.trim();
        if (cleanUrl && !cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
        items.push({ url: cleanUrl || undefined, screenshotUrl, channel: entry.channel });
      }

      const res = await fetch("/api/review-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? "제출 완료!" });
        setBulkEntries([makeBulkEntry(1)]);
        if (data.newTrialEndsAt) setCurrentTrialEndsAt(data.newTrialEndsAt);
      } else if (res.status === 422) {
        setMessage({ type: "error", text: data.message ?? "후기가 기준을 충족하지 못했어요" });
      } else {
        setMessage({ type: "error", text: data.error ?? "오류가 발생했어요" });
      }

      const updated = await refreshState();
      if (updated) {
        setSubmissions(updated.submissions ?? []);
        setBonusCount(updated.bonusCount ?? 0);
        setCanSubmit(updated.canSubmit ?? false);
      }
    } catch {
      setMessage({ type: "error", text: "네트워크 오류가 발생했어요. 다시 시도해주세요." });
    } finally {
      setLoading(false);
    }
  }

  // ── Migration guard ───────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-5 pt-6 md:px-8 md:pt-8 max-w-lg md:max-w-2xl mx-auto space-y-5 pb-10">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-black text-[#3D3530]">후기 인증 혜택 ✍️</h2>
        <p className="text-sm text-[#8B7E74] mt-1">
          앱 후기를 작성하고 URL을 제출하면 최대 3개월 무료 이용 기간이 연장돼요 (최대 4회)
        </p>
      </div>

      {/* 진행 현황 */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ backgroundColor: "#FFF5EE", border: "1.5px solid #F0E8E0" }}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#3D3530]">사용 현황</span>
          <span className="text-sm font-semibold text-[#FFB38A]">{bonusCount} / 4회</span>
        </div>
        <div className="w-full bg-[#F0E8E0] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${(bonusCount / 4) * 100}%`,
              backgroundColor: bonusCount >= 4 ? "#A8D8CF" : "#FFB38A",
            }}
          />
        </div>
        <p className="text-xs text-[#8B7E74]">
          {bonusCount >= 4
            ? "최대 혜택(3개월)을 모두 사용하셨어요"
            : `${4 - bonusCount}회 더 신청할 수 있어요`}
        </p>

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

      {/* 이용 규정 */}
      <div
        className="rounded-2xl p-4 space-y-1.5"
        style={{ backgroundColor: "#F0FAF8", border: "1.5px solid #A8D8CF" }}
      >
        <p className="text-sm font-bold text-[#3D3530]">📋 이용 규정</p>
        <ul className="text-xs text-[#8B7E74] space-y-1 list-disc list-inside">
          <li>블로그, SNS(인스타그램 등), 커뮤니티, 구글 플레이스토어에 후기 작성</li>
          <li>후기 내용은 200자 이상이어야 해요</li>
          <li>개별 제출 시 승인 후 30일이 지나야 다음 신청이 가능해요</li>
          <li>2번 홍보 시 1개월 · 3번 시 2개월 · 4번 시 3개월(최대) 연장</li>
          <li>여러 후기를 한꺼번에 제출하면 30일 제한 없이 즉시 혜택을 받아요</li>
          <li>구글 플레이스토어 후기는 자동 승인돼요</li>
        </ul>
      </div>

      {/* 폼 영역 */}
      {remainingSlots > 0 ? (
        <div className="space-y-3">
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

          {/* 모드 탭 (개별 제출 가능할 때만) */}
          {canSubmit && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setBulkMode(false); setMessage(null); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  !bulkMode
                    ? "border-[#FFB38A] bg-[#FFF5EE] text-[#FFB38A]"
                    : "border-[#F0E8E0] bg-white text-[#8B7E74]"
                }`}
              >
                개별 제출
              </button>
              <button
                type="button"
                onClick={() => { setBulkMode(true); setMessage(null); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  bulkMode
                    ? "border-[#FFB38A] bg-[#FFF5EE] text-[#FFB38A]"
                    : "border-[#F0E8E0] bg-white text-[#8B7E74]"
                }`}
              >
                {remainingSlots > 1 ? `한꺼번에 제출 (최대 ${remainingSlots}개)` : "후기 제출"}
              </button>
            </div>
          )}

          {/* 30일 대기 중 → 일괄만 가능 */}
          {!canSubmit && (
            <div
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: "#FFF5EE", border: "1.5px solid #F0E8E0" }}
            >
              <p className="text-2xl mb-1">⏳</p>
              <p className="font-bold text-[#3D3530] text-sm">개별 제출은 30일 후 가능해요</p>
              <p className="text-xs text-[#8B7E74] mt-0.5">
                여러 후기를 한꺼번에 제출하면 지금 바로 신청할 수 있어요!
              </p>
            </div>
          )}

          {/* 개별 제출 폼 */}
          {!bulkMode && canSubmit && (
            <form onSubmit={handleSubmit}>
              <div
                className="rounded-2xl p-5 space-y-4"
                style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #F0E8E0" }}
              >
                <p className="font-bold text-[#3D3530]">후기 URL 제출</p>

                <div>
                  <label className="text-xs font-semibold text-[#8B7E74] mb-1.5 block">채널 선택</label>
                  <ChannelSelector value={channel} onChange={setChannel} disabled={loading} />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#8B7E74]">
                    후기 URL 또는 캡처본 <span className="text-[#FFB38A]">(둘 중 하나)</span>
                  </p>

                  <div>
                    <input
                      type="text"
                      inputMode="url"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); if (e.target.value) setScreenshot(null); }}
                      placeholder="https://blog.naver.com/..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#F0E8E0] bg-[#FFF9F5] text-[#3D3530] text-sm focus:outline-none focus:border-[#FFB38A] transition-colors disabled:opacity-50"
                      disabled={loading || !!screenshot}
                    />
                    <p className="text-xs text-[#B0A89E] mt-1">후기를 작성한 페이지 주소를 붙여넣어주세요</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#F0E8E0]" />
                    <span className="text-xs text-[#C4B5A8] font-semibold">또는</span>
                    <div className="flex-1 h-px bg-[#F0E8E0]" />
                  </div>

                  <div>
                    {screenshot ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-[#A8D8CF]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={screenshot} alt="캡처본" className="w-full max-h-48 object-contain bg-[#F8F8F8]" />
                        <button
                          type="button"
                          onClick={() => { setScreenshot(null); setScreenshotName(""); }}
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#F0E8E0] bg-[#FAFAF8] cursor-pointer hover:border-[#FFB38A] transition-colors ${url.trim() ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-xs font-semibold text-[#8B7E74]">캡처본 이미지 선택</span>
                        <span className="text-[11px] text-[#C4B5A8]">JPEG / PNG / WebP · 최대 5MB</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleImageSelect}
                          disabled={loading || !!url.trim()}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <BubbleButton
                  type="submit"
                  variant="peach"
                  className="w-full"
                  disabled={loading || (!url.trim() && !screenshot) || !channel}
                >
                  {uploadingImage ? "이미지 업로드 중..." : loading ? "확인 중..." : "후기 제출하기"}
                </BubbleButton>
              </div>
            </form>
          )}

          {/* 일괄 제출 폼 */}
          {(bulkMode || !canSubmit) && (
            <form onSubmit={handleBulkSubmit} className="space-y-3">
              {bulkEntries.map((entry, idx) => (
                <BulkEntryCard
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  onUpdate={updateBulkEntry}
                  onRemove={removeBulkEntry}
                  canRemove={bulkEntries.length > 1}
                  disabled={loading}
                />
              ))}

              {bulkEntries.length < remainingSlots && (
                <button
                  type="button"
                  onClick={addBulkEntry}
                  disabled={loading}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-[#FFB38A] text-sm font-bold text-[#FFB38A] hover:bg-[#FFF5EE] transition-colors disabled:opacity-50"
                >
                  + 후기 추가 ({bulkEntries.length}/{remainingSlots})
                </button>
              )}

              <BubbleButton
                type="submit"
                variant="peach"
                className="w-full"
                disabled={loading}
              >
                {uploadingImage
                  ? "이미지 업로드 중..."
                  : loading
                  ? "확인 중..."
                  : bulkEntries.length > 1
                  ? `${bulkEntries.length}개 한꺼번에 제출하기 🎉`
                  : "후기 제출하기"}
              </BubbleButton>
            </form>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: "#F0FAF8", border: "1.5px solid #A8D8CF" }}
        >
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-[#3D3530]">모든 혜택을 받으셨어요!</p>
          <p className="text-sm text-[#8B7E74] mt-1">최대 3개월 연장을 모두 사용하셨어요</p>
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
                style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #F0E8E0" }}
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
                    <p className="text-xs text-[#D05050] mt-0.5">{sub.rejectReason}</p>
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

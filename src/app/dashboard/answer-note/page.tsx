import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AnswerNoteClient } from "./AnswerNoteClient";
import { getSelectedChildId } from "@/lib/child-cookie";
import {
  GUEST_AI_MONTHLY_LIMIT,
  hashGuestIp,
  getGuestMonthlyUsage,
} from "@/lib/usage-limit";

export default async function AnswerNotePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isGuest = session.user.isGuest === true;

  // ── 게스트: 아이 등록 없이 바로 분석 화면 (저장·누적 없음, 월 N회 한시 체험) ──────
  if (isGuest) {
    // IP 해시 기반 서버측 카운터로 남은 무료 횟수 계산 (쿠키 변조 우회 방지)
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
      hdrs.get("x-real-ip")?.trim() ??
      "unknown";
    const used = await getGuestMonthlyUsage(hashGuestIp(ip)).catch(() => 0);
    const remaining = Math.max(0, GUEST_AI_MONTHLY_LIMIT - used);

    return (
      <AnswerNoteClient
        childId="guest"
        childName="우리 아이"
        pastRecords={[]}
        isGuest
        guestRemaining={remaining}
        guestLimit={GUEST_AI_MONTHLY_LIMIT}
      />
    );
  }

  // ── 회원: 아이 목록 + 선택 ID 병렬 조회 ─────────────────────────────────
  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, userId: true },
    }),
    getSelectedChildId(),
  ]);

  if (children.length === 0) redirect("/onboarding");

  const targetChild = children.find((c) => c.id === savedId) ?? children[0];

  const pastRecords = await prisma.errorRecord.findMany({
    where: { childId: targetChild.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      targetWord: true,
      childPronunciation: true,
      errorPattern: true,
      errorCategory: true,
      createdAt: true,
      localAnalysis: {
        select: {
          confidence: true,
        },
      },
      geminiFeedback: {
        select: {
          rootCause: true,
          trainingStep1: true,
          trainingStep2: true,
          trainingStep3: true,
          trainingStep4: true,
          recommendedWords: true,
          parentMessage: true,
        },
      },
    },
  });

  return (
    <AnswerNoteClient
      childId={targetChild.id}
      childName={targetChild.name}
      pastRecords={pastRecords}
    />
  );
}

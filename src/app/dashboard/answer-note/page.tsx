import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnswerNoteClient } from "./AnswerNoteClient";
import { getSelectedChildId } from "@/lib/child-cookie";

export default async function AnswerNotePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isGuest = session.user.isGuest === true;

  // ── 게스트: 아이 등록 없이 바로 분석 화면 ─────────────────────────────────
  if (isGuest) {
    return (
      <AnswerNoteClient
        childId="guest"
        childName="우리 아이"
        pastRecords={[]}
        isGuest
      />
    );
  }

  // ── 회원: 기존 로직 ───────────────────────────────────────────────────────
  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, userId: true },
  });

  if (children.length === 0) redirect("/onboarding");

  const savedId = await getSelectedChildId();
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

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnswerNoteClient } from "./AnswerNoteClient";

// ✨ Pro Fix 3: 서버 컴포넌트에서 searchParams를 받아 다자녀 환경 대응
export default async function AnswerNotePage({
  searchParams,
}: {
  searchParams: { childId?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 1. URL에 특정 아이(childId)가 지정되어 있는지 확인
  const targetChildId = searchParams.childId;

  let targetChild = null;

  if (targetChildId) {
    // 2-A. 특정 아이가 지정된 경우, 해당 아이가 이 부모의 자녀가 맞는지 검증 (보안)
    targetChild = await prisma.child.findUnique({
      where: { id: targetChildId },
      select: { id: true, name: true, userId: true },
    });

    // 내 아이가 아니거나 없는 아이면 null 처리
    if (targetChild?.userId !== session.user.id) {
      targetChild = null;
    }
  }

  // 2-B. URL에 아이가 지정 안 되어 있거나, 잘못된 ID가 넘어온 경우 (폴백)
  if (!targetChild) {
    // ✨ Pro Fix 2: findMany 대신 findFirst로 정확히 1건의 레코드만 가져와 DB 부하 최적화
    targetChild = await prisma.child.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" }, // 가장 먼저 등록한 아이
      select: { id: true, name: true },
    });
  }

  // 등록된 아이가 단 한 명도 없다면 온보딩으로 쫓아냄
  if (!targetChild) redirect("/onboarding");

  return (
    <AnswerNoteClient
      childId={targetChild.id}
      childName={targetChild.name}
    />
  );
}

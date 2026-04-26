import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChildPlayClient } from "./ChildPlayClient";
import { getSelectedChildId } from "@/lib/child-cookie";

export default async function ChildPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (children.length === 0) redirect("/onboarding");

  const savedId = await getSelectedChildId();
  const child = children.find((c) => c.id === savedId) ?? children[0];

  // Get recommended words for this child
  const recentRecords = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id } },
    orderBy: { practicedAt: "desc" },
    take: 20,
    select: { targetWord: true, errorPhonemes: true },
  });

  return (
    <ChildPlayClient
      childName={child.name}
      mascotLevel={child.mascotLevel}
      recentWords={recentRecords.map((r: { targetWord: string; errorPhonemes: unknown }) => r.targetWord)}
    />
  );
}

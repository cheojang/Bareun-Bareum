import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ChildPlayClient } from "./ChildPlayClient";

export default async function ChildPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const child = await prisma.child.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (!child) redirect("/onboarding");

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
      recentWords={recentRecords.map((r) => r.targetWord)}
    />
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { BulkPrintClient } from "./BulkPrintClient";

export const dynamic = "force-dynamic";

export default async function BulkPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "").split(",").filter(Boolean).slice(0, 20);

  if (ids.length === 0) notFound();

  const records = await prisma.errorRecord.findMany({
    where: {
      id: { in: ids },
      child: { userId: session.user.id },
    },
    include: {
      child: { select: { name: true } },
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
    orderBy: { createdAt: "desc" },
  });

  if (records.length === 0) notFound();

  const childName = records[0].child.name;

  return (
    <BulkPrintClient
      childName={childName}
      records={records.map((r) => ({
        id: r.id,
        targetWord: r.targetWord,
        childPronunciation: r.childPronunciation,
        errorPattern: r.errorPattern,
        errorCategory: r.errorCategory,
        createdAt: r.createdAt.toISOString(),
        geminiFeedback: r.geminiFeedback,
      }))}
    />
  );
}

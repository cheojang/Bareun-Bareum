import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { PrintClient } from "./PrintClient";

export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const record = await prisma.errorRecord.findUnique({
    where: { id },
    include: {
      child: { select: { name: true, userId: true } },
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

  if (!record || record.child.userId !== session.user.id) notFound();

  return (
    <PrintClient
      data={{
        childName: record.child.name,
        targetWord: record.targetWord,
        childPronunciation: record.childPronunciation,
        errorPattern: record.errorPattern,
        errorCategory: record.errorCategory,
        createdAt: record.createdAt.toISOString(),
        geminiFeedback: record.geminiFeedback,
      }}
    />
  );
}

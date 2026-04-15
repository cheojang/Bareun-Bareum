import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnswerNoteClient } from "./AnswerNoteClient";
import { getSelectedChildId } from "@/lib/child-cookie";

export default async function AnswerNotePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, userId: true },
  });

  if (children.length === 0) redirect("/onboarding");

  const savedId = await getSelectedChildId();
  const targetChild = children.find((c) => c.id === savedId) ?? children[0];

  return (
    <AnswerNoteClient
      childId={targetChild.id}
      childName={targetChild.name}
    />
  );
}

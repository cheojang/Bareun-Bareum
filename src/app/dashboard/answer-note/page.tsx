import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AnswerNoteClient } from "./AnswerNoteClient";

export default async function AnswerNotePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  if (children.length === 0) redirect("/onboarding");

  return <AnswerNoteClient childId={children[0].id} childName={children[0].name} />;
}

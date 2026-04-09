import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NewSessionClient } from "./NewSessionClient";

export default async function NewSessionPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const children = await prisma.child.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (children.length === 0) redirect("/onboarding");

  return <NewSessionClient children={children} />;
}

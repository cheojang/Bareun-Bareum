"use server";
import { cookies } from "next/headers";

export async function setSelectedChild(childId: string) {
  const store = await cookies();
  store.set("selected-child-id", childId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1년
  });
}

export async function getSelectedChildId(): Promise<string | null> {
  const store = await cookies();
  return store.get("selected-child-id")?.value ?? null;
}

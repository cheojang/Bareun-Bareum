import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordConsent } from "@/lib/consent";

/** 약관·개인정보 동의 기록 (동의 일시 저장 — 법적 입증용) */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isGuest) {
    return NextResponse.json({ error: "게스트는 동의 기록 대상이 아니에요" }, { status: 403 });
  }

  const ok = await recordConsent(session.user.id);
  if (!ok) {
    return NextResponse.json({ error: "동의 기록 저장에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

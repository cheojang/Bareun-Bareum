import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase-admin";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 700_000; // ~700KB base64

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  if (session.user.isGuest) {
    return NextResponse.json({ error: "회원만 이용할 수 있어요" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "스토리지 설정이 필요합니다" }, { status: 500 });
  }

  const { image } = await req.json().catch(() => ({}));

  if (typeof image !== "string" || !image.startsWith("data:")) {
    return NextResponse.json({ error: "올바른 이미지 형식이 아니에요" }, { status: 400 });
  }

  const mime = image.match(/^data:([^;,]+)[;,]/)?.[1] ?? "";
  if (!ALLOWED_MIMES.includes(mime)) {
    return NextResponse.json({ error: "JPEG/PNG/WebP 이미지만 업로드할 수 있어요" }, { status: 400 });
  }

  if (image.length > MAX_SIZE) {
    return NextResponse.json({ error: "이미지가 너무 커요. 더 작은 이미지를 사용해주세요" }, { status: 400 });
  }

  const base64 = image.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const ext = mime === "image/png" ? "png" : "jpg";
  const path = `review-screenshots/${session.user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (uploadError) {
    console.error("[ReviewScreenshot] 업로드 실패:", uploadError.message);
    return NextResponse.json({ error: "업로드에 실패했어요. 다시 시도해주세요" }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}

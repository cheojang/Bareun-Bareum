import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, STORAGE_BUCKET, CHILD_IMAGES_PATH } from "@/lib/supabase-admin";

// PATCH /api/children/[id]/image — 아이 사진 업로드 (Supabase Storage)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { image } = await req.json();

  if (typeof image !== "string") {
    return NextResponse.json({ error: "올바른 형식이 아니에요." }, { status: 400 });
  }
  // MIME 화이트리스트 — SVG 등 스크립트 실행 가능 포맷 차단
  const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
  if (image !== "") {
    const mime = image.match(/^data:([^;,]+)[;,]/)?.[1] ?? "";
    if (!ALLOWED_MIMES.includes(mime)) {
      return NextResponse.json({ error: "JPEG/PNG/WebP 이미지만 업로드할 수 있어요." }, { status: 400 });
    }
  }
  if (image.length > 700_000) {
    return NextResponse.json({ error: "이미지가 너무 커요. 더 작은 이미지를 사용해주세요." }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "스토리지 설정이 필요합니다. 관리자에게 문의하세요." }, { status: 500 });
  }

  const storagePath = `${CHILD_IMAGES_PATH}/${id}.jpg`;
  let imageUrl: string | null = null;

  if (image) {
    const base64 = image.split(",")[1];
    const buffer = Buffer.from(base64, "base64");

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      console.error("[Storage] 업로드 실패:", uploadError.message);
      return NextResponse.json({ error: "사진 업로드에 실패했어요. 다시 시도해주세요." }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
  } else {
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => {});
    imageUrl = null;
  }

  await prisma.child.update({
    where: { id },
    data: { image: imageUrl },
  });

  return NextResponse.json({ ok: true, url: imageUrl });
}

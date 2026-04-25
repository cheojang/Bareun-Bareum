import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/children/[id]/image — 아이 사진 저장 (base64 data URL)
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

  // 빈 문자열은 삭제로 처리, data URL 형식만 허용
  if (typeof image !== "string") {
    return NextResponse.json({ error: "올바른 형식이 아니에요." }, { status: 400 });
  }
  if (image !== "" && !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있어요." }, { status: 400 });
  }
  // ~500KB 제한 (base64는 원본의 약 4/3배)
  if (image.length > 700_000) {
    return NextResponse.json({ error: "이미지가 너무 커요. 더 작은 이미지를 사용해주세요." }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!child) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.child.update({
    where: { id },
    data: { image: image || null },
  });

  return NextResponse.json({ ok: true });
}

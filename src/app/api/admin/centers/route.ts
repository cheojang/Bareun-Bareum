import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return email ? adminEmails.includes(email) : false;
}

/**
 * GET /api/admin/centers
 * 전체 센터 목록 (시스템 어드민)
 */
export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const centers = await prisma.center.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { therapists: true, children: true } },
    },
  });

  return NextResponse.json({ centers });
}

/**
 * POST /api/admin/centers
 * 새 센터 생성
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { name, phone, address, plan } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "센터명 필수" }, { status: 400 });
  }

  const center = await prisma.center.create({
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      plan: plan ?? "basic",
    },
  });

  return NextResponse.json(center);
}

/**
 * PATCH /api/admin/centers
 * 센터 수정 / 초대코드 재발급
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { centerId, name, phone, address, plan, regenerateCode } = await request.json();
  if (!centerId) return NextResponse.json({ error: "centerId 필수" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (name) data.name = name.trim();
  if (phone !== undefined) data.phone = phone?.trim() || null;
  if (address !== undefined) data.address = address?.trim() || null;
  if (plan) data.plan = plan;
  if (regenerateCode) {
    const { randomBytes } = await import("crypto");
    data.inviteCode = randomBytes(6).toString("hex").toUpperCase();
  }

  const center = await prisma.center.update({ where: { id: centerId }, data });
  return NextResponse.json(center);
}

/**
 * DELETE /api/admin/centers
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { centerId } = await request.json();
  await prisma.center.delete({ where: { id: centerId } });
  return NextResponse.json({ success: true });
}

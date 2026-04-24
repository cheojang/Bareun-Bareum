import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, code } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      code?: string;
    };

    if (!name?.trim() || !email?.trim() || !password || !code?.trim()) {
      return NextResponse.json(
        { error: "모든 항목을 입력해주세요." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 해요." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아니에요." },
        { status: 400 },
      );
    }

    const normalized = email.trim().toLowerCase();

    // 이메일 인증번호 검증
    const token = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: normalized, token: code.trim() } },
    });

    if (!token) {
      return NextResponse.json({ error: "인증번호가 올바르지 않아요." }, { status: 400 });
    }
    if (token.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: normalized, token: code.trim() } },
      });
      return NextResponse.json({ error: "인증번호가 만료됐어요. 다시 발송해주세요." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 가입된 이메일이에요. 로그인해주세요." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: name.trim(),
          email: normalized,
          password: hashedPassword,
          role: "parent",
        },
      }),
      // 사용한 토큰 삭제
      prisma.verificationToken.delete({
        where: { identifier_token: { identifier: normalized, token: code.trim() } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Signup Error]:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}

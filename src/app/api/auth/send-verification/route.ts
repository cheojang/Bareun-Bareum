import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const CODE_TTL_MS = 5 * 60 * 1000; // 5분

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim() || !emailRegex.test(email)) {
      return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // 이미 가입된 이메일 체크
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 이메일이에요. 로그인해주세요." }, { status: 409 });
    }

    const code = randomCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

    // 기존 토큰 삭제 후 새로 저장
    await prisma.verificationToken.deleteMany({ where: { identifier: normalized } });
    await prisma.verificationToken.create({
      data: { identifier: normalized, token: code, expires },
    });

    await sendVerificationEmail(normalized, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-verification]", err);
    return NextResponse.json({ error: "인증번호 발송에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}

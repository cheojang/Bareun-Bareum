import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import {
  getClientIp,
  verificationIpLimiter,
  verificationEmailLimiter,
} from "@/lib/rate-limit";

const CODE_TTL_MS = 5 * 60 * 1000; // 5분

// 암호학적 난수(crypto.randomInt)로 6자리 코드 생성 — Math.random()은 예측 가능
function randomCode() {
  return String(randomInt(100000, 1000000));
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim() || !emailRegex.test(email) || email.length > 254) {
      return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // 레이트리밋 — IP 기반(이메일 폭탄 방지) + 이메일 기반(스팸 방지)
    if (!verificationIpLimiter.allow(getClientIp(req))) {
      return NextResponse.json(
        { error: "요청이 너무 많아요. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
    if (!verificationEmailLimiter.allow(normalized)) {
      return NextResponse.json(
        { error: "이 이메일은 요청 횟수를 초과했어요. 1시간 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    // 이미 가입된 이메일이면 발송하지 않지만 응답은 동일하게 ok로 통일
    // (이메일 열거 공격 방지). 사용자는 로그인 페이지 안내로 자연스럽게 유도.
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ ok: true });
    }

    const code = randomCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

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

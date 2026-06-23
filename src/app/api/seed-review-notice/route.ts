import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.announcement.findFirst({
    where: { title: { contains: "홍보글" } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, message: "이미 등록된 공지가 있습니다", id: existing.id });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: "📣 홍보글 1개 = 프리미엄 1주 무료 연장!",
      content:
        "블로그, SNS, 커뮤니티, 앱스토어(플레이스토어)에 바른발음 사용 후기를 남기고 링크를 제출해주세요.\n\n후기 인증 1건마다 프리미엄 체험 기간이 1주일씩 무료로 연장됩니다. 최대 10회(총 10주)까지 적용되며, 이미 프리미엄 이용 중이신 분들께는 다음 결제일 기준으로 연장 혜택이 적용됩니다.\n\n👉 대시보드 → 설정 → 후기 인증 에서 지금 바로 참여해보세요!",
      type: "event",
      isPublished: true,
    },
  });

  return NextResponse.json({ ok: true, message: "공지 등록 완료!", id: announcement.id });
}

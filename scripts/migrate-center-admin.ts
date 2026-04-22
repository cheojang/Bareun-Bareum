/**
 * 일회성 데이터 마이그레이션:
 *  - User.role = "center_admin" → "therapist" 변환
 *  - 해당 유저의 Therapist.role = "owner"
 *  - 각 센터의 첫 치료사(createdAt 기준)도 "owner"로 승격 (누락 방지)
 *
 * 실행: npx tsx scripts/migrate-center-admin.ts
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  // 1) center_admin → therapist
  const admins = await prisma.user.findMany({
    where: { role: "center_admin" },
    select: { id: true, email: true },
  });
  console.log(`[migrate] center_admin 유저 발견: ${admins.length}명`);

  for (const u of admins) {
    await prisma.user.update({
      where: { id: u.id },
      data: { role: "therapist" },
    });
    const t = await prisma.therapist.findUnique({ where: { userId: u.id } });
    if (t) {
      await prisma.therapist.update({
        where: { id: t.id },
        data: { role: "owner" },
      });
      console.log(`  ✓ ${u.email} → therapist / Therapist.role=owner`);
    } else {
      console.log(`  ! ${u.email} 은 Therapist 프로필 없음 (role만 변환)`);
    }
  }

  // 2) 각 센터의 첫 치료사는 owner로 (이미 있으면 스킵)
  const centers = await prisma.center.findMany({ select: { id: true, name: true } });
  for (const c of centers) {
    const hasOwner = await prisma.therapist.count({
      where: { centerId: c.id, role: "owner" },
    });
    if (hasOwner > 0) continue;

    const first = await prisma.therapist.findFirst({
      where: { centerId: c.id },
      orderBy: { createdAt: "asc" },
    });
    if (first) {
      await prisma.therapist.update({
        where: { id: first.id },
        data: { role: "owner" },
      });
      console.log(`  ✓ 센터 "${c.name}"의 첫 치료사 ${first.name} → owner`);
    }
  }

  console.log("[migrate] 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

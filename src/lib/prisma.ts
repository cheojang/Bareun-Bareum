import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  // 서버리스(Vercel) 최적화: 인스턴스당 연결 수를 제한해 Supabase 연결 한도 고갈 방지.
  // ⚠️ Supabase가 session mode(pool_size 15)라, 인스턴스가 여러 개 뜨면 max×인스턴스수가
  //    15를 넘겨 EMAXCONNSESSION(FATAL)로 서버 렌더가 통째로 실패함(→ "시스템 오류").
  //    Vercel 함수는 보통 요청 1개를 순차 처리하므로 인스턴스당 1개면 충분하고,
  //    이로써 최대 15개 인스턴스까지 동시 동작 가능(기존 max:3이면 5개만 떠도 고갈).
  //    ✅ 근본 해결은 DATABASE_URL을 Supabase '트랜잭션 풀러(6543)'로 교체하는 것.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: 1,                        // 인스턴스당 최대 연결 (요청당 쿼리는 순차 처리)
    idleTimeoutMillis: 10_000,     // 유휴 연결 빠르게 반납 → 풀 회전율↑
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

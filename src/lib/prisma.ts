import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  // 서버리스(Vercel) 최적화: 인스턴스당 연결 수를 제한해 Supabase 연결 한도 고갈 방지.
  // 기본값(max 10)이면 인스턴스가 여러 개 뜰 때 한도를 초과해 간헐적 연결 실패가 발생함.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: 3,                        // 인스턴스당 최대 연결
    idleTimeoutMillis: 30_000,     // 유휴 연결 빠른 반납
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

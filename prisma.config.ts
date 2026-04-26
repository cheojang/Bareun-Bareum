import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local 우선, 없으면 .env 로드 (Next.js 동작과 동일)
dotenvConfig({ path: ".env.local" });
dotenvConfig({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: "prisma/migrations",
  },
});

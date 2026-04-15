import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  migrate: {
    adapter: async (env) => {
      return new PrismaPg({ connectionString: env["DATABASE_URL"]! });
    },
  },
});

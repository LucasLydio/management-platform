import { defineConfig } from "@prisma/config";
import "dotenv/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.DB_USERNAME ?? "postgres"}:${process.env.DB_PASSWORD ?? "postgres"}@${
    process.env.DB_HOST ?? "localhost"
  }:${process.env.DB_PORT ?? "5432"}/${process.env.DB_DATABASE ?? "management"}`;

export default defineConfig({
  schema: "src/infra/database/schema.prisma",

  migrations: {
    path: "src/infra/database/migrations",
    seed: "tsx src/infra/database/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});

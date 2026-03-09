// Prisma 7 config — connection URL defined here (not in schema.prisma)
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Build DATABASE_URL from split env vars, or use DATABASE_URL directly if set
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME || "taskflow";
  const user = process.env.DB_USER || "taskflow_user";
  const password = process.env.DB_PASSWORD || "";
  const schema = process.env.DB_SCHEMA || "public";

  return `postgresql://${user}:${password}@${host}:${port}/${name}?schema=${schema}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});

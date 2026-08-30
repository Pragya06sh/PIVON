import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// On Vercel / AWS Lambda serverless functions, the root filesystem is read-only.
// If using SQLite, copy the pre-migrated dev.db to /tmp/dev.db where it is writable.
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    const tmpDbPath = "/tmp/dev.db";
    const possibleSrcPaths = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
      path.resolve("./prisma/dev.db"),
      path.resolve("./dev.db"),
    ];

    if (!fs.existsSync(tmpDbPath)) {
      for (const src of possibleSrcPaths) {
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, tmpDbPath);
          break;
        }
      }
    }
    process.env.DATABASE_URL = "file:/tmp/dev.db";
  } catch (err) {
    console.error("Failed to copy SQLite database to /tmp:", err);
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

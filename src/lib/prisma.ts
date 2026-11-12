import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dns from "dns";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("localhost:5432") || connectionString.includes("placeholder")) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  // Pooled connection via @prisma/adapter-pg for serverless and Node.js runtimes
  // Configured with IPv4 DNS resolution for reliability across dual-stack environments
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      lookup: (hostname: string, options: any, cb: any) => {
        dns.lookup(hostname, { family: 4 }, cb);
      },
    } as any);

  globalForPrisma.pool = pool;
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always retain singleton on globalThis to prevent connection pool exhaustion in serverless runtimes
globalForPrisma.prisma = prisma;

const { execSync } = require("child_process");
const { Pool } = require("pg");

const dbUrl = process.env.DATABASE_URL;

function resolveDirectUrl(pooledOrDirectUrl) {
  if (process.env.DIRECT_URL && !process.env.DIRECT_URL.includes("localhost:5432")) {
    return process.env.DIRECT_URL;
  }
  if (
    process.env.DATABASE_URL_UNPOOLED &&
    !process.env.DATABASE_URL_UNPOOLED.includes("localhost:5432")
  ) {
    return process.env.DATABASE_URL_UNPOOLED;
  }
  if (pooledOrDirectUrl && pooledOrDirectUrl.includes("-pooler.")) {
    return pooledOrDirectUrl.replace("-pooler.", ".");
  }
  return pooledOrDirectUrl;
}

async function ensureAuthTablesNonDestructive(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const check = await pool.query(
      "SELECT to_regclass('public.accounts') AS accounts_tbl, to_regclass('public.users') AS users_tbl"
    );
    const row = check.rows[0] || {};
    if (row.accounts_tbl) {
      console.log("[db-sync] Verified public.accounts exists.");
      return;
    }

    if (!row.users_tbl) {
      console.warn(
        "[db-sync] public.users does not exist yet; skipping partial auth table creation."
      );
      return;
    }

    console.log("[db-sync] Creating missing auth tables non-destructively...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");

      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");
      CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
    `);
    console.log("[db-sync] Verified/created public.accounts and auth tables.");
  } finally {
    await pool.end();
  }
}

async function main() {
  if (!dbUrl || dbUrl.includes("localhost:5432") || dbUrl.includes("placeholder")) {
    console.log("[db-sync] No remote DATABASE_URL configured during build step. Skipping db sync.");
    return;
  }

  const directUrl = resolveDirectUrl(dbUrl);
  const env = {
    ...process.env,
    DIRECT_URL: directUrl,
  };

  console.log("[db-sync] Synchronizing database schema before deployment...");

  let synced = false;
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env });
    console.log("[db-sync] Prisma migrations applied successfully.");
    synced = true;
  } catch (migrateErr) {
    console.warn(
      "[db-sync] prisma migrate deploy did not complete, trying non-destructive prisma db push..."
    );
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit", env });
      console.log("[db-sync] Database schema synchronized safely via db push.");
      synced = true;
    } catch (pushErr) {
      console.warn(
        "[db-sync] Warning: Automatic prisma db push did not complete:",
        pushErr.message
      );
    }
  }

  try {
    await ensureAuthTablesNonDestructive(directUrl);
  } catch (verifyErr) {
    console.warn(
      "[db-sync] Warning: Could not verify auth tables:",
      verifyErr.message
    );
    if (!synced) {
      console.warn("[db-sync] Please run `npx prisma db push --skip-generate` against your production database.");
    }
  }
}

main();

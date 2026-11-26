const { execSync } = require("child_process");

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && !dbUrl.includes("localhost:5432") && !dbUrl.includes("placeholder")) {
  console.log("[db-sync] Synchronizing database schema before deployment...");
  const env = {
    ...process.env,
    DIRECT_URL: process.env.DIRECT_URL || dbUrl,
  };

  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env });
    console.log("[db-sync] Prisma migrations applied successfully.");
  } catch (migrateErr) {
    console.warn(
      "[db-sync] prisma migrate deploy did not complete (likely unbaselined database), falling back to non-destructive prisma db push..."
    );
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit", env });
      console.log("[db-sync] Database schema synchronized safely via db push.");
    } catch (pushErr) {
      console.warn(
        "[db-sync] Warning: Automatic schema sync skipped or deferred:",
        pushErr.message
      );
    }
  }
} else {
  console.log("[db-sync] No remote DATABASE_URL configured during build step. Skipping db sync.");
}

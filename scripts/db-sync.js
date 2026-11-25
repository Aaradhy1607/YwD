const { execSync } = require("child_process");

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost:5432")) {
  console.log("[db-sync] Synchronizing database schema before deployment...");
  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
    console.log("[db-sync] Database schema synchronized successfully.");
  } catch (err) {
    console.warn("[db-sync] Warning: Automatic schema push skipped or deferred:", err.message);
  }
} else {
  console.log("[db-sync] No remote DATABASE_URL configured during build step. Skipping db push.");
}

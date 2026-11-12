const { Pool } = require('pg');
const fs = require('fs');
const dns = require('dns');

const env = fs.readFileSync('.env', 'utf-8');
const match = env.match(/DATABASE_URL_UNPOOLED="([^"]+)"/) || env.match(/DATABASE_URL="([^"]+)"/);
const u = new URL(match[1]);

const pool = new Pool({
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  host: u.hostname,
  port: parseInt(u.port || '5432', 10),
  database: u.pathname.replace(/^\//, ''),
  ssl: { rejectUnauthorized: false },
  lookup: (hostname, options, cb) => dns.lookup(hostname, { family: 4 }, cb)
});

async function reconcile() {
  console.log("Reconciling database state: marking transient test products as paused without deleting records...");
  const res = await pool.query(`
    UPDATE "products"
    SET "isAvailable" = false, "isPaused" = true
    WHERE "id" LIKE 'prod_17943754%'
    RETURNING "id", "title", "isAvailable", "isPaused"
  `);
  console.log(`Updated ${res.rowCount} transient test product(s):`);
  console.log(res.rows);

  await pool.end();
}

reconcile().catch(err => {
  console.error("Reconciliation failed:", err);
  process.exit(1);
});


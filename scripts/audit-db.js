const { Pool } = require('pg');
const fs = require('fs');
const dns = require('dns');

const env = fs.readFileSync('.env', 'utf-8');
const match = env.match(/DATABASE_URL_UNPOOLED="([^"]+)"/);
if (!match) {
  console.error("No DATABASE_URL_UNPOOLED found in .env");
  process.exit(1);
}
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

async function runAudit() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('TABLES IN NEON POSTGRESQL:', tables.rows.map(r => r.table_name));

    const checkModels = [
      'users',
      'anonymous_profiles',
      'accounts',
      'sessions',
      'verification_tokens',
      'categories',
      'subcategories',
      'products',
      'product_images',
      'rental_bookings',
      'purchase_orders',
      'cart_items',
      'wishlist_items',
      'payments',
      'notifications',
      'relay_messages',
      'reviews',
      'disputes',
      'audit_logs'
    ];

    for (const model of checkModels) {
      try {
        const res = await pool.query(`SELECT count(*) as count FROM "${model}"`);
        console.log(`Model Table [${model}]: ${res.rows[0].count} rows`);
      } catch (err) {
        console.log(`Model Table [${model}]: MISSING OR ERROR (${err.message})`);
      }
    }
  } catch (e) {
    console.error("Audit error:", e);
  } finally {
    await pool.end();
  }
}

runAudit();


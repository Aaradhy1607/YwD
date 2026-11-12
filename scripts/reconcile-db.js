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

async function inspect() {
  const cats = await pool.query('SELECT id, name, slug FROM "categories" ORDER BY id');
  console.log(`--- ALL CATEGORIES (${cats.rows.length}) ---`);
  console.log(cats.rows);

  const subs = await pool.query('SELECT id, "categoryId", name, slug FROM "subcategories" ORDER BY id');
  console.log(`--- ALL SUBCATEGORIES (${subs.rows.length}) ---`);
  console.log(subs.rows);

  const prods = await pool.query('SELECT id, title, "categoryId", "subcategoryId", "ownerId", "isAvailable", "isPaused" FROM "products" ORDER BY id');
  console.log(`--- ALL PRODUCTS (${prods.rows.length}) ---`);
  console.log(prods.rows);

  const imgs = await pool.query('SELECT id, "productId", url, "isPrimary" FROM "product_images" ORDER BY "productId", id');
  console.log(`--- ALL IMAGES (${imgs.rows.length}) ---`);
  console.log(imgs.rows);

  const users = await pool.query('SELECT id, name, email, role FROM "users" ORDER BY id');
  console.log(`--- ALL USERS (${users.rows.length}) ---`);
  console.log(users.rows);

  await pool.end();
}

inspect().catch(err => {
  console.error("Inspect Failed:", err);
  process.exit(1);
});


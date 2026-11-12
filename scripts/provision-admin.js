const { Client } = require('pg');
const fs = require('fs');
const dns = require('dns');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function provisionAdmin() {
  const env = fs.readFileSync('.env', 'utf-8');
  const match = env.match(/DATABASE_URL_UNPOOLED="([^"]+)"/) || env.match(/DATABASE_URL="([^"]+)"/);
  if (!match) {
    throw new Error("No database URL found in .env");
  }
  const u = new URL(match[1]);

  const emailArg = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@ywd.in';
  const passwordArg = process.argv[3] || process.env.ADMIN_PASSWORD;

  // Generate a cryptographically secure random password if none was explicitly provided
  const securePassword = passwordArg || crypto.randomBytes(18).toString('base64url');
  const passwordHash = hashPassword(securePassword);

  console.log(`Connecting to Neon PostgreSQL to provision administrator [${emailArg}]...`);
  const client = new Client({
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port || '5432', 10),
    database: u.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
    lookup: (hostname, options, cb) => dns.lookup(hostname, { family: 4 }, cb)
  });

  await client.connect();

  const userId = `usr_admin_${crypto.randomBytes(4).toString('hex')}`;

  // Check if admin user already exists
  const existing = await client.query('SELECT id FROM "users" WHERE email = $1', [emailArg]);
  let targetUserId = userId;

  if (existing.rows.length > 0) {
    targetUserId = existing.rows[0].id;
    await client.query(`
      UPDATE "users"
      SET "passwordHash" = $1, "role" = 'ADMIN', "updatedAt" = NOW()
      WHERE "id" = $2
    `, [passwordHash, targetUserId]);
    console.log(`Updated existing user [${targetUserId}] to ADMIN with newly rotated password hash.`);
  } else {
    await client.query(`
      INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
      VALUES ($1, 'System Administrator', $2, $3, 'ADMIN', NOW(), NOW())
    `, [targetUserId, emailArg, passwordHash]);
    console.log(`Created new administrative user [${targetUserId}].`);
  }

  // Ensure AnonymousProfile exists
  await client.query(`
    INSERT INTO "anonymous_profiles" ("id", "userId", "alias", "avatarColor", "bio", "trustScore", "completedRentals", "isVerified", "campusHub", "createdAt", "updatedAt")
    VALUES ($1, $2, 'TrustOps-Admin', '#7052DF', 'Platform Administrator & Trust Operations', 100.0, 100, true, 'Campus Headquarters', NOW(), NOW())
    ON CONFLICT ("userId") DO UPDATE
    SET "alias" = 'TrustOps-Admin', "trustScore" = 100.0, "updatedAt" = NOW()
  `, [`prof_${targetUserId}`, targetUserId]);

  // Record audit log
  await client.query(`
    INSERT INTO "audit_logs" ("id", "userId", "action", "resource", "metadata", "ipAddress", "createdAt")
    VALUES ($1, $2, 'ADMIN_PASSWORD_ROTATED', 'users', $3, 'cli-runner', NOW())
  `, [`audit_${Date.now()}`, targetUserId, JSON.stringify({ email: emailArg, rotatedAt: new Date().toISOString() })]);

  await client.end();

  console.log('\n================================================================');
  console.log('✅ SECURE ADMINISTRATOR PROVISIONING COMPLETE');
  console.log('================================================================');
  console.log(`Admin Email:    ${emailArg}`);
  console.log(`Admin Password: ${securePassword}`);
  console.log('Role:           ADMIN');
  console.log('================================================================');
  console.log('NOTE: Store this administrative password securely.');
  console.log('This single-use console output will not be repeated.\n');
}

provisionAdmin().catch(err => {
  console.error("Admin Provisioning Failed:", err);
  process.exit(1);
});


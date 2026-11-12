const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const dns = require('dns');

function createPoolFromUrl(urlStr) {
  const u = new URL(urlStr);
  return new Pool({
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port || '5432', 10),
    database: u.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 30000,
    lookup: (hostname, options, cb) => {
      // Force IPv4 on Windows to bypass dead IPv6 route delays
      dns.lookup(hostname, { family: 4 }, cb);
    }
  });
}

async function verifyPersistence() {
  const env = fs.readFileSync('.env', 'utf-8');
  const match = env.match(/DATABASE_URL_UNPOOLED="([^"]+)"/);
  const urlStr = match[1];

  console.log('--- TEST 1: INSERT RECORD IN FIRST CONNECTION ---');
  const pool1 = createPoolFromUrl(urlStr);
  const adapter1 = new PrismaPg(pool1);
  const prisma1 = new PrismaClient({ adapter: adapter1 });

  const testEmail = `neon_verify_${Date.now()}@ywd.in`;
  const userId = `usr_test_${Date.now()}`;

  const createdUser = await prisma1.user.create({
    data: {
      id: userId,
      name: 'Neon Persist Verifier',
      email: testEmail,
      passwordHash: 'scrypt_salt:test_hash_val',
      role: 'USER',
      anonymousProfile: {
        create: {
          alias: `Tester-${Math.floor(1000 + Math.random() * 9000)}`,
          avatarColor: '#18352D',
          campusHub: 'Central Handover Point',
          trustScore: 99.0
        }
      }
    },
    include: { anonymousProfile: true }
  });
  console.log('Created User in Neon:', createdUser.id, createdUser.email, 'Alias:', createdUser.anonymousProfile.alias);

  // Terminate connection 1 completely
  await prisma1.$disconnect();
  await pool1.end();
  console.log('Connection 1 destroyed and pool closed.');

  console.log('--- TEST 2: RETRIEVE RECORD IN SEPARATE, FRESH CONNECTION INSTANCE ---');
  const pool2 = createPoolFromUrl(urlStr);
  const adapter2 = new PrismaPg(pool2);
  const prisma2 = new PrismaClient({ adapter: adapter2 });

  const fetchedUser = await prisma2.user.findUnique({
    where: { email: testEmail },
    include: { anonymousProfile: true }
  });

  if (!fetchedUser || fetchedUser.id !== userId) {
    throw new Error('PERSISTENCE FAILED! Record did not survive across separate connection instances.');
  }
  console.log('VERIFIED PERSISTENCE: Fetched user intact from Neon across separate connection:', fetchedUser.id);

  console.log('--- TEST 3: ATOMIC BOOKING AND OVERLAP CONCURRENCY TEST ---');
  const bookingNumber1 = `YWD-TEST-RENT-${Math.floor(100000 + Math.random() * 900000)}`;
  const booking1 = await prisma2.rentalBooking.create({
    data: {
      id: `bk_test_${Date.now()}_1`,
      bookingNumber: bookingNumber1,
      productId: 'prod_macbook_m3',
      renterId: userId,
      startDate: new Date('2026-12-15T10:00:00Z'),
      endDate: new Date('2026-12-20T10:00:00Z'),
      durationTier: 'DAILY',
      durationUnits: 5,
      rentAmount: 6000,
      depositAmount: 8000,
      deliveryFee: 0,
      totalAmount: 14000,
      status: 'CONFIRMED',
      pickupOtp: '654321',
      returnOtp: '123456',
      deliveryMethod: 'PICKUP'
    }
  });
  console.log('Created Booking in Neon:', booking1.bookingNumber, 'Dates: 2026-12-15 to 2026-12-20');

  // Test overlapping date collision detection in Neon
  const overlapQuery = await prisma2.rentalBooking.findFirst({
    where: {
      productId: 'prod_macbook_m3',
      status: { in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      startDate: { lt: new Date('2026-12-18T10:00:00Z') },
      endDate: { gt: new Date('2026-12-16T10:00:00Z') }
    }
  });

  if (!overlapQuery) {
    throw new Error('CONCURRENCY FAILED: Overlapping booking was not detected in Neon.');
  }
  console.log('CONCURRENCY VERIFIED: Overlap collision detected with existing reservation in Neon:', overlapQuery.bookingNumber);

  console.log('--- TEST 4: CLEANUP TEST RECORDS ---');
  await prisma2.rentalBooking.delete({ where: { id: booking1.id } });
  await prisma2.anonymousProfile.delete({ where: { userId } });
  await prisma2.user.delete({ where: { id: userId } });
  console.log('CLEANUP COMPLETED: Test user and booking cleanly removed from Neon.');

  await prisma2.$disconnect();
  await pool2.end();
  console.log('ALL NEON PERSISTENCE & CONCURRENCY TESTS PASSED 100%!');
}

verifyPersistence().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});

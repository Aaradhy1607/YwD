const { Client } = require('pg');
const fs = require('fs');
const dns = require('dns');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function seed() {
  const env = fs.readFileSync('.env', 'utf-8');
  const match = env.match(/DATABASE_URL_UNPOOLED="([^"]+)"/) || env.match(/DATABASE_URL="([^"]+)"/);
  if (!match) {
    throw new Error("No database URL found in .env");
  }
  const u = new URL(match[1]);

  console.log('Connecting to Neon PostgreSQL database for full production catalog seeding...');
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

  console.log('1. Seeding standard catalog users (Admin must be provisioned via scripts/provision-admin.js)...');
  const demoHash = hashPassword("demo1234");

  // Only seed standard test accounts. Do NOT overwrite passwords if user exists.
  await client.query(`
    INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
    VALUES 
      ('usr_default_demo', 'Siddharth Rao', 'demo@ywd.in', $1, 'USER', NOW(), NOW()),
      ('usr_vendor_1', 'TechGear Vendor', 'vendor1@ywd.in', $1, 'USER', NOW(), NOW())
    ON CONFLICT ("id") DO UPDATE 
    SET "role" = EXCLUDED."role";
  `, [demoHash]);

  // Check if an admin exists
  const adminCheck = await client.query(`SELECT "id", "email" FROM "users" WHERE "role" = 'ADMIN' LIMIT 1`);
  if (adminCheck.rows.length === 0) {
    console.warn('⚠️ [SECURITY NOTICE] No ADMIN user found in database. Run "node scripts/provision-admin.js" to provision secure administrative credentials.');
  } else {
    console.log(`✓ Admin user confirmed present (${adminCheck.rows[0].email}). Password preserved.`);
  }

  console.log('2. Seeding anonymous profiles...');
  await client.query(`
    INSERT INTO "anonymous_profiles" ("id", "userId", "alias", "avatarColor", "bio", "trustScore", "completedRentals", "isVerified", "campusHub", "createdAt", "updatedAt")
    VALUES 
      ('prof_default', 'usr_default_demo', 'EcoRenter-4912', '#18352D', 'Tech enthusiast & circular economy lender.', 99.2, 19, true, 'Central Handover Point • Zone 1', NOW(), NOW()),
      ('prof_vendor_1', 'usr_vendor_1', 'GearVault-8801', '#C46A42', 'Verified equipment supplier with calibrated fleet.', 99.8, 62, true, 'Technology & Equipment Desk', NOW(), NOW())
    ON CONFLICT ("userId") DO UPDATE 
    SET "alias" = EXCLUDED."alias", "trustScore" = EXCLUDED."trustScore";
  `);

  console.log('3. Seeding categories and subcategories...');
  const categories = [
    {
      id: "cat_electronics",
      name: "Electronics & Tech",
      slug: "electronics",
      icon: "Laptop",
      count: "48+ Listings",
      description: "High-performance laptops, 4K mirrorless cameras, graphic tablets, and console gaming setups.",
      order: 1,
      subs: [
        { id: "sub_laptops", name: "Laptops & MacBooks", slug: "laptops" },
        { id: "sub_cameras", name: "Cameras & Lenses", slug: "cameras" },
        { id: "sub_tablets", name: "Tablets & iPads", slug: "tablets" },
        { id: "sub_gaming", name: "Gaming Gear & Consoles", slug: "gaming" },
        { id: "sub_audio", name: "Headphones & Audio", slug: "audio" },
      ]
    },
    {
      id: "cat_education",
      name: "Academic & Education",
      slug: "education",
      icon: "BookOpen",
      count: "65+ Listings",
      description: "Semester textbooks, CAS scientific calculators, lab kits, drawing drafters, and reference manuals.",
      order: 2,
      subs: [
        { id: "sub_textbooks", name: "Academic Textbooks", slug: "textbooks" },
        { id: "sub_calculators", name: "Graphing Calculators", slug: "calculators" },
        { id: "sub_lab", name: "Lab & Engineering Kits", slug: "lab-equipment" },
        { id: "sub_reference", name: "Exam Guides & Notes", slug: "reference" },
      ]
    },
    {
      id: "cat_college",
      name: "College Essentials",
      slug: "college-essentials",
      icon: "Home",
      count: "32+ Listings",
      description: "Hostel appliances, compact study desks, ergonomic chairs, desk fans, and dorm organizers.",
      order: 3,
      subs: [
        { id: "sub_hostel", name: "Hostel Appliances", slug: "hostel-appliances" },
        { id: "sub_furniture", name: "Study Furniture", slug: "furniture" },
        { id: "sub_stationery", name: "Stationery & Organizers", slug: "stationery" },
      ]
    },
    {
      id: "cat_lifestyle",
      name: "Lifestyle & Travel",
      slug: "lifestyle",
      icon: "Shirt",
      count: "29+ Listings",
      description: "Travel rucksacks, formal interview blazers, outdoor luggage, and wearable accessories.",
      order: 4,
      subs: [
        { id: "sub_travel", name: "Rucksacks & Luggage", slug: "luggage" },
        { id: "sub_formal", name: "Formal & Convocation Wear", slug: "formal-wear" },
        { id: "sub_accessories", name: "Lifestyle Accessories", slug: "lifestyle-accessories" },
      ]
    },
    {
      id: "cat_sports",
      name: "Sports & Fitness",
      slug: "sports-fitness",
      icon: "Dumbbell",
      count: "24+ Listings",
      description: "Badminton sets, campus bicycles, adjustable dumbbells, cricket kits, and yoga mats.",
      order: 5,
      subs: [
        { id: "sub_bicycles", name: "Campus Bicycles", slug: "bicycles" },
        { id: "sub_fitness", name: "Gym & Weights", slug: "fitness-gear" },
        { id: "sub_rackets", name: "Racquet Sports", slug: "racquets" },
      ]
    },
    {
      id: "cat_events",
      name: "Events & Entertainment",
      slug: "events-entertainment",
      icon: "Sparkles",
      count: "19+ Listings",
      description: "JBL party speakers, full HD smart projectors, acoustic guitars, stage spotlights, and mics.",
      order: 6,
      subs: [
        { id: "sub_projectors", name: "Smart Projectors", slug: "projectors" },
        { id: "sub_speakers", name: "PA & Party Speakers", slug: "speakers" },
        { id: "sub_instruments", name: "Musical Instruments", slug: "instruments" },
      ]
    }
  ];

  for (const c of categories) {
    await client.query(`
      INSERT INTO "categories" ("id", "name", "slug", "description", "icon", "count", "order", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT ("id") DO UPDATE 
      SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug", "count" = EXCLUDED."count", "description" = EXCLUDED."description", "order" = EXCLUDED."order";
    `, [c.id, c.name, c.slug, c.description, c.icon, c.count, c.order]);

    for (const s of c.subs) {
      await client.query(`
        INSERT INTO "subcategories" ("id", "categoryId", "name", "slug")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("id") DO UPDATE
        SET "name" = EXCLUDED."name", "slug" = EXCLUDED."slug";
      `, [s.id, c.id, s.name, s.slug]);
    }
  }

  console.log('4. Seeding complete 8-product authentic catalog...');
  const products = [
    {
      id: "prod_macbook_m3",
      title: "Apple MacBook Pro 14\" (M3 Pro, 18GB, 512GB SSD) - Space Black",
      description: "Flawless M3 Pro workstation ideal for app development, Machine Learning thesis runs, 4K rendering, or hackathons. Includes 70W MagSafe fast charger and protective hardshell sleeve.",
      categoryId: "cat_electronics",
      subcategoryId: "sub_laptops",
      ownerId: "usr_vendor_1",
      conditionGrade: "Mint (Like New)",
      rentalPriceHourly: 150,
      rentalPriceDaily: 699,
      rentalPriceWeekly: 3499,
      rentalPriceMonthly: 11999,
      rentalPriceSemester: 29999,
      buyPrice: 148000,
      mrpReference: 199900,
      deposit: 8000,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Technology & Equipment Desk",
      specs: JSON.stringify({
        Processor: "Apple M3 Pro (11-core CPU, 14-core GPU)",
        RAM: "18GB Unified Memory",
        Storage: "512GB Ultra-Fast SSD",
        BatteryHealth: "98% (62 cycles)",
        OS: "macOS Sequoia"
      }),
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_sony_a7iv",
      title: "Sony Alpha 7 IV Full-Frame Camera + FE 24-70mm f/2.8 GM Lens",
      description: "Industry-standard hybrid mirrorless camera for campus film festivals, club shoots, model portfolios, and convocation portraits. Supplied with 2 batteries, 128GB V90 SD card, and camera rig bag.",
      categoryId: "cat_electronics",
      subcategoryId: "sub_cameras",
      ownerId: "usr_vendor_1",
      conditionGrade: "Excellent",
      rentalPriceHourly: 190,
      rentalPriceDaily: 899,
      rentalPriceWeekly: 4200,
      rentalPriceMonthly: 14500,
      rentalPriceSemester: 38000,
      buyPrice: 195000,
      mrpReference: 262000,
      deposit: 9500,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Media & Studio Exchange Bay",
      specs: JSON.stringify({
        Sensor: "33MP Full-Frame Exmor R CMOS",
        Video: "4K 60p 10-Bit 4:2:2 All-Intra",
        Lens: "Sony FE 24-70mm f/2.8 G-Master",
        Stabilization: "5-axis In-Body Image Stabilization (IBIS)"
      }),
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_ti_nspire_cx2",
      title: "Texas Instruments TI-Nspire CX II CAS Graphing Calculator",
      description: "Approved for SAT, AP exams, advanced engineering mathematics, and thermodynamics courses. Full-color backlit display with Python programming support and rechargeable battery.",
      categoryId: "cat_education",
      subcategoryId: "sub_calculators",
      ownerId: "usr_default_demo",
      conditionGrade: "Mint (Like New)",
      rentalPriceHourly: 35,
      rentalPriceDaily: 149,
      rentalPriceWeekly: 649,
      rentalPriceMonthly: 1899,
      rentalPriceSemester: 3499,
      buyPrice: 13500,
      mrpReference: 18900,
      deposit: 1800,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Academic Library Annex • 2nd Floor",
      specs: JSON.stringify({
        Display: "3.2 inch 320x240 Color Backlit",
        Memory: "90MB Storage / 64MB Operating",
        CAS: "Computer Algebra System Enabled",
        ExamApproved: "AP, SAT, ACT Compatible"
      }),
      images: [
        "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1611117766055-6b5d92036577?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_ps5_bundle",
      title: "Sony PlayStation 5 Console (Disc Edition) + 2 Controllers + 3 Games",
      description: "Ultimate hostel weekend entertainment bundle. Includes PS5 console, two DualSense wireless controllers, HDMI 2.1 cable, and 3 games (FC 25, Spider-Man 2, God of War Ragnarök).",
      categoryId: "cat_electronics",
      subcategoryId: "sub_gaming",
      ownerId: "usr_vendor_1",
      conditionGrade: "Excellent",
      rentalPriceHourly: 120,
      rentalPriceDaily: 549,
      rentalPriceWeekly: 2699,
      rentalPriceMonthly: 8499,
      rentalPriceSemester: 19999,
      buyPrice: 42000,
      mrpReference: 54990,
      deposit: 5000,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Central Handover Point • Zone 1",
      specs: JSON.stringify({
        Edition: "Ultra HD Blu-ray Disc Edition",
        Storage: "825GB Custom NVMe SSD",
        Controllers: "2x DualSense Wireless Haptic",
        Output: "4K 120Hz / HDR / Tempest 3D Audio"
      }),
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_smart_projector",
      title: "Nebula Capsule 3 Laser 1080p Smart Projector with Built-In Battery",
      description: "Pocket-sized cinema projector for hostel room movie nights, club presentations, or terrace screenings. Built-in Google TV, autofocus, keystone correction, and 2.5-hour playtime on battery.",
      categoryId: "cat_events",
      subcategoryId: "sub_projectors",
      ownerId: "usr_vendor_1",
      conditionGrade: "Mint (Like New)",
      rentalPriceHourly: 90,
      rentalPriceDaily: 399,
      rentalPriceWeekly: 1899,
      rentalPriceMonthly: 5999,
      rentalPriceSemester: 14999,
      buyPrice: 48000,
      mrpReference: 69999,
      deposit: 4000,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "North Campus Central Hub • Block B",
      specs: JSON.stringify({
        Resolution: "1080p Full HD Laser",
        Brightness: "300 ANSI Lumens",
        Speaker: "8W Dolby Digital Audio",
        Connectivity: "HDMI, USB-C, Wi-Fi 5, Bluetooth"
      }),
      images: [
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_campus_bicycle",
      title: "Firefox Tremor 27.5T 21-Speed Mountain Bike with Lock & Helmet",
      description: "Save daily campus transit time. Lightweight alloy frame, Shimano 21-speed gears, front suspension fork, dual disc brakes. Includes heavy-duty numeric U-lock, LED headlight, and helmet.",
      categoryId: "cat_sports",
      subcategoryId: "sub_bicycles",
      ownerId: "usr_default_demo",
      conditionGrade: "Good",
      rentalPriceHourly: 25,
      rentalPriceDaily: 99,
      rentalPriceWeekly: 399,
      rentalPriceMonthly: 1199,
      rentalPriceSemester: 2999,
      buyPrice: 11500,
      mrpReference: 16500,
      deposit: 1200,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Campus Sports Complex Entrance",
      specs: JSON.stringify({
        Frame: "Alloy Hardtail 17.5 inch",
        Gearing: "Shimano Tourney 21-Speed",
        Brakes: "Front & Rear Mechanical Disc",
        Accessories: "U-Lock, LED Headlight, Helmet"
      }),
      images: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_cormen_algorithms",
      title: "Introduction to Algorithms (CLRS 4th Edition, Hardcover)",
      description: "Standard algorithmic text for CS coursework, interview preparation, and competitive programming. Crisp copy with no pen marks or missing pages.",
      categoryId: "cat_education",
      subcategoryId: "sub_textbooks",
      ownerId: "usr_default_demo",
      conditionGrade: "Near Mint",
      rentalPriceHourly: 10,
      rentalPriceDaily: 39,
      rentalPriceWeekly: 149,
      rentalPriceMonthly: 399,
      rentalPriceSemester: 899,
      buyPrice: 2800,
      mrpReference: 4500,
      deposit: 400,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Academic Library Annex • 2nd Floor",
      specs: JSON.stringify({
        Authors: "Cormen, Leiserson, Rivest, Stein",
        Edition: "4th Edition (MIT Press)",
        Pages: "1312 pages",
        Condition: "No markings, binding intact"
      }),
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=1000&q=80"
      ]
    },
    {
      id: "prod_hostel_fridge",
      title: "Godrej 45L Minibar Single Door Refrigerator (Compact Dorm Size)",
      description: "Keep medicines, dairy, juices, and snacks fresh in your hostel room. Silent cooling operation, built-in mini freezer compartment, energy-efficient with stabilizer-free operation.",
      categoryId: "cat_college",
      subcategoryId: "sub_hostel",
      ownerId: "usr_vendor_1",
      conditionGrade: "Excellent",
      rentalPriceHourly: 30,
      rentalPriceDaily: 129,
      rentalPriceWeekly: 599,
      rentalPriceMonthly: 1799,
      rentalPriceSemester: 4499,
      buyPrice: 7200,
      mrpReference: 10500,
      deposit: 1500,
      isRentable: true,
      isPurchasable: true,
      isAvailable: true,
      campusHub: "Central Handover Point • Zone 1",
      specs: JSON.stringify({
        Capacity: "45 Litres",
        Defrost: "Manual with Drip Tray",
        Compressor: "Advanced Inverter (Ultra-Quiet)",
        Dimensions: "47.5cm x 48.7cm x 49.5cm"
      }),
      images: [
        "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=80"
      ]
    }
  ];

  for (const p of products) {
    await client.query(`
      INSERT INTO "products" (
        "id", "title", "description", "categoryId", "subcategoryId", "ownerId", "conditionGrade",
        "rentalPriceHourly", "rentalPriceDaily", "rentalPriceWeekly", "rentalPriceMonthly", "rentalPriceSemester",
        "buyPrice", "mrpReference", "deposit", "isRentable", "isPurchasable", "isAvailable", "campusHub",
        "specs", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
      ON CONFLICT ("id") DO UPDATE SET
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "categoryId" = EXCLUDED."categoryId",
        "subcategoryId" = EXCLUDED."subcategoryId",
        "conditionGrade" = EXCLUDED."conditionGrade",
        "rentalPriceHourly" = EXCLUDED."rentalPriceHourly",
        "rentalPriceDaily" = EXCLUDED."rentalPriceDaily",
        "rentalPriceWeekly" = EXCLUDED."rentalPriceWeekly",
        "rentalPriceMonthly" = EXCLUDED."rentalPriceMonthly",
        "rentalPriceSemester" = EXCLUDED."rentalPriceSemester",
        "buyPrice" = EXCLUDED."buyPrice",
        "deposit" = EXCLUDED."deposit",
        "specs" = EXCLUDED."specs",
        "isAvailable" = EXCLUDED."isAvailable";
    `, [
      p.id, p.title, p.description, p.categoryId, p.subcategoryId, p.ownerId, p.conditionGrade,
      p.rentalPriceHourly, p.rentalPriceDaily, p.rentalPriceWeekly, p.rentalPriceMonthly, p.rentalPriceSemester,
      p.buyPrice, p.mrpReference, p.deposit, p.isRentable, p.isPurchasable, p.isAvailable, p.campusHub,
      p.specs
    ]);

    for (let i = 0; i < p.images.length; i++) {
      await client.query(`
        INSERT INTO "product_images" ("id", "productId", "url", "isPrimary", "createdAt")
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT ("id") DO NOTHING;
      `, [`img_${p.id}_${i}`, p.id, p.images[i], i === 0]);
    }
  }

  // Check counts
  const userCount = await client.query('SELECT count(*) FROM "users"');
  const catCount = await client.query('SELECT count(*) FROM "categories"');
  const subCount = await client.query('SELECT count(*) FROM "subcategories"');
  const prodCount = await client.query('SELECT count(*) FROM "products"');
  const imgCount = await client.query('SELECT count(*) FROM "product_images"');

  console.log('✅ Neon Database Seeding Completed Successfully:');
  console.log(`- Users: ${userCount.rows[0].count}`);
  console.log(`- Categories: ${catCount.rows[0].count}`);
  console.log(`- Subcategories: ${subCount.rows[0].count}`);
  console.log(`- Products: ${prodCount.rows[0].count}`);
  console.log(`- Product Images: ${imgCount.rows[0].count}`);

  await client.end();
}

seed().catch(err => {
  console.error("Seeding Failed:", err);
  process.exit(1);
});

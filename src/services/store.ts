import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { SEED_CATEGORIES, SEED_PRODUCTS, SeedProduct } from "@/data/seedData";

const DEV_DB_FILE = path.join(process.cwd(), ".dev-db.json");

interface DevDB {
  users: any[];
  anonymousProfiles: any[];
  categories: any[];
  subcategories: any[];
  products: any[];
  rentalBookings: any[];
  purchaseOrders: any[];
  cartItems: any[];
  wishlistItems: any[];
  payments: any[];
  notifications: any[];
  relayMessages: any[];
  reviews: any[];
  disputes: any[];
  auditLogs: any[];
  verificationTokens: any[];
  rentals: any[];
  ledger: any[];
}

function initDevDB(): DevDB {
  const users = [
    {
      id: "usr_default_demo",
      name: "Siddharth Rao",
      email: "demo@ywd.in",
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "usr_vendor_1",
      name: "TechGear Vendor",
      email: "vendor1@ywd.in",
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const anonymousProfiles = [
    {
      id: "prof_default",
      userId: "usr_default_demo",
      alias: "EcoRenter-4912",
      avatarColor: "#18352D",
      bio: "Tech enthusiast & active circular economy lender.",
      trustScore: 99.2,
      completedRentals: 19,
      isVerified: true,
      campusHub: "Central Handover Point • Zone 1",
    },
    {
      id: "prof_vendor_1",
      userId: "usr_vendor_1",
      alias: "GearVault-8801",
      avatarColor: "#C46A42",
      bio: "Verified premium equipment supplier with 100% genuine calibrated gear.",
      trustScore: 99.8,
      completedRentals: 62,
      isVerified: true,
      campusHub: "Technology & Equipment Desk",
    },
  ];

  const categories = SEED_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    count: c.count,
    description: c.description,
  }));

  const subcategories: any[] = [];
  SEED_CATEGORIES.forEach((c) => {
    c.subcategories.forEach((sub) => {
      subcategories.push({
        id: sub.id,
        categoryId: c.id,
        name: sub.name,
        slug: sub.slug,
      });
    });
  });

  const products = SEED_PRODUCTS.map((p) => {
    const cat = categories.find((c) => c.slug === p.categorySlug);
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      categoryId: cat ? cat.id : categories[0].id,
      categorySlug: p.categorySlug,
      subcategorySlug: p.subcategorySlug,
      ownerId: "usr_vendor_1",
      conditionGrade: p.conditionGrade,
      rentalPriceHourly: p.rentalPriceHourly,
      rentalPriceDaily: p.rentalPriceDaily,
      rentalPriceWeekly: p.rentalPriceWeekly,
      rentalPriceMonthly: p.rentalPriceMonthly,
      rentalPriceSemester: p.rentalPriceSemester,
      buyPrice: p.buyPrice,
      mrpReference: p.mrpReference,
      deposit: p.deposit,
      isRentable: p.isRentable,
      isPurchasable: p.isPurchasable,
      isAvailable: p.isAvailable,
      isPaused: false,
      pickupAvailable: p.pickupAvailable,
      deliveryAvailable: p.deliveryAvailable,
      campusHub: p.campusHub,
      images: p.images.map((url, i) => ({
        id: `img_${p.id}_${i}`,
        url,
        isPrimary: i === 0,
      })),
      conditionPhotos: p.conditionPhotos,
      specs: p.specs,
      owner: p.owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const notifications = [
    {
      id: "notif_1",
      userId: "usr_default_demo",
      title: "Security Deposit Protected",
      message: "Your security deposit is protected in platform ledger. It will be released for refund upon verified return inspection.",
      type: "ESCROW",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "notif_2",
      userId: "usr_default_demo",
      title: "Handover OTP Ready",
      message: "Your 6-digit handover code for pickup at designated exchange point is 849201.",
      type: "BOOKING",
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return {
    users,
    anonymousProfiles,
    categories,
    subcategories,
    products,
    rentalBookings: [],
    purchaseOrders: [],
    cartItems: [],
    wishlistItems: [],
    payments: [],
    notifications,
    relayMessages: [],
    reviews: [
      {
        id: "rev_1",
        productId: "prod_macbook_m3",
        authorAlias: "CampusCoder-9120",
        rating: 5,
        comment: "Rented for 48 hours for our campus hackathon. Machine was in spotless condition, battery lasted the entire weekend. Deposit refunded to my UPI within 10 minutes of handover!",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: "rev_2",
        productId: "prod_sony_a7iv",
        authorAlias: "FilmScholar-4301",
        rating: 5,
        comment: "Excellent lens and sensor quality. 4-angle proof photos made pickup and return completely transparent with zero arguments.",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
    disputes: [],
    auditLogs: [],
    verificationTokens: [],
    rentals: [],
    ledger: [],
  };
}

class StoreManager {
  private memoryDB: DevDB;
  private isPostgresAvailable: boolean | null = null;

  constructor() {
    this.memoryDB = this.loadDevDB();
  }

  private loadDevDB(): DevDB {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_JSON_STORE_FALLBACK !== "true") {
      console.warn(
        "[YwD Architecture] Production runtime detected: local JSON persistence is strictly disabled. Production workloads must use hosted PostgreSQL."
      );
      return initDevDB();
    }
    try {
      if (fs.existsSync(DEV_DB_FILE)) {
        const raw = fs.readFileSync(DEV_DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.auditLogs) parsed.auditLogs = [];
        if (!parsed.disputes) parsed.disputes = [];
        if (!parsed.verificationTokens) parsed.verificationTokens = [];
        if (!parsed.rentals) parsed.rentals = [];
        if (!parsed.ledger) parsed.ledger = [];
        return parsed;
      }
    } catch (e) {
      console.warn("[YwD Store] Falling back to default memory database:", e);
    }
    const fresh = initDevDB();
    this.saveDevDB(fresh);
    return fresh;
  }

  private saveDevDB(db: DevDB) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_JSON_STORE_FALLBACK !== "true") {
      // In production serverless environments (e.g. Vercel), the filesystem is read-only.
      // Persisting to .dev-db.json in production is prohibited to prevent data loss across cold starts.
      return;
    }
    try {
      fs.writeFileSync(DEV_DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      console.warn("[YwD Store] Could not write .dev-db.json, keeping in memory.");
    }
  }

  public getStorageEngineMode(): "POSTGRESQL" | "LOCAL_JSON_DEV" | "PRODUCTION_UNCONFIGURED" {
    if (this.isPostgresAvailable === true) return "POSTGRESQL";
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_JSON_STORE_FALLBACK !== "true") {
      return "PRODUCTION_UNCONFIGURED";
    }
    return "LOCAL_JSON_DEV";
  }

  public getDB(): DevDB {
    if (process.env.NODE_ENV !== "production") {
      try {
        if (fs.existsSync(DEV_DB_FILE)) {
          const raw = fs.readFileSync(DEV_DB_FILE, "utf-8");
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.products)) {
            this.memoryDB = parsed;
          }
        }
      } catch (e) {
        // Retain memoryDB if file is being written to
      }
    }
    return this.memoryDB;
  }

  public updateDB(updater: (db: DevDB) => void): DevDB {
    if (process.env.NODE_ENV !== "production") {
      try {
        if (fs.existsSync(DEV_DB_FILE)) {
          const raw = fs.readFileSync(DEV_DB_FILE, "utf-8");
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.products)) {
            this.memoryDB = parsed;
          }
        }
      } catch (e) {}
    }
    updater(this.memoryDB);
    this.saveDevDB(this.memoryDB);
    return this.memoryDB;
  }

  public async checkPostgres(): Promise<boolean> {
    if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      return false;
    }
    if (this.isPostgresAvailable === true) return true;
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes("localhost:5432") || dbUrl.includes("placeholder")) {
      this.isPostgresAvailable = false;
      return false;
    }
    try {
      await prisma.$queryRaw`SELECT 1`;
      this.isPostgresAvailable = true;
      console.log("[YwD DB] Connected successfully to PostgreSQL database.");
      return true;
    } catch (err: any) {
      console.warn("[YwD DB] PostgreSQL connectivity check failed:", err?.code || err?.message || "Unknown error");
      this.isPostgresAvailable = false;
      return false;
    }
  }

  public assertProductionDatabase(): void {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_JSON_STORE_FALLBACK !== "true") {
      if (this.isPostgresAvailable === false) {
        throw new Error(
          "DATABASE_UNAVAILABLE: No hosted PostgreSQL database is configured. Production requires a valid DATABASE_URL (e.g. Neon, Supabase, or AWS RDS). Ephemeral in-memory persistence is strictly prohibited in production."
        );
      }
    }
  }
}

export const store = new StoreManager();

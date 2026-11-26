import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { buildUpiLink, buildQrUrl, rupeesToPaise } from "@/lib/payments/upi";
import { calculateRentalPrice, DurationTier } from "@/lib/pricing";
import { randomUUID } from "crypto";

let hasCheckedUserIdColumn = false;
async function ensureUserIdColumn(): Promise<boolean> {
  if (hasCheckedUserIdColumn) return true;
  try {
    await (prisma as any).$executeRawUnsafe(
      'ALTER TABLE "rentals" ADD COLUMN IF NOT EXISTS "user_id" TEXT;'
    );
    try {
      await (prisma as any).$executeRawUnsafe(
        'ALTER TABLE "rentals" ALTER COLUMN "user_id" DROP DEFAULT;'
      );
    } catch {}
    try {
      await (prisma as any).$executeRawUnsafe(
        'CREATE INDEX IF NOT EXISTS "rentals_user_id_idx" ON "rentals"("user_id");'
      );
    } catch {}
    hasCheckedUserIdColumn = true;
    return true;
  } catch (err: any) {
    return false;
  }
}

async function backfillLegacyRentals(): Promise<void> {
  try {
    // 1. Backfill legacy PostgreSQL rentals matching users by name to verified owner IDs
    await (prisma as any).$executeRawUnsafe(`
      UPDATE "rentals" r
      SET "user_id" = u."id"
      FROM "users" u
      WHERE (r."user_id" = 'usr_default_demo' OR r."user_id" IS NULL)
        AND u."name" IS NOT NULL
        AND r."student_name" = u."name"
        AND u."id" != 'usr_default_demo'
    `);

    // 2. Disassociate unverified legacy rentals from shared demo identity
    await (prisma as any).$executeRawUnsafe(`
      UPDATE "rentals"
      SET "user_id" = NULL
      WHERE "user_id" = 'usr_default_demo'
        AND "student_name" != 'Student (Demo)'
    `);
  } catch {}
}

export async function POST(req: NextRequest) {
  let session: any = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("[POST /api/rentals] Session warning:", err);
  }
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required. Please sign in to rent." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    productId,
    studentName,
    studentUpi,
    days,
    durationTier = "daily",
    durationUnits,
    deliveryMethod = "PICKUP",
  } = body;
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const isPg = await store.checkPostgres();

  // --- Postgres path ---
  if (isPg) {
    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (!product.isAvailable || product.isPaused) {
        return NextResponse.json({ error: "Product is not available for rent" }, { status: 409 });
      }

      // Backend-authoritative amount calculation with tier rates, delivery, platform fee, and GST
      const units = Math.max(1, Math.round(Number(durationUnits) || Number(days) || 1));
      const method = deliveryMethod === "DELIVERY" ? "DELIVERY" : "PICKUP";

      const pricing = calculateRentalPrice({
        rates: {
          hourly: product.rentalPriceHourly || Math.round(product.rentalPriceDaily / 6),
          daily: product.rentalPriceDaily,
          weekly: product.rentalPriceWeekly,
          monthly: product.rentalPriceMonthly || Math.round(product.rentalPriceWeekly * 3.4),
          semester: product.rentalPriceSemester || Math.round(product.rentalPriceWeekly * 8.5),
          deposit: product.deposit,
        },
        durationTier: (durationTier as DurationTier) || "daily",
        durationUnits: units,
        deliveryMethod: method,
        customDeliveryFee: method === "DELIVERY" ? 99 : 0,
      });

      const depositPaise = rupeesToPaise(pricing.securityDeposit);
      const totalPaise = rupeesToPaise(pricing.totalPayable);
      const rentPaise = totalPaise - depositPaise;

      const orderId = randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();

      let upiLink: string;
      try {
        upiLink = buildUpiLink(orderId, totalPaise);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
      }
      const qrUrl = buildQrUrl(upiLink);

      await ensureUserIdColumn();

      let rental: any;
      try {
        rental = await (prisma as any).rental.create({
          data: {
            id: orderId,
            itemId: productId,
            userId,
            studentName: studentName || session?.user?.name || "Student (Demo)",
            studentUpi: studentUpi || null,
            rentPaise,
            depositPaise,
            status: "CREATED",
          },
        });
      } catch (insertErr: any) {
        const msg = String(insertErr?.message || "").toLowerCase();
        if (
          msg.includes("user_id") ||
          msg.includes("does not exist") ||
          insertErr?.code === "P2021" ||
          insertErr?.code === "P2022"
        ) {
          await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "rentals" ("id", "item_id", "student_name", "student_upi", "rent_paise", "deposit_paise", "status", "created_at", "updated_at")
             VALUES ($1, $2, $3, $4, $5, $6, 'CREATED', NOW(), NOW())`,
            orderId,
            productId,
            studentName || session?.user?.name || "Student (Demo)",
            studentUpi || null,
            rentPaise,
            depositPaise
          );
          rental = {
            id: orderId,
            itemId: productId,
            userId,
            studentName: studentName || session?.user?.name || "Student (Demo)",
            studentUpi: studentUpi || null,
            rentPaise,
            depositPaise,
            status: "CREATED",
          };
        } else {
          throw insertErr;
        }
      }

      return NextResponse.json({
        id: rental.id,
        upiId: process.env.UPI_ID,
        upiLink,
        qrUrl,
        rentPaise,
        depositPaise,
        totalPaise,
        status: rental.status,
        productTitle: product.title,
        pricing,
      });
    } catch (e: any) {
      console.error("[POST /api/rentals] PG error:", e);
      return NextResponse.json({ error: e.message || "Failed to create rental" }, { status: 500 });
    }
  }

  // --- JSON store fallback ---
  try {
    const db = store.getDB() as any;
    const product = db.products?.find((p: any) => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const units = Math.max(1, Math.round(Number(durationUnits) || Number(days) || 1));
    const method = deliveryMethod === "DELIVERY" ? "DELIVERY" : "PICKUP";

    const pricing = calculateRentalPrice({
      rates: {
        hourly: product.rentalPriceHourly || Math.round((product.rentalPriceDaily || 0) / 6),
        daily: product.rentalPriceDaily || 0,
        weekly: product.rentalPriceWeekly || 0,
        monthly: product.rentalPriceMonthly || Math.round((product.rentalPriceWeekly || 0) * 3.4),
        semester: product.rentalPriceSemester || Math.round((product.rentalPriceWeekly || 0) * 8.5),
        deposit: product.deposit || 0,
      },
      durationTier: (durationTier as DurationTier) || "daily",
      durationUnits: units,
      deliveryMethod: method,
      customDeliveryFee: method === "DELIVERY" ? 99 : 0,
    });

    const depositPaise = rupeesToPaise(pricing.securityDeposit);
    const totalPaise = rupeesToPaise(pricing.totalPayable);
    const rentPaise = totalPaise - depositPaise;

    const orderId = randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
    let upiLink: string;
    try {
      upiLink = buildUpiLink(orderId, totalPaise);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    const qrUrl = buildQrUrl(upiLink);

    const rental = {
      id: orderId,
      productId,
      userId,
      studentName: studentName || session?.user?.name || "Student (Demo)",
      studentUpi: studentUpi || null,
      rentPaise,
      depositPaise,
      totalPaise,
      status: "CREATED",
      createdAt: new Date().toISOString(),
      ledger: [],
    };

    store.updateDB((db: any) => {
      if (!db.rentals) db.rentals = [];
      db.rentals.push(rental);
    });

    return NextResponse.json({
      id: rental.id,
      upiId: process.env.UPI_ID,
      upiLink,
      qrUrl,
      rentPaise,
      depositPaise,
      totalPaise,
      status: rental.status,
      productTitle: product.title,
      pricing,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create rental" }, { status: 500 });
  }
}

export async function GET() {
  let session: any = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("[GET /api/rentals] Session warning:", err);
  }
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      await ensureUserIdColumn();
      await backfillLegacyRentals();

      if (session?.user?.name && session.user.name !== "Student (Demo)" && userId !== "usr_default_demo") {
        try {
          await (prisma as any).rental.updateMany({
            where: {
              userId: "usr_default_demo",
              studentName: session.user.name,
            },
            data: { userId },
          });
        } catch {}
      }

      let rentals: any[] = [];
      try {
        rentals = await (prisma as any).rental.findMany({
          where: { userId },
          include: {
            product: { select: { title: true } },
            ledgerEntries: true,
          },
          orderBy: { createdAt: "desc" },
        });
      } catch (queryErr: any) {
        const msg = String(queryErr?.message || "").toLowerCase();
        if (
          msg.includes("user_id") ||
          msg.includes("does not exist") ||
          queryErr?.code === "P2021" ||
          queryErr?.code === "P2022"
        ) {
          const rawRentals = await (prisma as any).$queryRawUnsafe(
            `SELECT r."id", r."item_id" as "itemId", r."student_name" as "studentName", 
                    r."student_upi" as "studentUpi", r."rent_paise" as "rentPaise", 
                    r."deposit_paise" as "depositPaise", r."damage_paise" as "damagePaise", 
                    r."status", r."created_at" as "createdAt", r."updated_at" as "updatedAt",
                    p."title" as "productTitle"
             FROM "rentals" r
             LEFT JOIN "products" p ON r."item_id" = p."id"
             ORDER BY r."created_at" DESC`
          );
          rentals = (rawRentals as any[]).map((r: any) => ({
            ...r,
            userId,
            product: { title: r.productTitle },
            ledgerEntries: [],
          }));
        } else {
          throw queryErr;
        }
      }

      return NextResponse.json({
        rentals: rentals.map((r: any) => ({
          ...r,
          totalPaise: r.rentPaise + r.depositPaise,
          ledger: r.ledgerEntries || [],
        })),
      });
    } catch (e: any) {
      console.error("[GET /api/rentals] PG error:", e);
    }
  }

  const db = store.getDB() as any;
  if (!db.rentals) db.rentals = [];

  // Handle records without userId or assigned to shared demo in fallback store before applying owner filter
  let dbModified = false;
  for (const r of db.rentals) {
    if (!r.userId || r.userId === "usr_default_demo") {
      const matched = (db.users || []).find(
        (u: any) => u.name && u.name === r.studentName && u.id !== "usr_default_demo"
      );
      if (matched) {
        r.userId = matched.id;
        dbModified = true;
      } else if (session?.user?.name && r.studentName === session.user.name && userId !== "usr_default_demo") {
        r.userId = userId;
        dbModified = true;
      } else if (r.userId === "usr_default_demo" && r.studentName !== "Student (Demo)") {
        delete r.userId;
        dbModified = true;
      }
    }
  }
  if (dbModified) {
    store.updateDB(() => {});
  }

  const rentals = (db.rentals || []).filter((r: any) => r.userId === userId);
  return NextResponse.json({ rentals });
}

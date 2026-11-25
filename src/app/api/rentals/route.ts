import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { buildUpiLink, buildQrUrl, rupeesToPaise } from "@/lib/payments/upi";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  let session: any = null;
  try {
    session = await auth();
  } catch (err) {
    console.warn("[POST /api/rentals] Session warning:", err);
  }
  const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required. Please sign in to rent." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productId, studentName, studentUpi, days } = body;
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

      // Backend-authoritative amount calculation (paise)
      const daysCount = Math.max(1, Math.round(Number(days) || 1));
      const rentPaise = rupeesToPaise(product.rentalPriceDaily * daysCount);
      const depositPaise = rupeesToPaise(product.deposit);
      const totalPaise = rentPaise + depositPaise;

      const orderId = randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();

      let upiLink: string;
      try {
        upiLink = buildUpiLink(orderId, totalPaise);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
      }
      const qrUrl = buildQrUrl(upiLink);

      const rental = await (prisma as any).rental.create({
        data: {
          id: orderId,
          itemId: productId,
          studentName: studentName || session?.user?.name || "Student (Demo)",
          studentUpi: studentUpi || null,
          rentPaise,
          depositPaise,
          status: "CREATED",
        },
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

    const daysCount = Math.max(1, Math.round(Number(days) || 1));
    const rentPaise = rupeesToPaise((product.rentalPriceDaily || 0) * daysCount);
    const depositPaise = rupeesToPaise(product.deposit || 0);
    const totalPaise = rentPaise + depositPaise;

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
  const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      const rentals = await (prisma as any).rental.findMany({
        include: {
          product: { select: { title: true } },
          ledgerEntries: true,
        },
        orderBy: { createdAt: "desc" },
      });
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
  const rentals = (db.rentals || []).filter((r: any) => r.userId === userId);
  return NextResponse.json({ rentals });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { logAuditEvent } from "@/lib/security";

/**
 * Server-side Admin Authorization Gate
 */
async function assertAdminSession() {
  const session = await auth();
  if (!session || !session.user) {
    return { authorized: false, status: 401, error: "Authentication required" };
  }

  const userId = session.user.id;
  let role = (session.user as any).role;

  const isPg = await store.checkPostgres();
  if (isPg && userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) role = user.role;
    } catch { }
  }

  if (role !== "ADMIN") {
    return { authorized: false, status: 403, error: "Access Denied: Administrator role required" };
  }

  return { authorized: true, user: session.user };
}

export async function GET() {
  const gate = await assertAdminSession();
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const [users, products, bookings, disputes, payments, auditLogs, categories] = await Promise.all([
        prisma.user.findMany({
          include: { anonymousProfile: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.product.findMany({
          include: {
            images: true,
            category: true,
            owner: { include: { anonymousProfile: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.rentalBooking.findMany({
          include: {
            product: { include: { images: true } },
            renter: { include: { anonymousProfile: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.dispute.findMany({
          include: {
            booking: { include: { product: true } },
            initiator: { include: { anonymousProfile: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.payment.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        (prisma as any).auditLog
          ? (prisma as any).auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
          })
          : Promise.resolve([]),
        prisma.category.findMany({
          include: { subcategories: true },
        }),
      ]);

      const metrics = {
        totalUsers: users.length,
        totalProducts: products.length,
        activeRentals: bookings.filter((b) => b.status === "ACTIVE").length,
        openDisputes: disputes.filter((d) => d.status === "OPEN").length,
        totalPayments: payments.length,
        totalEscrowHeld: bookings
          .filter((b) => b.escrowStatus === "HELD")
          .reduce((acc, curr) => acc + curr.depositAmount, 0),
      };

      return NextResponse.json({
        metrics,
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          alias: u.anonymousProfile?.alias || "N/A",
          trustScore: u.anonymousProfile?.trustScore || 99.0,
          createdAt: u.createdAt.toISOString(),
        })),
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category.name,
          rentalPriceDaily: p.rentalPriceDaily,
          buyPrice: p.buyPrice,
          deposit: p.deposit,
          isAvailable: p.isAvailable,
          isPaused: p.isPaused,
          campusHub: p.campusHub,
          ownerAlias: p.owner.anonymousProfile?.alias || "VerifiedPeer",
          image: p.images[0]?.url || "",
          createdAt: p.createdAt.toISOString(),
        })),
        bookings: bookings.map((b) => ({
          id: b.id,
          bookingNumber: b.bookingNumber,
          productTitle: b.product.title,
          renterAlias: b.renter.anonymousProfile?.alias || "Renter",
          status: b.status,
          escrowStatus: b.escrowStatus,
          totalAmount: b.totalAmount,
          depositAmount: b.depositAmount,
          pickupOtp: b.pickupOtp,
          returnOtp: b.returnOtp,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          createdAt: b.createdAt.toISOString(),
        })),
        disputes: disputes.map((d) => ({
          id: d.id,
          bookingId: d.bookingId,
          bookingNumber: d.booking.bookingNumber,
          productTitle: d.booking.product.title,
          initiatorAlias: d.initiator.anonymousProfile?.alias || "Peer",
          reason: d.reason,
          description: d.description,
          status: d.status,
          resolution: d.resolution,
          createdAt: d.createdAt.toISOString(),
        })),
        payments: payments.map((p) => ({
          id: p.id,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        })),
        auditLogs: (auditLogs || []).map((a: any) => ({
          id: a.id,
          action: a.action,
          resource: a.resource,
          userId: a.userId,
          metadata: a.metadata,
          ipAddress: a.ipAddress,
          createdAt: typeof a.createdAt === "string" ? a.createdAt : a.createdAt?.toISOString?.() || new Date().toISOString(),
        })),
        categories,
      });
    } catch (e) {
      console.warn("[Admin API] Postgres query failed, falling back to store:", e);
    }
  }

  // Fallback to store
  const db = store.getDB();
  return NextResponse.json({
    metrics: {
      totalUsers: db.users.length,
      totalProducts: db.products.length,
      activeRentals: db.rentalBookings.filter((b) => b.status === "ACTIVE").length,
      openDisputes: db.disputes.filter((d) => d.status === "OPEN").length,
      totalPayments: db.payments.length,
      totalEscrowHeld: db.rentalBookings
        .filter((b) => b.escrowStatus === "HELD")
        .reduce((acc, curr) => acc + (curr.depositAmount || 0), 0),
    },
    users: db.users,
    products: db.products,
    bookings: db.rentalBookings,
    disputes: db.disputes,
    payments: db.payments,
    auditLogs: (db as any).auditLogs || [],
    categories: db.categories,
  });
}

export async function POST(req: NextRequest) {
  const gate = await assertAdminSession();
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  try {
    const { action, targetId, payload } = await req.json();

    const isPg = await store.checkPostgres();
    if (isPg) {
      if (action === "TOGGLE_PRODUCT_SUSPENSION") {
        const prod = await prisma.product.findUnique({ where: { id: targetId } });
        if (!prod) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        const updated = await prisma.product.update({
          where: { id: targetId },
          data: { isPaused: !prod.isPaused, isAvailable: prod.isPaused },
        });

        await logAuditEvent({
          userId: gate.user?.id,
          action: "ADMIN_TOGGLE_PRODUCT_SUSPENSION",
          resource: `product:${targetId}`,
          metadata: { isPaused: updated.isPaused },
        });

        return NextResponse.json({ success: true, product: updated });
      }

      if (action === "RESOLVE_DISPUTE") {
        const dispute = await prisma.dispute.findUnique({
          where: { id: targetId },
          include: { booking: true },
        });
        if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

        const resolution = payload?.resolution || "Resolved by administrator mediation.";
        const refundDecision = payload?.refundDecision || "REFUNDED"; // REFUNDED, DEDUCTED, PARTIALLY_REFUNDED

        await prisma.$transaction([
          prisma.dispute.update({
            where: { id: targetId },
            data: { status: "RESOLVED", resolution },
          }),
          prisma.rentalBooking.update({
            where: { id: dispute.bookingId },
            data: {
              status: "COMPLETED",
              escrowStatus: refundDecision,
            },
          }),
        ]);

        await logAuditEvent({
          userId: gate.user?.id,
          action: "ADMIN_RESOLVE_DISPUTE",
          resource: `dispute:${targetId}`,
          metadata: { resolution, refundDecision },
        });

        return NextResponse.json({ success: true, message: "Dispute resolved successfully" });
      }

      if (action === "UPDATE_USER_ROLE") {
        const newRole = payload?.role;
        if (!["USER", "ADMIN"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
        }

        const user = await prisma.user.update({
          where: { id: targetId },
          data: { role: newRole },
        });

        await logAuditEvent({
          userId: gate.user?.id,
          action: "ADMIN_UPDATE_USER_ROLE",
          resource: `user:${targetId}`,
          metadata: { newRole },
        });

        return NextResponse.json({ success: true, user });
      }
    }

    return NextResponse.json({ success: true, message: "Action processed" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to execute administrative action" },
      { status: 500 }
    );
  }
}


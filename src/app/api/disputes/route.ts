import { NextRequest, NextResponse } from "next/server";
import { createDisputeSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { logAuditEvent } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        const disputes = await prisma.dispute.findMany({
          where: {
            OR: [
              { initiatorId: userId },
              { booking: { renterId: userId } },
              { booking: { product: { ownerId: userId } } },
            ],
          },
          include: {
            booking: { include: { product: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(
          disputes.map((d) => ({
            id: d.id,
            bookingId: d.bookingId,
            bookingNumber: d.booking.bookingNumber,
            initiatorId: d.initiatorId,
            reason: d.reason,
            description: d.description,
            evidencePhotos: d.evidencePhotos,
            status: d.status,
            resolution: d.resolution,
            createdAt: d.createdAt.toISOString(),
            updatedAt: d.updatedAt.toISOString(),
          }))
        );
      } catch (e) {
        console.warn("[Disputes] Postgres query failed:", e);
      }
    }

    const disputes = store.getDB().disputes.filter((d) => {
      if (d.initiatorId === userId) return true;
      const booking = store.getDB().rentalBookings.find((b) => b.id === d.bookingId);
      return booking && (booking.renterId === userId || booking.ownerId === userId);
    });

    return NextResponse.json(disputes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load disputes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to file a dispute." }, { status: 401 });
    }

    const body = await req.json();
    const validated = createDisputeSchema.parse(body);

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        return await prisma.$transaction(async (tx) => {
          const booking = await tx.rentalBooking.findUnique({
            where: { id: validated.bookingId },
            include: { product: true },
          });

          if (!booking) throw new Error("Associated booking not found");
          if (booking.renterId !== userId && booking.product.ownerId !== userId) {
            throw new Error("Unauthorized: only transaction participants can file a dispute.");
          }

          const dispute = await tx.dispute.create({
            data: {
              bookingId: validated.bookingId,
              initiatorId: userId,
              reason: validated.reason,
              description: validated.description,
              evidencePhotos: validated.evidencePhotos || [],
              status: "OPEN",
            },
          });

          await tx.rentalBooking.update({
            where: { id: validated.bookingId },
            data: { status: "DISPUTED" },
          });

          await tx.notification.create({
            data: {
              userId,
              title: "Dispute Opened Under Review",
              message: `Dispute for ${booking.bookingNumber} (${validated.reason}) has been recorded. Deposit settlement is paused pending resolution.`,
              type: "SYSTEM",
              link: "/dashboard?tab=refunds",
            },
          });

          await logAuditEvent({
            userId,
            action: "DISPUTE_FILED",
            resource: "disputes",
            metadata: { bookingId: validated.bookingId, disputeId: dispute.id },
          });

          return NextResponse.json(
            {
              ...dispute,
              bookingNumber: booking.bookingNumber,
              createdAt: dispute.createdAt.toISOString(),
              updatedAt: dispute.updatedAt.toISOString(),
            },
            { status: 201 }
          );
        });
      } catch (e: any) {
        if (e.message?.includes("Unauthorized") || e.message?.includes("not found")) {
          return NextResponse.json({ error: e.message }, { status: 403 });
        }
        console.warn("[Dispute Service] Postgres failed, checking store fallback:", e);
      }
    }

    store.assertProductionDatabase();

    const booking = store.getDB().rentalBookings.find((b) => b.id === validated.bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Associated booking not found" }, { status: 404 });
    }

    if (booking.renterId !== userId && booking.ownerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: only transaction participants can file a dispute." },
        { status: 403 }
      );
    }

    const disputeId = `disp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDispute = {
      id: disputeId,
      bookingId: validated.bookingId,
      bookingNumber: booking.bookingNumber,
      initiatorId: userId,
      reason: validated.reason,
      description: validated.description,
      evidencePhotos: validated.evidencePhotos || [],
      status: "OPEN",
      resolution: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.updateDB((db) => {
      db.disputes.unshift(newDispute);

      const b = db.rentalBookings.find((item) => item.id === validated.bookingId);
      if (b) {
        b.status = "DISPUTED";
        b.updatedAt = new Date().toISOString();
      }

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: "Dispute Opened Under Review",
        message: `Dispute for ${booking.bookingNumber} (${validated.reason}) has been recorded. Deposit settlement is paused pending resolution.`,
        type: "SYSTEM",
        link: `/dashboard?tab=refunds`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    await logAuditEvent({
      userId,
      action: "DISPUTE_FILED",
      resource: "disputes",
      metadata: { bookingId: validated.bookingId, disputeId },
    });

    return NextResponse.json(newDispute, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create dispute" },
      { status: 400 }
    );
  }
}

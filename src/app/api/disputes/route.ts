import { NextRequest, NextResponse } from "next/server";
import { createDisputeSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { store } from "@/services/store";
import { logAuditEvent } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

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
    const userId = session?.user?.id || "usr_default_demo";

    const body = await req.json();
    const validated = createDisputeSchema.parse(body);

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

      // Transition booking state to DISPUTED to lock escrow
      const b = db.rentalBookings.find((item) => item.id === validated.bookingId);
      if (b) {
        b.status = "DISPUTED";
        b.updatedAt = new Date().toISOString();
      }

      // Add notification for resolution review
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: "Dispute Opened Under Review",
        message: `Dispute for ${booking.bookingNumber} (${validated.reason}) has been recorded. Escrow release is paused pending mediation.`,
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


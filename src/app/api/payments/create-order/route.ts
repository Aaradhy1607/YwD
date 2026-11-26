import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { store } from "@/services/store";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to create a payment order." },
        { status: 401 }
      );
    }

    const { bookingId, orderId } = await req.json();

    let amount = 0;
    let receipt = "";

    const isPg = await store.checkPostgres();

    if (bookingId) {
      let booking: any = null;
      if (isPg) {
        try {
          booking = await prisma.rentalBooking.findUnique({
            where: { id: bookingId },
          });
        } catch (e) {
          console.warn("[Payments create-order] Postgres booking lookup failed:", e);
        }
      }
      if (!booking) {
        booking = store.getDB().rentalBookings.find((b) => b.id === bookingId);
      }
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      if (booking.renterId !== userId) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to pay for this booking." },
          { status: 403 }
        );
      }
      amount = booking.totalAmount;
      receipt = booking.bookingNumber;
    } else if (orderId) {
      let order: any = null;
      if (isPg) {
        try {
          order = await prisma.purchaseOrder.findUnique({
            where: { id: orderId },
          });
        } catch (e) {
          console.warn("[Payments create-order] Postgres order lookup failed:", e);
        }
      }
      if (!order) {
        order = store.getDB().purchaseOrders.find((o) => o.id === orderId);
      }
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      if (order.buyerId !== userId) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to pay for this order." },
          { status: 403 }
        );
      }
      amount = order.totalAmount;
      receipt = order.orderNumber;
    } else {
      return NextResponse.json(
        { error: "Either bookingId or orderId is required" },
        { status: 400 }
      );
    }

    const razorpayOrder = await createRazorpayOrder({
      amountInINR: amount,
      receipt,
      notes: {
        bookingId: bookingId || "",
        orderId: orderId || "",
        userId,
      },
    });

    return NextResponse.json(razorpayOrder);
  } catch (error: any) {
    console.error("[Create Payment Order Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}

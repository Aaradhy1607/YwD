import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { store } from "@/services/store";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, orderId } = await req.json();

    let amount = 0;
    let receipt = "";

    if (bookingId) {
      const booking = store.getDB().rentalBookings.find((b) => b.id === bookingId);
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      amount = booking.totalAmount;
      receipt = booking.bookingNumber;
    } else if (orderId) {
      const order = store.getDB().purchaseOrders.find((o) => o.id === orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
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

import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { store } from "@/services/store";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
      orderId,
    } = await req.json();

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Cryptographic signature verification failed. Untrusted payment payload." },
        { status: 400 }
      );
    }

    // Save transaction record idempotently
    store.updateDB((db) => {
      const existing = db.payments.find((p) => p.razorpayOrderId === razorpayOrderId);
      if (!existing) {
        db.payments.push({
          id: `pay_${Date.now()}`,
          bookingId: bookingId || null,
          orderId: orderId || null,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: 0,
          currency: "INR",
          status: "SUCCESS",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (bookingId) {
        const booking = db.rentalBookings.find((b) => b.id === bookingId);
        if (booking) {
          booking.status = "CONFIRMED";
          booking.updatedAt = new Date().toISOString();
        }
      }

      if (orderId) {
        const order = db.purchaseOrders.find((o) => o.id === orderId);
        if (order) {
          order.status = "PAID";
          order.updatedAt = new Date().toISOString();
        }
      }
    });

    return NextResponse.json({
      verified: true,
      message: "Payment successfully verified and recorded in YwD escrow ledger.",
    });
  } catch (error: any) {
    console.error("[Verify Payment Error]:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

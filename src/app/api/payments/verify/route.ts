import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { logAuditEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
      orderId,
      amount,
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

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.payment.upsert({
            where: { razorpayOrderId },
            update: {
              razorpayPaymentId,
              razorpaySignature,
              status: "SUCCESS",
              amount: amount ? Number(amount) : 0,
            },
            create: {
              bookingId: bookingId || null,
              orderId: orderId || null,
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
              amount: amount ? Number(amount) : 0,
              currency: "INR",
              status: "SUCCESS",
            },
          });

          if (bookingId) {
            await tx.rentalBooking.updateMany({
              where: { id: bookingId },
              data: { status: "CONFIRMED" },
            });
          }

          if (orderId) {
            await tx.purchaseOrder.updateMany({
              where: { id: orderId },
              data: { status: "PAID" },
            });
          }
        });

        await logAuditEvent({
          action: "PAYMENT_VERIFIED",
          resource: "payments",
          metadata: { razorpayOrderId, razorpayPaymentId, bookingId, orderId },
        });

        return NextResponse.json({
          verified: true,
          message: "Payment successfully verified and recorded in YwD platform database.",
        });
      } catch (e) {
        console.warn("[Payment Verify] Postgres transaction failed, falling back to store:", e);
      }
    }

    // Save transaction record idempotently in store fallback
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
          amount: amount ? Number(amount) : 0,
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

    await logAuditEvent({
      action: "PAYMENT_VERIFIED",
      resource: "payments",
      metadata: { razorpayOrderId, razorpayPaymentId, bookingId, orderId },
    });

    return NextResponse.json({
      verified: true,
      message: "Payment successfully verified and recorded in YwD platform ledger.",
    });
  } catch (error: any) {
    console.error("[Verify Payment Error]:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

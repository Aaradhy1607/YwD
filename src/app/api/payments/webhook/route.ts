import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { store } from "@/services/store";
import { logAuditEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    await logAuditEvent({
      userId: null,
      action: `WEBHOOK_${eventType?.toUpperCase() || "EVENT"}`,
      resource: "payments",
      metadata: { eventId: event.id || "dev_event" },
    });

    store.updateDB((db) => {
      // 1. Payment Captured
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const paymentEntity = payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;
        const notes = paymentEntity?.notes || {};

        const bookingId = notes.bookingId;
        const purchaseOrderId = notes.orderId;

        // Idempotency check: don't duplicate
        const existingPayment = db.payments.find(
          (p) => p.razorpayPaymentId === paymentId || p.razorpayOrderId === orderId
        );

        if (!existingPayment && paymentId) {
          db.payments.push({
            id: `pay_${Date.now()}`,
            bookingId: bookingId || null,
            orderId: purchaseOrderId || null,
            razorpayOrderId: orderId || "order_webhook",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature || "webhook_verified",
            amount: (paymentEntity?.amount || 0) / 100,
            currency: paymentEntity?.currency || "INR",
            status: "SUCCESS",
            refundId: null,
            refundAmount: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (bookingId) {
          const booking = db.rentalBookings.find((b) => b.id === bookingId);
          if (booking && booking.status === "PENDING") {
            booking.status = "CONFIRMED";
            booking.updatedAt = new Date().toISOString();
          }
        }

        if (purchaseOrderId) {
          const order = db.purchaseOrders.find((o) => o.id === purchaseOrderId);
          if (order && order.status === "PENDING") {
            order.status = "PAID";
            order.updatedAt = new Date().toISOString();
          }
        }
      }

      // 2. Refund Processed
      if (eventType === "refund.processed") {
        const refundEntity = payload?.refund?.entity;
        const paymentId = refundEntity?.payment_id;
        const refundAmount = (refundEntity?.amount || 0) / 100;

        const payment = db.payments.find((p) => p.razorpayPaymentId === paymentId);
        if (payment) {
          payment.status = "REFUNDED";
          payment.refundId = refundEntity?.id;
          payment.refundAmount = refundAmount;
          payment.updatedAt = new Date().toISOString();

          if (payment.bookingId) {
            const booking = db.rentalBookings.find((b) => b.id === payment.bookingId);
            if (booking) {
              booking.escrowStatus = "REFUNDED";
              booking.escrowRefundAmount = refundAmount;
              booking.updatedAt = new Date().toISOString();
            }
          }
        }
      }
    });

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("[Webhook Exception]:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}


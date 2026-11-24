import { NextRequest, NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { computeRefund } from "@/lib/payments/upi";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gate = await assertAdminSession();
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, damagePaise } = body;
  if (!["MARK_PAID", "REJECT", "INSPECT", "MARK_REFUNDED"].includes(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      const rental = await (prisma as any).rental.findUnique({ where: { id } });
      if (!rental) return NextResponse.json({ error: "Rental not found" }, { status: 404 });

      if (action === "MARK_PAID") {
        if (rental.status !== "CREATED" && rental.status !== "PENDING") {
          return NextResponse.json(
            { error: `Cannot mark paid: current status is ${rental.status}` },
            { status: 409 }
          );
        }
        const totalPaise = rental.rentPaise + rental.depositPaise;
        const updated = await (prisma as any).rental.update({
          where: { id },
          data: { status: "ACTIVE" },
        });
        await (prisma as any).ledgerEntry.create({
          data: { rentalId: id, event: "PAID", amountPaise: totalPaise },
        });
        return NextResponse.json({ success: true, rental: updated });
      }

      if (action === "REJECT") {
        if (rental.status !== "CREATED" && rental.status !== "PENDING") {
          return NextResponse.json(
            { error: `Cannot reject: current status is ${rental.status}` },
            { status: 409 }
          );
        }
        const updated = await (prisma as any).rental.update({
          where: { id },
          data: { status: "REJECTED" },
        });
        return NextResponse.json({ success: true, rental: updated });
      }

      if (action === "INSPECT") {
        if (rental.status !== "ACTIVE") {
          return NextResponse.json(
            { error: `Cannot inspect: rental must be ACTIVE (current: ${rental.status})` },
            { status: 409 }
          );
        }
        const dmg = Math.round(Number(damagePaise) || 0);
        if (dmg < 0 || dmg > rental.depositPaise) {
          return NextResponse.json(
            { error: `damagePaise must be 0–${rental.depositPaise}` },
            { status: 400 }
          );
        }
        const updated = await (prisma as any).rental.update({
          where: { id },
          data: { status: "INSPECT", damagePaise: dmg },
        });
        if (dmg > 0) {
          await (prisma as any).ledgerEntry.create({
            data: { rentalId: id, event: "DAMAGE", amountPaise: dmg },
          });
        }
        return NextResponse.json({ success: true, rental: updated });
      }

      if (action === "MARK_REFUNDED") {
        if (rental.status !== "INSPECT") {
          return NextResponse.json(
            { error: `Cannot refund: rental must be in INSPECT status (current: ${rental.status})` },
            { status: 409 }
          );
        }
        const dmg = rental.damagePaise ?? 0;
        let refund: number;
        try {
          refund = computeRefund(rental.depositPaise, dmg);
        } catch (e: any) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        const updated = await (prisma as any).rental.update({
          where: { id },
          data: { status: "REFUNDED" },
        });
        await (prisma as any).ledgerEntry.create({
          data: { rentalId: id, event: "REFUNDED", amountPaise: refund },
        });
        return NextResponse.json({ success: true, rental: updated, refundPaise: refund });
      }
    } catch (e: any) {
      console.error("[POST /api/admin/rentals/[id]] PG error:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // JSON store fallback
  const db = store.getDB() as any;
  if (!db.rentals) db.rentals = [];
  const idx = db.rentals.findIndex((r: any) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  const rental = db.rentals[idx];

  if (action === "MARK_PAID") {
    if (rental.status !== "CREATED" && rental.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot mark paid: current status is ${rental.status}` },
        { status: 409 }
      );
    }
    let updated: any = null;
    store.updateDB((currentDb: any) => {
      const target = (currentDb.rentals || []).find((r: any) => r.id === id);
      if (target) {
        target.status = "ACTIVE";
        updated = target;
      }
      if (!currentDb.ledger) currentDb.ledger = [];
      currentDb.ledger.push({
        id: randomUUID(),
        rentalId: id,
        event: "PAID",
        amountPaise: rental.totalPaise,
        createdAt: new Date().toISOString(),
      });
    });
    return NextResponse.json({ success: true, rental: updated || rental });
  }

  if (action === "REJECT") {
    if (rental.status !== "CREATED" && rental.status !== "PENDING") {
      return NextResponse.json(
        { error: `Cannot reject: current status is ${rental.status}` },
        { status: 409 }
      );
    }
    let updated: any = null;
    store.updateDB((currentDb: any) => {
      const target = (currentDb.rentals || []).find((r: any) => r.id === id);
      if (target) {
        target.status = "REJECTED";
        updated = target;
      }
    });
    return NextResponse.json({ success: true, rental: updated || rental });
  }

  if (action === "INSPECT") {
    if (rental.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `Cannot inspect: rental must be ACTIVE (current: ${rental.status})` },
        { status: 409 }
      );
    }
    const dmg = Math.round(Number(damagePaise) || 0);
    if (dmg < 0 || dmg > rental.depositPaise) {
      return NextResponse.json(
        { error: `damagePaise must be 0–${rental.depositPaise}` },
        { status: 400 }
      );
    }
    let updated: any = null;
    store.updateDB((currentDb: any) => {
      const target = (currentDb.rentals || []).find((r: any) => r.id === id);
      if (target) {
        target.status = "INSPECT";
        target.damagePaise = dmg;
        updated = target;
      }
      if (dmg > 0) {
        if (!currentDb.ledger) currentDb.ledger = [];
        currentDb.ledger.push({
          id: randomUUID(),
          rentalId: id,
          event: "DAMAGE",
          amountPaise: dmg,
          createdAt: new Date().toISOString(),
        });
      }
    });
    return NextResponse.json({ success: true, rental: updated || rental });
  }

  if (action === "MARK_REFUNDED") {
    if (rental.status !== "INSPECT") {
      return NextResponse.json(
        { error: `Cannot refund: rental must be in INSPECT status (current: ${rental.status})` },
        { status: 409 }
      );
    }
    const dmg = rental.damagePaise ?? 0;
    let refund: number;
    try {
      refund = computeRefund(rental.depositPaise, dmg);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    let updated: any = null;
    store.updateDB((currentDb: any) => {
      const target = (currentDb.rentals || []).find((r: any) => r.id === id);
      if (target) {
        target.status = "REFUNDED";
        updated = target;
      }
      if (!currentDb.ledger) currentDb.ledger = [];
      currentDb.ledger.push({
        id: randomUUID(),
        rentalId: id,
        event: "REFUNDED",
        amountPaise: refund,
        createdAt: new Date().toISOString(),
      });
    });
    return NextResponse.json({ success: true, rental: updated || rental, refundPaise: refund });
  }

  return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
}

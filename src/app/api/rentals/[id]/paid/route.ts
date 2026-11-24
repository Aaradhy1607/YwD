import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      const rental = await (prisma as any).rental.findUnique({ where: { id } });
      if (!rental) return NextResponse.json({ error: "Rental not found" }, { status: 404 });
      if (rental.userId && rental.userId !== userId && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (rental.status !== "CREATED") {
        return NextResponse.json(
          { error: `Cannot mark paid: status is ${rental.status}` },
          { status: 409 }
        );
      }

      const updated = await (prisma as any).rental.update({
        where: { id },
        data: { status: "PENDING" },
      });
      return NextResponse.json({ success: true, rental: updated });
    } catch (e: any) {
      console.error("[POST /api/rentals/[id]/paid] PG error:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // JSON store fallback
  const db = store.getDB() as any;
  const idx = (db.rentals || []).findIndex((r: any) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  const rental = db.rentals[idx];
  if (rental.userId && rental.userId !== userId && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (rental.status !== "CREATED") {
    return NextResponse.json({ error: `Cannot mark paid: status is ${rental.status}` }, { status: 409 });
  }

  let updatedRental: any = null;
  store.updateDB((currentDb: any) => {
    const target = (currentDb.rentals || []).find((r: any) => r.id === id);
    if (target) {
      target.status = "PENDING";
      updatedRental = target;
    }
  });

  return NextResponse.json({ success: true, rental: updatedRental || rental });
}

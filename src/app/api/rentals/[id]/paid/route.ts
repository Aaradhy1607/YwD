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
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      let rental: any;
      try {
        rental = await (prisma as any).rental.findUnique({ where: { id } });
      } catch (fetchErr: any) {
        const msg = String(fetchErr?.message || "").toLowerCase();
        if (msg.includes("user_id") || msg.includes("does not exist")) {
          const raw = await (prisma as any).$queryRawUnsafe(
            `SELECT "id", "item_id" as "itemId", "status" FROM "rentals" WHERE "id" = $1 LIMIT 1`,
            id
          );
          rental = (raw as any[])[0] || null;
          if (rental) rental.userId = userId;
        } else {
          throw fetchErr;
        }
      }

      if (!rental) return NextResponse.json({ error: "Rental not found" }, { status: 404 });

      // Backfill legacy PostgreSQL rental to verified owner before ownership check
      if (!rental.userId || rental.userId === "usr_default_demo") {
        if (session?.user?.name && rental.studentName === session.user.name && userId !== "usr_default_demo") {
          rental.userId = userId;
          try {
            await (prisma as any).rental.update({
              where: { id },
              data: { userId },
            });
          } catch {}
        } else {
          const matched = await prisma.user.findFirst({
            where: { name: rental.studentName, NOT: { id: "usr_default_demo" } },
          });
          if (matched) {
            rental.userId = matched.id;
            try {
              await (prisma as any).rental.update({
                where: { id },
                data: { userId: matched.id },
              });
            } catch {}
          }
        }
      }

      if (!rental.userId || rental.userId !== userId) {
        return NextResponse.json({ error: "Forbidden: You do not own this rental" }, { status: 403 });
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

  // Handle records without userId or assigned to shared demo in fallback store before ownership check
  if (!rental.userId || rental.userId === "usr_default_demo") {
    if (session?.user?.name && rental.studentName === session.user.name && userId !== "usr_default_demo") {
      rental.userId = userId;
      store.updateDB((currentDb: any) => {
        const target = (currentDb.rentals || []).find((r: any) => r.id === id);
        if (target) target.userId = userId;
      });
    } else {
      const matched = (db.users || []).find(
        (u: any) => u.name && u.name === rental.studentName && u.id !== "usr_default_demo"
      );
      if (matched) {
        rental.userId = matched.id;
        store.updateDB((currentDb: any) => {
          const target = (currentDb.rentals || []).find((r: any) => r.id === id);
          if (target) target.userId = matched.id;
        });
      }
    }
  }

  if (!rental.userId || rental.userId !== userId) {
    return NextResponse.json({ error: "Forbidden: You do not own this rental" }, { status: 403 });
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

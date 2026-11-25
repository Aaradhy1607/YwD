import { NextRequest, NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";

export async function GET(req: NextRequest) {
  const gate = await assertAdminSession();
  if (!gate.authorized) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // optional filter

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      const where = statusFilter ? { status: statusFilter } : {};
      const rentals = await (prisma as any).rental.findMany({
        where,
        include: {
          product: { select: { id: true, title: true } },
          ledgerEntries: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({
        rentals: rentals.map((r: any) => ({
          ...r,
          totalPaise: r.rentPaise + r.depositPaise,
          ledger: r.ledgerEntries || [],
        })),
      });
    } catch (e: any) {
      console.error("[GET /api/admin/rentals] PG error:", e);
    }
  }

  const db = store.getDB() as any;
  let rentals = db.rentals || [];
  if (statusFilter) rentals = rentals.filter((r: any) => r.status === statusFilter);
  return NextResponse.json({ rentals });
}

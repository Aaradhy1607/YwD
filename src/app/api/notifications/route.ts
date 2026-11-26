import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        const notifs = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(
          notifs.map((n) => ({
            ...n,
            createdAt: n.createdAt.toISOString(),
          }))
        );
      } catch (e) {
        console.warn("[Notifications] Postgres query failed:", e);
      }
    }

    const notifs = store.getDB().notifications.filter((n) => n.userId === userId);
    return NextResponse.json(notifs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const { notifId } = await req.json();

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        await prisma.notification.updateMany({
          where: { id: notifId, userId },
          data: { isRead: true },
        });
        return NextResponse.json({ success: true });
      } catch (e) {
        console.warn("[Notifications] Postgres update failed:", e);
      }
    }

    store.updateDB((db) => {
      const target = db.notifications.find((n) => n.id === notifId && n.userId === userId);
      if (target) {
        target.isRead = true;
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

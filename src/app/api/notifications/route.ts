import { NextRequest, NextResponse } from "next/server";
import { store } from "@/services/store";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const notifs = store.getDB().notifications.filter((n) => n.userId === userId);
    return NextResponse.json(notifs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";
    const { notifId } = await req.json();

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

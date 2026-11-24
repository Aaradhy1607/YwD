import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { sanitizeToAnonymousProfile } from "@/lib/privacy";

export async function GET(req: NextRequest) {
  try {
    let session: any = null;
    try {
      session = await auth();
    } catch {
      return NextResponse.json({ authenticated: false, user: null });
    }

    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: { anonymousProfile: true },
        });

        if (dbUser) {
          return NextResponse.json({
            authenticated: true,
            user: {
              id: dbUser.id,
              role: dbUser.role,
              anonymousProfile: sanitizeToAnonymousProfile(dbUser.anonymousProfile || dbUser),
            },
          });
        }
      } catch (e) {
        console.warn("[Auth Me] Postgres query failed, falling back to store:", e);
      }
    }

    const user = store.getDB().users.find((u) => u.id === userId);
    const profile = store.getDB().anonymousProfiles.find((p) => p.userId === userId);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId,
        role: user?.role || "USER",
        anonymousProfile: sanitizeToAnonymousProfile(profile || user),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

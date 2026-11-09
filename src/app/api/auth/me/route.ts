import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { store } from "@/services/store";
import { sanitizeToAnonymousProfile } from "@/lib/privacy";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const userId = session.user.id || "usr_default_demo";
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


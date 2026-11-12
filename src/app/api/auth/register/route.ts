import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { hashPassword, checkRateLimit, logAuditEvent } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { store } from "@/services/store";
import { generateAnonymousAlias, getRandomAvatarColor } from "@/lib/privacy";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const rateLimit = checkRateLimit(`register_${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);
    const normalizedEmail = validated.email.toLowerCase().trim();

    const isPg = await store.checkPostgres();
    if (isPg) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 400 }
          );
        }

        const hashedPassword = hashPassword(validated.password);
        const alias = generateAnonymousAlias();
        const avatarColor = getRandomAvatarColor();
        const campusHub = validated.campusHub || "North Campus Central Hub • Block B";

        const newUser = await prisma.user.create({
          data: {
            name: validated.name || "Verified Member",
            email: normalizedEmail,
            passwordHash: hashedPassword,
            role: "USER",
            anonymousProfile: {
              create: {
                alias,
                avatarColor,
                bio: "Active verified renter & circular recommerce participant.",
                trustScore: 99.0,
                completedRentals: 0,
                isVerified: true,
                campusHub,
              },
            },
          },
          include: { anonymousProfile: true },
        });

        await prisma.notification.create({
          data: {
            userId: newUser.id,
            title: "Welcome to YwD Marketplace",
            message: `Your anonymous identity has been provisioned as ${alias}. Your private phone & email are strictly shielded from counterparties.`,
            type: "SYSTEM",
            link: "/dashboard?tab=privacy",
          },
        });

        await logAuditEvent({
          userId: newUser.id,
          action: "USER_REGISTER",
          resource: "users",
          metadata: { alias },
          ipAddress: ip,
        });

        return NextResponse.json(
          {
            message: "Registration successful. You can now sign in.",
            user: {
              id: newUser.id,
              alias,
              avatarColor,
              campusHub,
              trustScore: 99.0,
            },
          },
          { status: 201 }
        );
      } catch (e: any) {
        if (e.code === "P2002") {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 400 }
          );
        }
        console.warn("[Register Service] Postgres insert failed, falling back to store:", e);
      }
    }

    store.assertProductionDatabase();

    // Check if email already registered in store
    const existing = store.getDB().users.find((u) => u.email === normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const hashedPassword = hashPassword(validated.password);

    const newUser = {
      id: userId,
      name: validated.name || "Verified Member",
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProfile = {
      id: `prof_${userId}`,
      userId,
      alias: generateAnonymousAlias(),
      avatarColor: getRandomAvatarColor(),
      bio: "Active verified renter & circular recommerce participant.",
      trustScore: 99.0,
      completedRentals: 0,
      isVerified: true,
      campusHub: validated.campusHub || "North Campus Central Hub • Block B",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.updateDB((db) => {
      db.users.push(newUser);
      db.anonymousProfiles.push(newProfile);

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: "Welcome to YwD Marketplace",
        message: `Your anonymous identity has been provisioned as ${newProfile.alias}. Your private phone & email are strictly shielded from counterparties.`,
        type: "SYSTEM",
        link: "/dashboard?tab=privacy",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    await logAuditEvent({
      userId,
      action: "USER_REGISTER",
      resource: "users",
      metadata: { alias: newProfile.alias },
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        message: "Registration successful. You can now sign in.",
        user: {
          id: userId,
          alias: newProfile.alias,
          avatarColor: newProfile.avatarColor,
          campusHub: newProfile.campusHub,
          trustScore: newProfile.trustScore,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Register Error]:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}

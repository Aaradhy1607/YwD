import { prisma } from "./prisma";
import { store } from "@/services/store";
import { generateAnonymousAlias, getRandomAvatarColor } from "./privacy";
import { logAuditEvent } from "./security";

export interface GoogleOAuthProfile {
  email?: string | null;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
}

export interface GoogleOAuthAccount {
  provider: string;
  providerAccountId: string;
  type?: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: unknown;
}

export interface SyncGoogleUserResult {
  allowed: boolean;
  userId?: string;
  reason?: string;
}

const DEFAULT_CAMPUS_HUB = "North Campus Central Hub • Block B";
const DEFAULT_BIO = "Active verified renter & circular recommerce participant.";

/**
 * Resolves, links, or provisions a YwD user for a Google OAuth sign-in.
 * Prevents duplicate accounts by matching on (provider, providerAccountId)
 * first, then safely linking by verified email address.
 */
export async function syncGoogleUser(
  profile: GoogleOAuthProfile,
  account: GoogleOAuthAccount
): Promise<SyncGoogleUserResult> {
  const email = profile.email?.toLowerCase().trim();
  if (!email) {
    return { allowed: false, reason: "Missing email address from Google profile." };
  }

  if (profile.emailVerified === false) {
    return { allowed: false, reason: "Google email address is not verified." };
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    try {
      // 1. Returning Google user: look up by (provider, providerAccountId)
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        include: {
          user: {
            include: { anonymousProfile: true },
          },
        },
      });

      if (existingAccount?.user) {
        const dbUser = existingAccount.user;

        // Refresh OAuth tokens on the linked Account record
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            refresh_token: account.refresh_token ?? existingAccount.refresh_token,
            access_token: account.access_token ?? existingAccount.access_token,
            expires_at: account.expires_at ?? existingAccount.expires_at,
            token_type: account.token_type ?? existingAccount.token_type,
            scope: account.scope ?? existingAccount.scope,
            id_token: account.id_token ?? existingAccount.id_token,
          },
        });

        // Backfill missing user fields & anonymous profile if needed
        const userUpdates: Record<string, any> = {};
        if (!dbUser.emailVerified) userUpdates.emailVerified = new Date();
        if (!dbUser.image && profile.image) userUpdates.image = profile.image;
        if (!dbUser.name && profile.name) userUpdates.name = profile.name;

        if (Object.keys(userUpdates).length > 0) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: userUpdates,
          });
        }

        if (!dbUser.anonymousProfile) {
          await prisma.anonymousProfile.create({
            data: {
              userId: dbUser.id,
              alias: generateAnonymousAlias(),
              avatarColor: getRandomAvatarColor(),
              bio: DEFAULT_BIO,
              trustScore: 99.0,
              completedRentals: 0,
              isVerified: true,
              campusHub: DEFAULT_CAMPUS_HUB,
            },
          });
        }

        await logAuditEvent({
          userId: dbUser.id,
          action: "USER_LOGIN_SUCCESS",
          resource: "auth",
          metadata: { email: dbUser.email, provider: "google" },
        });

        return { allowed: true, userId: dbUser.id };
      }

      // 2. Existing user by verified email (e.g., registered via email/password): link Google account
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: { anonymousProfile: true },
      });

      if (dbUser) {
        await prisma.account.create({
          data: {
            userId: dbUser.id,
            type: account.type || "oauth",
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state:
              typeof account.session_state === "string" ? account.session_state : null,
          },
        });

        const userUpdates: Record<string, any> = {};
        if (!dbUser.emailVerified) userUpdates.emailVerified = new Date();
        if (!dbUser.image && profile.image) userUpdates.image = profile.image;
        if (!dbUser.name && profile.name) userUpdates.name = profile.name;

        if (Object.keys(userUpdates).length > 0) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: userUpdates,
          });
        }

        if (!dbUser.anonymousProfile) {
          await prisma.anonymousProfile.create({
            data: {
              userId: dbUser.id,
              alias: generateAnonymousAlias(),
              avatarColor: getRandomAvatarColor(),
              bio: DEFAULT_BIO,
              trustScore: 99.0,
              completedRentals: 0,
              isVerified: true,
              campusHub: DEFAULT_CAMPUS_HUB,
            },
          });
        }

        await logAuditEvent({
          userId: dbUser.id,
          action: "USER_LOGIN_SUCCESS",
          resource: "auth",
          metadata: { email: dbUser.email, provider: "google", linkedExisting: true },
        });

        return { allowed: true, userId: dbUser.id };
      }

      // 3. First-time Google user: create User, AnonymousProfile, Account, and welcome notification
      const alias = generateAnonymousAlias();
      const avatarColor = getRandomAvatarColor();

      dbUser = await prisma.user.create({
        data: {
          name: profile.name || "Verified Member",
          email,
          image: profile.image || null,
          emailVerified: new Date(),
          role: "USER",
          anonymousProfile: {
            create: {
              alias,
              avatarColor,
              bio: DEFAULT_BIO,
              trustScore: 99.0,
              completedRentals: 0,
              isVerified: true,
              campusHub: DEFAULT_CAMPUS_HUB,
            },
          },
          accounts: {
            create: {
              type: account.type || "oauth",
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token ?? null,
              access_token: account.access_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state:
                typeof account.session_state === "string" ? account.session_state : null,
            },
          },
        },
        include: { anonymousProfile: true },
      });

      await prisma.notification.create({
        data: {
          userId: dbUser.id,
          title: "Welcome to YwD Marketplace",
          message: `Your anonymous identity has been provisioned as ${alias}. Your private phone & email are strictly shielded from counterparties.`,
          type: "SYSTEM",
          link: "/dashboard?tab=privacy",
        },
      });

      await logAuditEvent({
        userId: dbUser.id,
        action: "USER_REGISTER",
        resource: "users",
        metadata: { alias, provider: "google" },
      });

      return { allowed: true, userId: dbUser.id };
    } catch (err) {
      console.error("[Google Auth] Postgres sync failed:", err);
      return { allowed: false, reason: "Failed to sync Google account with database." };
    }
  }

  // Fallback for local development without PostgreSQL
  store.assertProductionDatabase();

  let devUser = store.getDB().users.find((u) => u.email === email);
  if (!devUser) {
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const alias = generateAnonymousAlias();
    const avatarColor = getRandomAvatarColor();

    devUser = {
      id: userId,
      name: profile.name || "Verified Member",
      email,
      image: profile.image || null,
      emailVerified: new Date().toISOString(),
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const devProfile = {
      id: `prof_${userId}`,
      userId,
      alias,
      avatarColor,
      bio: DEFAULT_BIO,
      trustScore: 99.0,
      completedRentals: 0,
      isVerified: true,
      campusHub: DEFAULT_CAMPUS_HUB,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.updateDB((db) => {
      db.users.push(devUser);
      db.anonymousProfiles.push(devProfile);
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: "Welcome to YwD Marketplace",
        message: `Your anonymous identity has been provisioned as ${alias}. Your private phone & email are strictly shielded from counterparties.`,
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
      metadata: { alias, provider: "google" },
    });
  } else {
    await logAuditEvent({
      userId: devUser.id,
      action: "USER_LOGIN_SUCCESS",
      resource: "auth",
      metadata: { email: devUser.email, provider: "google" },
    });
  }

  return { allowed: true, userId: devUser.id };
}

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

export type GoogleSyncErrorCode =
  | "MISSING_EMAIL"
  | "EMAIL_UNVERIFIED"
  | "DATABASE_UNAVAILABLE"
  | "DATABASE_SCHEMA_ERROR"
  | "OAUTH_SYNC_ERROR";

export interface SyncGoogleUserResult {
  allowed: boolean;
  userId?: string;
  reason?: string;
  errorCode?: GoogleSyncErrorCode;
}

const DEFAULT_CAMPUS_HUB = "North Campus Central Hub • Block B";
const DEFAULT_BIO = "Active verified renter & circular recommerce participant.";

const PRISMA_UNAVAILABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);
const PRISMA_SCHEMA_CODES = new Set(["P2021", "P2022"]);

function normalizeExpiresAt(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const intVal = Math.floor(value);
  return intVal > 0 && intVal <= 2147483647 ? intVal : null;
}

function getUniqueTargets(err: any): string[] {
  const target = err?.meta?.target;
  if (Array.isArray(target)) return target.map(String);
  if (typeof target === "string") return [target];
  return [];
}

async function createAnonymousProfileWithRetry(userId: string): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.anonymousProfile.create({
        data: {
          userId,
          alias: generateAnonymousAlias(),
          avatarColor: getRandomAvatarColor(),
          bio: DEFAULT_BIO,
          trustScore: 99.0,
          completedRentals: 0,
          isVerified: true,
          campusHub: DEFAULT_CAMPUS_HUB,
        },
      });
      return;
    } catch (err: any) {
      if (err?.code === "P2002") {
        const targets = getUniqueTargets(err);
        if (targets.includes("userId")) return;
        if (targets.includes("alias") && attempt < 2) continue;
      }
      throw err;
    }
  }
}

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
    console.warn("[Google Auth] Rejected sign-in: missing email on Google profile.", {
      provider: account.provider,
    });
    return {
      allowed: false,
      errorCode: "MISSING_EMAIL",
      reason: "Missing email address from Google profile.",
    };
  }

  if (profile.emailVerified === false) {
    console.warn("[Google Auth] Rejected sign-in: Google email is not verified.", {
      provider: account.provider,
    });
    return {
      allowed: false,
      errorCode: "EMAIL_UNVERIFIED",
      reason: "Google email address is not verified.",
    };
  }

  if (!account.providerAccountId) {
    console.error("[Google Auth] Missing providerAccountId from Google OAuth callback.");
    return {
      allowed: false,
      errorCode: "OAUTH_SYNC_ERROR",
      reason: "Missing Google account identifier.",
    };
  }

  const isPg = await store.checkPostgres();

  if (isPg) {
    let step = "findAccount";
    const expiresAt = normalizeExpiresAt(account.expires_at);
    const sessionState =
      typeof account.session_state === "string" ? account.session_state : null;

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

        step = "updateAccount";
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            refresh_token: account.refresh_token ?? existingAccount.refresh_token,
            access_token: account.access_token ?? existingAccount.access_token,
            expires_at: expiresAt ?? existingAccount.expires_at,
            token_type: account.token_type ?? existingAccount.token_type,
            scope: account.scope ?? existingAccount.scope,
            id_token: account.id_token ?? existingAccount.id_token,
          },
        });

        step = "updateReturningUser";
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
          step = "backfillProfile";
          await createAnonymousProfileWithRetry(dbUser.id);
        }

        try {
          await logAuditEvent({
            userId: dbUser.id,
            action: "USER_LOGIN_SUCCESS",
            resource: "auth",
            metadata: { provider: "google" },
          });
        } catch {}

        return { allowed: true, userId: dbUser.id };
      }

      // 2. Existing user by verified email (e.g., registered via email/password): link Google account
      step = "findUserByEmail";
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: { anonymousProfile: true },
      });

      const linkAccountToUser = async (targetUser: any) => {
        step = "linkAccount";
        try {
          await prisma.account.create({
            data: {
              userId: targetUser.id,
              type: account.type || "oauth",
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token ?? null,
              access_token: account.access_token ?? null,
              expires_at: expiresAt,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state: sessionState,
            },
          });
        } catch (linkErr: any) {
          if (linkErr?.code !== "P2002") {
            throw linkErr;
          }
        }

        step = "updateLinkedUser";
        const userUpdates: Record<string, any> = {};
        if (!targetUser.emailVerified) userUpdates.emailVerified = new Date();
        if (!targetUser.image && profile.image) userUpdates.image = profile.image;
        if (!targetUser.name && profile.name) userUpdates.name = profile.name;

        if (Object.keys(userUpdates).length > 0) {
          await prisma.user.update({
            where: { id: targetUser.id },
            data: userUpdates,
          });
        }

        if (!targetUser.anonymousProfile) {
          step = "backfillLinkedProfile";
          await createAnonymousProfileWithRetry(targetUser.id);
        }

        try {
          await logAuditEvent({
            userId: targetUser.id,
            action: "USER_LOGIN_SUCCESS",
            resource: "auth",
            metadata: { provider: "google", linkedExisting: true },
          });
        } catch {}

        return { allowed: true, userId: targetUser.id } as SyncGoogleUserResult;
      };

      if (dbUser) {
        return await linkAccountToUser(dbUser);
      }

      // 3. First-time Google user: create User, AnonymousProfile, Account, and welcome notification
      step = "createUser";
      let createdAlias = generateAnonymousAlias();
      for (let attempt = 0; attempt < 3; attempt++) {
        createdAlias = generateAnonymousAlias();
        const avatarColor = getRandomAvatarColor();
        try {
          dbUser = await prisma.user.create({
            data: {
              name: profile.name || "Verified Member",
              email,
              image: profile.image || null,
              emailVerified: new Date(),
              role: "USER",
              anonymousProfile: {
                create: {
                  alias: createdAlias,
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
                  expires_at: expiresAt,
                  token_type: account.token_type ?? null,
                  scope: account.scope ?? null,
                  id_token: account.id_token ?? null,
                  session_state: sessionState,
                },
              },
            },
            include: { anonymousProfile: true },
          });
          break;
        } catch (createErr: any) {
          if (createErr?.code === "P2002") {
            const targets = getUniqueTargets(createErr);
            if (targets.includes("email")) {
              const racedUser = await prisma.user.findUnique({
                where: { email },
                include: { anonymousProfile: true },
              });
              if (racedUser) {
                return await linkAccountToUser(racedUser);
              }
            }
            if (targets.includes("alias") && attempt < 2) {
              continue;
            }
          }
          throw createErr;
        }
      }

      if (!dbUser) {
        throw new Error("Failed to provision user record after retries.");
      }

      try {
        await prisma.notification.create({
          data: {
            userId: dbUser.id,
            title: "Welcome to YwD Marketplace",
            message: `Your anonymous identity has been provisioned as ${createdAlias}. Your private phone & email are strictly shielded from counterparties.`,
            type: "SYSTEM",
            link: "/dashboard?tab=privacy",
          },
        });
      } catch (notifErr: any) {
        console.warn(
          "[Google Auth] Non-critical welcome notification failed:",
          notifErr?.code || notifErr?.message
        );
      }

      try {
        await logAuditEvent({
          userId: dbUser.id,
          action: "USER_REGISTER",
          resource: "users",
          metadata: { alias: createdAlias, provider: "google" },
        });
      } catch {}

      return { allowed: true, userId: dbUser.id };
    } catch (err: any) {
      const code = err?.code || "UNKNOWN";
      console.error("[Google Auth] Postgres sync failed:", {
        step,
        code,
        name: err?.name || "Error",
        metaTarget: err?.meta?.target,
        message: err?.message || "Unknown database error",
      });

      if (PRISMA_SCHEMA_CODES.has(code)) {
        return {
          allowed: false,
          errorCode: "DATABASE_SCHEMA_ERROR",
          reason: "Database schema is out of sync with Prisma models.",
        };
      }

      if (PRISMA_UNAVAILABLE_CODES.has(code)) {
        return {
          allowed: false,
          errorCode: "DATABASE_UNAVAILABLE",
          reason: "Database connection failed during Google sign-in.",
        };
      }

      return {
        allowed: false,
        errorCode: "OAUTH_SYNC_ERROR",
        reason: "Failed to sync Google account with database.",
      };
    }
  }

  // Fallback for local development without PostgreSQL
  try {
    store.assertProductionDatabase();
  } catch (dbErr: any) {
    console.error("[Google Auth] Production database unavailable during Google sign-in:", {
      message: dbErr?.message || "DATABASE_UNAVAILABLE",
    });
    return {
      allowed: false,
      errorCode: "DATABASE_UNAVAILABLE",
      reason: "Database is currently unavailable.",
    };
  }

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

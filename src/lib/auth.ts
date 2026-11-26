import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { store } from "@/services/store";
import { generateAnonymousAlias, getRandomAvatarColor } from "./privacy";
import { verifyPassword, checkRateLimit, logAuditEvent } from "./security";
import { syncGoogleUser } from "./google-auth";

const isGoogleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET &&
  !process.env.AUTH_GOOGLE_ID.includes("placeholder") &&
  !process.env.AUTH_GOOGLE_SECRET.includes("placeholder") &&
  !process.env.AUTH_GOOGLE_ID.includes("your-google")
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(isGoogleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Rate limit login attempts per email (max 5 per minute)
        const rateLimit = checkRateLimit(`login_${email}`, 5, 60000);
        if (!rateLimit.allowed) {
          throw new Error("Too many login attempts. Please wait 1 minute before trying again.");
        }

        let user: any = null;
        const isPg = await store.checkPostgres();
        if (isPg) {
          try {
            user = await prisma.user.findUnique({
              where: { email },
              include: { anonymousProfile: true },
            });
          } catch (e) {
            console.warn("[Auth] Postgres lookup failed, checking store fallback:", e);
          }
        }

        if (!user) {
          user = store.getDB().users.find((u) => u.email === email);
        }

        if (!user) {
          return null;
        }

        // Cryptographic password verification
        if (user.passwordHash) {
          const isValid = verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return null;
          }
        } else if (
          process.env.NODE_ENV !== "production" &&
          email === "demo@ywd.in" &&
          password === "demo1234"
        ) {
          // Allow fallback only for non-production demo account
        } else {
          return null;
        }

        await logAuditEvent({
          userId: user.id,
          action: "USER_LOGIN_SUCCESS",
          resource: "auth",
          metadata: { email: user.email },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
    Credentials({
      id: "demo-login",
      name: "Evaluation Demo Account",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = ((credentials?.email as string) || "demo@ywd.in").toLowerCase().trim();

        // Security Guard: Prohibit administrative accounts from passwordless login
        if (email === "admin@ywd.in" || email.includes("admin")) {
          throw new Error("Administrative accounts cannot use passwordless demo login.");
        }

        // Security Guard: In production, passwordless demo login is disabled unless explicitly enabled
        if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_LOGIN !== "true") {
          throw new Error("Passwordless demo login is disabled in production.");
        }

        let user: any = null;

        const isPg = await store.checkPostgres();
        if (isPg) {
          try {
            user = await prisma.user.findUnique({
              where: { email },
              include: { anonymousProfile: true },
            });
          } catch {}
        }

        if (!user) {
          user = store.getDB().users.find((u) => u.email === email);
        }

        // Double check: if user has ADMIN role, reject passwordless login
        if (user && user.role === "ADMIN") {
          throw new Error("Administrative accounts cannot use passwordless demo login.");
        }

        if (!user) {
          user = {
            id: `usr_${Date.now()}`,
            name: "Verified Student",
            email,
            role: "USER",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const anonymousProfile = {
            id: `prof_${Date.now()}`,
            userId: user.id,
            alias: generateAnonymousAlias(),
            avatarColor: getRandomAvatarColor(),
            bio: "Active verified renter & circular recommerce participant.",
            trustScore: 99.0,
            completedRentals: 0,
            isVerified: true,
            campusHub: "Central Logistics Hub • Locker Zone A",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          store.updateDB((db) => {
            db.users.push(user);
            db.anonymousProfiles.push(anonymousProfile);
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const result = await syncGoogleUser(
          {
            email: user.email || (profile as any)?.email,
            name: user.name || (profile as any)?.name,
            image: user.image || (profile as any)?.picture,
            emailVerified: (profile as any)?.email_verified,
          },
          {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          }
        );

        if (!result.allowed || !result.userId) {
          return false;
        }

        // Bind YwD database user.id so jwt() stores it in token.sub
        user.id = result.userId;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = (token.sub as string) || "usr_default_demo";
        session.user.id = userId;

        let dbUser: any = null;
        const isPg = await store.checkPostgres();
        if (isPg) {
          try {
            dbUser = await prisma.user.findUnique({
              where: { id: userId },
              include: { anonymousProfile: true },
            });
          } catch {}
        }

        if (!dbUser) {
          dbUser = store.getDB().users.find((u) => u.id === userId);
        }

        (session.user as any).role = dbUser?.role || "USER";

        // Attach anonymous public identity (strips PII from client)
        const profile =
          dbUser?.anonymousProfile ||
          store.getDB().anonymousProfiles.find((p) => p.userId === userId) || {
            alias: "EcoRenter-4912",
            avatarColor: "#18352D",
            trustScore: 99.2,
            completedRentals: 19,
            isVerified: true,
            campusHub: "Central Verified Locker • Hub A",
          };

        (session.user as any).anonymousProfile = profile;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "default_development_secret_32_characters_long",
});

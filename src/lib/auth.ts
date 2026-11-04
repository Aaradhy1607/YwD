import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { store } from "@/services/store";
import { generateAnonymousAlias, getRandomAvatarColor } from "./privacy";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      id: "demo-login",
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || "demo@ywd.in";
        let user = store.getDB().users.find((u) => u.email === email);

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
    async session({ session, token }) {
      if (session.user) {
        const userId = (token.sub as string) || "usr_default_demo";
        session.user.id = userId;

        // Attach anonymous public identity
        const profile = store.getDB().anonymousProfiles.find((p) => p.userId === userId) || {
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

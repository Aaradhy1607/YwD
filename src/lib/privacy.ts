/**
 * Strict Privacy & Anonymity Engine for YwD
 * Ensures zero PII (Personally Identifiable Information) is ever leaked
 * between counterparties, listings, reviews, relay chat, or public API responses.
 */

const ADJECTIVES = [
  "Eco",
  "Campus",
  "Smart",
  "Loop",
  "Green",
  "Urban",
  "Prime",
  "Solar",
  "Peer",
  "Swift",
  "Active",
  "Verified",
  "Nexus",
  "Circular",
  "Vault",
];

const NOUNS = [
  "Renter",
  "Lender",
  "Member",
  "Keeper",
  "Peer",
  "Scholar",
  "Creator",
  "Explorer",
  "Guardian",
  "Partner",
  "Trader",
  "Curator",
];

const AVATAR_COLORS = [
  "#18352D", // Deep Forest
  "#C46A42", // Burnt Orange
  "#789681", // Soft Sage
  "#A64F45", // Terracotta
  "#202522", // Deep Charcoal
  "#234C40", // Forest Light
  "#A8532F", // Orange Dark
];

/**
 * Generates an anonymous, neutral public alias.
 * Example: "EcoRenter-4821", "CampusKeeper-9104"
 */
export function generateAnonymousAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${noun}-${num}`;
}

/**
 * Picks a consistent neutral avatar brand tint.
 */
export function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export interface PublicAnonymousUser {
  id: string;
  alias: string;
  avatarColor: string;
  bio?: string | null;
  trustScore: number;
  completedRentals: number;
  isVerified: boolean;
  campusHub: string;
}

/**
 * Sanitizes any raw user object into a strict public anonymous representation.
 * Real names, personal emails, phone numbers, and private avatars are completely stripped.
 */
export function sanitizeToAnonymousProfile(user: any): PublicAnonymousUser {
  if (!user) {
    return {
      id: "unknown",
      alias: "AnonymousPeer-0000",
      avatarColor: "#18352D",
      trustScore: 98.0,
      completedRentals: 0,
      isVerified: true,
      campusHub: "Central Verified Locker • Hub A",
    };
  }

  const profile = user.anonymousProfile || user;
  const alias =
    profile.alias ||
    (profile.userId ? `PeerUser-${profile.userId.slice(-4)}` : "VerifiedPeer");

  return {
    id: user.id || profile.userId || "anonymous-id",
    alias: alias,
    avatarColor: profile.avatarColor || "#18352D",
    bio: profile.bio || "Active participant in YwD circular recommerce.",
    trustScore: typeof profile.trustScore === "number" ? profile.trustScore : 99.0,
    completedRentals: profile.completedRentals || 0,
    isVerified: profile.isVerified ?? true,
    campusHub: profile.campusHub || "Central Verified Locker • Hub A",
  };
}

/**
 * Sanitizes product objects so that the owner's identity is strictly anonymous.
 */
export function sanitizeProductForPublic<T extends { owner?: any;[key: string]: any }>(
  product: T
): Omit<T, "owner"> & { owner: PublicAnonymousUser } {
  const { owner, ...rest } = product;
  return {
    ...rest,
    owner: sanitizeToAnonymousProfile(owner),
  } as any;
}

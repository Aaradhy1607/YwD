import crypto from "crypto";

/**
 * Enterprise-grade Password Security using Node.js Native scrypt.
 * Stores format: salt:derivedKey (Hex encoded)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Timing-safe verification of plaintext password against stored scrypt hash.
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!password || !combinedHash) return false;
  const parts = combinedHash.split(":");
  if (parts.length !== 2) return false;

  const [salt, key] = parts;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure 6-digit OTP code.
 */
export function generateSecureOTP(): string {
  const code = crypto.randomInt(100000, 999999);
  return code.toString();
}

/**
 * In-Memory sliding-window rate limiter for sensitive operations
 * (login attempts, registration, OTP verification).
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    retryAfterMs: 0,
  };
}

/**
 * Structured Security Audit Logger.
 * Records security-sensitive operations for compliance, traceability and forensics.
 */
export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}) {
  const record = {
    id: `audit_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    userId: params.userId || "anonymous",
    action: params.action,
    resource: params.resource,
    metadata: params.metadata || {},
    ipAddress: params.ipAddress || "local",
    createdAt: new Date().toISOString(),
  };

  try {
    const { store } = await import("@/services/store");
    store.updateDB((db) => {
      if (!(db as any).auditLogs) {
        (db as any).auditLogs = [];
      }
      (db as any).auditLogs.unshift(record);
    });
  } catch {}

  if (process.env.NODE_ENV !== "test") {
    console.log(
      `[SECURITY AUDIT] ${record.createdAt} | Action: ${params.action} | Resource: ${params.resource} | User: ${params.userId}`
    );
  }

  return record;
}

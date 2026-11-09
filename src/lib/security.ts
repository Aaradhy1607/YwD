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
 * In-Memory sliding-window rate limiter with memory hygiene.
 * Supports distributed extension via UPSTASH_REDIS_REST_URL if configured.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();

  // Periodic eviction to prevent unbounded memory growth in production
  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

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
 * Distributed rate limiter hook for multi-region serverless deployment.
 * Uses Upstash REST API if UPSTASH_REDIS_REST_URL is configured, else falls back to memory limiter.
 */
export async function checkDistributedRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const windowSec = Math.ceil(windowMs / 1000);
      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", `rl:${key}`],
          ["EXPIRE", `rl:${key}`, windowSec, "NX"],
          ["TTL", `rl:${key}`],
        ]),
      });
      if (res.ok) {
        const results = await res.json();
        const currentCount = Number(results[0]?.result || 1);
        const ttlSec = Number(results[2]?.result || windowSec);
        if (currentCount > maxAttempts) {
          return { allowed: false, remaining: 0, retryAfterMs: ttlSec * 1000 };
        }
        return { allowed: true, remaining: Math.max(0, maxAttempts - currentCount), retryAfterMs: 0 };
      }
    } catch (e) {
      console.warn("[Distributed Rate Limiter] Redis unreachable, falling back to local memory:", e);
    }
  }

  return checkRateLimit(key, maxAttempts, windowMs);
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

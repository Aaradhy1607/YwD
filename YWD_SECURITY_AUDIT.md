# YwD — Application Security & Threat Assessment

**Date:** November 11, 2026  
**Auditor:** Application Security & Reliability Review Team  
**Scope:** Full-stack architecture, NextAuth v5, API handlers, OTP cryptography, Razorpay webhooks, and data privacy  

---

## 1. Vulnerability Findings & Severity Matrix

| ID | Category | Vulnerability / Concern | Severity | Status | Remediation Result |
|---|---|---|---|---|---|
| **SEC-01** | Broken Access Control | Unauthenticated Fallback in API Mutations (`POST /api/products`, `POST /api/bookings`) | **HIGH** | **RESOLVED** | Removed hardcoded demo fallback; strictly return `401 Unauthorized` when unauthenticated. |
| **SEC-02** | Data Leakage / PII | Ephemeral Local Store `.dev-db.json` on disk | **MEDIUM** | **RESOLVED** | Production traffic strictly routed through hosted Neon PostgreSQL; disk fallback throws in production. |
| **SEC-03** | Brute Force / OTP | Plaintext 6-digit OTPs without attempt rate limiting | **MEDIUM** | **RESOLVED** | Cryptographically random `crypto.randomInt(100000, 999999)` with rate-limiting and state transitions. |
| **SEC-04** | Authorization / IDOR | Direct listing modifications without ownership checks in DB | **HIGH** | **RESOLVED** | Enforced `product.ownerId === session.user.id` checks across database mutations. |
| **SEC-05** | Cryptographic Signatures | Razorpay Dev Signature Bypass in production | **MEDIUM** | **RESOLVED** | Dev bypass strictly blocked in `NODE_ENV === "production"`; production requires real HMAC-SHA256 verification. |
| **SEC-06** | Privilege Escalation | Absence of server-side role check for administrative tasks | **HIGH** | **RESOLVED** | Created role-gated `/admin` and `/api/admin` endpoints requiring `session.user.role === 'ADMIN'`. Blocked demo login from admin accounts. |
| **SEC-07** | Injection & XSS | HTML / script injection in user-generated descriptions & reviews | **LOW** | **VERIFIED SAFE** | React 19 / JSX auto-escapes rendered text; Zod schemas enforce string length bounds. |
| **SEC-08** | SSRF / Media Upload | Unrestricted image upload proxying | **LOW** | **VERIFIED SAFE** | Cloudinary upload validates MIME types (JPEG, PNG, WEBP, AVIF) and enforces a 5MB payload ceiling. |
| **SEC-09** | Default Admin Credentials | Publicly disclosed default admin credentials in seed / code | **CRITICAL** | **RESOLVED** | Password rotated in Neon DB via `scripts/provision-admin.js`. Removed hardcoded credentials from code, seed, and docs. |
| **SEC-10** | Crypto Timing Safe Crash | `timingSafeEqual` length mismatch throwing unhandled error | **HIGH** | **RESOLVED** | Added explicit buffer length checks before `crypto.timingSafeEqual` in `src/lib/razorpay.ts`. |

---

## 2. Deep Dive Analysis

### 2.1 SEC-01: Unauthenticated API Fallbacks
In `src/app/api/products/route.ts`:
```typescript
const session = await auth();
const userId = session?.user?.id || "usr_default_demo";
```
An attacker could invoke `POST /api/products` without any authentication cookies, creating listings under the demo user's identity.

**Required Fix:**
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
}
```

### 2.2 SEC-03: OTP Verification Security & Rate Limiting
The 6-digit OTP provides a search space of $10^6$ combinations. Without attempt counters, an automated script could brute-force the return code in minutes.

**Required Fix:**
- Add an attempt counter (`otpAttempts`) or rate-limit `POST /api/bookings/handover` and `POST /api/bookings/return` to 3 failed attempts per 15 minutes per booking ID.
- Generate OTPs using `crypto.randomInt(100000, 999999)` instead of `Math.random()`.

### 2.3 SEC-04: Peer Privacy & Identity Shielding
The core privacy guarantee of YwD is that students never expose personal phone numbers, email addresses, or hostel room numbers to counterparties:
- Verified: `src/lib/privacy.ts` actively masks author real names into deterministic pseudonyms (e.g., `EcoRenter-4912`).
- Verified: `src/services/message.service.ts` includes regex scrubbing for email addresses and phone numbers.
- Improvement: Ensure that `GET /api/products/[id]` and `GET /api/bookings` never serialize `User.email` or `User.phone` in server responses.

---

## 3. Cryptographic and Password Verification
- Passwords are encrypted using native Node.js `scrypt` with a cryptographically secure 16-byte random salt and 64-byte key length:
  $$\text{DerivedKey} = \text{scrypt}(\text{password}, \text{salt}, 64)$$
- Verification employs `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
- Razorpay webhook verification uses HMAC-SHA256 with `crypto.timingSafeEqual`.


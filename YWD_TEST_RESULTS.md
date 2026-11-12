# YwD — Automated Test Results & Verification Evidence

**Test Framework:** Vitest 2.1.9 with JSDOM Environment  
**Execution Timestamp:** 2026-11-11  
**Total Test Files:** 7  
**Total Test Cases:** 39  
**Test Pass Rate:** **100% (39 / 39 Passing)**  

---

## 1. Automated Vitest Suite Breakdown

```
 RUN  v2.1.9 C:/Users/aarad/OneDrive/Desktop/YwD

 ✓ src/__tests__/listings_and_disputes.test.ts (7 tests)
 ✓ src/__tests__/auth_and_security.test.ts (5 tests)
 ✓ src/__tests__/rental_and_booking_lifecycle.test.ts (3 tests)
 ✓ src/__tests__/marketplace.test.ts (9 tests)
 ✓ src/__tests__/production_concurrency_and_security.test.ts (4 tests)
 ✓ src/__tests__/database_persistence_and_integrity.test.ts (7 tests)
 ✓ src/__tests__/payments_and_webhooks.test.ts (4 tests)

 Test Files  7 passed (7)
      Tests  39 passed (39)
   Duration  2.83s
```

### Detailed Test Specifications

#### Test Suite 1: `auth_and_security.test.ts` (5 Tests)
- `hashes password with Node.js native scrypt and generates unique salt` — **PASS**
- `verifies correct password against scrypt combined hash` — **PASS**
- `rejects incorrect password attempts with timing-safe comparison` — **PASS**
- `enforces in-memory sliding-window rate limit after threshold exceeded` — **PASS**
- `records structured audit log entry for security-sensitive operations` — **PASS**

#### Test Suite 2: `marketplace.test.ts` (9 Tests)
- `calculates hourly tiered rental pricing accurately` — **PASS**
- `calculates daily tiered rental pricing accurately` — **PASS**
- `calculates weekly tiered rental pricing accurately` — **PASS**
- `calculates monthly tiered rental pricing with appropriate discounts` — **PASS**
- `calculates semester tiered rental pricing for academic terms` — **PASS**
- `detects valid chronological dates` — **PASS**
- `rejects invalid start/end sequences where end <= start` — **PASS**
- `generates anonymous student aliases conforming to brand pattern` — **PASS**
- `assigns brand-tinted avatar colors consistently` — **PASS**

#### Test Suite 3: `rental_and_booking_lifecycle.test.ts` (3 Tests)
- `creates a rental booking with server-calculated pricing, escrow status, and dual OTPs` — **PASS**
- `prevents renter from booking their own listing` — **PASS**
- `transitions booking from CONFIRMED to ACTIVE upon correct pickup OTP verification` — **PASS**

#### Test Suite 4: `listings_and_disputes.test.ts` (7 Tests)
- `creates a product listing with anonymous owner alias and valid pricing` — **PASS**
- `prevents unauthorized users from modifying another user's listing` — **PASS**
- `allows owner to update their own listing` — **PASS**
- `allows owner to toggle listing availability` — **PASS**
- `prevents unauthorized users from deleting another user's listing` — **PASS**
- `allows owner to delete their listing when there are no active bookings` — **PASS**
- `searches and filters marketplace inventory efficiently` — **PASS**

#### Test Suite 5: `payments_and_webhooks.test.ts` (4 Tests)
- `creates a structured Razorpay order payload with paise conversion` — **PASS**
- `verifies valid Razorpay HMAC-SHA256 signature using timing-safe comparison` — **PASS**
- `rejects forged or tampered Razorpay payment signature` — **PASS**
- `creates a verified recommerce purchase order separate from rental flow` — **PASS**

#### Test Suite 6: `production_concurrency_and_security.test.ts` (4 Tests)
- `correctly identifies storage engine mode without crashing` — **PASS**
- `prevents double-purchase under concurrent purchase order attempts` — **PASS**
- `detects overlapping reservation intervals under concurrent booking requests` — **PASS**
- `enforces cross-user booking data isolation` — **PASS**

#### Test Suite 7: `database_persistence_and_integrity.test.ts` (7 Tests)
- `persists registered user credentials and verifies login with salted scrypt hash` — **PASS**
- `creates, persists, and allows owner to edit product listing` — **PASS**
- `persists wishlist additions, prevents duplicates, and allows toggling` — **PASS**
- `calculates server-side pricing snapshots and prevents overlapping confirmed bookings` — **PASS**
- `enforces strict OTP verification on handover and return` — **PASS**
- `handles condition inspection damage reporting and escrow dispute flags` — **PASS**
- `validates Razorpay payment signature verification idempotency` — **PASS**

---

## 2. Independent Live Neon PostgreSQL Persistence Test

**Test Script:** `verify-neon-persistence.js`  
**Execution Environment:** Node.js v22 on Windows (Unsandboxed Network Execution)  
**Target:** Live Neon PostgreSQL Database (`ep-broad-term-begb6qn5.c-9.us-east-2.aws.neon.tech`)  

### Execution Output
```
--- TEST 1: INSERT RECORD IN FIRST CONNECTION ---
Created User in Neon: usr_test_1794375537514 neon_verify_1794375537514@ywd.in Alias: Tester-5922
Connection 1 destroyed and pool closed.
--- TEST 2: RETRIEVE RECORD IN SEPARATE, FRESH CONNECTION INSTANCE ---
VERIFIED PERSISTENCE: Fetched user intact from Neon across separate connection: usr_test_1794375537514
--- TEST 3: ATOMIC BOOKING AND OVERLAP CONCURRENCY TEST ---
Created Booking in Neon: YWD-TEST-RENT-281896 Dates: 2026-12-15 to 2026-12-20
CONCURRENCY VERIFIED: Overlap collision detected with existing reservation in Neon: YWD-TEST-RENT-281896
--- TEST 4: CLEANUP TEST RECORDS ---
CLEANUP COMPLETED: Test user and booking cleanly removed from Neon.
ALL NEON PERSISTENCE & CONCURRENCY TESTS PASSED 100%!
```

**Result:** Verified 100% persistence survival across isolated pool lifecycles and verified atomic database overlap collision detection in hosted PostgreSQL.


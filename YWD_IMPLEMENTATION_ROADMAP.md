# YwD — Strategic Production Implementation Roadmap

**Objective:** Transform YwD into a verified, secure, database-backed, production-ready student marketplace while preserving 100% of the established frontend design identity.

---

## Phase 1: Database & Driver Unification (Immediate Foundation)
- [x] Configure IPv4 DNS resolution on `pg.Pool` in `src/lib/prisma.ts`.
- [x] Audit all 19 Neon PostgreSQL tables and foreign key schemas.
- [ ] Implement seamless PostgreSQL persistence across service layers (`product.service.ts`, `booking.service.ts`, `order.service.ts`, `auth.ts`, `message.service.ts`), deprecating reliance on `.dev-db.json`.
- [ ] Expand `prisma/seed.js` to seed the complete catalog (all 6 categories, subcategories, and 8 curated student products) directly into Neon PostgreSQL.

## Phase 2: Authentication & User Accounts (PostgreSQL-Backed)
- [ ] Connect NextAuth Credentials provider to `prisma.user.findUnique()` with secure `scrypt` password hashing.
- [ ] Connect `POST /api/auth/register` to `prisma.user.create()` and `prisma.anonymousProfile.create()`.
- [ ] Remove all insecure unauthenticated `"usr_default_demo"` fallback identities on mutation endpoints.
- [ ] Implement role-based access control (`USER`, `OWNER`, `ADMIN`).

## Phase 3: Marketplace & Inventory Activation
- [ ] Update `getProducts()` and `getProductById()` to query PostgreSQL via Prisma with search, filtering, and sorting.
- [ ] Wire listing creation (`POST /api/products`), editing (`PUT /api/products/[id]`), and deletion (`DELETE /api/products/[id]`) to PostgreSQL.
- [ ] Support direct image uploads via Cloudinary signed/multipart handling with fallback resilience.

## Phase 4: Rental Booking Engine & Concurrency Isolation
- [ ] Wrap booking creation and overlap verification in an atomic `prisma.$transaction`.
- [ ] Ensure non-overlapping bookings can be made concurrently while exact or partial date collisions are rejected.
- [ ] Ensure user cannot book their own listing.
- [ ] Calculate server-side pricing snapshots (rent, deposit, platform fee, GST) and lock them in `RentalBooking`.

## Phase 5: Recommerce, Cart & Wishlist
- [ ] Connect Cart endpoints (`/api/cart`) and Wishlist (`/api/wishlist`) to `cart_items` and `wishlist_items` tables in Neon.
- [ ] Implement atomic single-item purchase locks: update `Product.isAvailable = false` and create `PurchaseOrder` in a single transaction.

## Phase 6: Dual OTP, Inspection & Dispute Management
- [ ] Cryptographically generate 6-digit OTPs (`crypto.randomInt(100000, 999999)`).
- [ ] Implement brute-force attempt limits (max 3 attempts per booking OTP verification).
- [ ] Implement 4-angle condition photo logs for handovers and returns.
- [ ] Wire dispute creation (`/api/disputes`) to Neon PostgreSQL.

## Phase 7: Real-Time Messaging & Notifications
- [ ] Persist privacy relay messages in `relay_messages` table in PostgreSQL.
- [ ] Scrub PII (phone numbers, email addresses) from peer messages.
- [ ] Persist in-app notifications in `notifications` table.

## Phase 8: Administrative Workspace (`/admin`)
- [ ] Build `/admin` dashboard route with tabs: Overview, Products, Bookings, Disputes, Users, and Audit Logs.
- [ ] Enforce server-side role check (`session.user.role === 'ADMIN'`).
- [ ] Support product approval/suspension, dispute resolution, and audit log inspection.

## Phase 9: Quality Gates & Testing
- [ ] Run unit tests, database persistence tests, and concurrency tests.
- [ ] Verify zero regressions on Next.js build (`npm run build`).
- [ ] Generate comprehensive test results and deployment documentation.


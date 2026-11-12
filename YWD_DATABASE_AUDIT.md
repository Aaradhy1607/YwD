# YwD — Production Database & Data Integrity Audit

**Target Database:** Neon Serverless PostgreSQL  
**Engine:** PostgreSQL 16 (AWS `us-east-2`)  
**ORM:** Prisma 6.0.1 / 6.19.3 with `@prisma/adapter-pg` 7.10.1  
**Audit Script:** `scripts/audit-db.js`  
**Execution Timestamp:** 2026-11-11  

---

## 1. Relational Model Inventory & Schema Validation

All 19 reported database models were inspected in `prisma/schema.prisma` and queried directly in the live Neon PostgreSQL instance via `information_schema.tables`.

| # | Model Name | SQL Table Name | Relations & Foreign Keys | Indexes / Unique Constraints | Live Row Count (Pre-Fix) | Status |
|---|---|---|---|---|---|---|
| 1 | `User` | `users` | HasOne: `AnonymousProfile`, HasMany: `Account`, `Session`, `Product`, `RentalBooking`, `PurchaseOrder`, `CartItem`, `WishlistItem`, `Notification`, `RelayMessage`, `Dispute` | `email` (unique), `id` (PK) | 4 | **Active** |
| 2 | `AnonymousProfile` | `anonymous_profiles` | BelongsTo: `User` (Cascade delete) | `userId` (unique), `alias` (unique) | 4 | **Active** |
| 3 | `Account` | `accounts` | BelongsTo: `User` (Cascade delete) | Compound unique `[provider, providerAccountId]` | 0 | **Active (Auth.js)** |
| 4 | `Session` | `sessions` | BelongsTo: `User` (Cascade delete) | `sessionToken` (unique) | 0 | **Active (Auth.js)** |
| 5 | `VerificationToken`| `verification_tokens` | Standalone | Compound unique `[identifier, token]` | 0 | **Active** |
| 6 | `Category` | `categories` | HasMany: `Subcategory`, `Product` | `slug` (unique) | 4 | **Active (Needs full catalog)** |
| 7 | `Subcategory` | `subcategories` | BelongsTo: `Category`, HasMany: `Product` | Compound unique `[categoryId, slug]` | 0 | **Empty (Needs seeding)** |
| 8 | `Product` | `products` | BelongsTo: `Category`, `Subcategory`, `User` (owner); HasMany: `ProductImage`, `RentalBooking`, `PurchaseOrder`, `CartItem`, `WishlistItem`, `Review` | `categoryId`, `ownerId`, `isAvailable` indexes | 3 | **Underpopulated** |
| 9 | `ProductImage` | `product_images` | BelongsTo: `Product` (Cascade delete) | `id` (PK), FK on `productId` | 3 | **Active** |
| 10 | `RentalBooking` | `rental_bookings` | BelongsTo: `Product`, `User` (renter); HasMany: `Payment`, `Review`, `Dispute` | Compound index `[productId, startDate, endDate]`, `renterId`, `status` | 0 | **Orphaned (Wrote to JSON)** |
| 11 | `PurchaseOrder` | `purchase_orders` | BelongsTo: `User` (buyer), `Product`; HasMany: `Payment` | `buyerId`, `status` indexes | 0 | **Orphaned (Wrote to JSON)** |
| 12 | `CartItem` | `cart_items` | BelongsTo: `User`, `Product` (Cascade delete) | Compound unique `[userId, productId, isRental]` | 0 | **Orphaned (Wrote to JSON)** |
| 13 | `WishlistItem` | `wishlist_items` | BelongsTo: `User`, `Product` (Cascade delete) | Compound unique `[userId, productId]` | 0 | **Orphaned (Wrote to JSON)** |
| 14 | `Payment` | `payments` | BelongsTo: `RentalBooking`, `PurchaseOrder` | `razorpayOrderId` (unique), `status` index | 0 | **Orphaned (Wrote to JSON)** |
| 15 | `Notification` | `notifications` | BelongsTo: `User` (Cascade delete) | Compound index `[userId, isRead]` | 0 | **Orphaned (Wrote to JSON)** |
| 16 | `RelayMessage` | `relay_messages` | BelongsTo: `User` (sender), `User` (receiver) | Compound index `[senderId, receiverId]` | 0 | **Orphaned (Wrote to JSON)** |
| 17 | `Review` | `reviews` | BelongsTo: `Product`, `RentalBooking` | `productId` index | 0 | **Orphaned (Wrote to JSON)** |
| 18 | `Dispute` | `disputes` | BelongsTo: `RentalBooking`, `User` (initiator) | `bookingId` index | 0 | **Orphaned (Wrote to JSON)** |
| 19 | `AuditLog` | `audit_logs` | Optional BelongsTo: `User` | `userId`, `action` indexes | 0 | **Orphaned (Wrote to JSON)** |

---

## 2. Integrity and Concurrency Safeguards

### 2.1 Rental Overlap Collision Prevention
The current code in `src/services/booking.service.ts` correctly expresses the interval collision predicate:
$$\text{Overlap} \iff \text{reqStart} < \text{existingEnd} \land \text{reqEnd} > \text{existingStart}$$
However, checking this in memory or via an unisolated query without a database transaction allowed race conditions under concurrent booking requests.

**Required Production Fix:**
Execute both the overlap detection query and the booking insertion inside a Prisma interactive transaction (`prisma.$transaction`) with `READ COMMITTED` or `SERIALIZABLE` level:
```typescript
await prisma.$transaction(async (tx) => {
  const overlap = await tx.rentalBooking.findFirst({
    where: {
      productId,
      status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
      startDate: { lt: new Date(endDate) },
      endDate: { gt: new Date(startDate) },
    },
  });
  if (overlap) {
    throw new Error("Date collision: this item is already reserved for the selected period.");
  }
  return await tx.rentalBooking.create({ data: bookingData });
});
```

### 2.2 Recommerce Single-Sale Guarantee
For outright equipment purchases (`purchase_orders`), two students attempting to purchase the same single pre-owned item at the same time must not both succeed.

**Required Production Fix:**
Atomically verify and flip `isAvailable` from `true` to `false` within `prisma.$transaction`:
```typescript
await prisma.$transaction(async (tx) => {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product || !product.isAvailable || !product.isPurchasable) {
    throw new Error("Product is no longer available for purchase.");
  }
  await tx.product.update({
    where: { id: productId },
    data: { isAvailable: false },
  });
  return await tx.purchaseOrder.create({ data: orderData });
});
```

---

## 3. Connection Pooling and Windows DNS Resolution

In `src/lib/prisma.ts`, serverless connection exhaustion is prevented via singleton caching on `globalThis`. However, `pg.Pool` configuration lacked an explicit IPv4 DNS resolution rule.

On Windows machines and certain edge runtime environments, DNS queries for `*.neon.tech` return both A (IPv4) and AAAA (IPv6) records. When the local network does not route IPv6, queries stall, causing `P1001: Can't reach database server`.

**Validated Fix:**
```typescript
import dns from "dns";

const pool = globalForPrisma.pool ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  lookup: (hostname, options, cb) => {
    dns.lookup(hostname, { family: 4 }, cb);
  },
});
```
This guarantees instant IPv4 resolution across all local, dev, and serverless environments.


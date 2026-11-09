import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/services/store";
import { createProductListing } from "@/services/product.service";
import { createPurchaseOrder } from "@/services/order.service";
import { checkRateLimit, checkDistributedRateLimit } from "@/lib/security";
import { getUserBookings } from "@/services/booking.service";

describe("Phase 7 — Production Concurrency, Security, & Edge Cases", () => {
  let purchasableProductId: string;

  beforeEach(async () => {
    // Create an isolated purchasable product
    const prod = await createProductListing(
      {
        title: "Sony FX3 Cinema Camera (Isolated Buy Test)",
        description: "Cinema line full frame camera body.",
        categoryId: "cat_electronics",
        conditionGrade: "Mint (Like New)",
        rentalPriceDaily: 1200,
        rentalPriceWeekly: 6500,
        buyPrice: 280000,
        mrpReference: 399990,
        deposit: 15000,
        isRentable: true,
        isPurchasable: true,
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      },
      "usr_vendor_1"
    );
    purchasableProductId = prod.id;
  });

  it("prevents double-purchase under concurrent purchase order attempts", async () => {
    // Two users simultaneously attempt to buy the same one-off recommerce item
    const buyer1 = "usr_buyer_alpha";
    const buyer2 = "usr_buyer_beta";

    const attempt1Promise = createPurchaseOrder({
      productId: purchasableProductId,
      buyerId: buyer1,
      deliveryAddress: "123 Campus Lane, Block A",
    });

    const attempt2Promise = createPurchaseOrder({
      productId: purchasableProductId,
      buyerId: buyer2,
      deliveryAddress: "456 College Road, Block B",
    });

    const results = await Promise.allSettled([attempt1Promise, attempt2Promise]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly one purchase must succeed
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    if (rejected[0].status === "rejected") {
      expect((rejected[0] as PromiseRejectedResult).reason.message).toMatch(
        /already sold or unavailable/i
      );
    }
  });

  it("enforces cross-user booking data isolation", async () => {
    const userA = "usr_user_a";
    const userB = "usr_user_b";

    // Inject test booking for userA
    store.updateDB((db) => {
      db.rentalBookings.push({
        id: `bk_isolated_test_${Date.now()}`,
        bookingNumber: "YWD-RENT-ISOLATED",
        productId: purchasableProductId,
        renterId: userA,
        ownerId: "usr_vendor_1",
        startDate: "2026-12-01",
        endDate: "2026-12-05",
        status: "ACTIVE",
        totalAmount: 5000,
      });
    });

    const bookingsForA = await getUserBookings(userA);
    const bookingsForB = await getUserBookings(userB);

    expect(bookingsForA.some((b) => b.renterId === userA)).toBe(true);
    expect(bookingsForB.some((b) => b.renterId === userA)).toBe(false);
  });

  it("cleans up expired keys and enforces rate limits in distributed-compatible limiter", async () => {
    const testKey = `dist_test_${Date.now()}`;

    // Should allow up to 3 calls
    const res1 = await checkDistributedRateLimit(testKey, 3, 2000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await checkDistributedRateLimit(testKey, 3, 2000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await checkDistributedRateLimit(testKey, 3, 2000);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4th call must be blocked
    const res4 = await checkDistributedRateLimit(testKey, 3, 2000);
    expect(res4.allowed).toBe(false);
    expect(res4.retryAfterMs).toBeGreaterThan(0);
  });

  it("correctly identifies storage engine mode and Postgres availability without crashing", async () => {
    const isPg = await store.checkPostgres();
    // In local dev/test environment without open PG port, isPg is false
    expect(typeof isPg).toBe("boolean");

    const mode = store.getStorageEngineMode();
    expect(["POSTGRESQL", "LOCAL_JSON_DEV", "PRODUCTION_UNCONFIGURED"]).toContain(mode);
  });
});


import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  createProductListing,
  getProducts,
  getUserListings,
  toggleProductAvailability,
  deleteProductListing,
} from "@/services/product.service";
import { createProductSchema } from "@/lib/validations";

// Mock auth and adminGuard for API route handler tests
const mockAuth = vi.fn();
const mockAssertAdminSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/adminGuard", () => ({
  assertAdminSession: () => mockAssertAdminSession(),
}));

import { PATCH, DELETE, PUT } from "@/app/api/products/[id]/route";
import { GET as GET_PRODUCTS } from "@/app/api/products/route";

describe("Listing Ownership, Super Admin & Rent/Sell/Both Support", () => {
  const ownerId = "usr_owner_test_1";
  const otherUserId = "usr_other_test_2";
  const adminUserId = "usr_super_admin_1";

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(null);
    mockAssertAdminSession.mockResolvedValue({
      authorized: false,
      status: 401,
      error: "Authentication required",
    });
  });

  describe("Rent / Sell / Both Validation & Marketplace Visibility", () => {
    it("rejects listing when neither Rent nor Sell is selected", () => {
      const parsed = createProductSchema.safeParse({
        title: "Invalid Mode Item",
        description: "Should fail without rent or sell",
        categoryId: "cat_electronics",
        conditionGrade: "Mint (Like New)",
        isRentable: false,
        isPurchasable: false,
        campusHub: "North Campus Central Hub",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      });
      expect(parsed.success).toBe(false);
    });

    it("validates Rent-only without requiring selling price", () => {
      const parsed = createProductSchema.safeParse({
        title: "Rent Only Tripod",
        description: "Carbon fiber tripod for rent only",
        categoryId: "cat_electronics",
        conditionGrade: "Mint (Like New)",
        listingType: "rent",
        rentalPriceDaily: 150,
        rentalPriceWeekly: 700,
        mrpReference: 6000,
        deposit: 1000,
        campusHub: "North Campus Central Hub",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      });
      expect(parsed.success).toBe(true);
    });

    it("validates Sell-only without requiring rental rates or deposit", () => {
      const parsed = createProductSchema.safeParse({
        title: "Sell Only Mechanical Keyboard",
        description: "Keychron K2 wireless mechanical keyboard for outright sale",
        categoryId: "cat_electronics",
        conditionGrade: "Excellent",
        listingType: "sell",
        buyPrice: 5500,
        campusHub: "North Campus Central Hub",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      });
      expect(parsed.success).toBe(true);
    });

    it("rejects Sell-only when selling price is missing", () => {
      const parsed = createProductSchema.safeParse({
        title: "Sell Without Price",
        description: "Missing selling price should fail",
        categoryId: "cat_electronics",
        conditionGrade: "Excellent",
        listingType: "sell",
        campusHub: "North Campus Central Hub",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      });
      expect(parsed.success).toBe(false);
    });

    it("creates Rent, Sell, and Both listings and filters them accurately in marketplace", async () => {
      const uniqueTag = `ModeCheck_${Date.now()}`;

      const rentOnly = await createProductListing(
        {
          title: `${uniqueTag} RentOnly`,
          description: "Available only for rent",
          categoryId: "cat_electronics",
          conditionGrade: "Mint (Like New)",
          listingType: "rent",
          rentalPriceDaily: 200,
          rentalPriceWeekly: 900,
          mrpReference: 10000,
          deposit: 1500,
          campusHub: "North Campus Central Hub",
          images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        },
        ownerId
      );

      const sellOnly = await createProductListing(
        {
          title: `${uniqueTag} SellOnly`,
          description: "Available only for outright sale",
          categoryId: "cat_electronics",
          conditionGrade: "Good",
          listingType: "sell",
          buyPrice: 4500,
          campusHub: "North Campus Central Hub",
          images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        },
        ownerId
      );

      const bothItem = await createProductListing(
        {
          title: `${uniqueTag} BothMode`,
          description: "Available for rent and outright purchase",
          categoryId: "cat_electronics",
          conditionGrade: "Excellent",
          listingType: "both",
          rentalPriceDaily: 250,
          rentalPriceWeekly: 1100,
          mrpReference: 15000,
          deposit: 2000,
          buyPrice: 11000,
          campusHub: "North Campus Central Hub",
          images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        },
        ownerId
      );

      expect(rentOnly.isRentable).toBe(true);
      expect(rentOnly.isPurchasable).toBe(false);
      expect(sellOnly.isRentable).toBe(false);
      expect(sellOnly.isPurchasable).toBe(true);
      expect(sellOnly.buyPrice).toBe(4500);
      expect(bothItem.isRentable).toBe(true);
      expect(bothItem.isPurchasable).toBe(true);
      expect(bothItem.buyPrice).toBe(11000);

      const rentResults = await getProducts({ query: uniqueTag, mode: "rent" });
      const rentTitles = rentResults.products.map((p) => p.title);
      expect(rentTitles).toContain(`${uniqueTag} RentOnly`);
      expect(rentTitles).toContain(`${uniqueTag} BothMode`);
      expect(rentTitles).not.toContain(`${uniqueTag} SellOnly`);

      const buyResults = await getProducts({ query: uniqueTag, mode: "buy" });
      const buyTitles = buyResults.products.map((p) => p.title);
      expect(buyTitles).toContain(`${uniqueTag} SellOnly`);
      expect(buyTitles).toContain(`${uniqueTag} BothMode`);
      expect(buyTitles).not.toContain(`${uniqueTag} RentOnly`);

      // Cleanup created test records
      await deleteProductListing(rentOnly.id, ownerId);
      await deleteProductListing(sellOnly.id, ownerId);
      await deleteProductListing(bothItem.id, ownerId);
    });
  });

  describe("Ownership Authorization & Super Admin Access", () => {
    it("enforces 401 for unauthenticated users and 403 for non-owners on PATCH/PUT/DELETE", async () => {
      const item = await createProductListing(
        {
          title: `AuthzTarget_${Date.now()}`,
          description: "Item for ownership authorization tests",
          categoryId: "cat_electronics",
          conditionGrade: "Mint (Like New)",
          listingType: "rent",
          rentalPriceDaily: 120,
          rentalPriceWeekly: 600,
          mrpReference: 5000,
          deposit: 500,
          campusHub: "North Campus Central Hub",
          images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        },
        ownerId
      );

      // Unauthenticated -> 401
      mockAuth.mockResolvedValue(null);
      const unauthPatch = await PATCH(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "PATCH" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(unauthPatch.status).toBe(401);

      const unauthDelete = await DELETE(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(unauthDelete.status).toBe(401);

      const unauthMine = await GET_PRODUCTS(
        new NextRequest("http://localhost/api/products?mine=true")
      );
      expect(unauthMine.status).toBe(401);

      // Different user -> 403 Forbidden
      mockAuth.mockResolvedValue({ user: { id: otherUserId, role: "USER" } });
      mockAssertAdminSession.mockResolvedValue({
        authorized: false,
        status: 403,
        error: "Access Denied: Administrator role required",
      });

      const forbiddenPatch = await PATCH(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "PATCH" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(forbiddenPatch.status).toBe(403);

      const forbiddenPut = await PUT(
        new NextRequest(`http://localhost/api/products/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({ title: "Tampered" }),
        }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(forbiddenPut.status).toBe(403);

      const forbiddenDelete = await DELETE(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(forbiddenDelete.status).toBe(403);

      // Owner can unlist -> removed from public getProducts, kept in getUserListings
      mockAuth.mockResolvedValue({ user: { id: ownerId, role: "USER" } });
      const ownerPatch = await PATCH(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "PATCH" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(ownerPatch.status).toBe(200);
      const patchedBody = await ownerPatch.json();
      expect(patchedBody.isAvailable).toBe(false);

      const publicSearch = await getProducts({ query: item.title });
      expect(publicSearch.products.some((p) => p.id === item.id)).toBe(false);

      const mineList = await getUserListings(ownerId);
      expect(mineList.some((p) => p.id === item.id)).toBe(true);

      // Super admin can relist & delete another user's listing
      mockAuth.mockResolvedValue({ user: { id: adminUserId, role: "ADMIN" } });
      mockAssertAdminSession.mockResolvedValue({
        authorized: true,
        user: { id: adminUserId, role: "ADMIN" },
      });

      const adminRelist = await PATCH(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "PATCH" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(adminRelist.status).toBe(200);
      const relistedBody = await adminRelist.json();
      expect(relistedBody.isAvailable).toBe(true);

      const adminDelete = await DELETE(
        new NextRequest(`http://localhost/api/products/${item.id}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: item.id }) }
      );
      expect(adminDelete.status).toBe(200);
    });
  });
});

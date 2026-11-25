import { describe, it, expect } from "vitest";
import {
  createProductListing,
  updateProductListing,
  deleteProductListing,
  toggleProductAvailability,
  getProducts,
} from "@/services/product.service";
import { store } from "@/services/store";

describe("Product Listings & Ownership Authorization", () => {
  const ownerId = "usr_lender_alpha";
  const otherUserId = "usr_intruder_beta";

  let createdProduct: any = null;

  it("creates a product listing with anonymous owner alias and valid pricing", async () => {
    createdProduct = await createProductListing(
      {
        title: "GoPro Hero 12 Black Special Creator Edition",
        description: "Rugged waterproof action camera with Enduro battery and protective silicone sleeve.",
        categoryId: "cat_electronics",
        conditionGrade: "Mint (Like New)",
        rentalPriceDaily: 350,
        rentalPriceWeekly: 1750,
        mrpReference: 45000,
        deposit: 4000,
        isRentable: true,
        isPurchasable: true,
        buyPrice: 32000,
        campusHub: "North Campus Central Hub",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
      },
      ownerId
    );

    expect(createdProduct.id).toBeDefined();
    expect(createdProduct.title).toContain("GoPro Hero 12");
    expect(createdProduct.owner.alias).toBeDefined();
    // Ensure real owner ID or email is never returned in sanitized product
    expect((createdProduct as any).email).toBeUndefined();
  });

  it("prevents unauthorized users from modifying another user's listing", async () => {
    await expect(
      updateProductListing(
        createdProduct.id,
        { title: "Hacked Listing Title" },
        otherUserId // Unauthorized user
      )
    ).rejects.toThrow("Unauthorized: you can only modify your own listings.");
  });

  it("allows owner to update their own listing", async () => {
    const updated = await updateProductListing(
      createdProduct.id,
      { title: "GoPro Hero 12 Black Special Edition (Updated)" },
      ownerId
    );

    expect(updated?.title).toBe("GoPro Hero 12 Black Special Edition (Updated)");
  });

  it("allows owner to toggle listing availability", async () => {
    const toggled = await toggleProductAvailability(createdProduct.id, ownerId);
    expect(toggled?.isAvailable).toBe(false);

    const reToggled = await toggleProductAvailability(createdProduct.id, ownerId);
    expect(reToggled?.isAvailable).toBe(true);
  });

  it("searches and filters marketplace inventory efficiently", async () => {
    const searchResult = await getProducts({ query: "GoPro", limit: 5 });
    expect(searchResult.products.length).toBeGreaterThanOrEqual(1);
    expect(searchResult.products[0].title.toLowerCase()).toContain("gopro");

    const categoryResult = await getProducts({ category: "cat_electronics" });
    expect(categoryResult.products.every((p) => p.categoryId === "cat_electronics")).toBe(true);
  });

  it("prevents unauthorized users from deleting another user's listing", async () => {
    await expect(
      deleteProductListing(createdProduct.id, otherUserId)
    ).rejects.toThrow("Unauthorized: you can only delete your own listings.");
  });

  it("allows owner to delete their listing when there are no active bookings", async () => {
    const result = await deleteProductListing(createdProduct.id, ownerId);
    expect(result.success).toBe(true);
  });
});


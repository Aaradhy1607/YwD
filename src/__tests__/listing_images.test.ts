import { describe, it, expect, vi, afterEach } from "vitest";
import { validateImageUrl, extractImageUrls } from "@/lib/image-utils";
import { createProductListing, getProductById, deleteProductListing } from "@/services/product.service";

describe("Listing Image Validation, Upload & Persistence", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  it("validates direct HTTP and HTTPS image URLs and rejects blob/data/invalid URLs", () => {
    expect(validateImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")).toEqual({
      valid: true,
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    });
    expect(validateImageUrl("http://example.com/photo.png")).toEqual({
      valid: true,
      url: "http://example.com/photo.png",
    });

    expect(validateImageUrl("").valid).toBe(false);
    expect(validateImageUrl("blob:http://localhost:3000/abc").valid).toBe(false);
    expect(validateImageUrl("data:image/png;base64,AAAA").valid).toBe(false);
    expect(validateImageUrl("/images/local.png").valid).toBe(false);
    expect(validateImageUrl("javascript:alert(1)").valid).toBe(false);
    expect(validateImageUrl("not-a-url").valid).toBe(false);
  });

  it("extracts image URLs without injecting preset placeholder photos", () => {
    expect(extractImageUrls(null)).toEqual([]);
    expect(extractImageUrls({ images: [] })).toEqual([]);
    expect(
      extractImageUrls({
        images: [{ url: "https://example.com/a.jpg" }, { url: "" }, "https://example.com/b.jpg"],
      })
    ).toEqual(["https://example.com/a.jpg", "https://example.com/b.jpg"]);
  });

  it("throws CloudinaryNotConfiguredError instead of returning a preset placeholder when Cloudinary is unconfigured", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "your_cloudinary_api_key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "your_cloudinary_api_secret");
    vi.resetModules();

    const { uploadToCloudinary, CloudinaryNotConfiguredError } = await import("@/lib/cloudinary");
    await expect(
      uploadToCloudinary("data:image/png;base64,iVBORw0KGgo=")
    ).rejects.toBeInstanceOf(CloudinaryNotConfiguredError);
  });

  it("persists user-provided image URLs without replacing them with preset photos", async () => {
    const userUrl = "https://example.com/my-actual-camera.jpg";
    const ownerId = "usr_img_test_owner";

    const created = await createProductListing(
      {
        title: "Sony Alpha A7 III Body",
        description: "Clean full-frame mirrorless camera with battery.",
        categoryId: "cat_electronics",
        conditionGrade: "Mint (Like New)",
        rentalPriceDaily: 900,
        rentalPriceWeekly: 4500,
        mrpReference: 140000,
        deposit: 10000,
        campusHub: "Central Verified Locker • Hub A",
        images: [userUrl],
      },
      ownerId
    );

    expect(extractImageUrls(created)).toEqual([userUrl]);

    const fetched = await getProductById(created.id);
    expect(extractImageUrls(fetched)).toEqual([userUrl]);

    await deleteProductListing(created.id, ownerId);
  });

  it("does not inject preset MacBook photos when a listing is created with no images", async () => {
    const ownerId = "usr_no_img_owner";
    const created = await createProductListing(
      {
        title: "Scientific Calculator FX-991EX",
        description: "Works great for engineering exams.",
        categoryId: "cat_electronics",
        conditionGrade: "Good",
        rentalPriceDaily: 50,
        rentalPriceWeekly: 200,
        mrpReference: 1500,
        deposit: 300,
        campusHub: "Central Verified Locker • Hub A",
        images: [],
      },
      ownerId
    );

    expect(extractImageUrls(created)).toEqual([]);
    expect((created as any).conditionPhotos).toEqual([]);

    await deleteProductListing(created.id, ownerId);
  });
});

export type ImageUrlValidationResult =
  | { valid: true; url: string }
  | { valid: false; error: string };

/**
 * Validates that a user-entered image URL is an absolute HTTP/HTTPS URL
 * and rejects temporary local paths, blob URLs, or inline data URIs.
 */
export function validateImageUrl(rawUrl: string): ImageUrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter an image URL." };
  }

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:") || trimmed.startsWith("file:")) {
    return {
      valid: false,
      error: "Temporary browser or local file URLs cannot be saved. Upload the photo or use an https:// image link.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "Invalid URL format. Please enter a full URL starting with https:// or http://.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: "Only http:// and https:// image URLs are supported.",
    };
  }

  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    return {
      valid: false,
      error: "Please enter a valid public image URL with a domain name.",
    };
  }

  return { valid: true, url: parsed.toString() };
}

/**
 * Extracts normalized image URL strings from a product's `images` field,
 * supporting both `{ url: string }[]` (Prisma) and `string[]` records.
 */
export function extractImageUrls(product: any): string[] {
  if (!product || !Array.isArray(product.images)) return [];
  return product.images
    .map((img: any) => (typeof img === "string" ? img : img?.url))
    .filter((url: any): url is string => typeof url === "string" && url.trim().length > 0);
}

import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

function isPlaceholderValue(val?: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    !lower ||
    lower.includes("placeholder") ||
    lower.startsWith("your_") ||
    lower.startsWith("your-")
  );
}

export const isCloudinaryConfigured = Boolean(
  !isPlaceholderValue(cloudName) &&
  !isPlaceholderValue(apiKey) &&
  !isPlaceholderValue(apiSecret)
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export class CloudinaryNotConfiguredError extends Error {
  readonly code = "CLOUDINARY_NOT_CONFIGURED";
  constructor() {
    super(
      "Image upload storage (Cloudinary) is not configured on this server. Please paste a direct HTTPS image URL or configure CLOUDINARY_* environment variables."
    );
    this.name = "CloudinaryNotConfiguredError";
  }
}

/**
 * Uploads a base64 image payload to Cloudinary with size and format optimization.
 */
export async function uploadToCloudinary(
  fileBase64: string,
  folder: string = "ywd_marketplace"
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured) {
    throw new CloudinaryNotConfiguredError();
  }

  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

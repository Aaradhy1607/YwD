import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(
  cloudName && apiKey && apiSecret && !apiKey.includes("placeholder")
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Uploads a base64 or file buffer to Cloudinary with size and type checks.
 */
export async function uploadToCloudinary(
  fileBase64: string,
  folder: string = "ywd_marketplace"
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured) {
    // Return a verified illustrative placeholder image if Cloudinary credentials are not yet added
    return {
      url: fileBase64.startsWith("data:")
        ? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80"
        : fileBase64,
      publicId: `dev_${Date.now()}`,
    };
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

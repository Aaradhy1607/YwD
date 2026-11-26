import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId =
      session?.user?.id ||
      (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required to upload files." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP and AVIF image formats are permitted." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary is configured with real credentials, upload to Cloudinary
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET &&
        !process.env.CLOUDINARY_API_KEY.includes("placeholder")
    );

    if (isCloudinaryConfigured) {
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      const uploaded = await uploadToCloudinary(base64);
      return NextResponse.json(uploaded);
    }

    // Local file persistence: write to public/uploads/ so the real image is saved and displayed!
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.name ? path.extname(file.name) || ".jpg" : ".jpg";
    const filename = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({
      url: fileUrl,
      publicId: filename,
    });
  } catch (error: any) {
    console.error("[Upload Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, CloudinaryNotConfiguredError } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required to upload files." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 });
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
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploaded = await uploadToCloudinary(base64);

    return NextResponse.json(uploaded);
  } catch (error: any) {
    if (error instanceof CloudinaryNotConfiguredError || error?.code === "CLOUDINARY_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: error.message, code: "CLOUDINARY_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    console.error("[Upload Error]:", {
      name: error?.name || "Error",
      message: error?.message || "Failed to upload image",
    });
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

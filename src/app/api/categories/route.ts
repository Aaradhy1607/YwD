import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/services/product.service";

export async function GET(req: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("[Categories API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}


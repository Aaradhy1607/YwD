import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProductListing } from "@/services/product.service";
import { createProductSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const query = searchParams.get("query") || "";
    const mode = (searchParams.get("mode") as any) || "all";
    const condition = searchParams.get("condition") || "";
    const sortBy = (searchParams.get("sortBy") as any) || "featured";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    const result = await getProducts({
      category,
      query,
      mode,
      condition,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API Products GET Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to list a product." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = createProductSchema.parse(body);

    const listing = await createProductListing(validated, userId);

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    console.error("[API Products POST Error]:", error);
    let errorMsg = error.message || "Invalid listing data";
    if (error?.issues && Array.isArray(error.issues)) {
      errorMsg = error.issues.map((i: any) => `${i.path.join('.') || 'field'}: ${i.message}`).join(', ');
    }
    return NextResponse.json(
      { error: errorMsg },
      { status: 400 }
    );
  }
}

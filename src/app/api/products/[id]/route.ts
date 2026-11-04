import { NextRequest, NextResponse } from "next/server";
import { getProductById, toggleProductAvailability } from "@/services/product.service";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const updated = await toggleProductAvailability(id, userId);
    if (!updated) {
      return NextResponse.json(
        { error: "Unauthorized or product not found" },
        { status: 403 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

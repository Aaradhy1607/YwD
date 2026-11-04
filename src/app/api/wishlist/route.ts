import { NextRequest, NextResponse } from "next/server";
import { getWishlist, toggleWishlist } from "@/services/order.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";
    const items = await getWishlist(userId);
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }

    const result = await toggleWishlist(userId, productId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCartItems, addToCart, removeFromCart } from "@/services/order.service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }
    const items = await getCartItems(userId);
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to add to cart." }, { status: 401 });
    }
    const body = await req.json();

    const item = await addToCart({
      userId,
      productId: body.productId,
      isRental: body.isRental,
      durationTier: body.durationTier,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ error: "Cart item id required" }, { status: 400 });
    }

    await removeFromCart(cartItemId, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

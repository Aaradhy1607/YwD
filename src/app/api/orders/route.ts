import { NextRequest, NextResponse } from "next/server";
import { createPurchaseOrder, getUserOrders } from "@/services/order.service";
import { purchaseOrderSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const orders = await getUserOrders(userId);
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const body = await req.json();
    const validated = purchaseOrderSchema.parse(body);

    const order = await createPurchaseOrder({
      ...validated,
      buyerId: userId,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create purchase order" },
      { status: 400 }
    );
  }
}

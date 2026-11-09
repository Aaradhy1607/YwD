import { NextRequest, NextResponse } from "next/server";
import { checkDateAvailability } from "@/services/booking.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!productId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "productId, startDate, and endDate query parameters are required" },
        { status: 400 }
      );
    }

    const result = await checkDateAvailability(productId, startDate, endDate);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, startDate, endDate } = await req.json();

    if (!productId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "productId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const result = await checkDateAvailability(productId, startDate, endDate);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

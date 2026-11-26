import { NextRequest, NextResponse } from "next/server";
import { processPickupHandover } from "@/services/booking.service";
import { pickupHandoverSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to verify handover." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = pickupHandoverSchema.parse(body);

    const booking = await processPickupHandover({
      ...validated,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Handover verified successfully. Booking is now active.",
      booking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify handover OTP" },
      { status: 400 }
    );
  }
}


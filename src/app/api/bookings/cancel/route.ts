import { NextRequest, NextResponse } from "next/server";
import { cancelRentalBooking } from "@/services/booking.service";
import { cancelBookingSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to cancel a booking." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = cancelBookingSchema.parse(body);

    const booking = await cancelRentalBooking({
      ...validated,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}


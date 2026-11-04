import { NextRequest, NextResponse } from "next/server";
import { createRentalBooking, getUserBookings } from "@/services/booking.service";
import { createBookingSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const bookings = await getUserBookings(userId);
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const body = await req.json();
    const validated = createBookingSchema.parse(body);

    const booking = await createRentalBooking({
      ...validated,
      renterId: userId,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("[API Bookings POST Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 400 }
    );
  }
}

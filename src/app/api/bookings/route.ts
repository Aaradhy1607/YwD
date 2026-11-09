import { NextRequest, NextResponse } from "next/server";
import { createRentalBooking, getUserBookings } from "@/services/booking.service";
import { createBookingSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
    }

    const bookings = await getUserBookings(userId);
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || (process.env.NODE_ENV !== "production" ? "usr_default_demo" : null);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to create a booking." }, { status: 401 });
    }

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

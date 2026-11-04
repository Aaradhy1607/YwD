import { NextRequest, NextResponse } from "next/server";
import { processReturnInspection } from "@/services/booking.service";
import { returnInspectionSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const body = await req.json();
    const validated = returnInspectionSchema.parse(body);

    const result = await processReturnInspection({
      ...validated,
      userId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process return" },
      { status: 400 }
    );
  }
}

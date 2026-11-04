import { NextRequest, NextResponse } from "next/server";
import { getConversationMessages, sendRelayMessage } from "@/services/message.service";
import { relayMessageSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";
    const { searchParams } = new URL(req.url);
    const counterpartyId = searchParams.get("counterpartyId") || undefined;

    const messages = await getConversationMessages(userId, counterpartyId);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "usr_default_demo";

    const body = await req.json();
    const validated = relayMessageSchema.parse(body);

    const message = await sendRelayMessage({
      senderId: userId,
      receiverId: validated.receiverId,
      bookingId: validated.bookingId,
      content: validated.content,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 400 }
    );
  }
}


import { store } from "./store";
import { prisma } from "@/lib/prisma";

export async function getConversationMessages(userId: string, counterpartyId?: string) {
  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const where: any = counterpartyId
        ? {
          OR: [
            { senderId: userId, receiverId: counterpartyId },
            { senderId: counterpartyId, receiverId: userId },
          ],
        }
        : {
          OR: [{ senderId: userId }, { receiverId: userId }],
        };

      const messages = await prisma.relayMessage.findMany({
        where,
        include: {
          sender: { include: { anonymousProfile: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderAlias: m.sender.anonymousProfile?.alias || "AnonymousPeer",
        receiverId: m.receiverId,
        bookingId: m.bookingId,
        content: m.content,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      }));
    } catch (e) {
      console.warn("[Message Service] Postgres getConversationMessages failed:", e);
    }
  }

  const all = store.getDB().relayMessages;
  if (!counterpartyId) {
    return all.filter((m) => m.senderId === userId || m.receiverId === userId);
  }
  return all.filter(
    (m) =>
      (m.senderId === userId && m.receiverId === counterpartyId) ||
      (m.senderId === counterpartyId && m.receiverId === userId)
  );
}

export async function sendRelayMessage(params: {
  senderId: string;
  receiverId: string;
  bookingId?: string | null;
  content: string;
}) {
  // Moderate against phone numbers or email addresses in content to protect privacy
  const sanitizedContent = params.content
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
      "[Private Email Redacted]"
    )
    .replace(
      /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g,
      "[Private Phone Redacted]"
    );

  const isPg = await store.checkPostgres();
  if (isPg) {
    try {
      const sender = await prisma.user.findUnique({
        where: { id: params.senderId },
        include: { anonymousProfile: true },
      });

      const message = await prisma.relayMessage.create({
        data: {
          senderId: params.senderId,
          receiverId: params.receiverId,
          bookingId: params.bookingId || null,
          content: sanitizedContent,
          isRead: false,
        },
      });

      const senderAlias = sender?.anonymousProfile?.alias || "AnonymousPeer";

      await prisma.notification.create({
        data: {
          userId: params.receiverId,
          title: "New Privacy Relay Message",
          message: `${senderAlias}: ${sanitizedContent.slice(0, 50)}...`,
          type: "MESSAGE",
          link: "/dashboard?tab=chat",
        },
      });

      return {
        id: message.id,
        senderId: message.senderId,
        senderAlias,
        receiverId: message.receiverId,
        bookingId: message.bookingId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      };
    } catch (e) {
      console.warn("[Message Service] Postgres sendRelayMessage failed, falling back to store:", e);
    }
  }

  const senderProfile = store
    .getDB()
    .anonymousProfiles.find((ap) => ap.userId === params.senderId);

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: params.senderId,
    senderAlias: senderProfile ? senderProfile.alias : "AnonymousPeer",
    receiverId: params.receiverId,
    bookingId: params.bookingId || null,
    content: sanitizedContent,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  store.updateDB((db) => {
    db.relayMessages.push(newMessage);

    // Notify receiver
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: params.receiverId,
      title: "New Privacy Relay Message",
      message: `${newMessage.senderAlias}: ${sanitizedContent.slice(0, 50)}...`,
      type: "MESSAGE",
      link: "/dashboard?tab=chat",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return newMessage;
}

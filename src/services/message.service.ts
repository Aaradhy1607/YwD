import { store } from "./store";

export async function getConversationMessages(userId: string, counterpartyId?: string) {
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
  const sanitizedContent = params.content.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
    "[Private Email Redacted]"
  ).replace(
    /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g,
    "[Private Phone Redacted]"
  );

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

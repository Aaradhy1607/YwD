"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Lock, ShieldCheck } from "lucide-react";

interface PrivacyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetAlias?: string;
  currentUserId?: string;
}

export function PrivacyChatDrawer({
  isOpen,
  onClose,
  targetUserId = "usr_vendor_1",
  targetAlias = "GearVault-8801",
  currentUserId = "",
}: PrivacyChatDrawerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch conversation
    fetch(`/api/messages?counterpartyId=${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        } else {
          // Initial greeting in relay chat
          setMessages([
            {
              id: "msg_init_1",
              senderId: targetUserId,
              senderAlias: targetAlias,
              content:
                "Hello! Welcome to YwD Relay Chat. All items are ready for pickup at our designated exchange points. How can I help you?",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [isOpen, targetUserId, targetAlias]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    setSending(true);
    setInputText("");

    const optimisticMsg = {
      id: `msg_opt_${Date.now()}`,
      senderId: currentUserId,
      senderAlias: "You",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: targetUserId,
          content: text,
        }),
      });
      const saved = await res.json();
      if (res.ok) {
        // Automatic bot-counterparty reply for smooth demo interaction
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_reply_${Date.now()}`,
              senderId: targetUserId,
              senderAlias: targetAlias,
              content:
                "Received your message! The gear is pre-checked and calibrated at our handover station. Ready whenever you confirm your reservation OTP.",
              createdAt: new Date().toISOString(),
            },
          ]);
        }, 1200);
      }
    } catch (err) {
      console.error("Message send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    "Is this gear available for pickup today?",
    "Does it include original charger and case?",
    "Can I inspect the condition at the handover point?",
    "I have booked this item and confirmed deposit.",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#202522]/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E5DEC9]">
        {/* Chat Drawer Header */}
        <div className="bg-[#18352D] text-[#F5F0E8] p-4 sm:p-5 flex items-center justify-between border-b border-[#2C483F] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C46A42] text-white flex items-center justify-center font-bold">
              {targetAlias.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm text-white">{targetAlias}</span>
                <span className="w-2 h-2 rounded-full bg-[#789681]" />
              </div>
              <p className="text-[10px] text-[#9BB5A3] flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3 text-[#C46A42]" />
                <span>YwD Confidential Relay</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F0E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Privacy Shield Notice */}
        <div className="bg-[#FAF7F2] p-3 px-4 text-[11px] text-[#63736A] flex items-center gap-2 border-b border-[#E5DEC9]">
          <ShieldCheck className="w-4 h-4 text-[#789681] shrink-0" />
          <span>
            Phone numbers and email addresses are automatically redacted to safeguard identity privacy.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7F2]">
          {messages.map((m) => {
            const isMe = m.senderId === currentUserId || m.senderAlias === "You";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] font-mono font-medium text-[#63736A] mb-1">
                  {isMe ? "You" : m.senderAlias}
                </span>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? "bg-[#18352D] text-white rounded-tr-none"
                      : "bg-[#FFFFFF] text-[#18352D] border border-[#E5DEC9] rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[9px] text-[#63736A] mt-1 font-mono">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Prompt Chips */}
        <div className="p-2.5 bg-[#FFFFFF] border-t border-[#E5DEC9] overflow-x-auto flex gap-1.5 min-w-max">
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full text-[10px] font-medium bg-[#FAF7F2] hover:bg-[#F5F0E8] text-[#18352D] border border-[#E5DEC9] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-[#FFFFFF] border-t border-[#E5DEC9] flex items-center gap-2.5 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message confidentially..."
            className="flex-1 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-none focus:border-[#18352D]"
          />
          <button
            type="button"
            disabled={!inputText.trim() || sending}
            onClick={() => handleSendMessage()}
            className="p-2.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] disabled:opacity-40 text-white transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

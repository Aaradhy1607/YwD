"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { AuthCard } from "./AuthCard";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (user: any) => void;
  initialTab?: "signin" | "register" | "forgot";
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
  initialTab = "signin",
}: AuthModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#202522]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E5DEC9] shadow-md text-[#18352D] hover:bg-[#FAF7F2] flex items-center justify-center transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        <AuthCard
          initialTab={initialTab}
          isModal={true}
          onSuccess={(user) => {
            if (onAuthenticated) onAuthenticated(user);
            setTimeout(() => {
              onClose();
            }, 600);
          }}
        />
      </div>
    </div>
  );
}

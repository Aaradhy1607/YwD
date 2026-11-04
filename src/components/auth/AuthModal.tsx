"use client";

import React, { useState } from "react";
import { X, Lock, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [demoEmail, setDemoEmail] = useState("student@ywd.in");

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google sign in error:", err);
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      const res = await signIn("demo-login", {
        redirect: false,
        email: demoEmail,
      });
      if (res?.ok) {
        if (onAuthenticated) {
          onAuthenticated({ email: demoEmail });
        }
        onClose();
      }
    } catch (err) {
      console.error("Demo sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#202522]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl shadow-2xl border border-[#E5DEC9] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#18352D] text-[#F5F0E8] p-5 flex items-center justify-between border-b border-[#2C483F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#FAF7F2] border border-white/20 shadow-xs shrink-0">
              <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold tracking-wider text-white block">
                YwD // SECURE AUTHENTICATION
              </span>
              <span className="text-[10px] text-[#9BB5A3]">
                Zero personal data leak protocol
              </span>
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

        {/* Content */}
        <div className="p-7 space-y-6 bg-[#FFFFFF]">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-2xl text-[#18352D] tracking-tight">
              Sign in to YwD Marketplace
            </h3>
            <p className="text-xs text-[#63736A] max-w-xs mx-auto leading-relaxed">
              Rent verified equipment, list your own gear, and track refundable security deposits in Escrow.
            </p>
          </div>

          {/* Strict Anonymity Banner */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] text-xs text-[#18352D] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#789681]" />
              <span>Strict Privacy Shield Active</span>
            </div>
            <p className="text-[11px] text-[#63736A] leading-snug">
              Your real name and private phone number are never shared. You will be automatically provisioned a system-generated anonymous alias (e.g. EcoRenter-4912).
            </p>
          </div>

          {/* Primary: Google Sign In */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl border border-[#E5DEC9] hover:border-[#18352D] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#18352D] font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5DEC9]" />
            <span className="text-[10px] uppercase font-semibold text-[#63736A]">
              Evaluation Mode
            </span>
            <div className="flex-1 h-px bg-[#E5DEC9]" />
          </div>

          {/* 1-Click Demo Sign In */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoSignIn}
              className="w-full py-3.5 px-4 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#789681]" />
              <span>1-Click Verified Student Sign In</span>
            </button>
            <span className="text-[10px] text-[#63736A] text-center block leading-relaxed">
              Instantly signs in as EcoRenter-4912 with full booking, listing & checkout access.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

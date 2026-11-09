"use client";

import React, { useState } from "react";
import { X, Lock, ShieldCheck, CheckCircle2, AlertCircle, Mail, Key } from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [demoEmail, setDemoEmail] = useState("student@ywd.in");

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google sign in error:", err);
      setErrorMsg("Google sign in failed or is not configured.");
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
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
      } else {
        setErrorMsg("Demo sign in failed.");
      }
    } catch (err) {
      console.error("Demo sign in error:", err);
      setErrorMsg("Demo sign in error.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (tab === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }
        setSuccessMsg("Account created! Signing you in...");
        // Auto sign in after registration
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (loginRes?.ok) {
          if (onAuthenticated) onAuthenticated({ email });
          setTimeout(() => onClose(), 800);
        } else {
          setTab("signin");
          setSuccessMsg("Account created! Please sign in with your password.");
        }
      } else {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (res?.ok) {
          if (onAuthenticated) onAuthenticated({ email });
          onClose();
        } else {
          setErrorMsg("Invalid email or password.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
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
        <div className="p-7 space-y-5 bg-[#FFFFFF]">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-2xl text-[#18352D] tracking-tight">
              {tab === "signin" ? "Sign in to YwD Marketplace" : "Create Verified Account"}
            </h3>
            <p className="text-xs text-[#63736A] max-w-xs mx-auto leading-relaxed">
              Rent verified equipment, list your own gear, and track refundable security deposits in Escrow.
            </p>
          </div>

          {/* Strict Anonymity Banner */}
          <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] text-xs text-[#18352D] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#789681]" />
              <span>Strict Privacy Shield Active</span>
            </div>
            <p className="text-[11px] text-[#63736A] leading-snug">
              Your real name and phone number are never exposed to counterparties. You will be assigned a public alias (e.g. EcoRenter-4912).
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E5DEC9] text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setTab("signin"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === "signin" ? "bg-[#18352D] text-white shadow-xs" : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === "register" ? "bg-[#18352D] text-white shadow-xs" : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === "register" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#18352D] mb-1">
                  Full Name (Private Verification Only)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Siddharth Rao"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-hidden focus:border-[#18352D]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#18352D] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu or personal email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-hidden focus:border-[#18352D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#18352D] mb-1">
                Password {tab === "register" && "(Min. 8 characters)"}
              </label>
              <input
                type="password"
                required
                minLength={tab === "register" ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DEC9] text-xs text-[#18352D] focus:outline-hidden focus:border-[#18352D]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>{tab === "signin" ? "Sign In with Password" : "Create Account & Shield PII"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5DEC9]" />
            <span className="text-[10px] uppercase font-semibold text-[#63736A]">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-[#E5DEC9]" />
          </div>

          {/* Primary: Google Sign In */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl border border-[#E5DEC9] hover:border-[#18352D] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#18352D] font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-xs"
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

          {/* 1-Click Evaluation Demo Sign In */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-4 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#789681]" />
              <span>1-Click Verified Student Sign In</span>
            </button>
            <span className="text-[10px] text-[#63736A] text-center block">
              Quick test login as EcoRenter-4912 with full marketplace permissions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

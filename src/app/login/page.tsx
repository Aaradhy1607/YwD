"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [demoEmail, setDemoEmail] = useState("student@ywd.in");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam ? "Authentication failed or was cancelled. Please try again." : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      setErrorMessage("Google Sign-In failed to connect. Please check credentials or use demo mode.");
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signIn("demo-login", {
        redirect: false,
        email: demoEmail,
        callbackUrl,
      });

      if (res?.ok) {
        router.push(callbackUrl);
      } else {
        setErrorMessage("Could not sign in with demo account.");
      }
    } catch (err) {
      setErrorMessage("Demo sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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
        setSuccessMessage("Account created! Signing you in...");
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });
        if (loginRes?.ok) {
          router.push(callbackUrl);
        } else {
          setTab("signin");
          setSuccessMessage("Account created! Please enter your password to sign in.");
        }
      } else {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        });
        if (res?.ok) {
          router.push(callbackUrl);
        } else {
          setErrorMessage("Invalid email or password.");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/marketplace" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#C46A42] flex items-center justify-center text-white shadow-xs">
            <span className="font-bold text-sm">YwD</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-[#18352D]">YwD</span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#18352D]/10 text-[#18352D] rounded">
                Marketplace
              </span>
            </div>
            <p className="text-[11px] text-[#63736A] leading-none">Own Less. Experience More.</p>
          </div>
        </Link>

        <Link
          href="/marketplace"
          className="text-xs font-semibold text-[#18352D] hover:text-[#C46A42] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to marketplace</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-[#FFFFFF] rounded-3xl p-8 shadow-sm border border-[#E5DEC9] space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#18352D] flex items-center justify-center mx-auto mb-3 border border-[#E5DEC9]">
              <Lock className="w-5 h-5 text-[#C46A42]" />
            </div>
            <h1 className="font-semibold text-2xl text-[#18352D] tracking-tight">
              {tab === "signin" ? "Sign in to YwD" : "Create Verified Account"}
            </h1>
            <p className="text-xs text-[#63736A] max-w-xs mx-auto leading-relaxed">
              Rent hardware for any duration, buy verified pre-owned items, and track your escrow deposits securely.
            </p>
          </div>

          {/* Privacy Reassurance Pill */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DEC9] text-xs text-[#18352D] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#18352D]">
              <ShieldCheck className="w-4 h-4 text-[#789681]" />
              <span>Strict Privacy Shield Active</span>
            </div>
            <p className="text-[11px] text-[#63736A] leading-snug">
              Your real name and private phone number are never shared. You will be automatically assigned a neutral anonymous alias (e.g., <strong className="font-mono text-[#18352D]">EcoRenter-4912</strong>).
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E5DEC9] text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setTab("signin"); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === "signin" ? "bg-[#18352D] text-white shadow-xs" : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                tab === "register" ? "bg-[#18352D] text-white shadow-xs" : "text-[#63736A] hover:text-[#18352D]"
              }`}
            >
              Register
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === "register" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#18352D] mb-1">
                  Full Name (Private Administrative Record)
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
              className="w-full py-3.5 rounded-xl bg-[#C46A42] hover:bg-[#A8532F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{tab === "signin" ? "Sign In with Credentials" : "Create Account & Shield PII"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5DEC9]" />
            <span className="text-[11px] font-medium text-[#63736A]">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-[#E5DEC9]" />
          </div>

          {/* Primary Action: Google OAuth */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-xl border border-[#E5DEC9] hover:border-[#18352D] bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#18352D] font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-xs disabled:opacity-50"
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
            <span>{loading ? "Connecting securely..." : "Continue with Google"}</span>
          </button>

          {/* Demo Access Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoSignIn}
              className="w-full py-3.5 px-4 rounded-xl bg-[#18352D] hover:bg-[#234C40] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#789681]" />
              <span>1-Click Verified Student Sign In</span>
            </button>
            <p className="text-[10px] text-[#63736A] text-center leading-normal">
              Quick test login as EcoRenter-4912 with full marketplace permissions.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-[#63736A]">
        <p>© {new Date().getFullYear()} YwD Marketplace. Own Less. Experience More.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center text-sm font-semibold text-[#63736A]">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}

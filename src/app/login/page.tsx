"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const initialTab = searchParams.get("tab") === "register" ? "register" : "signin";

  const [checkingSession, setCheckingSession] = useState(true);

  // If already authenticated, redirect to callbackUrl
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(callbackUrl);
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
  }, [callbackUrl, router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#18352D]/20 border-t-[#18352D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/marketplace" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#E5DEC9] shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <img src="/images/ywd-logo.png" alt="YwD Insignia" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-[#18352D]">YwD</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[#FAF7F2] text-[#7052DF] border border-[#E5DEC9] rounded">
                MARKETPLACE
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

      {/* Main Authentication Container */}
      <div className="my-8 flex items-center justify-center">
        <AuthCard
          initialTab={initialTab}
          callbackUrl={callbackUrl}
          onSuccess={() => router.push(callbackUrl)}
        />
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center space-y-2">
        <p className="text-xs text-[#63736A]">
          Direct peer-to-peer equipment rentals and verified student marketplace
        </p>
        <p className="text-[11px] text-[#8C9B90]">
          © {new Date().getFullYear()} YwD. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-[#18352D]/20 border-t-[#18352D] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

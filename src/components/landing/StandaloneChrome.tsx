"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function StandaloneHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ywd-border bg-ywd-white">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/marketplace"
          className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-4 focus-visible:ring-offset-ywd-cream"
          aria-label="YwD home"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-ywd-border bg-ywd-cream-light shadow-ywd-subtle transition-transform duration-200 group-hover:scale-105">
            <Image src="/images/ywd-logo.png" alt="" fill sizes="36px" className="object-cover" />
          </div>
          <span className="font-sans text-xl font-semibold tracking-tight text-ywd-forest">YwD</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-7" aria-label="Standalone navigation">
          <Link href="/marketplace" className="text-[13px] font-medium text-ywd-muted transition-colors hover:text-ywd-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange">
            Marketplace
          </Link>
          <Link href="/get-started#how-it-works" className="text-[13px] font-medium text-ywd-muted transition-colors hover:text-ywd-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange">
            How It Works
          </Link>
        </nav>

        <Link
          href="/auth?tab=login"
          className="transition-luxury inline-flex h-10 items-center rounded-xl border border-ywd-border bg-ywd-cream-light px-4 text-xs font-semibold text-ywd-forest hover:border-ywd-sage hover:bg-ywd-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

export function StandaloneFooter() {
  return (
    <footer className="border-t border-ywd-border-dark bg-ywd-charcoal text-ywd-cream">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ywd-white">YwD</p>
            <p className="mt-1 text-xs text-ywd-sage-light">Own Less. Experience More.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-ywd-sage-light">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-ywd-sage" />
              Protected deposits
            </span>
            <Link href="/marketplace" className="inline-flex items-center gap-1 text-ywd-cream transition-colors hover:text-ywd-orange-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange">
              Marketplace <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

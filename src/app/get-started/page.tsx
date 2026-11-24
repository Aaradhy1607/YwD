"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  KeyRound,
  Search,
  ShieldCheck,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import { StandaloneFooter, StandaloneHeader } from "@/components/landing/StandaloneChrome";
import { MarketplaceDoodles } from "@/components/landing/LandingDoodles";

const features = [
  {
    title: "Escrow-protected deposits",
    description: "Reserve with confidence. Your deposit stays protected and is handled through a transparent escrow process.",
    icon: ShieldCheck,
  },
  {
    title: "Dual-OTP handover",
    description: "Both renter and owner verify pickup and return with a secure, two-party handover process.",
    icon: KeyRound,
  },
  {
    title: "Anonymous peer identity",
    description: "Meet the right person without exposing real names or private contact details on the marketplace.",
    icon: UserRoundCheck,
  },
  {
    title: "Flexible rental terms",
    description: "Choose hourly, daily, weekly, monthly or semester-long access based on what you need.",
    icon: Clock3,
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "Browse verified gear and find the category, duration and campus handover point that fit.",
    icon: Search,
  },
  {
    number: "02",
    title: "Book and pay deposit",
    description: "Reserve your item and place its refundable security deposit through the protected checkout flow.",
    icon: WalletCards,
  },
  {
    number: "03",
    title: "Handover and return",
    description: "Complete both OTP checks, then return the item and receive a verified deposit outcome.",
    icon: BadgeCheck,
  },
];

export default function GetStartedPage() {
  const shouldReduceMotion = useReducedMotion();
  const entrance = shouldReduceMotion
    ? { initial: false as const }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="flex min-h-screen flex-col bg-ywd-cream">
      <StandaloneHeader />
      <main className="flex-1">
        <section className="relative isolate min-h-[620px] overflow-hidden border-b border-ywd-border bg-ywd-forest-dark">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/videos/ywd-get-started.mp4"
            autoPlay={!shouldReduceMotion}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            poster="/images/ywd-logo.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ywd-forest-dark/95 via-ywd-forest-dark/78 to-ywd-forest-dark/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ywd-forest-dark/75 via-transparent to-ywd-forest-dark/10" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:24px_24px]" />
          <MarketplaceDoodles />
          <motion.div
            {...entrance}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-ywd-sage-light/30 bg-ywd-forest/70 px-3 py-1.5 text-[11px] font-semibold text-ywd-sage-light backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-ywd-sage-light" />
                College-first, verified marketplace
              </span>
              <h1 className="mt-6 max-w-3xl font-sans text-4xl font-semibold leading-[1.08] tracking-tight text-ywd-white sm:text-5xl lg:text-6xl">
                Own less. Discover more.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-ywd-cream-dark sm:text-base">
                Rent quality equipment for exactly as long as you need it—whether that is one hour, a project week, or an entire semester.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?tab=signup"
                  className="transition-luxury inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ywd-orange px-6 text-sm font-semibold text-ywd-white shadow-ywd-subtle hover:bg-ywd-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-4 focus-visible:ring-offset-ywd-cream"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="transition-luxury inline-flex h-12 items-center justify-center rounded-xl border border-ywd-cream/40 bg-ywd-forest-dark/45 px-6 text-sm font-semibold text-ywd-white shadow-ywd-subtle backdrop-blur-md hover:border-ywd-sage-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-orange focus-visible:ring-offset-4 focus-visible:ring-offset-ywd-forest"
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-ywd-cream/20 bg-ywd-cream-light/95 p-6 shadow-ywd-elevated backdrop-blur-md sm:p-8">
              <div className="flex items-center justify-between border-b border-ywd-border pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ywd-muted">YwD access</p>
                  <p className="mt-1 text-lg font-semibold text-ywd-forest">Protected by design</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ywd-sage/30 bg-ywd-sage/10">
                  <ShieldCheck className="h-5 w-5 text-ywd-sage-dark" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {["Verified peers", "Escrow deposits", "Secure handover", "Flexible terms"].map((item) => (
                  <div key={item} className="rounded-2xl border border-ywd-border bg-ywd-white px-3 py-4 text-xs font-semibold text-ywd-forest">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border-b border-ywd-border bg-ywd-forest-dark py-5" aria-label="Marketplace specimen preview">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-stretch gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Compute",
                  meta: "Workstations // Verified",
                  image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
                },
                {
                  label: "Visual production",
                  meta: "Optics // Calibrated",
                  image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
                },
                {
                  label: "Academic tools",
                  meta: "Essentials // Campus ready",
                  image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
                },
              ].map((specimen) => (
                <article key={specimen.label} className="group relative h-32 overflow-hidden rounded-2xl border border-ywd-sage/20 sm:h-36">
                  <img
                    src={specimen.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ywd-forest-dark/95 via-ywd-forest-dark/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">
                    <div>
                      <p className="text-xs font-semibold text-ywd-white">{specimen.label}</p>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ywd-sage-light">{specimen.meta}</p>
                    </div>
                    <span className="h-2 w-2 rounded-full border border-ywd-sage-light bg-ywd-sage shadow-[0_0_12px_rgba(120,150,129,0.8)]" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden" aria-labelledby="features-heading">
          <div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full border border-ywd-sage/20" />
          <div className="pointer-events-none absolute -right-12 top-20 h-40 w-40 rounded-full border border-ywd-orange/15" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ywd-sage-dark">Built for campus life</p>
            <h2 id="features-heading" className="mt-3 text-3xl font-semibold tracking-tight text-ywd-forest sm:text-4xl">
              Access the gear. Keep the flexibility.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.3, delay: shouldReduceMotion ? 0 : index * 0.05 }}
                  className="rounded-3xl border border-ywd-border bg-ywd-white p-5 shadow-ywd-subtle"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ywd-cream-light text-ywd-orange">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-ywd-forest">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-ywd-muted">{feature.description}</p>
                </motion.article>
              );
            })}
          </div>
          </div>
        </section>

        <section className="border-y border-ywd-border bg-ywd-cream-light" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ywd-sage-dark">How it works</p>
              <h2 id="steps-heading" className="mt-3 text-3xl font-semibold tracking-tight text-ywd-forest">Three simple steps</h2>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.number} className="relative rounded-3xl border border-ywd-border bg-ywd-white p-6 shadow-ywd-subtle">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ywd-forest text-ywd-cream">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-ywd-sage-dark">{step.number}</span>
                    </div>
                    <h3 className="mt-6 text-base font-semibold text-ywd-forest">{step.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-ywd-muted">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-ywd-forest px-6 py-10 text-ywd-cream shadow-ywd-lg sm:px-10 sm:py-12">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ywd-sage-light">Ready when you are</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ywd-white sm:text-4xl">
                  Start experiencing more with YwD.
                </h2>
              </div>
              <Link
                href="/auth?tab=signup"
                className="transition-luxury inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-ywd-orange px-6 text-sm font-semibold text-ywd-white hover:bg-ywd-orange-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ywd-cream focus-visible:ring-offset-4 focus-visible:ring-offset-ywd-forest"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <StandaloneFooter />
    </div>
  );
}

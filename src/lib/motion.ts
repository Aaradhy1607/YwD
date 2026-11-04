"use client";

import { useSyncExternalStore } from "react";
import { type Variants } from "framer-motion";

/**
 * Standardized easing curves and durations for YwD Motion Architecture
 */
export const EASING = {
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  anticipate: [0.36, 0, 0.66, -0.56],
  spring: { type: "spring", stiffness: 350, damping: 30 },
  gentleSpring: { type: "spring", stiffness: 220, damping: 25 },
  snappySpring: { type: "spring", stiffness: 450, damping: 35 },
} as const;

export const DURATION = {
  fast: 0.18,
  normal: 0.32,
  slow: 0.55,
  hero: 0.85,
} as const;

/**
 * Hook to detect and respect prefers-reduced-motion across server & client hydration
 */
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => (typeof window !== "undefined" ? window.matchMedia(REDUCED_QUERY).matches : false),
    () => false
  );
}

/**
 * Common Motion Variants
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.normal,
      delay: custom * 0.08,
      ease: EASING.easeOutCubic,
    },
  }),
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.normal,
      delay: custom * 0.06,
      ease: EASING.easeOutCubic,
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

export const modalDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASING.easeOutCubic },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};


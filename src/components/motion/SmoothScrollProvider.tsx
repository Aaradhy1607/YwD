"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";

// Suppress known Three.js v0.187+ internal deprecation warning triggered by @react-three/fiber
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const text = args.map((a) => (typeof a === "object" ? "" : String(a))).join(" ");
    if (text.includes("THREE.Clock") || text.includes("THREE.Timer")) {
      return;
    }
    originalWarn(...args);
  };
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's motion preference
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let stopped = false;
    let frame = 0;
    let lenisInstance: Lenis | null = null;

    const start = () => {
      if (stopped) return;

      try {
        lenisInstance = new Lenis({
          duration: 1.15,
          easing: (t: number) => 1 - Math.pow(1 - t, 3), // Smooth cubic ease-out
          smoothWheel: true,
          touchMultiplier: 1.5,
        });

        const raf = (time: number) => {
          if (stopped) return;
          lenisInstance?.raf(time);
          frame = requestAnimationFrame(raf);
        };

        frame = requestAnimationFrame(raf);
      } catch (err) {
        console.warn("Smooth scroll initialization fallback:", err);
      }
    };

    // Load after first paint using requestIdleCallback
    const w = window as any;
    const idle = w.requestIdleCallback
      ? w.requestIdleCallback(start, { timeout: 1200 })
      : window.setTimeout(start, 150);

    return () => {
      stopped = true;
      if (w.cancelIdleCallback) {
        w.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }
      cancelAnimationFrame(frame);
      if (lenisInstance) {
        lenisInstance.destroy();
      }
    };
  }, []);

  // Performance Optimization: Pause off-screen CSS animations
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.toggleAttribute("data-off", !entry.isIntersecting);
        });
      },
      { rootMargin: "250px 0px" }
    );

    const sections = el.querySelectorAll("section, footer");
    sections.forEach((s) => io.observe(s));

    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="ywd-app-shell min-h-screen">
      {children}
    </div>
  );
}


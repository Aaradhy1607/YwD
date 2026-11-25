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
  return <div className="ywd-app-shell min-h-screen">{children}</div>;
}

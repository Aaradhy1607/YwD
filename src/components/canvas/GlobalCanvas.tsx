"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useState } from "react";

interface GlobalCanvasProps {
  children: React.ReactNode;
}

export function GlobalCanvas({ children }: GlobalCanvasProps) {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      eventSource={
        typeof document !== "undefined"
          ? document.documentElement
          : undefined
      }
      eventPrefix="client"
    >
      <Suspense fallback={null}>
        <PerformanceMonitor
          onDecline={() => setDpr([1, 1])}
          flipflops={3}
          threshold={45 / 60}
        >
          {children}
        </PerformanceMonitor>
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

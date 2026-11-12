"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { AccessJourney } from "@/components/canvas/scenes/AccessJourney";

interface AccessJourney3DCanvasProps {
  activeStep: number;
}

export function AccessJourney3DCanvas({ activeStep }: AccessJourney3DCanvasProps) {
  const stepTitles = [
    "PROTOCOL // 01 • CAPITAL ESCROW VAULT",
    "PROTOCOL // 02 • GPS CAMPUS BEACON TERMINAL",
    "PROTOCOL // 03 • DUAL-OTP CRYPTOGRAPHIC DIAL",
    "PROTOCOL // 04 • INSTANT UPI SETTLEMENT PIPELINE",
  ];

  return (
    <div className="w-full h-[320px] sm:h-[400px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#141F1A] via-[#0E1713] to-[#0A100D] border border-emerald-500/20 shadow-2xl">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Protocol Step Indicator Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
          {stepTitles[activeStep]}
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 text-[10px] font-mono tracking-wider text-emerald-400/60 pointer-events-none hidden sm:block">
        DRAG TO EXAMINE // 360°
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Center>
            <AccessJourney activeStep={activeStep} />
          </Center>
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0A100D] to-transparent pointer-events-none" />
    </div>
  );
}


"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { ExplodedView } from "@/components/canvas/scenes/ExplodedView";

interface Hardware3DCanvasProps {
  activeComponentId: string;
}

export function Hardware3DCanvas({ activeComponentId }: Hardware3DCanvasProps) {
  return (
    <div className="w-full h-[380px] sm:h-[460px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#08120D] via-[#050C09] to-[#040806] border border-white/10 shadow-2xl">
      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Top Left Status Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
          Live 3D Hardware Stack // Interactive
        </span>
      </div>

      {/* Top Right Drag Tip */}
      <div className="absolute top-4 right-4 z-10 text-[10px] font-mono tracking-wider text-emerald-400/60 pointer-events-none hidden sm:block">
        DRAG TO ROTATE • SCROLL TO ZOOM
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.8, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Center>
            <ExplodedView activeComponentId={activeComponentId} />
          </Center>
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3.2}
            maxDistance={7}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 4}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#040806] to-transparent pointer-events-none" />
    </div>
  );
}


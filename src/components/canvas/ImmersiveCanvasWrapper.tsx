"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LoadingGate } from "./scenes/LoadingGate";
import { OrbitScene } from "./scenes/OrbitScene";
import { ParticleField } from "./effects/ParticleField";
import { PostFX } from "./effects/PostFX";
import { SceneManager } from "./SceneManager";

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

// Dynamically import GlobalCanvas so it only renders on client
const GlobalCanvas = dynamic(
  () => import("./GlobalCanvas").then((mod) => mod.GlobalCanvas),
  { ssr: false }
);

interface ImmersiveCanvasWrapperProps {
  scrollProgress: number;
  scrollVelocity?: number;
  activeSectionIndex: number;
  cosmicMode?: boolean;
}

export function ImmersiveCanvasWrapper({
  scrollProgress,
  scrollVelocity = 0,
  activeSectionIndex,
  cosmicMode = true,
}: ImmersiveCanvasWrapperProps) {
  const [loadingActive, setLoadingActive] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check if user already saw loading this session
    const hasSeenLoading = sessionStorage.getItem("ywd_intro_seen");
    if (hasSeenLoading) {
      setLoadingActive(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setLoadingActive(false);
    try {
      sessionStorage.setItem("ywd_intro_seen", "true");
    } catch {}
  };

  if (!mounted) return null;

  return (
    <>
      <GlobalCanvas>
        <SceneManager
          activeScene={loadingActive ? 0 : activeSectionIndex}
          scrollProgress={scrollProgress}
        >
          {/* Global Ambient Particle Field */}
          <ParticleField
            count={cosmicMode ? 350 : 150}
            scrollVelocity={scrollVelocity}
            color={cosmicMode ? "#10B981" : "#C46A42"}
          />

          {/* Loading Gate 3D Scene */}
          {loadingActive && (
            <LoadingGate
              isActive={loadingActive}
              onComplete={handleLoadingComplete}
            />
          )}

          {/* Orbit Hero 3D Scene */}
          <group position={[0, 0, 0]}>
            <OrbitScene
              isActive={activeSectionIndex <= 1}
              scrollProgress={scrollProgress}
            />
          </group>
        </SceneManager>

        {/* Global Post Processing Glow & Shimmer */}
        <PostFX
          bloomIntensity={cosmicMode ? 0.18 : 0.08}
          chromaticOffset={cosmicMode ? 0.0003 : 0.0001}
        />
      </GlobalCanvas>
    </>
  );
}


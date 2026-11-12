"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useRef } from "react";
import * as THREE from "three";

// Context for sharing scroll progress with child scenes
export const ScrollProgressContext = createContext({
  progress: 0,
  activeScene: 0,
});

export const useScrollContext = () => useContext(ScrollProgressContext);

interface SceneManagerProps {
  activeScene: number; // 0=loading, 1=orbit, 2=specimen, etc.
  scrollProgress: number; // 0-1 global scroll progress
  children?: React.ReactNode;
}

const SCENE_Y_OFFSET = -15;
const LERP_FACTOR = 0.05;

export function SceneManager({
  activeScene,
  scrollProgress,
  children,
}: SceneManagerProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 5));

  useFrame(() => {
    // Each scene occupies a different Y-position in 3D space
    const targetY = activeScene * SCENE_Y_OFFSET;
    targetPosition.current.set(0, targetY, 5);

    // Smoothly lerp camera to the active scene's position
    camera.position.lerp(targetPosition.current, LERP_FACTOR);
  });

  return (
    <ScrollProgressContext.Provider
      value={{ progress: scrollProgress, activeScene }}
    >
      {children}
    </ScrollProgressContext.Provider>
  );
}

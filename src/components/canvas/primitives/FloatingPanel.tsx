"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface FloatingPanelProps {
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  opacity?: number;
  glowColor?: string;
  children?: React.ReactNode;
}

export function FloatingPanel({
  width = 3,
  height = 2,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#0A1A12",
  opacity = 0.85,
  glowColor = "#10B981",
  children,
}: FloatingPanelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  // Random offset so multiple panels don't bob in sync
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const baseY = position[1];

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle floating bob animation
      groupRef.current.position.y =
        baseY + Math.sin(clock.elapsedTime + offset) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Glow border — slightly larger, behind main panel */}
      <RoundedBox
        args={[width + 0.06, height + 0.06, 0.02]}
        radius={0.07}
        smoothness={4}
        position={[0, 0, -0.01]}
      >
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.15}
        />
      </RoundedBox>

      {/* Main panel */}
      <RoundedBox
        args={[width, height, 0.02]}
        radius={0.05}
        smoothness={4}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          metalness={0.5}
          roughness={0.3}
        />
      </RoundedBox>

      {children}
    </group>
  );
}

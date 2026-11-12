"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface HolographicTextProps {
  text: string;
  position?: [number, number, number];
  fontSize?: number;
  color?: string;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
}

export function HolographicText({
  text,
  position = [0, 0, 0],
  fontSize = 0.3,
  color = "#10B981",
  anchorX = "center",
  anchorY = "middle",
}: HolographicTextProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    return mat;
  }, [color]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Holographic pulse: emissive oscillates between 0.2 and 0.8
    material.emissiveIntensity = Math.sin(t * 2) * 0.3 + 0.5;
    // Opacity oscillates between 0.7 and 1.0
    material.opacity = Math.sin(t * 1.5) * 0.15 + 0.85;
  });

  return (
    <Text
      position={position}
      fontSize={fontSize}
      anchorX={anchorX}
      anchorY={anchorY}
      material={material}
    >
      {text}
    </Text>
  );
}

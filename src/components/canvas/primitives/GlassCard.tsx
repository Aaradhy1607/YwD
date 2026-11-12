"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

interface GlassCardProps {
  width?: number;
  height?: number;
  depth?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children?: React.ReactNode;
  hovered?: boolean;
  color?: string;
}

export function GlassCard({
  width = 2,
  height = 3,
  depth = 0.05,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
  hovered = false,
  color = "#10B981",
}: GlassCardProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<any>(null!);
  const scaleRef = useRef(1);
  const emissiveRef = useRef(0);

  const emissiveColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((_state, delta) => {
    // Smooth scale transition on hover
    const targetScale = hovered ? 1.05 : 1;
    scaleRef.current = THREE.MathUtils.lerp(
      scaleRef.current,
      targetScale,
      delta * 5
    );
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    // Smooth emissive intensity transition on hover
    const targetEmissive = hovered ? 0.4 : 0;
    emissiveRef.current = THREE.MathUtils.lerp(
      emissiveRef.current,
      targetEmissive,
      delta * 5
    );
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = emissiveRef.current;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <RoundedBox args={[width, height, depth]} radius={0.08} smoothness={4}>
        <MeshTransmissionMaterial
          ref={materialRef}
          backside={true}
          thickness={0.2}
          roughness={0.1}
          transmission={0.95}
          ior={1.5}
          chromaticAberration={0.03}
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0}
        />
      </RoundedBox>
      {children}
    </group>
  );
}

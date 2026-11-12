"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MetallicEmblemProps {
  shape?: "shield" | "lock" | "camera" | "circle";
  position?: [number, number, number];
  size?: number;
  color?: string;
}

function createShieldShape(): THREE.Shape {
  const s = new THREE.Shape();
  // Shield outline: top-left → top-right → bottom point
  s.moveTo(0, 1.2);
  s.bezierCurveTo(0.3, 1.2, 0.6, 1.1, 0.8, 0.9);
  s.bezierCurveTo(1.0, 0.7, 1.0, 0.4, 0.9, 0.1);
  s.bezierCurveTo(0.7, -0.3, 0.4, -0.7, 0, -1.0);
  s.bezierCurveTo(-0.4, -0.7, -0.7, -0.3, -0.9, 0.1);
  s.bezierCurveTo(-1.0, 0.4, -1.0, 0.7, -0.8, 0.9);
  s.bezierCurveTo(-0.6, 1.1, -0.3, 1.2, 0, 1.2);
  return s;
}

function createLockShape(): THREE.Shape {
  const s = new THREE.Shape();
  // Lock body (rectangle)
  s.moveTo(-0.5, -0.6);
  s.lineTo(0.5, -0.6);
  s.lineTo(0.5, 0.3);
  s.lineTo(-0.5, 0.3);
  s.closePath();

  // Lock shackle (arc on top) via a path added to the shape
  const hole = new THREE.Path();
  // Outer arc
  s.moveTo(-0.35, 0.3);
  s.lineTo(-0.35, 0.6);
  s.bezierCurveTo(-0.35, 1.1, 0.35, 1.1, 0.35, 0.6);
  s.lineTo(0.35, 0.3);
  s.lineTo(0.2, 0.3);
  s.lineTo(0.2, 0.6);
  s.bezierCurveTo(0.2, 0.9, -0.2, 0.9, -0.2, 0.6);
  s.lineTo(-0.2, 0.3);
  s.closePath();

  return s;
}

function createCameraShape(): THREE.Shape {
  const s = new THREE.Shape();
  // Camera body rectangle
  s.moveTo(-0.7, -0.4);
  s.lineTo(0.7, -0.4);
  s.lineTo(0.7, 0.4);
  // Viewfinder bump
  s.lineTo(0.3, 0.4);
  s.lineTo(0.2, 0.6);
  s.lineTo(-0.2, 0.6);
  s.lineTo(-0.3, 0.4);
  s.lineTo(-0.7, 0.4);
  s.closePath();

  // Lens (circular hole)
  const lens = new THREE.Path();
  const segments = 32;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * 0.22;
    const y = Math.sin(angle) * 0.22;
    if (i === 0) {
      lens.moveTo(x, y);
    } else {
      lens.lineTo(x, y);
    }
  }
  s.holes.push(lens);

  return s;
}

function createCircleShape(): THREE.Shape {
  const s = new THREE.Shape();
  const segments = 48;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * 0.6;
    const y = Math.sin(angle) * 0.6;
    if (i === 0) {
      s.moveTo(x, y);
    } else {
      s.lineTo(x, y);
    }
  }
  return s;
}

const shapeFactories: Record<string, () => THREE.Shape> = {
  shield: createShieldShape,
  lock: createLockShape,
  camera: createCameraShape,
  circle: createCircleShape,
};

export function MetallicEmblem({
  shape = "shield",
  position = [0, 0, 0],
  size = 0.5,
  color = "#10B981",
}: MetallicEmblemProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const factory = shapeFactories[shape] ?? createCircleShape;
    const threeShape = factory();
    const geo = new THREE.ExtrudeGeometry(threeShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    geo.center();
    return geo;
  }, [shape]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      scale={[size, size, size]}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

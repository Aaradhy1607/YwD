"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Billboard,
  Text,
  MeshDistortMaterial,
  Sphere,
} from "@react-three/drei";
import * as THREE from "three";

// ── Per-orbiter configuration (radius, speed, tilt, phase offset) ──────
interface OrbiterConfig {
  radius: number;
  speed: number;
  tilt: number;
  offset: number;
  color: string;
}

function buildOrbiterConfigs(count: number): OrbiterConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    radius: 2.8 + i * 0.35,
    speed: 0.25 + i * 0.05,
    tilt: 0.35 + i * 0.2,
    offset: (i * Math.PI * 2) / count,
    color: "#10B981",
  }));
}

// ── Orbital rings (visual guides) ──────────────────────────────────────
const RING_CONFIGS = [
  { radius: 2.6, rotation: new THREE.Euler(Math.PI / 2, 0, 0), speedFactor: 0.04 },
  { radius: 3.2, rotation: new THREE.Euler(Math.PI / 2.3, 0.2, 0.3), speedFactor: -0.02 },
  { radius: 3.8, rotation: new THREE.Euler(Math.PI / 1.9, -0.15, 0.6), speedFactor: 0.03 },
] as const;

// ── Props ──────────────────────────────────────────────────────────────
interface OrbitSceneProps {
  isActive: boolean;
  scrollProgress: number; // 0-1 for this section
  categoryCount?: number;
}

// ═══════════════════════════════════════════════════════════════════════
//  OrbitScene — Refined Atmospheric Three.js 3D scene for hero background
// ═══════════════════════════════════════════════════════════════════════
export function OrbitScene({
  isActive,
  scrollProgress,
  categoryCount = 6,
}: OrbitSceneProps) {
  // ── Refs ──────────────────────────────────────────────────────────
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const orbiterRefs = useRef<THREE.Group[]>([]);
  const ringRefs = useRef<THREE.Mesh[]>([]);

  const { pointer } = useThree();

  // ── Memoised orbiter configs ─────────────────────────────────────
  const orbiterConfigs = useMemo(
    () => buildOrbiterConfigs(categoryCount),
    [categoryCount],
  );

  // ── Ring geometries ──────────────────────────────────────────────
  const ringGeometries = useMemo(
    () =>
      RING_CONFIGS.map(
        (cfg) => new THREE.TorusGeometry(cfg.radius, 0.003, 8, 120),
      ),
    [],
  );

  // ── Animation loop ───────────────────────────────────────────────
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const sp = THREE.MathUtils.clamp(scrollProgress, 0, 1);

    // Subtle group-level mouse parallax without mutating global camera
    if (groupRef.current) {
      const targetRotY = pointer.x * 0.15;
      const targetRotX = -pointer.y * 0.1;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);

      // Deepen Z depth on scroll
      const targetZ = THREE.MathUtils.lerp(0, -4, sp);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
    }

    // ── Central sphere rotation and refined scroll scaling ───────────
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.x += delta * 0.05;

      const targetScale = THREE.MathUtils.lerp(1, 0.4, sp);
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, targetScale, 0.06),
      );
    }

    // ── Orbiting satellites ─────────────────────────────────────────
    orbiterConfigs.forEach((cfg, i) => {
      const orbRef = orbiterRefs.current[i];
      if (!orbRef) return;

      const speed = cfg.speed * (1 + sp * 0.5);
      const radius = cfg.radius * (1 + sp * 0.3);

      const x = radius * Math.cos(t * speed + cfg.offset);
      const z = radius * Math.sin(t * speed + cfg.offset);
      const y = cfg.tilt * Math.sin(t * speed * 0.5 + cfg.offset);

      orbRef.position.set(x, y, z);
    });

    // ── Orbital rings rotation ──────────────────────────────────────
    RING_CONFIGS.forEach((cfg, i) => {
      const ring = ringRefs.current[i];
      if (!ring) return;
      ring.rotation.z += delta * cfg.speedFactor;
    });
  });

  const setOrbiterRef = (index: number) => (el: THREE.Group | null) => {
    if (el) orbiterRefs.current[index] = el;
  };

  const setRingRef = (index: number) => (el: THREE.Mesh | null) => {
    if (el) ringRefs.current[index] = el;
  };

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {/* ─── Refined Studio Lighting ──────────────────────────────── */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 8, 4]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-4, -3, 2]} intensity={0.3} color="#10B981" />

      {/* ─── Central Celestial Sphere (Translucent, Elegant, Non-Intrusive) ─ */}
      <Sphere ref={coreRef} args={[1.2, 48, 48]}>
        <MeshDistortMaterial
          color="#062016"
          emissive="#10B981"
          emissiveIntensity={0.12}
          metalness={0.7}
          roughness={0.3}
          distort={0.18}
          speed={1.5}
          transparent
          opacity={0.35}
          wireframe={false}
        />
      </Sphere>

      {/* Inner Wireframe Matrix for High-Tech Aesthetic */}
      <Sphere args={[1.18, 24, 24]}>
        <meshBasicMaterial
          color="#10B981"
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* ─── Orbiting Satellite Nodes (Clean luminous points, no text clutter) ─ */}
      {orbiterConfigs.map((cfg, i) => (
        <Float key={`orbiter-${i}`} speed={1.2} rotationIntensity={0.2} floatIntensity={0.2}>
          <group ref={setOrbiterRef(i)}>
            {/* Luminous node */}
            <Sphere args={[0.07, 16, 16]}>
              <meshStandardMaterial
                color="#10B981"
                emissive="#10B981"
                emissiveIntensity={0.4}
                transparent
                opacity={0.6}
              />
            </Sphere>

            {/* Subtle glow halo */}
            <Sphere args={[0.14, 12, 12]}>
              <meshBasicMaterial
                color="#10B981"
                transparent
                opacity={0.08}
                depthWrite={false}
              />
            </Sphere>
          </group>
        </Float>
      ))}

      {/* ─── Delicate Gyroscopic Orbital Rings ────────────────────────── */}
      {RING_CONFIGS.map((cfg, i) => (
        <mesh
          key={`ring-${i}`}
          ref={setRingRef(i)}
          rotation={cfg.rotation}
          geometry={ringGeometries[i]}
        >
          <meshBasicMaterial
            color="#10B981"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

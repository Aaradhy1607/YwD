"use client";

import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface LoadingGateProps {
  onComplete: () => void;
  isActive: boolean;
}

const PARTICLE_COUNT = 500;
const STAR_COUNT = 200;

/**
 * Generate target positions that spell "YwD" by sampling a hidden canvas.
 * Returns a Float32Array of length count*3.
 */
function generateTextPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  // We can't use canvas on the server, so generate deterministic positions
  // that approximate the "YwD" letter forms.
  // Y: two diagonal strokes meeting at center, then a vertical drop
  // w: a W shape
  // D: a vertical bar and a curve

  const letterPoints: [number, number][] = [];

  // Generate "YwD" by sampling a 2D canvas
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 48px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YwD", 128, 32);

      const imageData = ctx.getImageData(0, 0, 256, 64);
      const pixels = imageData.data;

      // Collect all white pixel positions
      for (let y = 0; y < 64; y += 1) {
        for (let x = 0; x < 256; x += 1) {
          const idx = (y * 256 + x) * 4;
          if (pixels[idx] > 128) {
            letterPoints.push([x, y]);
          }
        }
      }
    }
  }

  // If we got canvas points, sample from them; otherwise use fallback
  if (letterPoints.length > 0) {
    for (let i = 0; i < count; i++) {
      const sample = letterPoints[Math.floor(Math.random() * letterPoints.length)];
      // Map canvas coords to 3D: x: 0-256 → -3 to 3, y: 0-64 → 1 to -1
      positions[i * 3] = (sample[0] / 256) * 6 - 3;
      positions[i * 3 + 1] = -(sample[1] / 64) * 2 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // slight z scatter
    }
  } else {
    // SSR fallback: distribute along approximate letter shapes
    for (let i = 0; i < count; i++) {
      const t = i / count;
      positions[i * 3] = (t - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
  }

  return positions;
}

function generateScatterPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Random positions on a sphere of radius 8
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * 5; // radius 3-8
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/** Radial glow mesh at center */
function CenterGlow() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#10B981",
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );

  return (
    <mesh>
      <sphereGeometry args={[2.5, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** Star field background */
function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);

  const starPositions = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 15 + Math.random() * 20;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < STAR_COUNT; i++) {
      matrix.makeTranslation(
        starPositions[i * 3],
        starPositions[i * 3 + 1],
        starPositions[i * 3 + 2]
      );
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [starPositions, matrix]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.15}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export function LoadingGate({ onComplete, isActive }: LoadingGateProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const elapsedRef = useRef(0);
  const phaseRef = useRef(0);
  const completedRef = useRef(false);
  const { camera } = useThree();

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  const { startPositions, targetPositions } = useMemo(() => {
    return {
      startPositions: generateScatterPositions(PARTICLE_COUNT),
      targetPositions: generateTextPositions(PARTICLE_COUNT),
    };
  }, []);

  // Store per-particle drift velocities for phase 0
  const driftVelocities = useMemo(() => {
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return vel;
  }, []);

  // Current positions (mutable working buffer)
  const currentPositions = useMemo(
    () => new Float32Array(startPositions),
    [startPositions]
  );

  const geometry = useMemo(() => new THREE.SphereGeometry(0.03, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#10B981",
        emissive: "#10B981",
        emissiveIntensity: 0.5,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!isActive || !meshRef.current) return;

    elapsedRef.current += delta;
    const t = elapsedRef.current;
    const mesh = meshRef.current;

    // Determine phase
    if (t < 2) {
      phaseRef.current = 0;
    } else if (t < 4) {
      phaseRef.current = 1;
    } else if (t < 5) {
      phaseRef.current = 2;
    } else {
      phaseRef.current = 3;
    }

    const phase = phaseRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let x: number, y: number, z: number;
      let scale = 1;

      if (phase === 0) {
        // Scatter: drift randomly
        currentPositions[i3] = startPositions[i3] + driftVelocities[i3] * t * 60;
        currentPositions[i3 + 1] =
          startPositions[i3 + 1] + driftVelocities[i3 + 1] * t * 60;
        currentPositions[i3 + 2] =
          startPositions[i3 + 2] + driftVelocities[i3 + 2] * t * 60;
        x = currentPositions[i3];
        y = currentPositions[i3 + 1];
        z = currentPositions[i3 + 2];
      } else if (phase === 1) {
        // Converge: lerp from current scattered pos to target
        const phaseT = (t - 2) / 2; // 0 to 1
        // Ease-in-out cubic
        const eased =
          phaseT < 0.5
            ? 4 * phaseT * phaseT * phaseT
            : 1 - Math.pow(-2 * phaseT + 2, 3) / 2;

        x = THREE.MathUtils.lerp(
          startPositions[i3] + driftVelocities[i3] * 2 * 60,
          targetPositions[i3],
          eased
        );
        y = THREE.MathUtils.lerp(
          startPositions[i3 + 1] + driftVelocities[i3 + 1] * 2 * 60,
          targetPositions[i3 + 1],
          eased
        );
        z = THREE.MathUtils.lerp(
          startPositions[i3 + 2] + driftVelocities[i3 + 2] * 2 * 60,
          targetPositions[i3 + 2],
          eased
        );
      } else if (phase === 2) {
        // Hold: subtle pulse
        const pulse = 1 + 0.03 * Math.sin(t * 4 + i * 0.1);
        x = targetPositions[i3] * pulse;
        y = targetPositions[i3 + 1] * pulse;
        z = targetPositions[i3 + 2];
        scale = pulse;
      } else {
        // Phase 3: punch through — particles scale up and fly past
        const phaseT = Math.min((t - 5) / 1, 1); // 0 to 1 over 1 second
        scale = 1 + phaseT * 3;
        x = targetPositions[i3] * (1 + phaseT * 2);
        y = targetPositions[i3 + 1] * (1 + phaseT * 2);
        z = targetPositions[i3 + 2] + phaseT * 5;
      }

      matrix.makeTranslation(x, y, z);
      if (scale !== 1) {
        matrix.scale(tempVec.set(scale, scale, scale));
      }
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Update emissive intensity for glow during hold phase
    if (phase === 2) {
      const glowPulse = 0.5 + 0.3 * Math.sin(t * 3);
      material.emissiveIntensity = glowPulse;
    }

    // Camera animation during phase 3
    if (phase === 3) {
      const phaseT = Math.min((t - 5) / 1, 1);
      // Ease-in: accelerate through the logo
      const eased = phaseT * phaseT * phaseT;
      camera.position.z = THREE.MathUtils.lerp(5, -10, eased);
    }

    // Completion
    if (t >= 6 && !completedRef.current) {
      completedRef.current = true;
      // Reset camera for the next scene
      camera.position.z = 5;
      onComplete();
    }
  });

  if (!isActive) return null;

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 3]} intensity={2} color="#10B981" />

      {/* Main particle system */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, PARTICLE_COUNT]}
      />

      {/* Star field background */}
      <StarField />

      {/* Center glow */}
      <CenterGlow />
    </group>
  );
}

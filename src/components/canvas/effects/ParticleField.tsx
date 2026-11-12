"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  scrollVelocity?: number;
  color?: string;
}

export function ParticleField({
  count = 300,
  scrollVelocity = 0,
  color = "#10B981",
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random positions in a box -10 to 10 on each axis
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Random base velocities (slow drift)
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = 0.001 + Math.random() * 0.001; // upward bias
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    return { positions: pos, velocities: vel };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.02,
        color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    [color]
  );

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionAttr = pointsRef.current.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const posArray = positionAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Base upward drift
      posArray[i3 + 1] += velocities[i3 + 1];

      // Sinusoidal wobble on x/z
      posArray[i3] += Math.sin(time * 0.5 + i * 0.1) * 0.0005;
      posArray[i3 + 2] += Math.cos(time * 0.3 + i * 0.15) * 0.0005;

      // Scroll velocity streaking in Y direction
      if (scrollVelocity > 0) {
        posArray[i3 + 1] += scrollVelocity * 0.0001;
      }

      // Wrap around bounds (-10 to 10)
      if (posArray[i3] > 10) posArray[i3] = -10;
      if (posArray[i3] < -10) posArray[i3] = 10;
      if (posArray[i3 + 1] > 10) posArray[i3 + 1] = -10;
      if (posArray[i3 + 1] < -10) posArray[i3 + 1] = 10;
      if (posArray[i3 + 2] > 10) posArray[i3 + 2] = -10;
      if (posArray[i3 + 2] < -10) posArray[i3 + 2] = 10;
    }

    positionAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

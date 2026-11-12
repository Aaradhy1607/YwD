"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

interface ExplodedViewProps {
  activeComponentId: string;
  isHovered?: boolean;
}

export function ExplodedView({ activeComponentId }: ExplodedViewProps) {
  const groupRef = useRef<THREE.Group>(null);
  const displayLayerRef = useRef<THREE.Group>(null);
  const socLayerRef = useRef<THREE.Group>(null);
  const thermalLayerRef = useRef<THREE.Group>(null);
  const storageLayerRef = useRef<THREE.Group>(null);
  const chassisLayerRef = useRef<THREE.Group>(null);

  // Fan rotation for thermal system
  const fan1Ref = useRef<THREE.Mesh>(null);
  const fan2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Gentle floating idle rotation
    groupRef.current.rotation.y += delta * 0.25;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.08 + 0.35;

    // Spin thermal impeller fans
    if (fan1Ref.current) fan1Ref.current.rotation.z += delta * 6;
    if (fan2Ref.current) fan2Ref.current.rotation.z -= delta * 6;

    // Exploded layer separation offsets based on activeComponentId
    // Base exploded positions
    const isDisplay = activeComponentId === "display";
    const isSoc = activeComponentId === "soc";
    const isThermal = activeComponentId === "thermal";
    const isStorage = activeComponentId === "storage";
    const isEscrow = activeComponentId === "escrow";

    // Target Y positions for each hardware layer (exploded view)
    const targetDisplayY = isDisplay ? 1.6 : 1.1;
    const targetSocY = isSoc ? 0.7 : 0.45;
    const targetThermalY = isThermal ? 0.0 : -0.1;
    const targetStorageY = isStorage ? -0.7 : -0.6;
    const targetChassisY = isEscrow ? -1.5 : -1.1;

    if (displayLayerRef.current) {
      displayLayerRef.current.position.y = THREE.MathUtils.lerp(
        displayLayerRef.current.position.y,
        targetDisplayY,
        0.1
      );
      displayLayerRef.current.scale.setScalar(
        THREE.MathUtils.lerp(displayLayerRef.current.scale.x, isDisplay ? 1.08 : 1, 0.1)
      );
    }

    if (socLayerRef.current) {
      socLayerRef.current.position.y = THREE.MathUtils.lerp(
        socLayerRef.current.position.y,
        targetSocY,
        0.1
      );
      socLayerRef.current.scale.setScalar(
        THREE.MathUtils.lerp(socLayerRef.current.scale.x, isSoc ? 1.1 : 1, 0.1)
      );
    }

    if (thermalLayerRef.current) {
      thermalLayerRef.current.position.y = THREE.MathUtils.lerp(
        thermalLayerRef.current.position.y,
        targetThermalY,
        0.1
      );
      thermalLayerRef.current.scale.setScalar(
        THREE.MathUtils.lerp(thermalLayerRef.current.scale.x, isThermal ? 1.08 : 1, 0.1)
      );
    }

    if (storageLayerRef.current) {
      storageLayerRef.current.position.y = THREE.MathUtils.lerp(
        storageLayerRef.current.position.y,
        targetStorageY,
        0.1
      );
      storageLayerRef.current.scale.setScalar(
        THREE.MathUtils.lerp(storageLayerRef.current.scale.x, isStorage ? 1.1 : 1, 0.1)
      );
    }

    if (chassisLayerRef.current) {
      chassisLayerRef.current.position.y = THREE.MathUtils.lerp(
        chassisLayerRef.current.position.y,
        targetChassisY,
        0.1
      );
      chassisLayerRef.current.scale.setScalar(
        THREE.MathUtils.lerp(chassisLayerRef.current.scale.x, isEscrow ? 1.08 : 1, 0.1)
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 2, 3]} intensity={0.8} color="#10B981" />
      <pointLight position={[3, -2, -2]} intensity={0.5} color="#34D399" />

      {/* ── LAYER 1: Liquid Retina XDR Display ─────────────────── */}
      <group ref={displayLayerRef} position={[0, 1.1, 0]}>
        {/* Glass panel */}
        <RoundedBox args={[3.2, 0.04, 2.1]} radius={0.04} smoothness={4}>
          <meshPhysicalMaterial
            color={activeComponentId === "display" ? "#10B981" : "#0F1A15"}
            emissive={activeComponentId === "display" ? "#10B981" : "#000000"}
            emissiveIntensity={activeComponentId === "display" ? 0.35 : 0}
            roughness={0.1}
            metalness={0.2}
            transmission={0.6}
            thickness={0.08}
            transparent
            opacity={0.85}
          />
        </RoundedBox>
        {/* Active border wireframe */}
        {activeComponentId === "display" && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(3.22, 0.05, 2.12)]} />
            <lineBasicMaterial color="#34D399" linewidth={2} />
          </lineSegments>
        )}
      </group>

      {/* ── LAYER 2: Apple M3 Max Silicon & Logic Board ───────── */}
      <group ref={socLayerRef} position={[0, 0.45, 0]}>
        {/* Motherboard PCB */}
        <RoundedBox args={[3.0, 0.03, 1.9]} radius={0.02} smoothness={2}>
          <meshStandardMaterial
            color="#09140F"
            roughness={0.4}
            metalness={0.6}
          />
        </RoundedBox>

        {/* M3 Max Die (Center Chip) */}
        <RoundedBox args={[0.7, 0.06, 0.7]} position={[0, 0.04, 0]} radius={0.02} smoothness={2}>
          <meshStandardMaterial
            color={activeComponentId === "soc" ? "#10B981" : "#1A2E25"}
            emissive={activeComponentId === "soc" ? "#10B981" : "#0D1E16"}
            emissiveIntensity={activeComponentId === "soc" ? 0.8 : 0.2}
            metalness={0.9}
            roughness={0.2}
          />
        </RoundedBox>

        {/* Unified Memory (RAM Modules flanking the die) */}
        <RoundedBox args={[0.3, 0.05, 0.6]} position={[-0.6, 0.03, 0]} radius={0.01}>
          <meshStandardMaterial color="#12251D" metalness={0.8} roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.05, 0.6]} position={[0.6, 0.03, 0]} radius={0.01}>
          <meshStandardMaterial color="#12251D" metalness={0.8} roughness={0.3} />
        </RoundedBox>
      </group>

      {/* ── LAYER 3: Dual Impeller Thermal Dissipation ────────── */}
      <group ref={thermalLayerRef} position={[0, -0.1, 0]}>
        {/* Anodized Copper Heat Pipes */}
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4, 16]} />
          <meshStandardMaterial
            color={activeComponentId === "thermal" ? "#E07A5F" : "#B85D43"}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Left Blower Fan */}
        <group position={[-0.9, 0, -0.2]}>
          <mesh ref={fan1Ref}>
            <cylinderGeometry args={[0.38, 0.38, 0.06, 8]} />
            <meshStandardMaterial
              color={activeComponentId === "thermal" ? "#10B981" : "#243830"}
              emissive={activeComponentId === "thermal" ? "#10B981" : "#000"}
              emissiveIntensity={activeComponentId === "thermal" ? 0.4 : 0}
              metalness={0.6}
              roughness={0.3}
              wireframe={true}
            />
          </mesh>
        </group>

        {/* Right Blower Fan */}
        <group position={[0.9, 0, -0.2]}>
          <mesh ref={fan2Ref}>
            <cylinderGeometry args={[0.38, 0.38, 0.06, 8]} />
            <meshStandardMaterial
              color={activeComponentId === "thermal" ? "#10B981" : "#243830"}
              emissive={activeComponentId === "thermal" ? "#10B981" : "#000"}
              emissiveIntensity={activeComponentId === "thermal" ? 0.4 : 0}
              metalness={0.6}
              roughness={0.3}
              wireframe={true}
            />
          </mesh>
        </group>
      </group>

      {/* ── LAYER 4: High-Throughput NVMe Solid State Module ───── */}
      <group ref={storageLayerRef} position={[0, -0.6, 0]}>
        {/* M.2 Storage Blade */}
        <RoundedBox args={[1.6, 0.03, 0.55]} position={[0, 0, 0.2]} radius={0.01}>
          <meshStandardMaterial
            color={activeComponentId === "storage" ? "#10B981" : "#0B1812"}
            emissive={activeComponentId === "storage" ? "#10B981" : "#000"}
            emissiveIntensity={activeComponentId === "storage" ? 0.5 : 0}
            metalness={0.7}
            roughness={0.3}
          />
        </RoundedBox>

        {/* NAND Flash Packages */}
        {[-0.5, 0, 0.5].map((xOffset, i) => (
          <RoundedBox key={`nand-${i}`} args={[0.35, 0.04, 0.35]} position={[xOffset, 0.03, 0.2]} radius={0.01}>
            <meshStandardMaterial
              color={activeComponentId === "storage" ? "#22C55E" : "#1A2E24"}
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
        ))}
      </group>

      {/* ── LAYER 5: Unibody Chassis & Cryptographic Escrow Vault ── */}
      <group ref={chassisLayerRef} position={[0, -1.1, 0]}>
        {/* Anodized Aluminum Enclosure */}
        <RoundedBox args={[3.3, 0.1, 2.2]} radius={0.06} smoothness={4}>
          <meshStandardMaterial
            color={activeComponentId === "escrow" ? "#143026" : "#0A130F"}
            emissive={activeComponentId === "escrow" ? "#10B981" : "#000"}
            emissiveIntensity={activeComponentId === "escrow" ? 0.25 : 0}
            metalness={0.85}
            roughness={0.25}
          />
        </RoundedBox>

        {/* Cryptographic Ledger Token Emblem */}
        <group position={[0, 0.08, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.28, 32]} />
            <meshBasicMaterial
              color={activeComponentId === "escrow" ? "#10B981" : "#244A3A"}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}


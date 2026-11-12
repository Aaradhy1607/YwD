"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Torus, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface AccessJourneyProps {
  activeStep: number; // 0: Escrow, 1: Hub, 2: OTP, 3: Refund
}

export function AccessJourney({ activeStep }: AccessJourneyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Ambient floating rotation
    groupRef.current.rotation.y += delta * 0.3;

    // Continuous dynamic gyroscopic ring rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.5;
      ring1Ref.current.rotation.y += delta * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.6;
      ring2Ref.current.rotation.z += delta * 0.3;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.5;
      ring3Ref.current.rotation.x -= delta * 0.3;
    }

    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 5, 4]} intensity={1.5} color="#10B981" />
      <pointLight position={[-4, -4, -2]} intensity={0.8} color="#34D399" />

      {/* Outer Gyroscopic Verification Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#10B981"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.6}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#34D399"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.4, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#059669"
          emissive="#059669"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Dynamic 3D Artifacts Morphing According to Active Step */}
      <group ref={coreRef}>
        {/* STEP 0: Escrow Capital Shield & Safe Vault Cube */}
        {activeStep === 0 && (
          <Float speed={2} rotationIntensity={0.4} floatIntensity={0.3}>
            <RoundedBox args={[1.1, 1.1, 1.1]} radius={0.15} smoothness={4}>
              <meshPhysicalMaterial
                color="#064E3B"
                emissive="#10B981"
                emissiveIntensity={0.4}
                metalness={0.9}
                roughness={0.15}
                transmission={0.4}
                thickness={0.5}
                transparent
                opacity={0.9}
              />
            </RoundedBox>
            {/* Inner Vault Core */}
            <Sphere args={[0.35, 24, 24]}>
              <meshStandardMaterial
                color="#34D399"
                emissive="#34D399"
                emissiveIntensity={1}
              />
            </Sphere>
          </Float>
        )}

        {/* STEP 1: Handover Hub Coordinate Beacon */}
        {activeStep === 1 && (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
            <group>
              {/* Octahedron Pin Marker */}
              <mesh position={[0, 0.4, 0]}>
                <octahedronGeometry args={[0.7, 0]} />
                <meshStandardMaterial
                  color="#10B981"
                  emissive="#10B981"
                  emissiveIntensity={0.6}
                  metalness={0.8}
                  roughness={0.2}
                  wireframe={false}
                />
              </mesh>
              {/* Base Radar Beacon Ring */}
              <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.9, 32]} />
                <meshBasicMaterial
                  color="#34D399"
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          </Float>
        )}

        {/* STEP 2: Dual-OTP Cryptographic Cylinder Dial */}
        {activeStep === 2 && (
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
            <group>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.65, 0.65, 1.2, 24]} />
                <meshStandardMaterial
                  color="#0F2B20"
                  emissive="#10B981"
                  emissiveIntensity={0.3}
                  metalness={0.85}
                  roughness={0.2}
                />
              </mesh>
              {/* Number/Hash Notch Ring */}
              {[-0.3, 0, 0.3].map((xOffset, i) => (
                <mesh key={`notch-${i}`} position={[xOffset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.68, 0.03, 12, 32]} />
                  <meshBasicMaterial color="#34D399" />
                </mesh>
              ))}
            </group>
          </Float>
        )}

        {/* STEP 3: Automated UPI Refund Flow Pipeline */}
        {activeStep === 3 && (
          <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.4}>
            <group>
              {/* Torus Knot of Flowing Capital Liquidity */}
              <mesh>
                <torusKnotGeometry args={[0.6, 0.16, 64, 16]} />
                <meshStandardMaterial
                  color="#059669"
                  emissive="#10B981"
                  emissiveIntensity={0.7}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
              {/* Orbiting Settlement Sparks */}
              {[0, 1, 2].map((i) => (
                <mesh
                  key={`spark-${i}`}
                  position={[
                    Math.cos((i * Math.PI * 2) / 3) * 1.1,
                    Math.sin((i * Math.PI * 2) / 3) * 1.1,
                    0,
                  ]}
                >
                  <sphereGeometry args={[0.08, 16, 16]} />
                  <meshBasicMaterial color="#34D399" />
                </mesh>
              ))}
            </group>
          </Float>
        )}
      </group>
    </group>
  );
}


"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export function ChefCharacter({
  color,
  position,
  facing,
}: {
  color: string;
  position: [number, number, number];
  facing: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(position[0], position[1], position[2]);
    // Interpolación corta hacia el ángulo de orientación, para que el giro no sea instantáneo.
    const current = groupRef.current.rotation.y;
    let diff = facing - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y = current + diff * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Cuerpo */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color="#f2c9a0" />
      </mesh>
      {/* Gorro de chef */}
      <mesh position={[0, 1.24, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.22, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.37, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Frente (indica hacia dónde mira) */}
      <mesh position={[0, 0.98, 0.22]}>
        <boxGeometry args={[0.28, 0.08, 0.05]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      {/* Brazos */}
      <mesh position={[0.32, 0.5, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.32, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.32, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.32, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

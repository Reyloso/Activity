"use client";

import type { Carrying } from "@/components/cocina-loca/game-types";

const INGREDIENT_COLOR: Record<string, string> = {
  lechuga: "#4caf50",
  tomate: "#e53935",
};

export function CarriedItem({ carrying, position }: { carrying: Carrying; position: [number, number, number] }) {
  if (!carrying) return null;

  if (carrying.kind === "ingrediente") {
    return (
      <mesh position={[position[0], 1.55, position[2]]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={INGREDIENT_COLOR[carrying.ingrediente]} />
      </mesh>
    );
  }

  if (carrying.kind === "salsa") {
    return (
      <mesh position={[position[0], 1.55, position[2]]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#ff7043" />
      </mesh>
    );
  }

  if (carrying.kind === "quemado") {
    return (
      <mesh position={[position[0], 1.55, position[2]]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    );
  }

  if (carrying.kind === "platoSucio") {
    return (
      <mesh position={[position[0], 1.5, position[2]]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
    );
  }

  // plato (posiblemente con contenido)
  return (
    <group position={[position[0], 1.5, position[2]]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {carrying.contenido.map((item, i) => (
        <mesh key={item} position={[(i - 0.5) * 0.14, 0.08, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={item === "lechuga" ? INGREDIENT_COLOR.lechuga : "#ff7043"} />
        </mesh>
      ))}
    </group>
  );
}

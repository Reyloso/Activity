"use client";

import type { Carrying } from "@/components/cocina-loca/game-types";

const INGREDIENT_COLOR: Record<string, string> = {
  lechuga: "#4caf50",
  tomate: "#e53935",
};

export function ItemMesh({ item }: { item: Carrying }) {
  if (!item) return null;

  if (item.kind === "ingrediente") {
    return (
      <mesh castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={INGREDIENT_COLOR[item.ingrediente]} />
      </mesh>
    );
  }

  if (item.kind === "salsa") {
    return (
      <mesh castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#ff7043" />
      </mesh>
    );
  }

  if (item.kind === "quemado") {
    return (
      <mesh castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    );
  }

  if (item.kind === "platoSucio") {
    return (
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
    );
  }

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {item.contenido.map((content, i) => (
        <mesh key={content} position={[(i - 0.5) * 0.14, 0.08, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={content === "lechuga" ? INGREDIENT_COLOR.lechuga : "#ff7043"} />
        </mesh>
      ))}
    </group>
  );
}

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
      <mesh castShadow>
        {/* El cilindro ya queda plano (disco horizontal) sin rotación extra. */}
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
    );
  }

  if (item.kind === "olla") {
    const stateColor =
      item.content === null
        ? null
        : item.content.state === "quemado"
          ? "#2b2b2b"
          : item.content.state === "listo"
            ? "#ff7043"
            : "#a1887f";
    return (
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.19, 0.17, 0.14, 20]} />
          <meshStandardMaterial color="#616161" />
        </mesh>
        <mesh position={[0.2, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
        <mesh position={[-0.2, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#424242" />
        </mesh>
        {stateColor && (
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color={stateColor} />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow>
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

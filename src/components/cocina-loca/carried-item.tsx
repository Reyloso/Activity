"use client";

import { ItemMesh } from "@/components/cocina-loca/item-mesh";
import type { Carrying } from "@/components/cocina-loca/game-types";

export function CarriedItem({ carrying, position }: { carrying: Carrying; position: [number, number, number] }) {
  if (!carrying) return null;
  const y = carrying.kind === "plato" || carrying.kind === "platoSucio" ? 1.5 : 1.55;
  return (
    <group position={[position[0], y, position[2]]}>
      <ItemMesh item={carrying} />
    </group>
  );
}

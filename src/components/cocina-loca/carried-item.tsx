"use client";

import { ItemMesh } from "@/components/cocina-loca/item-mesh";
import type { Carrying } from "@/components/cocina-loca/game-types";

const HAND_HEIGHT = 0.62;
const HAND_FORWARD_OFFSET = 0.34;

export function CarriedItem({
  carrying,
  position,
  facing,
}: {
  carrying: Carrying;
  position: [number, number, number];
  facing: number;
}) {
  if (!carrying) return null;
  const fx = Math.sin(facing);
  const fz = Math.cos(facing);
  return (
    <group
      position={[
        position[0] + fx * HAND_FORWARD_OFFSET,
        HAND_HEIGHT,
        position[2] + fz * HAND_FORWARD_OFFSET,
      ]}
    >
      <ItemMesh item={carrying} />
    </group>
  );
}

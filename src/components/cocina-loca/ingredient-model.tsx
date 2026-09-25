"use client";

import { Clone, useGLTF } from "@react-three/drei";
import type { Ingredient } from "@/components/cocina-loca/game-types";

/**
 * Modelos reales (Kenney "Food Kit", CC0) para los ingredientes que tienen un equivalente
 * disponible. "camaron" no tiene modelo en el pack, así que se sigue dibujando con la
 * esfera de color de siempre (ver ItemMesh/RawIngredient).
 */
export const INGREDIENT_MODEL_PATH: Partial<Record<Ingredient, string>> = {
  lechuga: "/models/food/cabbage.glb",
  tomate: "/models/food/tomato.glb",
  cebolla: "/models/food/onion.glb",
  pescado: "/models/food/fish.glb",
  carne: "/models/food/meat-raw.glb",
};

/** Escala para que cada modelo (con tamaño "real" propio) quede proporcionado en la tabla/cofre. */
const INGREDIENT_MODEL_SCALE: Partial<Record<Ingredient, number>> = {
  lechuga: 1.3,
  tomate: 2.3,
  cebolla: 1.6,
  pescado: 0.72,
  carne: 0.82,
};

for (const path of Object.values(INGREDIENT_MODEL_PATH)) {
  if (path) useGLTF.preload(path);
}

export function IngredientModel({
  ingredient,
  position = [0, 0, 0],
  rotationY = 0,
}: {
  ingredient: Ingredient;
  position?: [number, number, number];
  rotationY?: number;
}) {
  const path = INGREDIENT_MODEL_PATH[ingredient]!;
  const { scene } = useGLTF(path);
  return (
    <Clone
      object={scene}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={INGREDIENT_MODEL_SCALE[ingredient] ?? 1}
      castShadow
    />
  );
}

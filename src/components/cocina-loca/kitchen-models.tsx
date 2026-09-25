"use client";

import { useGLTF } from "@react-three/drei";

export const STOVE_MODEL = "/models/kitchen/kitchenStove.glb";
export const SINK_MODEL = "/models/kitchen/kitchenSink.glb";
export const TRASHCAN_MODEL = "/models/kitchen/trashcan.glb";
export const WALL_MODEL = "/models/kitchen/wall.glb";
export const WALL_CORNER_MODEL = "/models/kitchen/wallCorner.glb";
export const CUTTING_BOARD_MODEL = "/models/food/cutting-board.glb";
export const KNIFE_MODEL = "/models/food/cooking-knife.glb";
export const PLATE_MODEL = "/models/food/plate.glb";
export const CONVEYOR_MODEL = "/models/kitchen/conveyor.glb";

/** Offset para recentrar el modelo de estufa/lavaplatos: su malla no está centrada en su origen. */
export const STOVE_SINK_MODEL_OFFSET: [number, number, number] = [-0.376, 0, 0.368];

const ALL_KITCHEN_MODELS = [
  STOVE_MODEL,
  SINK_MODEL,
  TRASHCAN_MODEL,
  WALL_MODEL,
  WALL_CORNER_MODEL,
  CUTTING_BOARD_MODEL,
  KNIFE_MODEL,
  PLATE_MODEL,
  CONVEYOR_MODEL,
];

for (const path of ALL_KITCHEN_MODELS) useGLTF.preload(path);

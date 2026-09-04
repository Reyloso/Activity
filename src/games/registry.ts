import type { GameConfig } from "./types";
import { urgenteOImportante } from "./urgente-o-importante/game.config";

export const gameRegistry: GameConfig[] = [urgenteOImportante];

export function getGameConfig(slug: string) {
  return gameRegistry.find((game) => game.slug === slug);
}

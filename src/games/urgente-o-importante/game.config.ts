import type { GameConfig } from "@/games/types";
import UrgenteOImportanteGame from "./game";

export const urgenteOImportante: GameConfig = {
  slug: "urgente-o-importante",
  title: "¿Urgente o importante?",
  description: "Clasifica 8 situaciones rápidas y pon a prueba lo que aprendiste sobre priorización.",
  coverColor: "B85042",
  Component: UrgenteOImportanteGame,
};

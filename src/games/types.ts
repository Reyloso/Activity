import type { ComponentType } from "react";

export type GameConfig = {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
  Component: ComponentType;
};

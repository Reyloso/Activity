import type { ComponentType } from "react";

export type ModuleType = "content" | "interactive";

export type ModuleProps = {
  onComplete: () => void;
  completed: boolean;
};

export type ModuleConfig = {
  id: string;
  title: string;
  type: ModuleType;
  Component: ComponentType<ModuleProps>;
};

export type ActivityConfig = {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
  modules: ModuleConfig[];
};

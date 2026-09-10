import type { ComponentType } from "react";

export type ModuleType = "content" | "interactive";

export type ModuleProps = {
  onComplete: () => void;
  completed: boolean;
  content?: string;
};

export type ModuleConfig = {
  id: string;
  title: string;
  type: ModuleType;
  Component: ComponentType<ModuleProps>;
  content?: string;
};

export type ActivityConfig = {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
  modules: ModuleConfig[];
};

import type { ComponentType } from "react";

export type ModuleType = "content" | "interactive";

export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  text: string;
  points: number;
  options: QuizOption[];
};

export type ModuleProps = {
  onComplete: () => void;
  completed: boolean;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  passingScore?: number;
};

export type ModuleConfig = {
  id: string;
  title: string;
  type: ModuleType;
  Component: ComponentType<ModuleProps>;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  passingScore?: number;
};

export type ActivityConfig = {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
  modules: ModuleConfig[];
};

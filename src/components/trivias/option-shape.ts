import { Circle, Diamond, Square, Triangle, type LucideIcon } from "lucide-react";
import type { OptionColor } from "@/lib/trivia-events";

export const OPTION_ICONS: Record<OptionColor, LucideIcon> = {
  red: Triangle,
  blue: Diamond,
  yellow: Circle,
  green: Square,
};

export const OPTION_BG: Record<OptionColor, string> = {
  red: "bg-red-500 hover:bg-red-400 border-red-600",
  blue: "bg-blue-500 hover:bg-blue-400 border-blue-600",
  yellow: "bg-amber-400 hover:bg-amber-300 border-amber-500",
  green: "bg-emerald-500 hover:bg-emerald-400 border-emerald-600",
};

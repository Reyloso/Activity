import type { ActivityConfig } from "./types";
import { priorizacionTareas } from "./priorizacion-tareas/activity.config";

export const activityRegistry: ActivityConfig[] = [priorizacionTareas];

export function getActivityConfig(slug: string) {
  return activityRegistry.find((activity) => activity.slug === slug);
}

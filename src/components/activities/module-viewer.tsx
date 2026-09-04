"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, PartyPopper } from "lucide-react";
import type { ModuleConfig } from "@/activities/types";
import { completeModule } from "@/server/actions/progress";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ModuleViewer({
  activitySlug,
  modules,
  initialCompletedIds,
}: {
  activitySlug: string;
  modules: ModuleConfig[];
  initialCompletedIds: string[];
}) {
  const [completedIds, setCompletedIds] = useState(new Set(initialCompletedIds));
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstIncomplete = modules.findIndex((m) => !initialCompletedIds.includes(m.id));
    return firstIncomplete === -1 ? modules.length - 1 : firstIncomplete;
  });
  const [, startTransition] = useTransition();

  const current = modules[currentIndex];
  const allCompleted = completedIds.size === modules.length;

  function handleComplete() {
    setCompletedIds((prev) => new Set(prev).add(current.id));
    startTransition(async () => {
      await completeModule(activitySlug, current.id, modules.length);
    });
    if (currentIndex < modules.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="flex flex-col gap-1">
        <Progress value={(completedIds.size / modules.length) * 100} className="mb-3" />
        {modules.map((module, index) => {
          const isCompleted = completedIds.has(module.id);
          return (
            <button
              key={module.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                index === currentIndex ? "bg-secondary font-medium" : "hover:bg-secondary/50",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span>{module.title}</span>
            </button>
          );
        })}
      </aside>
      <div className="min-h-[420px]">
        {allCompleted && currentIndex === modules.length - 1 && completedIds.has(current.id) ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <PartyPopper className="size-10 text-emerald-600" />
            <h2 className="text-xl font-semibold">Actividad completada</h2>
            <p className="text-muted-foreground">
              Ya puedes ver tu certificado en &quot;Mis actividades aprobadas&quot;.
            </p>
          </div>
        ) : (
          <current.Component
            key={current.id}
            completed={completedIds.has(current.id)}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

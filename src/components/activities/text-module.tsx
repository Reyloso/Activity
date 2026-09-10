"use client";

import { CheckCircle2 } from "lucide-react";
import type { ModuleProps } from "@/activities/types";
import { Button } from "@/components/ui/button";

export function TextModule({ content, onComplete, completed }: ModuleProps) {
  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between gap-6 rounded-xl border p-6">
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
      <Button onClick={onComplete} disabled={completed} className="w-fit gap-2">
        {completed ? (
          <>
            <CheckCircle2 className="size-4" /> Completado
          </>
        ) : (
          "Marcar como completado"
        )}
      </Button>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTrivia } from "@/server/actions/trivias";
import { Button } from "@/components/ui/button";

export function DeleteTriviaButton({ triviaId, triviaTitle }: { triviaId: string; triviaTitle: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`¿Eliminar la trivia "${triviaTitle}"?`)) return;
        startTransition(() => deleteTrivia(triviaId));
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

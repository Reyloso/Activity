"use client";

import { useTransition } from "react";
import { publishGame } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function PublishGameButton({
  slug,
  title,
  description,
  coverColor,
}: {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => publishGame(slug, { title, description, coverColor }))}
    >
      {isPending ? "Publicando..." : "Publicar"}
    </Button>
  );
}

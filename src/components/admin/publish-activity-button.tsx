"use client";

import { useTransition } from "react";
import { publishActivity } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function PublishActivityButton({
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
      onClick={() => startTransition(() => publishActivity(slug, { title, description, coverColor }))}
    >
      {isPending ? "Publicando..." : "Publicar"}
    </Button>
  );
}

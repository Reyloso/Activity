"use client";

import { useState, useTransition } from "react";
import { setActivityPublished } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ToggleActivityPublishedButton({
  activityId,
  initialPublished,
}: {
  activityId: string;
  initialPublished: boolean;
}) {
  const [published, setPublished] = useState(initialPublished);
  const [isPending, startTransition] = useTransition();

  if (published) {
    return (
      <div className="flex items-center gap-2">
        <Badge>Publicada</Badge>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            setPublished(false);
            startTransition(() => setActivityPublished(activityId, false));
          }}
        >
          {isPending ? "Ocultando..." : "Ocultar"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() => {
        setPublished(true);
        startTransition(() => setActivityPublished(activityId, true));
      }}
    >
      {isPending ? "Publicando..." : "Publicar"}
    </Button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { setActivityGroup } from "@/server/actions/admin";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ActivityGroupToggle({
  activityId,
  groupId,
  label,
  initialChecked,
}: {
  activityId: string;
  groupId: string;
  label: string;
  initialChecked: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        const next = !checked;
        setChecked(next);
        startTransition(() => setActivityGroup(activityId, groupId, next));
      }}
    >
      <Badge
        variant={checked ? "default" : "outline"}
        className={cn("cursor-pointer", checked && "bg-primary")}
      >
        {label}
      </Badge>
    </button>
  );
}

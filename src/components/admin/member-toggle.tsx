"use client";

import { useState, useTransition } from "react";
import { setGroupMember } from "@/server/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function MemberToggle({
  groupId,
  userId,
  label,
  initialChecked,
}: {
  groupId: string;
  userId: string;
  label: string;
  initialChecked: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [, startTransition] = useTransition();

  return (
    <Label className="flex items-center gap-3 rounded-lg border p-3 text-sm font-normal">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => {
          const next = value === true;
          setChecked(next);
          startTransition(() => setGroupMember(groupId, userId, next));
        }}
      />
      {label}
    </Label>
  );
}

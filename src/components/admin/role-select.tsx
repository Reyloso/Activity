"use client";

import { useTransition } from "react";
import { setUserRole } from "@/server/actions/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: "ADMIN" | "MEMBER";
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={role}
      disabled={disabled || isPending}
      onValueChange={(value) => startTransition(() => setUserRole(userId, value as "ADMIN" | "MEMBER"))}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MEMBER">Estudiante</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}

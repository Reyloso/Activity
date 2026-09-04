import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RoleSelect } from "@/components/admin/role-select";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { ResetPasswordInline } from "@/components/admin/reset-password-inline";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await db.user.findMany({
    orderBy: { name: "asc" },
    include: { groups: { include: { group: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>

      <div className="flex flex-col gap-2">
        {users.map((user) => {
          const isSelf = user.id === session!.user.id;
          const fullName = `${user.name} ${user.lastName}`;
          return (
            <div key={user.id} className="flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials(fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{fullName}</p>
                      {user.isBlocked && <Badge variant="destructive">Bloqueado</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                      {user.groups.length > 0 && ` · ${user.groups.map((g) => g.group.name).join(", ")}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <RoleSelect userId={user.id} role={user.role} disabled={isSelf} />
                  <ResetPasswordInline userId={user.id} disabled={isSelf} />
                  <UserRowActions userId={user.id} userLabel={fullName} isBlocked={user.isBlocked} disabled={isSelf} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { CreateGroupForm } from "@/components/admin/create-group-form";
import { DeleteGroupButton } from "@/components/admin/delete-group-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminGroupsPage() {
  const groups = await db.group.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Crear grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateGroupForm />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
            <Link href={`/admin/groups/${group.id}`} className="flex-1 hover:underline">
              <p className="font-medium">{group.name}</p>
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{group._count.members} miembros</Badge>
              <DeleteGroupButton groupId={group.id} groupName={group.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

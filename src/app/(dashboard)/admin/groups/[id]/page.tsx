import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MemberToggle } from "@/components/admin/member-toggle";

export default async function AdminGroupDetailPage({ params }: PageProps<"/admin/groups/[id]">) {
  const { id } = await params;
  const group = await db.group.findUnique({ where: { id }, include: { members: true } });
  if (!group) notFound();

  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  const memberIds = new Set(group.members.map((m) => m.userId));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
        {group.description && <p className="text-muted-foreground">{group.description}</p>}
      </div>

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <MemberToggle
            key={user.id}
            groupId={group.id}
            userId={user.id}
            label={`${user.name} ${user.lastName} (${user.email})`}
            initialChecked={memberIds.has(user.id)}
          />
        ))}
      </div>
    </div>
  );
}

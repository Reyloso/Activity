import { db } from "@/lib/db";

export async function getVisibleGames(userId: string, isAdmin: boolean) {
  const dbGames = await db.game.findMany({
    where: { published: true },
    include: { groups: true },
  });

  const userGroupIds = isAdmin
    ? null
    : new Set((await db.groupMember.findMany({ where: { userId } })).map((m) => m.groupId));

  return dbGames.filter((game) => {
    if (isAdmin) return true;
    if (game.groups.length === 0) return false;
    return game.groups.some((g) => userGroupIds!.has(g.groupId));
  });
}

export async function getGameAccess(slug: string, userId: string, isAdmin: boolean) {
  const game = await db.game.findUnique({ where: { slug }, include: { groups: true } });
  if (!game || !game.published) return null;

  if (!isAdmin) {
    const membership = await db.groupMember.findMany({ where: { userId } });
    const userGroupIds = new Set(membership.map((m) => m.groupId));
    const hasAccess = game.groups.some((g) => userGroupIds.has(g.groupId));
    if (!hasAccess) return null;
  }

  return game;
}

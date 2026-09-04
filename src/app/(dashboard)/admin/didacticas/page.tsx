import { db } from "@/lib/db";
import { gameRegistry } from "@/games/registry";
import { PublishGameButton } from "@/components/admin/publish-game-button";
import { GameGroupToggle } from "@/components/admin/game-group-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDidacticasPage() {
  const groups = await db.group.findMany({ orderBy: { name: "asc" } });
  const dbGames = await db.game.findMany({ include: { groups: true } });
  const dbBySlug = new Map(dbGames.map((g) => [g.slug, g]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Didácticas</h1>

      <div className="flex flex-col gap-4">
        {gameRegistry.map((config) => {
          const dbGame = dbBySlug.get(config.slug);
          const grantedGroupIds = new Set(dbGame?.groups.map((g) => g.groupId));

          return (
            <Card key={config.slug}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                  {dbGame?.published ? (
                    <Badge>Publicado</Badge>
                  ) : (
                    <PublishGameButton
                      slug={config.slug}
                      title={config.title}
                      description={config.description}
                      coverColor={config.coverColor}
                    />
                  )}
                </div>
              </CardHeader>
              {dbGame?.published && (
                <CardContent>
                  <p className="mb-2 text-sm font-medium">Grupos con acceso</p>
                  <div className="flex flex-wrap gap-2">
                    {groups.length === 0 && (
                      <p className="text-sm text-muted-foreground">Crea un grupo primero en la sección Grupos.</p>
                    )}
                    {groups.map((group) => (
                      <GameGroupToggle
                        key={group.id}
                        gameId={dbGame.id}
                        groupId={group.id}
                        label={group.name}
                        initialChecked={grantedGroupIds.has(group.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

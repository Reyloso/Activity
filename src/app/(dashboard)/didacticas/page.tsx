import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { auth } from "@/lib/auth";
import { getVisibleGames } from "@/server/queries/games";
import { GameCard } from "@/components/games/game-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DidacticasPage() {
  const session = await auth();
  const games = await getVisibleGames(session!.user.id!, session!.user.role === "ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Didácticas</h1>
        <p className="text-muted-foreground">Juegos cortos para reforzar lo aprendido, jugando.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/didacticas/trivias">
          <Card className="h-full transition-shadow hover:shadow-md">
            <div className="flex h-28 items-center justify-center rounded-t-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-500">
              <PartyPopper className="size-10 text-white/90" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Trivias</CardTitle>
              <CardDescription>Crea tu propia trivia y juégala en vivo con tu equipo, estilo Kahoot.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {games.map((game) => (
          <GameCard
            key={game.slug}
            slug={game.slug}
            title={game.title}
            description={game.description}
            coverColor={game.coverColor}
          />
        ))}
      </div>
    </div>
  );
}

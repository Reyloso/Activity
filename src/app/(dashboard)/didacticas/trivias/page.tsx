import Link from "next/link";
import { HelpCircle, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPublicTrivias } from "@/server/queries/trivias";
import { CreateRoomButton } from "@/components/trivias/create-room-button";
import { JoinRoomForm } from "@/components/trivias/join-room-form";
import { DeleteTriviaButton } from "@/components/trivias/delete-trivia-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function TriviasPage() {
  const session = await auth();
  const trivias = await getPublicTrivias();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trivias</h1>
          <p className="text-muted-foreground">Crea tu trivia o únete a una sala en vivo.</p>
        </div>
        <Button render={<Link href="/didacticas/trivias/nueva" />} nativeButton={false} className="gap-1.5">
          <Plus className="size-4" /> Crear trivia
        </Button>
      </div>

      <Card className="max-w-md">
        <CardContent className="pt-6">
          <JoinRoomForm />
        </CardContent>
      </Card>

      {trivias.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay trivias creadas. ¡Sé el primero!</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trivias.map((trivia) => {
            const isOwner = trivia.createdById === session!.user.id;
            return (
              <Card key={trivia.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="size-5 text-violet-600" />
                      <CardTitle className="text-lg">{trivia.title}</CardTitle>
                    </div>
                    {isOwner && <DeleteTriviaButton triviaId={trivia.id} triviaTitle={trivia.title} />}
                  </div>
                  {trivia.description && <CardDescription>{trivia.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary">{trivia._count.questions} preguntas</Badge>
                    <span className="text-xs text-muted-foreground">
                      por {trivia.createdBy.name} {trivia.createdBy.lastName}
                    </span>
                  </div>
                  <CreateRoomButton triviaId={trivia.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

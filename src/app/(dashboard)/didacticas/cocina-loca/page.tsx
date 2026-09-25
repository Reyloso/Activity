import Link from "next/link";
import { Utensils } from "lucide-react";
import { CreateRoomButton } from "@/components/cocina-loca/lobby/create-room-button";
import { JoinRoomForm } from "@/components/cocina-loca/lobby/join-room-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CocinaLocaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cocina Loca</h1>
        <p className="text-muted-foreground">
          Forma equipos y compitan cocinando en tiempo real: gana el equipo que más platos entregue antes de que se
          acabe el tiempo.
        </p>
      </div>

      <Card className="max-w-md">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Crear una sala nueva</p>
            <p className="text-sm text-muted-foreground">
              Elegirás tu equipo y color una vez dentro de la sala.
            </p>
            <CreateRoomButton />
          </div>
          <Separator />
          <JoinRoomForm />
        </CardContent>
      </Card>

      <Button render={<Link href="/didacticas/cocina-loca/practica" />} nativeButton={false} variant="outline" className="w-fit gap-1.5">
        <Utensils className="size-4" /> Practicar solo
      </Button>
    </div>
  );
}

import { KitchenScene } from "@/components/cocina-loca/kitchen-scene";

export default function CocinaLocaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cocina Loca</h1>
        <p className="text-muted-foreground">
          Fase 1: prueba de cámara y movimiento. Usa las flechas (o WASD) para mover al chef por la cocina.
        </p>
      </div>
      <KitchenScene />
    </div>
  );
}

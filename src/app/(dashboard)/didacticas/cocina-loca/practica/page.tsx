import { KitchenScene } from "@/components/cocina-loca/kitchen-scene";

export default function CocinaLocaPracticaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cocina Loca — Práctica</h1>
        <p className="text-muted-foreground">
          Cocina tú solo para practicar. Usa las flechas (o WASD) para moverte y Espacio para interactuar (mantenla
          presionada para picar o lavar).
        </p>
      </div>
      <KitchenScene />
    </div>
  );
}

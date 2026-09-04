import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const medalPalettes = ["from-[#14214f] to-[#3d55b0]", "from-[#14214f] to-[#5b7cf0]", "from-[#1c2c66] to-[#8fa4f5]"];

export function MedalBadge({ title, date, index = 0 }: { title: string; date: string; index?: number }) {
  const palette = medalPalettes[index % medalPalettes.length];
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 pb-6 text-center shadow-sm">
      <div
        className={cn(
          "relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br shadow-md",
          palette,
        )}
      >
        <Medal className="size-9 text-white" />
        <div
          className={cn("absolute -bottom-3 left-1/2 h-6 w-8 -translate-x-1/2 bg-gradient-to-b", palette)}
          style={{ clipPath: "polygon(20% 0%, 80% 0%, 65% 100%, 50% 70%, 35% 100%)" }}
        />
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

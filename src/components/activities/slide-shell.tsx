import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SlideShell({
  title,
  completed,
  onComplete,
  children,
}: {
  title: string;
  completed: boolean;
  onComplete: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-[15px] leading-relaxed">{children}</CardContent>
      <CardFooter>
        <Button onClick={onComplete} disabled={completed} className="gap-2">
          {completed ? (
            <>
              <CheckCircle2 className="size-4" /> Completado
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

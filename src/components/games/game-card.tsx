import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GameCard({
  slug,
  title,
  description,
  coverColor,
}: {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
}) {
  return (
    <Link href={`/didacticas/${slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <div
          className="flex h-28 items-center justify-center rounded-t-xl"
          style={{ backgroundColor: `#${coverColor}` }}
        >
          <Gamepad2 className="size-10 text-white/90" />
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

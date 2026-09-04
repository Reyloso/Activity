import Link from "next/link";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ActivityCard({
  slug,
  title,
  description,
  coverColor,
  moduleCount,
  completed,
}: {
  slug: string;
  title: string;
  description: string;
  coverColor: string;
  moduleCount: number;
  completed: boolean;
}) {
  return (
    <Link href={`/activities/${slug}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <div
          className="flex h-28 items-center justify-center rounded-t-xl"
          style={{ backgroundColor: `#${coverColor}` }}
        >
          <GraduationCap className="size-10 text-white/90" />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {completed && <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{moduleCount} módulos</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}

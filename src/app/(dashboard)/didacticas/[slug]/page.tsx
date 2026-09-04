import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getGameAccess } from "@/server/queries/games";
import { getGameConfig } from "@/games/registry";

export default async function GamePage({ params }: PageProps<"/didacticas/[slug]">) {
  const { slug } = await params;
  const session = await auth();

  const access = await getGameAccess(slug, session!.user.id!, session!.user.role === "ADMIN");
  const config = getGameConfig(slug);
  if (!access || !config) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>
      <config.Component />
    </div>
  );
}

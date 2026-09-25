import { auth } from "@/lib/auth";
import { CocinaLocaRoom } from "@/components/cocina-loca/lobby/cocina-loca-room";

export default async function CocinaLocaRoomPage({
  params,
  searchParams,
}: PageProps<"/didacticas/cocina-loca/room/[code]">) {
  const { code } = await params;
  const { host } = await searchParams;
  const session = await auth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-br from-orange-600 via-red-600 to-amber-700 p-6">
      <CocinaLocaRoom code={code.toUpperCase()} isHost={host === "1"} myUserId={session!.user.id!} />
    </div>
  );
}

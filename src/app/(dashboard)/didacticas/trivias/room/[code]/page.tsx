import { TriviaRoom } from "@/components/trivias/trivia-room";

export default async function TriviaRoomPage({
  params,
  searchParams,
}: PageProps<"/didacticas/trivias/room/[code]">) {
  const { code } = await params;
  const { host } = await searchParams;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 p-6">
      <TriviaRoom code={code.toUpperCase()} isHost={host === "1"} />
    </div>
  );
}

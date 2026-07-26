import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { VideoRoomClient } from "@/components/VideoChat";
import { ShareButtons } from "@/components/ShareButtons";

export default async function VideoRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { code } = await params;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <Link href="/video" className="text-sm font-semibold text-tide">
        ← Video lobby
      </Link>
      <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">Live room</h1>
          <p className="mt-2 text-ink/60">
            WebRTC peer chat for debating predictions. Invite via link or messages.
          </p>
        </div>
        <ShareButtons title={`Join my Betme video room ${code}`} path={`/video/${code}`} />
      </div>
      <VideoRoomClient code={code.toUpperCase()} userId={user.id} />
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CreateVideoButton } from "@/components/VideoChat";
import { JoinVideoForm } from "@/components/JoinVideoForm";

export default async function VideoHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Live</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">Video chat</h1>
      <p className="mt-3 text-ink/65">
        Spin up a peer-to-peer Betme room to debate a market face-to-face. Share the room code with
        a friend already on the platform.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <CreateVideoButton />
        <Link
          href="/messages"
          className="rounded-md border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold"
        >
          Open messages
        </Link>
      </div>
      <div className="mt-8">
        <JoinVideoForm />
      </div>
    </div>
  );
}

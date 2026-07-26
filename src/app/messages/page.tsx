import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { StartMessageForm } from "@/components/MessageComposer";
import { CreateVideoButton } from "@/components/VideoChat";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { to } = await searchParams;

  const memberships = await prisma.conversationMember.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarHue: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Inbox</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">Messages</h1>
          <p className="mt-3 text-ink/65">
            Debate calls, share picks, then jump into video when it gets heated.
          </p>
        </div>
        <CreateVideoButton />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-2">
          {memberships.map((m) => {
            const others = m.conversation.members
              .map((mem) => mem.user)
              .filter((u) => u.id !== user.id);
            const peer = others[0];
            const last = m.conversation.messages[0];
            return (
              <Link
                key={m.conversation.id}
                href={`/messages/${m.conversation.id}`}
                className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/50 px-4 py-3 transition hover:bg-white/80"
              >
                <Avatar
                  name={peer?.displayName || "Chat"}
                  hue={peer?.avatarHue ?? 160}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {peer ? peer.displayName : "Conversation"}
                  </p>
                  <p className="truncate text-sm text-ink/50">
                    {last?.body || "No messages yet"}
                  </p>
                </div>
                {last && (
                  <span className="text-xs text-ink/40">
                    {formatDistanceToNow(last.createdAt, { addSuffix: true })}
                  </span>
                )}
              </Link>
            );
          })}
          {memberships.length === 0 && (
            <p className="text-sm text-ink/50">No conversations yet — start one.</p>
          )}
        </div>

        <div>
          <StartMessageForm />
          {to && (
            <p className="mt-3 text-sm text-ink/55">
              Tip: prefill username <strong>{to}</strong> above to message them.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

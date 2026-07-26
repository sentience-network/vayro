import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar } from "@/components/Avatar";
import { ChatBox } from "@/components/MessageComposer";
import { CreateVideoButton } from "@/components/VideoChat";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const member = await prisma.conversationMember.findUnique({
    where: { userId_conversationId: { userId: user.id, conversationId: id } },
  });
  if (!member) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
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
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarHue: true,
            },
          },
        },
      },
    },
  });
  if (!conversation) notFound();

  await prisma.conversationMember.update({
    where: { id: member.id },
    data: { lastReadAt: new Date() },
  });

  const peers = conversation.members
    .map((m) => m.user)
    .filter((u) => u.id !== user.id);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col px-5 py-10 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/messages" className="text-sm font-semibold text-tide">
            ← Inbox
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink">
            {peers.map((p) => p.displayName).join(", ") || "Chat"}
          </h1>
        </div>
        <CreateVideoButton />
      </div>

      <div className="flex-1 space-y-3 rounded-2xl border border-[var(--line)] bg-white/45 p-4">
        {conversation.messages.map((message) => {
          const mine = message.senderId === user.id;
          return (
            <div key={message.id} className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && (
                <Avatar name={message.sender.displayName} hue={message.sender.avatarHue} size="sm" />
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-ink text-foam" : "bg-mist text-ink"
                }`}
              >
                <p>{message.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-foam/50" : "text-ink/40"}`}>
                  {format(message.createdAt, "MMM d · h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        {conversation.messages.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/45">Say the first word.</p>
        )}
      </div>

      <div className="mt-4">
        <ChatBox conversationId={conversation.id} />
      </div>
    </div>
  );
}

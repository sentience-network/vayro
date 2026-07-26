import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { grantCredits } from "@/lib/credits";
import { CREDIT_REWARDS } from "@/lib/constants";

async function assertMember(conversationId: string, userId: string) {
  return prisma.conversationMember.findUnique({
    where: {
      userId_conversationId: { userId, conversationId },
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { id } = await params;
  const member = await assertMember(id, userId);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  await prisma.conversationMember.update({
    where: { id: member.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ conversation });
}

const sendSchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { id } = await params;
  const member = await assertMember(id, userId);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = sendSchema.parse(await req.json());
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        body: body.body.trim(),
      },
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
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    await grantCredits(userId, CREDIT_REWARDS.messageActivity, "message_activity", {
      conversationId: id,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not send message" }, { status: 500 });
  }
}

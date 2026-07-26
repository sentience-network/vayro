import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evaluateUserBadges } from "@/lib/badges";

function roomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const createSchema = z.object({
  conversationId: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json().catch(() => ({})));
    const room = await prisma.videoRoom.create({
      data: {
        code: roomCode(),
        hostId: userId,
        conversationId: body.conversationId,
        participants: {
          create: [{ userId, role: "HOST" }],
        },
      },
    });

    await evaluateUserBadges(userId);
    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid video request" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Could not create room" }, { status: 500 });
  }
}

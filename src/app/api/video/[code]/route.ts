import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { evaluateUserBadges } from "@/lib/badges";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { code } = await params;
  const room = await prisma.videoRoom.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      host: { select: { id: true, username: true, displayName: true } },
      participants: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarHue: true } },
        },
      },
    },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const already = room.participants.some((p) => p.userId === userId);
  if (!already && room.status === "OPEN") {
    await prisma.videoParticipant.create({
      data: { roomId: room.id, userId, role: "GUEST" },
    });
    await evaluateUserBadges(userId);
  }

  const fresh = await prisma.videoRoom.findUnique({
    where: { id: room.id },
    include: {
      host: { select: { id: true, username: true, displayName: true } },
      participants: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarHue: true } },
        },
      },
    },
  });

  return NextResponse.json({ room: fresh });
}

const signalSchema = z.object({
  type: z.enum(["offer", "answer", "clear"]),
  sdp: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const { code } = await params;
  const room = await prisma.videoRoom.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  try {
    const body = signalSchema.parse(await req.json());
    if (body.type === "offer") {
      if (room.hostId !== userId) {
        return NextResponse.json({ error: "Only host can set offer" }, { status: 403 });
      }
      await prisma.videoRoom.update({
        where: { id: room.id },
        data: { offerSdp: body.sdp, answerSdp: null, status: "LIVE" },
      });
    } else if (body.type === "answer") {
      await prisma.videoRoom.update({
        where: { id: room.id },
        data: { answerSdp: body.sdp, status: "LIVE" },
      });
    } else {
      await prisma.videoRoom.update({
        where: { id: room.id },
        data: { offerSdp: null, answerSdp: null, status: "OPEN" },
      });
    }

    const updated = await prisma.videoRoom.findUnique({ where: { id: room.id } });
    return NextResponse.json({ room: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid signal" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Signal failed" }, { status: 500 });
  }
}

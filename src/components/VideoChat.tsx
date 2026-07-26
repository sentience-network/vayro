"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type RoomPayload = {
  id: string;
  code: string;
  hostId: string;
  status: string;
  offerSdp: string | null;
  answerSdp: string | null;
  host: { id: string; username: string; displayName: string };
  participants: {
    user: { id: string; username: string; displayName: string; avatarHue: number };
  }[];
};

export function CreateVideoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create room");
      router.push(`/video/${data.room.code}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={create}
      disabled={loading}
      className="rounded-md bg-tide px-4 py-2.5 text-sm font-semibold text-foam disabled:opacity-50"
    >
      {loading ? "Starting…" : "Start video room"}
    </button>
  );
}

export function VideoRoomClient({
  code,
  userId,
}: {
  code: string;
  userId: string;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [room, setRoom] = useState<RoomPayload | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/video/${code}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Room not found");
    setRoom(data.room);
    return data.room as RoomPayload;
  }, [code]);

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;

    async function boot() {
      try {
        const current = await fetchRoom();
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localRef.current) localRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream!));
        pc.ontrack = (event) => {
          if (remoteRef.current) remoteRef.current.srcObject = event.streams[0];
          setStatus("Live");
        };

        const isHost = current.hostId === userId;

        if (isHost) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await waitIce(pc);
          await fetch(`/api/video/${code}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "offer", sdp: pc.localDescription?.sdp }),
          });
          setStatus("Waiting for guest…");
        } else {
          setStatus("Joining host…");
        }

        const poll = setInterval(async () => {
          if (!alive) return;
          const latest = await fetchRoom();
          if (isHost && latest.answerSdp && pc.signalingState !== "stable") {
            await pc.setRemoteDescription({ type: "answer", sdp: latest.answerSdp });
            setStatus("Live");
          }
          if (!isHost && latest.offerSdp && pc.signalingState === "stable" && !pc.currentRemoteDescription) {
            // guest path handled below when remote not set
          }
          if (!isHost && latest.offerSdp && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription({ type: "offer", sdp: latest.offerSdp });
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await waitIce(pc);
            await fetch(`/api/video/${code}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "answer", sdp: pc.localDescription?.sdp }),
            });
            setStatus("Live");
          }
        }, 1500);

        return () => clearInterval(poll);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Camera/mic unavailable");
        setStatus("Unavailable");
      }
    }

    const cleanupPromise = boot();
    return () => {
      alive = false;
      cleanupPromise.then((cleanup) => cleanup?.());
      pcRef.current?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [code, userId, fetchRoom]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">
            Room {code}
          </p>
          <p className="font-display text-2xl font-bold text-ink">{status}</p>
        </div>
        {room && (
          <p className="text-sm text-ink/55">
            Host @{room.host.username} · {room.participants.length} in room
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-sand/80 px-3 py-2 text-sm text-ember">
          {error}. You can still coordinate over messages.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-ink">
          <video ref={localRef} autoPlay muted playsInline className="aspect-video w-full object-cover" />
          <p className="px-3 py-2 text-xs text-lime">You</p>
        </div>
        <div className="overflow-hidden rounded-2xl bg-ink-soft">
          <video ref={remoteRef} autoPlay playsInline className="aspect-video w-full object-cover" />
          <p className="px-3 py-2 text-xs text-foam/80">Remote</p>
        </div>
      </div>
    </div>
  );
}

function waitIce(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const check = () => {
      if (pc.iceGatheringState === "complete") {
        pc.removeEventListener("icegatheringstatechange", check);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", check);
    setTimeout(() => resolve(), 2000);
  });
}

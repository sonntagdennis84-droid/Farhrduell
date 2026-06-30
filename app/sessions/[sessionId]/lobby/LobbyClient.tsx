"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { GameSession, Participant } from "@/types/domain";
import { ParticipantList } from "@/components/quiz/ParticipantList";
import { QRCodePanel } from "@/components/quiz/QRCodePanel";
import { gameModeLabel } from "@/lib/game-modes";

export function LobbyClient({
  initialSession,
  initialParticipants,
  qrCode,
  joinUrl
}: {
  initialSession: GameSession;
  initialParticipants: Participant[];
  qrCode: string;
  joinUrl: string;
}) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [welcomeQueue, setWelcomeQueue] = useState<string[]>([]);
  const [activeWelcome, setActiveWelcome] = useState<string | null>(null);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: initialSession.id });
    socket.on("participant_joined", (participant: Participant) => {
      setParticipants((items) => [...items.filter((item) => item.id !== participant.id), participant]);
      setWelcomeQueue((items) => [...items, participant.displayName]);
    });
    socket.on("session_started", () => {
      location.href = `/host/${initialSession.id}`;
    });
    return () => {
      socket.disconnect();
    };
  }, [initialSession.id]);

  useEffect(() => {
    if (activeWelcome || welcomeQueue.length === 0) return;
    const [nextName, ...rest] = welcomeQueue;
    setActiveWelcome(nextName);
    setWelcomeQueue(rest);
    const timeout = window.setTimeout(() => setActiveWelcome(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [activeWelcome, welcomeQueue]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-lg border border-white/10 bg-show-panel/90 p-6">
        {activeWelcome && (
          <div className="mb-5 rounded-lg border border-show-gold/40 bg-show-gold/12 px-4 py-4 shadow-glow">
            <p className="text-sm font-black uppercase text-show-gold">Neuer Teilnehmer</p>
            <p className="mt-1 text-2xl font-black text-white">Willkommen, {activeWelcome}!</p>
          </div>
        )}

        <QRCodePanel qrCode={qrCode} joinCode={initialSession.joinCode} joinUrl={joinUrl} />

        <div className="mt-4 rounded border border-show-gold/30 bg-show-gold/10 px-4 py-3">
          <p className="text-xs font-black uppercase text-show-gold">Spielmodus</p>
          <p className="mt-1 text-xl font-black">{gameModeLabel(initialSession.gameMode)}</p>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-black uppercase text-show-gold">App Connect aktiv</p>
          <p className="mt-1 text-sm font-semibold text-white/65">Die Moderator-App bietet diese Session automatisch als Fernbedienung an.</p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-show-panel/90 p-6">
        <h2 className="text-2xl font-black">Teilnehmer ({participants.length})</h2>
        <div className="mt-4">
          <ParticipantList participants={participants} />
        </div>
      </div>
    </div>
  );
}

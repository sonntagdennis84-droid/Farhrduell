"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import type { GameSession, Participant } from "@/types/domain";
import { ParticipantList } from "@/components/quiz/ParticipantList";
import { QRCodePanel } from "@/components/quiz/QRCodePanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { gameModeLabel } from "@/lib/game-modes";

export function LobbyClient({
  initialSession,
  initialParticipants,
  qrCode,
  joinUrl,
  remoteQrCode,
  remoteUrl
}: {
  initialSession: GameSession;
  initialParticipants: Participant[];
  qrCode: string;
  joinUrl: string;
  remoteQrCode: string;
  remoteUrl: string;
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

  async function startQuiz() {
    await fetch(`/api/sessions/${initialSession.id}/start`, { method: "POST" });
    location.href = `/host/${initialSession.id}`;
  }

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
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded border border-white/20 px-5 py-2.5 font-bold text-white transition hover:border-show-gold hover:text-show-gold"
            href={`/host/${initialSession.id}`}
            target="_blank"
          >
            Moderatorenansicht öffnen
          </Link>
          <PrimaryButton className="w-full" onClick={startQuiz} disabled={participants.length === 0}>
            Quiz starten
          </PrimaryButton>
        </div>
        <div className="mt-6 rounded-lg border border-show-gold/30 bg-show-gold/10 p-4">
          <div className="grid items-center gap-4 sm:grid-cols-[8rem_1fr]">
            <img className="mx-auto h-32 w-32 rounded border-2 border-white bg-white p-2" src={remoteQrCode} alt="QR-Code für Moderator-Fernbedienung" />
            <div>
              <h2 className="text-xl font-black text-show-gold">Moderator-App</h2>
              <p className="mt-1 text-sm font-semibold text-white/70">Mit Android scannen, einloggen und diese Session vom Handy steuern.</p>
              <Link className="mt-3 inline-flex min-h-11 items-center justify-center rounded border border-white/20 px-4 py-2.5 font-bold hover:border-show-gold hover:text-show-gold" href={`/host/${initialSession.id}/remote`} target="_blank">
                Fernbedienung öffnen
              </Link>
              <p className="mt-2 break-all text-xs text-white/50">{remoteUrl}</p>
            </div>
          </div>
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

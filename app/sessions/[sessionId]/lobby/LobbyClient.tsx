"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import type { GameSession, Participant } from "@/types/domain";
import { ParticipantList } from "@/components/quiz/ParticipantList";
import { QRCodePanel } from "@/components/quiz/QRCodePanel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function LobbyClient({ initialSession, initialParticipants, qrCode, joinUrl }: { initialSession: GameSession; initialParticipants: Participant[]; qrCode: string; joinUrl: string }) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: initialSession.id });
    socket.on("participant_joined", (participant: Participant) => setParticipants((items) => [...items.filter((item) => item.id !== participant.id), participant]));
    socket.on("session_started", () => {
      location.href = `/host/${initialSession.id}`;
    });
    return () => {
      socket.disconnect();
    };
  }, [initialSession.id]);

  async function startQuiz() {
    await fetch(`/api/sessions/${initialSession.id}/start`, { method: "POST" });
    location.href = `/host/${initialSession.id}`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-lg border border-white/10 bg-show-panel/90 p-6">
        <QRCodePanel qrCode={qrCode} joinCode={initialSession.joinCode} joinUrl={joinUrl} />
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

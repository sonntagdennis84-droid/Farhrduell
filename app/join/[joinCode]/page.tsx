"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { participantEmojis, defaultParticipantEmoji } from "@/lib/participant-emojis";

export default function JoinPage() {
  const params = useParams<{ joinCode: string }>();
  const [displayName, setDisplayName] = useState("");
  const [emoji, setEmoji] = useState<string>(defaultParticipantEmoji);
  const [error, setError] = useState("");

  async function join(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/join/${params.joinCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, emoji })
    });
    if (!response.ok) {
      setError("Beitritt nicht möglich.");
      return;
    }
    const result = await response.json();
    location.href = `/play/${result.participant.id}`;
  }

  return (
    <main className="show-grid safe-screen grid place-items-center">
      <form onSubmit={join} className="w-full max-w-md rounded-lg border border-white/10 bg-show-panel/95 p-5 shadow-2xl">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Beitreten</h1>
        <p className="mt-2 text-white/70">Code {params.joinCode}</p>
        <input
          required
          minLength={2}
          autoComplete="name"
          className="mt-6 min-h-14 w-full rounded border border-white/15 bg-white/10 px-4 py-4 text-[16px] font-semibold text-white outline-none focus:border-show-gold"
          placeholder="Dein Name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />

        <div className="mt-5">
          <p className="text-sm font-black uppercase text-show-gold">Dein Emoji</p>
          <div className="mt-3 grid max-h-56 grid-cols-8 gap-2 overflow-y-auto pr-1">
            {participantEmojis.map((option) => (
              <button
                aria-label={`Emoji ${option}`}
                className={emoji === option ? "grid h-10 w-10 place-items-center rounded border border-show-gold bg-show-gold/20 text-2xl shadow-glow" : "grid h-10 w-10 place-items-center rounded border border-white/10 bg-white/5 text-2xl"}
                key={option}
                onClick={() => setEmoji(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-bold text-show-red">{error}</p>}
        <PrimaryButton className="mt-5 min-h-14 w-full text-base">In die Lobby</PrimaryButton>
      </form>
    </main>
  );
}

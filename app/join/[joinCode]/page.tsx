"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";
import { participantAvatars, defaultAvatarId } from "@/lib/participant-avatars";
import { participantEmojis, defaultParticipantEmoji } from "@/lib/participant-emojis";
import { cn } from "@/lib/utils";

export default function JoinPage() {
  const params = useParams<{ joinCode: string }>();
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState(defaultAvatarId);
  const [emoji, setEmoji] = useState<string>(defaultParticipantEmoji);
  const [error, setError] = useState("");
  const groupedAvatars = useMemo(() => {
    const groups = new Map<string, typeof participantAvatars>();
    for (const avatar of participantAvatars) groups.set(avatar.category, [...(groups.get(avatar.category) ?? []), avatar]);
    return Array.from(groups.entries());
  }, []);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/join/${params.joinCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, avatarId, emoji })
    });
    if (!response.ok) {
      setError("Beitritt nicht möglich. Bitte prüfe Name, Avatar und Emoji.");
      return;
    }
    const result = await response.json();
    location.href = `/play/${result.participant.id}`;
  }

  return (
    <main className="show-grid safe-screen grid place-items-center px-3 py-4">
      <form onSubmit={join} className="w-full max-w-lg rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">
        <Logo />
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Beitreten</h1>
            <p className="mt-1 text-sm font-semibold text-white/65">Code {params.joinCode}</p>
          </div>
          <ParticipantAvatar avatarId={avatarId} emoji={emoji} label={displayName || "Teilnehmer"} size="lg" priority />
        </div>

        <input
          required
          minLength={2}
          autoComplete="name"
          className="mt-5 min-h-14 w-full rounded border border-white/15 bg-white/10 px-4 py-4 text-[16px] font-semibold text-white outline-none focus:border-show-gold"
          placeholder="Dein Name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />

        <section className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black uppercase text-show-gold">Avatar</p>
            <p className="text-xs font-bold text-white/45">80 Motive</p>
          </div>
          <div className="mt-3 max-h-72 space-y-4 overflow-y-auto pr-1">
            {groupedAvatars.map(([category, avatars]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-black uppercase text-white/45">{category}</p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {avatars.map((avatar) => (
                    <button
                      aria-label={`Avatar ${avatar.label}`}
                      className={cn(
                        "grid aspect-square place-items-center rounded-lg border bg-white/5 p-1 transition active:scale-95",
                        avatarId === avatar.id ? "border-show-gold bg-show-gold/15 shadow-glow" : "border-white/10 hover:border-show-gold/60"
                      )}
                      key={avatar.id}
                      onClick={() => setAvatarId(avatar.id)}
                      type="button"
                    >
                      <ParticipantAvatar avatarId={avatar.id} emoji={emoji} label={avatar.label} showEmoji={false} size="md" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black uppercase text-show-gold">Emoji</p>
            <p className="text-xs font-bold text-white/45">{participantEmojis.length} Zeichen</p>
          </div>
          <div className="mt-3 grid max-h-48 grid-cols-8 gap-2 overflow-y-auto pr-1 sm:grid-cols-10">
            {participantEmojis.map((option) => (
              <button
                aria-label={`Emoji ${option}`}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded border text-2xl transition active:scale-95",
                  emoji === option ? "border-show-gold bg-show-gold/20 shadow-glow" : "border-white/10 bg-white/5"
                )}
                key={option}
                onClick={() => setEmoji(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="mt-3 text-sm font-bold text-show-red">{error}</p>}
        <PrimaryButton className="mt-5 min-h-14 w-full text-base">In die Lobby</PrimaryButton>
      </form>
    </main>
  );
}

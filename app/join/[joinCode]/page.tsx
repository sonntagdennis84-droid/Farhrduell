"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function JoinPage() {
  const params = useParams<{ joinCode: string }>();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  async function join(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/join/${params.joinCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName })
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
        {error && <p className="mt-3 text-sm font-bold text-show-red">{error}</p>}
        <PrimaryButton className="mt-5 min-h-14 w-full text-base">In die Lobby</PrimaryButton>
      </form>
    </main>
  );
}

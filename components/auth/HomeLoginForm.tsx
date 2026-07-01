"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function HomeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) {
      setError(data?.error ?? "Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
      return;
    }
    const nextPath = searchParams.get("next") ?? "/dashboard";
    router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={login} className="rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">
      <p className="text-xs font-black uppercase text-show-gold">Moderator-Login</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="text-xs font-bold text-white/65">E-Mail</span>
          <input
            className="mt-1 min-h-12 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white outline-none transition focus:border-show-gold"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@beispiel.de"
            autoComplete="username"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-white/65">Passwort</span>
          <input
            className="mt-1 min-h-12 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white outline-none transition focus:border-show-gold"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Passwort"
            autoComplete="current-password"
          />
        </label>
        <PrimaryButton className="min-h-12 px-5" disabled={busy} type="submit">
          {busy ? "..." : "Login"}
        </PrimaryButton>
      </div>
      {error && <p className="mt-3 rounded border border-show-red/30 bg-show-red/10 p-3 text-sm font-bold text-show-red">{error}</p>}
    </form>
  );
}

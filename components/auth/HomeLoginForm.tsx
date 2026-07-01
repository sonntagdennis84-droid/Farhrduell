"use client";

import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <section className="rounded-lg border border-white/10 bg-show-panel/95 p-5 shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-show-gold">Moderator-Zugang</p>
          <h2 className="mt-2 text-2xl font-black text-white">Einloggen</h2>
          <p className="mt-1 text-sm font-semibold text-white/55">Dashboard, Bibliothek und Live-Steuerung.</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded border border-show-gold/30 bg-show-gold/10 text-show-gold">
          <ShieldCheck size={24} />
        </span>
      </div>

      <form onSubmit={login} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs font-black uppercase text-white/55">E-Mail-Adresse</span>
          <div className="mt-2 grid grid-cols-[2.75rem_1fr] items-center rounded-lg border border-white/15 bg-black/25 transition focus-within:border-show-gold focus-within:shadow-glow">
            <span className="grid h-12 place-items-center text-show-gold">
              <Mail size={19} />
            </span>
            <input
              className="h-12 min-w-0 bg-transparent pr-4 font-semibold text-white outline-none placeholder:text-white/35"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@beispiel.de"
              autoComplete="username"
              type="email"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase text-white/55">Passwort</span>
          <div className="mt-2 grid grid-cols-[2.75rem_1fr] items-center rounded-lg border border-white/15 bg-black/25 transition focus-within:border-show-gold focus-within:shadow-glow">
            <span className="grid h-12 place-items-center text-show-gold">
              <LockKeyhole size={19} />
            </span>
            <input
              className="h-12 min-w-0 bg-transparent pr-4 font-semibold text-white outline-none placeholder:text-white/35"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Passwort eingeben"
              autoComplete="current-password"
            />
          </div>
        </label>

        {error && <p className="rounded-lg border border-show-red/30 bg-show-red/10 p-3 text-sm font-bold text-show-red">{error}</p>}

        <button
          className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg border border-show-gold bg-show-gold px-5 py-3 text-base font-black text-show-navy shadow-glow transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? "Login läuft..." : "Einloggen"}
          <ArrowRight size={20} />
        </button>
      </form>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs font-black uppercase text-white/40">Sitzung</p>
        <p className="mt-1 text-sm font-semibold text-white/65">Geschützter Zugang für Admins und Moderatoren.</p>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Smartphone, Trophy } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type LoginConfig = {
  appMode: boolean;
  suggestedEmail: string;
};

export function LoginClient({ config }: { config: LoginConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get("email")?.trim();
    setEmail(queryEmail || config.suggestedEmail || "");
  }, [config.suggestedEmail, searchParams]);

  const highlights = useMemo(
    () => [
      { icon: Trophy, title: "Live-Moderation", text: "Quiz starten, Fragen steuern und Punktestände gezielt einblenden." },
      { icon: Smartphone, title: "Mobil bereit", text: "Optimiert für Smartboard, Browser und die Moderator-App auf Android." },
      { icon: ShieldCheck, title: "Kontrolliert", text: "Geschützter Zugang für Admins und Moderatoren mit dauerhafter Sitzung." }
    ],
    []
  );

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
    <main className="show-grid min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-show-panel/85 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,197,67,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(38,157,255,0.18),transparent_36%)]" />
          <div className="relative">
            <Logo />
            <p className="mt-10 text-sm font-black uppercase tracking-wide text-show-gold">Moderator-Zentrale</p>
            <h1 className="mt-3 max-w-2xl text-5xl font-black leading-tight text-white lg:text-6xl">Fahrduell für starke Live-Momente im Unterricht.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/72">
              Ein Zugang für Quizverwaltung, Live-Steuerung, Smartphone-Teilnahme und die Moderator-App. Schnell, klar und bereit für den echten Einsatz.
            </p>

            <div className="mt-8 grid gap-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="grid grid-cols-[3.5rem_1fr] items-center gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="grid h-14 w-14 place-items-center rounded-lg border border-show-gold/25 bg-show-gold/10 text-show-gold">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-show-panel/95 p-6 shadow-2xl lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-show-gold">{config.appMode ? "Moderator-App" : "Sicherer Zugang"}</p>
              <h2 className="mt-2 text-3xl font-black">Einloggen</h2>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-xs font-black uppercase text-white/45">Status</p>
              <p className="mt-1 text-sm font-bold text-white/75">{config.appMode ? "App-Modus aktiv" : "Browser-Modus"}</p>
            </div>
          </div>

          <form onSubmit={login} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-bold text-white/70">E-Mail</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-4 py-4 text-white outline-none transition focus:border-show-gold"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@beispiel.de"
                autoComplete="username"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-white/70">Passwort</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-4 py-4 text-white outline-none transition focus:border-show-gold"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Passwort eingeben"
                autoComplete="current-password"
              />
            </label>

            {error && <p className="rounded-lg border border-show-red/30 bg-show-red/10 p-3 text-sm font-bold text-show-red">{error}</p>}

            <PrimaryButton className="w-full min-h-14 text-base" disabled={busy} type="submit">
              {busy ? "Einloggen läuft..." : "Zum Dashboard"}
            </PrimaryButton>
          </form>
        </section>
      </div>
    </main>
  );
}

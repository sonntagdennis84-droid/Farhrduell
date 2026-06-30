"use client";

import { useEffect, useState } from "react";

type ActiveSessionResponse =
  | { hasActiveSession: false }
  | {
      hasActiveSession: true;
      sessionId: string;
      quizTitle: string;
      remoteUrl: string;
    };

function isAppContext() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("app") === "1") {
    window.localStorage.setItem("fahrduell-app-context", "1");
    return true;
  }
  return window.localStorage.getItem("fahrduell-app-context") === "1";
}

export function AppConnectBanner() {
  const [enabled, setEnabled] = useState(false);
  const [activeSession, setActiveSession] = useState<Extract<ActiveSessionResponse, { hasActiveSession: true }> | null>(null);
  const [ignoredSessionId, setIgnoredSessionId] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(isAppContext());
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    async function checkActiveSession() {
      try {
        const response = await fetch("/api/me/active-session", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ActiveSessionResponse;
        if (cancelled) return;
        if (data.hasActiveSession && data.sessionId !== ignoredSessionId) {
          setActiveSession(data);
          if ("vibrate" in navigator) navigator.vibrate?.(80);
        } else if (!data.hasActiveSession) {
          setActiveSession(null);
        }
      } catch {
        // App Connect is best-effort; QR fallback remains available.
      }
    }

    void checkActiveSession();
    const interval = window.setInterval(checkActiveSession, 7000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled, ignoredSessionId]);

  if (!enabled || !activeSession) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-md rounded-lg border border-show-gold/50 bg-show-panel/95 p-4 shadow-glow backdrop-blur">
      <p className="text-sm font-black uppercase text-show-gold">Live-Session erkannt</p>
      <h2 className="mt-1 text-xl font-black text-white">{activeSession.quizTitle}</h2>
      <p className="mt-1 text-sm font-semibold text-white/65">Fernbedienung öffnen?</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a className="rounded bg-show-gold px-4 py-3 text-center font-black text-show-navy" href={activeSession.remoteUrl}>
          Fernbedienung öffnen
        </a>
        <button className="rounded border border-white/15 px-4 py-3 font-black text-white/75" onClick={() => setIgnoredSessionId(activeSession.sessionId)} type="button">
          Ignorieren
        </button>
      </div>
    </div>
  );
}

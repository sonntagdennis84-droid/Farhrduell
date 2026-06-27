"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallAppButton({ className = "" }: { className?: string }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone) setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setInstallPrompt(null);
    }
  }

  if (installed) {
    return <span className={`inline-flex min-h-11 items-center justify-center rounded border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 font-black text-emerald-300 ${className}`}>App installiert</span>;
  }

  if (!installPrompt) {
    return <span className={`inline-flex min-h-11 items-center justify-center rounded border border-white/15 bg-white/5 px-5 py-3 font-bold text-white/70 ${className}`}>In Chrome: Zum Startbildschirm hinzufuegen</span>;
  }

  return (
    <button className={`inline-flex min-h-11 items-center justify-center rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy shadow-glow ${className}`} onClick={install} type="button">
      App installieren
    </button>
  );
}

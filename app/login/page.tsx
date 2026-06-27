"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@fahrduell.local");
  const [password, setPassword] = useState("fahrduell");
  const [error, setError] = useState("");

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      setError("Login fehlgeschlagen.");
      return;
    }
    const nextPath = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
    router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
  }

  return (
    <main className="show-grid grid min-h-screen place-items-center px-4">
      <form onSubmit={login} className="w-full max-w-md rounded-lg border border-white/10 bg-show-panel/95 p-6 shadow-2xl">
        <Logo />
        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-white/70">E-Mail</span>
            <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-white/70">Passwort</span>
            <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="text-sm font-bold text-show-red">{error}</p>}
          <PrimaryButton className="w-full" type="submit">
            Einloggen
          </PrimaryButton>
        </div>
      </form>
    </main>
  );
}

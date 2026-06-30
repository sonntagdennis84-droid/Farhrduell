"use client";

import Link from "next/link";
import { BookOpen, Cloud, Download, Play, Plus, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Quiz } from "@/types/domain";
import { InstallAppButton } from "@/components/InstallAppButton";
import { QuizLibraryCard } from "@/components/quiz/QuizLibraryCard";

type ActiveSession = {
  sessionId: string;
  quizTitle: string;
  participantCount?: number;
  remoteUrl: string;
} | null;

const favoriteStorageKey = "fahrduell.favoriteQuizzes";

function readFavorites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(favoriteStorageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function DashboardClient({ quizzes, activeSession }: { quizzes: Quiz[]; activeSession: ActiveSession }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const activeQuizzes = useMemo(() => quizzes.filter((quiz) => !quiz.isArchived), [quizzes]);
  const favoriteQuizzes = useMemo(() => favorites.map((id) => activeQuizzes.find((quiz) => quiz.id === id)).filter(Boolean) as Quiz[], [activeQuizzes, favorites]);
  const recentQuizzes = useMemo(() => [...activeQuizzes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4), [activeQuizzes]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((items) => {
      const next = items.includes(id) ? items.filter((item) => item !== id) : [id, ...items];
      window.localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      return next;
    });
  }

  async function finishActiveSession() {
    if (!activeSession || !window.confirm("Aktive Live-Session wirklich beenden?")) return;
    await fetch(`/api/sessions/${activeSession.sessionId}/finish`, { method: "POST" });
    location.reload();
  }

  async function startSession(quiz: Quiz) {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: quiz.id, gameMode: "classic" })
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.id) location.href = `/sessions/${result.id}/lobby`;
  }

  const quickActions = [
    { href: "/quizzes", label: "Quiz starten", text: "Bibliothek öffnen und loslegen.", icon: Play, tone: "gold" },
    { href: "/quizzes/new", label: "Neues Quiz erstellen", text: "Fragen direkt im Editor bauen.", icon: Plus, tone: "blue" },
    { href: "/quizzes/import", label: "Quiz importieren", text: "Word oder Excel hochladen.", icon: Download, tone: "green" },
    { href: "/quizzes", label: "Bibliothek", text: "Suchen, filtern, archivieren.", icon: BookOpen, tone: "plain" },
    { href: "/profile", label: "Profil", text: "Account und Moderatoren.", icon: User, tone: "plain" },
    { href: "/cloud", label: "Cloud", text: "Vorbereitung für Phase 2.", icon: Cloud, tone: "plain" }
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-show-gold">Start</p>
          <h1 className="mt-1 text-4xl font-black">Dashboard</h1>
          <p className="mt-2 text-white/65">Dein täglicher Arbeitsplatz für Live-Quiz, Vorbereitung und Moderation.</p>
        </div>
        <InstallAppButton />
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-show-panel/80 p-2">
        <Link className="rounded bg-show-gold px-4 py-3 font-black text-show-navy" href="/dashboard">Start</Link>
        <Link className="rounded px-4 py-3 font-black text-white/75 hover:bg-white/10 hover:text-white" href="/quizzes">Bibliothek</Link>
        <Link className="rounded px-4 py-3 font-black text-white/75 hover:bg-white/10 hover:text-white" href="/cloud">Cloud</Link>
      </nav>

      {activeSession && (
        <section className="mt-6 rounded-lg border border-show-green/40 bg-show-green/15 p-5 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-show-green">Aktive Live-Session</p>
              <h2 className="mt-2 text-3xl font-black">{activeSession.quizTitle}</h2>
              <p className="mt-2 font-bold text-white/70">{activeSession.participantCount ?? 0} Teilnehmer verbunden</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy" href={`/sessions/${activeSession.sessionId}/lobby`}>Zur Session</Link>
              <Link className="rounded border border-white/20 px-5 py-3 font-black hover:border-show-gold hover:text-show-gold" href={activeSession.remoteUrl}>Fernbedienung</Link>
              <button className="rounded border border-show-red/50 px-5 py-3 font-black text-show-red" onClick={finishActiveSession} type="button">Beenden</button>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} className="rounded-lg border border-white/10 bg-show-panel/90 p-5 shadow-xl transition hover:-translate-y-0.5 hover:border-show-gold/50 hover:shadow-glow" href={action.href}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{action.label}</h2>
                  <p className="mt-2 text-sm font-semibold text-white/60">{action.text}</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded border border-show-gold/30 bg-show-gold/10 text-show-gold">
                  <Icon size={24} />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">Favoriten</h2>
            <p className="mt-1 text-sm font-semibold text-white/55">Deine wichtigsten Quizze für den Schnellstart.</p>
          </div>
          <Link className="font-black text-show-gold hover:text-white" href="/quizzes">Alle Quizze</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(favoriteQuizzes.length ? favoriteQuizzes : recentQuizzes.slice(0, 3)).map((quiz) => (
            <QuizLibraryCard key={quiz.id} quiz={quiz} compact favorite={favorites.includes(quiz.id)} onFavorite={() => toggleFavorite(quiz.id)} onPreview={() => startSession(quiz)} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black">Zuletzt bearbeitet</h2>
        <div className="mt-4 grid gap-3">
          {recentQuizzes.map((quiz) => (
            <Link key={quiz.id} className="grid gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-bold hover:border-show-gold/50 md:grid-cols-[1fr_auto]" href={`/quizzes/${quiz.id}/edit`}>
              <span>{quiz.title}</span>
              <span className="text-sm text-white/50">{quiz.questions.length} Fragen</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

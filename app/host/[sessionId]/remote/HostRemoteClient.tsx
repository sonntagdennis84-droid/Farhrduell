"use client";

import { BookOpen, Eye, Flag, Lock, Play, SkipForward, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { GameSession, LeaderboardRow, LiveAnswerHeatmap, Participant, Quiz } from "@/types/domain";
import { Logo } from "@/components/ui/Logo";
import { SoundToggleButton } from "@/components/ui/SoundToggleButton";
import { useFahrduellSound } from "@/hooks/useFahrduellSound";
import { isAnswerRevealed, isExplanationVisible, isLeaderboardVisible } from "@/lib/session-state";

type Bundle = { session: GameSession; quiz: Quiz; participants: Participant[]; leaderboard: LeaderboardRow[] };

const statusLabel: Record<string, string> = {
  LOBBY: "Lobby",
  RUNNING: "Frage bereit",
  QUESTION_ACTIVE: "Antwortphase",
  ANSWER_LOCKED: "Gesperrt",
  ANSWER_REVEALED: "Aufgelöst",
  EXPLANATION_VISIBLE: "Erklärung",
  LEADERBOARD_VISIBLE: "Punktestand",
  QUESTION_FINISHED: "Aufgelöst",
  FINISHED: "Beendet"
};

function RemoteButton({ icon, label, onClick, tone = "primary" }: { icon: ReactNode; label: string; onClick: () => void; tone?: "primary" | "secondary" | "danger" }) {
  const toneClass =
    tone === "danger"
      ? "border-show-red/60 bg-show-red/15 text-show-red"
      : tone === "secondary"
        ? "border-white/15 bg-white/10 text-white"
        : "border-show-gold/70 bg-show-gold text-show-navy shadow-glow";

  return (
    <button className={`flex min-h-16 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-base font-black transition active:scale-[0.98] ${toneClass}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function HostRemoteClient({ initialBundle, initialHeatmap }: { initialBundle: Bundle; initialHeatmap: LiveAnswerHeatmap | null }) {
  const [session, setSession] = useState(initialBundle.session);
  const [leaderboard, setLeaderboard] = useState(initialBundle.leaderboard);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<LiveAnswerHeatmap | null>(initialHeatmap);
  const question = initialBundle.quiz.questions[session.currentQuestionIndex];
  const active = session.status === "QUESTION_ACTIVE";
  const locked = session.status === "ANSWER_LOCKED";
  const revealed = isAnswerRevealed(session.status);
  const explanationVisible = isExplanationVisible(session.status);
  const leaderboardVisible = isLeaderboardVisible(session.status);
  const topRows = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const { soundEnabled, playSound, toggleSound } = useFahrduellSound("remote");

  const groupedAnswers = useMemo(() => {
    const groups = {
      A: [] as string[],
      B: [] as string[],
      C: [] as string[],
      D: [] as string[],
      pending: [] as string[]
    };
    for (const participant of heatmap?.participants ?? []) {
      if (!participant.selectedAnswer) groups.pending.push(participant.displayName);
      else groups[participant.selectedAnswer].push(participant.displayName);
    }
    return groups;
  }, [heatmap]);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: session.id });
    socket.on("question_started", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      playSound("question-start");
    });
    socket.on("session_updated", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
    });
    socket.on("question_revealed", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
    });
    socket.on("leaderboard_updated", (rows) => setLeaderboard(rows));
    socket.on("heatmap_updated", (nextHeatmap: LiveAnswerHeatmap) => {
      setHeatmap(nextHeatmap);
    });
    socket.on("quiz_finished", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      playSound("winner");
    });
    return () => {
      socket.disconnect();
    };
  }, [playSound, session.id]);

  async function action(path: string) {
    if (busyAction) return;
    if (path === "finish" && !window.confirm("Quiz wirklich beenden?")) return;
    setBusyAction(path);
    try {
      const response = await fetch(`/api/sessions/${session.id}/${path}`, { method: "POST" });
      const bundle = await response.json();
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="show-grid safe-screen min-h-screen">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <Logo compact />
          <a className="rounded border border-white/15 px-3 py-2 text-sm font-bold text-white/75" href={`/host/${session.id}`}>
            Beamer
          </a>
        </header>

        <section className="mt-4 rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-show-gold">Moderator-App</p>
              <h1 className="mt-1 text-2xl font-black">Fernbedienung</h1>
            </div>
            <div className="flex items-center gap-2">
              <SoundToggleButton soundEnabled={soundEnabled} onToggle={toggleSound} />
              <span className="rounded border border-show-gold/40 bg-show-gold/10 px-3 py-2 text-sm font-black text-show-gold">{statusLabel[session.status] ?? session.status}</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-black uppercase text-white/45">
              Frage {session.currentQuestionIndex + 1} von {initialBundle.quiz.questions.length}
            </p>
            <p className="mt-2 text-xl font-black leading-tight">{question?.questionText ?? "Keine Frage geladen"}</p>
            {question?.hint && <p className="mt-3 rounded border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white/70">Tipp: {question.hint}</p>}
          </div>

          <div className="mt-4 grid gap-3">
            {!active && !locked && !revealed && <RemoteButton icon={<Play size={22} />} label="Frage starten" onClick={() => action("start")} />}
            {active && <RemoteButton icon={<Lock size={22} />} label="Antworten sperren" onClick={() => action("lock")} />}
            {locked && <RemoteButton icon={<Eye size={22} />} label="Antwort auflösen" onClick={() => action("reveal")} />}
            {revealed && !explanationVisible && <RemoteButton icon={<BookOpen size={22} />} label="Erklärung anzeigen" onClick={() => action("explanation")} />}
            {revealed && !leaderboardVisible && <RemoteButton icon={<Trophy size={22} />} label="Punktestand einblenden" onClick={() => action("leaderboard")} tone="secondary" />}
            {revealed && <RemoteButton icon={<SkipForward size={22} />} label="Nächste Frage starten" onClick={() => action("next")} tone="secondary" />}
            <RemoteButton icon={<Flag size={22} />} label="Quiz beenden" onClick={() => action("finish")} tone="danger" />
          </div>

          {busyAction && <p className="mt-3 text-center text-sm font-black text-show-gold">Wird gesendet...</p>}
        </section>

        {(active || locked || revealed) && heatmap && (
          <section className="mt-4 rounded-lg border border-white/10 bg-show-panel/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase text-show-gold">Live-Antworten</h2>
              <span className="text-xs font-bold text-white/50">{heatmap.participants.length} Teilnehmer</span>
            </div>
            <div className="mt-3 grid gap-3">
              {[
                { key: "A", title: "A", chipClass: "border-sky-400/40 bg-sky-400/10 text-sky-300" },
                { key: "B", title: "B", chipClass: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
                { key: "C", title: "C", chipClass: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
                { key: "D", title: "D", chipClass: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
                { key: "pending", title: "Noch offen", chipClass: "border-white/15 bg-white/5 text-white/75" }
              ].map((group) => {
                const names = groupedAnswers[group.key as keyof typeof groupedAnswers];
                const isCorrectGroup = revealed && heatmap.correctAnswer === group.key;
                return (
                  <div key={group.key} className={isCorrectGroup ? "rounded-lg border border-show-gold bg-show-gold/10 p-3 shadow-glow" : "rounded-lg border border-white/10 bg-black/20 p-3"}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded border px-3 py-1 text-xs font-black ${group.chipClass}`}>{group.title}</span>
                      <span className="text-xs font-bold text-white/45">{names.length}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {names.length === 0 ? (
                        <span className="text-sm font-semibold text-white/35">-</span>
                      ) : (
                        names.map((name) => (
                          <span key={`${group.key}-${name}`} className={`rounded border px-3 py-1 text-sm font-bold ${group.chipClass}`}>
                            {name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-4 rounded-lg border border-white/10 bg-show-panel/85 p-4">
          <h2 className="text-sm font-black uppercase text-show-gold">Top 3</h2>
          <div className="mt-3 space-y-2">
            {topRows.length === 0 && <p className="text-sm font-semibold text-white/55">Noch keine Punkte.</p>}
            {topRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center rounded border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-black text-show-gold">#{row.rank}</span>
                <span className="font-bold">{row.displayName}</span>
                <span className="font-black text-show-gold">{row.totalPoints}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

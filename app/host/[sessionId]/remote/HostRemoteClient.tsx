"use client";

import { BookOpen, Eye, Flag, Lock, Play, SkipForward, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { GameSession, LeaderboardRow, LiveAnswerHeatmap, Participant, Quiz, TeamLeaderboardRow } from "@/types/domain";
import { Logo } from "@/components/ui/Logo";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";
import { SoundToggleButton } from "@/components/ui/SoundToggleButton";
import { useFahrduellSound } from "@/hooks/useFahrduellSound";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { gameModeLabel, isEliminationGameMode } from "@/lib/game-modes";
import { isAnswerRevealed, isExplanationVisible, isLeaderboardVisible } from "@/lib/session-state";

type Bundle = { session: GameSession; quiz: Quiz; participants: Participant[]; leaderboard: LeaderboardRow[]; teamLeaderboard: TeamLeaderboardRow[] };

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
    <button className={`flex min-h-[4.5rem] items-center justify-center gap-3 rounded-lg border px-5 py-4 text-lg font-black transition active:scale-[0.98] ${toneClass}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function HostRemoteClient({ initialBundle, initialHeatmap }: { initialBundle: Bundle; initialHeatmap: LiveAnswerHeatmap | null }) {
  const [session, setSession] = useState(initialBundle.session);
  const [participants, setParticipants] = useState(initialBundle.participants);
  const [leaderboard, setLeaderboard] = useState(initialBundle.leaderboard);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [heatmap, setHeatmap] = useState<LiveAnswerHeatmap | null>(initialHeatmap);
  const [allAnswersNotice, setAllAnswersNotice] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const previousStatusRef = useRef(session.status);
  const question = initialBundle.quiz.questions[session.currentQuestionIndex];
  const preview = session.status === "RUNNING";
  const active = session.status === "QUESTION_ACTIVE";
  const locked = session.status === "ANSWER_LOCKED";
  const revealed = isAnswerRevealed(session.status);
  const explanationVisible = isExplanationVisible(session.status);
  const leaderboardVisible = isLeaderboardVisible(session.status);
  const topRows = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const activeParticipantCount = participants.filter((participant) => !participant.isEliminated).length;
  const { soundEnabled, playSound, toggleSound } = useFahrduellSound("remote");
  const haptic = useHapticFeedback();

  const answerStats = useMemo(() => {
    const answered = (heatmap?.counts.A ?? 0) + (heatmap?.counts.B ?? 0) + (heatmap?.counts.C ?? 0) + (heatmap?.counts.D ?? 0);
    return [
      { key: "A", title: "A", count: heatmap?.counts.A ?? 0, chipClass: "border-sky-400/40 bg-sky-400/10 text-sky-300", barClass: "bg-sky-400" },
      { key: "B", title: "B", count: heatmap?.counts.B ?? 0, chipClass: "border-orange-400/40 bg-orange-400/10 text-orange-300", barClass: "bg-orange-400" },
      { key: "C", title: "C", count: heatmap?.counts.C ?? 0, chipClass: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300", barClass: "bg-emerald-400" },
      { key: "D", title: "D", count: heatmap?.counts.D ?? 0, chipClass: "border-rose-400/40 bg-rose-400/10 text-rose-300", barClass: "bg-rose-400" }
    ].map((item) => ({ ...item, percent: answered > 0 ? Math.round((item.count / answered) * 100) : 0 }));
  }, [heatmap]);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: session.id });
    socket.on("question_started", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      setAllAnswersNotice(false);
      playSound("question-start");
    });
    socket.on("session_updated", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
    });
    socket.on("question_revealed", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      haptic("success");
    });
    socket.on("leaderboard_updated", (rows) => setLeaderboard(rows));
    socket.on("heatmap_updated", (nextHeatmap: LiveAnswerHeatmap) => {
      setHeatmap(nextHeatmap);
      if (nextHeatmap.counts.pending === 0 && nextHeatmap.participants.length > 0) {
        setAllAnswersNotice(true);
        haptic("success");
        window.setTimeout(() => setAllAnswersNotice(false), 2600);
      }
    });
    socket.on("quiz_finished", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      haptic("success");
      playSound("winner");
    });
    return () => {
      socket.disconnect();
    };
  }, [haptic, playSound, session.id]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = session.status;
    if (previousStatus === session.status) return;
    if (session.status === "ANSWER_LOCKED") haptic(heatmap?.counts.pending === 0 ? "success" : "light");
    if (session.status === "ANSWER_REVEALED") haptic("success");
    if (session.status === "FINISHED") haptic("success");
  }, [haptic, heatmap?.counts.pending, session.status]);

  async function action(path: string) {
    if (busyAction) return;
    if (path === "finish" && !window.confirm("Quiz wirklich beenden?")) return;
    setBusyAction(path);
    try {
      const response = await fetch(`/api/sessions/${session.id}/${path}`, { method: "POST" });
      const bundle = await response.json();
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
    } finally {
      setBusyAction(null);
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button,a,input,textarea,select")) return;
    touchStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (!touchStartRef.current) return;
    const deltaX = event.clientX - touchStartRef.current.x;
    const deltaY = event.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    if (deltaX < 0) {
      history.back();
      return;
    }
    if ((revealed || leaderboardVisible) && session.status !== "FINISHED") void action("next");
  }

  return (
    <main className="show-grid safe-screen min-h-screen overflow-x-hidden" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <div className="remote-shell mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-md flex-col pb-4">
        <header className="flex items-center justify-between gap-3">
          <Logo compact />
          <a className="rounded border border-white/15 px-3 py-2 text-sm font-bold text-white/75" href={`/host/${session.id}`}>
            Beamer
          </a>
        </header>

        <section className="stage-panel mt-4 rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">
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

          {allAnswersNotice && (
            <div className="mt-4 rounded-lg border border-show-green/50 bg-show-green/15 px-4 py-3 text-sm font-black text-show-green shadow-glow">
              Alle Antworten eingegangen
            </div>
          )}

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-black uppercase text-white/45">
              Frage {session.currentQuestionIndex + 1} von {initialBundle.quiz.questions.length}
            </p>
            <p className="stage-body-text mt-2 text-xl font-black leading-tight">{question?.questionText ?? "Keine Frage geladen"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded border border-show-gold/30 bg-show-gold/10 px-2 py-1 text-xs font-black uppercase text-show-gold">{gameModeLabel(session.gameMode)}</span>
              {isEliminationGameMode(session.gameMode) && <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-black uppercase text-white/70">{activeParticipantCount} aktiv</span>}
            </div>
            {question?.hint && <p className="mt-3 rounded border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white/70">Tipp: {question.hint}</p>}
          </div>
        </section>

        {(active || locked || revealed) && heatmap && (
          <section className="mt-4 rounded-lg border border-white/10 bg-show-panel/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase text-show-gold">Stimmenverteilung</h2>
                <p className="mt-1 text-xs font-bold text-white/45">Anonymisiert nach Antwort</p>
              </div>
              <span className="text-xs font-bold text-white/50">{heatmap.participants.length} Teilnehmer</span>
            </div>
            <div className="mt-4 grid gap-3">
              {answerStats.map((group) => {
                const isCorrectGroup = revealed && heatmap.correctAnswer === group.key;
                return (
                  <div key={group.key} className={isCorrectGroup ? "rounded-lg border border-show-gold bg-show-gold/10 p-3 shadow-glow" : "rounded-lg border border-white/10 bg-black/20 p-3"}>
                    <div className="grid grid-cols-[3.25rem_1fr_4.5rem] items-center gap-3">
                      <span className={`grid h-11 w-11 place-items-center rounded border text-lg font-black ${group.chipClass}`}>{group.title}</span>
                      <div className="h-4 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full transition-all duration-500 ${group.barClass}`} style={{ width: `${group.percent}%` }} />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-white">{group.count}</div>
                        <div className="text-[0.65rem] font-black uppercase text-white/45">{group.percent}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm font-black uppercase text-white/60">Noch offen</span>
              <span className="text-2xl font-black text-show-gold">{heatmap.counts.pending}</span>
            </div>
          </section>
        )}

        <section className="mt-4 rounded-lg border border-white/10 bg-show-panel/85 p-4">
          <h2 className="text-sm font-black uppercase text-show-gold">Top 3</h2>
          <div className="mt-3 space-y-2">
            {topRows.length === 0 && <p className="text-sm font-semibold text-white/55">Noch keine Punkte.</p>}
            {topRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[2.5rem_3rem_1fr_auto] items-center rounded border border-white/10 bg-white/5 px-3 py-2 transition duration-300">
                <span className="font-black text-show-gold">{row.rank === 1 ? "👑" : `#${row.rank}`}</span>
                <ParticipantAvatar avatarId={row.avatarId} emoji={row.emoji} label={row.displayName} size="sm" />
                <span className="font-bold">{row.displayName}</span>
                <span className="font-black text-show-gold">{row.totalPoints}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sticky bottom-3 mt-auto rounded-lg border border-white/10 bg-show-navy/95 p-3 shadow-2xl backdrop-blur">
          <div className="grid gap-3">
            {!active && !locked && !revealed && !preview && <RemoteButton icon={<Play size={24} />} label="Frage anzeigen" onClick={() => action("start")} />}
            {preview && <RemoteButton icon={<Play size={24} />} label="Timer starten" onClick={() => action("timer")} />}
            {preview && <RemoteButton icon={<SkipForward size={24} />} label="Frage überspringen" onClick={() => action("next")} tone="secondary" />}
            {active && <RemoteButton icon={<Lock size={24} />} label="Antworten sperren" onClick={() => action("lock")} />}
            {locked && <RemoteButton icon={<Eye size={24} />} label="Antwort auflösen" onClick={() => action("reveal")} />}
            {revealed && <RemoteButton icon={<SkipForward size={24} />} label="Nächste Frage starten" onClick={() => action("next")} />}
            {revealed && !leaderboardVisible && <RemoteButton icon={<Trophy size={24} />} label="Punktestand einblenden" onClick={() => action("leaderboard")} tone="secondary" />}
            {revealed && !explanationVisible && <RemoteButton icon={<BookOpen size={24} />} label="Erklärung anzeigen" onClick={() => action("explanation")} tone="secondary" />}
            <RemoteButton icon={<Flag size={24} />} label="Quiz beenden" onClick={() => action("finish")} tone="danger" />
          </div>
          {busyAction && <p className="mt-3 text-center text-sm font-black text-show-gold">Wird gesendet...</p>}
        </section>
      </div>
    </main>
  );
}

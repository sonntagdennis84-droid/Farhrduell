"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { AnswerOption, GameSession, LeaderboardRow, Participant, Question, Quiz, TeamLeaderboardRow } from "@/types/domain";
import { AnswerButton } from "@/components/quiz/AnswerButton";
import { Leaderboard } from "@/components/quiz/Leaderboard";
import { TeamLeaderboard } from "@/components/quiz/TeamLeaderboard";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SoundToggleButton } from "@/components/ui/SoundToggleButton";
import { TimerRing } from "@/components/quiz/TimerRing";
import { Logo } from "@/components/ui/Logo";
import { useFahrduellSound } from "@/hooks/useFahrduellSound";
import { gameModeLabel, isEliminationGameMode } from "@/lib/game-modes";
import { isAnswerRevealed, isExplanationVisible, isLeaderboardVisible } from "@/lib/session-state";

type Bundle = { session: GameSession; quiz: Quiz; participants: Participant[]; leaderboard: LeaderboardRow[]; teamLeaderboard: TeamLeaderboardRow[] };
type AnonymousAnswerStats = {
  questionId: string;
  counts: Record<AnswerOption | "pending", number>;
};

function QuestionMedia({ question, large = false }: { question: Question; large?: boolean }) {
  if (!question.mediaUrl || question.mediaType === "none") return null;
  const frameClass = large ? "mt-6 max-h-[46vh]" : "mt-4 max-h-72";

  return (
    <figure className="stage-media-frame overflow-hidden rounded-lg border border-white/10 bg-black/25">
      {question.mediaType === "video" ? (
        <video className={`${frameClass} stage-media-asset w-full object-contain`} src={question.mediaUrl} controls muted playsInline />
      ) : question.mediaType === "audio" ? (
        <div className="px-6 py-8">
          <audio className="w-full" src={question.mediaUrl} controls preload="metadata" />
        </div>
      ) : (
        <img className={`${frameClass} stage-media-asset w-full object-contain`} src={question.mediaUrl} alt={question.mediaAlt || question.questionText} />
      )}
      {question.mediaCaption && <figcaption className="border-t border-white/10 px-4 py-2 text-sm font-semibold text-white/70">{question.mediaCaption}</figcaption>}
    </figure>
  );
}

function ExplanationPanel({ question }: { question: Question }) {
  const answerExplanations = [
    ["A", question.answerAExplanation],
    ["B", question.answerBExplanation],
    ["C", question.answerCExplanation],
    ["D", question.answerDExplanation]
  ].filter(([, text]) => Boolean(text));

  return (
    <div className="mt-5 space-y-4 rounded-lg border border-show-gold/40 bg-show-gold/10 p-5 text-white/90">
      <div>
        <p className="text-sm font-black uppercase text-show-gold">Erklärung</p>
        <p className="mt-1 text-2xl font-black">Richtig ist Antwort {question.correctAnswer}</p>
      </div>
      {question.explanation && <p className="text-lg leading-relaxed">{question.explanation}</p>}
      {answerExplanations.length > 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {answerExplanations.map(([option, text]) => (
            <div key={option} className="rounded border border-white/10 bg-black/20 p-3">
              <p className="font-black text-show-gold">Antwort {option}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{text}</p>
            </div>
          ))}
        </div>
      )}
      {question.memorySentence && <p className="rounded border border-show-gold/30 bg-black/20 p-3 font-black text-show-gold">{question.memorySentence}</p>}
      {question.practicalExample && <p className="leading-relaxed text-white/80">Praxis: {question.practicalExample}</p>}
      {question.memoryQuestion && <p className="font-bold text-white">Merken: {question.memoryQuestion}</p>}
    </div>
  );
}

function remainingSeconds(session: GameSession, question: Question) {
  const startedAt = session.currentQuestionStartedAt ? new Date(session.currentQuestionStartedAt).getTime() : Date.now();
  const elapsedMs = Math.max(Date.now() - startedAt, 0);
  return Math.max(Math.ceil(question.timeLimitSeconds - elapsedMs / 1000), 0);
}

export function HostClient({ initialBundle, initialAnswerStats }: { initialBundle: Bundle; initialAnswerStats: AnonymousAnswerStats | null }) {
  const [session, setSession] = useState(initialBundle.session);
  const [participants, setParticipants] = useState(initialBundle.participants);
  const [leaderboard, setLeaderboard] = useState(initialBundle.leaderboard);
  const [teamLeaderboard, setTeamLeaderboard] = useState(initialBundle.teamLeaderboard);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [welcomeQueue, setWelcomeQueue] = useState<string[]>([]);
  const [activeWelcome, setActiveWelcome] = useState<string | null>(null);
  const [introCountdown, setIntroCountdown] = useState(3);
  const [answerStats, setAnswerStats] = useState<AnonymousAnswerStats | null>(initialBundle.session.showParticipantAnswerStats ? initialAnswerStats : null);
  const countdownWarningPlayedRef = useRef<string | null>(null);
  const introCountdownFinishedRef = useRef<string | null>(null);
  const question = initialBundle.quiz.questions[session.currentQuestionIndex];
  const countdown = session.status === "QUESTION_COUNTDOWN";
  const finalIntro = session.status === "FINAL_QUESTION_INTRO";
  const preview = session.status === "RUNNING";
  const blackoutActive = Boolean(session.blackoutActive);
  const active = session.status === "QUESTION_ACTIVE" && !blackoutActive && !session.isTimerPaused;
  const locked = session.status === "ANSWER_LOCKED";
  const revealed = isAnswerRevealed(session.status);
  const explanationVisible = isExplanationVisible(session.status);
  const scoreboardVisible = isLeaderboardVisible(session.status);
  const { soundEnabled, playSound, toggleSound } = useFahrduellSound("host");
  const activeParticipantCount = participants.filter((participant) => !participant.isEliminated).length;

  const answerTexts = useMemo(() => (question ? { A: question.answerA, B: question.answerB, C: question.answerC, D: question.answerD } : null), [question]);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: session.id });
    socket.on("question_started", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      setTeamLeaderboard(bundle.teamLeaderboard);
      setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
      setAnswerStats(null);
      countdownWarningPlayedRef.current = null;
      playSound("question-start");
    });
    socket.on("session_updated", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      setTeamLeaderboard(bundle.teamLeaderboard);
      setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
      if (!bundle.session.showParticipantAnswerStats) setAnswerStats(null);
    });
    socket.on("leaderboard_updated", (rows) => setLeaderboard(rows));
    socket.on("participant_joined", (participant: Participant) => {
      setWelcomeQueue((items) => [...items, participant.displayName]);
    });
    socket.on("question_revealed", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      setTeamLeaderboard(bundle.teamLeaderboard);
      playSound("answer-correct");
    });
    socket.on("participant_answer_stats_updated", (stats: AnonymousAnswerStats | null) => setAnswerStats(stats));
    socket.on("quiz_finished", (bundle: Bundle) => {
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      setTeamLeaderboard(bundle.teamLeaderboard);
      playSound("winner");
      location.href = `/results/${bundle.session.id}`;
    });
    return () => {
      socket.disconnect();
    };
  }, [playSound, session.id]);

  useEffect(() => {
    if (activeWelcome || welcomeQueue.length === 0) return;
    const [nextName, ...rest] = welcomeQueue;
    setActiveWelcome(nextName);
    setWelcomeQueue(rest);
    const timeout = window.setTimeout(() => setActiveWelcome(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [activeWelcome, welcomeQueue]);

  useEffect(() => {
    if (!countdown || !question || blackoutActive) return;
    const countdownKey = `${session.id}:${question.id}:${session.currentQuestionIndex}`;
    setIntroCountdown(3);
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      setIntroCountdown(Math.max(3 - elapsedSeconds, 1));
    }, 150);
    const timeout = window.setTimeout(async () => {
      if (introCountdownFinishedRef.current === countdownKey) return;
      introCountdownFinishedRef.current = countdownKey;
      const response = await fetch(`/api/sessions/${session.id}/start`, { method: "POST" });
      if (!response.ok) return;
      const bundle = await response.json();
      setSession(bundle.session);
      setParticipants(bundle.participants);
      setLeaderboard(bundle.leaderboard);
      setTeamLeaderboard(bundle.teamLeaderboard);
    }, 3000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [blackoutActive, countdown, question, session.currentQuestionIndex, session.id]);

  useEffect(() => {
    if (!active || !question) return;
    setSecondsLeft(remainingSeconds(session, question));
    const interval = window.setInterval(() => {
      const nextValue = remainingSeconds(session, question);
      setSecondsLeft(nextValue);
      if (nextValue <= 5 && nextValue > 0 && countdownWarningPlayedRef.current !== question.id) {
        countdownWarningPlayedRef.current = question.id;
        playSound("countdown-warning");
      }
      if (nextValue <= 0) {
        window.clearInterval(interval);
        fetch(`/api/sessions/${session.id}/lock`, { method: "POST" });
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [active, playSound, question, session]);

  async function action(path: string) {
    if (path === "finish" && !window.confirm("Quiz wirklich beenden?")) return;
    if (path === "leaderboard") playSound("leaderboard");
    if (path === "start") playSound("quiz-start");
    const response = await fetch(`/api/sessions/${session.id}/${path}`, { method: "POST" });
    const bundle = await response.json();
    if (path === "next" && bundle.session.status === "FINISHED") {
      location.href = `/results/${session.id}`;
      return;
    }
    setSession(bundle.session);
    setParticipants(bundle.participants);
    setLeaderboard(bundle.leaderboard);
    setTeamLeaderboard(bundle.teamLeaderboard);
    if (!bundle.session.showParticipantAnswerStats) setAnswerStats(null);
  }

  if (!question) {
    return <PrimaryButton onClick={() => (location.href = `/results/${session.id}`)}>Zum Ergebnis</PrimaryButton>;
  }

  if (blackoutActive) {
    return (
      <main className="show-grid min-h-[calc(100svh-2rem)] place-items-center overflow-hidden rounded-lg border border-white/10 bg-show-navy/95 p-8 text-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.16),transparent_36%),linear-gradient(135deg,rgba(37,99,235,0.16),transparent_45%)]" />
        <section className="relative z-10 max-w-3xl">
          <div className="mx-auto flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-10 text-5xl font-black text-white md:text-7xl">Bitte kurz zuhören</h1>
          <p className="mt-5 text-2xl font-bold text-show-gold">Der Moderator erklärt die Situation.</p>
        </section>
      </main>
    );
  }

  if (finalIntro) {
    return (
      <main className="show-grid min-h-[calc(100svh-2rem)] place-items-center rounded-lg border border-show-gold/40 bg-show-panel/95 p-8 text-center shadow-glow">
        <section className="max-w-4xl">
          <p className="text-xl font-black uppercase text-show-gold">Finale</p>
          <h1 className="mt-5 text-6xl font-black leading-tight text-white md:text-8xl">Achtung letzte Frage</h1>
          <p className="mt-6 text-2xl font-bold text-white/75">Jetzt zählt jede Antwort.</p>
          <div className="mt-10 flex justify-center">
            <PrimaryButton onClick={() => action("start")}>Letzte Frage anzeigen</PrimaryButton>
          </div>
        </section>
      </main>
    );
  }

  if (countdown) {
    return (
      <main className="show-grid min-h-[calc(100svh-2rem)] place-items-center rounded-lg border border-show-gold/40 bg-show-panel/95 p-8 text-center shadow-glow">
        <section>
          <p className="text-xl font-black uppercase text-show-gold">Quiz startet</p>
          <div className="mt-8 grid h-56 w-56 place-items-center rounded-full border-4 border-show-gold bg-show-gold/15 text-9xl font-black text-show-gold shadow-glow md:h-72 md:w-72 md:text-[11rem]">
            {introCountdown}
          </div>
          <p className="mt-8 text-3xl font-black text-white">Macht euch bereit</p>
        </section>
      </main>
    );
  }

  if (scoreboardVisible) {
    const topThree = leaderboard.slice(0, 3);
    return (
      <div className="space-y-6">
        <section className="stage-panel rounded-lg border border-show-gold/50 bg-show-panel/95 p-6 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase text-show-gold">Zwischenstand</div>
              <h1 className="stage-question-title mt-2 text-5xl font-black leading-tight">Aktueller Punktestand</h1>
              <p className="mt-2 text-white/70">
                Nach Frage {session.currentQuestionIndex + 1} von {initialBundle.quiz.questions.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SoundToggleButton soundEnabled={soundEnabled} onToggle={toggleSound} />
              <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("reveal")}>
                Zur Auflösung
              </button>
              <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("next")}>
                Nächste Frage starten
              </button>
            </div>
          </div>
        </section>

        {session.gameMode === "team_battle" && teamLeaderboard.length > 0 && (
          <section className="rounded-lg border border-show-gold/30 bg-show-panel/90 p-5">
            <h2 className="mb-3 text-xl font-black text-show-gold">Teamwertung</h2>
            <TeamLeaderboard rows={teamLeaderboard} limit={4} />
          </section>
        )}

        {session.gameMode !== "team_battle" && topThree.length > 0 && (
          <section className="grid gap-4 md:grid-cols-3">
            {topThree.map((row) => (
              <div key={row.id} className={row.rank === 1 ? "rounded-lg border border-show-gold bg-show-gold/10 p-6 shadow-glow" : "rounded-lg border border-white/10 bg-show-panel/90 p-6"}>
                <div className="text-6xl font-black text-show-gold">{row.rank === 1 ? "👑" : `#${row.rank}`}</div>
                <div className="mt-4">
                  <ParticipantAvatar avatarId={row.avatarId} emoji={row.emoji} label={row.displayName} size={row.rank === 1 ? "xl" : "lg"} />
                </div>
                <div className="mt-3 text-3xl font-black">{row.displayName}</div>
                <div className="mt-2 text-2xl font-black text-show-gold">{row.totalPoints} Punkte</div>
                <div className="mt-2 text-white/60">{row.correctAnswers} richtig</div>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-lg border border-white/10 bg-show-panel/90 p-5">
          <Leaderboard rows={leaderboard} limit={6} />
        </section>
      </div>
    );
  }

  return (
    <div className="relative pb-36">
      <section className="stage-panel rounded-lg border border-white/10 bg-show-panel/90 p-6">
        {activeWelcome && (
          <div className="mb-5 rounded-lg border border-show-gold/40 bg-show-gold/12 px-5 py-4 shadow-glow">
            <p className="text-sm font-black uppercase text-show-gold">Neuer Teilnehmer</p>
            <p className="mt-1 text-3xl font-black text-white">Willkommen, {activeWelcome}!</p>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase text-show-gold">
              Frage {session.currentQuestionIndex + 1} von {initialBundle.quiz.questions.length}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded border border-show-gold/30 bg-show-gold/10 px-3 py-1 text-sm font-black uppercase text-show-gold">{gameModeLabel(session.gameMode)}</span>
              {isEliminationGameMode(session.gameMode) && (
                <span className="rounded border border-white/10 bg-black/25 px-3 py-1 text-sm font-black uppercase text-white/70">{activeParticipantCount} aktiv</span>
              )}
            </div>
            <h1 className="stage-question-title mt-3 text-4xl font-black leading-tight">{question.questionText}</h1>
            <p className="mt-3 inline-flex rounded border border-white/10 bg-black/25 px-3 py-1 text-sm font-black uppercase text-white/70">
              {preview ? "Frage sichtbar" : active ? "Antwortphase läuft" : locked ? "Antworten gesperrt" : revealed ? "Auflösung" : "Bereit"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <SoundToggleButton soundEnabled={soundEnabled} onToggle={toggleSound} />
            {!preview && <TimerRing secondsLeft={active ? secondsLeft : question.timeLimitSeconds} totalSeconds={question.timeLimitSeconds} size="stage" />}
          </div>
        </div>

        <QuestionMedia question={question} large />

        {!preview && (
        <div className="stage-answer-grid mt-8 grid gap-4 md:grid-cols-2">
          {answerTexts &&
            (["A", "B", "C", "D"] as const).map((option) => (
              <div key={option} className={revealed && option === question.correctAnswer ? "rounded-lg ring-4 ring-show-gold" : ""}>
                <AnswerButton option={option} text={answerTexts[option]} disabled size="stage" />
              </div>
            ))}
        </div>
        )}

        {explanationVisible && <ExplanationPanel question={question} />}

        <div className="mt-6 flex flex-wrap gap-3">
          {!active && !locked && !revealed && !preview && <PrimaryButton onClick={() => action("start")}>Frage anzeigen</PrimaryButton>}
          {preview && <PrimaryButton onClick={() => action("timer")}>Timer starten</PrimaryButton>}
          {preview && <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("next")}>Frage überspringen</button>}
          {active && <PrimaryButton onClick={() => action("lock")}>Antworten sperren</PrimaryButton>}
          {revealed && !explanationVisible && <PrimaryButton onClick={() => action("explanation")}>Erklärung anzeigen</PrimaryButton>}
          {revealed && <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("leaderboard")}>Punktestand einblenden</button>}
          {revealed && <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("next")}>Nächste Frage starten</button>}
        </div>
      </section>
      {session.showParticipantAnswerStats && answerStats && (
        <aside className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-6xl animate-in slide-in-from-bottom-6 duration-500">
          <div className="rounded-lg border border-show-gold/45 bg-show-navy/95 p-4 shadow-glow backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase text-show-gold">Stimmenverteilung</p>
                <p className="text-sm font-bold text-white/55">Anonymisiert, nur Anzahl pro Antwort</p>
              </div>
              <div className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white/65">Noch offen: {answerStats.counts.pending ?? 0}</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {(["A", "B", "C", "D"] as const).map((option) => (
                <div key={option} className="grid grid-cols-[3.5rem_1fr] items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                  <span className="grid h-12 w-12 place-items-center rounded border border-show-gold/45 bg-show-gold/15 text-2xl font-black text-show-gold">{option}</span>
                  <div>
                    <p className="text-xs font-black uppercase text-white/45">Stimmen</p>
                    <p className="text-4xl font-black text-white">{answerStats.counts[option] ?? 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

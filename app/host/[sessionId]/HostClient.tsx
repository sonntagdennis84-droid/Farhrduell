"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { GameSession, LeaderboardRow, Participant, Quiz } from "@/types/domain";
import { AnswerButton } from "@/components/quiz/AnswerButton";
import { Leaderboard } from "@/components/quiz/Leaderboard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TimerRing } from "@/components/quiz/TimerRing";

export function HostClient({ initialBundle }: { initialBundle: { session: GameSession; quiz: Quiz; participants: Participant[]; leaderboard: LeaderboardRow[] } }) {
  const [session, setSession] = useState(initialBundle.session);
  const [leaderboard, setLeaderboard] = useState(initialBundle.leaderboard);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const question = initialBundle.quiz.questions[session.currentQuestionIndex];
  const active = session.status === "QUESTION_ACTIVE";
  const revealed = session.status === "QUESTION_FINISHED";

  const answerTexts = useMemo(() => (question ? { A: question.answerA, B: question.answerB, C: question.answerC, D: question.answerD } : null), [question]);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: session.id });
    socket.on("question_started", (bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      setShowScoreboard(false);
      setSecondsLeft(bundle.quiz.questions[bundle.session.currentQuestionIndex].timeLimitSeconds);
    });
    socket.on("leaderboard_updated", (rows) => setLeaderboard(rows));
    socket.on("question_revealed", (bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
    });
    socket.on("quiz_finished", (bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      location.href = `/results/${session.id}`;
    });
    return () => {
      socket.disconnect();
    };
  }, [session.id]);

  useEffect(() => {
    if (!active || !question) return;
    setSecondsLeft(question.timeLimitSeconds);
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          fetch(`/api/sessions/${session.id}/reveal`, { method: "POST" });
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [active, question, session.id]);

  async function action(path: string) {
    const response = await fetch(`/api/sessions/${session.id}/${path}`, { method: "POST" });
    const bundle = await response.json();
    if (path === "next" && bundle.session.status === "FINISHED") {
      location.href = `/results/${session.id}`;
      return;
    }
    setSession(bundle.session);
    setLeaderboard(bundle.leaderboard);
    if (path === "next" || path === "start") setShowScoreboard(false);
  }

  if (!question) {
    return <PrimaryButton onClick={() => (location.href = `/results/${session.id}`)}>Zum Ergebnis</PrimaryButton>;
  }

  if (showScoreboard) {
    const topThree = leaderboard.slice(0, 3);
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-show-gold/50 bg-show-panel/95 p-6 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase text-show-gold">Zwischenstand</div>
              <h1 className="mt-2 text-5xl font-black leading-tight">Aktueller Punktestand</h1>
              <p className="mt-2 text-white/70">
                Nach Frage {session.currentQuestionIndex + 1} von {initialBundle.quiz.questions.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => setShowScoreboard(false)}>
                Zur Frage
              </button>
              <PrimaryButton onClick={() => action("next")}>Nächste Frage</PrimaryButton>
            </div>
          </div>
        </section>

        {topThree.length > 0 && (
          <section className="grid gap-4 md:grid-cols-3">
            {topThree.map((row) => (
              <div key={row.id} className={row.rank === 1 ? "rounded-lg border border-show-gold bg-show-gold/10 p-6 shadow-glow" : "rounded-lg border border-white/10 bg-show-panel/90 p-6"}>
                <div className="text-6xl font-black text-show-gold">#{row.rank}</div>
                <div className="mt-4 text-3xl font-black">{row.displayName}</div>
                <div className="mt-2 text-2xl font-black text-show-gold">{row.totalPoints} Punkte</div>
                <div className="mt-2 text-white/60">{row.correctAnswers} richtig</div>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-lg border border-white/10 bg-show-panel/90 p-5">
          <Leaderboard rows={leaderboard} limit={20} />
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-lg border border-white/10 bg-show-panel/90 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase text-show-gold">Frage {session.currentQuestionIndex + 1}</div>
            <h1 className="mt-3 text-4xl font-black leading-tight">{question.questionText}</h1>
          </div>
          <TimerRing secondsLeft={active ? secondsLeft : question.timeLimitSeconds} totalSeconds={question.timeLimitSeconds} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {answerTexts &&
            (["A", "B", "C", "D"] as const).map((option) => (
              <div key={option} className={revealed && option === question.correctAnswer ? "rounded-lg ring-4 ring-show-gold" : ""}>
                <AnswerButton option={option} text={answerTexts[option]} disabled />
              </div>
            ))}
        </div>
        {revealed && question.explanation && <p className="mt-5 rounded border border-show-gold/40 bg-show-gold/10 p-4 text-white/85">{question.explanation}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          {!active && !revealed && <PrimaryButton onClick={() => action("start")}>Frage starten</PrimaryButton>}
          {active && <PrimaryButton onClick={() => action("reveal")}>Auflösen</PrimaryButton>}
          {revealed && (
            <>
              <PrimaryButton onClick={() => setShowScoreboard(true)}>Punktestand einblenden</PrimaryButton>
              <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("next")}>
                Nächste Frage
              </button>
            </>
          )}
          <button className="rounded border border-white/20 px-5 py-3 font-bold" onClick={() => action("finish")}>
            Beenden
          </button>
        </div>
      </section>
      <aside className="rounded-lg border border-white/10 bg-show-panel/90 p-5">
        <h2 className="text-2xl font-black">Rangliste</h2>
        <div className="mt-4">
          <Leaderboard rows={leaderboard} />
        </div>
      </aside>
    </div>
  );
}

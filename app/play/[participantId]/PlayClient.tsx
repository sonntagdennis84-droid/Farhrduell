"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { AnswerOption, GameSession, Participant, Question, Quiz } from "@/types/domain";
import { AnswerButton } from "@/components/quiz/AnswerButton";
import { Logo } from "@/components/ui/Logo";
import { TimerRing } from "@/components/quiz/TimerRing";
import { isAnswerLocked, isAnswerRevealed } from "@/lib/session-state";

function remainingSeconds(session: GameSession, question: Question) {
  const startedAt = session.currentQuestionStartedAt ? new Date(session.currentQuestionStartedAt).getTime() : Date.now();
  const elapsedMs = Math.max(Date.now() - startedAt, 0);
  return Math.max(Math.ceil(question.timeLimitSeconds - elapsedMs / 1000), 0);
}

export function PlayClient({ participant, session, quiz }: { participant: Participant; session: GameSession; quiz: Quiz }) {
  const [currentSession, setCurrentSession] = useState(session);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [message, setMessage] = useState("Warte auf den Start.");
  const [connected, setConnected] = useState(false);
  const question: Question | undefined = quiz.questions[currentSession.currentQuestionIndex];
  const active = currentSession.status === "QUESTION_ACTIVE";
  const locked = isAnswerLocked(currentSession.status);
  const revealed = isAnswerRevealed(currentSession.status);

  const answerTexts = useMemo(() => (question ? { A: question.answerA, B: question.answerB, C: question.answerC, D: question.answerD } : null), [question]);

  useEffect(() => {
    const socket = io({ reconnection: true, reconnectionAttempts: Infinity, reconnectionDelayMax: 3000 });

    function joinRoom() {
      setConnected(true);
      socket.emit("participant:join", { sessionId: participant.sessionId, participantId: participant.id });
    }

    socket.on("connect", joinRoom);
    socket.on("reconnect", joinRoom);
    socket.on("disconnect", () => setConnected(false));
    socket.on("question_started", (bundle) => {
      setCurrentSession(bundle.session);
      setSelected(null);
      setMessage("");
      setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
    });
    socket.on("session_updated", (bundle) => {
      setCurrentSession(bundle.session);
      if (bundle.session.status === "ANSWER_LOCKED") setMessage("Antworten sind gesperrt.");
      if (bundle.session.status === "ANSWER_REVEALED") setMessage("Frage aufgelöst.");
      if (bundle.session.status === "EXPLANATION_VISIBLE") setMessage("Erklärung eingeblendet.");
      if (bundle.session.status === "QUESTION_ACTIVE") {
        setSelected(null);
        setMessage("");
        setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
      }
    });
    socket.on("question_revealed", (bundle) => {
      setCurrentSession(bundle.session);
      setMessage("Frage aufgelöst.");
    });
    socket.on("quiz_finished", () => {
      location.href = `/results/${participant.sessionId}`;
    });
    return () => {
      socket.disconnect();
    };
  }, [participant.id, participant.sessionId]);

  useEffect(() => {
    if (!active || !question) return;
    setSecondsLeft(remainingSeconds(currentSession, question));
    const interval = window.setInterval(() => setSecondsLeft(remainingSeconds(currentSession, question)), 250);
    return () => window.clearInterval(interval);
  }, [active, currentSession, question]);

  async function answer(option: AnswerOption) {
    if (selected || !active) return;
    setSelected(option);
    setMessage("Antwort gespeichert.");
    const response = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: participant.id, selectedAnswer: option })
    });
    if (!response.ok) setMessage("Antwort konnte nicht gespeichert werden.");
  }

  return (
    <main className="show-grid safe-screen">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <Logo compact />
          <div className="text-right">
            <p className="text-sm font-black text-show-gold">
              <span className="mr-1">{participant.emoji ?? "🚗"}</span>
              {participant.displayName}
            </p>
            <p className={connected ? "text-xs font-bold text-show-green" : "text-xs font-bold text-show-red"}>
              {connected ? "Verbunden" : "Verbindung wird wiederhergestellt"}
            </p>
          </div>
        </header>

        <section className="mt-4 flex flex-1 flex-col rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase text-show-gold">
                Frage {question ? currentSession.currentQuestionIndex + 1 : 0} von {quiz.questions.length}
              </p>
              <p className="mt-2 text-xs font-black uppercase text-white/55">
                {active ? "Antwortphase" : locked && !revealed ? "Gesperrt" : revealed ? "Auflösung" : "Warten"}
              </p>
            </div>
            {question && <TimerRing secondsLeft={active ? secondsLeft : question.timeLimitSeconds} totalSeconds={question.timeLimitSeconds} />}
          </div>

          <div className="mt-5 grid flex-1 content-center gap-3">
            {answerTexts &&
              (["A", "B", "C", "D"] as const).map((option) => (
                <div key={option} className={revealed && option === question?.correctAnswer ? "rounded-lg ring-4 ring-show-gold" : ""}>
                  <AnswerButton
                    option={option}
                    text=""
                    selected={selected === option}
                    disabled={!active || !!selected}
                    className="min-h-[7.5rem] justify-center rounded-lg px-4 py-4 [&>span:last-child]:hidden"
                    onClick={() => answer(option)}
                  />
                </div>
              ))}
          </div>

          <div className="mt-4 min-h-7 text-center">
            {message && <p className="font-black text-show-gold">{message}</p>}
            {!active && !locked && <p className="text-sm font-semibold text-white/60">Warte auf die nächste Frage.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

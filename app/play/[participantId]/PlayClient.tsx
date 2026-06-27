"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { AnswerOption, GameSession, Participant, Question, Quiz } from "@/types/domain";
import { AnswerButton } from "@/components/quiz/AnswerButton";
import { Logo } from "@/components/ui/Logo";
import { TimerRing } from "@/components/quiz/TimerRing";

export function PlayClient({ participant, session, quiz }: { participant: Participant; session: GameSession; quiz: Quiz }) {
  const [currentSession, setCurrentSession] = useState(session);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [message, setMessage] = useState("Warte auf den Start.");
  const [connected, setConnected] = useState(false);
  const question: Question | undefined = quiz.questions[currentSession.currentQuestionIndex];
  const active = currentSession.status === "QUESTION_ACTIVE";
  const revealed = currentSession.status === "QUESTION_FINISHED";

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
      setSecondsLeft(bundle.quiz.questions[bundle.session.currentQuestionIndex].timeLimitSeconds);
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
    setSecondsLeft(question.timeLimitSeconds);
    const interval = window.setInterval(() => setSecondsLeft((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(interval);
  }, [active, question]);

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
            <p className="text-sm font-black text-show-gold">{participant.displayName}</p>
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
              <h1 className="mt-2 text-2xl font-black leading-tight text-white">{question?.questionText ?? "Gleich geht es los."}</h1>
            </div>
            {question && <TimerRing secondsLeft={active ? secondsLeft : question.timeLimitSeconds} totalSeconds={question.timeLimitSeconds} />}
          </div>

          <div className="mt-5 grid flex-1 content-center gap-3">
            {answerTexts &&
              (["A", "B", "C", "D"] as const).map((option) => (
                <AnswerButton
                  key={option}
                  option={option}
                  text={answerTexts[option]}
                  selected={selected === option}
                  disabled={!active || !!selected}
                  className="min-h-[5.25rem] rounded-lg px-4 py-4"
                  onClick={() => answer(option)}
                />
              ))}
          </div>

          {revealed && question && (
            <div className="mt-4 rounded border border-show-gold/40 bg-show-gold/10 p-3">
              <p className="font-black text-show-gold">Richtig: {question.correctAnswer}</p>
              {question.explanation && <p className="mt-1 text-sm leading-relaxed text-white/80">{question.explanation}</p>}
            </div>
          )}

          <div className="mt-4 min-h-7 text-center">
            {message && <p className="font-black text-show-gold">{message}</p>}
            {!active && !revealed && <p className="text-sm font-semibold text-white/60">Bereit für die nächste Frage.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

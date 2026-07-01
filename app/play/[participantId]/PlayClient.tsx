"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { AnswerOption, GameSession, Participant, Question, Quiz } from "@/types/domain";
import { AnswerButton } from "@/components/quiz/AnswerButton";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";
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
  const [currentParticipant, setCurrentParticipant] = useState(participant);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selected, setSelected] = useState<AnswerOption | null>(null);
  const [message, setMessage] = useState("Warte auf den Start.");
  const [connected, setConnected] = useState(false);
  const question: Question | undefined = quiz.questions[currentSession.currentQuestionIndex];
  const countdown = currentSession.status === "QUESTION_COUNTDOWN";
  const finalIntro = currentSession.status === "FINAL_QUESTION_INTRO";
  const preview = currentSession.status === "RUNNING";
  const active = currentSession.status === "QUESTION_ACTIVE" && !currentSession.isTimerPaused;
  const locked = isAnswerLocked(currentSession.status);
  const revealed = isAnswerRevealed(currentSession.status);
  const eliminated = Boolean(currentParticipant.isEliminated);

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
      const updatedParticipant = bundle.participants?.find((item: Participant) => item.id === participant.id);
      if (updatedParticipant) setCurrentParticipant(updatedParticipant);
      setSelected(null);
      setMessage("");
      setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
    });
    socket.on("session_updated", (bundle) => {
      setCurrentSession(bundle.session);
      const updatedParticipant = bundle.participants?.find((item: Participant) => item.id === participant.id);
      if (updatedParticipant) setCurrentParticipant(updatedParticipant);
      if (bundle.session.status === "ANSWER_LOCKED") setMessage("Antworten sind gesperrt.");
      if (bundle.session.status === "ANSWER_REVEALED") setMessage("Frage aufgelöst.");
      if (bundle.session.status === "EXPLANATION_VISIBLE") setMessage("Erklärung eingeblendet.");
      if (bundle.session.status === "RUNNING") {
        setSelected(null);
        setMessage("Warte auf Antwortfreigabe.");
      }
      if (bundle.session.status === "QUESTION_COUNTDOWN") {
        setSelected(null);
        setMessage("Quiz startet gleich.");
      }
      if (bundle.session.status === "FINAL_QUESTION_INTRO") {
        setSelected(null);
        setMessage("Achtung letzte Frage.");
      }
      if (bundle.session.status === "QUESTION_ACTIVE") {
        setSelected(null);
        setMessage("");
        setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
      }
    });
    socket.on("question_revealed", (bundle) => {
      setCurrentSession(bundle.session);
      const updatedParticipant = bundle.participants?.find((item: Participant) => item.id === participant.id);
      if (updatedParticipant) setCurrentParticipant(updatedParticipant);
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
    if (selected || !active || eliminated) return;
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
    <main className="show-grid safe-screen overflow-x-hidden">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between gap-3">
          <Logo compact />
          <div className="flex items-center gap-3 text-right">
            <ParticipantAvatar avatarId={currentParticipant.avatarId} emoji={currentParticipant.emoji} label={currentParticipant.displayName} size="sm" />
            <div>
              <p className="text-sm font-black text-show-gold">{currentParticipant.displayName}</p>
              <p className={connected ? "text-xs font-bold text-show-green" : "text-xs font-bold text-show-red"}>
                {connected ? "Verbunden" : "Verbindung wird wiederhergestellt"}
              </p>
              {Number(currentParticipant.livesRemaining ?? 0) > 0 && <p className="text-xs font-black text-show-gold">♥ {currentParticipant.livesRemaining}</p>}
            </div>
          </div>
        </header>

        <section className="stage-panel mt-4 flex flex-1 flex-col rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="stage-body-text text-xs font-black uppercase text-show-gold">
                Frage {question ? currentSession.currentQuestionIndex + 1 : 0} von {quiz.questions.length}
              </p>
              <p className="mt-2 text-xs font-black uppercase text-white/55">
                {countdown ? "Startet gleich" : finalIntro ? "Letzte Frage" : preview ? "Warte auf Freigabe" : active ? "Antwortphase" : locked && !revealed ? "Gesperrt" : revealed ? "Auflösung" : "Warten"}
              </p>
            </div>
            {question && active && <TimerRing secondsLeft={secondsLeft} totalSeconds={question.timeLimitSeconds} />}
            {question && locked && !revealed && (
              <div className="rounded-lg border border-show-gold/35 bg-show-gold/10 px-4 py-3 text-center text-sm font-black uppercase text-show-gold">
                {selected ? "Antwort abgegeben" : "Gesperrt"}
              </div>
            )}
          </div>

          <div className="stage-answer-grid mt-5 grid flex-1 content-center gap-3">
            {(countdown || finalIntro) && (
              <div className="rounded-lg border border-show-gold/35 bg-show-gold/10 px-5 py-8 text-center">
                <p className="text-2xl font-black text-show-gold">{finalIntro ? "Achtung letzte Frage" : "Quiz startet gleich"}</p>
                <p className="mt-2 text-sm font-bold text-white/60">Schau bitte auf den Hauptbildschirm.</p>
              </div>
            )}
            {!preview && !countdown && !finalIntro && answerTexts &&
              (["A", "B", "C", "D"] as const).map((option) => (
                <div key={option} className={revealed && option === question?.correctAnswer ? "rounded-lg ring-4 ring-show-gold" : ""}>
                  <AnswerButton
                    option={option}
                    text={answerTexts[option]}
                    selected={selected === option}
                    disabled={!active || !!selected || eliminated || preview}
                    className="min-h-[7.5rem] rounded-lg px-4 py-4 text-left"
                    onClick={() => answer(option)}
                  />
                </div>
              ))}
          </div>

          <div className="mt-4 min-h-7 text-center">
            {message && <p className="font-black text-show-gold">{message}</p>}
            {preview && <p className="font-black text-show-gold">Warte auf Antwortfreigabe.</p>}
            {eliminated && <p className="font-black text-show-red">Du bist ausgeschieden und kannst weiter zuschauen.</p>}
            {!active && !locked && <p className="text-sm font-semibold text-white/60">Warte auf die nächste Frage.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

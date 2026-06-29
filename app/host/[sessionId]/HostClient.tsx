"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import type { GameSession, LeaderboardRow, Participant, Question, Quiz } from "@/types/domain";
import { AnswerButton } from "@/components/quiz/AnswerButton";
import { Leaderboard } from "@/components/quiz/Leaderboard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SoundToggleButton } from "@/components/ui/SoundToggleButton";
import { TimerRing } from "@/components/quiz/TimerRing";
import { useFahrduellSound } from "@/hooks/useFahrduellSound";
import { isAnswerRevealed, isExplanationVisible, isLeaderboardVisible } from "@/lib/session-state";

type Bundle = { session: GameSession; quiz: Quiz; participants: Participant[]; leaderboard: LeaderboardRow[] };

function QuestionMedia({ question, large = false }: { question: Question; large?: boolean }) {
  if (!question.mediaUrl || question.mediaType === "none") return null;
  const frameClass = large ? "mt-6 max-h-[46vh]" : "mt-4 max-h-72";

  return (
    <figure className="overflow-hidden rounded-lg border border-white/10 bg-black/25">
      {question.mediaType === "video" ? (
        <video className={`${frameClass} w-full object-contain`} src={question.mediaUrl} controls muted playsInline />
      ) : question.mediaType === "audio" ? (
        <div className="px-6 py-8">
          <audio className="w-full" src={question.mediaUrl} controls preload="metadata" />
        </div>
      ) : (
        <img className={`${frameClass} w-full object-contain`} src={question.mediaUrl} alt={question.mediaAlt || question.questionText} />
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

export function HostClient({ initialBundle }: { initialBundle: Bundle }) {
  const [session, setSession] = useState(initialBundle.session);
  const [leaderboard, setLeaderboard] = useState(initialBundle.leaderboard);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const countdownWarningPlayedRef = useRef<string | null>(null);
  const question = initialBundle.quiz.questions[session.currentQuestionIndex];
  const active = session.status === "QUESTION_ACTIVE";
  const locked = session.status === "ANSWER_LOCKED";
  const revealed = isAnswerRevealed(session.status);
  const explanationVisible = isExplanationVisible(session.status);
  const scoreboardVisible = isLeaderboardVisible(session.status);
  const { soundEnabled, playSound, toggleSound } = useFahrduellSound("host");

  const answerTexts = useMemo(() => (question ? { A: question.answerA, B: question.answerB, C: question.answerC, D: question.answerD } : null), [question]);

  useEffect(() => {
    const socket = io();
    socket.emit("host:join", { sessionId: session.id });
    socket.on("question_started", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
      countdownWarningPlayedRef.current = null;
      playSound("question-start");
    });
    socket.on("session_updated", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      setSecondsLeft(remainingSeconds(bundle.session, bundle.quiz.questions[bundle.session.currentQuestionIndex]));
    });
    socket.on("leaderboard_updated", (rows) => setLeaderboard(rows));
    socket.on("question_revealed", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      playSound("answer-correct");
    });
    socket.on("quiz_finished", (bundle: Bundle) => {
      setSession(bundle.session);
      setLeaderboard(bundle.leaderboard);
      playSound("winner");
      location.href = `/results/${bundle.session.id}`;
    });
    return () => {
      socket.disconnect();
    };
  }, [playSound, session.id]);

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
    setLeaderboard(bundle.leaderboard);
  }

  if (!question) {
    return <PrimaryButton onClick={() => (location.href = `/results/${session.id}`)}>Zum Ergebnis</PrimaryButton>;
  }

  if (scoreboardVisible) {
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
    <div>
      <section className="rounded-lg border border-white/10 bg-show-panel/90 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase text-show-gold">
              Frage {session.currentQuestionIndex + 1} von {initialBundle.quiz.questions.length}
            </div>
            <h1 className="mt-3 text-4xl font-black leading-tight">{question.questionText}</h1>
            <p className="mt-3 inline-flex rounded border border-white/10 bg-black/25 px-3 py-1 text-sm font-black uppercase text-white/70">
              {active ? "Antwortphase läuft" : locked ? "Antworten gesperrt" : revealed ? "Auflösung" : "Bereit"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <SoundToggleButton soundEnabled={soundEnabled} onToggle={toggleSound} />
            <TimerRing secondsLeft={active ? secondsLeft : question.timeLimitSeconds} totalSeconds={question.timeLimitSeconds} size="stage" />
          </div>
        </div>

        <QuestionMedia question={question} large />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {answerTexts &&
            (["A", "B", "C", "D"] as const).map((option) => (
              <div key={option} className={revealed && option === question.correctAnswer ? "rounded-lg ring-4 ring-show-gold" : ""}>
                <AnswerButton option={option} text={answerTexts[option]} disabled size="stage" />
              </div>
            ))}
        </div>

        {explanationVisible && <ExplanationPanel question={question} />}

        <div className="mt-6 flex flex-wrap gap-3">
          <a className="inline-flex min-h-11 items-center justify-center rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" href={`/host/${session.id}/remote`} target="_blank">
            Handy-Fernbedienung
          </a>
          {!active && !locked && !revealed && <PrimaryButton onClick={() => action("start")}>Frage starten</PrimaryButton>}
          {active && <PrimaryButton onClick={() => action("lock")}>Antworten sperren</PrimaryButton>}
          {locked && <PrimaryButton onClick={() => action("reveal")}>Antwort auflösen</PrimaryButton>}
          {revealed && !explanationVisible && <PrimaryButton onClick={() => action("explanation")}>Erklärung anzeigen</PrimaryButton>}
          {revealed && <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("leaderboard")}>Punktestand einblenden</button>}
          {revealed && <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => action("next")}>Nächste Frage starten</button>}
          <button className="rounded border border-white/20 px-5 py-3 font-bold" onClick={() => action("finish")}>
            Quiz beenden
          </button>
        </div>
      </section>
    </div>
  );
}

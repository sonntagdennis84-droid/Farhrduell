import { describe, expect, it } from "vitest";
import { buildLiveAnswerHeatmap } from "../features/sessions/store";
import { buildLeaderboard } from "../lib/scoring";
import type { Answer, GameSession, Participant, Question, Quiz } from "../types/domain";

function participant(id: string, displayName: string): Participant {
  return {
    id,
    sessionId: "session-1",
    displayName,
    totalPoints: 0,
    joinedAt: "2026-06-29T10:00:00.000Z",
    lastSeenAt: null
  };
}

function answer(participantId: string, selectedAnswer: Answer["selectedAnswer"]): Answer {
  return {
    id: `${participantId}-question-1`,
    sessionId: "session-1",
    participantId,
    questionId: "question-1",
    selectedAnswer,
    isCorrect: selectedAnswer === "B",
    responseTimeMs: 1200,
    pointsAwarded: selectedAnswer === "B" ? 750 : 0,
    submittedAt: "2026-06-29T10:00:05.000Z"
  };
}

function session(status: GameSession["status"]): GameSession {
  return {
    id: "session-1",
    quizId: "quiz-1",
    joinCode: "ABC12345",
    status,
    currentQuestionIndex: 0,
    currentQuestionStartedAt: "2026-06-29T10:00:00.000Z",
    startedAt: "2026-06-29T10:00:00.000Z",
    finishedAt: null,
    createdAt: "2026-06-29T09:59:00.000Z"
  };
}

const question: Question = {
  id: "question-1",
  quizId: "quiz-1",
  orderIndex: 0,
  questionText: "Testfrage",
  answerA: "A",
  answerB: "B",
  answerC: "C",
  answerD: "D",
  correctAnswer: "B",
  timeLimitSeconds: 20,
  createdAt: "2026-06-29T09:00:00.000Z",
  updatedAt: "2026-06-29T09:00:00.000Z"
};

const quiz: Quiz = {
  id: "quiz-1",
  title: "Demo",
  createdById: "user-1",
  createdAt: "2026-06-29T09:00:00.000Z",
  updatedAt: "2026-06-29T09:00:00.000Z",
  questions: [question]
};

describe("live answer heatmap", () => {
  it("groups answers and pending participants correctly", () => {
    const participants = [participant("p1", "Dennis"), participant("p2", "Julia"), participant("p3", "Tom")];
    const answers = [answer("p1", "A"), answer("p2", "B")];

    const heatmap = buildLiveAnswerHeatmap({
      session: session("QUESTION_ACTIVE"),
      quiz,
      participants,
      answers,
      leaderboard: buildLeaderboard(participants, answers)
    });

    expect(heatmap).not.toBeNull();
    expect(heatmap?.counts).toEqual({ A: 1, B: 1, C: 0, D: 0, pending: 1 });
    expect(heatmap?.participants.find((entry) => entry.id === "p3")?.hasAnswered).toBe(false);
    expect(heatmap?.participants.find((entry) => entry.id === "p3")?.selectedAnswer).toBeNull();
    expect(heatmap?.correctAnswer).toBeNull();
  });

  it("disambiguates duplicate participant names", () => {
    const participants = [participant("p1", "Dennis"), participant("p2", "Dennis")];
    const answers = [answer("p1", "C"), answer("p2", "D")];

    const heatmap = buildLiveAnswerHeatmap({
      session: session("ANSWER_LOCKED"),
      quiz,
      participants,
      answers,
      leaderboard: buildLeaderboard(participants, answers)
    });

    expect(heatmap?.participants.map((entry) => entry.displayName)).toEqual(["Dennis", "Dennis (2)"]);
  });

  it("reveals the correct answer only after resolution", () => {
    const participants = [participant("p1", "Dennis")];
    const answers = [answer("p1", "B")];

    const hiddenHeatmap = buildLiveAnswerHeatmap({
      session: session("QUESTION_ACTIVE"),
      quiz,
      participants,
      answers,
      leaderboard: buildLeaderboard(participants, answers)
    });
    const revealedHeatmap = buildLiveAnswerHeatmap({
      session: session("ANSWER_REVEALED"),
      quiz,
      participants,
      answers,
      leaderboard: buildLeaderboard(participants, answers)
    });

    expect(hiddenHeatmap?.correctAnswer).toBeNull();
    expect(revealedHeatmap?.correctAnswer).toBe("B");
  });
});

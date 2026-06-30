import { describe, expect, it } from "vitest";
import { calculatePoints, buildLeaderboard } from "../lib/scoring";
import { resultsToCsv } from "../lib/csv";
import type { Answer, Participant } from "../types/domain";

const participant = (id: string, displayName: string): Participant => ({
  id,
  sessionId: "session",
  displayName,
  totalPoints: 0,
  joinedAt: new Date().toISOString(),
  lastSeenAt: null
});

const answer = (participantId: string, questionId: string, pointsAwarded: number, isCorrect = true, responseTimeMs = 1000): Answer => ({
  id: `${participantId}-${questionId}`,
  sessionId: "session",
  participantId,
  questionId,
  selectedAnswer: "A",
  isCorrect,
  responseTimeMs,
  pointsAwarded,
  submittedAt: new Date().toISOString()
});

describe("scoring", () => {
  it("gives wrong answers 0 points", () => {
    expect(calculatePoints(false, 15000, 20000)).toBe(0);
  });

  it("gives fast correct answers more points than slow correct answers", () => {
    expect(calculatePoints(true, 19000, 20000)).toBeGreaterThan(calculatePoints(true, 2000, 20000));
  });

  it("matches the specified sample formula", () => {
    expect(calculatePoints(true, 15000, 20000)).toBe(875);
  });

  it("sorts leaderboard by points", () => {
    const rows = buildLeaderboard([participant("a", "Ada"), participant("b", "Ben")], [answer("a", "q1", 500), answer("b", "q1", 900)]);
    expect(rows[0].displayName).toBe("Ben");
    expect(rows[0].rank).toBe(1);
  });

  it("keeps true ties on the same rank", () => {
    const rows = buildLeaderboard([participant("a", "Ada"), participant("b", "Ben")], [answer("a", "q1", 900, true, 1000), answer("b", "q1", 900, true, 1000)]);
    expect(rows[0].rank).toBe(1);
    expect(rows[1].rank).toBe(1);
  });

  it("prepares CSV export columns", () => {
    const rows = buildLeaderboard([participant("a", "Ada")], [answer("a", "q1", 875)]);
    expect(resultsToCsv(rows).split("\n")[0]).toContain("Richtige Antworten");
  });
});

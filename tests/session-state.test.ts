import { describe, expect, it } from "vitest";
import { canSubmitAnswer, isAnswerLocked, isAnswerRevealed, isExplanationVisible, isLeaderboardVisible } from "../lib/session-state";

describe("showmaster session states", () => {
  it("accepts answers only while the question is active", () => {
    expect(canSubmitAnswer("QUESTION_ACTIVE")).toBe(true);
    expect(canSubmitAnswer("ANSWER_LOCKED")).toBe(false);
    expect(canSubmitAnswer("ANSWER_REVEALED")).toBe(false);
    expect(canSubmitAnswer("EXPLANATION_VISIBLE")).toBe(false);
    expect(canSubmitAnswer("LEADERBOARD_VISIBLE")).toBe(false);
  });

  it("treats locked and revealed phases as closed answer phases", () => {
    expect(isAnswerLocked("ANSWER_LOCKED")).toBe(true);
    expect(isAnswerLocked("ANSWER_REVEALED")).toBe(true);
    expect(isAnswerLocked("EXPLANATION_VISIBLE")).toBe(true);
    expect(isAnswerLocked("LEADERBOARD_VISIBLE")).toBe(true);
    expect(isAnswerLocked("QUESTION_ACTIVE")).toBe(false);
  });

  it("reveals answers before explanations and leaderboard", () => {
    expect(isAnswerRevealed("ANSWER_REVEALED")).toBe(true);
    expect(isExplanationVisible("ANSWER_REVEALED")).toBe(false);
    expect(isExplanationVisible("EXPLANATION_VISIBLE")).toBe(true);
    expect(isLeaderboardVisible("LEADERBOARD_VISIBLE")).toBe(true);
  });
});

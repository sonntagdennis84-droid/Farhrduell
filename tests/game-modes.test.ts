import { describe, expect, it } from "vitest";
import { activeModeParticipants, nextEliminationState, normalizeGameMode } from "../lib/game-modes";

describe("game modes", () => {
  it("normalizes unknown modes to classic", () => {
    expect(normalizeGameMode("unknown")).toBe("classic");
    expect(normalizeGameMode("knockout")).toBe("knockout");
  });

  it("eliminates wrong knockout answers immediately", () => {
    expect(nextEliminationState({ mode: "knockout", livesRemaining: 0, isCorrect: false, questionIndex: 2 })).toEqual({
      livesRemaining: 0,
      isEliminated: true,
      eliminatedAtQuestionIndex: 2
    });
  });

  it("removes one survival life per wrong or missing answer", () => {
    expect(nextEliminationState({ mode: "survival", livesRemaining: 3, isCorrect: false, questionIndex: 1 })).toMatchObject({
      livesRemaining: 2,
      isEliminated: false
    });
    expect(nextEliminationState({ mode: "survival", livesRemaining: 1, isCorrect: false, questionIndex: 4 })).toEqual({
      livesRemaining: 0,
      isEliminated: true,
      eliminatedAtQuestionIndex: 4
    });
  });

  it("only checks active participants in elimination modes", () => {
    const participants = [{ isEliminated: false }, { isEliminated: true }, { isEliminated: false }];
    expect(activeModeParticipants(participants, "knockout")).toHaveLength(2);
    expect(activeModeParticipants(participants, "classic")).toHaveLength(3);
  });
});

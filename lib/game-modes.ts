import type { GameMode } from "@/types/domain";

export const survivalStartingLives = 3;

export function normalizeGameMode(mode: unknown): GameMode {
  if (mode === "team_battle" || mode === "knockout" || mode === "survival") return mode;
  return "classic";
}

export function isEliminationGameMode(mode: unknown) {
  return mode === "knockout" || mode === "survival";
}

export function gameModeLabel(mode: unknown) {
  switch (normalizeGameMode(mode)) {
    case "team_battle":
      return "Team Battle";
    case "knockout":
      return "K.O.-Modus";
    case "survival":
      return "Überleben";
    default:
      return "Classic";
  }
}

export function activeModeParticipants<T extends { isEliminated?: boolean | null }>(participants: T[], mode: unknown): T[] {
  return isEliminationGameMode(mode) ? participants.filter((participant) => !participant.isEliminated) : participants;
}

export function nextEliminationState(input: {
  mode: unknown;
  livesRemaining?: number | null;
  isEliminated?: boolean | null;
  isCorrect: boolean;
  questionIndex: number;
}) {
  if (input.isEliminated || input.isCorrect || !isEliminationGameMode(input.mode)) {
    return {
      livesRemaining: Number(input.livesRemaining ?? 0),
      isEliminated: Boolean(input.isEliminated),
      eliminatedAtQuestionIndex: null as number | null
    };
  }

  if (input.mode === "knockout") {
    return {
      livesRemaining: Number(input.livesRemaining ?? 0),
      isEliminated: true,
      eliminatedAtQuestionIndex: input.questionIndex
    };
  }

  const nextLives = Math.max(Number(input.livesRemaining ?? survivalStartingLives) - 1, 0);
  return {
    livesRemaining: nextLives,
    isEliminated: nextLives <= 0,
    eliminatedAtQuestionIndex: nextLives <= 0 ? input.questionIndex : null
  };
}

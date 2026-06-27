import type { SessionStatus } from "@/types/domain";

export const revealStatuses: SessionStatus[] = ["ANSWER_REVEALED", "EXPLANATION_VISIBLE", "LEADERBOARD_VISIBLE", "QUESTION_FINISHED"];

export function canSubmitAnswer(status: SessionStatus) {
  return status === "QUESTION_ACTIVE";
}

export function isAnswerLocked(status: SessionStatus) {
  return status === "ANSWER_LOCKED" || revealStatuses.includes(status);
}

export function isAnswerRevealed(status: SessionStatus) {
  return revealStatuses.includes(status);
}

export function isExplanationVisible(status: SessionStatus) {
  return status === "EXPLANATION_VISIBLE";
}

export function isLeaderboardVisible(status: SessionStatus) {
  return status === "LEADERBOARD_VISIBLE";
}

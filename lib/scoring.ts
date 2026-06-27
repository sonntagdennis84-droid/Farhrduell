import type { Answer, LeaderboardRow, Participant } from "@/types/domain";

export function calculatePoints(isCorrect: boolean, remainingTimeMs: number, totalTimeMs: number) {
  if (!isCorrect) return 0;
  const safeTotal = Math.max(totalTimeMs, 1);
  const safeRemaining = Math.min(Math.max(remainingTimeMs, 0), safeTotal);
  return Math.round(500 + 500 * (safeRemaining / safeTotal));
}

export function buildLeaderboard(participants: Participant[], answers: Answer[]): LeaderboardRow[] {
  return participants
    .map((participant) => {
      const ownAnswers = answers.filter((answer) => answer.participantId === participant.id);
      const correctAnswers = ownAnswers.filter((answer) => answer.isCorrect).length;
      const averageResponseTimeMs = ownAnswers.length
        ? Math.round(ownAnswers.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / ownAnswers.length)
        : 0;

      return {
        ...participant,
        totalPoints: ownAnswers.reduce((sum, answer) => sum + answer.pointsAwarded, 0),
        rank: 0,
        correctAnswers,
        averageResponseTimeMs
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints || a.averageResponseTimeMs - b.averageResponseTimeMs)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

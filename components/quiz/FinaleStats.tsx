import type { Answer, LeaderboardRow, Question } from "@/types/domain";

const icons = {
  trophy: "\uD83C\uDFC6",
  flash: "\u26A1",
  target: "\uD83C\uDFAF",
  fire: "\uD83D\uDD25",
  clock: "\u23F1"
};

function formatMs(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "-";
  return `${(ms / 1000).toFixed(1)} s`;
}

function longestCorrectStreak(row: LeaderboardRow, answers: Answer[], questions: Question[]) {
  const answerByQuestion = new Map(answers.filter((answer) => answer.participantId === row.id).map((answer) => [answer.questionId, answer]));
  let current = 0;
  let best = 0;
  for (const question of questions) {
    const answer = answerByQuestion.get(question.id);
    if (answer?.isCorrect) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export function FinaleStats({ rows, answers, questions }: { rows: LeaderboardRow[]; answers: Answer[]; questions: Question[] }) {
  const highest = rows[0] ?? null;
  const fastestCorrect = answers.filter((answer) => answer.isCorrect).sort((a, b) => a.responseTimeMs - b.responseTimeMs)[0] ?? null;
  const fastestPlayer = fastestCorrect ? rows.find((row) => row.id === fastestCorrect.participantId) : null;
  const bestAccuracy = [...rows]
    .map((row) => {
      const accuracy = questions.length ? row.correctAnswers / questions.length : 0;
      return { row, accuracy };
    })
    .sort((a, b) => b.accuracy - a.accuracy || b.row.totalPoints - a.row.totalPoints)[0];
  const streakWinner = [...rows]
    .map((row) => ({ row, streak: longestCorrectStreak(row, answers, questions) }))
    .sort((a, b) => b.streak - a.streak || b.row.totalPoints - a.row.totalPoints)[0];
  const averageMs = answers.length ? Math.round(answers.reduce((sum, answer) => sum + answer.responseTimeMs, 0) / answers.length) : 0;

  const cards = [
    { icon: icons.trophy, label: "H\u00f6chste Punktzahl", value: highest ? `${highest.totalPoints.toLocaleString("de-DE")} Punkte` : "-", sub: highest?.displayName ?? "" },
    { icon: icons.flash, label: "Schnellste richtige Antwort", value: fastestCorrect ? formatMs(fastestCorrect.responseTimeMs) : "-", sub: fastestPlayer?.displayName ?? "" },
    { icon: icons.target, label: "Beste Trefferquote", value: bestAccuracy ? `${Math.round(bestAccuracy.accuracy * 100)} %` : "-", sub: bestAccuracy?.row.displayName ?? "" },
    { icon: icons.fire, label: "L\u00e4ngste richtige Serie", value: streakWinner ? `${streakWinner.streak} in Folge` : "-", sub: streakWinner?.row.displayName ?? "" },
    { icon: icons.clock, label: "Durchschnittliche Antwortzeit", value: formatMs(averageMs), sub: "Alle Antworten" }
  ];

  return (
    <section className="finale-list-enter mt-6 grid gap-3 md:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-white/10 bg-show-panel/90 p-4 shadow-lg">
          <div className="text-3xl">{card.icon}</div>
          <p className="mt-3 text-xs font-black uppercase text-white/45">{card.label}</p>
          <p className="mt-1 text-2xl font-black text-show-gold">{card.value}</p>
          {card.sub && <p className="mt-1 truncate text-sm font-bold text-white/65">{card.sub}</p>}
        </div>
      ))}
    </section>
  );
}

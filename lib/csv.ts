import type { LeaderboardRow } from "@/types/domain";

const columns = ["Platz", "Emoji", "Name", "Punkte", "Richtige Antworten", "Durchschnittszeit (ms)"];

function cell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function resultsToCsv(rows: LeaderboardRow[]) {
  const body = rows.map((row) =>
    [row.rank, row.emoji ?? "🚗", row.displayName, row.totalPoints, row.correctAnswers, row.averageResponseTimeMs].map(cell).join(",")
  );
  return [columns.map(cell).join(","), ...body].join("\n");
}

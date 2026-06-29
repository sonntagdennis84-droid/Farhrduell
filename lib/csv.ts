import type { LeaderboardRow } from "@/types/domain";
import { defaultAvatarId, normalizeAvatarId } from "@/lib/participant-avatars";
import { defaultParticipantEmoji } from "@/lib/participant-emojis";

const columns = ["Platz", "Avatar-ID", "Emoji", "Name", "Punkte", "Richtige Antworten", "Durchschnittszeit (ms)"];

function cell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function resultsToCsv(rows: LeaderboardRow[]) {
  const body = rows.map((row) =>
    [row.rank, normalizeAvatarId(row.avatarId ?? defaultAvatarId), row.emoji ?? defaultParticipantEmoji, row.displayName, row.totalPoints, row.correctAnswers, row.averageResponseTimeMs].map(cell).join(",")
  );
  return [columns.map(cell).join(","), ...body].join("\n");
}

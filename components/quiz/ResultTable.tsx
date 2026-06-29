import type { LeaderboardRow } from "@/types/domain";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";

export function ResultTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[720px] border-collapse bg-show-panel">
        <thead className="bg-white/10 text-left text-sm uppercase text-white/70">
          <tr>
            <th className="p-3">Platz</th>
            <th className="p-3">Avatar</th>
            <th className="p-3">Name</th>
            <th className="p-3">Punkte</th>
            <th className="p-3">Richtig</th>
            <th className="p-3">Ø Zeit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10 transition duration-300 animate-in fade-in">
              <td className="p-3 font-black">{row.rank}</td>
              <td className="p-3">
                <ParticipantAvatar avatarId={row.avatarId} emoji={row.emoji} label={row.displayName} size="sm" />
              </td>
              <td className="p-3 font-semibold">{row.displayName}</td>
              <td className="p-3 text-show-gold">{row.totalPoints}</td>
              <td className="p-3">{row.correctAnswers}</td>
              <td className="p-3">{(row.averageResponseTimeMs / 1000).toFixed(1)} s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

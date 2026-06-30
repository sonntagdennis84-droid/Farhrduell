import type { LeaderboardRow } from "@/types/domain";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";

export function Leaderboard({ rows, limit = 10 }: { rows: LeaderboardRow[]; limit?: number }) {
  return (
    <div className="space-y-2">
      {rows.slice(0, limit).map((row) => (
        <div key={row.id} className="grid grid-cols-[3rem_3rem_1fr_auto] items-center rounded border border-white/10 bg-white/5 px-3 py-2 transition duration-300 animate-in fade-in">
          <span className={row.rank === 1 ? "font-black text-show-gold" : "font-bold text-white/70"}>{row.rank === 1 ? "👑" : `#${row.rank}`}</span>
          <ParticipantAvatar avatarId={row.avatarId} emoji={row.emoji} label={row.displayName} size="sm" />
          <span className="min-w-0 font-bold">
            {row.displayName}
            {row.isEliminated && <span className="ml-2 text-xs font-black uppercase text-show-red">K.O.</span>}
            {Number(row.livesRemaining ?? 0) > 0 && <span className="ml-2 text-xs font-black text-show-gold">♥ {row.livesRemaining}</span>}
          </span>
          <span className="font-black text-show-gold">{row.totalPoints}</span>
        </div>
      ))}
    </div>
  );
}

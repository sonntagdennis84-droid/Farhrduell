import type { LeaderboardRow } from "@/types/domain";

export function Leaderboard({ rows, limit = 10 }: { rows: LeaderboardRow[]; limit?: number }) {
  return (
    <div className="space-y-2">
      {rows.slice(0, limit).map((row) => (
        <div key={row.id} className="grid grid-cols-[3rem_1fr_auto] items-center rounded border border-white/10 bg-white/5 px-3 py-2">
          <span className={row.rank === 1 ? "font-black text-show-gold" : "font-bold text-white/70"}>#{row.rank}</span>
          <span className="font-bold">{row.displayName}</span>
          <span className="font-black text-show-gold">{row.totalPoints}</span>
        </div>
      ))}
    </div>
  );
}

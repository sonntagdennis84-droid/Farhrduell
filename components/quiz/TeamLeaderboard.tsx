import type { TeamLeaderboardRow } from "@/types/domain";

export function TeamLeaderboard({ rows, limit = 10 }: { rows: TeamLeaderboardRow[]; limit?: number }) {
  return (
    <div className="space-y-2">
      {rows.slice(0, limit).map((row) => (
        <div key={row.id} className="grid grid-cols-[3rem_1fr_auto] items-center rounded border border-white/10 bg-white/5 px-3 py-2 transition duration-300 animate-in fade-in">
          <span className={row.rank === 1 ? "font-black text-show-gold" : "font-bold text-white/70"}>{row.rank === 1 ? "👑" : `#${row.rank}`}</span>
          <span className="inline-flex items-center gap-2 font-bold">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color ?? "#FACC15" }} />
            {row.name}
            <span className="text-xs text-white/45">({row.participantCount})</span>
          </span>
          <span className="font-black text-show-gold">{row.totalPoints}</span>
        </div>
      ))}
    </div>
  );
}

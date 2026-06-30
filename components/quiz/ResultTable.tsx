import type { LeaderboardRow } from "@/types/domain";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function ResultTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <section className="finale-list-enter rounded-lg border border-white/10 bg-show-panel/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-show-gold">Vollständige Rangliste</p>
          <h2 className="mt-1 text-2xl font-black text-white">Alle Teilnehmer</h2>
        </div>
        <span className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-white/65">{rows.length} Spieler</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <article key={row.id} className={row.rank <= 3 ? "rounded-lg border border-show-gold/35 bg-show-gold/10 p-3 shadow-glow" : "rounded-lg border border-white/10 bg-white/5 p-3"}>
            <div className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-3">
              <div className="text-center text-2xl font-black text-show-gold">{medal(row.rank)}</div>
              <div className="flex min-w-0 items-center gap-3">
                <ParticipantAvatar avatarId={row.avatarId} emoji={row.emoji} label={row.displayName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-black text-white">{row.displayName}</p>
                  {row.team && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-white/55">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.team.color ?? "#FACC15" }} />
                      {row.team.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-show-gold">{row.totalPoints}</p>
                <p className="text-xs font-bold text-white/45">{row.correctAnswers} richtig</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

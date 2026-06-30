import type { LeaderboardRow, TeamLeaderboardRow } from "@/types/domain";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";

const crown = "\uD83D\uDC51";

export function TeamFinaleSpotlight({ teams, topPlayer }: { teams: TeamLeaderboardRow[]; topPlayer?: LeaderboardRow | null }) {
  const winner = teams.find((team) => team.rank === 1) ?? teams[0];
  if (!winner) return null;

  return (
    <section className="relative overflow-hidden rounded-lg border border-show-gold/40 bg-show-panel/95 p-5 shadow-glow">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.22),transparent_28rem)]" />
      <div className="relative grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-show-gold">Team Battle Finale</p>
          <h2 className="mt-2 text-4xl font-black text-white">Gewinnerteam: {winner.name}</h2>
          <p className="mt-2 text-white/65">{winner.participantCount} Teilnehmer haben zusammen {winner.totalPoints.toLocaleString("de-DE")} Punkte erspielt.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {teams.slice(0, 4).map((team) => (
              <div key={team.id} className={team.rank === 1 ? "rounded-lg border border-show-gold bg-show-gold/15 px-4 py-3 shadow-glow" : "rounded-lg border border-white/10 bg-white/5 px-4 py-3"}>
                <p className="text-sm font-black text-white/55">{team.rank === 1 ? crown : `#${team.rank}`}</p>
                <p className="mt-1 inline-flex items-center gap-2 font-black">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color ?? "#FACC15" }} />
                  {team.name}
                </p>
                <p className="text-sm font-bold text-show-gold">{team.totalPoints} Punkte</p>
              </div>
            ))}
          </div>
        </div>
        {topPlayer && (
          <div className="rounded-lg border border-white/10 bg-black/25 p-5 text-center">
            <p className="text-xs font-black uppercase text-white/45">Bester Einzelspieler</p>
            <div className="mt-4 flex justify-center">
              <ParticipantAvatar avatarId={topPlayer.avatarId} emoji={topPlayer.emoji} label={topPlayer.displayName} size="xl" priority />
            </div>
            <h3 className="mt-3 text-3xl font-black text-white">{topPlayer.displayName}</h3>
            <p className="mt-1 text-2xl font-black text-show-gold">{topPlayer.totalPoints} Punkte</p>
          </div>
        )}
      </div>
    </section>
  );
}

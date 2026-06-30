import type { Participant } from "@/types/domain";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";

export function ParticipantList({ participants }: { participants: Participant[] }) {
  return (
    <div className="space-y-2">
      {participants.length === 0 ? (
        <p className="text-white/60">Noch keine Teilnehmer.</p>
      ) : (
        participants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-3 rounded border border-white/10 bg-white/5 px-3 py-2 font-semibold transition duration-300 animate-in fade-in">
            <ParticipantAvatar avatarId={participant.avatarId} emoji={participant.emoji} label={participant.displayName} />
            <span className="min-w-0 flex-1">{participant.displayName}</span>
            {participant.team && (
              <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-black/20 px-2 py-1 text-xs font-black text-white/70">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: participant.team.color ?? "#FACC15" }} />
                {participant.team.name}
              </span>
            )}
            {participant.isEliminated && <span className="rounded border border-show-red/40 bg-show-red/10 px-2 py-1 text-xs font-black text-show-red">K.O.</span>}
            {Number(participant.livesRemaining ?? 0) > 0 && <span className="rounded border border-show-gold/40 bg-show-gold/10 px-2 py-1 text-xs font-black text-show-gold">♥ {participant.livesRemaining}</span>}
          </div>
        ))
      )}
    </div>
  );
}

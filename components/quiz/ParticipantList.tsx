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
            <span>{participant.displayName}</span>
          </div>
        ))
      )}
    </div>
  );
}

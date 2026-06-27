import type { Participant } from "@/types/domain";

export function ParticipantList({ participants }: { participants: Participant[] }) {
  return (
    <div className="space-y-2">
      {participants.length === 0 ? (
        <p className="text-white/60">Noch keine Teilnehmer.</p>
      ) : (
        participants.map((participant) => (
          <div key={participant.id} className="rounded border border-white/10 bg-white/5 px-3 py-2 font-semibold">
            {participant.displayName}
          </div>
        ))
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { PlayClient } from "./PlayClient";
import { getParticipant, getQuiz, getSession } from "@/features/sessions/store";

export default async function PlayPage({ params }: { params: Promise<{ participantId: string }> }) {
  const { participantId } = await params;
  const participant = await getParticipant(participantId);
  if (!participant) notFound();
  const session = await getSession(participant.sessionId);
  if (!session) notFound();
  const quiz = await getQuiz(session.quizId);
  if (!quiz) notFound();
  return <PlayClient participant={participant} session={session} quiz={quiz} />;
}

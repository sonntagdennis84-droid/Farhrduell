import { NextResponse } from "next/server";
import { createSession, getQuiz } from "@/features/sessions/store";

export async function POST(request: Request) {
  const body = await request.json();
  const quizId = String(body.quizId ?? "");
  const quiz = await getQuiz(quizId);
  if (!quiz) return NextResponse.json({ error: "Quiz nicht gefunden" }, { status: 404 });
  if (quiz.isArchived) return NextResponse.json({ error: "Archivierte Quizze können nicht gestartet werden." }, { status: 409 });
  const session = await createSession(quizId);
  if (!session) return NextResponse.json({ error: "Live-Session konnte nicht gestartet werden." }, { status: 409 });
  return NextResponse.json(session, { status: 201 });
}

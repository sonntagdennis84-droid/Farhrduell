import { NextResponse } from "next/server";
import { createSession, getQuiz } from "@/features/sessions/store";

export async function POST(request: Request) {
  const body = await request.json();
  const quizId = String(body.quizId ?? "");
  if (!(await getQuiz(quizId))) return NextResponse.json({ error: "Quiz nicht gefunden" }, { status: 404 });
  return NextResponse.json(await createSession(quizId), { status: 201 });
}

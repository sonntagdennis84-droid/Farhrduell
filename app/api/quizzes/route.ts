import { NextResponse } from "next/server";
import { listQuizzes, upsertQuiz } from "@/features/sessions/store";

export async function GET() {
  return NextResponse.json(await listQuizzes());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quiz = await upsertQuiz(body);
    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Quiz save failed", error);
    return NextResponse.json({ error: "Quiz konnte nicht gespeichert werden. Bitte Medien erneut hochladen und noch einmal speichern." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { listQuizzes, upsertQuiz } from "@/features/sessions/store";

export async function GET() {
  return NextResponse.json(await listQuizzes());
}

export async function POST(request: Request) {
  const body = await request.json();
  const quiz = await upsertQuiz(body);
  return NextResponse.json(quiz, { status: 201 });
}

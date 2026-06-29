import { NextResponse } from "next/server";
import { duplicateQuiz } from "@/features/sessions/store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await duplicateQuiz(id);
  if (!quiz) return NextResponse.json({ error: "Quiz nicht gefunden" }, { status: 404 });
  return NextResponse.json(quiz, { status: 201 });
}

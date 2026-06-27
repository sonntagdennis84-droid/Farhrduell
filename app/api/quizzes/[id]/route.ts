import { NextResponse } from "next/server";
import { deleteQuiz, getQuiz, upsertQuiz } from "@/features/sessions/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) return NextResponse.json({ error: "Quiz nicht gefunden" }, { status: 404 });
  return NextResponse.json(quiz);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const existing = await getQuiz(id);
  if (!existing) return NextResponse.json({ error: "Quiz nicht gefunden" }, { status: 404 });
  return NextResponse.json(await upsertQuiz({ ...body, id, createdAt: existing.createdAt }));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteQuiz(id);
  return NextResponse.json({ ok: true });
}

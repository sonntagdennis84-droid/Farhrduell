import { NextResponse } from "next/server";
import { setQuizArchived } from "@/features/sessions/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const quiz = await setQuizArchived(id, body.isArchived !== false);
  return NextResponse.json(quiz);
}

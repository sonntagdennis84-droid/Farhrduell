import { NextResponse } from "next/server";
import { getIo, sessionRoom } from "@/lib/socket";
import { submitAnswer } from "@/features/sessions/store";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await submitAnswer(String(body.participantId ?? ""), body.selectedAnswer);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 });
  if (result.bundle) {
    getIo()?.to(sessionRoom(result.bundle.session.id)).emit("answer_submitted", result.answer);
    getIo()?.to(sessionRoom(result.bundle.session.id)).emit("leaderboard_updated", result.bundle.leaderboard);
  }
  return NextResponse.json(result.answer, { status: 201 });
}

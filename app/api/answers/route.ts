import { NextResponse } from "next/server";
import { buildLiveAnswerHeatmap, submitAnswer } from "@/features/sessions/store";
import { getIo, moderatorRoom, sessionRoom } from "@/lib/socket";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await submitAnswer(String(body.participantId ?? ""), body.selectedAnswer);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 409 });
  if (result.bundle) {
    getIo()?.to(sessionRoom(result.bundle.session.id)).emit("answer_submitted", result.answer);
    getIo()?.to(sessionRoom(result.bundle.session.id)).emit("leaderboard_updated", result.bundle.leaderboard);
    const heatmap = buildLiveAnswerHeatmap(result.bundle);
    if (heatmap) getIo()?.to(moderatorRoom(result.bundle.session.id)).emit("heatmap_updated", heatmap);
  }
  return NextResponse.json(result.answer, { status: 201 });
}

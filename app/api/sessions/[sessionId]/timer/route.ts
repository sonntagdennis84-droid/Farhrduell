import { NextResponse } from "next/server";
import { buildLiveAnswerHeatmap, startQuestionTimer } from "@/features/sessions/store";
import { getIo, moderatorRoom, sessionRoom } from "@/lib/socket";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await startQuestionTimer(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(sessionId)).emit("question_started", bundle);
  getIo()?.to(sessionRoom(sessionId)).emit("session_updated", bundle);
  const heatmap = buildLiveAnswerHeatmap(bundle);
  if (heatmap) getIo()?.to(moderatorRoom(sessionId)).emit("heatmap_updated", heatmap);
  return NextResponse.json(bundle);
}

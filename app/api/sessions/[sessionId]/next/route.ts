import { NextResponse } from "next/server";
import { buildLiveAnswerHeatmap, nextQuestion } from "@/features/sessions/store";
import { getIo, moderatorRoom, sessionRoom } from "@/lib/socket";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const advanced = await nextQuestion(sessionId);
  if (!advanced) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  if (advanced.session.status === "FINISHED") {
    getIo()?.to(sessionRoom(sessionId)).emit("quiz_finished", advanced);
    return NextResponse.json(advanced);
  }
  getIo()?.to(sessionRoom(sessionId)).emit("session_updated", advanced);
  const heatmap = buildLiveAnswerHeatmap(advanced);
  if (heatmap) getIo()?.to(moderatorRoom(sessionId)).emit("heatmap_updated", heatmap);
  return NextResponse.json(advanced);
}

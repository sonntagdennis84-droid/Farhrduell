import { NextResponse } from "next/server";
import { getIo, sessionRoom } from "@/lib/socket";
import { revealQuestion } from "@/features/sessions/store";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await revealQuestion(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(sessionId)).emit("question_revealed", bundle);
  getIo()?.to(sessionRoom(sessionId)).emit("leaderboard_updated", bundle.leaderboard);
  return NextResponse.json(bundle);
}

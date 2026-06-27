import { NextResponse } from "next/server";
import { getIo, sessionRoom } from "@/lib/socket";
import { startQuestion } from "@/features/sessions/store";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await startQuestion(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(sessionId)).emit("session_started", bundle);
  getIo()?.to(sessionRoom(sessionId)).emit("question_started", bundle);
  return NextResponse.json(bundle);
}

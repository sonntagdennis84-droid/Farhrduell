import { NextResponse } from "next/server";
import { getIo, sessionRoom } from "@/lib/socket";
import { nextQuestion, startQuestion } from "@/features/sessions/store";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const advanced = await nextQuestion(sessionId);
  if (!advanced) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  if (advanced.session.status === "FINISHED") {
    getIo()?.to(sessionRoom(sessionId)).emit("quiz_finished", advanced);
    return NextResponse.json(advanced);
  }
  const bundle = await startQuestion(sessionId);
  getIo()?.to(sessionRoom(sessionId)).emit("question_started", bundle);
  return NextResponse.json(bundle);
}

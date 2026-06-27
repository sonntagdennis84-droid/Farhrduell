import { NextResponse } from "next/server";
import { getIo, sessionRoom } from "@/lib/socket";
import { finishSession } from "@/features/sessions/store";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await finishSession(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(sessionId)).emit("quiz_finished", bundle);
  return NextResponse.json(bundle);
}

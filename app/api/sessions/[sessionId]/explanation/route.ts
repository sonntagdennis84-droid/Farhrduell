import { NextResponse } from "next/server";
import { showExplanation } from "@/features/sessions/store";
import { getIo, sessionRoom } from "@/lib/socket";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await showExplanation(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(sessionId)).emit("session_updated", bundle);
  return NextResponse.json(bundle);
}

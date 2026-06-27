import { NextResponse } from "next/server";
import { showLeaderboard } from "@/features/sessions/store";
import { getIo, sessionRoom } from "@/lib/socket";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await showLeaderboard(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(sessionId)).emit("session_updated", bundle);
  getIo()?.to(sessionRoom(sessionId)).emit("leaderboard_updated", bundle.leaderboard);
  return NextResponse.json(bundle);
}

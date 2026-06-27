import { NextResponse } from "next/server";
import { getSessionBundle } from "@/features/sessions/store";

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  return NextResponse.json(bundle.leaderboard);
}

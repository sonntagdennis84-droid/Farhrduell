import { NextResponse } from "next/server";
import { getActiveSessionForCurrentUser } from "@/features/sessions/store";

export async function GET() {
  const active = await getActiveSessionForCurrentUser();
  if (!active) return NextResponse.json({ hasActiveSession: false });

  return NextResponse.json({
    hasActiveSession: true,
    sessionId: active.session.id,
    quizTitle: active.quizTitle,
    remoteUrl: `/host/${active.session.id}/remote?app=1`
  });
}

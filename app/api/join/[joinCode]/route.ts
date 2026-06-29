import { NextResponse } from "next/server";
import { getIo, sessionRoom } from "@/lib/socket";
import { joinSession } from "@/features/sessions/store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { defaultParticipantEmoji, isAllowedParticipantEmoji } from "@/lib/participant-emojis";

export async function POST(request: Request, { params }: { params: Promise<{ joinCode: string }> }) {
  const rate = checkRateLimit(`join:${getClientIp(request)}`, 30, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: "Zu viele Beitrittsversuche. Bitte kurz warten." }, { status: 429 });
  }

  const { joinCode } = await params;
  const body = await request.json();
  const displayName = String(body.displayName ?? "").trim();
  const emoji = String(body.emoji ?? defaultParticipantEmoji).trim();
  if (displayName.length < 2) return NextResponse.json({ error: "Name zu kurz" }, { status: 400 });
  if (!isAllowedParticipantEmoji(emoji)) return NextResponse.json({ error: "Bitte ein Emoji aus der Auswahl waehlen." }, { status: 400 });
  const result = await joinSession(joinCode, displayName, emoji);
  if (!result) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });
  getIo()?.to(sessionRoom(result.session.id)).emit("participant_joined", result.participant);
  return NextResponse.json(result, { status: 201 });
}

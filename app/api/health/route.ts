import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fahrduell",
    timestamp: new Date().toISOString()
  });
}

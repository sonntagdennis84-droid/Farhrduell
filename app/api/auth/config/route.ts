import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const appMode = url.searchParams.get("app") === "1";

  return NextResponse.json({
    demoLoginEnabled: false,
    appMode,
    suggestedEmail: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL ?? ""
  });
}

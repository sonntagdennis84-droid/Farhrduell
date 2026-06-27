import { NextResponse } from "next/server";
import { isDemoLoginAllowed } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    demoLoginEnabled: isDemoLoginAllowed()
  });
}

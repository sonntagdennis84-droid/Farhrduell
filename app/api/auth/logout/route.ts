import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(AUTH_COOKIE);
  return response;
}

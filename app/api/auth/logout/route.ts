import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/session";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

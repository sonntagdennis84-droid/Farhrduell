import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/features/auth/session";

function loginUrl(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (forwardedProto && forwardedHost) {
    return new URL(`/login`, `${forwardedProto}://${forwardedHost}`);
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL("/login", process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.APP_URL) {
    return new URL("/login", process.env.APP_URL);
  }
  return new URL("/login", request.url);
}

export async function GET(request: Request) {
  return NextResponse.redirect(loginUrl(request));
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(loginUrl(request));
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth-token";

const AUTH_COOKIE = "fahrduell_user";

const protectedPagePrefixes = ["/dashboard", "/quizzes", "/sessions", "/host", "/profile"];
const protectedApiPrefixes = ["/api/quizzes", "/api/sessions", "/api/uploads", "/api/categories", "/api/profile", "/api/moderators", "/api/me"];

function isProtected(pathname: string) {
  return (
    protectedPagePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    protectedApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  const userId = await verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
  if (userId) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Login erforderlich" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/quizzes/:path*", "/sessions/:path*", "/host/:path*", "/profile/:path*", "/api/quizzes/:path*", "/api/sessions/:path*", "/api/uploads/:path*", "/api/categories/:path*", "/api/profile/:path*", "/api/moderators/:path*", "/api/me/:path*"]
};

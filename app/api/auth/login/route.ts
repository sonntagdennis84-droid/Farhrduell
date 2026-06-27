import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE } from "@/features/auth/session";
import { createAuthToken } from "@/lib/auth-token";
import { isDemoLoginAllowed, isProduction } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rate = checkRateLimit(`login:${getClientIp(request)}`, 10, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: "Zu viele Login-Versuche. Bitte kurz warten." }, { status: 429 });
  }

  const body = await request.json();
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  const demoEmail = process.env.DEMO_EMAIL ?? "demo@fahrduell.local";
  const demoPassword = process.env.DEMO_PASSWORD ?? "fahrduell";

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const response = NextResponse.json({ id: user.id, name: user.name, role: user.role });
      response.cookies.set(AUTH_COOKIE, await createAuthToken(user.id), {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction(),
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
      return response;
    }
  } catch {
    if (isProduction()) {
      return NextResponse.json({ error: "Login aktuell nicht verfügbar. Bitte Datenbank und Admin-Seed prüfen." }, { status: 503 });
    }
  }

  if (isDemoLoginAllowed() && email === demoEmail && password === demoPassword) {
    const response = NextResponse.json({ id: "demo-instructor", name: "Fahrduell Demo", role: "INSTRUCTOR" });
    response.cookies.set(AUTH_COOKIE, await createAuthToken("demo-instructor"), {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction(),
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  }

  return NextResponse.json({ error: "E-Mail oder Passwort ist nicht korrekt." }, { status: 401 });
}

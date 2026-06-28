import { NextResponse } from "next/server";
import { createModerator, listModerators } from "@/features/auth/users";

export async function GET() {
  try {
    return NextResponse.json(await listModerators());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Moderatoren konnten nicht geladen werden.";
    return NextResponse.json({ error: message }, { status: message === "Login erforderlich" ? 401 : 403 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const moderator = await createModerator({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      profileImageUrl: typeof body.profileImageUrl === "string" ? body.profileImageUrl : null,
      role: body.role === "ADMIN" ? "ADMIN" : "INSTRUCTOR"
    });
    return NextResponse.json(moderator, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Moderator konnte nicht erstellt werden.";
    return NextResponse.json({ error: message }, { status: message === "Login erforderlich" ? 401 : 400 });
  }
}

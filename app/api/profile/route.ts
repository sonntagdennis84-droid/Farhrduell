import { NextResponse } from "next/server";
import { getCurrentUserProfile, updateCurrentUserProfile } from "@/features/auth/users";

export async function GET() {
  try {
    return NextResponse.json(await getCurrentUserProfile());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profil konnte nicht geladen werden." }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const profile = await updateCurrentUserProfile({
      name: typeof body.name === "string" ? body.name : undefined,
      profileImageUrl: body.profileImageUrl
    });
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profil konnte nicht gespeichert werden.";
    return NextResponse.json({ error: message }, { status: message === "Login erforderlich" ? 401 : 400 });
  }
}

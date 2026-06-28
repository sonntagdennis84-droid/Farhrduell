import { NextResponse } from "next/server";
import { createQuizCategory, listQuizCategories } from "@/features/sessions/store";

export async function GET() {
  return NextResponse.json(await listQuizCategories());
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const category = await createQuizCategory(String(body.name ?? ""));
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kategorie konnte nicht gespeichert werden." }, { status: 400 });
  }
}

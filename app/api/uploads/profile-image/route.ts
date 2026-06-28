import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowed = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"]
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Bitte ein Bild auswählen." }, { status: 400 });
  }

  const extension = allowed.get(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Erlaubt sind PNG, JPG oder WebP." }, { status: 400 });
  }
  if (file.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Das Profilbild darf maximal 3 MB groß sein." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeDir = path.join("public", "uploads", "profiles");
  await mkdir(relativeDir, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(relativeDir, fileName), buffer);

  return NextResponse.json({
    profileImageUrl: `/uploads/profiles/${fileName}`
  });
}

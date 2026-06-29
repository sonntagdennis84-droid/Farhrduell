import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const mediaRules = new Map([
  ["image/jpeg", { mediaType: "image", maxBytes: 5 * 1024 * 1024, extension: "jpg" }],
  ["image/png", { mediaType: "image", maxBytes: 5 * 1024 * 1024, extension: "png" }],
  ["image/webp", { mediaType: "image", maxBytes: 5 * 1024 * 1024, extension: "webp" }],
  ["image/gif", { mediaType: "image", maxBytes: 5 * 1024 * 1024, extension: "gif" }],
  ["video/mp4", { mediaType: "video", maxBytes: 25 * 1024 * 1024, extension: "mp4" }],
  ["video/webm", { mediaType: "video", maxBytes: 25 * 1024 * 1024, extension: "webm" }],
  ["audio/mpeg", { mediaType: "audio", maxBytes: 10 * 1024 * 1024, extension: "mp3" }],
  ["audio/mp3", { mediaType: "audio", maxBytes: 10 * 1024 * 1024, extension: "mp3" }],
  ["audio/wav", { mediaType: "audio", maxBytes: 10 * 1024 * 1024, extension: "wav" }],
  ["audio/ogg", { mediaType: "audio", maxBytes: 10 * 1024 * 1024, extension: "ogg" }]
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
  }

  const rule = mediaRules.get(file.type);
  if (!rule) {
    return NextResponse.json({ error: "Bitte Bild, Video oder Audio in einem unterstützten Format hochladen." }, { status: 400 });
  }

  if (file.size > rule.maxBytes) {
    return NextResponse.json({ error: "Die Datei ist zu groß für den Upload." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads", "questions");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${randomUUID()}.${rule.extension}`;
  await writeFile(path.join(uploadDir, fileName), buffer);
  const mediaUrl = `/uploads/questions/${fileName}`;

  return NextResponse.json({
    mediaType: rule.mediaType,
    mediaUrl,
    mediaAlt: file.name.replace(/\.[^.]+$/, "").replaceAll("_", " ").trim()
  });
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const mediaRules = new Map([
  ["image/jpeg", { mediaType: "image", maxBytes: 3 * 1024 * 1024 }],
  ["image/png", { mediaType: "image", maxBytes: 3 * 1024 * 1024 }],
  ["image/webp", { mediaType: "image", maxBytes: 3 * 1024 * 1024 }],
  ["image/gif", { mediaType: "image", maxBytes: 3 * 1024 * 1024 }],
  ["video/mp4", { mediaType: "video", maxBytes: 15 * 1024 * 1024 }],
  ["video/webm", { mediaType: "video", maxBytes: 15 * 1024 * 1024 }],
  ["audio/mpeg", { mediaType: "audio", maxBytes: 8 * 1024 * 1024 }],
  ["audio/mp3", { mediaType: "audio", maxBytes: 8 * 1024 * 1024 }],
  ["audio/wav", { mediaType: "audio", maxBytes: 8 * 1024 * 1024 }],
  ["audio/ogg", { mediaType: "audio", maxBytes: 8 * 1024 * 1024 }]
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
    return NextResponse.json({ error: "Die Datei ist zu groß für den Direkt-Upload." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mediaUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  return NextResponse.json({
    mediaType: rule.mediaType,
    mediaUrl,
    mediaAlt: file.name.replace(/\.[^.]+$/, "").replaceAll("_", " ").trim()
  });
}

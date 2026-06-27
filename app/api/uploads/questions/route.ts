import { NextResponse } from "next/server";

export const runtime = "nodejs";

const maxImageBytes = 3 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Bilddatei hochgeladen." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Bitte JPG, PNG, WebP oder GIF hochladen." }, { status: 400 });
  }

  if (file.size > maxImageBytes) {
    return NextResponse.json({ error: "Das Bild ist zu gross. Bitte maximal 3 MB hochladen." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mediaUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  return NextResponse.json({
    mediaType: "image",
    mediaUrl,
    mediaAlt: file.name.replace(/\.[^.]+$/, "").replaceAll("_", " ").trim()
  });
}

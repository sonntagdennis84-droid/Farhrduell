import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg"
};

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params;
  const safeFileName = path.basename(fileName);
  if (safeFileName !== fileName) return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });

  const extension = safeFileName.split(".").pop()?.toLowerCase() ?? "";
  const contentType = contentTypes[extension];
  if (!contentType) return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });

  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", "questions", safeFileName));
    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });
  }
}

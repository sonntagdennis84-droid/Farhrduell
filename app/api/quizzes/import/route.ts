import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parseQuizRows, parseQuizText } from "@/lib/quiz-import";
import { upsertQuiz } from "@/features/sessions/store";

export const runtime = "nodejs";

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replaceAll("_", " ").replaceAll("-", " ").trim() || "Importiertes Quiz";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const requestedTitle = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const categoryName = String(formData.get("categoryName") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
  }

  const fileName = file.name || "quiz";
  const fallbackTitle = requestedTitle || titleFromFileName(fileName);
  const extension = fileName.split(".").pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const imported =
      extension === "docx"
        ? parseQuizText((await mammoth.extractRawText({ buffer })).value, fallbackTitle)
        : extension === "xlsx" || extension === "xls" || extension === "csv"
          ? parseWorkbook(buffer, fallbackTitle)
          : null;

    if (!imported) {
      return NextResponse.json({ error: "Bitte eine Word- oder Excel-Datei hochladen (.docx, .xlsx, .xls, .csv)." }, { status: 400 });
    }

    if (requestedTitle) imported.title = requestedTitle;
    const quiz = await upsertQuiz({
      title: imported.title,
      description: imported.description,
      categoryId,
      categoryName,
      questions: imported.questions
    });
    return NextResponse.json({ quiz, importedQuestions: imported.questions.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import fehlgeschlagen." }, { status: 400 });
  }
}

function parseWorkbook(buffer: Buffer, fallbackTitle: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("Die Excel-Datei enthaelt kein Tabellenblatt.");
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return parseQuizRows(rows, fallbackTitle, `Importiert aus Tabellenblatt ${firstSheetName}.`);
}

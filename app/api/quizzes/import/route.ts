import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { getQuizByTitle, upsertQuiz } from "@/features/sessions/store";
import { parseQuizRowsDetailed, parseQuizText, type ImportedQuiz } from "@/lib/quiz-import";

export const runtime = "nodejs";

type ImportMode = "preview" | "import";

type ImportReportItem = {
  fileName: string;
  status: "ready" | "imported" | "skipped" | "error";
  quizName?: string;
  importedQuestions: number;
  skippedQuestions: number;
  warnings: string[];
  error?: string;
};

function titleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replaceAll("_", " ").replaceAll("-", " ").trim() || "Importiertes Quiz";
}

function normalizeMode(value: FormDataEntryValue | null): ImportMode {
  return value === "preview" ? "preview" : "import";
}

function countWarnings(quiz: ImportedQuiz) {
  const warnings: string[] = [];
  const missingCorrect = quiz.questions.filter((question) => !question.correctAnswer).length;
  if (missingCorrect > 0) warnings.push(`${missingCorrect} Fragen ohne eindeutige richtige Antwort gefunden.`);
  const shortQuestions = quiz.questions.filter((question) => !question.questionText || !question.answerA || !question.answerB || !question.answerC || !question.answerD).length;
  if (shortQuestions > 0) warnings.push(`${shortQuestions} unvollständige Fragen erkannt.`);
  return warnings;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = [...formData.getAll("files"), formData.get("file")].filter((entry): entry is File => entry instanceof File);
  const requestedTitle = String(formData.get("title") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const categoryName = String(formData.get("categoryName") ?? "").trim();
  const mode = normalizeMode(formData.get("mode"));
  const replaceDuplicates = String(formData.get("replaceDuplicates") ?? "") === "true";

  if (files.length === 0) {
    return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
  }

  const reports: ImportReportItem[] = [];
  const createdQuizIds: string[] = [];

  for (const file of files) {
    const fileName = file.name || "quiz";
    const fallbackTitle = requestedTitle || titleFromFileName(fileName);
    const extension = fileName.split(".").pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const importedQuizzes =
        extension === "docx"
          ? [parseQuizText((await mammoth.extractRawText({ buffer })).value, fallbackTitle)]
          : extension === "xlsx" || extension === "xls" || extension === "csv"
            ? parseWorkbook(buffer, fallbackTitle)
            : null;

      if (!importedQuizzes) {
        reports.push({
          fileName,
          status: "error",
          importedQuestions: 0,
          skippedQuestions: 0,
          warnings: [],
          error: "Bitte eine Word- oder Excel-Datei hochladen (.docx, .xlsx, .xls, .csv)."
        });
        continue;
      }

      for (const importedQuiz of importedQuizzes) {
        const quizTitle = requestedTitle && importedQuizzes.length === 1 ? requestedTitle : importedQuiz.title;
        const duplicate = await getQuizByTitle(quizTitle);
        const warnings = countWarnings(importedQuiz);

        if (duplicate && !replaceDuplicates) {
          reports.push({
            fileName,
            status: mode === "preview" ? "ready" : "skipped",
            quizName: quizTitle,
            importedQuestions: importedQuiz.questions.length,
            skippedQuestions: 0,
            warnings: [...warnings, "Quiz mit gleichem Titel existiert bereits."],
            error: mode === "preview" ? undefined : "Duplikat erkannt"
          });
          continue;
        }

        if (mode === "preview") {
          reports.push({
            fileName,
            status: "ready",
            quizName: quizTitle,
            importedQuestions: importedQuiz.questions.length,
            skippedQuestions: 0,
            warnings
          });
          continue;
        }

        const quiz = await upsertQuiz({
          ...(duplicate && replaceDuplicates ? { id: duplicate.id } : {}),
          title: quizTitle,
          description: importedQuiz.description,
          categoryId,
          categoryName,
          questions: importedQuiz.questions
        });
        createdQuizIds.push(quiz.id);
        reports.push({
          fileName,
          status: "imported",
          quizName: quiz.title,
          importedQuestions: importedQuiz.questions.length,
          skippedQuestions: 0,
          warnings: duplicate && replaceDuplicates ? [...warnings, "Bestehendes Quiz wurde ersetzt."] : warnings
        });
      }
    } catch (error) {
      reports.push({
        fileName,
        status: "error",
        importedQuestions: 0,
        skippedQuestions: 0,
        warnings: [],
        error: error instanceof Error ? error.message : "Import fehlgeschlagen."
      });
    }
  }

  const importedCount = reports.filter((item) => item.status === "imported").length;
  const readyCount = reports.filter((item) => item.status === "ready").length;
  return NextResponse.json(
    {
      mode,
      importedCount,
      readyCount,
      reports,
      createdQuizIds
    },
    { status: mode === "preview" ? 200 : 201 }
  );
}

function parseWorkbook(buffer: Buffer, fallbackTitle: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const preferredSheetName =
    workbook.SheetNames.find((name) => name.trim().toLowerCase() === "fragen") ??
    workbook.SheetNames.find((name) => name.trim().toLowerCase() === "alle_fragen") ??
    workbook.SheetNames.find((name) => name.trim().toLowerCase().includes("fragen"));
  const firstSheetName = preferredSheetName ?? workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("Die Excel-Datei enthält kein Tabellenblatt.");
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return parseQuizRowsDetailed(rows, fallbackTitle, `Importiert aus Tabellenblatt ${firstSheetName}.`).quizzes;
}

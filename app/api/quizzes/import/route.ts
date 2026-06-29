import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { inflateRawSync } from "node:zlib";
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

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

type ExtractedMedia = {
  mediaType: "image";
  mediaUrl: string;
  mediaAlt: string;
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
  const mediaQuestions = quiz.questions.filter((question) => question.mediaUrl).length;
  if (mediaQuestions > 0) warnings.push(`${mediaQuestions} Medien aus der Datei erkannt.`);
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
            ? await parseWorkbook(buffer, fallbackTitle, { persistMedia: mode === "import" })
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

async function parseWorkbook(buffer: Buffer, fallbackTitle: string, options: { persistMedia: boolean }) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const preferredSheetName =
    workbook.SheetNames.find((name) => name.trim().toLowerCase() === "fragen") ??
    workbook.SheetNames.find((name) => name.trim().toLowerCase() === "alle_fragen") ??
    workbook.SheetNames.find((name) => name.trim().toLowerCase().includes("fragen"));
  const firstSheetName = preferredSheetName ?? workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("Die Excel-Datei enthält kein Tabellenblatt.");
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const mediaByRow = await extractEmbeddedImageMedia(buffer, options.persistMedia);
  for (const [rowNumber, media] of mediaByRow.entries()) {
    const rowIndex = rowNumber - 2;
    if (!rows[rowIndex]) continue;
    rows[rowIndex] = {
      ...rows[rowIndex],
      Medientyp: media.mediaType,
      MedienURL: media.mediaUrl,
      Alttext: media.mediaAlt
    };
  }
  return parseQuizRowsDetailed(rows, fallbackTitle, `Importiert aus Tabellenblatt ${firstSheetName}.`).quizzes;
}

function readUInt16(buffer: Buffer, offset: number) {
  return buffer.readUInt16LE(offset);
}

function readUInt32(buffer: Buffer, offset: number) {
  return buffer.readUInt32LE(offset);
}

function readZipFiles(buffer: Buffer) {
  let endOfCentralDirectory = -1;
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 70_000); offset--) {
    if (readUInt32(buffer, offset) === 0x06054b50) {
      endOfCentralDirectory = offset;
      break;
    }
  }
  if (endOfCentralDirectory < 0) return new Map<string, Buffer>();

  const entryCount = readUInt16(buffer, endOfCentralDirectory + 10);
  let centralOffset = readUInt32(buffer, endOfCentralDirectory + 16);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < entryCount; index++) {
    if (readUInt32(buffer, centralOffset) !== 0x02014b50) break;
    const compressionMethod = readUInt16(buffer, centralOffset + 10);
    const compressedSize = readUInt32(buffer, centralOffset + 20);
    const uncompressedSize = readUInt32(buffer, centralOffset + 24);
    const fileNameLength = readUInt16(buffer, centralOffset + 28);
    const extraLength = readUInt16(buffer, centralOffset + 30);
    const commentLength = readUInt16(buffer, centralOffset + 32);
    const localHeaderOffset = readUInt32(buffer, centralOffset + 42);
    const name = buffer.subarray(centralOffset + 46, centralOffset + 46 + fileNameLength).toString("utf8");
    entries.push({ name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset });
    centralOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  const files = new Map<string, Buffer>();
  for (const entry of entries) {
    if (entry.name.endsWith("/")) continue;
    const localOffset = entry.localHeaderOffset;
    if (readUInt32(buffer, localOffset) !== 0x04034b50) continue;
    const fileNameLength = readUInt16(buffer, localOffset + 26);
    const extraLength = readUInt16(buffer, localOffset + 28);
    const dataStart = localOffset + 30 + fileNameLength + extraLength;
    const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);
    const data = entry.compressionMethod === 0 ? compressed : entry.compressionMethod === 8 ? inflateRawSync(compressed) : null;
    if (data && data.length === entry.uncompressedSize) files.set(entry.name, data);
  }
  return files;
}

function parseRelationships(xml: string) {
  const relationships = new Map<string, string>();
  for (const match of xml.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    relationships.set(match[1], match[2]);
  }
  return relationships;
}

function parseRichValueRelOrder(xml: string) {
  return [...xml.matchAll(/<rel\b[^>]*r:id="([^"]+)"/g)].map((match) => match[1]);
}

function normalizeZipPath(baseDir: string, target: string) {
  return path.posix.normalize(path.posix.join(baseDir, target)).replace(/^\/+/, "");
}

function extensionForZipPath(zipPath: string) {
  const extension = zipPath.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "png";
}

async function persistEmbeddedImage(buffer: Buffer, originalZipPath: string) {
  const extension = extensionForZipPath(originalZipPath);
  const uploadDir = path.join(process.cwd(), "public", "uploads", "questions");
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/questions/${fileName}`;
}

async function extractEmbeddedImageMedia(buffer: Buffer, persistMedia: boolean) {
  const files = readZipFiles(buffer);
  const sheetXml = files.get("xl/worksheets/sheet1.xml")?.toString("utf8") ?? "";
  const richValueRelXml = files.get("xl/richData/richValueRel.xml")?.toString("utf8") ?? "";
  const richValueRelsXml = files.get("xl/richData/_rels/richValueRel.xml.rels")?.toString("utf8") ?? "";
  if (!sheetXml || !richValueRelXml || !richValueRelsXml) return new Map<number, ExtractedMedia>();

  const relOrder = parseRichValueRelOrder(richValueRelXml);
  const relTargets = parseRelationships(richValueRelsXml);
  const mediaByRow = new Map<number, ExtractedMedia>();

  for (const match of sheetXml.matchAll(/<c\b[^>]*r="([A-Z]+)(\d+)"[^>]*vm="(\d+)"[^>]*>/g)) {
    const rowNumber = Number(match[2]);
    const valueMetadataIndex = Number(match[3]) - 1;
    const relId = relOrder[valueMetadataIndex];
    const target = relId ? relTargets.get(relId) : null;
    if (!target || rowNumber < 2) continue;
    const zipPath = normalizeZipPath("xl/richData", target);
    const image = files.get(zipPath);
    if (!image) continue;
    const mediaUrl = persistMedia ? await persistEmbeddedImage(image, zipPath) : `embedded://${path.posix.basename(zipPath)}`;
    mediaByRow.set(rowNumber, {
      mediaType: "image",
      mediaUrl,
      mediaAlt: `Bild zu Frage ${rowNumber - 1}`
    });
  }

  return mediaByRow;
}

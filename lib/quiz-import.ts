import type { AnswerOption, Question } from "@/types/domain";

type ImportedQuestion = Partial<Question> & Pick<Question, "questionText" | "answerA" | "answerB" | "answerC" | "answerD" | "correctAnswer">;

export type ImportedQuiz = {
  title: string;
  description?: string;
  questions: ImportedQuestion[];
};

type Draft = Partial<ImportedQuestion> & {
  _field?: keyof ImportedQuestion;
};

function clean(value: unknown) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeader(value: string) {
  return clean(value)
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]/g, "");
}

function asAnswerOption(value: unknown): AnswerOption | null {
  const option = clean(value).toUpperCase().match(/[ABCD]/)?.[0];
  return option === "A" || option === "B" || option === "C" || option === "D" ? option : null;
}

function commitQuestion(draft: Draft, questions: ImportedQuestion[]) {
  if (!draft.questionText && !draft.answerA && !draft.answerB && !draft.answerC && !draft.answerD) return;
  const correctAnswer = asAnswerOption(draft.correctAnswer) ?? "A";
  if (!draft.questionText || !draft.answerA || !draft.answerB || !draft.answerC || !draft.answerD) {
    throw new Error("Eine Frage ist unvollstaendig. Bitte Frage sowie Antworten A, B, C und D pruefen.");
  }
  questions.push({
    ...draft,
    questionText: draft.questionText,
    answerA: draft.answerA,
    answerB: draft.answerB,
    answerC: draft.answerC,
    answerD: draft.answerD,
    correctAnswer,
    timeLimitSeconds: Number(draft.timeLimitSeconds ?? 20),
    mediaType: draft.mediaType || "none"
  });
}

function setField(draft: Draft, field: keyof ImportedQuestion, value: string) {
  draft[field] = value as never;
  draft._field = field;
}

export function parseQuizText(text: string, fallbackTitle = "Importiertes Quiz"): ImportedQuiz {
  const lines = text
    .split(/\r?\n/)
    .map((line) => clean(line))
    .filter(Boolean);

  const firstQuestionIndex = lines.findIndex((line) => /^frage\s+\d+/i.test(line));
  const headerLines = firstQuestionIndex > 0 ? lines.slice(0, firstQuestionIndex) : [];
  const bodyLines = firstQuestionIndex >= 0 ? lines.slice(firstQuestionIndex) : lines;
  const title = headerLines[0] || fallbackTitle;
  const description = headerLines.slice(1).join(" ");
  const questions: ImportedQuestion[] = [];
  let draft: Draft = {};

  for (const line of bodyLines) {
    if (/^frage\s+\d+/i.test(line)) {
      commitQuestion(draft, questions);
      draft = {};
      continue;
    }

    const answer = line.match(/^([ABCD])\s*[\).:\-]\s*(.+)$/i);
    if (answer) {
      setField(draft, `answer${answer[1].toUpperCase()}` as keyof ImportedQuestion, clean(answer[2]));
      continue;
    }

    const correct = line.match(/^(richtige\s+antwort|correct\s+answer|loesung|lösung)\s*:?\s*([ABCD])/i);
    if (correct) {
      setField(draft, "correctAnswer", correct[2].toUpperCase());
      continue;
    }

    const labeled = line.match(/^(erklaerung|erklärung|merksatz|erinnerungsfrage|praxisbeispiel|tipp|hint|kategorie|thema|schwierigkeit|zeit|zeitlimit|medientyp|medienurl|alttext|medientitel)\s*:?\s*(.+)$/i);
    if (labeled) {
      const label = normalizeHeader(labeled[1]);
      const value = clean(labeled[2]);
      const field =
        label === "erklaerung"
          ? "explanation"
          : label === "merksatz"
            ? "memorySentence"
            : label === "erinnerungsfrage"
              ? "memoryQuestion"
              : label === "praxisbeispiel"
                ? "practicalExample"
                : label === "tipp" || label === "hint"
                  ? "hint"
                  : label === "kategorie"
                    ? "category"
                    : label === "thema"
                      ? "topic"
                      : label === "schwierigkeit"
                        ? "difficulty"
                        : label === "zeit" || label === "zeitlimit"
                          ? "timeLimitSeconds"
                          : label === "medientyp"
                            ? "mediaType"
                            : label === "medienurl"
                              ? "mediaUrl"
                              : label === "alttext"
                                ? "mediaAlt"
                                : "mediaCaption";
      setField(draft, field as keyof ImportedQuestion, value);
      continue;
    }

    if (!draft.questionText) {
      setField(draft, "questionText", line);
    } else if (draft._field && draft._field !== "correctAnswer") {
      const existing = clean(draft[draft._field]);
      setField(draft, draft._field, `${existing} ${line}`);
    }
  }

  commitQuestion(draft, questions);
  if (questions.length === 0) throw new Error("Keine Fragen gefunden. Bitte Format pruefen.");
  return { title, description, questions };
}

const headerAliases: Record<string, keyof ImportedQuestion> = {
  frage: "questionText",
  fragetext: "questionText",
  question: "questionText",
  questiontext: "questionText",
  antworta: "answerA",
  a: "answerA",
  antwortb: "answerB",
  b: "answerB",
  antwortc: "answerC",
  c: "answerC",
  antwortd: "answerD",
  d: "answerD",
  richtigeantwort: "correctAnswer",
  correctanswer: "correctAnswer",
  loesung: "correctAnswer",
  losung: "correctAnswer",
  erklaerung: "explanation",
  erklarung: "explanation",
  explanation: "explanation",
  merksatz: "memorySentence",
  erinnerungsfrage: "memoryQuestion",
  praxisbeispiel: "practicalExample",
  tipp: "hint",
  hint: "hint",
  zeit: "timeLimitSeconds",
  zeitlimit: "timeLimitSeconds",
  timelimit: "timeLimitSeconds",
  schwierigkeit: "difficulty",
  kategorie: "category",
  thema: "topic",
  medientyp: "mediaType",
  medienurl: "mediaUrl",
  alttext: "mediaAlt",
  medientitel: "mediaCaption"
};

export function parseQuizRows(rows: Record<string, unknown>[], title: string, description = ""): ImportedQuiz {
  const questions = rows
    .map((row) => {
      const draft: Draft = {};
      for (const [header, value] of Object.entries(row)) {
        const field = headerAliases[normalizeHeader(header)];
        const text = clean(value);
        if (!field || !text) continue;
        draft[field] = (field === "timeLimitSeconds" ? Number(text) : text) as never;
      }
      return draft;
    })
    .filter((draft) => draft.questionText || draft.answerA || draft.answerB || draft.answerC || draft.answerD);

  const imported: ImportedQuestion[] = [];
  for (const draft of questions) commitQuestion(draft, imported);
  if (imported.length === 0) throw new Error("Keine Fragen gefunden. Bitte Excel-Spalten pruefen.");
  return { title, description, questions: imported };
}

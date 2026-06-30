import type { AnswerOption } from "@/types/domain";

export type AiLabsAction = "explanation" | "memorySentence" | "practicalExample" | "imagePrompt";

export type AiLabsQuestionInput = {
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: AnswerOption;
  category?: string | null;
  topic?: string | null;
};

export type AiLabsGenerateInput = {
  action: AiLabsAction;
  quizTitle?: string | null;
  quizDescription?: string | null;
  quizCategory?: string | null;
  question: AiLabsQuestionInput;
};

export type AiLabsSuggestion = {
  action: AiLabsAction;
  suggestion: string;
  provider: "local-preview";
};

const actionLabels: Record<AiLabsAction, string> = {
  explanation: "Erklaerung",
  memorySentence: "Merksatz",
  practicalExample: "Praxisbeispiel",
  imagePrompt: "Bildprompt"
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function answerFor(question: AiLabsQuestionInput) {
  const key = `answer${question.correctAnswer}` as const;
  return clean(question[key]);
}

function context(input: AiLabsGenerateInput) {
  return clean(input.question.topic) || clean(input.question.category) || clean(input.quizCategory) || "Fahrschule";
}

function validate(input: AiLabsGenerateInput) {
  if (!["explanation", "memorySentence", "practicalExample", "imagePrompt"].includes(input.action)) {
    throw new Error("Unbekannte AI-Labs-Funktion.");
  }
  if (!clean(input.question.questionText)) throw new Error("Bitte zuerst einen Fragetext eintragen.");
  if (!clean(input.question.answerA) || !clean(input.question.answerB) || !clean(input.question.answerC) || !clean(input.question.answerD)) {
    throw new Error("Bitte zuerst alle vier Antwortmoeglichkeiten eintragen.");
  }
  if (!answerFor(input.question)) throw new Error("Die richtige Antwort ist noch nicht vollstaendig.");
}

function buildExplanation(input: AiLabsGenerateInput) {
  const question = input.question;
  const correct = answerFor(question);
  return `Richtig ist Antwort ${question.correctAnswer}: ${correct}. Entscheidend ist hier der Zusammenhang mit ${context(input)}. Fahrschueler sollten zuerst die Situation erfassen, dann die Regeln anwenden und erst danach handeln. Die falschen Antworten wirken zwar moeglich, loesen aber die konkrete Fahraufgabe nicht so sicher oder regelgerecht wie die richtige Antwort.`;
}

function buildMemorySentence(input: AiLabsGenerateInput) {
  const correct = answerFor(input.question);
  return `Erst Situation pruefen, dann entscheiden. In diesem Fall gilt: ${correct}.`;
}

function buildPracticalExample(input: AiLabsGenerateInput) {
  const correct = answerFor(input.question);
  return `Stell dir vor, du bist in einer realen Fahrsituation zum Thema ${context(input)}. Du musst schnell entscheiden, aber trotzdem ruhig bleiben. Wenn die Situation der Frage entspricht, ist die sichere Handlung: ${correct}. Genau deshalb ist es wichtig, Verkehrszeichen, Vorfahrt, andere Verkehrsteilnehmer und die eigene Geschwindigkeit gemeinsam zu beachten.`;
}

function buildImagePrompt(input: AiLabsGenerateInput) {
  const question = input.question;
  return `Erstelle eine klare Fahrschul-Illustration im Fahrduell-Stil zur Frage: "${clean(question.questionText)}". Zeige die Verkehrssituation aus gut verstaendlicher Perspektive, mit eindeutigen Fahrzeugpositionen, gut lesbaren Verkehrszeichen und hoher Kontrastwirkung. Kein fotorealistischer Stil, keine ablenkenden Details, keine Texttafeln ausser notwendigen Verkehrszeichen. Schwerpunkt: ${context(input)}.`;
}

export function generateAiLabsSuggestion(input: AiLabsGenerateInput): AiLabsSuggestion {
  validate(input);
  const builders: Record<AiLabsAction, (input: AiLabsGenerateInput) => string> = {
    explanation: buildExplanation,
    memorySentence: buildMemorySentence,
    practicalExample: buildPracticalExample,
    imagePrompt: buildImagePrompt
  };
  return {
    action: input.action,
    suggestion: builders[input.action](input),
    provider: "local-preview"
  };
}

export function aiLabsActionLabel(action: AiLabsAction) {
  return actionLabels[action];
}

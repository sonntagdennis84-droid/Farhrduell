"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerOption, MediaType, Quiz, QuizCategory } from "@/types/domain";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { AiLabsAction } from "@/services/ai/ai-labs";

type QuestionDraft = {
  id?: string;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: AnswerOption;
  timeLimitSeconds: number;
  explanation?: string | null;
  answerAExplanation?: string | null;
  answerBExplanation?: string | null;
  answerCExplanation?: string | null;
  answerDExplanation?: string | null;
  memorySentence?: string | null;
  memoryQuestion?: string | null;
  practicalExample?: string | null;
  hint?: string | null;
  mediaType?: MediaType | string | null;
  mediaUrl?: string | null;
  mediaAlt?: string | null;
  mediaCaption?: string | null;
  difficulty?: string | null;
  category?: string | null;
  topic?: string | null;
};

type AiSuggestionState = {
  action: AiLabsAction;
  questionIndex: number;
  text: string;
} | null;

const emptyQuestion: QuestionDraft = {
  questionText: "",
  answerA: "",
  answerB: "",
  answerC: "",
  answerD: "",
  correctAnswer: "A",
  timeLimitSeconds: 20,
  explanation: "",
  answerAExplanation: "",
  answerBExplanation: "",
  answerCExplanation: "",
  answerDExplanation: "",
  memorySentence: "",
  memoryQuestion: "",
  practicalExample: "",
  hint: "",
  mediaType: "none",
  mediaUrl: "",
  mediaAlt: "",
  mediaCaption: "",
  difficulty: "leicht",
  category: "Grundstoff",
  topic: ""
};

const aiActions: { action: AiLabsAction; label: string; target?: keyof QuestionDraft }[] = [
  { action: "explanation", label: "Erklärung erzeugen", target: "explanation" },
  { action: "memorySentence", label: "Merksatz erzeugen", target: "memorySentence" },
  { action: "practicalExample", label: "Praxisbeispiel erzeugen", target: "practicalExample" },
  { action: "imagePrompt", label: "Bildvorschlag erzeugen" }
];

export function QuizEditor({ quiz, aiLabsEnabled = false }: { quiz?: Quiz; aiLabsEnabled?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [description, setDescription] = useState(quiz?.description ?? "");
  const [categoryId, setCategoryId] = useState(quiz?.categoryId ?? "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>(quiz?.questions.length ? quiz.questions : [emptyQuestion]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingQuestion, setUploadingQuestion] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
  const [aiBusyAction, setAiBusyAction] = useState<AiLabsAction | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestionState>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => undefined);
  }, []);

  function updateQuestion(index: number, key: string, value: string | number) {
    setQuestions((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  async function uploadMedia(index: number, file?: File | null) {
    if (!file) return;
    setUploadingQuestion(index);
    setUploadError("");
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/uploads/questions", { method: "POST", body: formData });
    const result = await response.json().catch(() => null);
    setUploadingQuestion(null);
    if (!response.ok) {
      setUploadError(result?.error ?? "Medium konnte nicht hochgeladen werden.");
      return;
    }
    updateQuestion(index, "mediaType", result.mediaType);
    updateQuestion(index, "mediaUrl", result.mediaUrl);
    if (!questions[index]?.mediaAlt) updateQuestion(index, "mediaAlt", result.mediaAlt ?? "");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const method = quiz ? "PUT" : "POST";
    const url = quiz ? `/api/quizzes/${quiz.id}` : "/api/quizzes";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, categoryId, categoryName: newCategoryName, questions })
    });
    const saved = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok || !saved?.id) {
      setError(saved?.error ?? "Quiz konnte nicht gespeichert werden.");
      return;
    }
    router.push(`/quizzes/${saved.id}/edit`);
    router.refresh();
  }

  async function generateAiSuggestion(action: AiLabsAction) {
    const question = questions[aiQuestionIndex];
    if (!question) return;
    setAiBusyAction(action);
    setAiError("");
    const quizCategory = categories.find((category) => category.id === categoryId)?.name ?? newCategoryName;
    const response = await fetch("/api/ai-labs/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, quizTitle: title, quizDescription: description, quizCategory, question })
    });
    const result = await response.json().catch(() => null);
    setAiBusyAction(null);
    if (!response.ok || !result?.suggestion) {
      setAiError(result?.error ?? "AI Labs konnte keinen Vorschlag erstellen.");
      return;
    }
    setAiSuggestion({ action, questionIndex: aiQuestionIndex, text: result.suggestion });
  }

  function acceptAiSuggestion() {
    if (!aiSuggestion) return;
    const action = aiActions.find((item) => item.action === aiSuggestion.action);
    if (!action?.target) return;
    updateQuestion(aiSuggestion.questionIndex, action.target, aiSuggestion.text);
    setAiSuggestion(null);
  }

  return (
    <form onSubmit={save} className={aiLabsEnabled ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]" : "space-y-6"}>
      <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <label>
          <span className="text-sm font-bold text-white/70">Titel</span>
          <input required className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span className="text-sm font-bold text-white/70">Beschreibung</span>
          <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3" value={description ?? ""} onChange={(event) => setDescription(event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <label>
          <span className="text-sm font-bold text-white/70">Quiz-Kategorie</span>
          <select className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="">Bitte auswählen</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-bold text-white/70">Neue Kategorie anlegen</span>
          <input
            className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3"
            placeholder="Optionaler neuer Kategoriename"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
        </label>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <section key={index} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-show-gold">Frage {index + 1}</h2>
              {questions.length > 1 && (
                <button type="button" className="rounded border border-white/20 px-3 py-2 text-sm font-bold" onClick={() => setQuestions((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                  Löschen
                </button>
              )}
            </div>
            <label className="mt-3 block">
              <span className="text-sm font-bold text-white/70">Fragetext</span>
              <textarea required className="mt-1 min-h-24 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.questionText} onChange={(event) => updateQuestion(index, "questionText", event.target.value)} />
            </label>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(["A", "B", "C", "D"] as AnswerOption[]).map((option) => (
                <label key={option}>
                  <span className="text-sm font-bold text-white/70">Antwort {option}</span>
                  <input required className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question[`answer${option}` as keyof typeof question] as string} onChange={(event) => updateQuestion(index, `answer${option}`, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label>
                <span className="text-sm font-bold text-white/70">Richtige Antwort</span>
                <select className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.correctAnswer} onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)}>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                  <option>D</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Zeitlimit</span>
                <input type="number" min="5" max="120" className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.timeLimitSeconds} onChange={(event) => updateQuestion(index, "timeLimitSeconds", Number(event.target.value))} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Allgemeine Erklärung</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.explanation ?? ""} onChange={(event) => updateQuestion(index, "explanation", event.target.value)} />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(["A", "B", "C", "D"] as AnswerOption[]).map((option) => (
                <label key={option}>
                  <span className="text-sm font-bold text-white/70">Erklärung Antwort {option}</span>
                  <input
                    className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3"
                    value={(question[`answer${option}Explanation` as keyof typeof question] as string) ?? ""}
                    onChange={(event) => updateQuestion(index, `answer${option}Explanation`, event.target.value)}
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label>
                <span className="text-sm font-bold text-white/70">Merksatz</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.memorySentence ?? ""} onChange={(event) => updateQuestion(index, "memorySentence", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Praxisbeispiel</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.practicalExample ?? ""} onChange={(event) => updateQuestion(index, "practicalExample", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Tipp-Joker</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.hint ?? ""} onChange={(event) => updateQuestion(index, "hint", event.target.value)} />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label>
                <span className="text-sm font-bold text-white/70">Medientyp</span>
                <select className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.mediaType ?? "none"} onChange={(event) => updateQuestion(index, "mediaType", event.target.value)}>
                  <option value="none">Kein Medium</option>
                  <option value="image">Bild</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Medien-URL</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" placeholder="/uploads/questions/datei" value={question.mediaUrl ?? ""} onChange={(event) => updateQuestion(index, "mediaUrl", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Medium hochladen</span>
                <input
                  className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-show-gold file:px-3 file:py-2 file:font-black file:text-show-navy"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                  disabled={uploadingQuestion === index}
                  onChange={(event) => uploadMedia(index, event.target.files?.[0])}
                />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Alt-Text</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.mediaAlt ?? ""} onChange={(event) => updateQuestion(index, "mediaAlt", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Medientitel</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.mediaCaption ?? ""} onChange={(event) => updateQuestion(index, "mediaCaption", event.target.value)} />
              </label>
            </div>
            {question.mediaUrl && question.mediaType === "image" && <img className="mt-3 max-h-48 rounded border border-white/10 object-contain" src={question.mediaUrl} alt={question.mediaAlt || "Vorschau"} />}
            {question.mediaUrl && question.mediaType === "video" && <video className="mt-3 max-h-56 rounded border border-white/10 object-contain" src={question.mediaUrl} controls muted playsInline />}
            {question.mediaUrl && question.mediaType === "audio" && <audio className="mt-3 w-full" src={question.mediaUrl} controls preload="metadata" />}
            {uploadError && <p className="mt-3 rounded border border-show-red/30 bg-show-red/10 p-3 text-sm font-bold text-show-red">{uploadError}</p>}
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label>
                <span className="text-sm font-bold text-white/70">Erinnerungsfrage</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.memoryQuestion ?? ""} onChange={(event) => updateQuestion(index, "memoryQuestion", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Schwierigkeit</span>
                <select className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.difficulty ?? "leicht"} onChange={(event) => updateQuestion(index, "difficulty", event.target.value)}>
                  <option value="leicht">leicht</option>
                  <option value="mittel">mittel</option>
                  <option value="schwer">schwer</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Fragen-Kategorie</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.category ?? ""} onChange={(event) => updateQuestion(index, "category", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Thema</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.topic ?? ""} onChange={(event) => updateQuestion(index, "topic", event.target.value)} />
              </label>
            </div>
          </section>
        ))}
      </div>

      {error && <p className="rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded border border-white/20 px-5 py-3 font-bold" onClick={() => setQuestions((items) => [...items, emptyQuestion])}>
          Frage hinzufügen
        </button>
        <PrimaryButton disabled={saving}>{saving ? "Speichert..." : "Quiz speichern"}</PrimaryButton>
      </div>
      </div>

      {aiLabsEnabled && (
        <aside className="h-fit rounded-lg border border-show-gold/30 bg-show-navy/80 p-4 shadow-2xl xl:sticky xl:top-6">
          <div className="rounded border border-show-gold/20 bg-show-gold/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-show-gold">
            Interne Admin-Testfunktion
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Fahrduell AI Labs</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-white/65">
            Erstellt Vorschläge für bestehende Fragen. Nichts wird automatisch gespeichert.
          </p>

          <label className="mt-4 block">
            <span className="text-sm font-bold text-white/70">Zielfrage</span>
            <select className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={aiQuestionIndex} onChange={(event) => setAiQuestionIndex(Number(event.target.value))}>
              {questions.map((question, index) => (
                <option key={index} value={index}>
                  Frage {index + 1}: {(question.questionText || "Ohne Text").slice(0, 42)}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid gap-2">
            {aiActions.map((item) => (
              <button
                key={item.action}
                type="button"
                className="min-h-12 rounded border border-white/15 bg-white/5 px-4 py-3 text-left font-black hover:border-show-gold hover:text-show-gold disabled:cursor-wait disabled:opacity-60"
                disabled={Boolean(aiBusyAction)}
                onClick={() => generateAiSuggestion(item.action)}
              >
                {aiBusyAction === item.action ? "KI erstellt Vorschlag..." : item.label}
              </button>
            ))}
          </div>

          {aiError && <p className="mt-4 rounded border border-show-red/30 bg-show-red/10 p-3 text-sm font-bold text-show-red">{aiError}</p>}

          {aiSuggestion && (
            <div className="mt-5 rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black uppercase text-show-gold">Vorschau</p>
                <button type="button" className="text-sm font-bold text-white/65 hover:text-white" onClick={() => setAiSuggestion(null)}>
                  Verwerfen
                </button>
              </div>
              <textarea className="mt-3 min-h-40 w-full rounded border border-white/15 bg-show-panel px-3 py-3 text-sm" value={aiSuggestion.text} onChange={(event) => setAiSuggestion({ ...aiSuggestion, text: event.target.value })} />
              {aiActions.find((item) => item.action === aiSuggestion.action)?.target ? (
                <PrimaryButton className="mt-3 w-full" type="button" onClick={acceptAiSuggestion}>
                  Übernehmen
                </PrimaryButton>
              ) : (
                <button
                  type="button"
                  className="mt-3 w-full rounded border border-white/20 px-4 py-3 font-black hover:border-show-gold hover:text-show-gold"
                  onClick={() => navigator.clipboard?.writeText(aiSuggestion.text)}
                >
                  Prompt kopieren
                </button>
              )}
            </div>
          )}
        </aside>
      )}
    </form>
  );
}

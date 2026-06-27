"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerOption, MediaType, Quiz } from "@/types/domain";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

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

export function QuizEditor({ quiz }: { quiz?: Quiz }) {
  const router = useRouter();
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [description, setDescription] = useState(quiz?.description ?? "");
  const [questions, setQuestions] = useState<QuestionDraft[]>(quiz?.questions.length ? quiz.questions : [emptyQuestion]);
  const [saving, setSaving] = useState(false);
  const [uploadingQuestion, setUploadingQuestion] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  function updateQuestion(index: number, key: string, value: string | number) {
    setQuestions((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  async function uploadImage(index: number, file?: File | null) {
    if (!file) return;
    setUploadingQuestion(index);
    setUploadError("");
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/uploads/questions", { method: "POST", body: formData });
    const result = await response.json().catch(() => null);
    setUploadingQuestion(null);
    if (!response.ok) {
      setUploadError(result?.error ?? "Bild konnte nicht hochgeladen werden.");
      return;
    }
    updateQuestion(index, "mediaType", "image");
    updateQuestion(index, "mediaUrl", result.mediaUrl);
    if (!questions[index]?.mediaAlt) updateQuestion(index, "mediaAlt", result.mediaAlt ?? "");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const method = quiz ? "PUT" : "POST";
    const url = quiz ? `/api/quizzes/${quiz.id}` : "/api/quizzes";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, questions })
    });
    const saved = await response.json();
    router.push(`/quizzes/${saved.id}/edit`);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
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
      <div className="space-y-4">
        {questions.map((question, index) => (
          <section key={index} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-show-gold">Frage {index + 1}</h2>
              {questions.length > 1 && (
                <button type="button" className="rounded border border-white/20 px-3 py-2 text-sm font-bold" onClick={() => setQuestions((items) => items.filter((_, itemIndex) => itemIndex !== index))}>
                  Loeschen
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
                <span className="text-sm font-bold text-white/70">Allgemeine Erklaerung</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.explanation ?? ""} onChange={(event) => updateQuestion(index, "explanation", event.target.value)} />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(["A", "B", "C", "D"] as AnswerOption[]).map((option) => (
                <label key={option}>
                  <span className="text-sm font-bold text-white/70">Erklaerung Antwort {option}</span>
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
                  <option value="none">kein Medium</option>
                  <option value="image">Bild</option>
                  <option value="video">Video</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Medien-URL</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" placeholder="/uploads/questions/bild.jpg" value={question.mediaUrl ?? ""} onChange={(event) => updateQuestion(index, "mediaUrl", event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-bold text-white/70">Bild hochladen</span>
                <input
                  className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-show-gold file:px-3 file:py-2 file:font-black file:text-show-navy"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={uploadingQuestion === index}
                  onChange={(event) => uploadImage(index, event.target.files?.[0])}
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
            {question.mediaUrl && question.mediaType === "image" && (
              <img className="mt-3 max-h-48 rounded border border-white/10 object-contain" src={question.mediaUrl} alt={question.mediaAlt || "Vorschau"} />
            )}
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
                <span className="text-sm font-bold text-white/70">Kategorie</span>
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
      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded border border-white/20 px-5 py-3 font-bold" onClick={() => setQuestions((items) => [...items, emptyQuestion])}>
          Frage hinzufuegen
        </button>
        <PrimaryButton disabled={saving}>{saving ? "Speichert..." : "Quiz speichern"}</PrimaryButton>
      </div>
    </form>
  );
}

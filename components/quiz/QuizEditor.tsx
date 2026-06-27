"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerOption, Quiz } from "@/types/domain";
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
};

const emptyQuestion: QuestionDraft = {
  questionText: "",
  answerA: "",
  answerB: "",
  answerC: "",
  answerD: "",
  correctAnswer: "A" as AnswerOption,
  timeLimitSeconds: 20,
  explanation: ""
};

export function QuizEditor({ quiz }: { quiz?: Quiz }) {
  const router = useRouter();
  const [title, setTitle] = useState(quiz?.title ?? "");
  const [description, setDescription] = useState(quiz?.description ?? "");
  const [questions, setQuestions] = useState<QuestionDraft[]>(quiz?.questions.length ? quiz.questions : [emptyQuestion]);
  const [saving, setSaving] = useState(false);

  function updateQuestion(index: number, key: string, value: string | number) {
    setQuestions((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
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
                <span className="text-sm font-bold text-white/70">Erklärung</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={question.explanation ?? ""} onChange={(event) => updateQuestion(index, "explanation", event.target.value)} />
              </label>
            </div>
          </section>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded border border-white/20 px-5 py-3 font-bold" onClick={() => setQuestions((items) => [...items, emptyQuestion])}>
          Frage hinzufügen
        </button>
        <PrimaryButton disabled={saving}>{saving ? "Speichert..." : "Quiz speichern"}</PrimaryButton>
      </div>
    </form>
  );
}

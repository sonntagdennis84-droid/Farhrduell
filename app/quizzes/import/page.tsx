"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { QuizCategory } from "@/types/domain";

export default function QuizImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data[0]?.id) setCategoryId(data[0].id);
        }
      })
      .catch(() => undefined);
  }, []);

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Bitte zuerst eine Word- oder Excel-Datei auswählen.");
      return;
    }

    setBusy(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", title);
    formData.set("categoryId", categoryId);
    formData.set("categoryName", categoryName);
    const response = await fetch("/api/quizzes/import", { method: "POST", body: formData });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "Import fehlgeschlagen.");
      setBusy(false);
      return;
    }

    router.push(`/quizzes/${result.quiz.id}/edit`);
    router.refresh();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-black">Quiz importieren</h1>
        <p className="mt-3 text-white/70">Word oder Excel hochladen, Fragen prüfen und danach direkt als Fahrduell-Quiz speichern.</p>

        <form onSubmit={upload} className="mt-6 space-y-5 rounded-lg border border-white/10 bg-show-panel/90 p-6">
          <label className="block">
            <span className="text-sm font-bold text-white/70">Quiztitel optional überschreiben</span>
            <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Wird sonst aus Datei oder Word-Titel erkannt" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-white/70">Kategorie</span>
              <select className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                <option value="">Bitte auswählen</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Neue Kategorie</span>
              <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Optionaler neuer Kategoriename" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-white/70">Datei</span>
            <input
              className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white file:mr-4 file:rounded file:border-0 file:bg-show-gold file:px-4 file:py-2 file:font-black file:text-show-navy"
              type="file"
              accept=".docx,.xlsx,.xls,.csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="rounded border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-relaxed text-white/70">
            Word-Format: `Frage 1`, Fragetext, `A) ...`, `B) ...`, `C) ...`, `D) ...`, `Richtige Antwort: B`, `Erklärung: ...`.
            Excel-Format: Spalten wie `Frage`, `Antwort A`, `Antwort B`, `Antwort C`, `Antwort D`, `Richtige Antwort`, `Erklärung`.
          </div>

          {error && <p className="rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}

          <PrimaryButton disabled={busy} className="w-full">
            {busy ? "Import läuft..." : "Quiz importieren"}
          </PrimaryButton>
        </form>
      </div>
    </AppShell>
  );
}

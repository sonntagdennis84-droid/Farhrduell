"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Quiz, QuizCategory } from "@/types/domain";
import { AppShell } from "@/components/layout/AppShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Panel } from "@/components/ui/Panel";

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/quizzes")
      .then(async (response) => {
        if (response.status === 401) {
          router.push("/login?next=/quizzes");
          return [];
        }
        if (!response.ok) throw new Error("Quizze konnten nicht geladen werden.");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Quizze konnten nicht geladen werden.");
        return data;
      })
      .then(setQuizzes)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Quizze konnten nicht geladen werden."));

    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!selectedCategoryId && data[0]?.id) setSelectedCategoryId(data[0].id);
        }
      })
      .catch(() => undefined);
  }, [router]);

  const visibleQuizzes = useMemo(
    () => quizzes.filter((quiz) => (selectedCategoryId ? quiz.categoryId === selectedCategoryId : true)),
    [quizzes, selectedCategoryId]
  );

  async function startSession(quizId: string) {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId })
    });
    if (response.status === 401) {
      router.push("/login?next=/quizzes");
      return;
    }
    if (!response.ok) {
      setError("Live-Session konnte nicht gestartet werden.");
      return;
    }
    const session = await response.json();
    location.href = `/sessions/${session.id}/lobby`;
  }

  async function createCategory() {
    setError("");
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName })
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "Kategorie konnte nicht angelegt werden.");
      return;
    }
    setCategories((items) => [...items, result].sort((a, b) => a.name.localeCompare(b.name, "de")));
    setSelectedCategoryId(result.id);
    setNewCategoryName("");
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Quizze</h1>
          <p className="mt-2 text-white/70">Erst Kategorie wählen, dann das passende Quiz starten oder bearbeiten.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded border border-white/20 px-5 py-3 font-black hover:border-show-gold hover:text-show-gold" href="/quizzes/import">
            Import
          </Link>
          <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy" href="/quizzes/new">
            Neu
          </Link>
        </div>
      </div>

      <section className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-show-panel/80 p-4 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              className={selectedCategoryId === category.id ? "rounded border border-show-gold bg-show-gold px-4 py-3 font-black text-show-navy" : "rounded border border-white/15 bg-white/5 px-4 py-3 font-bold text-white/80"}
              onClick={() => setSelectedCategoryId(category.id)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            className="min-w-56 rounded border border-white/15 bg-white/10 px-3 py-3"
            placeholder="Neue Kategorie"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <button className="rounded border border-white/20 px-4 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={createCategory} type="button">
            Kategorie anlegen
          </button>
        </div>
      </section>

      {error && <p className="mt-4 rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleQuizzes.map((quiz) => (
          <Panel key={quiz.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{quiz.title}</h2>
                <p className="mt-2 min-h-12 text-white/70">{quiz.description}</p>
              </div>
              <span className="rounded border border-show-gold/30 bg-show-gold/10 px-3 py-2 text-xs font-black uppercase text-show-gold">{quiz.category?.name ?? "Ohne Kategorie"}</span>
            </div>
            <p className="mt-3 text-sm font-bold text-show-gold">{quiz.questions.length} Fragen</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => startSession(quiz.id)}>Live-Session starten</PrimaryButton>
              <Link className="rounded border border-white/20 px-4 py-2.5 font-bold" href={`/quizzes/${quiz.id}/edit`}>
                Bearbeiten
              </Link>
            </div>
          </Panel>
        ))}
      </div>

      {selectedCategoryId && visibleQuizzes.length === 0 && (
        <Panel className="mt-6">
          <h2 className="text-2xl font-black">Noch keine Quizze in dieser Kategorie</h2>
          <p className="mt-2 text-white/70">Du kannst direkt ein neues Quiz anlegen oder ein Word- bzw. Excel-Dokument importieren.</p>
        </Panel>
      )}
    </AppShell>
  );
}

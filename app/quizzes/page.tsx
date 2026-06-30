"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameMode, Quiz, QuizCategory } from "@/types/domain";
import { AppShell } from "@/components/layout/AppShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Panel } from "@/components/ui/Panel";

type StatusFilter = "active" | "archived" | "all";

function averageQuestionTime(quiz: Quiz) {
  if (quiz.questions.length === 0) return 0;
  return Math.round(quiz.questions.reduce((sum, question) => sum + Number(question.timeLimitSeconds || 0), 0) / quiz.questions.length);
}

function hasMedia(quiz: Quiz) {
  return quiz.questions.some((question) => Boolean(question.mediaUrl && question.mediaType !== "none"));
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [teamCount, setTeamCount] = useState(2);
  const [busyQuizId, setBusyQuizId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadQuizzes() {
    const response = await fetch("/api/quizzes");
    if (response.status === 401) {
      router.push("/login?next=/quizzes");
      return;
    }
    if (!response.ok) throw new Error("Quizze konnten nicht geladen werden.");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Quizze konnten nicht geladen werden.");
    setQuizzes(data);
  }

  useEffect(() => {
    loadQuizzes().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Quizze konnten nicht geladen werden."));

    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => undefined);
  }, [router]);

  const visibleQuizzes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      const matchesCategory = selectedCategoryId ? quiz.categoryId === selectedCategoryId : true;
      const matchesStatus = statusFilter === "all" ? true : statusFilter === "archived" ? Boolean(quiz.isArchived) : !quiz.isArchived;
      const searchable = `${quiz.title} ${quiz.description ?? ""} ${quiz.category?.name ?? ""}`.toLowerCase();
      const matchesSearch = term ? searchable.includes(term) : true;
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [quizzes, search, selectedCategoryId, statusFilter]);

  async function startSession(quiz: Quiz) {
    if (quiz.isArchived) {
      setError("Archivierte Quizze können nicht gestartet werden.");
      return;
    }
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: quiz.id, gameMode, teamCount })
    });
    if (response.status === 401) {
      router.push("/login?next=/quizzes");
      return;
    }
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "Live-Session konnte nicht gestartet werden.");
      return;
    }
    location.href = `/sessions/${result.id}/lobby`;
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

  async function duplicateQuiz(quiz: Quiz) {
    setBusyQuizId(quiz.id);
    setError("");
    const response = await fetch(`/api/quizzes/${quiz.id}/duplicate`, { method: "POST" });
    const result = await response.json().catch(() => null);
    setBusyQuizId(null);
    if (!response.ok) {
      setError(result?.error ?? "Quiz konnte nicht dupliziert werden.");
      return;
    }
    setQuizzes((items) => [result, ...items]);
  }

  async function archiveQuiz(quiz: Quiz, isArchived: boolean) {
    if (isArchived && !window.confirm(`"${quiz.title}" wirklich archivieren?`)) return;
    setBusyQuizId(quiz.id);
    setError("");
    const response = await fetch(`/api/quizzes/${quiz.id}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived })
    });
    const result = await response.json().catch(() => null);
    setBusyQuizId(null);
    if (!response.ok) {
      setError(result?.error ?? "Status konnte nicht geändert werden.");
      return;
    }
    setQuizzes((items) => items.map((item) => (item.id === result.id ? result : item)));
    if (previewQuiz?.id === result.id) setPreviewQuiz(result);
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Quizze</h1>
          <p className="mt-2 text-white/70">Suchen, prüfen, duplizieren und erst aus der Vorschau starten.</p>
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

      <section className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-show-panel/80 p-4 xl:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
          <input className="rounded border border-white/15 bg-white/10 px-3 py-3" placeholder="Quiz suchen" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="rounded border border-white/15 bg-white/10 px-3 py-3" value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className="rounded border border-white/15 bg-white/10 px-3 py-3" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="active">Aktiv</option>
            <option value="archived">Archiviert</option>
            <option value="all">Alle Status</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <input className="min-w-56 rounded border border-white/15 bg-white/10 px-3 py-3" placeholder="Neue Kategorie" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} />
          <button className="rounded border border-white/20 px-4 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={createCategory} type="button">
            Kategorie anlegen
          </button>
        </div>
      </section>

      {error && <p className="mt-4 rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleQuizzes.map((quiz) => (
          <Panel key={quiz.id} className={quiz.isArchived ? "opacity-75" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{quiz.title}</h2>
                <p className="mt-2 min-h-12 text-white/70">{quiz.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded border border-show-gold/30 bg-show-gold/10 px-3 py-2 text-xs font-black uppercase text-show-gold">{quiz.category?.name ?? "Ohne Kategorie"}</span>
                {quiz.isArchived && <span className="rounded border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase text-white/65">Archiviert</span>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-white/70">
              <span>{quiz.questions.length} Fragen</span>
              <span>Ø {averageQuestionTime(quiz)} Sekunden</span>
              <span>{hasMedia(quiz) ? "Medien vorhanden" : "Ohne Medien"}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton disabled={quiz.isArchived} onClick={() => setPreviewQuiz(quiz)}>
                Vorschau
              </PrimaryButton>
              <Link className="rounded border border-white/20 px-4 py-2.5 font-bold" href={`/quizzes/${quiz.id}/edit`}>
                Bearbeiten
              </Link>
              <button className="rounded border border-white/20 px-4 py-2.5 font-bold hover:border-show-gold hover:text-show-gold" disabled={busyQuizId === quiz.id} onClick={() => duplicateQuiz(quiz)} type="button">
                Duplizieren
              </button>
              <button className="rounded border border-white/20 px-4 py-2.5 font-bold hover:border-show-gold hover:text-show-gold" disabled={busyQuizId === quiz.id} onClick={() => archiveQuiz(quiz, !quiz.isArchived)} type="button">
                {quiz.isArchived ? "Wiederherstellen" : "Archivieren"}
              </button>
            </div>
          </Panel>
        ))}
      </div>

      {visibleQuizzes.length === 0 && (
        <Panel className="mt-6">
          <h2 className="text-2xl font-black">Keine passenden Quizze gefunden</h2>
          <p className="mt-2 text-white/70">Passe Suche oder Filter an, oder lege ein neues Quiz an.</p>
        </Panel>
      )}

      {previewQuiz && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
          <section className="max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-lg border border-show-gold/40 bg-show-panel p-5 shadow-glow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-show-gold">Quiz-Vorschau</p>
                <h2 className="mt-2 text-3xl font-black">{previewQuiz.title}</h2>
                <p className="mt-2 text-white/70">{previewQuiz.description}</p>
              </div>
              <button className="rounded border border-white/20 px-4 py-2 font-bold" onClick={() => setPreviewQuiz(null)} type="button">
                Schließen
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-black uppercase text-white/45">Kategorie</p>
                <p className="mt-1 font-black">{previewQuiz.category?.name ?? "Ohne Kategorie"}</p>
              </div>
              <div className="rounded border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-black uppercase text-white/45">Fragen</p>
                <p className="mt-1 font-black">{previewQuiz.questions.length}</p>
              </div>
              <div className="rounded border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-black uppercase text-white/45">Fragedauer</p>
                <p className="mt-1 font-black">Ø {averageQuestionTime(previewQuiz)} s</p>
              </div>
              <div className="rounded border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-black uppercase text-white/45">Medien</p>
                <p className="mt-1 font-black">{hasMedia(previewQuiz) ? "Ja" : "Nein"}</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-black uppercase text-show-gold">Spielmodus</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { value: "classic", label: "Classic", text: "Normales Quiz mit Einzelwertung." },
                  { value: "team_battle", label: "Team Battle", text: "Teilnehmer werden automatisch Teams zugeordnet." },
                  { value: "knockout", label: "K.O.-Modus", text: "Falsche oder fehlende Antwort scheidet aus." },
                  { value: "survival", label: "Überleben", text: "Drei Leben, falsche oder fehlende Antwort kostet eins." }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    className={gameMode === mode.value ? "rounded border border-show-gold bg-show-gold/15 p-3 text-left shadow-glow" : "rounded border border-white/10 bg-white/5 p-3 text-left hover:border-show-gold/60"}
                    onClick={() => setGameMode(mode.value as GameMode)}
                    type="button"
                  >
                    <span className="font-black text-show-gold">{mode.label}</span>
                    <span className="mt-1 block text-sm font-semibold text-white/65">{mode.text}</span>
                  </button>
                ))}
              </div>
              {gameMode === "team_battle" && (
                <label className="mt-4 block text-sm font-bold text-white/70">
                  Anzahl Teams
                  <input className="mt-2 w-32 rounded border border-white/15 bg-white/10 px-3 py-2 font-black text-white" min={2} max={4} type="number" value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))} />
                </label>
              )}
            </div>
            <div className="mt-5 space-y-2">
              {previewQuiz.questions.slice(0, 8).map((question, index) => (
                <div key={question.id ?? index} className="rounded border border-white/10 bg-white/5 px-3 py-2">
                  <p className="font-bold">
                    {index + 1}. {question.questionText}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {question.timeLimitSeconds}s · Antwort {question.correctAnswer} · {question.mediaUrl ? "mit Medium" : "ohne Medium"}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryButton disabled={previewQuiz.isArchived} onClick={() => startSession(previewQuiz)}>
                Quiz starten
              </PrimaryButton>
              <Link className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" href={`/quizzes/${previewQuiz.id}/edit`}>
                Bearbeiten
              </Link>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

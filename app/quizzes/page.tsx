"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Quiz } from "@/types/domain";
import { AppShell } from "@/components/layout/AppShell";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Panel } from "@/components/ui/Panel";

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
  }, [router]);

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

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black">Quizze</h1>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded border border-white/20 px-5 py-3 font-black hover:border-show-gold hover:text-show-gold" href="/quizzes/import">
            Import
          </Link>
          <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy" href="/quizzes/new">
            Neu
          </Link>
        </div>
      </div>
      {error && <p className="mt-4 rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <Panel key={quiz.id}>
            <h2 className="text-2xl font-black">{quiz.title}</h2>
            <p className="mt-2 min-h-12 text-white/70">{quiz.description}</p>
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
    </AppShell>
  );
}

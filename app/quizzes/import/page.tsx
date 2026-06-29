"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { QuizCategory } from "@/types/domain";

type ImportReportItem = {
  fileName: string;
  status: "ready" | "imported" | "skipped" | "error";
  quizName?: string;
  importedQuestions: number;
  skippedQuestions: number;
  warnings: string[];
  error?: string;
};

type ImportResponse = {
  mode: "preview" | "import";
  importedCount: number;
  readyCount: number;
  reports: ImportReportItem[];
  createdQuizIds: string[];
};

export default function QuizImportPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [replaceDuplicates, setReplaceDuplicates] = useState(false);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResponse | null>(null);

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

  const reportSummary = useMemo(() => {
    if (!result) return null;
    return {
      success: result.reports.filter((item) => item.status === "imported").length,
      ready: result.reports.filter((item) => item.status === "ready").length,
      failed: result.reports.filter((item) => item.status === "error").length,
      skipped: result.reports.filter((item) => item.status === "skipped").length
    };
  }, [result]);

  async function send(mode: "preview" | "import") {
    if (files.length === 0) {
      setError("Bitte zuerst mindestens eine Word- oder Excel-Datei auswählen.");
      return null;
    }

    setBusy(true);
    setError("");
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    formData.set("title", title);
    formData.set("categoryId", categoryId);
    formData.set("categoryName", categoryName);
    formData.set("replaceDuplicates", String(replaceDuplicates));
    formData.set("mode", mode);

    const response = await fetch("/api/quizzes/import", { method: "POST", body: formData });
    const payload = (await response.json().catch(() => null)) as ImportResponse | { error?: string } | null;
    setBusy(false);

    if (!response.ok) {
      setError(payload && "error" in payload ? payload.error ?? "Import fehlgeschlagen." : "Import fehlgeschlagen.");
      return null;
    }

    return payload as ImportResponse;
  }

  async function previewImport() {
    const payload = await send("preview");
    if (!payload) return;
    setResult(payload);
    setStep(2);
  }

  async function runImport() {
    const payload = await send("import");
    if (!payload) return;
    setResult(payload);
    setStep(3);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Quiz importieren</h1>
            <p className="mt-3 text-white/70">Mehrere Word- und Excel-Dateien prüfen, als Vorschau laden und danach gesammelt importieren.</p>
          </div>
          <div className="flex gap-2 text-sm font-bold">
            {[1, 2, 3].map((current) => (
              <div key={current} className={step === current ? "rounded border border-show-gold bg-show-gold px-4 py-2 text-show-navy" : "rounded border border-white/15 bg-white/5 px-4 py-2 text-white/70"}>
                Schritt {current}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel>
            <h2 className="text-2xl font-black text-show-gold">1. Dateien wählen</h2>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-white/70">Quiztitel optional überschreiben</span>
                <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nur sinnvoll bei genau einer Datei" />
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
                <span className="text-sm font-bold text-white/70">Dateien</span>
                <input
                  className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3 text-white file:mr-4 file:rounded file:border-0 file:bg-show-gold file:px-4 file:py-2 file:font-black file:text-show-navy"
                  type="file"
                  accept=".docx,.xlsx,.xls,.csv"
                  multiple
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                />
              </label>

              <label className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white/75">
                <input checked={replaceDuplicates} onChange={(event) => setReplaceDuplicates(event.target.checked)} type="checkbox" />
                Bestehende Quizze mit gleichem Titel ersetzen
              </label>

              {files.length > 0 && (
                <div className="rounded border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-black uppercase text-show-gold">Auswahl</p>
                  <div className="mt-3 space-y-2 text-sm text-white/80">
                    {files.map((file) => (
                      <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-black/20 px-3 py-2">
                        <span className="truncate">{file.name}</span>
                        <span className="whitespace-nowrap text-white/50">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}

              <div className="flex flex-wrap gap-3">
                <PrimaryButton className="min-w-56" disabled={busy || files.length === 0} onClick={previewImport} type="button">
                  {busy ? "Prüfung läuft..." : "2. Vorschau laden"}
                </PrimaryButton>
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="text-2xl font-black text-show-gold">Format-Hinweise</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/75">
              <p>Word-Format: Frageblöcke mit `Frage 1`, Antworten A bis D und `Richtige Antwort`.</p>
              <p>Excel-Format: Spalten wie `Quiztitel`, `Kategorie`, `Thema`, `ZeitlimitSek`, `Frage`, `Antwort A` bis `Antwort D`, `Richtige Antwort`, `Erklärung`.</p>
              <p>Eine Master-Datei mit mehreren Quizzen wird automatisch nach `Quiztitel` getrennt.</p>
              <p>Fehler in einer Datei stoppen den Rest nicht. Jede Datei erscheint separat im Bericht.</p>
            </div>
          </Panel>
        </div>

        {result && (
          <Panel className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-show-gold">{step === 2 ? "2. Vorschau" : "3. Importbericht"}</h2>
                {reportSummary && (
                  <p className="mt-2 text-white/70">
                    {step === 2 ? `${reportSummary.ready} Einträge bereit` : `${reportSummary.success} importiert, ${reportSummary.skipped} übersprungen, ${reportSummary.failed} mit Fehler`}
                  </p>
                )}
              </div>
              {step === 2 && (
                <PrimaryButton disabled={busy} onClick={runImport} type="button">
                  {busy ? "Import läuft..." : "3. Import bestätigen"}
                </PrimaryButton>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {result.reports.map((item, index) => (
                <div key={`${item.fileName}-${item.quizName ?? index}`} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{item.quizName ?? item.fileName}</p>
                      <p className="text-sm text-white/60">{item.fileName}</p>
                    </div>
                    <div className={item.status === "error" ? "rounded border border-show-red/30 bg-show-red/10 px-3 py-2 text-sm font-black text-show-red" : item.status === "skipped" ? "rounded border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-white/75" : "rounded border border-show-gold/30 bg-show-gold/10 px-3 py-2 text-sm font-black text-show-gold"}>
                      {item.status === "ready" ? "Bereit" : item.status === "imported" ? "Importiert" : item.status === "skipped" ? "Übersprungen" : "Fehler"}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-white/75">Fragen: {item.importedQuestions}</div>
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-white/75">Übersprungen: {item.skippedQuestions}</div>
                    <div className="rounded border border-white/10 bg-black/20 px-3 py-2 text-white/75">Warnungen: {item.warnings.length}</div>
                  </div>
                  {item.warnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {item.warnings.map((warning) => (
                        <p key={warning} className="rounded border border-show-gold/20 bg-show-gold/5 px-3 py-2 text-sm font-semibold text-show-gold">
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}
                  {item.error && <p className="mt-3 rounded border border-show-red/30 bg-show-red/10 px-3 py-2 text-sm font-bold text-show-red">{item.error}</p>}
                </div>
              ))}
            </div>

            {step === 3 && result.createdQuizIds.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                <PrimaryButton onClick={() => router.push("/quizzes")} type="button">
                  Zu den Quizzen
                </PrimaryButton>
                <button className="rounded border border-white/20 px-5 py-3 font-bold hover:border-show-gold hover:text-show-gold" onClick={() => router.push(`/quizzes/${result.createdQuizIds[0]}/edit`)} type="button">
                  Erstes importiertes Quiz öffnen
                </button>
              </div>
            )}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ResultTable } from "@/components/quiz/ResultTable";
import { WinnerPodium } from "@/components/quiz/WinnerPodium";
import { getSessionBundle } from "@/features/sessions/store";

export default async function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) notFound();

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black">Endergebnis</h1>
        <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy" href={`/api/results/${sessionId}/export.csv`}>
          CSV exportieren
        </Link>
      </div>
      <div className="mt-6">
        <WinnerPodium rows={bundle.leaderboard} />
      </div>
      <div className="mt-6">
        <ResultTable rows={bundle.leaderboard} />
      </div>
    </AppShell>
  );
}

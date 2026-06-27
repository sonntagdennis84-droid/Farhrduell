import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { ResultTable } from "@/components/quiz/ResultTable";
import { getSessionBundle } from "@/features/sessions/store";

export default async function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) notFound();
  const top = bundle.leaderboard.slice(0, 3);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black">Endergebnis</h1>
        <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy" href={`/api/results/${sessionId}/export.csv`}>
          CSV exportieren
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {top.map((row) => (
          <Panel key={row.id} className={row.rank === 1 ? "border-show-gold shadow-glow" : ""}>
            <div className="text-5xl font-black text-show-gold">#{row.rank}</div>
            <div className="mt-3 text-2xl font-black">{row.displayName}</div>
            <div className="mt-2 text-xl font-bold">{row.totalPoints} Punkte</div>
          </Panel>
        ))}
      </div>
      <div className="mt-6">
        <ResultTable rows={bundle.leaderboard} />
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ResultTable } from "@/components/quiz/ResultTable";
import { TeamLeaderboard } from "@/components/quiz/TeamLeaderboard";
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
      {bundle.session.gameMode === "team_battle" && bundle.teamLeaderboard.length > 0 && (
        <div className="mt-6 rounded-lg border border-show-gold/30 bg-show-panel/90 p-5">
          <h2 className="mb-3 text-2xl font-black text-show-gold">Team-Endwertung</h2>
          <TeamLeaderboard rows={bundle.teamLeaderboard} />
        </div>
      )}
      <div className="mt-6">
        <ResultTable rows={bundle.leaderboard} />
      </div>
    </AppShell>
  );
}

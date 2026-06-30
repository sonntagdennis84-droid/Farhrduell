import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FinaleStats } from "@/components/quiz/FinaleStats";
import { ResultTable } from "@/components/quiz/ResultTable";
import { TeamFinaleSpotlight } from "@/components/quiz/TeamFinaleSpotlight";
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
      {bundle.session.gameMode === "team_battle" && bundle.teamLeaderboard.length > 0 && (
        <div className="mt-6">
          <TeamFinaleSpotlight teams={bundle.teamLeaderboard} topPlayer={bundle.leaderboard[0]} />
        </div>
      )}
      <div className="mt-6">
        <WinnerPodium rows={bundle.leaderboard} title={bundle.session.gameMode === "team_battle" ? "Bester Einzelspieler" : "Glückwunsch!"} subtitle={bundle.session.gameMode === "team_battle" ? "Nach dem Team-Sieg kommt der stärkste Einzelauftritt." : "Hier sind die Gewinner."} />
      </div>
      <FinaleStats rows={bundle.leaderboard} answers={bundle.answers} questions={bundle.quiz.questions} />
      <div className="mt-6">
        <ResultTable rows={bundle.leaderboard} />
      </div>
    </AppShell>
  );
}

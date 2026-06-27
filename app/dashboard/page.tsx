import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { listQuizzes } from "@/features/sessions/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const quizzes = await listQuizzes();
  return (
    <AppShell>
      <h1 className="text-4xl font-black">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/quizzes/new">
          <Panel className="h-full hover:border-show-gold">
            <h2 className="text-xl font-black text-show-gold">Quiz erstellen</h2>
            <p className="mt-2 text-white/70">Fragen, Antworten und Zeitlimit pflegen.</p>
          </Panel>
        </Link>
        <Link href="/quizzes">
          <Panel className="h-full hover:border-show-gold">
            <h2 className="text-xl font-black text-show-gold">Quiz starten</h2>
            <p className="mt-2 text-white/70">{quizzes.length} Quiz verfügbar.</p>
          </Panel>
        </Link>
        <Panel>
          <h2 className="text-xl font-black text-show-gold">Ergebnisse</h2>
          <p className="mt-2 text-white/70">Endranglisten und CSV-Export nach jeder Session.</p>
        </Panel>
      </div>
    </AppShell>
  );
}

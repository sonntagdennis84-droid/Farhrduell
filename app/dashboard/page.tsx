import { AppShell } from "@/components/layout/AppShell";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getActiveSessionForCurrentUser, listQuizzes } from "@/features/sessions/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [quizzes, active] = await Promise.all([listQuizzes(), getActiveSessionForCurrentUser()]);

  return (
    <AppShell>
      <DashboardClient
        quizzes={quizzes}
        activeSession={
          active
            ? {
                sessionId: active.session.id,
                quizTitle: active.quizTitle,
                participantCount: active.participantCount,
                remoteUrl: `/host/${active.session.id}/remote?app=1`
              }
            : null
        }
      />
    </AppShell>
  );
}

import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { QuizEditor } from "@/components/quiz/QuizEditor";
import { requireCurrentUser } from "@/features/auth/users";

export default async function NewQuizPage() {
  const user = await requireCurrentUser();

  return (
    <AppShell>
      <h1 className="text-4xl font-black">Quiz erstellen</h1>
      <Panel className="mt-6">
        <QuizEditor aiLabsEnabled={user.role === "ADMIN"} />
      </Panel>
    </AppShell>
  );
}

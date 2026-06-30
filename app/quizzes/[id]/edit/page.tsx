import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { QuizEditor } from "@/components/quiz/QuizEditor";
import { requireCurrentUser } from "@/features/auth/users";
import { getQuiz } from "@/features/sessions/store";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const quiz = await getQuiz(id);
  if (!quiz) notFound();

  return (
    <AppShell>
      <h1 className="text-4xl font-black">Quiz bearbeiten</h1>
      <Panel className="mt-6">
        <QuizEditor quiz={quiz} aiLabsEnabled={user.role === "ADMIN"} />
      </Panel>
    </AppShell>
  );
}

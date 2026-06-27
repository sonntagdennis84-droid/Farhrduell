import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { QuizEditor } from "@/components/quiz/QuizEditor";

export default function NewQuizPage() {
  return (
    <AppShell>
      <h1 className="text-4xl font-black">Quiz erstellen</h1>
      <Panel className="mt-6">
        <QuizEditor />
      </Panel>
    </AppShell>
  );
}

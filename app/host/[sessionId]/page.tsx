import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSessionBundle } from "@/features/sessions/store";
import { HostClient } from "./HostClient";

export default async function HostPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) notFound();
  return (
    <AppShell>
      <HostClient initialBundle={bundle} />
    </AppShell>
  );
}

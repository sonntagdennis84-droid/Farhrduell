import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSessionBundle } from "@/features/sessions/store";
import { getJoinBaseUrl } from "@/lib/base-url";
import { createJoinQrCode } from "@/lib/qrcode";
import { LobbyClient } from "./LobbyClient";

export default async function LobbyPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) notFound();
  const baseUrl = await getJoinBaseUrl();
  const joinUrl = `${baseUrl}/join/${bundle.session.joinCode}`;
  const qrCode = await createJoinQrCode(joinUrl);

  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-black">Lobby</h1>
      <LobbyClient initialSession={bundle.session} initialParticipants={bundle.participants} qrCode={qrCode} joinUrl={joinUrl} />
    </AppShell>
  );
}

import { notFound } from "next/navigation";
import { getSessionBundle } from "@/features/sessions/store";
import { HostRemoteClient } from "./HostRemoteClient";

export default async function HostRemotePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) notFound();
  return <HostRemoteClient initialBundle={bundle} />;
}

import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default function ProfilePage() {
  return (
    <AppShell>
      <h1 className="text-4xl font-black">Profil</h1>
      <Panel className="mt-6">
        <ProfileClient />
      </Panel>
    </AppShell>
  );
}

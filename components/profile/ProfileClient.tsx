"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/types/domain";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moderators, setModerators] = useState<UserProfile[]>([]);
  const [name, setName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [moderatorName, setModeratorName] = useState("");
  const [moderatorEmail, setModeratorEmail] = useState("");
  const [moderatorPassword, setModeratorPassword] = useState("");
  const [moderatorImageUrl, setModeratorImageUrl] = useState("");
  const [accountRole, setAccountRole] = useState<"ADMIN" | "INSTRUCTOR">("INSTRUCTOR");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);
        setName(data.name ?? "");
        setProfileImageUrl(data.profileImageUrl ?? "");
      })
      .catch(() => setError("Profil konnte nicht geladen werden."));
  }, []);

  useEffect(() => {
    if (profile?.role !== "ADMIN") return;
    fetch("/api/moderators")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setModerators(data);
      })
      .catch(() => undefined);
  }, [profile?.role]);

  async function uploadImage(file?: File | null, target: "profile" | "moderator" = "profile") {
    if (!file) return;
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/uploads/profile-image", { method: "POST", body: formData });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? "Bild konnte nicht hochgeladen werden.");
      return;
    }
    if (target === "profile") setProfileImageUrl(result.profileImageUrl ?? "");
    else setModeratorImageUrl(result.profileImageUrl ?? "");
  }

  async function saveProfile() {
    setBusy(true);
    setError("");
    setSuccess("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, profileImageUrl })
    });
    const result = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) {
      setError(result?.error ?? "Profil konnte nicht gespeichert werden.");
      return;
    }
    setProfile(result);
    setSuccess("Profil wurde gespeichert.");
  }

  async function createModerator() {
    setBusy(true);
    setError("");
    setSuccess("");
    const response = await fetch("/api/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: moderatorName,
        email: moderatorEmail,
        password: moderatorPassword,
        profileImageUrl: moderatorImageUrl,
        role: accountRole
      })
    });
    const result = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) {
      setError(result?.error ?? "Moderator konnte nicht erstellt werden.");
      return;
    }
    setModerators((items) => [...items, result]);
    setModeratorName("");
    setModeratorEmail("");
    setModeratorPassword("");
    setModeratorImageUrl("");
    setAccountRole("INSTRUCTOR");
    setSuccess("Moderator wurde angelegt.");
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          {profileImageUrl ? (
            <img className="aspect-square w-full rounded-lg object-cover" src={profileImageUrl} alt="Profilbild" />
          ) : (
            <div className="grid aspect-square w-full place-items-center rounded-lg border border-dashed border-white/15 text-sm font-bold text-white/45">Kein Profilbild</div>
          )}
          <label className="mt-4 block">
            <span className="text-sm font-bold text-white/70">Profilbild</span>
            <input
              className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-show-gold file:px-3 file:py-2 file:font-black file:text-show-navy"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => uploadImage(event.target.files?.[0], "profile")}
            />
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase text-show-gold">Mein Konto</p>
            <h2 className="mt-1 text-2xl font-black">{profile?.email ?? "Wird geladen..."}</h2>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-white/70">Name</span>
            <input className="mt-1 w-full rounded border border-white/15 bg-white/10 px-3 py-3" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="rounded border border-white/10 bg-white/5 p-4 text-sm font-semibold text-white/70">
            Rolle: <span className="text-white">{profile?.role === "ADMIN" ? "Admin" : "Moderator"}</span>
          </div>
          <PrimaryButton disabled={busy} onClick={saveProfile}>
            {busy ? "Speichert..." : "Profil speichern"}
          </PrimaryButton>
        </div>
      </section>

      {profile?.role === "ADMIN" && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-sm font-black uppercase text-show-gold">Moderatoren</p>
              <h2 className="mt-1 text-2xl font-black">Neues Konto anlegen</h2>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Name</span>
              <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={moderatorName} onChange={(event) => setModeratorName(event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">E-Mail</span>
              <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={moderatorEmail} onChange={(event) => setModeratorEmail(event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Passwort</span>
              <input className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" type="password" value={moderatorPassword} onChange={(event) => setModeratorPassword(event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Rolle</span>
              <select className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-3" value={accountRole} onChange={(event) => setAccountRole(event.target.value as "ADMIN" | "INSTRUCTOR")}>
                <option value="INSTRUCTOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-white/70">Profilbild</span>
              <input
                className="mt-1 w-full rounded border border-white/15 bg-show-panel px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-show-gold file:px-3 file:py-2 file:font-black file:text-show-navy"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => uploadImage(event.target.files?.[0], "moderator")}
              />
            </label>
            {moderatorImageUrl && <img className="h-24 w-24 rounded-lg object-cover" src={moderatorImageUrl} alt="Vorschau Moderator" />}
            <PrimaryButton disabled={busy} onClick={createModerator}>
              {busy ? "Speichert..." : "Konto erstellen"}
            </PrimaryButton>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-black uppercase text-show-gold">Übersicht</p>
            <h2 className="mt-1 text-2xl font-black">Vorhandene Konten</h2>
            <div className="mt-4 space-y-3">
              {moderators.map((user) => (
                <div key={user.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  {user.profileImageUrl ? (
                    <img className="h-14 w-14 rounded-lg object-cover" src={user.profileImageUrl} alt={user.name} />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-lg border border-dashed border-white/15 text-xs font-bold text-white/40">Bild</div>
                  )}
                  <div>
                    <div className="font-black">{user.name}</div>
                    <div className="text-sm text-white/65">{user.email}</div>
                  </div>
                  <div className="rounded border border-white/10 px-3 py-2 text-xs font-black uppercase text-show-gold">{user.role === "ADMIN" ? "Admin" : "Moderator"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {error && <p className="rounded border border-show-red/30 bg-show-red/10 p-3 font-bold text-show-red">{error}</p>}
      {success && <p className="rounded border border-show-gold/30 bg-show-gold/10 p-3 font-bold text-show-gold">{success}</p>}
    </div>
  );
}

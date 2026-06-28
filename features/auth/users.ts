import bcrypt from "bcryptjs";
import type { UserProfile } from "@/types/domain";
import { getCurrentUserId } from "@/features/auth/session";
import { prisma } from "@/lib/prisma";

function toUserProfile(user: any): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImageUrl: user.profileImageUrl ?? null,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt
  };
}

export async function requireCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Login erforderlich");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Benutzer nicht gefunden");
  return user;
}

export async function getCurrentUserProfile() {
  const user = await requireCurrentUser();
  return toUserProfile(user);
}

export async function updateCurrentUserProfile(input: { name?: string; profileImageUrl?: string | null }) {
  const user = await requireCurrentUser();
  const name = input.name?.trim();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name ? { name } : {}),
      ...(input.profileImageUrl !== undefined ? { profileImageUrl: input.profileImageUrl } : {})
    }
  });
  return toUserProfile(updated);
}

export async function listModerators() {
  const current = await requireCurrentUser();
  if (current.role !== "ADMIN") throw new Error("Nur Admins dürfen Moderatoren verwalten.");
  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }]
  });
  return users.map(toUserProfile);
}

export async function createModerator(input: { name: string; email: string; password: string; profileImageUrl?: string | null; role?: "ADMIN" | "INSTRUCTOR" }) {
  const current = await requireCurrentUser();
  if (current.role !== "ADMIN") throw new Error("Nur Admins dürfen Moderatoren anlegen.");

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role === "ADMIN" ? "ADMIN" : "INSTRUCTOR";

  if (!name) throw new Error("Bitte einen Namen eingeben.");
  if (!email) throw new Error("Bitte eine E-Mail-Adresse eingeben.");
  if (password.length < 8) throw new Error("Das Passwort muss mindestens 8 Zeichen haben.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Diese E-Mail-Adresse ist bereits vergeben.");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      profileImageUrl: input.profileImageUrl ?? null
    }
  });

  return toUserProfile(user);
}

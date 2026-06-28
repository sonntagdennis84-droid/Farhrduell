import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/features/auth/session";
import { LoginClient } from "@/app/login/LoginClient";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const userId = await getCurrentUserId();
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  const appMode = typeof params.app === "string" && params.app === "1";
  const suggestedEmail = typeof params.email === "string" ? params.email : process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL ?? "";

  if (userId) {
    redirect(next && next.startsWith("/") ? next : "/dashboard");
  }

  return <LoginClient config={{ appMode, suggestedEmail }} />;
}

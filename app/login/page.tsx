import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  const app = params.app === "1" ? "app=1" : "";
  const query = new URLSearchParams();
  if (next) query.set("next", next);
  if (app) query.set("app", "1");
  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/${suffix}`);
}

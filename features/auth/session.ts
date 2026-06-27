import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth-token";

export const AUTH_COOKIE = "fahrduell_user";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  return verifyAuthToken(cookieStore.get(AUTH_COOKIE)?.value);
}

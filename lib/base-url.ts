import { networkInterfaces } from "node:os";
import { headers } from "next/headers";
import { isProduction, requireProductionUrl } from "@/lib/env";

function getLocalNetworkHost() {
  const networks = networkInterfaces();
  for (const entries of Object.values(networks)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal && !entry.address.startsWith("169.254.")) {
        return entry.address;
      }
    }
  }
  return null;
}

export async function getJoinBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return requireProductionUrl("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.APP_URL) {
    return requireProductionUrl("APP_URL", process.env.APP_URL);
  }

  if (isProduction()) {
    throw new Error("NEXT_PUBLIC_APP_URL or APP_URL is required in production.");
  }

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const [hostname, port] = host.split(":");
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const networkHost = isLocalHost ? getLocalNetworkHost() : null;
  const resolvedHost = networkHost ? `${networkHost}${port ? `:${port}` : ""}` : host;

  return `${protocol}://${resolvedHost}`;
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isLocalUrl(value: string) {
  try {
    const url = new URL(value);
    return localHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export function requireProductionUrl(name: string, value: string) {
  if (isProduction() && isLocalUrl(value)) {
    throw new Error(`${name} must not point to localhost in production.`);
  }
  return value.replace(/\/$/, "");
}

export function getAllowedOrigins() {
  const configured = process.env.SOCKET_CORS_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "";
  return configured
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isDemoLoginAllowed() {
  return false;
}

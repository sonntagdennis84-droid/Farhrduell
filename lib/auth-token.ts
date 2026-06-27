const encoder = new TextEncoder();

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production.");
  return "development-only-auth-secret";
}

export async function createAuthToken(userId: string) {
  const payload = base64UrlEncode(userId);
  const signature = await crypto.subtle.sign("HMAC", await signingKey(authSecret()), encoder.encode(payload));
  return `${payload}.${base64UrlEncode(signature)}`;
}

export async function verifyAuthToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const ok = await crypto.subtle.verify(
    "HMAC",
    await signingKey(authSecret()),
    Uint8Array.from(atob(signature.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(signature.length / 4) * 4, "=")), (char) => char.charCodeAt(0)),
    encoder.encode(payload)
  );
  return ok ? base64UrlDecode(payload) : null;
}

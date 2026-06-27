const baseUrl = (process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.SMOKE_ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL;
const password = process.env.SMOKE_ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD;

const failures = [];

function fail(label, detail) {
  failures.push({ label, detail });
  console.error(`FAIL ${label}: ${detail}`);
}

function pass(label) {
  console.log(`PASS ${label}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { response, data, text };
}

function cookieFrom(response) {
  const cookie = response.headers.get("set-cookie");
  return cookie ? cookie.split(";")[0] : "";
}

console.log(`Smoke target: ${baseUrl}`);

try {
  const { response, data } = await request("/api/health");
  if (response.ok && data?.ok === true) pass("health");
  else fail("health", `status=${response.status}`);
} catch (error) {
  fail("health", error.message);
}

try {
  const { response, data } = await request("/api/auth/config");
  if (response.ok && typeof data?.demoLoginEnabled === "boolean") pass("auth config");
  else if (response.status === 404) console.warn("WARN auth config: endpoint not deployed yet.");
  else fail("auth config", `status=${response.status}`);
} catch (error) {
  fail("auth config", error.message);
}

try {
  const { response } = await request("/dashboard");
  if ([301, 302, 303, 307, 308].includes(response.status)) pass("protected dashboard redirects");
  else fail("protected dashboard redirects", `status=${response.status}`);
} catch (error) {
  fail("protected dashboard redirects", error.message);
}

if (email && password) {
  let cookie = "";
  try {
    const { response, data } = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    cookie = cookieFrom(response);
    if (response.ok && cookie) pass("admin login");
    else fail("admin login", `status=${response.status} body=${JSON.stringify(data)}`);
  } catch (error) {
    fail("admin login", error.message);
  }

  if (cookie) {
    try {
      const { response, data } = await request("/api/quizzes", { headers: { Cookie: cookie } });
      if (response.ok && Array.isArray(data) && data.length > 0) pass(`quiz list (${data.length})`);
      else fail("quiz list", `status=${response.status} count=${Array.isArray(data) ? data.length : "n/a"}`);

      const firstQuiz = Array.isArray(data) ? data[0] : null;
      if (firstQuiz?.id) {
        const { response: sessionResponse, data: session } = await request("/api/sessions", {
          method: "POST",
          headers: { Cookie: cookie },
          body: JSON.stringify({ quizId: firstQuiz.id })
        });
        if (sessionResponse.ok && session?.joinCode) {
          pass("session create");
          const { response: lobbyResponse, text } = await request(`/sessions/${session.id}/lobby`, { headers: { Cookie: cookie } });
          const localUrlFound = /localhost|127\.0\.0\.1/.test(text);
          if (lobbyResponse.ok && !localUrlFound) pass("lobby and QR URL no localhost");
          else fail("lobby and QR URL no localhost", `status=${lobbyResponse.status} localUrlFound=${localUrlFound}`);
        } else {
          fail("session create", `status=${sessionResponse.status}`);
        }
      }
    } catch (error) {
      fail("authenticated flow", error.message);
    }
  }
} else {
  console.log("SKIP authenticated flow: set SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD.");
}

if (failures.length > 0) {
  console.error(`Smoke failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("Smoke passed.");

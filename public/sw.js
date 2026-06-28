self.addEventListener("install", (event) => {
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("fahrduell-static-v3").then((cache) =>
      cache.addAll(["/", "/login", "/manifest.webmanifest", "/icons/fahrduell.svg"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isStaticAsset = url.origin === self.location.origin && (url.pathname.startsWith("/icons/") || url.pathname === "/" || url.pathname === "/login" || url.pathname === "/manifest.webmanifest");
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open("fahrduell-static-v3").then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});

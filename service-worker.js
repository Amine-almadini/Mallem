const CACHE_NAME = "mallem-offline-v6";
const STATIC_CACHE = ["./index.html", "./icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/);

  if (event.request.mode === "navigate" || isAsset) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("./index.html");
        if (url.pathname === "/icon.png") return caches.match("./icon.png");
        return Response.error();
      }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => Response.error());
    })
  );
});

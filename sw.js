const CACHE_NAME = "privatchat-v1";
const FILES_TO_CACHE = ["index.html", "manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Firebase-Anfragen immer live laden, nur eigene Dateien cachen
  if (event.request.url.includes("firebaseio") || event.request.url.includes("googleapis")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});

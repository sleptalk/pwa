const CACHE_NAME = "v1_cache_panel_adm",
  urlsToCache = [
    "https://script.google.com/macros/s/AKfycbxw0NjO6hogbu5GiluKiiG97KBVpS7b1uqhYsH0q-sVFf2kpreOXJa-_k78W7XV3ukKxw/exec",
    "./manifest.json",
  ];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).then(() => self.skipWaiting());
      })
      .catch((err) => "fallo el registro del cache ", err)
  );
});

self.addEventListener("activate", (e) => {
  const caheWitheList = [CACHE_NAME];

  e.waitUntil(
    caches.keys().then((cachesNames) =>
      cachesNames.map((cacheName) => {
        if (cacheName.indexOf(cacheName) === -1) {
          return caches.delete(cacheName);
        }
      })
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        return res;
      }
      return fetch(e.request);
    })
  );
});

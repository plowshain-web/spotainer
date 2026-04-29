const CACHE_VERSION = "spotainer-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Supabase 데이터를 캐시하지 않기 위해 네트워크 요청을 그대로 통과시킵니다.
// Chrome PWA 설치 조건을 만족시키기 위한 최소 fetch handler입니다.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

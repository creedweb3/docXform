/* global self, caches */
/**
 * Cache-first for same-origin heavy LibreOffice binaries so repeat visits survive
 * flaky HTTP disk cache. Only full GET (no Range); immutable URLs include /wasm/bin/<rev>/.
 */
const CACHE_NAME = 'docxform-wasm-v1';

function isWasmBinaryRequest(url) {
  if (url.pathname === '/wasm/soffice.wasm' || url.pathname === '/wasm/soffice.data') return true;
  return /^\/wasm\/bin\/[^/]+\/soffice\.(wasm|data)$/.test(url.pathname);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('docxform-wasm-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (!isWasmBinaryRequest(url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;

      const res = await fetch(req);
      if (res.ok && res.status === 200) {
        event.waitUntil(cache.put(req, res.clone()));
      }
      return res;
    })()
  );
});

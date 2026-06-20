import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Changes on every Vercel deploy → the browser detects a new service worker,
// purges old caches and refreshes the installed app automatically.
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  "dev";

function swSource(version: string): string {
  return `
const VERSION = ${JSON.stringify(version)};
const CACHE = "misgastos-" + VERSION;
const PRECACHE = ["/icon-192.png", "/icon-512.png", "/maskable-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // only same-origin
  if (url.pathname.startsWith("/api/")) return;       // never cache API (data/auth)

  // Navigations: network-first (fresh when online), cache as offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Hashed static assets: cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        const cacheable = res.ok && (url.pathname.startsWith("/_next/") || /\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|css|js)$/.test(url.pathname));
        if (cacheable) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); }
        return res;
      }).catch(() => cached);
    })
  );
});
`;
}

export async function GET() {
  return new NextResponse(swSource(BUILD_ID), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}

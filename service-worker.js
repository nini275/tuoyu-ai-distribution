const SHELL_CACHE = "tuoyu-shell-v1";
const SHELL_PATHS = new Set([
  "/",
  "/index.html",
  "/app.js",
  "/styles.css",
  "/favicon.svg",
  "/catalog.html",
  "/catalog.css",
  "/catalog.js",
  "/manifest.webmanifest",
  "/vendor/lucide.min.js",
  "/icons/icon-144.png",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
]);

const NAVIGATION_FALLBACKS = new Map([
  ["/", "/index.html"],
  ["/index.html", "/index.html"],
  ["/catalog.html", "/catalog.html"],
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([...SHELL_PATHS]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("tuoyu-shell-") && key !== SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isPrivateRequest(pathname) {
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/admin.html" ||
    pathname === "/admin.js" ||
    pathname === "/admin.css"
  );
}

async function networkFirst(request, fallbackPath) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackPath) {
      const fallback = await cache.match(fallbackPath);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (isPrivateRequest(url.pathname)) return;

  if (request.mode === "navigate") {
    const fallbackPath = NAVIGATION_FALLBACKS.get(url.pathname);
    if (fallbackPath) {
      event.respondWith(networkFirst(request, fallbackPath));
    }
    return;
  }

  if (SHELL_PATHS.has(url.pathname)) {
    event.respondWith(networkFirst(request));
  }
});

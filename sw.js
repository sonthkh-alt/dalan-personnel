/* ----------------------------------------------------
   DẠ LAN SUITE — SERVICE WORKER (Offline-first PWA)
   Chiến lược:
   - Cài đặt: precache toàn bộ app shell (HTML/CSS/JS/manifest).
   - Runtime: network-first cho mọi request cùng origin (luôn lấy bản
     mới nhất khi có mạng, rơi về cache khi offline/mất server).
   - Font Google: stale-while-revalidate (hiển thị tức thì, cập nhật ngầm).
   Đổi CACHE_VERSION mỗi lần phát hành để làm mới cache trên thiết bị.
------------------------------------------------------- */
const CACHE_VERSION = "dalan-suite-v4.1.0";
const SHELL_CACHE = CACHE_VERSION + "-shell";
const FONT_CACHE = CACHE_VERSION + "-fonts";

const SHELL_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./css/modules.css",
    "./js/vendor/feather.min.js",
    "./js/store.js",
    "./js/store-ext.js",
    "./js/components.js",
    "./js/modules.js",
    "./js/app.js",
    "./js/app-ext.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((k) => k !== SHELL_CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);

    // Google Fonts: stale-while-revalidate
    if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
        event.respondWith(
            caches.open(FONT_CACHE).then(async (cache) => {
                const cached = await cache.match(req);
                const network = fetch(req).then((res) => {
                    if (res && res.ok) cache.put(req, res.clone());
                    return res;
                }).catch(() => null);
                return cached || (await network) || Response.error();
            })
        );
        return;
    }

    // Same-origin app shell & data: network-first, cache fallback
    if (url.origin === self.location.origin) {
        event.respondWith(
            fetch(req).then((res) => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
                }
                return res;
            }).catch(async () => {
                const cached = await caches.match(req);
                if (cached) return cached;
                // Điều hướng (navigation) offline → trả về app shell
                if (req.mode === "navigate") {
                    const shell = await caches.match("./index.html");
                    if (shell) return shell;
                }
                return Response.error();
            })
        );
    }
});

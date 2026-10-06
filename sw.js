const CACHE_NAME = "diary-app-v1";
const FILES_TO_CACHE = [
  "./index.html",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-512.png"
];

// 安装：缓存文件
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// 激活
self.addEventListener("activate", (evt) => {
  evt.waitUntil(self.clients.claim());
});

// 读取缓存，离线可用
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((response) => response || fetch(evt.request))
  );
});
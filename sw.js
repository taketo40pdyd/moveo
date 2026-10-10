/* Moveo Service Worker — 参考実装
 * 既に本番の sw.js がある場合は上書きせず、必要な部分だけ統合してください。
 * - アプリ本体: ネットワーク優先(更新を即反映)、失敗時はキャッシュ
 * - Firebase SDK(gstatic): キャッシュ優先(オフライン起動に必須)
 * - Firestore/Auth など API: キャッシュしない
 * - FCM のバックグラウンド通知、通知タップでアプリを開く
 */
const VER = "moveo-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const SDK = "moveo-sdk-v1";

importScripts("https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js",
              "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: "AIzaSyDbZzsFDVbEU4JOzq8RwdRjsjmXQZAv8Yo",
  authDomain: "moveo-9403f.firebaseapp.com",
  projectId: "moveo-9403f",
  storageBucket: "moveo-9403f.firebasestorage.app",
  messagingSenderId: "77048827756",
  appId: "1:77048827756:web:3c0c8d077874eff565ad49"
});
firebase.messaging(); // notification ペイロードは SDK が自動表示します

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keep = [VER, SDK];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("message", e => { if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting(); });

const timeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout")), ms); p.then(v => { clearTimeout(t); res(v); }, r => { clearTimeout(t); rej(r); }); });

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  // Firebase SDK のモジュール: キャッシュ優先
  if (u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/")) {
    e.respondWith(caches.open(SDK).then(async c => {
      const hit = await c.match(r); if (hit) return hit;
      const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res;
    }));
    return;
  }
  if (u.origin !== location.origin) return; // API 等は触らない
  // 画面遷移: ネットワーク優先(3秒で見切ってキャッシュ)
  if (r.mode === "navigate") {
    e.respondWith((async () => {
      const c = await caches.open(VER);
      try { const res = await timeout(fetch(r), 3000); if (res.ok) c.put("index.html", res.clone()); return res; }
      catch (_) { return (await c.match("index.html")) || (await c.match("./")) || Response.error(); }
    })());
    return;
  }
  // 同一オリジンの静的ファイル: 古いものを返しつつ裏で更新
  e.respondWith((async () => {
    const c = await caches.open(VER), hit = await c.match(r);
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) if ("focus" in c) return c.focus();
    return clients.openWindow("./#home");
  })());
});

const CACHE_NAME = "lifesyncai-shell-v2";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./offline.html",
  "./app.webmanifest",
  "./src/app.js",
  "./src/config.js",
  "./src/services/state.js",
  "./src/services/api.js",
  "./src/services/idb.js",
  "./src/services/seed.js",
  "./src/services/selectors.js",
  "./src/services/format.js",
  "./src/services/ui.js",
  "./src/services/cloud.js",
  "./src/modules/dashboard.js",
  "./src/modules/finance.js",
  "./src/modules/productivity.js",
  "./src/modules/wellness.js",
  "./src/modules/assistant.js",
  "./src/modules/settings.js",
  "./assets/icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        const offline = await caches.match("./offline.html");
        if (offline) return offline;
      }
      throw error;
    }
  })());
});

self.addEventListener("sync", (event) => {
  if (event.tag === "lifesync-outbox") {
    event.waitUntil(flushOutboxInWorker());
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json?.() || {};
  } catch {
    data = { title: "LifeSync AI", body: event.data?.text?.() || "Bạn có một nhắc nhở mới." };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "LifeSync AI", {
      body: data.body || "Bạn có một cập nhật mới.",
      icon: "./assets/icons/icon-192.png",
      badge: "./assets/icons/icon-192.png",
      data: { url: data.url || "./" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "./";
  event.waitUntil(clients.openWindow(target));
});

const DB_NAME = "lifesyncai-offline";
const STORE_NAME = "outbox";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readOutbox() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function removeOutboxItem(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function flushOutboxInWorker() {
  const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
  const client = allClients[0];
  if (!client) return;

  let apiBaseUrl = "";
  try {
    apiBaseUrl = new URL(client.url).origin;
    const configResponse = await fetch(new URL("./src/config.js", client.url));
    const configText = await configResponse.text();
    const match = configText.match(/apiBaseUrl:\s*"([^"]*)"/);
    const configured = match?.[1] || "";
    if (configured) apiBaseUrl = configured.replace(/\/$/, "");
  } catch (error) {
    console.warn("Cannot read config for background sync:", error);
  }

  if (!apiBaseUrl) return;

  const items = await readOutbox();
  for (const item of items) {
    try {
      await fetch(`${apiBaseUrl}${item.path}`, {
        method: item.method,
        headers: { "Content-Type": "application/json", "x-demo-user": "demo-user" },
        body: JSON.stringify(item.body)
      });
      await removeOutboxItem(item.id);
    } catch (error) {
      console.warn("Background sync still pending:", error);
    }
  }
}

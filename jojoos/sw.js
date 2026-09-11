/* ==========================================================================
   JojoOS · sw.js — o que deixa o computador abrir sem internet.
   Rede primeiro, cache de reserva: assim uma versão nova aparece na hora
   em que você recarrega, e uma queda de internet não derruba o sistema.
   ========================================================================== */
const CACHE = "jojoos-v1";
const ARQUIVOS = [
  "./", "./index.html", "./manifest.webmanifest", "./icone.svg",
  "./js/mesa.js", "./js/sistema.js", "./js/programas.js", "./js/jogos.js",
  "./js/guardar.js", "./js/cafe.js",
  "./js/clipy.js", "./js/cerebro.js", "./js/calculadora.js", "./js/voz.js",
];

self.addEventListener("install", ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys()
    .then(n => Promise.all(n.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", ev => {
  if (ev.request.method !== "GET") return;
  if (new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return r;
      })
      .catch(async () => (await caches.match(ev.request)) || (await caches.match("./index.html")))
  );
});

/* Service worker simples: tenta a internet primeiro e, se não tiver,
   usa a cópia guardada. Assim o site abre offline e sempre atualiza. */
const CACHE = 'fala-familia-v22';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg',
  './app.js?v=22', './ajuda.js?v=22', './jogo.js?v=22', './trancar.js?v=22', './mais.js?v=22', './casa.js?v=22', './enfeites.js?v=22', './nuvem.js?v=22', './publico.js?v=22', './audio.js?v=22', './video.js?v=22', './familia.js?v=22', './extras.js?v=22', './ligacao.js?v=22', './avisos.js?v=22',
  './icone-192.png', './icone-512.png', './icone-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html')))
  );
});

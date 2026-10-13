/* Guarda a página, o ícone e o manifesto pra abrir sem internet: o GoatSim!
   não busca nada de fora, então funciona inteiro offline depois da 1ª vez. */
const CACHE = 'goatsim-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg'];
self.addEventListener('install', ev => { self.skipWaiting(); ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {})); });
self.addEventListener('activate', ev => { ev.waitUntil(caches.keys().then(n => Promise.all(n.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET' || new URL(ev.request.url).origin !== self.location.origin) return;
  const pedido = ev.request.mode === 'navigate' ? fetch(ev.request.url, { cache:'reload', credentials:'same-origin' }) : fetch(ev.request);
  ev.respondWith(pedido.then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
    .catch(async () => (await caches.match(ev.request)) || (ev.request.mode === 'navigate' && await caches.match('./index.html')) || new Response('offline', { status:503 })));
});

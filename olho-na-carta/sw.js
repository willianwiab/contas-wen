/* Guarda só a casca do site: página, ícone, manifesto. O checklist e o
   comparador de verso rodam inteiros no aparelho, então offline eles
   funcionam igual. A busca de preço precisa de internet e, sem ela, a
   página avisa e deixa você digitar o valor na mão. */
const CACHE = 'olho-na-carta-v6';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg'];

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(n => Promise.all(n.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', ev => {
  if(ev.request.method !== 'GET') return;
  /* Preço vem de fora e muda toda semana: nunca guardo, sempre pergunto. */
  if(new URL(ev.request.url).origin !== self.location.origin) return;

  const pedido = (ev.request.mode === 'navigate')
    ? fetch(ev.request.url, { cache:'reload', credentials:'same-origin' })
    : fetch(ev.request);

  ev.respondWith(
    pedido
      .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if(exata) return exata;
        if(ev.request.mode === 'navigate')
          return (await caches.match('./index.html')) || new Response('offline', { status:503 });
        return new Response('offline', { status:503 });
      })
  );
});

/* Abre sem internet — importante pra quem só consegue olhar o mural
   no computador da escola, com a rede ruim. Pedido pra fora do site
   passa direto, e um arquivo que falhou nunca vira a página. */
const CACHE = 'fala-turma-v6';
const ARQUIVOS = ['./', './index.html', './turma.js?v=6', './turma-mais.js?v=6', './turma-cara.js?v=6',
  './manifest.webmanifest', './icone.svg', './icone-192.png', './icone-512.png',
  './icone-mascara.png', './icone-180.png'];

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
  if(new URL(ev.request.url).origin !== self.location.origin) return;
  /* o aviso de versão nova tem que vir do servidor SEMPRE, senão o
     app pergunta ao próprio cache se tem versão nova e nunca sai do lugar */
  if(new URL(ev.request.url).pathname.endsWith('/versao.json')) return;
  /* a página de socorro nunca pode vir do cache: ela existe justamente
     pra quando o cache é o problema */
  if(new URL(ev.request.url).pathname.endsWith('/consertar.html')) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if(exata) return exata;
        const parecida = await caches.match(ev.request, { ignoreSearch:true });
        if(parecida) return parecida;
        if(ev.request.mode === 'navigate') return (await caches.match('./index.html')) ||
          new Response('offline', { status:503 });
        return new Response('offline', { status:503 });
      })
  );
});

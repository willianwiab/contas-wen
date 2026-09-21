/* Guarda só a casca do site (página, ícone, manifesto) pra abrir rápido e
   sem internet. Os preços vêm de fora e nunca são guardados: preço velho
   seria pior do que preço nenhum. */
/* O número sobe sempre que eu quero que todo mundo largue o que estava
   guardado. Quem estava com versão velha pega a nova na primeira visita. */
const CACHE = 'butterpoke-v38';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg', './icone-limpo.svg'];

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
  if(new URL(ev.request.url).origin !== self.location.origin) return;  // API e imagens passam direto
  /* Abrir a página vai direto na fonte, sem passar pelo cache do navegador.
     NÃO é o culpado comprovado do "não atualizou o site" — testei o jeito
     antigo e ele também pegava a versão nova. É cinto de segurança: o
     GitHub manda guardar a página por uns minutos, e num celular que abre
     o site pela tela inicial esse "guardado" é justamente onde o navegador
     olha primeiro. Custa um pedido a mais e tira uma dúvida. */
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

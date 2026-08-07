/* ============================================================
   JOGOS DO JOJO — Service Worker
   Faz o site funcionar como aplicativo: abre rápido e continua
   funcionando mesmo sem internet.

   Duas estratégias, cada uma pelo motivo certo:
   - Arquivos do site (HTML, CSS, JS, imagens): cache primeiro.
     São estáveis, então servir do cache deixa o app instantâneo.
   - Dados (games.json, about.json): rede primeiro.
     Assim um jogo novo aparece na hora, sem esperar o cache expirar.

   Ao mudar qualquer arquivo do site, suba o número da VERSAO:
   isso apaga o cache antigo e obriga o app a baixar tudo de novo.
   ============================================================ */

const VERSAO = 'jojo-v1';
const CACHE = `jogos-do-jojo-${VERSAO}`;

/* Tudo o que o app precisa para abrir offline.
   Caminhos relativos ao próprio sw.js, então funcionam em qualquer subpasta. */
const ARQUIVOS_BASE = [
  './',
  './index.html',
  './pages/jogos.html',
  './pages/jogo.html',
  './pages/sobre.html',
  './css/style.css',
  './js/utils.js',
  './js/background.js',
  './js/main.js',
  './js/home.js',
  './js/games.js',
  './js/game.js',
  './js/about.js',
  './components/header.js',
  './components/footer.js',
  './components/game-card.js',
  './data/games.json',
  './data/about.json',
  './manifest.webmanifest',
  './assets/icons/favicon.svg',
  './assets/icons/app/jojo-192.png',
  './assets/icons/app/jojo-512.png',
  './assets/images/hero-jojo.jpg',
  './assets/images/hero-jojo-mobile.jpg',
];

/* Instalação: baixa e guarda os arquivos base. */
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll falha inteiro se um arquivo falhar; por isso vamos um a um,
      // tolerando ausências (uma capa que ainda não existe, por exemplo).
      Promise.all(
        ARQUIVOS_BASE.map((url) =>
          cache.add(url).catch(() => console.warn('SW: não consegui guardar', url))
        )
      )
    )
  );
  self.skipWaiting();
});

/* Ativação: remove caches de versões antigas. */
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

/* Busca: decide entre cache e rede conforme o tipo de arquivo. */
self.addEventListener('fetch', (evento) => {
  const req = evento.request;

  // Só cuidamos de GET no mesmo domínio. Os jogos do JoJo ficam em outro
  // endereço, então passam direto para a rede, sem interferência.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const ehDado = req.url.includes('/data/') && req.url.endsWith('.json');

  if (ehDado) {
    // Rede primeiro: garante que jogo novo apareça na hora.
    evento.respondWith(
      fetch(req)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
          return resp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache primeiro, com atualização silenciosa em segundo plano.
  evento.respondWith(
    caches.match(req).then((emCache) => {
      const daRede = fetch(req)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
          return resp;
        })
        .catch(() => emCache);
      return emCache || daRede;
    })
  );
});

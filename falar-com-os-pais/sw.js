/* Service worker simples: tenta a internet primeiro e, se não tiver,
   usa a cópia guardada. Assim o site abre offline e sempre atualiza. */
const CACHE = 'fala-familia-v34';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg',
  './app.js?v=34', './ajuda.js?v=34', './jogo.js?v=34', './trancar.js?v=34', './mais.js?v=34', './casa.js?v=34', './enfeites.js?v=34', './nuvem.js?v=34', './sinais.js?v=34', './chamada.js?v=34', './publico.js?v=34', './audio.js?v=34', './video.js?v=34', './familia.js?v=34', './extras.js?v=34', './ligacao.js?v=34', './avisos.js?v=34', './ia.js?v=34', './recado.js?v=34', './jogos.js?v=34', './quadro.js?v=34', './momentos.js?v=34', './placar.js?v=34', './meu.js?v=34', './festa.js?v=34', './socorro.js?v=34', './guardados.js?v=34', './hoje.js?v=34',
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
  /* Só cuida dos arquivos do próprio site. Pedido pra fora — o banco da
     família, o cérebro do Ajudante — passa direto: se desse errado aqui,
     a resposta guardada (o index.html) voltava no lugar do JSON e o site
     parecia quebrado sem motivo. */
  if(new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copia)).catch(() => {});
        return resp;
      })
      .catch(async () => {
        /* 1) a cópia exata desta versão */
        const exata = await caches.match(ev.request);
        if(exata) return exata;

        /* 2) a mesma coisa de uma versão anterior (o ?v= muda a cada
              atualização, então sem ignorar a busca a cópia de ontem
              nunca era achada) */
        const parecida = await caches.match(ev.request, { ignoreSearch: true });
        if(parecida) return parecida;

        /* 3) Página? devolve o index guardado. QUALQUER OUTRA COISA não
              pode virar index.html: o navegador tentava ler a página
              inteira como se fosse JavaScript, o arquivo morria e o site
              quebrava com "não está definido". Melhor falhar de verdade —
              a página percebe e se conserta sozinha. */
        if(ev.request.mode === 'navigate' || ev.request.destination === 'document'){
          const pagina = await caches.match('./index.html');
          if(pagina) return pagina;
        }
        return new Response('offline', { status: 503, statusText: 'sem conexão' });
      })
  );
});

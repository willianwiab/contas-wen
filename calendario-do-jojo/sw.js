/* Guarda a casca do site (página, ícone, manifesto) pra abrir rápido e funcionar sem internet.
   Também guarda a "agenda" (os próximos dias com evento) que a página manda, pra conseguir
   avisar que o dia chegou mesmo com o app fechado (no Chrome do Android, via periodicsync). */
/* O número sobe sempre que eu quero que todo mundo largue o que estava guardado. */
const CACHE = 'calendario-jojo-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone.svg', './icone-192.png', './icone-512.png'];
const AGENDA = './_agenda.json';

self.addEventListener('install', ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});
self.addEventListener('activate', ev => {
  ev.waitUntil((async () => {
    // leva a agenda do cache velho pro novo, pra não perder os avisos na atualização
    const nomes = await caches.keys();
    for (const n of nomes) { if (n !== CACHE) { const velho = await caches.open(n); const a = await velho.match(AGENDA); if (a) { const novo = await caches.open(CACHE); await novo.put(AGENDA, a); } await caches.delete(n); } }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  if (new URL(ev.request.url).origin !== self.location.origin) return;
  const pedido = (ev.request.mode === 'navigate')
    ? fetch(ev.request.url, { cache: 'reload', credentials: 'same-origin' })
    : fetch(ev.request);
  ev.respondWith(
    pedido
      .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(ev.request, c)).catch(() => {}); return r; })
      .catch(async () => {
        const exata = await caches.match(ev.request);
        if (exata) return exata;
        if (ev.request.mode === 'navigate') return (await caches.match('./index.html')) || new Response('offline', { status: 503 });
        return new Response('offline', { status: 503 });
      })
  );
});

// ---------- avisos ----------
async function lerAgenda() {
  try { const c = await caches.open(CACHE); const r = await c.match(AGENDA); return r ? await r.json() : null; } catch (e) { return null; }
}
async function guardarAgenda(d) {
  const c = await caches.open(CACHE);
  await c.put(AGENDA, new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } }));
}
function chaveHoje() { const h = new Date(); return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0'); }

self.addEventListener('message', ev => {
  const d = ev.data || {};
  if (d.tipo === 'agenda') ev.waitUntil((async () => {
    const velha = await lerAgenda();
    if (velha && velha.avisado && (!d.avisado || velha.avisado > d.avisado)) d.avisado = velha.avisado;
    await guardarAgenda(d);
  })());
  if (d.tipo === 'avisar-agora') ev.waitUntil(avisarDoDia(true));
});

async function avisarDoDia(forcar) {
  const a = await lerAgenda();
  if (!a || !a.ligado) return;
  const k = chaveHoje();
  if (!forcar && a.avisado === k) return;
  const hoje = (a.agenda || []).find(x => x.k === k);
  if (!hoje) return;
  await self.registration.showNotification(hoje.titulo, { body: hoje.corpo, icon: './icone-192.png', badge: './icone-192.png', tag: 'cal-' + k, data: { k } });
  a.avisado = k;
  await guardarAgenda(a);
}
self.addEventListener('periodicsync', ev => { if (ev.tag === 'avisos-do-dia') ev.waitUntil(avisarDoDia(false)); });

self.addEventListener('notificationclick', ev => {
  ev.notification.close();
  const k = (ev.notification.data || {}).k || '';
  const url = self.registration.scope + (k ? '#' + k.slice(0, 7) : '');
  ev.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    if (cs.length) { cs[0].focus(); if (cs[0].navigate) return cs[0].navigate(url).catch(() => {}); return; }
    return self.clients.openWindow(url);
  }));
});

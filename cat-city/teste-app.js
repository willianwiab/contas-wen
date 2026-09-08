/* ============================================================
   CAT CITY — teste de aplicativo (PWA)
   Confere o manifesto, os ícones, o service worker registrado,
   o botão de instalar, o passo a passo por aparelho, e se o jogo
   abre SEM INTERNET com o progresso intacto.

   Como rodar (precisa servir por http, não abrir o arquivo):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-app.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8822/cat-city/';
const ok = [], fail = [];
const conf = (n, c, e = '') => (c ? ok : fail).push(n + (e ? ' → ' + e : ''));
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--use-gl=swiftshader'] });
  const ctx = await b.newContext();
  const p = await ctx.newPage({ viewport: { width: 900, height: 900 } });
  const err = [];
  p.on('pageerror', e => err.push('PAGEERROR: ' + e.message));
  p.on('console', m => {
    if (m.type() === 'error' && !/assets\/cats/.test(m.location().url || '')) err.push('C: ' + m.text());
  });

  await p.goto(base);
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });

  /* ---------- manifesto e ícones ---------- */
  let r = await p.evaluate(async () => {
    const l = document.querySelector('link[rel=manifest]');
    const m = await (await fetch(l.href)).json();
    const icones = await Promise.all(m.icons.map(async i => (await fetch(new URL(i.src, location.href))).ok));
    const apple = document.querySelector('link[rel="apple-touch-icon"]');
    return { nome: m.name, curto: m.short_name, display: m.display,
      inicio: m.start_url, escopo: m.scope, icones: m.icons.length,
      mascara: m.icons.some(i => i.purpose === 'maskable'),
      todosOk: icones.every(Boolean),
      apple: !!apple && (await fetch(apple.href)).ok,
      tema: document.querySelector('meta[name=theme-color]').content };
  });
  conf('o manifesto carrega com nome, tela cheia e os 4 ícones (um deles com máscara)',
    r.nome === 'Cat City' && r.display === 'fullscreen' && r.icones === 4 &&
    r.todosOk && r.mascara && r.apple, JSON.stringify(r));

  /* ---------- service worker REGISTRADO ---------- */
  r = await p.evaluate(async () => {
    const reg = await Promise.race([navigator.serviceWorker.ready,
      new Promise(f => setTimeout(() => f(null), 8000))]);
    return reg ? { ativo: !!reg.active, escopo: reg.scope.endsWith('/cat-city/') } : { ativo: false };
  });
  conf('o service worker é registrado de verdade e assume a pasta do jogo',
    r.ativo && r.escopo, JSON.stringify(r));

  /* ---------- o botão de instalar existe e aparece ---------- */
  r = await p.evaluate(() => {
    const b = document.getElementById('btInstalar');
    return { existe: !!b, escondido: b.hidden,
      visivel: !!b && getComputedStyle(b).display !== 'none',
      texto: b && b.textContent.trim() };
  });
  conf('o botão de instalar existe no menu e está à vista',
    r.existe && !r.escondido && r.visivel && /INSTALAR/.test(r.texto), JSON.stringify(r));

  /* ---------- e o [hidden] realmente esconde (o .botao é display:block) ---------- */
  r = await p.evaluate(() => {
    const b = document.getElementById('btInstalar');
    b.hidden = true;
    const escondeu = getComputedStyle(b).display === 'none';
    b.hidden = false;
    return escondeu;
  });
  conf('quando o botão é escondido ele some mesmo (o hidden ganha do display:block)', r, String(r));

  /* ---------- o passo a passo abre e é do aparelho certo ---------- */
  await p.click('#btInstalar');
  await p.waitForSelector('#telaInstalar.on', { timeout: 4000 });
  r = await p.evaluate(() => ({
    passos: document.querySelectorAll('#passosInstalar .p').length,
    texto: document.getElementById('passosInstalar').textContent }));
  conf('no computador o botão ensina o caminho do navegador, em 3 passos',
    r.passos === 3 && /barra de endere|Instalar/i.test(r.texto), JSON.stringify({ passos: r.passos }));
  conf('e avisa que o jogo funciona sem internet de qualquer jeito',
    /sem internet/.test(r.texto), '');

  await p.click('#btVoltaInstalar');
  r = await p.evaluate(() => document.getElementById('telaMenu').classList.contains('on'));
  conf('dá pra voltar do passo a passo pro menu', r, String(r));

  /* ---------- OFFLINE ---------- */
  await p.evaluate(() => { CatCity.desbloquearTudo(); CatCity.jogo.peixes = 77; CatCity.salvar(); });
  await p.waitForTimeout(1200);                 // deixa o sw guardar os arquivos
  await ctx.setOffline(true);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  r = await p.evaluate(() => ({ titulo: document.title,
    formas: CatCity.FORMAS.length,
    tenho: CatCity.jogador.desbloqueadas.length,
    peixes: CatCity.jogo.peixes,
    predios: CatCity.cidade.predios.length }));
  conf('SEM INTERNET o jogo abre inteiro, com as 1000 formas e o progresso salvo',
    r.titulo === 'CAT CITY' && r.formas === 1000 && r.tenho === 1000 &&
    r.peixes === 77 && r.predios > 100, JSON.stringify(r));

  /* ---------- e dá pra jogar offline ---------- */
  await p.click('#btJogar'); await p.waitForTimeout(700);
  const antes = await p.evaluate(() => CatCity.jogador.x);
  await p.keyboard.down('KeyD'); await p.waitForTimeout(400); await p.keyboard.up('KeyD');
  r = await p.evaluate(() => ({ x: CatCity.jogador.x, rodando: CatCity.jogo.rodando,
    gatos: CatCity.quantosVivos() }));
  conf('e dá pra jogar offline: o gato anda e a cidade está cheia',
    r.rodando && r.x > antes + .3 && r.gatos > 50, JSON.stringify(r));
  await ctx.setOffline(false);

  /* ---------- no iPhone o caminho é outro ---------- */
  const ctx2 = await b.newContext({ userAgent: IPHONE, viewport: { width: 390, height: 780 },
    hasTouch: true, isMobile: true });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => err.push('PAGEERROR(iphone): ' + e.message));
  await p2.goto(base);
  await p2.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  await p2.click('#btInstalar');
  await p2.waitForSelector('#telaInstalar.on', { timeout: 4000 });
  r = await p2.evaluate(() => document.getElementById('passosInstalar').textContent);
  conf('no iPhone ensina o caminho do Safari (Compartilhar → Adicionar à Tela de Início)',
    /Compartilhar/.test(r) && /Tela de In/.test(r), r.slice(0, 90) + '…');
  await ctx2.close();

  /* ---------- quem já instalou não vê o botão ---------- */
  const ctx3 = await b.newContext({ viewport: { width: 900, height: 900 } });
  const p3 = await ctx3.newPage();
  await p3.addInitScript(() => {                 // finge que já está aberto como aplicativo
    const mm = window.matchMedia;
    window.matchMedia = q => /display-mode: (standalone|fullscreen)/.test(q)
      ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }
      : mm.call(window, q);
  });
  await p3.goto(base);
  await p3.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  r = await p3.evaluate(() => {
    const b = document.getElementById('btInstalar');
    return { escondido: b.hidden, display: getComputedStyle(b).display };
  });
  conf('quem já instalou não vê mais o botão de instalar',
    r.escondido && r.display === 'none', JSON.stringify(r));
  await ctx3.close();

  console.log('✅ ' + ok.length + ' ok'); ok.forEach(t => console.log('   · ' + t));
  if (fail.length) { console.log('❌ ' + fail.length); fail.forEach(t => console.log('   · ' + t)); }
  console.log(err.length ? '❌ console: ' + JSON.stringify(err.slice(0, 5)) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

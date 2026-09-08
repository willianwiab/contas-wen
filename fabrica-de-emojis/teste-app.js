/* ============================================================
   FÁBRICA DE EMOJIS — teste de aplicativo (PWA)
   Confere o manifesto, os ícones, o service worker e se o jogo
   abre sem internet com o save intacto.

   Como rodar (precisa servir por http, não abrir o arquivo):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-app.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8822/fabrica-de-emojis/';
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const ctx = await b.newContext();
  const p = await ctx.newPage({ viewport:{width:900,height:900} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });

  await p.goto(base); await p.waitForTimeout(1200);

  // manifesto e ícones carregam
  let r = await p.evaluate(async () => {
    const l = document.querySelector('link[rel=manifest]');
    const m = await (await fetch(l.href)).json();
    const testes = await Promise.all(m.icons.map(async i => (await fetch(new URL(i.src, location.href))).ok));
    const apple = document.querySelector('link[apple-touch-icon], link[rel="apple-touch-icon"]');
    return { nome: m.name, curto: m.short_name, display: m.display, icones: m.icons.length,
      todosOk: testes.every(Boolean), apple: !!apple && (await fetch(apple.href)).ok,
      tema: document.querySelector('meta[name=theme-color]').content };
  });
  conf('manifesto carrega com nome, ícones e display standalone',
    r.nome==='Fábrica de Emojis' && r.display==='standalone' && r.icones===4 && r.todosOk && r.apple, JSON.stringify(r));

  // service worker registra e assume a página
  r = await p.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return { ativo: !!reg.active, escopo: reg.scope.endsWith('/fabrica-de-emojis/') };
  });
  conf('service worker registrado e ativo', r.ativo && r.escopo, JSON.stringify(r));

  // joga um pouco e salva
  await p.click('.modoCard[data-m="normal"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { for(let i=0;i<12;i++) clicar(); salvar(); });
  await p.waitForTimeout(600);

  // OFFLINE: recarrega sem internet
  await ctx.setOffline(true);
  await p.reload({ waitUntil:'domcontentloaded' }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ titulo: document.title, jogo: typeof TODOS !== 'undefined' && TODOS.length,
    jogos: typeof jogos !== 'undefined' ? jogos.length : -1,
    inicio: document.getElementById('inicio').classList.contains('on') }));
  conf('abre sem internet, com o jogo salvo intacto', r.titulo==='FÁBRICA DE EMOJIS' && r.jogo===340 && r.jogos===1, JSON.stringify(r));
  await p.screenshot({ path:'offline.png' });
  await ctx.setOffline(false);

  // instalável? (o Chrome só dispara beforeinstallprompt com https, mas dá pra conferir os critérios)
  r = await p.evaluate(() => ({ btn: !!document.getElementById('btInstalar'),
    escondido: document.getElementById('btInstalar').hidden }));
  conf('botão de instalar existe e fica escondido até o navegador oferecer', r.btn && r.escondido, JSON.stringify(r));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
})();

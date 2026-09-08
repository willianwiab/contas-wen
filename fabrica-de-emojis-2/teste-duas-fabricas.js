/* ============================================================
   FÁBRICA 1 x FÁBRICA 2 — teste de separação

   As duas moram no mesmo endereço (willianwiab.github.io), e o
   localStorage é compartilhado entre as pastas do mesmo site.
   Ou seja: o que separa os saves é SÓ o prefixo das chaves.
   Este teste joga na fábrica 1, abre a fábrica 2 e confere que
   uma não enxerga nem estraga a outra.

   Como rodar (precisa servir por http):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-duas-fabricas.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = process.env.BASE || 'http://127.0.0.1:8822/';
const um = base + 'fabrica-de-emojis/', dois = base + 'fabrica-de-emojis-2/';
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const ctx = await b.newContext();
  const p = await ctx.newPage({ viewport:{width:1100,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });

  // ---------- joga na fábrica 1 ----------
  await p.goto(um); await p.waitForTimeout(900);
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForTimeout(900);
  let r = await p.evaluate(() => {
    novoJogo('normal');
    dinheiro = 555555; recorde = 555555; salvar();
    return { titulo: document.title, jogos: jogos.length, chaves: Object.keys(localStorage).sort() };
  });
  conf('a fábrica 1 é a fábrica 1 e salvou o jogo',
    r.titulo==='FÁBRICA DE EMOJIS' && r.jogos===1, JSON.stringify({t:r.titulo, j:r.jogos}));
  conf('e ela só escreve em chaves fabricaEmojis_*',
    r.chaves.length > 0 && r.chaves.every(k => k.startsWith('fabricaEmojis_')), r.chaves.join(' '));
  const chaves1 = r.chaves;

  // ---------- abre a fábrica 2 ----------
  await p.goto(dois); await p.waitForTimeout(900);
  r = await p.evaluate(() => ({
    titulo: document.title, jogos: jogos.length, jogoAtual,
    inicio: document.getElementById('inicio').classList.contains('on'),
    chaves: Object.keys(localStorage).sort(),
  }));
  conf('a fábrica 2 abre vazia, sem enxergar o jogo da 1',
    r.titulo==='FÁBRICA DE EMOJIS 2' && r.jogos===0 && !r.jogoAtual && r.inicio, JSON.stringify({t:r.titulo,j:r.jogos}));
  conf('e o save da fábrica 1 continua lá, do lado, intacto',
    chaves1.every(k => r.chaves.includes(k)), r.chaves.join(' '));

  // ---------- joga na 2 ----------
  r = await p.evaluate(() => {
    novoJogo('dificil');
    dinheiro = 111; recorde = 111; salvar();
    const minhas = Object.keys(localStorage).filter(k => k.startsWith('fabricaEmojis2_'));
    return { jogos: jogos.length, minhas: minhas.length,
             chaves: Object.keys(localStorage).sort() };
  });
  conf('a fábrica 2 salva nas chaves dela (fabricaEmojis2_*)',
    r.jogos===1 && r.minhas>=2, JSON.stringify({jogos:r.jogos, minhas:r.minhas}));
  conf('as duas cadernetas convivem sem se misturar',
    chaves1.every(k => r.chaves.includes(k)) && r.chaves.some(k => k.startsWith('fabricaEmojis2_')),
    r.chaves.join(' '));

  // ---------- volta pra 1 e confere que nada mudou ----------
  await p.goto(um); await p.waitForTimeout(900);
  r = await p.evaluate(() => {
    const j = jogos[0];
    abrirJogo(j.id);
    return { jogos: jogos.length, modo: j.modo, recorde: Math.round(recorde), titulo: document.title };
  });
  conf('voltando pra fábrica 1, o jogo dela está do jeitinho que ficou',
    r.titulo==='FÁBRICA DE EMOJIS' && r.jogos===1 && r.modo==='normal' && r.recorde===555555, JSON.stringify(r));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

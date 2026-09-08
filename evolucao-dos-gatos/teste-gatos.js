/* ============================================================
   EVOLUÇÃO DOS GATOS — teste do jogo

   Abre o jogo num Chromium de verdade e confere a caçada, os
   perigos, as 31 evoluções, a colônia que caça sozinha, as 9
   vidas, o save e — o mais importante — se a sala aguenta ficar
   surreal sem derrubar o FPS.

   Como rodar:
     npm i playwright-core
     node teste-gatos.js
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1050,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) err.push('C: '+m.text()); });
  await p.goto(URL); await p.waitForTimeout(800);
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForTimeout(800);

  // ---------- o tamanho do jogo ----------
  let r = await p.evaluate(() => ({
    evolucoes: EVOLUCOES.length, presas: PRESAS.length, perigos: PERIGOS.length,
    brinquedos: LOJA.length, familias: FAMILIAS.length, amigos: AMIGOS.length,
    comidas: COMIDAS.length, conq: CONQUISTAS.length,
    primeira: EVOLUCOES[0].nome, ultima: EVOLUCOES[EVOLUCOES.length - 1].nome,
    subindo: EVOLUCOES.every((e, i) => i === 0 || e.nv > EVOLUCOES[i-1].nv),
  }));
  conf('31 evoluções em ordem, do Gatinho ao Gato do NADA',
    r.evolucoes===31 && r.subindo && r.primeira==='Gatinho' && r.ultima==='Gato do NADA', JSON.stringify(r));
  conf('96 brinquedos em 12 famílias, 12 gatos, 25 bichinhos e 5 perigos',
    r.brinquedos===96 && r.familias===12 && r.amigos===12 && r.presas===25 && r.perigos===5,
    JSON.stringify(r));

  // ---------- os bichinhos vão aparecendo conforme o gato evolui ----------
  r = await p.evaluate(() => ({
    nv1: presasAbertas().length, nv200: (() => { const a = nivel; nivel = 200;
      const n = presasAbertas().length; nivel = a; return n; })(),
    nv1000: (() => { const a = nivel; nivel = 1000;
      const n = presasAbertas().length; nivel = a; return n; })(),
  }));
  conf('a caçada muda de cara: poucos bichinhos no começo, todos no fim',
    r.nv1 < r.nv200 && r.nv200 < r.nv1000 && r.nv1000 === 25, JSON.stringify(r));

  // ---------- caçar de verdade, com o mouse ----------
  r = await p.evaluate(() => {
    presas = []; nascerPresa(false);
    presas[0].x = .5; presas[0].y = .35; presas[0].vx = 0; presas[0].vy = 0;
    const rr = document.getElementById('sala').getBoundingClientRect();
    return { antes:{ xp, peixes: Math.round(peixes), comidos: estat.carinhos },
             x: rr.left + .5 * rr.width, y: rr.top + .35 * rr.height, nome: presas[0].tipo.nome };
  });
  await p.mouse.click(r.x, r.y); await p.waitForTimeout(250);
  let d = await p.evaluate(() => ({ xp, peixes: Math.round(peixes), comidos: estat.carinhos, naSala: presas.filter(x=>!x.perigo).length }));
  conf('clicar num bichinho come ele: entra XP e entra peixe',
    d.comidos === r.antes.comidos + 1 && d.xp > r.antes.xp && d.peixes > r.antes.peixes,
    JSON.stringify({ antes:r.antes, depois:d, presa:r.nome }));

  // ---------- o perigo ----------
  r = await p.evaluate(() => {
    presas = []; nivel = 20; xp = 5000; LOJA.forEach(u => u.qtd = 0);
    proximaPatada = 0;                      // a patada anterior ainda podia estar voltando
    nascerPresa(true);
    presas[0].x = .5; presas[0].y = .35; presas[0].vx = 0; presas[0].vy = 0;
    const rr = document.getElementById('sala').getBoundingClientRect();
    return { antesXp: xp, antesSustos: estat.sustos, nome: presas[0].tipo.nome,
             x: rr.left + .5 * rr.width, y: rr.top + .35 * rr.height };
  });
  await p.mouse.click(r.x, r.y); await p.waitForTimeout(250);
  d = await p.evaluate(() => ({ xp, sustos: estat.sustos, combo }));
  conf('clicar no perigo (' + r.nome + ') dá susto, perde XP e zera o combo',
    d.sustos === r.antesSustos + 1 && d.xp < r.antesXp && d.combo === 0, JSON.stringify(d));

  r = await p.evaluate(() => {                       // o Bigode faz desviar
    LOJA.filter(u => u.fam === 'bigode').forEach(u => u.qtd = 200);
    return { escudo: escudo() };
  });
  conf('o Bigode protege do perigo, mas nunca 100%', r.escudo > .5 && r.escudo < .9, JSON.stringify(r));

  // ---------- evoluir ----------
  r = await p.evaluate(() => {
    LOJA.forEach(u => u.qtd = 0);
    nivel = 1; xp = 0; album = []; estat.evolucoes = 0;
    ganharXp(500);
    const a = { nivel, evo: evoDoNivel(nivel).nome, album: album.length,
                janela: document.getElementById('evo').classList.contains('on'),
                cartao: document.getElementById('evoPara').textContent };
    document.getElementById('evo').classList.remove('on');
    return a;
  });
  conf('juntar XP sobe de nível, evolui o gato e abre o cartão da evolução',
    r.nivel > 1 && r.evo !== 'Gatinho' && r.janela === true && r.album >= 1, JSON.stringify(r));

  r = await p.evaluate(() => {                       // o álbum guarda tudo por onde passou
    nivel = 1; xp = 0; album = [];
    for (const e of EVOLUCOES) { nivel = e.nv; guardarNoAlbum(evoDoNivel(nivel)); }
    return { album: album.length, bonus: bonusAlbum() };
  });
  conf('o álbum guarda as 31 evoluções e cada uma dá +3% em tudo',
    r.album === 31 && Math.abs(r.bonus - 1.93) < .01, JSON.stringify(r));

  // ---------- a colônia caça sozinha ----------
  r = await p.evaluate(() => new Promise(res => {
    nivel = 50; xp = 0; peixes = 0; LOJA.forEach(u => u.qtd = 0); quantosAmigos = {};
    const antes = { xp, peixes };
    quantosAmigos.mimi = 40; arrumarGatinhos();
    setTimeout(() => res({ antes, xp, peixes: Math.round(peixes), bocadas: cacadasPorSeg(),
      gatinhosNaTela: gatinhos.length }), 1500);
  }));
  conf('a colônia caça sozinha e traz XP e peixe sem você clicar',
    r.xp > r.antes.xp && r.peixes > 0 && r.bocadas === 10, JSON.stringify(r));
  conf('e os gatos adotados aparecem andando pela sala', r.gatinhosNaTela > 0, String(r.gatinhosNaTela));

  // ---------- comida ----------
  r = await p.evaluate(() => {
    peixes = 1e9; buffs = []; const antes = xp;
    darComida('peixe');
    return { subiu: xp > antes || nivel > 1, buffs: buffs.length, mult: multBuff() };
  });
  conf('a comida dá XP na hora e liga um bônus com prazo',
    r.subiu && r.buffs === 1 && r.mult > 1, JSON.stringify(r));

  // ---------- as 9 vidas ----------
  r = await p.evaluate(() => {
    nivel = 300; xp = 0; peixes = 1e6; patas = 0; renascimentos = 0; vidasUsadas = 0;
    LOJA.forEach(u => u.qtd = 3); quantosAmigos = { mimi: 5 };
    const g = patasAGanhar();
    renascer();
    return { ganhou: g, patas, nivel, peixes, vidasUsadas, renascimentos,
      ups: LOJA.reduce((s, u) => s + u.qtd, 0), colonia: totalAmigos(),
      album: album.length, bonus: bonusPatas() };
  });
  conf('usar uma vida zera nível, brinquedos e colônia, e dá patas',
    r.patas === r.ganhou && r.patas > 0 && r.nivel === 1 && r.ups === 0 &&
    r.colonia === 0 && r.vidasUsadas === 1 && r.bonus > 1, JSON.stringify(r));
  conf('mas o álbum não se perde no renascimento', r.album === 31, String(r.album));

  r = await p.evaluate(() => { nivel = 50; return patasAGanhar(); });
  conf('e não dá pra renascer antes do nível 100', r === 0, String(r));

  // ---------- o surreal ----------
  r = await p.evaluate(() => {
    const medir = nv => { const a = nivel; nivel = nv; const s = nivelSurreal(); nivel = a; return +s.toFixed(2); };
    modoSurreal = 'auto';
    const auto = [medir(1), medir(100), medir(400), medir(1000)];
    modoSurreal = 'off'; const off = medir(1000);
    modoSurreal = 'max'; const max = medir(1);
    modoSurreal = 'auto';
    return { auto, off, max };
  });
  conf('a sala vai ficando estranha conforme o gato evolui (e o botão 🌀 manda nisso)',
    r.auto[0] === 0 && r.auto[1] > 0 && r.auto[2] > r.auto[1] && r.auto[3] === 1 &&
    r.off === 0 && r.max === 1, JSON.stringify(r));

  // ---------- FPS com a sala no talo ----------
  const fps = await p.evaluate(() => new Promise(res => {
    nivel = 1000; modoSurreal = 'max';
    for (const a of AMIGOS) quantosAmigos[a.id] = 4;
    arrumarGatinhos();
    presas = []; for (let i = 0; i < 8; i++) nascerPresa(false);
    setTimeout(() => {
      let n = 0; const t0 = performance.now();
      const conta = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(conta); else res(Math.round(n / 2)); };
      requestAnimationFrame(conta);
    }, 600);
  }));
  conf('com a sala derretendo e 48 gatos na colônia, o jogo continua liso', fps >= 25, fps + " fps");

  r = await p.evaluate(() => ({ gaveta: gaveta.size }));
  conf('as figurinhas ficam guardadas em vez de desenhar emoji toda hora',
    r.gaveta > 0 && r.gaveta <= 500, r.gaveta + " figurinhas");

  // ---------- save ----------
  const antes = await p.evaluate(() => {
    nivel = 77; xp = 123; peixes = 45678; patas = 3; album = ['Gatinho','Gato'];
    quantosAmigos = { mimi: 7 }; LOJA[0].qtd = 5; modoSurreal = 'off';
    salvar();
    return { nivel, peixes: Math.round(peixes), patas, album: album.length };
  });
  await p.reload(); await p.waitForTimeout(900);
  r = await p.evaluate(() => ({ nivel, peixes: Math.round(peixes), patas, album: album.length,
    mimi: quantosAmigos.mimi, up: LOJA[0].qtd, surreal: modoSurreal, chave: CHAVE }));
  conf('salva nível, peixes, patas, álbum, colônia, brinquedos e o modo 🌀',
    r.nivel===antes.nivel && Math.abs(r.peixes-antes.peixes) < 5000 && r.patas===antes.patas &&
    r.album>=antes.album && r.mimi===7 && r.up===5 && r.surreal==='off' && r.chave==='gatos_v1',
    JSON.stringify(r));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

/* ============================================================
   TORRE DE EMOJIS — teste do jogo
   Abre a torre num Chromium e confere empilhar, PERFEITO,
   bloco que cai fora, torre entortando, loja, cestas e save.

   Como rodar:
     npm i playwright-core
     node teste-torre.js
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const PASTA_PRINT = process.env.PRINTS || require('os').tmpdir();
const print = (n) => require('path').join(PASTA_PRINT, n);
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
const espera = (p,ms) => p.waitForTimeout(ms);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1000,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  await p.goto(URL); await espera(p,600);

  let r = await p.evaluate(() => ({ melhorias: LOJA.length, cestas: CESTAS.length,
    torre: torre.length, vidas, moedas, altura: alturaDaTorre() }));
  conf('abre com a base pronta, 36 melhorias e 4 cestas',
    r.melhorias===36 && r.cestas===4 && r.torre===1 && r.vidas===3, JSON.stringify(r));

  // empilhar certinho: coloca o bloco no lugar exato e solta
  r = await p.evaluate(() => new Promise(res => {
    const antes = { m: moedas, h: alturaDaTorre() };
    let n = 0;
    const iv = setInterval(() => {
      if (caindo) return;
      if (n >= 6) { clearInterval(iv); return res({ antes, moedas, altura: alturaDaTorre(),
        perfeitos: estat.perfeitos, blocos: estat.blocos, desvio: Math.round(desvio) }); }
      balanco = 0;                        // trava o balanço no meio = encaixe perfeito
      soltar(); n++;
    }, 260);
  }));
  conf('empilhar bloco em cima do outro faz a torre subir e paga',
    r.altura === r.antes.h + 6 && r.moedas > r.antes.m, JSON.stringify(r));
  conf('acertar no meio conta como PERFEITO e paga 3x', r.perfeitos >= 5, JSON.stringify(r));
  await p.screenshot({ path: print('torre1.png') });

  // errar feio: solta o bloco bem longe do topo
  r = await p.evaluate(() => new Promise(res => {
    const vidasAntes = vidas, alturaAntes = alturaDaTorre();
    balanco = Math.PI / 2;              // manda pro canto, longe da torre
    soltar();
    setTimeout(() => res({ vidasAntes, vidas, alturaAntes, altura: alturaDaTorre(),
      quedas: estat.quedas }), 900);
  }));
  conf('bloco que cai fora custa uma vida e não sobe a torre',
    r.vidas === r.vidasAntes - 1 && r.altura === r.alturaAntes, JSON.stringify(r));

  // torre entorta demais -> desaba
  r = await p.evaluate(() => new Promise(res => {
    desvio = 0; acabou = false; vidas = 9;
    let n = 0;
    const iv = setInterval(() => {
      if (caindo) return;
      if (acabou || n > 30) { clearInterval(iv); return res({ acabou, desvio: Math.round(desvio),
        texto: document.getElementById('fimTxt').textContent }); }
      // cada bloco um pouco mais pra direita que o anterior: a torre vai entortando
      balanco = Math.min(1.2, 0.18 + n * 0.16);
      soltar(); n++;
    }, 240);
  }));
  conf('torre muito torta desaba e mostra a tela de fim', r.acabou && /entortou/.test(r.texto), JSON.stringify(r));

  // o dinheiro fica guardado e a loja funciona
  r = await p.evaluate(() => { moedas = 5000; montarLoja();
    const antesValor = multValor(), antesVidas = vidasMax();
    comprar('valor0'); comprar('vida0');
    return { valor: multValor() > antesValor, vidas: vidasMax() === antesVidas + 1,
      itens: document.querySelectorAll('#loja .cesta').length, moedas }; });
  conf('a loja gasta o dinheiro e melhora o jogo', r.valor && r.vidas && r.itens===6, JSON.stringify(r));

  // cestas trancadas por recorde
  r = await p.evaluate(() => { recorde = 0; montarCestas();
    const trancadas = document.querySelectorAll('#cestas .trancada').length;
    recorde = 200; montarCestas();
    return { trancadasAntes: trancadas, trancadasDepois: document.querySelectorAll('#cestas .trancada').length }; });
  conf('cestas abrem conforme o recorde de altura', r.trancadasAntes===3 && r.trancadasDepois===0, JSON.stringify(r));

  // andaime começa a rodada mais alto
  r = await p.evaluate(() => { moedas = 1e6; comprar('andaime0'); comecarRodada();
    return { base: torre.length, andaime: andaime() }; });
  conf('o Andaime começa a rodada com blocos prontos', r.base === 1 + r.andaime && r.base > 1, JSON.stringify(r));

  // salvar e recarregar
  const antes = await p.evaluate(() => { salvar(); return { moedas: Math.round(moedas), recorde, album: album.length }; });
  await p.reload(); await espera(p,700);
  r = await p.evaluate(() => ({ moedas: Math.round(moedas), recorde, album: album.length,
    valor: multValor(), torre: torre.length }));
  conf('salva o dinheiro, o recorde e as melhorias',
    r.moedas===antes.moedas && r.recorde===antes.recorde && r.valor>1, JSON.stringify(r));
  await p.screenshot({ path: print('torre2.png') });

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
})();

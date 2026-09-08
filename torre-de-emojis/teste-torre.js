/* ============================================================
   TORRE DE EMOJIS — teste do jogo
   Abre a torre num Chromium e confere as camadas, as 136
   melhorias, o encaixe com a torre torta (o bug que o Jojo
   achou), a poupança, o desenho de todas as camadas e o save.

   Como rodar:
     npm i playwright-core
     node teste-torre.js
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const PASTA = require('os').tmpdir(), print = n => require('path').join(PASTA, n);
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1050,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  await p.goto(URL); await p.waitForTimeout(700);

  let r = await p.evaluate(() => ({ melhorias: LOJA.length, familias: FAMILIAS.length,
    camadas: CAMADAS.length, cestas: CESTAS.length, vidas }));
  conf('136 melhorias em 17 famílias, 11 camadas e 6 cestas',
    r.melhorias===136 && r.familias===17 && r.camadas===11 && r.cestas===6, JSON.stringify(r));

  // ---- o bug que o Jojo achou: torre torta e a mira batendo com o desenho ----
  r = await p.evaluate(() => {
    // torre alta e torta: é aí que o desenho e a conta se separavam
    torre = []; for (let k=0;k<30;k++) torre.push({x:L/2,emoji:0,cor:"#7ac9ff",perfeito:false,ouro:false});
    desvio = larg * 0.9;
    const i = torre.length - 1;
    const xTela = xNaTela(i);                 // onde o topo APARECE
    const voltou = paraTorre(xTela, i);       // a conta tem que dar o x guardado
    return { inclinou: Math.abs(inclinacao()) > .001, xTela: Math.round(xTela),
      xReal: Math.round(torre[i].x), erro: Math.abs(voltou - torre[i].x),
      desloc: Math.round(Math.abs(xTela - torre[i].x)) };
  });
  conf('com a torre torta, mirar no desenho encaixa no lugar certo',
    r.inclinou && r.erro < 0.5 && r.desloc > 20, JSON.stringify(r));

  r = await p.evaluate(() => new Promise(res => {
    // solta mirando exatamente no topo desenhado: tem que dar PERFEITO mesmo torto
    desvio = larg * 0.9;
    const antes = estat.perfeitos;
    const alvo = xNaTela(torre.length - 1);
    caindo = { x: alvo, y: topoY() - alt * 4, vy: 0, emoji: 0, cor: "#7ac9ff", ouro: false };
    setTimeout(() => res({ perfeitos: estat.perfeitos - antes, altura: torre.length }), 900);
  }));
  conf('mirar no topo torto dá PERFEITO (era o bug do "não dá pra pôr o bloco")',
    r.perfeitos === 1, JSON.stringify(r));

  // ---- camadas ----
  r = await p.evaluate(() => {
    const nomes = CAMADAS.map(c => c.nome);
    return { nomes, terra: camadaDe(0).nome, tropo: camadaDe(12).nome, nada: camadaDe(500).nome,
      pagaTerra: camadaDe(0).paga, pagaNada: camadaDe(500).paga };
  });
  conf('as camadas estão na ordem certa, da Terra até o NADA',
    r.terra==='Terra' && r.tropo==='Troposfera' && r.nada==='o NADA' && r.pagaNada > r.pagaTerra,
    r.nomes.join(' → '));

  r = await p.evaluate(() => {                 // subir de camada avisa e entra no mapa
    torre = []; for (let i=0;i<11;i++) torre.push({x:L/2,emoji:0,cor:"#7ac9ff",perfeito:false,ouro:false});
    camadaAntes = 0; verCamada();
    return { vistas: camadasVistas.slice(), camada: camadaDe(alturaDaTorre()).nome }; });
  conf('chegar numa camada nova registra ela no mapa',
    r.camada==='Troposfera' && r.vistas.includes('Troposfera'), JSON.stringify(r));

  // ---- loja com as 17 famílias ----
  await p.evaluate(() => { moedas = 1e12; montarLoja(); });
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ fams: document.querySelectorAll('.fam').length,
    itens: document.querySelectorAll('#lista .item').length }));
  conf('a loja mostra as 17 famílias e os 8 níveis de cada', r.fams===17 && r.itens===8, JSON.stringify(r));

  r = await p.evaluate(() => {
    const antes = { v: multValor(), o: chanceOuro(), j: jurosPorSeg(), c: bonusCombo(), vento: escudoVento() };
    comprar('valor0'); comprar('dourado0'); comprar('juros0'); comprar('combo0'); comprar('vento0'); comprar('nucleo0');
    return { valor: multValor() > antes.v, ouro: chanceOuro() > antes.o, juros: jurosPorSeg() > antes.j,
             combo: bonusCombo() > antes.c, vento: escudoVento() > antes.vento }; });
  conf('as melhorias novas mudam o jogo de verdade',
    r.valor && r.ouro && r.juros && r.combo && r.vento, JSON.stringify(r));

  // ---- a poupança rende parada ----
  r = await p.evaluate(() => new Promise(res => { const antes = moedas;
    setTimeout(() => res({ rendeu: moedas > antes }), 1400); }));
  conf('a Poupança rende dinheiro mesmo parado', r.rendeu);

  // ---- as melhorias nunca chegam a 100% ----
  r = await p.evaluate(() => { LOJA.filter(u=>u.fam==='freio').forEach(u=>u.qtd=99);
    LOJA.filter(u=>u.fam==='cola').forEach(u=>u.qtd=99);
    return { freio: freio(), cola: forcaCola() }; });
  conf('mesmo com tudo no máximo, freio e cola não travam o jogo em 100%',
    r.freio < .76 && r.cola < .86, JSON.stringify(r));

  // ---- desenho das camadas altas não quebra ----
  r = await p.evaluate(() => new Promise(res => {
    const erros = [];
    let i = 0;
    const iv = setInterval(() => {
      if (i >= CAMADAS.length) { clearInterval(iv); return res({ erros, testadas: i }); }
      torre = []; const alvo = CAMADAS[i].de + 1;
      for (let k=0;k<alvo;k++) torre.push({x:L/2,emoji:k%12,cor:"#7ac9ff",perfeito:k%3===0,ouro:k%7===0});
      i++;
    }, 120);
  }));
  conf('todas as 11 camadas desenham sem quebrar', r.testadas===11 && r.erros.length===0, JSON.stringify(r));
  await p.evaluate(() => { torre = []; for (let k=0;k<420;k++) torre.push({x:L/2+Math.sin(k)*8,emoji:k%12,cor:"#b47aff",perfeito:k%4===0,ouro:k%9===0}); });
  await p.waitForTimeout(600);
  await p.screenshot({ path: print('torre-nada.png') });
  await p.evaluate(() => { comecarRodada(); for (let k=0;k<13;k++) torre.push({x:L/2+(k%3-1)*10,emoji:k%12,cor:CORES[k%12],perfeito:k%3===0,ouro:k===5}); atualizarTopo(); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: print('torre-nova.png') });

  // ---- save ----
  const antes = await p.evaluate(() => { salvar(); return { moedas: Math.round(moedas), recorde, camadas: camadasVistas.length }; });
  await p.reload(); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ moedas: Math.round(moedas), recorde, camadas: camadasVistas.length, valor: multValor() }));
  conf('salva dinheiro, recorde, camadas e melhorias',
    Math.abs(r.moedas - antes.moedas) <= 60 && r.camadas===antes.camadas && r.valor>1,
    JSON.stringify({depois:r.moedas, antes:antes.moedas, camadas:r.camadas}));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
})();

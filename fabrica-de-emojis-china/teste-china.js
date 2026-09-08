/* ============================================================
   中國表情符號工廠 — teste do que é só desta fábrica

   Confere as raridades chinesas, o baralho que começa pela mesa
   e pelo zodíaco, os 10 tesouros, os festivais do calendário
   lunar e a caderneta de saves separada das outras duas fábricas.

   Como rodar (o teste das três fábricas precisa de http):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-china.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = process.env.BASE || 'http://127.0.0.1:8822/';
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  /* o microfone falso do Chromium deixa dar um "grito" de mentira no teste */
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
    args:['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ permissions:['microphone'] });
  const p = await ctx.newPage({ viewport:{width:1150,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  await p.goto(base + 'fabrica-de-emojis-china/'); await p.waitForTimeout(900);
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForTimeout(900);

  // ---------- a cara do jogo ----------
  let r = await p.evaluate(() => ({
    titulo: document.title,
    marca: (document.querySelector('.marca.cn')||{}).textContent,
    raridades: RARIDADES.length,
    primeiras: RARIDADES.slice(0,5).map(x=>x.nome),
    ultima: RARIDADES[119].nome,
  }));
  conf('o jogo é 中國表情符號工廠, com as 120 raridades chinesas',
    r.titulo==='中國表情符號工廠' && r.marca==='中國表情符號工廠' && r.raridades===120 &&
    r.primeiras[0]==='普通' && r.primeiras[3]==='玉' && r.ultima==='太初日', JSON.stringify(r.primeiras));

  // ---------- o baralho começa pela China ----------
  r = await p.evaluate(() => ({
    faixas: [0,1,2,3,4].map(ri => TIPOS.slice(ri*6, ri*6+6).map(t=>t.e).join('')),
    zodiaco: TIPOS.slice(12,24).map(t=>t.e).join(''),
    tipos: TIPOS.length,
    duplicado: BARALHO.length !== new Set(BARALHO).size,
  }));
  conf('as 5 primeiras raridades são a China: mesa, chá e o zodíaco inteiro',
    r.faixas[0]==='🏮🧧🀄🧨🥟🍜' && r.faixas[1]==='🍚🥢🍵🧋🫖🥡' &&
    r.zodiaco==='🐀🐂🐅🐇🐉🐍🐎🐐🐒🐓🐕🐖' && r.tipos===720, JSON.stringify(r.faixas));
  conf('nenhum emoji repetido no baralho', !r.duplicado);

  // ---------- os 10 tesouros ----------
  r = await p.evaluate(() => ({
    tesouros: SECRETOS.map(s=>s.e),
    nomes: SECRETOS.map(s=>s.nome),
    ordem: SECRETOS.every((s,i) => i===0 || s.chance < SECRETOS[i-1].chance),
    valeMais: SECRETOS.every((s,i) => i===0 || s.fator > SECRETOS[i-1].fator),
    noBaralho: SECRETOS.filter(s => LISTA_EMOJIS.includes(s.e)).map(s=>s.e),
  }));
  conf('10 tesouros chineses, cada um mais raro e mais caro que o anterior',
    r.tesouros.length===10 && r.ordem && r.valeMais, r.tesouros.join(' '));
  conf('nenhum tesouro cai como emoji comum', r.noBaralho.length===0, r.noBaralho.join(' '));

  // ---------- os festivais ----------
  r = await p.evaluate(() => {
    const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const qual = (a,m,d) => { const t = new Date(a,m-1,d,12).getTime();
      for (const x of TEMPORADAS) { if (x.estreia) continue; if (janelaDaTemporada(x,t)) return x.id; } return null; };
    return {
      nomes: TEMPORADAS.map(t=>t.id),
      cny: [iso(festival(2025,CNY)), iso(festival(2026,CNY)), iso(festival(2027,CNY))],
      outono: [iso(festival(2025,MEIO_OUTONO)), iso(festival(2026,MEIO_OUTONO))],
      emFesta: { ano:qual(2026,2,18), lant:qual(2026,3,3), qing:qual(2026,4,5),
                 barcos:qual(2026,6,19), qixi:qual(2026,8,19), outono:qual(2026,9,25),
                 nacional:qual(2026,10,3), solteiros:qual(2026,11,11), inverno:qual(2026,12,21) },
      foraDaFesta: { solteiros10:qual(2026,11,10), nacional8:qual(2026,10,8) },
      semTabela: iso(festival(2099,CNY)),      // ano fora da tabela cai no aproximado
    };
  });
  conf('10 festivais chineses no calendário', r.nomes.length===10 && r.nomes.includes('chunjie') &&
    r.nomes.includes('zhongqiu') && r.nomes.includes('shuang11'), r.nomes.join(' '));
  conf('o Ano Novo Chinês segue a lua: 29/01/2025, 17/02/2026, 06/02/2027',
    r.cny.join()==='2025-01-29,2026-02-17,2027-02-06', r.cny.join(' '));
  conf('o Meio-Outono também: 06/10/2025 e 25/09/2026',
    r.outono.join()==='2025-10-06,2026-09-25', r.outono.join(' '));
  conf('cada festival abre no dia certo',
    r.emFesta.ano==='chunjie' && r.emFesta.lant==='yuanxiao' && r.emFesta.qing==='qingming' &&
    r.emFesta.barcos==='duanwu' && r.emFesta.qixi==='qixi' && r.emFesta.outono==='zhongqiu' &&
    r.emFesta.nacional==='guoqing' && r.emFesta.solteiros==='shuang11' && r.emFesta.inverno==='dongzhi',
    JSON.stringify(r.emFesta));
  conf('e fecha fora dele (雙十一 é só o dia 11; a Semana Dourada acaba no dia 7)',
    r.foraDaFesta.solteiros10===null && r.foraDaFesta.nacional8===null, JSON.stringify(r.foraDaFesta));
  conf('ano fora da tabela lunar ainda tem festival, na data aproximada',
    r.semTabela==='2099-02-05', r.semTabela);

  // ---------- temas e modos ----------
  r = await p.evaluate(() => ({
    temas: TEMAS.slice(0,8).map(t=>t.nome),
    modos: MODOS.map(m=>m.nome),
    totalEmojis: TOTAL_EMOJIS,
  }));
  conf('os temas da caixa e os modos ganharam nome chinês',
    r.temas[0]==='工廠' && r.temas[1]==='竹林' &&
    r.modos[0]==='普通' && r.modos[3]==='自由', JSON.stringify(r.modos));
  conf('o índice continua com 800 emojis pra achar', r.totalEmojis===800, String(r.totalEmojis));

  // ---------- as três fábricas não se misturam ----------
  r = await p.evaluate(() => { novoJogo('normal'); dinheiro = 987654; recorde = 987654; salvar();
    return Object.keys(localStorage).sort(); });
  conf('a fábrica da China só escreve em chaves fabricaChina_*',
    r.length>0 && r.every(k=>k.startsWith('fabricaChina_')), r.join(' '));
  const chavesChina = r;

  for (const [pasta, prefixo] of [['fabrica-de-emojis/', 'fabricaEmojis_'], ['fabrica-de-emojis-2/', 'fabricaEmojis2_']]) {
    await p.goto(base + pasta); await p.waitForTimeout(900);
    const x = await p.evaluate(pref => ({
      jogos: jogos.length, chave: CHAVE_INDICE,
      chinaIntacta: Object.keys(localStorage).filter(k=>k.startsWith('fabricaChina_')).length,
    }), prefixo);
    conf('a fábrica ' + pasta + ' abre vazia e não mexe na da China',
      x.jogos===0 && x.chave===prefixo+'jogos' && x.chinaIntacta===chavesChina.length, JSON.stringify(x));
  }

  await p.goto(base + 'fabrica-de-emojis-china/'); await p.waitForTimeout(900);
  r = await p.evaluate(() => { abrirJogo(jogos[0].id); return { jogos: jogos.length, rec: Math.round(recorde) }; });
  conf('voltando pra China, o jogo dela continua do jeito que ficou',
    r.jogos===1 && r.rec===987654, JSON.stringify(r));

  // ---------- o jogo inteiro em chinês, e o botão que volta pro português ----------
  r = await p.evaluate(() => ({
    idioma,
    zh: { rar: RARIDADES[0].nome, up: TODOS[0].nome, upTxt: TODOS[0].txt(TODOS[0].val),
          conq: CONQUISTAS[0].nome + ' — ' + CONQUISTAS[0].desc,
          aba: document.querySelector('.abaT').textContent.trim(),
          bt: document.getElementById('btFazer').textContent,
          stat: document.querySelector('.stat .k').textContent,
          temp: TEMPORADAS[1].conta.slice(0, 6) },
  }));
  conf('em 中文 tudo aparece em chinês: raridade, upgrade, conquista, aba e botão',
    r.idioma==='zh' && r.zh.rar==='普通' && r.zh.up==='青銅點擊' && /表情符號/.test(r.zh.upTxt) &&
    /企業家/.test(r.zh.conq) && r.zh.aba==='🛒 商店' && r.zh.bt==='做表情符號' && r.zh.stat==='每次點擊',
    JSON.stringify(r.zh));

  await p.evaluate(() => trocarIdioma()); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({
    idioma, rar: RARIDADES[0].nome, up: TODOS[0].nome,
    conq: CONQUISTAS[0].nome + ' — ' + CONQUISTAS[0].desc,
    aba: document.querySelector('.abaT').textContent.trim(),
    bt: document.getElementById('btFazer').textContent,
    botao: document.getElementById('btIdioma').textContent,
  }));
  conf('o botão 中/A devolve o jogo pro português, com o nome chinês do lado',
    r.idioma==='pt' && r.rar==='普通 Comum' && r.up==='Clique de Bronze' &&
    /Empresário/.test(r.conq) && r.aba==='🛒 LOJA' && r.bt==='FAZER EMOJI' && r.botao==='A',
    JSON.stringify(r));

  await p.reload(); await p.waitForTimeout(900);
  r = await p.evaluate(() => ({ idioma, aba: document.querySelector('.abaT').textContent.trim() }));
  conf('a língua escolhida fica salva no aparelho', r.idioma==='pt' && r.aba==='🛒 LOJA', JSON.stringify(r));
  await p.evaluate(() => trocarIdioma()); await p.waitForTimeout(300);

  // ---------- 🎡 a roleta ----------
  r = await p.evaluate(() => ({
    premios: PREMIOS.length, pesos: PREMIOS.every(x => x.peso > 0),
    custo: CUSTO_GIRO, gratis: GIRO_GRATIS_MIN,
    ordem: PREMIOS[PREMIOS.length - 1].k === 'pxJackpot' &&
           PREMIOS[PREMIOS.length - 1].peso < PREMIOS[0].peso,
  }));
  conf('a roleta tem 12 prémios, e o jackpot do dragão é o mais raro',
    r.premios===12 && r.pesos && r.ordem && r.custo===2 && r.gratis===10, JSON.stringify(r));

  r = await p.evaluate(() => { jogos.length ? abrirJogo(jogos[0].id) : novoJogo('normal');
    return { giros, prox: proxGiro > Date.now() }; });
  conf('um jogo novo já começa com um giro na mão', r.giros >= 1, JSON.stringify(r));

  r = await p.evaluate(() => new Promise(res => {
    mostrarPainel('roleta'); giros = 3; dinheiro = 0; recorde = 1e6; cristais = 0;
    const antes = { giros, total: estat.giros };
    girarRoleta();
    setTimeout(() => res({ antes, giros, total: estat.giros, girando,
      mudouAlgo: dinheiro > 0 || cristais > 0 || bolas.length > 0 || buffs.length > 0 ||
                 giros > antes.giros - 1 || !!estrela }), 5000);
  }));
  conf('girar gasta um giro, para sozinha e entrega o prémio',
    r.giros === r.antes.giros - 1 + (r.giros > r.antes.giros - 1 ? 2 : 0) || r.total === r.antes.total + 1,
    JSON.stringify(r));
  conf('o prémio da roleta muda mesmo o jogo', r.mudouAlgo && !r.girando, JSON.stringify(r));

  r = await p.evaluate(() => { cristais = 10; const a = giros; comprarGiro();
    return { antes:a, giros, cristais }; });
  conf('dá pra comprar giro com cristal', r.giros === r.antes + 1 && r.cristais === 8, JSON.stringify(r));

  // ---------- 🎤 o grito ----------
  r = await p.evaluate(() => {
    novoJogo('normal'); fabricar(40);
    const antes = { gritos: estat.gritos, feitos: estat.feitos, vy: bolas.length ? bolas[0].vy : 0 };
    gritar(0.9);
    return { antes, gritos: estat.gritos, feitos: estat.feitos, tremor,
      pulou: bolas.length ? bolas[0].vy < antes.vy : false, gravando };
  });
  conf('gritar sacode a caixa, faz os emojis pularem e cai um monte de emoji novo',
    r.gritos === r.antes.gritos + 1 && r.feitos > r.antes.feitos && r.tremor > 10 && r.pulou,
    JSON.stringify(r));
  conf('e depois do grito o jogo grava um segundo pra devolver (o "repete")', r.gravando === true);

  r = await p.evaluate(() => ({ limiar: LIMIAR_GRITO, ligado: micLigado, temBotao: !!document.getElementById('btMic') }));
  conf('o microfone começa desligado — só liga quando você aperta o botão',
    r.ligado === false && r.temBotao && r.limiar > 0, JSON.stringify(r));

  await p.evaluate(() => mostrarPainel('roleta'));
  await p.click('#btMic'); await p.waitForTimeout(2200);
  r = await p.evaluate(() => ({ ligado: micLigado, nivel: micNivel, barra: document.getElementById('barraMic').style.width }));
  conf('o botão liga o microfone de verdade e a barrinha do volume anda',
    r.ligado === true && r.nivel > 0 && parseFloat(r.barra) > 0, JSON.stringify(r));

  r = await p.evaluate(() => new Promise(res => {                 // o eco: grava ~1s e devolve mais agudo
    gritar(0.8);
    const gravou = gravando;
    setTimeout(() => res({ gravou, aindaGravando: gravando, sobrou: gravPedacos.length }), 1800);
  }));
  conf('o grito grava e devolve o som sozinho, sem sobrar nada na memória',
    r.gravou === true && r.aindaGravando === false && r.sobrou === 0, JSON.stringify(r));

  await p.click('#btMic'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ ligado: micLigado, fluxo: !!micFluxo, no: !!micNo }));
  conf('e desligar o microfone solta o aparelho de verdade',
    r.ligado === false && !r.fluxo && !r.no, JSON.stringify(r));

  // ---------- as duas conquistas novas ----------
  r = await p.evaluate(() => {
    estat.giros = 25; estat.gritos = 10; checarConquistas();
    return { roleta: conquistasFeitas.includes('roleta'), grito: conquistasFeitas.includes('grito'),
             total: CONQUISTAS.length };
  });
  conf('as conquistas da roleta e do grito destravam', r.roleta && r.grito && r.total===82, JSON.stringify(r));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

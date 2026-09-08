/* ============================================================
   MINA DE EMOJIS — teste do jogo
   Abre a mina num Chromium e confere cavar, loja, robô,
   dinamite, camadas, álbum e o save.

   Como rodar:
     npm i playwright-core
     node teste-mina.js
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1100,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  await p.goto(URL); await p.waitForTimeout(600);

  let r = await p.evaluate(() => ({ camadas: CAMADAS.length, upgrades: LOJA.length,
    album: CAMADAS.length*7, dano: dano(), moedas, fundura }));
  conf('abre com 8 camadas, 48 melhorias e 56 emojis pra achar',
    r.camadas===8 && r.upgrades===48 && r.album===56 && r.dano===1, JSON.stringify(r));

  // cavar com o botão
  await p.evaluate(() => { for(let i=0;i<40;i++) cavarProxima(); });
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ fundura, moedas, pedras: estat.pedras, cavadas: cavadas.size }));
  conf('o botão CAVAR desce o poço e dá moedas', r.fundura>3 && r.moedas>0 && r.pedras>0, JSON.stringify(r));

  // clicar numa pedra encostada funciona, e numa solta no meio da rocha não
  r = await p.evaluate(() => {
    const antes = estat.batidas;
    const podeAoLado = podeCavar(colDoPoco+1, fundura);       // encostada no buraco
    const naoPode = podeCavar(colDoPoco, fundura+9);          // no meio da pedra, longe
    if (podeAoLado) bater(colDoPoco+1, fundura);
    return { podeAoLado, naoPode, bateu: estat.batidas > antes };
  });
  conf('só dá pra cavar pedra encostada no buraco', r.podeAoLado && !r.naoPode && r.bateu, JSON.stringify(r));

  // pedra mais funda é mais dura
  r = await p.evaluate(() => ({ perto: dureza(2), fundo: dureza(60), maisFundo: dureza(90) }));
  conf('quanto mais fundo, mais dura a pedra', r.fundo > r.perto && r.maisFundo > r.fundo, JSON.stringify(r));

  // upgrades
  r = await p.evaluate(() => { moedas = 1e9; montarLoja();
    const antesDano = dano(), antesRobo = velRobo();
    comprar('picareta0'); comprar('picareta1'); comprar('robo0'); comprar('lanterna0'); comprar('dinamite0');
    return { dano: dano()>antesDano, robo: velRobo()>antesRobo, luz: alcanceLuz()>0, bomba: temBomba(),
             itens: document.querySelectorAll('#pLoja .item').length }; });
  conf('loja: picareta, robô, lanterna e dinamite funcionam',
    r.dano && r.robo && r.luz && r.bomba && r.itens===6, JSON.stringify(r));

  // robô cava sozinho
  r = await p.evaluate(() => new Promise(res => { const antes = fundura;
    setTimeout(() => res({ antes, depois: fundura }), 2500); }));
  conf('o robô cava sozinho', r.depois > r.antes, JSON.stringify(r));

  // dinamite
  r = await p.evaluate(() => { const antes = { p: estat.pedras, m: moedas };
    const custo = custoBomba(), valorQuebrado = celulasDaExplosao(raioBomba()) * valorDaPedra(fundura+1);
    soltarDinamite();
    return { quebrou: estat.pedras - antes.p, bombas: estat.bombas,
             custo: Math.round(custo), valorQuebrado: Math.round(valorQuebrado),
             naoEhMaquinaDeMoeda: custo > valorQuebrado }; });
  conf('a dinamite explode várias pedras de uma vez', r.quebrou>=5 && r.bombas===1, JSON.stringify(r));
  conf('a dinamite custa mais do que rende (é atalho, não dinheiro fácil)', r.naoEhMaquinaDeMoeda, JSON.stringify(r));

  // camadas novas e álbum
  r = await p.evaluate(() => {
    for (let i=0;i<900 && fundura<50;i++) cavarProxima();
    return { fundura, camada: camadaDe(fundura).nome, album: album.length,
             emojis: estat.emojis, camadasVistas: new Set(album.map(a=>a.split('|')[0])).size }; });
  conf('cavando fundo aparecem camadas novas e emojis no álbum',
    r.fundura>=48 && r.album>0 && r.camadasVistas>=3, JSON.stringify(r));

  await p.click('.aba[data-p="album"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ faixas: document.querySelectorAll('#albumLista .faixa').length,
    fichas: document.querySelectorAll('#albumLista .ficha').length,
    trancadas: /🔒/.test(document.getElementById('albumLista').textContent) }));
  conf('álbum mostra as 8 camadas com 7 fichas cada', r.faixas===8 && r.fichas===56, JSON.stringify(r));

  await p.click('.aba[data-p="stat"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => document.querySelectorAll('#pStat > div').length);
  conf('stats com 13 linhas', r===13, 'linhas: '+r);
  await p.screenshot({ path:'mina.png' });

  // salvar e recarregar
  const antes = await p.evaluate(() => { salvar();
    return { fundura, moedas: Math.round(moedas), album: album.length, tamanho: localStorage.getItem('minaEmojis_v1').length }; });
  await p.reload(); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ fundura, moedas: Math.round(moedas), album: album.length,
    dano: dano(), cavadas: cavadas.size, topo: topoLimpo }));
  conf('salva e volta igualzinho', r.fundura===antes.fundura && r.album===antes.album && r.dano>1, JSON.stringify(r));
  conf('o save não fica gigante (só guarda os buracos perto do fundo)', antes.tamanho < 60000, antes.tamanho + ' bytes');

  await p.click('.aba[data-p="loja"]'); await p.waitForTimeout(300);
  await p.screenshot({ path:'mina2.png' });
  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
})();

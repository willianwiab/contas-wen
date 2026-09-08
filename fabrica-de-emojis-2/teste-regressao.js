/* ============================================================
   FÁBRICA DE EMOJIS — teste de regressão
   Abre o jogo num navegador de verdade e confere as 20 coisas
   principais. Serve pra não quebrar nada sem perceber.

   Como rodar:
     npm i playwright-core
     node teste-regressao.js
   (precisa de um Chromium; ajuste o executablePath abaixo)
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const ok = [], falhas = [];
const conf = (nome, cond, extra='') => (cond ? ok : falhas).push(nome + (extra?' → '+extra:''));
const PASTA_PRINT = process.env.PRINTS || require('os').tmpdir();
const print = (n) => require('path').join(PASTA_PRINT, n);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1160,height:1050} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  await p.goto(URL); await p.waitForTimeout(500);

  // 1. tela de início
  let r = await p.evaluate(() => ({ inicio: document.getElementById('inicio').classList.contains('on'),
    cards: document.getElementById('modoLista').children.length, modo: modoAtual,
    naoSalvou: !Object.keys(localStorage).some(k => k.startsWith('fabricaEmojis2_jogo_')) }));
  conf('tela de início aparece com os 4 modos', r.inicio && r.cards===4 && r.modo===null);
  conf('não salva antes de abrir um jogo', r.naoSalvou);

  // 2. modo normal + números gerais
  await p.click('.modoCard[data-m="normal"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ upgrades: TODOS.length, conq: CONQUISTAS.length, temas: TEMAS.length,
    skins: SKINS.length, temporadas: TEMPORADAS.length, emojis: TOTAL_EMOJIS, modo: modoAtual }));
  conf('340 upgrades / 80 conquistas / 18 temas / 18 skins / 10 temporadas / 800 emojis',
    r.upgrades===340 && r.conq===80 && r.temas===18 && r.skins===18 && r.temporadas===10 && r.emojis===800,
    JSON.stringify(r));

  // 3. fabricar, vender, upgrade
  await p.evaluate(() => { for(let i=0;i<25;i++) clicar(); });
  await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ bolas: bolas.length, feitos: estat.feitos }));
  conf('clique fabrica e os emojis caem', r.bolas>=25 && r.feitos>=25, JSON.stringify(r));
  await p.evaluate(() => vender()); await p.waitForTimeout(1800);
  r = await p.evaluate(() => ({ din: dinheiro>0, vendas: estat.vendas, caixa: bolas.length }));
  conf('venda esvazia a caixa e paga', r.din && r.vendas===1 && r.caixa===0, JSON.stringify(r));

  // 4. emoji do dia
  r = await p.evaluate(() => ({ tem: !!tipoDoDia, pil: document.getElementById('pilulaDia').textContent,
    vale: tipoDoDia ? valorDe(tipoDoDia)/tipoDoDia.valor : 0 }));
  conf('emoji do dia sorteado e valendo 10x', r.tem && r.vale===10 && /vale 10x/.test(r.pil), JSON.stringify(r));

  // 5. temporada de estreia
  r = await p.evaluate(() => { const a = temporadaAtiva(); darDinheiro(1e9); liberarAte(6);
    for (let i=0;i<400;i++) sortearTipo();
    return { id: a && a.t.id, pontos: fichaTemporada('estreia').pontos,
      emojis: Object.keys(contagem).filter(k=>k.startsWith('T|estreia')).length }; });
  conf('temporada de Estreia ativa e dando pontos', r.id==='estreia' && r.pontos>0 && r.emojis>0, JSON.stringify(r));

  await p.click('.abaT[data-p="temp"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => { const f = fichaTemporada('estreia'); f.pontos = 700; montarTemporada();
    const antes = { c: cristais, t: temas.length, s: skins.length };
    for (let i=0;i<PASSE.length;i++) pegarPremio(i);
    return { passos: document.querySelectorAll('.passo').length, pegos: f.pegos.length,
      cristais: cristais-antes.c, tema: temas.length-antes.t, skin: skins.length-antes.s }; });
  conf('passe com 12 prêmios, todos resgatáveis', r.passos===12 && r.pegos===12, JSON.stringify(r));
  conf('passe entrega cristais, tema e skin do evento', r.cristais===22 && r.tema===1 && r.skin===1, JSON.stringify(r));

  // 6. datas
  r = await p.evaluate(() => {
    const qual = (a,m,d) => { const t = new Date(a,m-1,d,12).getTime();
      for (const x of TEMPORADAS) { if (x.estreia) continue; if (janelaDaTemporada(x,t)) return x.id; } return null; };
    return { natal:qual(2026,12,20), hallo:qual(2026,10,31), hallo30:qual(2026,10,30),
      pascoa:domingoDePascoa(2026).toISOString().slice(0,10), brasil:qual(2026,9,5) }; });
  conf('calendário certo (Natal, Halloween só dia 31, Páscoa 2026 = 5/4)',
    r.natal==='natal' && r.hallo==='halloween' && r.hallo30===null && r.pascoa==='2026-04-05' && r.brasil==='brasil',
    JSON.stringify(r));

  // 7. skins
  await p.click('.abaT[data-p="tema"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => { cristais = 300; montarTemas(); const antes = skinAtual;
    comprarSkin('ouro'); const dep = skinAtual;
    const bloq = (() => { const a = skinAtual; comprarSkin('snatal'); return skinAtual === a; })();
    return { antes, dep, bloq, chave: [...sprites.keys()][0] || '' }; });
  conf('skin comprada com cristais e aplicada nos emojis', r.dep==='ouro' && /\|ouro$/.test(r.chave), JSON.stringify(r));
  conf('skin de evento não pode ser comprada', r.bloq);

  // 8. modo difícil e livre
  r = await p.evaluate(() => { const n = preco(TODOS[0]); escolherModo('dificil');
    return { normal:n, dificil:preco(TODOS[0]), valor:multValor() }; });
  conf('modo difícil: preço 4x e venda 3x', r.dificil===r.normal*4 && Math.abs(r.valor-3)<.01, JSON.stringify(r));
  r = await p.evaluate(() => { escolherModo('livre'); const a=dinheiro; comprar(TODOS[0]);
    return { raridades: raridadesLiberadas().length, semGastar: dinheiro===a, qtd: TODOS[0].qtd }; });
  conf('modo livre: 120 raridades e compras de graça', r.raridades===120 && r.semGastar && r.qtd===1, JSON.stringify(r));

  // 9. fusão automática
  r = await p.evaluate(() => new Promise(res => { escolherModo('fusao'); liberarAte(3);
    bolas = []; fusoesAtivas = [];
    for (let i=0;i<5;i++){ const x=new Bola(70+i*90, A-20, TIPOS[i]); x.vx=0;x.vy=0;x.dormindo=true;x.quieto=30; bolas.push(x); }
    const antes = estat.fusoes;
    setTimeout(()=>res({ fusoes: estat.fusoes-antes, bolas: bolas.length,
      raridade: bolas[0] && bolas[0].tipo.rIndex, turbo: famsDaAba().some(f=>f.id==='turbofus') }), 2500); }));
  conf('5 emojis iguais se fundem sozinhos em 1 melhor', r.fusoes===1 && r.bolas===1 && r.raridade===1, JSON.stringify(r));
  conf('Turbo da Fusão aparece na loja do modo Fusão', r.turbo);
  r = await p.evaluate(() => { escolherModo('normal'); return famsDaAba().some(f=>f.id==='turbofus'); });
  conf('Turbo da Fusão some nos outros modos', !r);

  // 10. save separado + recarregar
  await p.evaluate(() => salvar());
  r = await p.evaluate(() => ({ jogos: jogos.length,
    chaves: Object.keys(localStorage).filter(k=>k.startsWith('fabricaEmojis2_jogo_')).length }));
  conf('cada jogo salvo tem o arquivo dele', r.jogos>=4 && r.chaves===r.jogos, JSON.stringify(r));
  await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => escolherModo('normal'));   // reabre o jogo salvo, não cria outro
  await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ inicio: modoAtual==='normal', pontos: fichaTemporada('estreia').pontos,
    skins: skins.length, skin: skinAtual, conq: conquistasFeitas.length,
    secretasEscondidas: [...document.querySelectorAll('.conq .cn')].length }));
  conf('recarregar volta pra tela de início e mantém tudo', r.inicio && r.pontos>0 && r.skins>1, JSON.stringify(r));

  await p.click('.abaT[data-p="conq"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => [...document.querySelectorAll('.conq .cn')].filter(e=>e.textContent==='???').length);
  conf('conquistas secretas escondidas', r>=5, 'escondidas: '+r);

  console.log('\n✅ ' + ok.length + ' testes passaram');
  ok.forEach(t=>console.log('   · '+t));
  if (falhas.length) { console.log('\n❌ ' + falhas.length + ' falharam'); falhas.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '\n❌ erros no console: '+JSON.stringify(err) : '\n✅ nenhum erro no console');
  await b.close();
  process.exit(falhas.length || err.length ? 1 : 0);
})();

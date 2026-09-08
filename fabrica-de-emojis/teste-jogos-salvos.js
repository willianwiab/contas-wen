/* ============================================================
   FÁBRICA DE EMOJIS — teste dos jogos salvos
   Confere criar, abrir, salvar na mão, renomear e apagar jogo,
   e que o save antigo (de antes dos slots) vira um jogo salvo.

   Como rodar:
     npm i playwright-core
     node teste-jogos-salvos.js
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const PASTA_PRINT = process.env.PRINTS || require('os').tmpdir();
const print = (n) => require('path').join(PASTA_PRINT, n);
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const ctx = await b.newContext();
  const p = await ctx.newPage({ viewport:{width:1160,height:1050} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  p.on('dialog', d => d.accept());          // aceita o confirm de apagar

  // 1. migração: simula um save antigo por modo
  await ctx.addInitScript(() => {
    localStorage.setItem('fabricaEmojis_v5_normal', JSON.stringify({
      v:6, dinheiro:1234, recorde:98765, descobertos:['r0|🙂','r0|😀'], conquistas:['din0'],
      estat:{tempo:3600000, cliques:50}, contagem:{}, temas:['padrao'], temaAtual:'padrao', ups:[] }));
  });
  await p.goto(URL); await p.waitForTimeout(600);
  let r = await p.evaluate(() => ({ jogos: jogos.length, nome: jogos[0] && jogos[0].nome,
    rec: jogos[0] && jogos[0].resumo.recorde, cards: document.querySelectorAll('.jogoAbrir').length }));
  conf('save antigo virou um jogo salvo', r.jogos===1 && r.rec===98765 && r.cards===1, JSON.stringify(r));

  // 2. abrir o jogo migrado
  await p.click('.jogoAbrir'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ din: dinheiro, rec: recorde, jogo: jogoAtual && jogoAtual.nome, modo: modoAtual }));
  conf('abrir o jogo carrega o progresso', r.din===1234 && r.rec===98765 && r.modo==='normal', JSON.stringify(r));

  // 3. novo jogo não apaga o outro
  await p.evaluate(() => { for(let i=0;i<10;i++) clicar(); salvar(); });
  await p.click('#btModo'); await p.waitForTimeout(400);
  await p.click('.modoCard[data-m="dificil"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ jogos: jogos.length, atual: jogoAtual.nome, modo: modoAtual,
    din: dinheiro, zerado: recorde===0 }));
  conf('jogo novo começa do zero e o antigo continua salvo', r.jogos===2 && r.zerado && r.modo==='dificil', JSON.stringify(r));
  await p.click('#btModo'); await p.waitForTimeout(400);
  r = await p.evaluate(() => { const antigo = jogos.find(j=>j.modo==='normal');
    return { existe: !!antigo, rec: antigo && antigo.resumo.recorde, cards: document.querySelectorAll('.jogoAbrir').length }; });
  conf('os dois jogos aparecem na lista', r.existe && r.rec>=98765 && r.cards===2, JSON.stringify(r));

  // 4. salvar na mão
  await p.click('.jogoAbrir'); await p.waitForTimeout(400);
  r = await p.evaluate(() => { dinheiro = 555555; salvarNaMao();
    const g = JSON.parse(localStorage.getItem('fabricaEmojis_jogo_'+jogoAtual.id));
    return { salvou: g.dinheiro===555555, toast: document.getElementById('toast').textContent }; });
  conf('botão 💾 salva na hora', r.salvou && /salvo/.test(r.toast), JSON.stringify(r));

  // 5. renomear
  p.removeAllListeners('dialog');
  p.on('dialog', d => d.message().includes('Nome') ? d.accept('Jogo do Jojo') : d.accept());
  await p.click('#btModo'); await p.waitForTimeout(300);
  await p.click('[data-ren]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => jogos.map(j=>j.nome));
  conf('dá pra renomear o jogo', r.includes('Jogo do Jojo'), JSON.stringify(r));

  // 6. apagar
  const antes = await p.evaluate(() => jogos.length);
  await p.click('.jogoCard:last-child [data-del]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ jogos: jogos.length, chaves: Object.keys(localStorage).filter(k=>k.startsWith('fabricaEmojis_jogo_')).length }));
  conf('apagar tira o jogo da lista e do armazenamento', r.jogos===antes-1 && r.chaves===r.jogos, JSON.stringify(r));

  // 7. recarregar mantém os jogos
  await p.reload(); await p.waitForTimeout(600);
  r = await p.evaluate(() => ({ jogos: jogos.length, inicio: document.getElementById('inicio').classList.contains('on'),
    nomes: jogos.map(j=>j.nome) }));
  conf('a lista de jogos sobrevive ao recarregar', r.jogos===1 && r.inicio, JSON.stringify(r));

  // 8. apagar o jogo aberto volta pra tela de início
  await p.click('.jogoAbrir'); await p.waitForTimeout(400);
  p.removeAllListeners('dialog'); p.on('dialog', d => d.accept());
  await p.click('#btModo'); await p.waitForTimeout(300);
  await p.click('[data-del]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ jogos: jogos.length, jogoAtual, inicio: document.getElementById('inicio').classList.contains('on') }));
  conf('apagar o jogo aberto volta pro início', r.jogos===0 && !r.jogoAtual && r.inicio, JSON.stringify(r));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length+' falharam'); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
})();

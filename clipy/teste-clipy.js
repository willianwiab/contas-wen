/* ============================================================
   CLIPY — teste
   Confere que as 30 regras existem e disparam com o texto certo,
   que os botões do balão MEXEM NO PAPEL de verdade, que a conversa
   responde, que dá pra calar ele, e que o site abre sem internet.

   Como rodar (precisa servir por http):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-clipy.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8822/clipy/';
const ok = [], fail = [];
const conf = (n, c, e = '') => (c ? ok : fail).push(n + (e ? ' → ' + e : ''));
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

/* escreve no papel e espera o Clipy reagir (ele pensa a cada 900ms) */
async function escrever(p, txt) {
  await p.fill('#papel', txt);
  /* trocar o texto inteiro de uma vez conta como "apagou tudo" — no teste isso
     roubaria a vez das outras regras, então zeramos essa conta */
  await p.evaluate(() => {
    Clipy.zerarApagados();
    Clipy.cerebro.proximaChance = 0;
    Clipy.cerebro.ultimaVez = {};        // sem esperar o descanso de cada regra
    Clipy.lerPapel();
  });
  await p.waitForTimeout(1300);
  return p.evaluate(() => document.getElementById('balao').hidden ? null
    : document.getElementById('balaoTexto').textContent);
}

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--use-gl=swiftshader'] });
  const ctx = await b.newContext();
  const p = await ctx.newPage({ viewport: { width: 1280, height: 900 } });
  const err = [];
  p.on('pageerror', e => err.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') err.push('C: ' + m.text()); });

  await p.goto(base);
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  await p.evaluate(() => localStorage.removeItem('clipy_v1'));
  await p.reload();
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });

  /* ---------- o site abre ---------- */
  let r = await p.evaluate(() => ({
    titulo: document.title,
    regras: Clipy.REGRAS.length,
    ids: new Set(Clipy.REGRAS.map(x => x.id)).size,
    abas: document.querySelectorAll('.aba').length,
    canvas: !!document.getElementById('telaClipy').getContext('2d') }));
  conf('o site abre com o Clipy desenhado, as 5 abas e as 30 regras carregadas',
    /Clipy/.test(r.titulo) && r.regras === 30 && r.ids === 30 && r.abas === 5 && r.canvas,
    JSON.stringify(r));

  /* ---------- toda regra tem fala, botões e um jeito de disparar ---------- */
  r = await p.evaluate(() => {
    const ruins = [];
    for (const x of Clipy.REGRAS) {
      if (!x.fala || !x.botoes || !x.botoes.length || typeof x.olho !== 'function' ||
          !(x.peso > 0) || !(x.espera > 0)) ruins.push(x.id);
    }
    return ruins;
  });
  conf('nenhuma das 30 regras está pela metade: todas com fala, botões e peso',
    r.length === 0, JSON.stringify(r));

  /* ---------- A CLÁSSICA ---------- */
  r = await escrever(p, 'Prezado João,\n\nTudo bem com você?');
  conf('a clássica: escrever "Prezado" faz ele aparecer perguntando da carta',
    r && /carta/i.test(r), JSON.stringify(r));

  /* ---------- e o botão MEXE no papel ---------- */
  await p.click('#balaoBotoes button:nth-child(1)');        // "Sim, me ajude a escrever"
  r = await p.evaluate(() => document.getElementById('papel').value);
  conf('e o botão faz alguma coisa DE VERDADE: monta a carta com data e despedida',
    /Prezado\(a\)/.test(r) && /Atenciosamente/.test(r) && /\d{4}/.test(r), r.slice(0, 46) + '…');

  /* ---------- lista → numerar ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  r = await escrever(p, '- comprar pão\n- lavar a louça\n- dar comida pro gato');
  conf('três traços viram uma lista e ele se oferece pra numerar', r && /lista/i.test(r), JSON.stringify(r));
  await p.click('#balaoBotoes button:nth-child(1)');
  r = await p.evaluate(() => document.getElementById('papel').value);
  conf('e numerar numera mesmo: 1. 2. 3.',
    /^1\. comprar/m.test(r) && /^2\. lavar/m.test(r) && /^3\. dar/m.test(r), JSON.stringify(r));

  /* ---------- conta → somar ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  r = await escrever(p, 'R$ 10,50 do lanche\nR$ 4,00 do suco\nR$ 25 do livro');
  conf('valores em R$ fazem ele oferecer a soma', r && /som/i.test(r), JSON.stringify(r));
  await p.click('#balaoBotoes button:nth-child(1)');
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('e a conta está certa: 10,50 + 4 + 25 = 39,5', /39,5/.test(r), r);

  /* ---------- gritar ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  r = await escrever(p, 'EU ESTOU ESCREVENDO TUDO EM MAIUSCULA AGORA');
  conf('escrever tudo em MAIÚSCULA faz ele achar que você está gritando',
    r && /GRITANDO/i.test(r), JSON.stringify(r));
  await p.click('#balaoBotoes button:nth-child(1)');
  r = await p.evaluate(() => document.getElementById('papel').value);
  conf('e ele abaixa as letras de verdade', r === r.toLowerCase() && r.length > 10, r);

  /* ---------- a regra da senha, que é a mais importante ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  r = await escrever(p, 'minha senha é bananinha123');
  conf('escrever "senha" faz ele avisar pra nunca digitar senha numa página',
    r && /senha/i.test(r) && /Pare/i.test(r), JSON.stringify(r));

  /* ---------- apagar muito ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  await p.fill('#papel', 'x'.repeat(200));
  await p.evaluate(() => { Clipy.zerarApagados(); });
  await p.fill('#papel', 'x'.repeat(20));
  await p.evaluate(() => { Clipy.cerebro.proximaChance = 0; Clipy.lerPapel(); });
  await p.waitForTimeout(1300);
  r = await p.evaluate(() => ({ balao: document.getElementById('balaoTexto').textContent,
    apagados: Clipy.estado.apagados }));
  conf('apagar um monte de texto de uma vez faz ele comentar',
    /apagou/i.test(r.balao) && r.apagados >= 60, JSON.stringify(r));

  /* ---------- calar uma regra ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  r = await escrever(p, 'Prezado Pedro, tudo bem?');
  conf('(o balão da carta voltou, pra poder calá-lo)', r && /carta/i.test(r), JSON.stringify(r));
  await p.click('#btNaoMostrar');
  r = await p.evaluate(() => ({ calada: Clipy.cerebro.desligadas.has('carta'),
    fechou: document.getElementById('balao').hidden }));
  conf('"não mostrar mais esta dica" cala aquela regra na hora',
    r.calada && r.fechou, JSON.stringify(r));
  await p.evaluate(() => { Clipy.estado.texto = ''; });
  r = await escrever(p, 'Prezado Carlos, tudo certo?');
  conf('e a regra calada não volta mais', r === null || !/carta/i.test(r), JSON.stringify(r));

  /* ---------- a chatice ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  await p.evaluate(() => {
    const s = document.getElementById('chatice');
    s.value = 0; s.dispatchEvent(new Event('input'));
  });
  r = await escrever(p, '- um\n- dois\n- três\n- quatro');
  conf('com a chatice no zero ele não interrompe mais nada', r === null, JSON.stringify(r));
  r = await p.evaluate(() => Clipy.cerebro.intervalo());
  await p.evaluate(() => {
    const s = document.getElementById('chatice');
    s.value = 100; s.dispatchEvent(new Event('input'));
  });
  const rapido = await p.evaluate(() => Clipy.cerebro.intervalo());
  conf('e a chatice muda mesmo o tempo entre uma fala e outra (42s no mínimo, 6s no máximo)',
    Math.round(rapido) === 6, 'zero→' + r + 's · cem→' + rapido + 's');

  /* ---------- a tabela das regras acende ---------- */
  await p.evaluate(() => Clipy.fecharBalao());
  await p.fill('#papel', 'A festa de aniversário vai ser no sábado!');
  await p.click('.aba[data-aba="regras"]');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.atualizarTabela(); });
  r = await p.evaluate(() => ({
    linhas: document.querySelectorAll('#corpoRegras tr').length,
    acesas: [...document.querySelectorAll('#corpoRegras tr.batendo')].map(t => t.dataset.id) }));
  conf('a aba "como ele pensa" lista as 30 e acende a que está batendo agora',
    r.linhas === 30 && r.acesas.includes('convite'), JSON.stringify(r));

  /* ---------- a conversa ---------- */
  await p.click('.aba[data-aba="conversa"]');
  await p.fill('#campoConversa', 'quem é você?');
  await p.click('#formConversa button');
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => {
    const f = document.querySelectorAll('#conversa .fala.dele');
    return f[f.length - 1].textContent;
  });
  conf('na conversa ele responde quem é', /clipe/i.test(r), r.slice(0, 60) + '…');

  await p.fill('#campoConversa', 'xkcd zorglub pantufa quântica');
  await p.click('#formConversa button');
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => {
    const f = document.querySelectorAll('#conversa .fala.dele');
    return f[f.length - 1].textContent;
  });
  conf('e quando não sabe, ele ADMITE que não sabe (o de verdade nunca admitia)',
    /não sei|não faço ideia|sem resposta|não tenho/i.test(r), r.slice(0, 60) + '…');

  r = await p.evaluate(() => Clipy.responder('quanto é 12 + 30 x 2').texto);
  conf('e conta ele faz: soma os números que aparecem na pergunta', /44/.test(r), r);

  /* ---------- o botão de cutucar ---------- */
  await p.click('.aba[data-aba="mesa"]');
  await p.click('#btCutucar');
  r = await p.evaluate(() => ({ balao: !document.getElementById('balao').hidden,
    gesto: !!Clipy.clipe.gesto }));
  conf('cutucar o Clipy faz ele reagir e se mexer', r.balao && r.gesto, JSON.stringify(r));

  /* ---------- o desenho é desenho mesmo, não imagem ---------- */
  r = await p.evaluate(() => {
    const c = document.getElementById('telaClipy');
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let pintados = 0;
    for (let i = 3; i < d.length; i += 4 * 37) if (d[i] > 24) pintados++;
    return { pintados, imagens: document.querySelectorAll('img').length };
  });
  conf('o Clipy é desenhado por código no canvas, sem nenhuma imagem na página',
    r.pintados > 60 && r.imagens === 0, JSON.stringify(r));

  /* ---------- fica salvo ---------- */
  await p.fill('#papel', 'não me esqueça');
  await p.evaluate(() => Clipy.salvar());
  await p.reload();
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  r = await p.evaluate(() => ({ texto: document.getElementById('papel').value,
    chatice: Clipy.cerebro.chatice, calada: Clipy.cerebro.desligadas.has('carta') }));
  conf('o texto, a chatice e as regras caladas ficam salvos depois de recarregar',
    r.texto === 'não me esqueça' && r.chatice === 100 && r.calada, JSON.stringify(r));

  /* ---------- aplicativo ---------- */
  r = await p.evaluate(async () => {
    const l = document.querySelector('link[rel=manifest]');
    const m = await (await fetch(l.href)).json();
    const icones = await Promise.all(m.icons.map(async i => (await fetch(new URL(i.src, location.href))).ok));
    const reg = await Promise.race([navigator.serviceWorker.ready,
      new Promise(f => setTimeout(() => f(null), 8000))]);
    return { nome: m.name, icones: m.icons.length, todosOk: icones.every(Boolean),
      mascara: m.icons.some(i => i.purpose === 'maskable'),
      sw: !!(reg && reg.active), escopo: !!reg && reg.scope.endsWith('/clipy/'),
      botao: !document.getElementById('btInstalar').hidden };
  });
  conf('dá pra instalar: manifesto, 4 ícones, service worker ativo e botão à vista',
    /Clipy/.test(r.nome) && r.icones === 4 && r.todosOk && r.mascara && r.sw && r.escopo && r.botao,
    JSON.stringify(r));

  await p.click('#btInstalar');
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ aberta: document.getElementById('pgInstalar').classList.contains('on'),
    passos: document.querySelectorAll('#passosInstalar .p').length }));
  conf('o botão de instalar abre o passo a passo do aparelho',
    r.aberta && r.passos === 3, JSON.stringify(r));
  await p.click('#btVoltaInstalar');

  /* ---------- SEM INTERNET ---------- */
  await p.waitForTimeout(900);
  await ctx.setOffline(true);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  r = await escrever(p, '- pão\n- leite\n- arroz\n- feijão');
  const off = await p.evaluate(() => ({ titulo: document.title, regras: Clipy.REGRAS.length,
    texto: document.getElementById('papel').value }));
  conf('SEM INTERNET o site abre inteiro e o Clipy continua reagindo ao que você escreve',
    /Clipy/.test(off.titulo) && off.regras === 30 && r !== null, JSON.stringify({ ...off, balao: r }));
  await ctx.setOffline(false);

  /* ---------- no iPhone o caminho é outro ---------- */
  const ctx2 = await b.newContext({ userAgent: IPHONE, viewport: { width: 390, height: 780 },
    hasTouch: true, isMobile: true });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', e => err.push('PAGEERROR(iphone): ' + e.message));
  await p2.goto(base);
  await p2.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  await p2.click('#btInstalar');
  await p2.waitForTimeout(300);
  r = await p2.evaluate(() => document.getElementById('passosInstalar').textContent);
  conf('no iPhone ele ensina o caminho do Safari (Compartilhar → Adicionar à Tela de Início)',
    /Compartilhar/.test(r) && /Tela de In/.test(r), '');
  r = await p2.evaluate(() => document.body.scrollWidth <= window.innerWidth + 1);
  conf('e no celular a página cabe na tela, sem rolar pro lado', r, String(r));
  await ctx2.close();


  /* ========== A ÁREA DE TRANSFERÊNCIA ========== */
  await p.click('.aba[data-aba="prancheta"]');
  await p.waitForTimeout(300);

  r = await p.evaluate(() => ({
    pastas: Clipy.prancheta.pastas.length,
    ids: new Set(Clipy.prancheta.pastas.map(x => x.id)).size,
    atalhos: Clipy.prancheta.pastas.reduce((a, x) => a + x.itens.length, 0),
    naTela: document.querySelectorAll('#listaAtalhos .pasta').length }));
  conf('a caixa de atalhos já vem com 3 pastas prontas, cada uma com id próprio',
    r.pastas === 3 && r.ids === 3 && r.atalhos === 7 && r.naTela === 3, JSON.stringify(r));

  r = await p.evaluate(() => {
    Clipy.prancheta.historico = [];
    const t = [];
    for (const x of ['https://exemplo.com/gato', 'jojo@exemplo.com', '(11) 91234-5678',
                     'R$ 42,50', 'const gatos = 1000;', '#ff8fb1'])
      t.push(Clipy.tipoDoTexto(x).id);
    return t;
  });
  conf('ele reconhece o tipo do que você copia: link, e-mail, telefone, dinheiro, código e cor',
    JSON.stringify(r) === '["link","email","telefone","dinheiro","codigo","cor"]', JSON.stringify(r));

  r = await p.evaluate(() => {
    Clipy.capturar('https://willianwiab.github.io/contas-wen/cat-city/', 'teste');
    Clipy.montarHistorico();
    return { itens: Clipy.prancheta.historico.length,
      tipo: Clipy.prancheta.historico[0].tipo,
      naTela: document.querySelectorAll('#listaHist .item').length,
      balao: document.getElementById('balaoTexto').textContent,
      clipyAparece: !document.getElementById('ladoClipy').hidden };
  });
  conf('capturar um link guarda no histórico E faz o Clipy comentar, sem sair da aba',
    r.itens === 1 && r.tipo === 'link' && r.naTela === 1 &&
    /link/i.test(r.balao) && r.clipyAparece, JSON.stringify(r));

  /* o mais importante desta aba */
  r = await p.evaluate(() => {
    const antes = Clipy.prancheta.historico.length;
    Clipy.capturar('senha: bananinha123', 'teste');
    Clipy.capturar('4111 1111 1111 1111', 'teste');
    return { antes, depois: Clipy.prancheta.historico.length,
      balao: document.getElementById('balaoTexto').textContent };
  });
  conf('senha e número de cartão NÃO entram no histórico — ele recusa e avisa',
    r.depois === r.antes && /senha|cart/i.test(r.balao), JSON.stringify(r));

  r = await p.evaluate(() => {
    Clipy.capturar('https://willianwiab.github.io/contas-wen/cat-city/', 'teste');
    return { itens: Clipy.prancheta.historico.length, vezes: Clipy.prancheta.historico[0].vezes };
  });
  conf('copiar de novo a mesma coisa não duplica: sobe pro topo e conta as vezes',
    r.itens === 1 && r.vezes === 2, JSON.stringify(r));

  r = await p.evaluate(() => {
    for (let i = 0; i < 12; i++) Clipy.capturar('texto número ' + i, 'teste');
    Clipy.prancheta.fixar(Clipy.prancheta.historico[Clipy.prancheta.historico.length - 1].id);
    Clipy.prancheta.limite = 5; Clipy.prancheta.aparar();
    return { total: Clipy.prancheta.historico.length,
      fixos: Clipy.prancheta.historico.filter(x => x.fixo).length };
  });
  conf('o limite de itens corta o histórico, mas nunca joga fora o que está fixado 📌',
    r.total <= 6 && r.fixos === 1, JSON.stringify(r));

  await p.fill('#buscaHist', 'número 7');
  await p.waitForTimeout(200);
  r = await p.evaluate(() => document.querySelectorAll('#listaHist .item').length);
  conf('a busca no histórico filtra', r === 1, String(r));
  await p.fill('#buscaHist', '');

  r = await p.evaluate(() => {
    const antes = Clipy.prancheta.historico.filter(x => !x.fixo).length;
    Clipy.prancheta.limpar(); Clipy.montarHistorico();
    return { antes, depois: Clipy.prancheta.historico.length };
  });
  conf('limpar apaga os soltos e deixa os fixados', r.antes > 0 && r.depois === 1, JSON.stringify(r));

  /* colar na página captura */
  await p.evaluate(() => { Clipy.prancheta.historico = []; Clipy.montarHistorico(); });
  await p.focus('#colarAqui');
  await p.evaluate(() => {
    const dt = new DataTransfer(); dt.setData('text', 'colado com ctrl+v');
    document.getElementById('colarAqui').dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await p.waitForTimeout(200);
  r = await p.evaluate(() => ({ n: Clipy.prancheta.historico.length,
    txt: (Clipy.prancheta.historico[0] || {}).texto, caixa: document.getElementById('colarAqui').value }));
  conf('colar com Ctrl+V na caixinha captura o texto (e a caixinha se limpa)',
    r.n === 1 && r.txt === 'colado com ctrl+v' && r.caixa === '', JSON.stringify(r));

  /* atalho vai pro papel */
  r = await p.evaluate(() => {
    const a = Clipy.prancheta.pastas[0].itens[0];
    const b = [...document.querySelectorAll('#listaAtalhos .atalho')]
      .find(x => x.dataset.id === a.id);
    b.querySelector('button:nth-of-type(2)').click();      // "no papel"
    return { papel: document.getElementById('papel').value,
      aba: document.getElementById('pgMesa').classList.contains('on'), nome: a.nome };
  });
  conf('o botão "no papel" cola o atalho no papel e leva você pra aba da mesa',
    r.aba && r.papel.includes('JoJo'), JSON.stringify({ aba:r.aba, nome:r.nome }));

  /* e tudo isso fica salvo */
  await p.evaluate(() => Clipy.salvar());
  await p.reload();
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  r = await p.evaluate(() => ({ itens: Clipy.prancheta.historico.length,
    pastas: Clipy.prancheta.pastas.length, limite: Clipy.prancheta.limite }));
  conf('o histórico, os atalhos e o limite ficam salvos no aparelho',
    r.itens >= 1 && r.pastas === 3 && r.limite === 5, JSON.stringify(r));

  /* a página conta a história do outro Clipy */
  await p.click('.aba[data-aba="historia"]');
  r = await p.evaluate(() => document.getElementById('pgHistoria').textContent);
  conf('a página da história explica que existem DOIS Clipys e o que cada um é',
    /ClipMenu/.test(r) && /área de transferência/i.test(r) && /naotaka/i.test(r) &&
    /não pode fazer isso/i.test(r), '');
  r = await p.evaluate(() => document.getElementById('ladoClipy').hidden);
  conf('e nas abas de leitura o Clipy sai da frente', r === true, String(r));

  console.log('✅ ' + ok.length + ' ok'); ok.forEach(t => console.log('   · ' + t));
  if (fail.length) { console.log('❌ ' + fail.length); fail.forEach(t => console.log('   · ' + t)); }
  console.log(err.length ? '❌ console: ' + JSON.stringify(err.slice(0, 5)) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

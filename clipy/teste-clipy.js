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
  conf('o site abre com o Clipy desenhado, as 5 abas e as 33 regras carregadas',
    /Clipy/.test(r.titulo) && r.regras === 33 && r.ids === 33 && r.abas === 5 && r.canvas,
    JSON.stringify(r));

  /* ---------- toda regra tem fala, botões e um jeito de disparar ---------- */
  r = await p.evaluate(() => {
    const ruins = [];
    for (const x of Clipy.REGRAS) {
      if (!x.fala || !x.botoes || !x.botoes.length || typeof x.olho !== 'function' ||
          !(x.peso > 0) || !(x.espera >= 0)) ruins.push(x.id);
    }
    return ruins;
  });
  conf('nenhuma das 33 regras está pela metade: todas com fala, botões e peso',
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
  r = await escrever(p, '- comprar pão\n- lavar a louça\n- passar roupa');
  conf('três traços viram uma lista e ele se oferece pra numerar', r && /lista/i.test(r), JSON.stringify(r));
  await p.click('#balaoBotoes button:nth-child(1)');
  r = await p.evaluate(() => document.getElementById('papel').value);
  conf('e numerar numera mesmo: 1. 2. 3.',
    /^1\. comprar/m.test(r) && /^2\. lavar/m.test(r) && /^3\. passar/m.test(r), JSON.stringify(r));

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
  conf('a aba "como ele pensa" lista as 33 e acende a que está batendo agora',
    r.linhas === 33 && r.acesas.includes('convite'), JSON.stringify(r));

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
  conf('e conta ele faz DIREITO: 12 + 30 x 2 dá 72, porque vezes vem antes de mais',
    /72/.test(r), r);

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
    /Clipy/.test(off.titulo) && off.regras === 33 && r !== null, JSON.stringify({ ...off, balao: r }));
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


  /* ========== ELE RESPONDE DE VERDADE ========== */
  await p.click('.aba[data-aba="mesa"]');
  await p.evaluate(() => { Clipy.fecharBalao(); document.getElementById('papel').value = ''; });

  /* a conta pura, no navegador de verdade */
  await p.fill('#papel', '1+1=');
  await p.evaluate(() => Clipy.lerPapel());
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('ESCREVER "1+1=" NO PAPEL FAZ ELE RESPONDER 2', /1\+1 = 2/.test(r), r);

  r = await p.evaluate(() => document.getElementById('balao').classList.contains('resposta'));
  conf('e a resposta aparece com destaque, não como uma dica qualquer', r, String(r));

  /* a resposta acompanha a linha */
  await p.fill('#papel', '7 * 6 =');
  await p.evaluate(() => Clipy.lerPapel());
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('mudar a conta muda a resposta na hora, sem deixar a velha na tela',
    /7 \* 6 = 42/.test(r), r);

  /* apagar a conta fecha o balão */
  await p.fill('#papel', 'só um texto qualquer');
  await p.evaluate(() => Clipy.lerPapel());
  await p.waitForTimeout(1300);
  r = await p.evaluate(() => ({ fechou: document.getElementById('balao').hidden ||
    !/= /.test(document.getElementById('balaoTexto').textContent) }));
  conf('apagar a conta faz a resposta sumir', r.fechou, JSON.stringify(r));

  /* a calculadora, sem eval, com tudo que ela sabe */
  r = await p.evaluate(() => {
    const casos = [['1+1','2'], ['12 x 8','96'], ['10/4','2,5'], ['2^10','1.024'],
      ['50% de 300','150'], ['raiz de 81','9'], ['metade de 50','25'], ['dobro de 12','24'],
      ['quanto é dez vezes três?','30'], ['dois mais dois','4'], ['(2+3)*4','20'],
      ['1.234,56 + 1','1.235,56'], ['3 + 4 * 2','11'], ['duzentos e trinta e cinco + 5','240'],
      ['12 ao quadrado','144'], ['0,1+0,2','0,3'], ['-5 + 3','-2'], ['cem menos vinte','80']];
    const errados = [];
    for (const [conta, esperado] of casos) {
      const c = Clipy.calcular(conta);
      if (!c || c.erro || c.texto !== esperado) errados.push(conta + ' → ' + (c ? (c.erro || c.texto) : 'nada'));
    }
    return errados;
  });
  conf('a calculadora acerta as 18 contas do teste, incluindo conta escrita por extenso',
    r.length === 0, JSON.stringify(r));

  r = await p.evaluate(() => {
    const naoSaoConta = ['oi tudo bem', 'a lista tem 3 itens', '3 gatos e 4 gatos',
      'banana + 1', 'Prezado João', '12/03/2026'];
    return naoSaoConta.filter(x => { const c = Clipy.calcular(x); return c && !c.erro; });
  });
  conf('e ela não sai inventando conta em texto que não é conta', r.length === 0, JSON.stringify(r));

  r = await p.evaluate(() => {
    const c = Clipy.calcular('10 / 0');
    return c && c.erro;
  });
  conf('dividir por zero ela avisa em vez de dar um número maluco', /zero/.test(r || ''), String(r));

  r = await p.evaluate(() => {
    /* a prova de que não tem eval: uma "conta" que é código não roda nada */
    window.__invadiu = false;
    const c = Clipy.calcular('1 + (window.__invadiu = true)');
    return { resultado: c, invadiu: window.__invadiu };
  });
  conf('a calculadora NÃO usa eval: código escrito no papel não executa nada',
    r.invadiu === false, JSON.stringify(r));

  /* a soma da coluna */
  await p.fill('#papel', 'lista de compras\npão 5,50\nleite 4,20\narroz 22,90');
  await p.evaluate(() => { Clipy.fecharBalao(); Clipy.cerebro.proximaChance = 0;
    Clipy.cerebro.ultimaVez = {}; Clipy.lerPapel(); });
  await p.waitForTimeout(1300);
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('uma lista de preços com título ele soma sozinho e ainda dá a média',
    /32,6/.test(r) && /10,87/.test(r), r);

  await p.click('#balaoBotoes button:nth-child(1)');       // escrever o total
  r = await p.evaluate(() => document.getElementById('papel').value);
  conf('e o botão escreve o TOTAL no fim da lista', /TOTAL: 32,6/.test(r), r.split('\n').pop());

  /* pedir a resposta fura a fila da chatice */
  await p.evaluate(() => {
    Clipy.fecharBalao();
    const s = document.getElementById('chatice'); s.value = 0; s.dispatchEvent(new Event('input'));
  });
  await p.fill('#papel', '99 + 1 =');
  await p.evaluate(() => Clipy.lerPapel());
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('com a chatice no ZERO ele continua respondendo conta — perguntar não é ser interrompido',
    /99 \+ 1 = 100/.test(r), r);

  /* e na conversa também */
  await p.click('.aba[data-aba="conversa"]');
  await p.fill('#campoConversa', 'quanto é 144 dividido por 12?');
  await p.click('#formConversa button');
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => {
    const f = document.querySelectorAll('#conversa .fala.dele');
    return f[f.length - 1].textContent;
  });
  conf('na conversa ele também resolve a conta em vez de enrolar', /= 12/.test(r), r.slice(0, 60));
  await p.evaluate(() => {
    const s = document.getElementById('chatice'); s.value = 55; s.dispatchEvent(new Event('input'));
  });


  /* ========== O CENSURADOR ========== */
  await p.click('.aba[data-aba="mesa"]');
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); });

  await p.fill('#papel', 'esse jogo é uma merda mesmo');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.passarOCensor(); });
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ papel: document.getElementById('papel').value,
    balao: document.getElementById('balaoTexto').textContent }));
  conf('palavrão escrito no papel é CENSURADO na hora e trocado por símbolos',
    /#|@|\$|%/.test(r.papel) && !/merda/i.test(r.papel) && r.balao.length > 5, JSON.stringify(r));

  r = await p.evaluate(() => {
    const casos = ['que desgraçado', 'ele é um babaca', 'that is shit'];
    return casos.map(x => Clipy.censurar(x).quantos);
  });
  conf('o censurador pega com acento, sem acento e em inglês',
    r.every(x => x >= 1), JSON.stringify(r));

  r = await p.evaluate(() => {
    const inocentes = ['um texto normal e educado', 'a bicharada do sítio',
      'assobio', 'Prezado João', 'o pintor pintou a casa'];
    return inocentes.filter(x => Clipy.censurar(x).quantos > 0);
  });
  conf('e não censura palavra inocente que só parece', r.length === 0, JSON.stringify(r));

  /* ========== OS SEGREDOS ========== */
  r = await p.evaluate(() => ({ quantos: Clipy.SEGREDOS.length,
    ids: new Set(Clipy.SEGREDOS.map(x => x.id)).size,
    completos: Clipy.SEGREDOS.filter(x => !x.olho || !(x.fala || x.falas)).length }));
  conf('são 22 segredos, todos com nome próprio, fala e jeito de achar',
    r.quantos === 22 && r.ids === 22 && r.completos === 0, JSON.stringify(r));

  /* o vídeo que deixa ele doido */
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); Clipy.segredosVistos.clear(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=k85mRPqvMbE&list=RDk85mRPqvMbE&start_radio=1');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ balao: document.getElementById('balaoTexto').textContent,
    arcoiris: Clipy.clipe.faltaPara('arcoiris'), burro: Clipy.clipe.faltaPara('burro'),
    mudo: Clipy.clipe.faltaPara('mudo'), barra: !document.getElementById('efeitos').hidden }));
  conf('o primeiro vídeo deixa ele DOIDO: colorido, olho de burro e mudo por 30 minutos',
    /CORES/.test(r.balao) && r.arcoiris === '30 min' && r.burro === '30 min' &&
    r.mudo === '30 min' && r.barra, JSON.stringify(r));

  /* mudo é mudo mesmo */
  await p.evaluate(() => Clipy.fecharBalao());
  await p.fill('#papel', 'Prezado João, tudo bem com você?');
  await p.evaluate(() => { Clipy.cerebro.proximaChance = 0; Clipy.cerebro.ultimaVez = {}; Clipy.lerPapel(); });
  await p.waitForTimeout(1400);
  r = await p.evaluate(() => document.getElementById('balao').hidden);
  conf('e mudo é mudo: nem a regra da carta faz ele abrir a boca', r === true, String(r));

  /* e sobrevive a recarregar */
  await p.evaluate(() => Clipy.salvar());
  await p.reload();
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  r = await p.evaluate(() => ({ arcoiris: Clipy.clipe.temEfeito('arcoiris'),
    burro: Clipy.clipe.temEfeito('burro'), barra: !document.getElementById('efeitos').hidden }));
  conf('o estrago continua depois de fechar e abrir a página de novo',
    r.arcoiris && r.burro && r.barra, JSON.stringify(r));

  /* cinco cutucadas curam */
  for (let i = 0; i < 5; i++) await p.click('#btCutucar');
  await p.waitForTimeout(200);
  r = await p.evaluate(() => ({ arcoiris: Clipy.clipe.temEfeito('arcoiris'),
    burro: Clipy.clipe.temEfeito('burro'), mudo: Clipy.clipe.temEfeito('mudo'),
    balao: document.getElementById('balaoTexto').textContent }));
  conf('cutucar cinco vezes seguidas cura ele de tudo (a saída de emergência)',
    !r.arcoiris && !r.burro && !r.mudo && /Voltei/.test(r.balao), JSON.stringify(r));

  /* o vídeo que queima o cérebro: 24 horas de olho de burro */
  await p.evaluate(() => { Clipy.fecharBalao(); Clipy.segredosVistos.clear(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=T_NKi5KHUdI&list=RDT_NKi5KHUdI&start_radio=1');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ balao: document.getElementById('balaoTexto').textContent,
    burro: Clipy.clipe.faltaPara('burro'), mudo: Clipy.clipe.temEfeito('mudo') }));
  conf('o terceiro vídeo: "meu cérebro está queimando" e 24 horas de olho de burro',
    /queimando/.test(r.balao) && r.burro === '24h00' && !r.mudo, JSON.stringify(r));

  /* o vídeo do idiota */
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); Clipy.segredosVistos.clear(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=hiRacdl02w4');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(300);
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('o segundo vídeo: ele diz quem é o idiota', /idiota/.test(r) && /você/i.test(r), r.slice(0, 70));

  /* o vídeo que virou jogo */
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); Clipy.segredosVistos.clear(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=jX3iLfcMDCw&list=RDjX3iLfcMDCw');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ balao: document.getElementById('balaoTexto').textContent,
    papel: document.getElementById('papel').value,
    botao: document.querySelector('#balaoBotoes button').textContent }));
  conf('o vídeo do Cyriak: ele conta que virou jogo, ESCREVE o link no papel e dá um botão',
    /virou um jogo/.test(r.balao) && /contas-wen\/cat-city/.test(r.papel) &&
    /CAT CITY/.test(r.botao), JSON.stringify({ botao:r.botao }));

  /* o vídeo pra cantar junto */
  await p.evaluate(() => { Clipy.fecharBalao(); Clipy.segredosVistos.clear();
    document.getElementById('papel').value = ''; Clipy.lerPapel(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=ZZ5LpwO-An4');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ balao: document.getElementById('balaoTexto').textContent,
    papel: document.getElementById('papel').value }));
  conf('o vídeo de cantar: ele solta o berro do refrão e escreve no papel',
    /HEEEEY/.test(r.balao) && /HEEEEY/.test(r.papel) && /eco/.test(r.papel), '');

  /* o modo BEN */
  await p.evaluate(() => { Clipy.fecharBalao(); Clipy.segredosVistos.clear();
    document.getElementById('papel').value = ''; Clipy.lerPapel(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=MORrNaEaz3o&list=RD');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ ben: Clipy.clipe.faltaPara('ben'),
    barra: document.getElementById('efeitos').textContent }));
  conf('o vídeo do Ben: o Clipy vira o BEN por 10 minutos, de jaleco e orelhas',
    r.ben === '10 min' && /BEN/.test(r.barra), JSON.stringify(r));

  await p.evaluate(() => Clipy.fecharBalao());
  await p.click('#btAjuda');
  await p.waitForTimeout(250);
  r = await p.evaluate(() => document.getElementById('balaoTexto').textContent);
  conf('e de BEN ele SÓ GRUNHE: some a fala normal', /hm|HEHE|ugh|HÃ|mmm/i.test(r) && r.length < 20, r);

  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); });

  /* o vídeo assombrado */
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); Clipy.segredosVistos.clear();
    document.getElementById('papel').value = ''; Clipy.lerPapel(); });
  await p.fill('#papel', 'https://www.youtube.com/watch?v=b4taIpALfAo&list=PLx4&index=127');
  await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
  await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ balao: document.getElementById('balaoTexto').textContent,
    fantasma: Clipy.clipe.faltaPara('fantasma'), barra: document.getElementById('efeitos').textContent }));
  conf('o vídeo assombrado: ele vira FANTASMA por 15 minutos, transparente e sem sombra',
    /assombrada/.test(r.balao) && r.fantasma === '15 min' && /fantasma/.test(r.barra),
    JSON.stringify({ fantasma:r.fantasma }));
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao(); });

  /* o que conta três vezes */
  await p.evaluate(() => { Clipy.curarClipy(); Clipy.fecharBalao();
    document.getElementById('papel').value = ''; Clipy.lerPapel(); });
  const shania = async (txt) => {
    await p.fill('#papel', txt);
    await p.evaluate(() => { Clipy.lerPapel(); Clipy.procurarSegredo(Clipy.estado.texto); });
    await p.waitForTimeout(320);
    return p.evaluate(() => document.getElementById('balaoTexto').textContent);
  };
  r = await shania('shania');
  conf('escrever aquele nome uma vez: ele avisa e não termina a frase',
    /três vezes/.test(r) && /ma—/.test(r), r.slice(0, 60) + '…');
  r = await shania('shania shania');
  conf('duas vezes: ele fica mais nervoso e conta', /DUAS/.test(r), r.slice(0, 40));
  r = await shania('shania shania shania');
  conf('três vezes: ele surta e a frase é cortada no meio', /ELA VE—/.test(r), r);
  r = await p.evaluate(() => !!document.querySelector('#apagaLuz.on'));
  conf('e a LUZ APAGA de verdade na terceira', r === true, String(r));
  await p.waitForTimeout(2600);
  r = await p.evaluate(() => ({ luz: !!document.querySelector('#apagaLuz.on'),
    balao: document.getElementById('balaoTexto').textContent }));
  conf('a luz volta sozinha e não aconteceu nada: era o vento (é brincadeira, e acaba bem)',
    !r.luz && /vento/.test(r.balao), r.balao.slice(0, 50) + '…');

  /* os outros segredos */
  r = await p.evaluate(() => {
    const casos = { 'toc toc':'tocToc', 'sudo rm tudo':'sudo', '42':'quarentaEDois',
      'hello world':'helloWorld', 'miau':'gatos', 'feito pelo jojo':'jojo',
      'quero um café':'cafe', 'o chatgpt disse':'chatgpt', 'ypilc':'deCabecaPraBaixo' };
    const errados = [];
    for (const [txt, esperado] of Object.entries(casos)) {
      const s = Clipy.acharSegredo(txt);
      if (!s || s.id !== esperado) errados.push(txt + ' → ' + (s ? s.id : 'nenhum'));
    }
    return errados;
  });
  conf('os outros segredos aparecem com a palavra certa (toc toc, sudo, 42, gato, café…)',
    r.length === 0, JSON.stringify(r));

  r = await p.evaluate(() =>
    ['um texto qualquer', 'Prezado senhor', 'lista de compras', 'dar comida pro gato',
     'a fatura é 42 reais', 'meu amigo joão chegou'].filter(x => Clipy.acharSegredo(x)));
  conf('e texto comum não dispara segredo: "dar comida pro gato" é frase, não segredo',
    r.length === 0, JSON.stringify(r));

  /* a lista de ovinhos */
  await p.click('.aba[data-aba="regras"]');
  await p.waitForTimeout(200);
  r = await p.evaluate(() => ({ total: document.querySelectorAll('#ovos .ovo').length,
    achados: document.querySelectorAll('#ovos .ovo.achado').length,
    escondidos: document.querySelectorAll('#ovos .ovo.nao').length }));
  conf('a aba 🧠 mostra os 22 ovinhos, revelando só os que você já achou',
    r.total === 22 && r.achados >= 1 && r.escondidos === 22 - r.achados, JSON.stringify(r));

  await p.evaluate(() => Clipy.curarClipy());

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


  /* ---------- link direto pra cada aba ---------- */
  for (const [hash, pagina] of [['#segredos','pgRegras'], ['#mesa','pgMesa'],
       ['#conversa','pgConversa'], ['#prancheta','pgPrancheta'], ['#historia','pgHistoria']]) {
    await p.goto(base + hash);
    await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
    await p.waitForTimeout(250);
    const q = await p.evaluate(() => [...document.querySelectorAll('.pagina.on')].map(x => x.id)[0]);
    conf('o link ' + hash + ' abre direto na aba certa', q === pagina, q);
  }
  await p.goto(base);
  await p.waitForFunction(() => !!window.Clipy, null, { timeout: 15000 });
  r = await p.evaluate(() => [...document.querySelectorAll('.pagina.on')].map(x => x.id)[0]);
  conf('e sem endereço nenhum ele abre na mesa, como sempre', r === 'pgMesa', r);

  console.log('✅ ' + ok.length + ' ok'); ok.forEach(t => console.log('   · ' + t));
  if (fail.length) { console.log('❌ ' + fail.length); fail.forEach(t => console.log('   · ' + t)); }
  console.log(err.length ? '❌ console: ' + JSON.stringify(err.slice(0, 5)) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

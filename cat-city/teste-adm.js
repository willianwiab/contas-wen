/* ============================================================
   CAT CITY — teste do MODO ADM
   Confere a senha, cada grupo de botões e, principalmente, que
   os truques mudam o jogo de verdade (e não só o texto do botão).

   Como rodar (precisa servir por http):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-adm.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8822/cat-city/';
const ok = [], fail = [];
const conf = (n, c, e = '') => (c ? ok : fail).push(n + (e ? ' → ' + e : ''));
const aberto = p => p.evaluate(() => document.getElementById('adm').classList.contains('on'));

/* o Ctrl+Shift+A é um interruptor: às vezes o painel já ficou aberto */
async function garantirAberto(p) {
  if (await aberto(p)) return;
  await p.keyboard.press('Control+Shift+KeyA');
  await p.waitForSelector('#admPainel', { state: 'visible' });
}

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--use-gl=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const err = [];
  p.on('pageerror', e => err.push('PAGEERROR: ' + e.message));
  /* as fotos de assets/cats/ são opcionais: 404 ali é normal, não é erro */
  p.on('console', m => {
    if (m.type() === 'error' && !/assets\/cats/.test(m.location().url || '')) err.push('C: ' + m.text());
  });

  await p.goto(base);
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  await p.evaluate(() => localStorage.removeItem('catcity_v1'));

  /* ---------- o cadeado abre o painel, mas trancado ---------- */
  await p.click('#btAdm');
  let r = await p.evaluate(() => ({
    aberto: document.getElementById('adm').classList.contains('on'),
    pedeSenha: getComputedStyle(document.getElementById('admLogin')).display !== 'none',
    painel: getComputedStyle(document.getElementById('admPainel')).display !== 'none' }));
  conf('o cadeadinho 🔒 abre o adm e ele pede senha antes de mostrar qualquer coisa',
    r.aberto && r.pedeSenha && !r.painel, JSON.stringify(r));

  /* ---------- senha errada não entra ---------- */
  await p.fill('#admSenha', '9999'); await p.click('#admEntrar');
  r = await p.evaluate(() => ({ erro: document.getElementById('admErro').textContent,
    painel: getComputedStyle(document.getElementById('admPainel')).display !== 'none' }));
  conf('senha errada não deixa entrar', !r.painel && r.erro.length > 0, JSON.stringify(r));

  /* ---------- senha certa entra ---------- */
  await p.fill('#admSenha', '1234'); await p.click('#admEntrar');
  r = await p.evaluate(() => ({
    painel: getComputedStyle(document.getElementById('admPainel')).display !== 'none',
    gatos: document.querySelectorAll('#admGatos .admBt').length,
    formas: document.querySelectorAll('#admFormas .admForma').length,
    eventos: document.querySelectorAll('#admEventos .admBt').length,
    segredos: document.querySelectorAll('#admSegredos .admBt').length,
    info: document.getElementById('admInfo').textContent.length }));
  conf('a senha 1234 abre o painel inteiro',
    r.painel && r.formas === 13 && r.eventos >= 9 && r.segredos === 6 && r.info > 40, JSON.stringify(r));

  const rotulos = await p.evaluate(() =>
    [...document.querySelectorAll('#admGatos .admBt')].map(x => x.textContent).join(' '));
  conf('os botões de número são os que o Jojo pediu: 1, 10, 15, 25, 100, 200, 300, 400, 500 e 1000',
    rotulos === '+1 +10 +15 +25 +100 +200 +300 +400 +500 +1000', rotulos);

  /* ---------- gatos ---------- */
  await p.evaluate(() => CatCity.limparGatos());
  const antes = await p.evaluate(() => CatCity.quantosVivos());
  await p.click('#admGatos .admBt:nth-child(4)');            // +25
  const dep = await p.evaluate(() => CatCity.quantosVivos());
  conf('o botão +25 faz nascer 25 gatos em volta de você', dep - antes === 25, antes + ' → ' + dep);

  await p.click('#admGatosExtra .admBt:nth-child(1)');        // multiplicar
  const mult = await p.evaluate(() => CatCity.quantosVivos());
  conf('multiplicar dobra o que está vivo', mult >= dep * 1.8, dep + ' → ' + mult);

  await p.click('#admTeto .admBt:nth-child(7)');             // 3000
  r = await p.evaluate(() => CatCity.tetoAtual());
  conf('dá pra levantar o teto até 3000 gatos (bem acima do máximo das opções)', r === 3000, String(r));

  await p.click('#admGatosExtra .admBt:nth-child(4)');        // gato GIGANTE
  r = await p.evaluate(() => CatCity.gatos.some(g => g.vivo && g.escala > 6));
  conf('o botão do gato GIGANTE coloca mesmo um gato gigante do seu lado', r, String(r));

  await p.click('#admGatosExtra .admBt:nth-child(5)');        // limpar
  r = await p.evaluate(() => CatCity.quantosVivos());
  conf('limpar apaga todos os gatos de uma vez', r === 0, String(r));

  /* ---------- formas ---------- */
  await p.click('#admFormas .admForma:nth-child(13)');        // MEGA LARVA
  r = await p.evaluate(() => ({ forma: CatCity.jogador.forma,
    mega: CatCity.porId(CatCity.jogador.forma).mega === true }));
  conf('clicar numa forma trancada destranca E vira ela na hora',
    r.forma === 'megaLarva' && r.mega, JSON.stringify(r));

  await p.click('#admFormasExtra .admBt:nth-child(1)');       // destrancar tudo
  r = await p.evaluate(() => CatCity.jogador.desbloqueadas.length);
  conf('destrancar as 13 libera todas as formas de uma vez', r === 13, String(r));

  await p.click('#admFormasExtra .admBt:nth-child(2)');       // trancar
  r = await p.evaluate(() => ({ n: CatCity.jogador.desbloqueadas.length,
    forma: CatCity.jogador.forma, seg: CatCity.jogo.segredos }));
  conf('trancar tudo devolve o jogo pro começo',
    r.n === 1 && r.forma === 'normal' && r.seg === 0, JSON.stringify(r));

  /* ---------- coisas ---------- */
  await p.click('#admPeixes .admBt:nth-child(10)');           // +1000
  await p.click('#admEstrelas .admBt:nth-child(2)');          // +10
  r = await p.evaluate(() => ({ pe: CatCity.jogo.peixes, es: CatCity.jogo.estrelas }));
  conf('os botões de peixe e estrela somam o número certinho',
    r.pe === 1000 && r.es === 10, JSON.stringify(r));

  /* ---------- segredos ---------- */
  await p.click('#admSegredos .admBt:nth-child(6)');          // abrir os 5
  r = await p.evaluate(() => ({ seg: CatCity.jogo.segredos,
    todos: CatCity.jogo.portais.every(x => x.achado),
    fechou: !document.getElementById('adm').classList.contains('on') }));
  conf('abrir os 5 segredos de uma vez conta os 5 e fecha o painel pra você ver',
    r.seg === 5 && r.todos && r.fechou, JSON.stringify(r));

  /* ---------- Ctrl+Shift+A ---------- */
  await p.keyboard.press('Control+Shift+KeyA');
  r = await aberto(p);
  conf('Ctrl+Shift+A também abre o adm (e ele lembra que você já entrou)', r, String(r));

  /* ---------- truque: velocidade ---------- */
  const velBase = await p.evaluate(() => { CatCity.trocarPara('normal'); return CatCity.porId('normal').vel; });
  await p.click('#admTurbo .admBt:nth-child(5)');             // velocidade x10
  r = await p.evaluate(() => CatCity.truques.turbo);
  conf('velocidade x10 muda o limite de verdade (não é só o botão aceso)',
    r === 10, 'vel base ' + velBase + ' · turbo ' + r);

  /* ---------- truque: atravessar parede ---------- */
  await p.click('#admZerar .admBt:nth-child(1)');             // desliga tudo
  await p.click('#admTruques .admBt:nth-child(1)');           // fantasma
  r = await p.evaluate(async () => {
    CatCity.comecar(true);                                    // partida rodando de verdade
    const pr = CatCity.paredes().find(w => w.tipo === 'predio');
    CatCity.levarPara(pr.x + pr.l / 2, pr.y + pr.f / 2);       // bem no meio do prédio
    await new Promise(f => requestAnimationFrame(() => requestAnimationFrame(f)));
    const j = CatCity.jogador;
    return { dentro: j.x > pr.x && j.x < pr.x + pr.l && j.y > pr.y && j.y < pr.y + pr.f,
             fantasma: CatCity.truques.fantasma };
  });
  conf('com "atravessar parede" ligado o gato fica DENTRO do prédio em vez de ser expulso',
    r.dentro && r.fantasma, JSON.stringify(r));

  /* ---------- truque: não morrer ---------- */
  await garantirAberto(p);
  await p.click('#admTruques .admBt:nth-child(3)');           // imortal
  await p.keyboard.press('Escape');
  r = await p.evaluate(() => {
    CatCity.amassado();
    return { telaFim: document.getElementById('telaFim').classList.contains('on'),
             imortal: CatCity.truques.imortal };
  });
  conf('com "não morrer" ligado o gato gigante não te derruba mais',
    r.imortal && !r.telaFim, JSON.stringify(r));

  /* ---------- truque: tamanho mexe no corpo ---------- */
  await garantirAberto(p);
  await p.click('#admGigante .admBt:nth-child(5)');           // tamanho x8
  r = await p.evaluate(() => ({ raio: CatCity.jogador.raio, alto: CatCity.jogador.alto,
    base: CatCity.porId(CatCity.jogador.forma).raio }));
  conf('tamanho x8 aumenta o corpo mesmo (raio e altura), não só o desenho',
    Math.abs(r.raio - r.base * 8) < .001 && r.alto > 5, JSON.stringify(r));

  await p.click('#admZerar .admBt:nth-child(1)');
  r = await p.evaluate(() => ({ ...CatCity.truques, raio: CatCity.jogador.raio,
    base: CatCity.porId(CatCity.jogador.forma).raio }));
  conf('o botão de desligar devolve TODOS os truques ao normal',
    r.turbo === 1 && r.pulo === 1 && r.gigante === 1 && !r.fantasma && !r.voar && !r.imortal
    && Math.abs(r.raio - r.base) < .001, JSON.stringify(r));

  /* ---------- teclado não vaza pro jogo ---------- */
  await garantirAberto(p);
  const xAntes = await p.evaluate(() => {
    CatCity.jogador.vx = CatCity.jogador.vy = 0;
    CatCity.jogador.x = 40; CatCity.jogador.y = 40; CatCity.jogador.z = 0;
    return CatCity.jogador.x;
  });
  await p.keyboard.down('KeyD'); await p.waitForTimeout(350); await p.keyboard.up('KeyD');
  const xDepois = await p.evaluate(() => CatCity.jogador.x);
  conf('com o painel aberto as teclas não fazem o gato sair andando atrás dele',
    Math.abs(xDepois - xAntes) < .5, xAntes + ' → ' + xDepois);

  /* ---------- eventos ---------- */
  await garantirAberto(p);
  await p.click('#admEventos .admBt:nth-child(1)');
  r = await p.evaluate(() => ({ fechou: !document.getElementById('adm').classList.contains('on'),
    gigante: CatCity.gatos.some(g => g.vivo && g.escala > 5) }));
  conf('o botão de evento fecha o painel e o evento acontece na tela',
    r.fechou && r.gigante, JSON.stringify(r));

  /* ---------- escrever ADMIN ---------- */
  await p.keyboard.type('ADMIN');
  r = await aberto(p);
  conf('escrever ADMIN abre o painel (igualzinho à Torre de Emojis)', r, String(r));

  /* ---------- ganhar o jogo ---------- */
  await garantirAberto(p);
  await p.click('#admFim .admBt:nth-child(1)');
  await p.waitForSelector('#telaVitoria.on', { timeout: 6000 });   // a festa demora 2,6s de propósito
  r = await p.evaluate(() => ({ venceu: CatCity.jogo.vencido,
    tela: document.getElementById('telaVitoria').classList.contains('on'),
    formas: CatCity.jogador.desbloqueadas.length }));
  conf('"ganhar o jogo agora" libera as 13 formas e mostra a tela de vitória',
    r.venceu && r.tela && r.formas === 13, JSON.stringify(r));

  /* ---------- fechado, o jogo volta ao normal ---------- */
  await p.evaluate(() => { CatCity.comecar(false); CatCity.jogador.x = 40; CatCity.jogador.y = 40; });
  await p.keyboard.down('KeyD'); await p.waitForTimeout(400); await p.keyboard.up('KeyD');
  r = await p.evaluate(() => CatCity.jogador.x);
  conf('com o painel fechado o gato volta a andar normalmente', r > 40.5, String(r));

  /* ---------- o save sobrevive ---------- */
  await p.reload();
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  r = await p.evaluate(() => ({ formas: CatCity.jogador.desbloqueadas.length,
    venceu: CatCity.jogo.vencido, truques: JSON.stringify(CatCity.truques),
    pedeSenha: getComputedStyle(document.getElementById('admLogin')).display !== 'none' }));
  conf('o que o adm liberou fica salvo — mas os truques voltam ao normal ao recarregar',
    r.formas === 13 && r.venceu &&
    r.truques === '{"turbo":1,"pulo":1,"gigante":1,"fantasma":false,"voar":false,"imortal":false}',
    JSON.stringify(r));
  conf('e a senha volta a ser pedida numa sessão nova', r.pedeSenha, String(r.pedeSenha));

  console.log('✅ ' + ok.length + ' ok'); ok.forEach(t => console.log('   · ' + t));
  if (fail.length) { console.log('❌ ' + fail.length); fail.forEach(t => console.log('   · ' + t)); }
  console.log(err.length ? '❌ console: ' + JSON.stringify(err.slice(0, 5)) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

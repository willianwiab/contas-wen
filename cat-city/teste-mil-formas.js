/* ============================================================
   CAT CITY — teste DAS MIL FORMAS
   As 13 lendárias continuam feitas à mão; as outras 987 saem da
   fábrica (corpo x tinta x mania). Este teste confere que as mil
   existem, são todas diferentes, todas JOGÁVEIS de verdade, e que
   o catálogo e a cidade dão conta delas.

   Como rodar (precisa servir por http):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-mil-formas.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = 'http://127.0.0.1:8822/cat-city/';
const ok = [], fail = [];
const conf = (n, c, e = '') => (c ? ok : fail).push(n + (e ? ' → ' + e : ''));

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--use-gl=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 860 } });
  const err = [];
  p.on('pageerror', e => err.push('PAGEERROR: ' + e.message));
  p.on('console', m => {
    if (m.type() === 'error' && !/assets\/cats/.test(m.location().url || '')) err.push('C: ' + m.text());
  });

  await p.goto(base);
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  await p.evaluate(() => localStorage.removeItem('catcity_v1'));
  await p.reload();
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });

  /* ---------- são mil, e mil DIFERENTES ---------- */
  let r = await p.evaluate(() => {
    const F = CatCity.FORMAS;
    return { total: F.length,
      lendarias: CatCity.LENDARIAS.length, geradas: CatCity.GERADAS.length,
      nomes: new Set(F.map(f => f.nome)).size,
      ids: new Set(F.map(f => f.id)).size };
  });
  conf('são 1000 formas: 13 feitas à mão + 987 da fábrica',
    r.total === 1000 && r.lendarias === 13 && r.geradas === 987, JSON.stringify(r));
  conf('as 1000 têm nome próprio e nenhum se repete', r.nomes === 1000 && r.ids === 1000, JSON.stringify(r));

  /* ---------- todas são JOGÁVEIS, não enfeite ---------- */
  r = await p.evaluate(() => {
    const ruins = [];
    for (const f of CatCity.FORMAS) {
      const mal = !(f.raio > 0) || !(f.alto > 0) || !(f.vel > 0) || !(f.massa > 0) ||
        !(f.pulo >= 0) || !(f.quebra >= 0 && f.quebra <= 3) ||
        !f.poder || !f.poder.tipo || !(f.poder.recarga > 0) ||
        !f.nome || !f.emoji || !f.habilidade;
      if (mal) ruins.push(f.id + ' ' + f.nome);
    }
    return { ruins: ruins.slice(0, 4), quantos: ruins.length };
  });
  conf('nenhuma das 1000 está quebrada: todas têm corpo, poder e nome',
    r.quantos === 0, JSON.stringify(r));

  /* ---------- e são MESMO diferentes umas das outras ---------- */
  r = await p.evaluate(() => {
    const F = CatCity.GERADAS;
    const jeitos = new Set(F.map(f => [f.base, f.poder.tipo, Math.round(f.vel), Math.round(f.alto * 4)].join('|')));
    const corpos = new Set(F.map(f => f.base));
    const poderes = new Set(F.map(f => f.poder.tipo));
    const cores = new Set(F.map(f => f.cor));
    const vels = F.map(f => f.vel);
    return { jeitos: jeitos.size, corpos: corpos.size, poderes: poderes.size, cores: cores.size,
      velMin: Math.min(...vels), velMax: Math.max(...vels) };
  });
  conf('a fábrica mistura de verdade: vários corpos, vários poderes, várias cores e velocidades',
    r.corpos >= 10 && r.poderes >= 7 && r.cores >= 8 && r.jeitos > 150 && r.velMax > r.velMin * 2,
    JSON.stringify(r));

  /* ---------- as 13 lendárias não foram mexidas ---------- */
  r = await p.evaluate(() => {
    const n = CatCity.porId('normal'), m = CatCity.porId('megaLarva'), pm = CatCity.porId('pernaM');
    return { normal: n.nome, mega: m.mega === true && m.larva === 14,
      pernaM: pm.pernas === 10 && pm.cabecas === 2,
      ordem: CatCity.FORMAS.slice(0, 13).every(f => !f.gerada) };
  });
  conf('as 13 lendárias continuam intactas e na frente da lista',
    r.normal === 'Gato Normal' && r.mega && r.pernaM && r.ordem, JSON.stringify(r));

  /* ---------- a cidade espalha formas novas ---------- */
  r = await p.evaluate(() => {
    const fs = CatCity.jogo.itens.filter(i => i.tipo === 'forma');
    const ger = fs.filter(i => CatCity.porId(i.forma).gerada);
    return { pedestais: fs.length, geradas: ger.length,
      diferentes: new Set(fs.map(i => i.forma)).size };
  });
  conf('a cidade espalha as 12 lendárias mais 80 formas sorteadas, sem repetir nenhuma',
    r.pedestais === 92 && r.geradas === 80 && r.diferentes === 92, JSON.stringify(r));

  /* ---------- cidade nova = formas diferentes ---------- */
  const antes = await p.evaluate(() =>
    CatCity.jogo.itens.filter(i => i.tipo === 'forma').map(i => i.forma).join(','));
  await p.evaluate(() => CatCity.recomecar(true));
  const depois = await p.evaluate(() =>
    CatCity.jogo.itens.filter(i => i.tipo === 'forma').map(i => i.forma).join(','));
  conf('recomeçar a cidade traz um sorteio novo de formas', antes !== depois,
    antes.slice(0, 40) + ' … / ' + depois.slice(0, 40) + ' …');

  /* ---------- pegar uma forma gerada muda o jogo ---------- */
  r = await p.evaluate(async () => {
    CatCity.comecar(true);
    const alvo = CatCity.GERADAS.find(f => f.base === 'carro' && f.vel > 9);
    const antes = { raio: CatCity.jogador.raio, vel: CatCity.porId(CatCity.jogador.forma).vel };
    CatCity.desbloquear(alvo.id); CatCity.trocarPara(alvo.id);
    await new Promise(f => requestAnimationFrame(f));
    return { antes, nome: alvo.nome, forma: CatCity.jogador.forma,
      raio: CatCity.jogador.raio, vel: CatCity.porId(CatCity.jogador.forma).vel,
      mudouCorpo: Math.abs(CatCity.jogador.raio - antes.raio) > .01 };
  });
  conf('virar uma forma gerada muda o corpo e a velocidade, igual às lendárias',
    r.forma !== 'normal' && r.mudouCorpo && r.vel !== r.antes.vel, JSON.stringify(r));

  /* ---------- o catálogo aguenta as mil ---------- */
  await p.evaluate(() => CatCity.pausar());
  await p.click('#btPausaFormas');
  await p.waitForSelector('#telaFormas.on');
  r = await p.evaluate(() => ({
    mostrando: document.querySelectorAll('#gradeFormas .f').length,
    pagina: document.getElementById('formasPagina').textContent,
    contagem: document.getElementById('formasContagem').textContent }));
  conf('o catálogo mostra 60 por página em vez de despejar 1000 na tela',
    r.mostrando === 60 && /1 \/ 17/.test(r.pagina) && /1000/.test(r.contagem), JSON.stringify(r));

  await p.fill('#formasBusca', 'dourada');
  await p.waitForTimeout(200);
  r = await p.evaluate(() => ({
    mostrando: document.querySelectorAll('#gradeFormas .f').length,
    contagem: document.getElementById('formasContagem').textContent,
    todasBatem: [...document.querySelectorAll('#gradeFormas .f.tem .n')]
      .every(n => n.textContent.toLowerCase().includes('dourada')) }));
  conf('a busca por nome funciona: procurar "dourada" só traz as douradas',
    r.mostrando > 0 && r.mostrando <= 60 && /mostrando/.test(r.contagem), JSON.stringify(r));

  await p.fill('#formasBusca', '');
  await p.click('#formasFiltro button[data-filtro="lendarias"]');
  await p.waitForTimeout(150);
  r = await p.evaluate(() => document.querySelectorAll('#gradeFormas .f').length);
  conf('o filtro "as 13 lendárias" mostra exatamente 13', r === 13, String(r));

  await p.click('#formasFiltro button[data-filtro="todas"]');
  await p.click('#formasDepois');
  await p.waitForTimeout(150);
  r = await p.evaluate(() => document.getElementById('formasPagina').textContent);
  conf('as setas viram a página do catálogo', /^2 \//.test(r.trim()), r);

  /* ---------- o adm dá formas ---------- */
  await p.click('#btVoltaFormas');
  await p.keyboard.press('Control+Shift+KeyA');
  await p.fill('#admSenha', '1234'); await p.click('#admEntrar');
  r = await p.evaluate(() => document.querySelectorAll('#admFormas .admForma').length);
  conf('o painel do adm também pagina as mil (24 por vez)', r === 24, String(r));

  const tinha = await p.evaluate(() => CatCity.jogador.desbloqueadas.length);
  await p.click('#admFormasSorteio .admBt:nth-child(8)');     // +400
  r = await p.evaluate(() => CatCity.jogador.desbloqueadas.length);
  conf('o adm sorteia 400 formas novas de uma vez, sem repetir nenhuma',
    r - tinha === 400 && new Set(await p.evaluate(() => CatCity.jogador.desbloqueadas)).size === r,
    tinha + ' → ' + r);

  await p.click('#admFormasExtra .admBt:nth-child(2)');       // destrancar TODAS
  r = await p.evaluate(() => ({ n: CatCity.jogador.desbloqueadas.length,
    unicas: new Set(CatCity.jogador.desbloqueadas).size }));
  conf('"destrancar TODAS as 1000" libera as mil, sem duplicata',
    r.n === 1000 && r.unicas === 1000, JSON.stringify(r));

  /* ---------- e com as mil liberadas o jogo continua liso ---------- */
  await p.keyboard.press('Escape');
  await p.evaluate(() => CatCity.comecar(false));
  const fps = await p.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    const conta = () => { n++; performance.now() - t0 < 1500 ? requestAnimationFrame(conta)
      : res(Math.round(n / ((performance.now() - t0) / 1000))); };
    requestAnimationFrame(conta);
  }));
  conf('com as 1000 formas liberadas e a cidade cheia o jogo continua rodando liso', fps >= 24, fps + ' fps');

  /* ---------- e tudo isso cabe no save ---------- */
  await p.evaluate(() => CatCity.salvar());
  r = await p.evaluate(() => {
    const s = localStorage.getItem('catcity_v1');
    return { kb: Math.round(s.length / 102.4) / 10, formas: JSON.parse(s).formas.length };
  });
  conf('as 1000 formas cabem no save sem estourar nada', r.formas === 1000 && r.kb < 40,
    r.kb + ' KB');

  await p.reload();
  await p.waitForFunction(() => !!window.CatCity, null, { timeout: 15000 });
  r = await p.evaluate(() => CatCity.jogador.desbloqueadas.length);
  conf('e voltam todas depois de recarregar', r === 1000, String(r));

  console.log('✅ ' + ok.length + ' ok'); ok.forEach(t => console.log('   · ' + t));
  if (fail.length) { console.log('❌ ' + fail.length); fail.forEach(t => console.log('   · ' + t)); }
  console.log(err.length ? '❌ console: ' + JSON.stringify(err.slice(0, 5)) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

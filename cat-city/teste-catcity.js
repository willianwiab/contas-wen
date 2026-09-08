/* ============================================================
   CAT CITY — teste do jogo
   Abre o jogo num Chromium de verdade, aperta as teclas que o
   JoJo apertaria e confere se a cidade, as formas, a
   multiplicação, os segredos e a vitória funcionam.

   Como rodar (precisa de http, o jogo usa módulos):
     python3 -m http.server 8822    # na raiz do repositório
     npm i playwright-core
     node teste-catcity.js
   ============================================================ */
const { chromium } = require('playwright-core');
const base = process.env.BASE || 'http://127.0.0.1:8822/cat-city/';
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1180,height:760} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ const t=m.text();
    if(m.type()==='error' && !/404|File not found|Failed to load resource/.test(t)) err.push('C: '+t); });
  await p.goto(base); await p.waitForTimeout(1200);
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForTimeout(1200);

  // ---------- o mundo existe ----------
  let r = await p.evaluate(() => ({
    api: !!window.CatCity, titulo: document.title,
    formas: CatCity.FORMAS.length,
    predios: CatCity.cidade.predios.length, arvores: CatCity.cidade.arvores.length,
    carros: CatCity.cidade.carros.length, postes: CatCity.cidade.postes.length,
    semaforos: CatCity.cidade.semaforos.length, placas: CatCity.cidade.placas.length,
    portais: CatCity.jogo.portais.length,
    itens: CatCity.jogo.itens.length,
  }));
  conf('a cidade nasce com prédios, árvores, carros, postes, semáforos e placas',
    r.predios > 40 && r.arvores > 10 && r.carros > 20 && r.postes > 20 &&
    r.semaforos > 5 && r.placas > 3, JSON.stringify(r));
  conf('1000 formas e 5 segredos cadastrados', r.formas === 1000 && r.portais === 5, JSON.stringify(r));
  conf('tem colecionável espalhado pela cidade', r.itens > 100, String(r.itens));

  // ---------- menu → jogo ----------
  await p.click('#btJogar'); await p.waitForTimeout(900);
  r = await p.evaluate(() => ({ rodando: CatCity.jogo.rodando, telaAberta: !!document.querySelector('.tela.on'),
    forma: CatCity.jogador.forma, gatos: CatCity.quantosVivos() }));
  conf('o botão JOGAR começa a partida com gatos já na cidade',
    r.rodando && !r.telaAberta && r.forma === 'normal' && r.gatos >= 5, JSON.stringify(r));

  // ---------- andar de verdade, com WASD ----------
  r = await p.evaluate(() => ({ x: CatCity.jogador.x, y: CatCity.jogador.y }));
  await p.keyboard.down('KeyD'); await p.waitForTimeout(700); await p.keyboard.up('KeyD');
  await p.waitForTimeout(200);
  let d = await p.evaluate(() => ({ x: CatCity.jogador.x, y: CatCity.jogador.y, olha: CatCity.jogador.olhandoDir }));
  conf('D anda pra direita e o gato vira pra lá', d.x > r.x + .8 && d.olha === true,
    JSON.stringify({ antes:Math.round(r.x), depois:Math.round(d.x) }));
  await p.keyboard.down('KeyW'); await p.waitForTimeout(600); await p.keyboard.up('KeyW');
  d = await p.evaluate(() => CatCity.jogador.y);
  conf('W anda pra cima', d < r.y - .5, JSON.stringify({ antes:Math.round(r.y), depois:Math.round(d) }));

  // ---------- pular ----------
  r = await p.evaluate(() => new Promise(res => {
    CatCity.jogador.z = 0; CatCity.jogador.vz = 0;
    const antes = CatCity.jogador.z;
    document.dispatchEvent(new KeyboardEvent('keydown', { code:'Space', bubbles:true }));
    setTimeout(() => res({ antes, z: CatCity.jogador.z, vz: CatCity.jogador.vz }), 120);
  }));
  conf('espaço faz o gato pular', r.z > 0 || r.vz > 0, JSON.stringify(r));

  // ---------- colisão com prédio ----------
  r = await p.evaluate(() => new Promise(res => {
    const pr = CatCity.cidade.predios[0];
    CatCity.jogador.x = pr.x + pr.l / 2; CatCity.jogador.y = pr.y + pr.f / 2;
    CatCity.jogador.z = 0; CatCity.jogador.vx = CatCity.jogador.vy = 0;
    setTimeout(() => {
      const dentro = CatCity.jogador.x > pr.x && CatCity.jogador.x < pr.x + pr.l &&
                     CatCity.jogador.y > pr.y && CatCity.jogador.y < pr.y + pr.f;
      res({ dentro, x:Math.round(CatCity.jogador.x), px:Math.round(pr.x) });
    }, 400);
  }));
  conf('o gato não atravessa prédio: a colisão empurra ele pra fora', r.dentro === false, JSON.stringify(r));

  // ---------- transformação ----------
  r = await p.evaluate(() => {
    CatCity.desbloquear('bola'); CatCity.desbloquear('larva'); CatCity.desbloquear('carro');
    const antes = { forma: CatCity.jogador.forma, raio: CatCity.jogador.raio, alto: CatCity.jogador.alto };
    CatCity.trocarPara('carro');
    const dep = { forma: CatCity.jogador.forma, raio: CatCity.jogador.raio, alto: CatCity.jogador.alto,
                  vel: CatCity.porId('carro').vel, velNormal: CatCity.porId('normal').vel };
    return { antes, dep };
  });
  conf('trocar de forma muda o corpo E o jeito de jogar, não só o desenho',
    r.dep.forma === 'carro' && r.dep.raio !== r.antes.raio && r.dep.vel > r.dep.velNormal,
    JSON.stringify(r.dep));

  r = await p.evaluate(() => {
    const f = id => CatCity.porId(id);
    return { larvaFina: !!f('larva').fino, bolaRola: !!f('bola').rola, arvoreNaoPula: f('arvore').pulo === 0,
      pernaAlta: f('pernaG').alto > f('normal').alto * 5, megaQuebra: f('megaLarva').quebra === 3,
      pernas: f('pernaG').pernas, pernasM: f('pernaM').pernas, cabecas: f('pernaM').cabecas };
  });
  conf('cada forma tem função própria (larva fina, bola rola, árvore não pula, mega quebra tudo)',
    r.larvaFina && r.bolaRola && r.arvoreNaoPula && r.pernaAlta && r.megaQuebra, JSON.stringify(r));
  conf('as formas das fotos: perna gigante tem 4 gatos-perna, a melhor tem 10 e duas cabeças',
    r.pernas === 4 && r.pernasM === 10 && r.cabecas === 2, JSON.stringify(r));

  // ---------- a habilidade faz alguma coisa ----------
  r = await p.evaluate(() => new Promise(res => {
    CatCity.trocarPara('bola');
    /* longe de prédio: encostado numa parede a colisão come o impulso */
    CatCity.jogador.x = CatCity.cidade.largura / 2; CatCity.jogador.y = CatCity.cidade.altura / 2;
    CatCity.jogador.vx = 0; CatCity.jogador.vy = 0; CatCity.jogador.olhandoDir = true;
    CatCity.jogador.recargaAte = 0;
    document.dispatchEvent(new KeyboardEvent('keydown', { code:'ShiftLeft', bubbles:true }));
    let pico = 0;
    const olho = setInterval(() => { pico = Math.max(pico, Math.abs(CatCity.jogador.vx)); }, 16);
    setTimeout(() => { clearInterval(olho); res({ pico, recarga: CatCity.jogador.recargaAte > 0 }); }, 400);
  }));
  conf('SHIFT usa a habilidade — a bola sai rolando de verdade',
    r.pico > 12 && r.recarga, JSON.stringify(r));

  // ---------- multiplicação ----------
  r = await p.evaluate(() => {
    const antes = CatCity.quantosVivos();
    CatCity.multiplicar(CatCity.jogo.t, 1, 999);
    const dep1 = CatCity.quantosVivos();
    CatCity.multiplicar(CatCity.jogo.t, 1, 999);
    const dep2 = CatCity.quantosVivos();
    for (let i = 0; i < 12; i++) CatCity.multiplicar(CatCity.jogo.t, 1, 999);
    return { antes, dep1, dep2, cheio: CatCity.quantosVivos(), pool: CatCity.gatos.length };
  });
  conf('1 → 2 → 4: os gatos se multiplicam de verdade',
    r.dep1 > r.antes && r.dep2 > r.dep1, JSON.stringify(r));
  conf('e o teto segura: o pool nunca cresce e ninguém estoura a memória',
    r.cheio <= r.pool && r.pool <= 1200, JSON.stringify({ vivos:r.cheio, pool:r.pool }));

  // ---------- FPS com a cidade cheia ----------
  const fps = await p.evaluate(() => new Promise(res => {
    let n = 0; const t0 = performance.now();
    const conta = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(conta); else res(Math.round(n / 2)); };
    requestAnimationFrame(conta);
  }));
  conf('com a cidade cheia de gatos o jogo continua rodando liso', fps >= 24, fps + ' fps');

  // ---------- eventos ----------
  r = await p.evaluate(() => new Promise(res => {
    const antes = CatCity.quantosVivos();
    CatCity.forcarEvento('gigante', CatCity.jogo.t, CatCity.jogador, CatCity.ui.faixa);
    setTimeout(() => {
      const gigante = CatCity.gatos.some(g => g.vivo && g.escala > 6);
      res({ antes, depois: CatCity.quantosVivos(), gigante,
            faixa: document.getElementById('faixaEvento').classList.contains('on') });
    }, 300);
  }));
  conf('o evento do gato gigante coloca um gato gigante na rua e avisa na tela',
    r.gigante && r.faixa, JSON.stringify(r));

  // ---------- segredos e vitória ----------
  r = await p.evaluate(() => {
    const antes = CatCity.jogo.segredos;
    const beco = CatCity.jogo.portais.find(x => x.id === 'beco');
    CatCity.abrirSegredo(beco, CatCity.jogo.t);
    return { antes, depois: CatCity.jogo.segredos, achou: beco.achado,
             temLarva: CatCity.jogador.desbloqueadas.includes('larvaP') };
  });
  conf('achar um segredo conta e desbloqueia forma',
    r.depois === r.antes + 1 && r.achou && r.temLarva, JSON.stringify(r));

  r = await p.evaluate(() => {
    const antes = CatCity.faseAgora().n;
    ['bolaP','bola','bolaRosto','larvaP','larva','carro','trem','maca','arvore','pernaG','pernaM']
      .forEach(id => CatCity.desbloquear(id));
    return { antes, depois: CatCity.faseAgora().n, formas: CatCity.jogador.desbloqueadas.length };
  });
  conf('juntar formas faz a cidade mudar de fase', r.depois > r.antes && r.depois >= 4, JSON.stringify(r));

  r = await p.evaluate(() => new Promise(res => {
    const portal = CatCity.jogo.portais.find(x => x.id === 'portal');
    CatCity.abrirSegredo(portal, CatCity.jogo.t);
    setTimeout(() => res({ forma: CatCity.jogador.forma, venceu: CatCity.jogo.vencido,
      tela: document.getElementById('telaVitoria').classList.contains('on') }), 3000);
  }));
  conf('o portal secreto vira MEGA LARVA e ganha o jogo',
    r.forma === 'megaLarva' && r.venceu && r.tela, JSON.stringify(r));

  // ---------- menus e save ----------
  await p.click('#btVitoriaMenu'); await p.waitForTimeout(400);
  r = await p.evaluate(() => document.getElementById('telaMenu').classList.contains('on'));
  conf('dá pra voltar pro menu pela tela de vitória', r === true);

  await p.reload(); await p.waitForTimeout(1300);
  r = await p.evaluate(() => ({ formas: CatCity.jogador.desbloqueadas.length,
    segredos: CatCity.jogo.segredos, vencido: CatCity.jogo.vencido }));
  conf('o progresso fica salvo depois de recarregar',
    r.formas >= 12 && r.segredos >= 2 && r.vencido === true, JSON.stringify(r));

  // ---------- o som do ESMAGO da mega larva ----------
  r = await p.evaluate(async () => {
    CatCity.sfx.ligarAudio();
    const proto = (window.AudioContext || window.webkitAudioContext).prototype;
    const antes = proto.createOscillator;
    let n = 0;
    proto.createOscillator = function () { n++; return antes.apply(this, arguments); };
    for (let i = 0; i < 5; i++) CatCity.sfx.terremoto();     // cinco esmagos colados
    await new Promise(f => setTimeout(f, 60));
    proto.createOscillator = antes;
    return n;
  });
  conf('o ESMAGO da mega larva não empilha: cinco seguidos viram um som só, sem estourar',
    r > 0 && r <= 2, r + ' osciladores (5 esmagos seguidos)');

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err.slice(0,5)) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

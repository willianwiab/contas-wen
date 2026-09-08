/* ============================================================
   TORRE DE EMOJIS — teste do RENASCER e do MODO ADM
   Confere o custo de 1 bilhão, a volta do recorde, as estrelas
   e os botões do adm (1, 10, 15, 25, 100, 200, 300, 400, 500,
   1000) com as escalas.

   Como rodar:
     npm i playwright-core
     node teste-renascer-adm.js
   ============================================================ */
const { chromium } = require('playwright-core');
const URL = 'file://' + require('path').resolve(__dirname, 'index.html');
const ok=[], fail=[]; const conf=(n,c,e='')=>(c?ok:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1050,height:1000} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') err.push('C: '+m.text()); });
  await p.goto(URL); await p.waitForTimeout(600);
  await p.evaluate(() => { localStorage.clear(); });
  await p.reload(); await p.waitForTimeout(600);

  // ---------- o renascer custa 1 bilhão mesmo ----------
  let r = await p.evaluate(() => {
    moedas = 999e6;
    const antes = estrelasAGanhar();
    moedas = 1e9;
    return { custo: CUSTO_RENASCER, antes, agora: estrelasAGanhar() };
  });
  conf('renascer só abre em 🪙 1 bilhão', r.custo===1e9 && r.antes===0 && r.agora>=1, JSON.stringify(r));

  r = await p.evaluate(() => {                      // botão trancado mostra o que falta
    moedas = 5e8; mostrarPainel('renascer');
    const t = document.getElementById('renascer').textContent;
    return { trancado: !document.getElementById('renascer').classList.contains('on'), t };
  });
  conf('com pouco dinheiro o botão fica trancado e diz quanto falta',
    r.trancado && r.t.indexOf('falta') >= 0, r.t.slice(0, 60));

  // ---------- renascer de verdade ----------
  r = await p.evaluate(() => {
    moedas = 4e9;
    LOJA.forEach(u => u.qtd = 3);
    const antes = { estrelas, mult: multValor(), niveis: LOJA.reduce((s,u)=>s+u.qtd,0) };
    renascer();
    return { antes, moedas, estrelas, renascimentos, voltaAlvo,
             niveis: LOJA.reduce((s,u)=>s+u.qtd,0), recordeMoedas };
  });
  conf('renascer zera moedas e as 136 melhorias e dá estrela',
    r.moedas===0 && r.niveis===0 && r.estrelas>0 && r.renascimentos===1, JSON.stringify(r));
  conf('a volta do recorde aponta pro último recorde de moedas',
    r.voltaAlvo>=4e9 && r.recordeMoedas>=4e9, 'alvo='+r.voltaAlvo);

  // ---------- a volta do recorde empurra e vai sumindo ----------
  r = await p.evaluate(() => {
    const vazio = multVolta();
    moedas = voltaAlvo / 2; const meio = multVolta();
    moedas = voltaAlvo;     const fim  = multVolta();
    const ligada = naVolta();
    moedas = 0;
    return { vazio, meio, fim, ligada };
  });
  conf('a volta paga muito no começo, menos no meio e desliga no recorde',
    r.vazio > 40 && r.meio > 20 && r.meio < r.vazio && r.fim === 1 && !r.ligada, JSON.stringify(r));

  // ---------- as estrelas pagam pra sempre ----------
  r = await p.evaluate(() => {
    const e0 = estrelas; voltaAlvo = 0;
    estrelas = 0; const semNada = multValor();
    estrelas = 10; const com10 = multValor();
    estrelas = e0;
    return { semNada, com10, esperado: semNada * 4 };
  });
  conf('cada estrela dá +30% em tudo (10 estrelas = 4x)',
    Math.abs(r.com10 - r.esperado) < 1e-6, JSON.stringify(r));

  // ---------- o pagamento do bloco usa tudo isso ----------
  r = await p.evaluate(() => {
    estrelas = 0; voltaAlvo = 0; moedas = 0; comecarRodada();
    const semEstrela = multValor();
    estrelas = 5;
    const comEstrela = multValor();
    estrelas = 0;
    return { semEstrela, comEstrela };
  });
  conf('as estrelas entram na conta que paga o bloco', r.comEstrela > r.semEstrela, JSON.stringify(r));

  // ---------- modo adm: senha ----------
  r = await p.evaluate(() => {
    abrirAdm();
    document.getElementById('admSenha').value = '9999'; tentarSenha();
    const errou = document.getElementById('admPainel').style.display === 'none';
    document.getElementById('admSenha').value = '1234'; tentarSenha();
    const entrou = document.getElementById('admPainel').style.display !== 'none';
    return { errou, entrou, aberta: document.getElementById('adm').classList.contains('on') };
  });
  conf('o adm só abre com a senha certa', r.errou && r.entrou && r.aberta, JSON.stringify(r));

  // ---------- os números que o Jojo pediu ----------
  r = await p.evaluate(() => ({
    numeros: NUMEROS_ADM.slice(),
    botoes: [...document.querySelectorAll('#admBlocos .bt')].map(b => b.textContent),
    escalas: [...document.querySelectorAll('#admEscala .bt')].map(b => b.textContent),
  }));
  conf('o adm tem os 10 botões: 1, 10, 15, 25, 100, 200, 300, 400, 500 e 1000',
    r.numeros.join()==='1,10,15,25,100,200,300,400,500,1000' &&
    r.botoes.join()==='+1,+10,+15,+25,+100,+200,+300,+400,+500,+1000', JSON.stringify(r.botoes));
  conf('e 5 escalas pra multiplicar os botões', r.escalas.length===5, r.escalas.join(' '));

  // ---------- moedas pelo adm, com escala ----------
  r = await p.evaluate(() => {
    moedas = 0; escalaAdm = 1; montarAdm();
    [...document.querySelectorAll('#admMoedas .bt')][2].click();   // o "+15"
    const um = moedas;
    escalaAdm = 1e9; montarAdm();
    const rotulos = [...document.querySelectorAll('#admMoedas .bt')].map(b => b.textContent);
    [...document.querySelectorAll('#admMoedas .bt')][0].click();   // o "+1 bilhão"
    return { um, depois: moedas, rotulos };
  });
  conf('o botão do adm dá a quantia certa e a escala multiplica',
    r.um===15 && r.depois===15+1e9, JSON.stringify({um:r.um, depois:r.depois, r0:r.rotulos[0]}));

  // ---------- blocos pelo adm ----------
  r = await p.evaluate(() => {
    comecarRodada();
    const antes = torre.length;
    escalaAdm = 1; montarAdm();
    [...document.querySelectorAll('#admBlocos .bt')][7].click();   // o "+400"
    return { antes, depois: torre.length, camada: camadaDe(alturaDaTorre()).nome,
             vistas: camadasVistas.length, recorde };
  });
  conf('o adm empilha os blocos e a torre sobe até o NADA de uma vez',
    r.depois - r.antes === 400 && r.camada === 'o NADA' && r.vistas === 11, JSON.stringify(r));

  // ---------- melhorias e estrelas pelo adm ----------
  r = await p.evaluate(() => {
    LOJA.forEach(u => u.qtd = 0); estrelas = 0;
    [...document.querySelectorAll('#admUps .bt')][1].click();       // "+10"
    [...document.querySelectorAll('#admEstrelas .bt')][3].click();  // "+25"
    return { niveis: LOJA.reduce((s,u)=>s+u.qtd,0), itens: LOJA.length, estrelas };
  });
  conf('o adm dá +10 em cada uma das 136 melhorias e +25 estrelas',
    r.niveis === r.itens * 10 && r.estrelas === 25, JSON.stringify(r));

  // ---------- atalhos ----------
  r = await p.evaluate(() => { fecharAdm(); return document.getElementById('adm').classList.contains('on'); });
  await p.keyboard.press('Control+Shift+A'); await p.waitForTimeout(150);
  r = await p.evaluate(() => document.getElementById('adm').classList.contains('on'));
  conf('Ctrl+Shift+A abre o modo adm', r === true);

  r = await p.evaluate(() => {                       // com a janela aberta o espaço não joga
    comecarRodada(); const antes = torre.length;
    document.dispatchEvent(new KeyboardEvent('keydown', { key:' ', bubbles:true }));
    return { antes, depois: torre.length, caindo: !!caindo };
  });
  conf('com a janela do adm aberta, o espaço não solta bloco', !r.caindo, JSON.stringify(r));

  await p.evaluate(() => fecharAdm());
  await p.keyboard.type('ADMIN'); await p.waitForTimeout(150);
  r = await p.evaluate(() => document.getElementById('adm').classList.contains('on'));
  conf('escrever ADMIN também abre o modo adm', r === true);
  await p.evaluate(() => fecharAdm());

  // ---------- salvar e voltar ----------
  const antes = await p.evaluate(() => {
    estrelas = 7; renascimentos = 2; recordeMoedas = 5e9; voltaAlvo = 5e9; moedas = 1234;
    salvar();
    return { estrelas, renascimentos, recordeMoedas, voltaAlvo };
  });
  await p.reload(); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ estrelas, renascimentos, recordeMoedas, voltaAlvo,
                                chave: CHAVE, naVolta: naVolta() }));
  conf('o save novo guarda estrelas, renascimentos e a volta do recorde',
    r.estrelas===antes.estrelas && r.renascimentos===antes.renascimentos &&
    r.voltaAlvo===antes.voltaAlvo && r.naVolta === true && r.chave==='torreEmojis_v3',
    JSON.stringify(r));

  // ---------- save velho continua abrindo ----------
  await p.evaluate(() => {
    apagando = true;                                 // pra o save de saída não escrever por cima
    localStorage.clear();
    localStorage.setItem('torreEmojis_v2', JSON.stringify({ v:2, moedas: 4242, recorde: 77,
      album:[], camadasVistas:['Terra'], cestaAtual:'caras', mudo:false, estat:{}, ups:[['valor0',2]] }));
  });
  await p.reload(); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ moedas: Math.round(moedas), recorde, estrelas, volta: voltaAlvo }));
  conf('quem já jogava não perde o save velho',
    r.moedas >= 4242 && r.recorde===77 && r.estrelas===0 && r.volta===0, JSON.stringify(r));

  console.log('✅ '+ok.length+' ok'); ok.forEach(t=>console.log('   · '+t));
  if (fail.length) { console.log('❌ '+fail.length); fail.forEach(t=>console.log('   · '+t)); }
  console.log(err.length ? '❌ console: '+JSON.stringify(err) : '✅ sem erro no console');
  await b.close();
  process.exit(fail.length || err.length ? 1 : 0);
})();

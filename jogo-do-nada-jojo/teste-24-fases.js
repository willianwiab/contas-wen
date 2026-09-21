const { chromium } = require('playwright-core');
const pass=[],fail=[]; const ok=(n,c,e='')=>(c?pass:fail).push(n+(e?' → '+e:''));
const URL='file:///home/user/contas-wen/jogo-do-nada-jojo/index.html';
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const ctx = await b.newContext();
  const p = await ctx.newPage({ viewport:{width:430,height:860} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  await p.goto(URL); await p.click('#btnComecar');
  await p.evaluate(()=>{dp.classList.add('on');document.getElementById('dpCreditos').style.display='none';});

  // todas as 24 fases desenham alguma coisa
  const vazias=[];
  for(let i=0;i<24;i++){
    await p.evaluate(n=>iniciarFase(n), i);
    await p.waitForTimeout(1750);
    const n = await p.evaluate(()=>document.getElementById('dpPalco').children.length);
    const hud = await p.evaluate(()=>document.getElementById('dpHudTxt').textContent);
    if(n===0) vazias.push(i+1+' ('+hud+')');
  }
  ok('as 24 fases desenham', vazias.length===0, vazias.join(', '));

  // 1 · clicar
  await p.evaluate(()=>iniciarFase(0)); await p.waitForTimeout(1750);
  for(let i=0;i<20;i++){ await p.locator('.dpAlvo').click({force:true}); await p.waitForTimeout(260); }
  await p.waitForTimeout(1700);
  ok('fase de clicar termina e passa', await p.evaluate(()=>faseAtual)===1, 'fase '+await p.evaluate(()=>faseAtual));

  // 3 · aguentar: clicar volta pro começo
  await p.evaluate(()=>iniciarFase(2)); await p.waitForTimeout(1750);
  await p.waitForTimeout(3200);
  const correndo = await p.evaluate(()=>+document.querySelector('.dpRelogio').textContent);
  await p.mouse.click(215,500);
  await p.waitForTimeout(150);
  const zerou = await p.evaluate(()=>+document.querySelector('.dpRelogio').textContent);
  ok('o relógio corre e encostar volta pro começo', correndo<30 && zerou===30, correndo+' → '+zerou);

  // 7 · procurar
  await p.evaluate(()=>iniciarFase(6)); await p.waitForTimeout(1750);
  for(let r=0;r<4;r++){
    const alvo = await p.evaluate(()=>{
      const t=document.querySelector('.dpPlacar').textContent.match(/acha o (\S+)/)[1];
      const cs=[...document.querySelectorAll('.dpCelula')];
      return cs.findIndex(c=>c.textContent===t);
    });
    await p.locator('.dpCelula').nth(alvo).click({force:true});
    await p.waitForTimeout(220);
  }
  await p.waitForTimeout(1700);
  ok('fase de achar o diferente termina', await p.evaluate(()=>faseAtual)===7);

  // 8 · segurar
  await p.evaluate(()=>iniciarFase(7)); await p.waitForTimeout(1750);
  const bb = await p.locator('.dpSegurar').boundingBox();
  await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await p.mouse.down();
  await p.waitForTimeout(1300);
  const meio = await p.evaluate(()=>document.querySelector('.dpBarraCheia').style.width);
  await p.mouse.up(); await p.waitForTimeout(200);
  const depois = await p.evaluate(()=>document.querySelector('.dpBarraCheia').style.width);
  ok('a barra enche segurando e zera soltando', parseFloat(meio)>5 && parseFloat(depois)===0, meio+' → '+depois);

  // 11 · memória
  await p.evaluate(()=>iniciarFase(10)); await p.waitForTimeout(1750);
  const figs = await p.evaluate(()=>[...document.querySelectorAll('.dpCarta')].map(c=>c.dataset.fig));
  const vistos={};
  for(let i=0;i<figs.length;i++){ (vistos[figs[i]]=vistos[figs[i]]||[]).push(i); }
  for(const f of Object.keys(vistos)){
    await p.locator('.dpCarta').nth(vistos[f][0]).click({force:true}); await p.waitForTimeout(120);
    await p.locator('.dpCarta').nth(vistos[f][1]).click({force:true}); await p.waitForTimeout(160);
  }
  await p.waitForTimeout(1700);
  ok('a memória termina achando todos os pares', await p.evaluate(()=>faseAtual)===11);

  // 15 · montar
  await p.evaluate(()=>iniciarFase(14)); await p.waitForTimeout(1750);
  for(let i=0;i<5;i++){
    const vaga = p.locator('.dpVaga:not(.cheia)').first();
    const L = await vaga.getAttribute('data-letra');
    const letra = p.locator(`.dpLetra[data-letra="${L}"]`).first();
    const a = await letra.boundingBox(), v = await vaga.boundingBox();
    await p.mouse.move(a.x+a.width/2,a.y+a.height/2); await p.mouse.down();
    await p.mouse.move(v.x+v.width/2,v.y+v.height/2,{steps:6}); await p.mouse.up();
    await p.waitForTimeout(180);
  }
  await p.waitForTimeout(1700);
  ok('montar O NADA termina', await p.evaluate(()=>faseAtual)===15);

  // 12 · fujão conta as pegadas
  await p.evaluate(()=>iniciarFase(11)); await p.waitForTimeout(1750);
  await p.evaluate(()=>document.querySelector('.dpFujao').click());
  ok('pegar o fujão conta', (await p.evaluate(()=>document.querySelector('.dpPlacar').textContent))==='faltam 4');

  // save e continuar
  await p.evaluate(()=>iniciarFase(5)); await p.waitForTimeout(400);
  const guardado = await p.evaluate(()=>JSON.parse(localStorage.getItem('jogoDoNadaJoJo')).fase);
  await p.goto(URL); await p.waitForTimeout(400);
  const txt = await p.evaluate(()=>document.getElementById('btnContinuar').textContent);
  const visivel = await p.isVisible('#btnContinuar');
  ok('salva e oferece continuar', guardado===5 && visivel && /fase 6/.test(txt), txt);
  await p.click('#btnContinuar'); await p.waitForTimeout(1800);
  await p.evaluate(()=>dp.classList.add('on'));
  ok('continuar cai na fase certa', await p.evaluate(()=>faseAtual)===5);

  // o fim de verdade
  await p.evaluate(()=>fimDeVerdade()); await p.waitForTimeout(400);
  ok('o fim de verdade aparece e limpa o save',
     await p.isVisible('#dpFim') && await p.evaluate(()=>localStorage.getItem('jogoDoNadaJoJo'))===null);

  console.log('PASSOU ('+pass.length+'):\n- '+pass.join('\n- '));
  if(fail.length) console.log('FALHOU ('+fail.length+'):\n- '+fail.join('\n- '));
  const reais=err.filter(e=>!/CERT|net::/.test(e));
  console.log(reais.length?reais.join('\n'):'sem erros de página');
  await b.close(); process.exit(fail.length||reais.length?1:0);
})();

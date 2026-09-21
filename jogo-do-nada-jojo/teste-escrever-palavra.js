const { chromium } = require('playwright-core');
const pass=[],fail=[]; const ok=(n,c,e='')=>(c?pass:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:390,height:780} });   // celular pequeno
  const err=[]; p.on('pageerror',e=>err.push(e.message));
  await p.goto('file:///home/user/contas-wen/jogo-do-nada-jojo/index.html');
  await p.click('#btnComecar');
  await p.evaluate(()=>{dp.classList.add('on');document.getElementById('dpCreditos').style.display='none';});

  // NADADENOVO — 10 letras num celular estreito
  await p.evaluate(()=>iniciarFase(4)); await p.waitForTimeout(1800);
  const v = await p.evaluate(()=>{const x=[...document.querySelectorAll('.dpVaga')].map(e=>e.getBoundingClientRect());
    return {larg:Math.round(x[0].width),alt:Math.round(x[0].height),linhas:new Set(x.map(r=>Math.round(r.top))).size,
            baixo:Math.round(Math.max(...x.map(r=>r.bottom)))};});
  ok('as vagas ficam grandes e quebram em linhas', v.larg>=54 && v.linhas>1, JSON.stringify(v));
  const emCima = await p.evaluate(b=>[...document.querySelectorAll('.dpLetra')]
      .some(l=>l.getBoundingClientRect().top < b), v.baixo);
  ok('nenhuma letra nasce em cima das vagas', !emCima);

  // largar TORTO: 45px pro lado da vaga certa
  let vaga = p.locator('.dpVaga:not(.cheia)').first();
  let L = await vaga.getAttribute('data-letra');
  let letra = p.locator(`.dpLetra[data-letra="${L}"]`).first();
  let a = await letra.boundingBox(), vb = await vaga.boundingBox();
  await p.mouse.move(a.x+a.width/2,a.y+a.height/2); await p.mouse.down();
  await p.mouse.move(vb.x+vb.width/2+45, vb.y+vb.height/2+22,{steps:8}); await p.mouse.up();
  await p.waitForTimeout(200);
  const balao1 = await p.evaluate(()=>document.getElementById('dpBalao').textContent);
  ok('largar torto encaixa na vaga certa mesmo assim',
     (await p.locator('.dpVaga.cheia').count())===1, balao1);

  // SÓ TOCAR na letra (sem arrastar) já manda pro lugar
  vaga = p.locator('.dpVaga:not(.cheia)').first();
  L = await vaga.getAttribute('data-letra');
  await p.locator(`.dpLetra[data-letra="${L}"]`).first().click({force:true});
  await p.waitForTimeout(200);
  ok('tocar na letra já encaixa ela', (await p.locator('.dpVaga.cheia').count())===2);

  // letra errada (distrator) avisa e não entra
  const sobrando = await p.evaluate(()=>{
    const faltam=new Set([...document.querySelectorAll('.dpVaga:not(.cheia)')].map(v=>v.dataset.letra));
    const l=[...document.querySelectorAll('.dpLetra')].find(x=>!faltam.has(x.dataset.letra));
    return l?l.dataset.letra:null;});
  if(sobrando){
    await p.locator(`.dpLetra[data-letra="${sobrando}"]`).first().click({force:true});
    await p.waitForTimeout(200);
    const balao2 = await p.evaluate(()=>document.getElementById('dpBalao').textContent);
    ok('letra que não é da palavra avisa e não entra',
       (await p.locator('.dpVaga.cheia').count())===2 && /não entra/.test(balao2), balao2);
  }

  // termina a fase só tocando
  for(let i=0;i<24;i++){
    const va = p.locator('.dpVaga:not(.cheia)').first();
    if(!(await va.count())) break;
    const LL = await va.getAttribute('data-letra');
    await p.locator(`.dpLetra[data-letra="${LL}"]`).first().click({force:true});
    await p.waitForTimeout(140);
  }
  await p.waitForTimeout(1700);
  ok('a fase termina', await p.evaluate(()=>faseAtual)===5);

  // a palavra grande, NAOFAZNADA, e a fase antiga (NADA) também
  await p.evaluate(()=>iniciarFase(20)); await p.waitForTimeout(1800);
  for(let i=0;i<24;i++){
    const va = p.locator('.dpVaga:not(.cheia)').first();
    if(!(await va.count())) break;
    const LL = await va.getAttribute('data-letra');
    await p.locator(`.dpLetra[data-letra="${LL}"]`).first().click({force:true});
    await p.waitForTimeout(140);
  }
  await p.waitForTimeout(1700);
  ok('NAOFAZNADA também termina', await p.evaluate(()=>faseAtual)===21);

  await p.goto('file:///home/user/contas-wen/jogo-do-nada-jojo/index.html');
  await p.click('#btnComecar');
  await p.evaluate(()=>{dp.classList.add('on');document.getElementById('dpCreditos').style.display='none';
                        document.getElementById('dpCreditos').style.display='none';derrubarOsCreditos();});
  await p.waitForTimeout(600);
  for(let i=0;i<4;i++){
    const va = p.locator('.dpVaga:not(.cheia)').first();
    const LL = await va.getAttribute('data-letra');
    await p.locator(`.dpLetra[data-letra="${LL}"]`).first().click({force:true});
    await p.waitForTimeout(160);
  }
  await p.waitForTimeout(1400);
  ok('a fase antiga de escrever NADA também encaixa por toque e chama o NADA 2',
     (await p.locator('#dpNada2 .boca').count())===2);

  console.log('PASSOU ('+pass.length+'):\n- '+pass.join('\n- '));
  if(fail.length) console.log('FALHOU ('+fail.length+'):\n- '+fail.join('\n- '));
  console.log(err.length?('ERROS: '+err.join('\n')):'sem erros de página');
  await b.close(); process.exit(fail.length||err.length?1:0);
})();

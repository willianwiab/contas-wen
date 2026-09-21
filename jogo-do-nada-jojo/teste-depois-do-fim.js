/* ============================================================
   JOGO DO NADA — teste da segunda metade ("depois do fim")
   Joga as quatro fases novas de ponta a ponta: os créditos que
   não fecham, as letras caídas, O NADA 2 com o escudo infinito
   (e o bigode que atravessa ele) e o botão que foge.

   Como rodar:
     npm i playwright-core
     node teste-depois-do-fim.js
   ============================================================ */
const { chromium } = require('playwright-core');
const pass=[],fail=[]; const ok=(n,c,e='')=>(c?pass:fail).push(n+(e?' → '+e:''));
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:430,height:860} });
  const err=[]; p.on('pageerror',e=>err.push('PAGEERROR: '+e.message));
  await p.goto('file:///home/user/contas-wen/jogo-do-nada-jojo/index.html');
  await p.click('#btnComecar'); await p.waitForTimeout(300);

  // entra direto na segunda metade
  await p.evaluate(()=>comecarDepoisDoFim());
  await p.waitForTimeout(200);
  ok('#depois abre', await p.isVisible('#depois'));

  // 1. créditos + botão de fechar
  await p.click('#dpCreditos', {position:{x:215,y:300}, force:true});
  const c1 = await p.evaluate(()=>document.getElementById('dpConta').textContent);
  ok('clicar nos créditos conta coisa', /Coisas feitas: [1-9]/.test(c1), c1);
  await p.waitForTimeout(5200);
  ok('botão fechar aparece', await p.isVisible('#dpFechar'));
  for(let i=0;i<3;i++){ await p.click('#dpFechar',{force:true}); await p.waitForTimeout(150); }
  await p.waitForTimeout(400);
  const nLetras = await p.locator('.dpLetra').count();
  const nVagas  = await p.locator('.dpVaga').count();
  ok('as letras caem (10) e as vagas nascem (4)', nLetras===10&&nVagas===4, nLetras+'/'+nVagas);

  // 2. arrasta N-A-D-A pras vagas
  for(let i=0;i<4;i++){
    const vaga = p.locator('.dpVaga').nth(i);
    const letra = await vaga.getAttribute('data-letra');
    const el = p.locator(`.dpLetra[data-letra="${letra}"]`).first();
    const a = await el.boundingBox(), v = await vaga.boundingBox();
    await p.mouse.move(a.x+a.width/2, a.y+a.height/2);
    await p.mouse.down();
    await p.mouse.move(v.x+v.width/2, v.y+v.height/2, {steps:8});
    await p.mouse.up();
    await p.waitForTimeout(200);
  }
  const cheias = await p.locator('.dpVaga.cheia').count();
  ok('NADA montado nas quatro vagas', cheias===4, String(cheias));

  // 3. O NADA 2
  await p.waitForTimeout(1200);
  const bocas = await p.locator('#dpNada2 .boca').count();
  ok('O NADA 2 aparece com duas bocas', bocas===2, String(bocas));
  for(let i=0;i<10;i++){ await p.locator('#dpNada2 .boca').nth(i%2).click({force:true}); await p.waitForTimeout(60); }
  await p.waitForTimeout(300);
  ok('escudo infinito liga nas 10 batidas', await p.isVisible('#dpEscudo'));
  await p.waitForTimeout(2200);
  ok('o bigode aparece', await p.isVisible('#dpBigode'));

  // clique não passa mais pelo escudo
  const antes = await p.evaluate(()=>dpVidaNada2);
  await p.locator('#dpNada2 .boca').nth(0).click({force:true});
  ok('clique não atravessa o escudo', (await p.evaluate(()=>dpVidaNada2))===antes);

  // arrasta o bigode em cima dele
  const bg = await p.locator('#dpBigode').boundingBox();
  const nd = await p.locator('#dpNada2').boundingBox();
  await p.mouse.move(bg.x+bg.width/2, bg.y+bg.height/2);
  await p.mouse.down();
  await p.mouse.move(nd.x+nd.width/2, nd.y+nd.height/2, {steps:12});
  await p.mouse.up();
  await p.waitForTimeout(400);
  ok('o bigode mata o NADA 2', await p.evaluate(()=>dpNada2Morto));

  // 4. o botão que foge
  await p.waitForTimeout(3800);
  ok('o botão de desligar aparece', await p.isVisible('#dpDesligar'));
  for(let i=0;i<2;i++){ await p.evaluate(()=>document.getElementById('dpDesligar').click()); await p.waitForTimeout(250); }
  await p.evaluate(()=>document.getElementById('dpDesligar').click());
  await p.waitForTimeout(500);
  ok('a tela apaga como televisão velha', await p.isVisible('#dpTV'));
  // e acende de novo: o jogo não desliga, começam as 24 fases
  await p.waitForTimeout(4600);
  const emFase = await p.evaluate(()=>({fase:faseAtual, hud:document.getElementById('dpHudTxt').textContent,
                                        palco:document.getElementById('dpPalco').classList.contains('on')}));
  ok('a tela acende de novo e cai na fase 1 das 24',
     emFase.fase===0 && emFase.palco && /Fase 1 de 24/.test(emFase.hud), JSON.stringify(emFase));
  await p.screenshot({path:'/tmp/claude-0/-home-user-contas-wen/ab93acdf-a850-569c-81b8-f2cfbddcb135/scratchpad/fim.png'});

  console.log('PASSOU:\n- '+pass.join('\n- '));
  if(fail.length) console.log('FALHOU:\n- '+fail.join('\n- '));
  console.log(err.filter(e=>!/CERT|net::/.test(e)).join('\n')||'sem erros de página');
  await b.close();
  process.exit(fail.length?1:0);
})();

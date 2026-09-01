/* =========================================================
   quadro.js — 🎨 quadro de desenho AO VIVO.

   Os dois desenham no MESMO quadro, cada um no seu aparelho.
   Cada risco (do apertar até o soltar) vira um pacotinho no
   banco da família; o outro aparelho pega os riscos novos de
   1,2 em 1,2 segundo e desenha por cima.

   Vai embaralhado igual aos recados: o banco guarda os riscos
   mas não sabe o que é o desenho.
   ========================================================= */

const CORES_QUADRO = ['#1e1b33','#ef4444','#f59e0b','#22c55e','#0ea5e9','#7c3aed','#ec4899','#ffffff'];
const LADO_QUADRO = 1000;              // o desenho é sempre 1000×1000 e a tela se vira

let quadro = null;                     // { conversa, ctx, cor, tam, riscoAtual, vistos, relogio }

const enderecoQuadro = conversa =>
  `${dados.nuvem.url.replace(/\/$/,'')}/salas/${dados.nuvem.sala}/quadro/${conversa}`;

function abrirQuadro(){
  if(document.getElementById('telaQuadro')) return;
  const c = conversaPor(atual);
  if(!c){ toast('Abre uma conversa primeiro pra desenhar junto 😊', 4000); return; }
  const aoVivo = typeof podeSinalizar === 'function' && podeSinalizar();

  const tela = document.createElement('div');
  tela.className = 'tela-cheia'; tela.id = 'telaQuadro';
  tela.innerHTML = `
    <div class="w-topo" style="background:linear-gradient(135deg,#ec4899,#7c3aed)">
      <button class="icone" id="qdFechar">✕</button>
      <div><b>🎨 Quadro ao vivo</b><div class="w-sub">${aoVivo ? 'com ' + c.nome + ' — os riscos aparecem na hora' : 'só neste aparelho (o ☁️ está desligado)'}</div></div>
      <div class="icones"><button class="icone" id="qdLimpar" title="Apagar tudo">🧽</button></div>
    </div>
    <div class="qd-meio">
      <canvas id="qdTela" width="${LADO_QUADRO}" height="${LADO_QUADRO}"></canvas>
    </div>
    <div class="qd-barra">
      <div class="qd-cores">${CORES_QUADRO.map((cor,i) =>
        `<button class="qd-cor ${i === 0 ? 'on' : ''}" data-cor="${cor}" style="background:${cor}"></button>`).join('')}</div>
      <div class="qd-tam">${[6,16,34].map((t,i) =>
        `<button class="qd-grossura ${i === 1 ? 'on' : ''}" data-tam="${t}"><span style="width:${t/2+4}px;height:${t/2+4}px"></span></button>`).join('')}</div>
    </div>`;
  document.body.appendChild(tela);

  const canvas = document.getElementById('qdTela');
  const ctx = canvas.getContext('2d');
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, LADO_QUADRO, LADO_QUADRO);

  quadro = { conversa: atual, canvas, ctx, cor: CORES_QUADRO[0], tam: 16,
             riscoAtual: null, vistos: new Set(), relogio: null, aoVivo };

  document.getElementById('qdFechar').addEventListener('click', fecharQuadro);
  document.getElementById('qdLimpar').addEventListener('click', limparQuadro);
  tela.querySelectorAll('[data-cor]').forEach(b => b.addEventListener('click', () => {
    tela.querySelectorAll('[data-cor]').forEach(o => o.classList.remove('on'));
    b.classList.add('on'); quadro.cor = b.dataset.cor;
  }));
  tela.querySelectorAll('[data-tam]').forEach(b => b.addEventListener('click', () => {
    tela.querySelectorAll('[data-tam]').forEach(o => o.classList.remove('on'));
    b.classList.add('on'); quadro.tam = +b.dataset.tam;
  }));

  ligarLapis(canvas);
  if(aoVivo){
    puxarRiscos();
    quadro.relogio = setInterval(() => { if(!document.hidden) puxarRiscos(); }, 1200);
  }
}

function fecharQuadro(){
  if(quadro && quadro.relogio) clearInterval(quadro.relogio);
  quadro = null;
  document.getElementById('telaQuadro')?.remove();
}

/* ---------- o lápis ---------- */
function ligarLapis(canvas){
  const ponto = ev => {
    const r = canvas.getBoundingClientRect();
    return [ Math.round((ev.clientX - r.left) / r.width  * LADO_QUADRO),
             Math.round((ev.clientY - r.top)  / r.height * LADO_QUADRO) ];
  };

  canvas.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    canvas.setPointerCapture(ev.pointerId);
    quadro.riscoAtual = { cor: quadro.cor, tam: quadro.tam, pontos: [ponto(ev)] };
  });

  canvas.addEventListener('pointermove', ev => {
    if(!quadro || !quadro.riscoAtual) return;
    ev.preventDefault();
    const p = ponto(ev);
    const pontos = quadro.riscoAtual.pontos;
    const ultimo = pontos[pontos.length - 1];
    /* pontos quase no mesmo lugar só engordam o pacote à toa */
    if(Math.abs(p[0] - ultimo[0]) < 3 && Math.abs(p[1] - ultimo[1]) < 3) return;
    pontos.push(p);
    riscarPedaco(quadro.ctx, quadro.riscoAtual.cor, quadro.riscoAtual.tam, ultimo, p);
  });

  const soltar = () => {
    if(!quadro || !quadro.riscoAtual) return;
    const risco = quadro.riscoAtual;
    quadro.riscoAtual = null;
    if(risco.pontos.length === 1){                  // um toque só: vira um pontinho
      riscarPedaco(quadro.ctx, risco.cor, risco.tam, risco.pontos[0], risco.pontos[0]);
    }
    if(quadro.aoVivo) mandarRisco(risco);
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('pointerleave', soltar);
}

function riscarPedaco(ctx, cor, tam, de, para){
  ctx.strokeStyle = cor; ctx.lineWidth = tam;
  ctx.beginPath(); ctx.moveTo(de[0], de[1]); ctx.lineTo(para[0], para[1]); ctx.stroke();
}

function desenharRisco(risco){
  if(!quadro || !risco || !risco.pontos || !risco.pontos.length) return;
  const { ctx } = quadro;
  if(risco.pontos.length === 1){
    riscarPedaco(ctx, risco.cor, risco.tam, risco.pontos[0], risco.pontos[0]);
    return;
  }
  for(let i = 1; i < risco.pontos.length; i++)
    riscarPedaco(ctx, risco.cor, risco.tam, risco.pontos[i-1], risco.pontos[i]);
}

/* ---------- ir e vir pelo banco ---------- */
async function mandarRisco(risco){
  if(!quadro || !quadro.aoVivo) return;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  quadro.vistos.add(id);                    // o meu risco eu já desenhei
  try{
    const pacote = await embaralhar({ de: dados.euSou, risco });
    await fetch(`${enderecoQuadro(quadro.conversa)}/${id}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(pacote)
    });
  }catch(e){}
}

async function puxarRiscos(){
  if(!quadro || !quadro.aoVivo) return;
  try{
    const r = await fetch(enderecoQuadro(quadro.conversa) + '.json?orderBy="$key"&limitToLast=200');
    if(!r.ok) return;
    const tudo = await r.json();
    if(!tudo) return;
    for(const [id, pacote] of Object.entries(tudo)){
      if(quadro.vistos.has(id)) continue;
      quadro.vistos.add(id);
      if(id === 'limpo'){ continue; }
      const claro = await desembaralhar(pacote);
      if(claro && claro.risco) desenharRisco(claro.risco);
    }
  }catch(e){}
}

async function limparQuadro(){
  if(!quadro) return;
  if(!confirm('Apagar o quadro todo?\nApaga pros dois.')) return;
  quadro.ctx.fillStyle = '#ffffff';
  quadro.ctx.fillRect(0, 0, LADO_QUADRO, LADO_QUADRO);
  quadro.vistos = new Set();
  if(quadro.aoVivo){
    try{
      await fetch(enderecoQuadro(quadro.conversa) + '.json',
        { method:'PUT', headers:{'Content-Type':'application/json'}, body:'null' });
    }catch(e){}
  }
  toast('Quadro limpinho 🧽');
}

/* Quando o outro limpa, o banco fica vazio: aqui a gente percebe e limpa
   também, senão cada um ficava vendo um desenho diferente. */
async function verSeLimparam(){
  if(!quadro || !quadro.aoVivo) return;
  try{
    const r = await fetch(enderecoQuadro(quadro.conversa) + '.json?shallow=true');
    if(!r.ok) return;
    const tem = await r.json();
    if(!tem && quadro.vistos.size){
      quadro.ctx.fillStyle = '#ffffff';
      quadro.ctx.fillRect(0, 0, LADO_QUADRO, LADO_QUADRO);
      quadro.vistos = new Set();
      toast('O outro limpou o quadro 🧽');
    }
  }catch(e){}
}
setInterval(verSeLimparam, 4000);

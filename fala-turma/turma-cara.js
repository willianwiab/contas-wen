/* =========================================================
   turma-cara.js — 🙂 a foto de perfil

   Cada um escolhe a própria foto. Ela vai EMBARALHADA pro
   banco, igual aos recados, e desce pra turma inteira.

   Duas regras que decidem tudo aqui:

   1. A foto é MINÚSCULA de propósito (160px, uns 15 KB). Uma
      turma de 30 pessoas com foto de 4 MB seria 120 MB toda
      vez que alguém abrisse o app — na internet da escola
      isso nunca ia carregar.

   2. A gente não fica puxando as fotos toda hora. Só busca
      quando aparece um nome sem cara, ou de 5 em 5 minutos.
      ========================================================= */

const LADO_CARA = 160;
const PESO_CARA = 15000;   // ~15 KB por pessoa
const MAX_CARAS = 60;      // uma turma bem grande

/* o que aparece no lugar do bichinho: a foto, se a pessoa pôs */
function caraDe(nome){
  const f = (dados.caras || {})[nome];
  return f ? `<img class="cara" src="${f}" alt="" draggable="false">` : bichoDe(nome);
}

/* ---------- escolher a minha ---------- */
function trocarMinhaCara(){
  if(!naTurma()) return;
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.addEventListener('change', async () => {
    const arq = inp.files && inp.files[0];
    if(!arq) return;
    aviso('🙂 Preparando a foto...', 8000);
    try{
      const pequena = await encolherFoto(arq, LADO_CARA, PESO_CARA, true);
      dados.caras = dados.caras || {};
      dados.caras[dados.eu] = pequena;
      salvar(); redesenharCaras();
      aviso('🙂 Pronto! A turma vai ver na próxima vez que abrir');
      mandarMinhaCara();
    }catch(e){ aviso('😕 Não deu pra usar essa foto'); }
  });
  inp.click();
}

function tirarMinhaCara(){
  if(!dados.caras || !dados.caras[dados.eu]) return;
  delete dados.caras[dados.eu];
  salvar(); redesenharCaras();
  aviso('🙂 Voltou o bichinho');
  if(naTurma()) chaveDoBanco('cara', dados.eu).then(k =>
    fetch(`${endereco()}/quem/${k}.json`, { method:'PUT',
      headers:{'Content-Type':'application/json'}, body:'null' })).catch(() => {});
}

/* ---------- a nuvem ---------- */
async function mandarMinhaCara(){
  if(!naTurma() || !navigator.onLine) return;
  const foto = (dados.caras || {})[dados.eu];
  if(!foto) return;
  try{
    await fetch(`${endereco()}/quem/${await chaveDoBanco('cara', dados.eu)}.json`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(await embaralhar({ nome: dados.eu, foto, ts: Date.now() }))
    });
  }catch(e){}
}

let ultimaPuxada = 0;

/* tem alguém no mural sem cara nenhuma? aí vale a pena buscar */
function faltaCara(){
  const tem = dados.caras || {};
  return dados.avisos.some(a => a.de && tem[a.de] === undefined);
}

async function puxarCaras(agora){
  if(!naTurma() || !navigator.onLine) return;
  /* de 5 em 5 minutos, ou na hora se apareceu gente nova */
  if(!agora && Date.now() - ultimaPuxada < 300000 && !faltaCara()) return;
  ultimaPuxada = Date.now();
  try{
    const r = await fetch(`${endereco()}/quem.json`);
    if(!r.ok) return;
    const tudo = await r.json();
    dados.caras = dados.caras || {};
    /* marca todo mundo do mural como "já olhei", pra não ficar
       buscando de novo por causa de quem não pôs foto */
    dados.avisos.forEach(a => { if(a.de && dados.caras[a.de] === undefined) dados.caras[a.de] = null; });
    if(!tudo){ salvar(); return; }
    let mudou = false, quantas = 0;
    for(const pacote of Object.values(tudo)){
      if(++quantas > MAX_CARAS) break;
      const q = await desembaralhar(pacote);
      if(!caraConfere(q)) continue;
      if(dados.caras[q.nome] === q.foto) continue;
      dados.caras[q.nome] = q.foto; mudou = true;
    }
    salvar();
    if(mudou) redesenharCaras();
  }catch(e){}
}

/* veio de outro aparelho: confere antes de virar tela */
function caraConfere(q){
  if(!q || typeof q !== 'object') return false;
  if(typeof q.nome !== 'string' || !q.nome.trim() || q.nome.length > 30) return false;
  if(typeof q.foto !== 'string') return false;
  if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(q.foto)) return false;
  return q.foto.length <= 60000;
}

/* ---------- redesenhar onde a cara aparece ---------- */
let redesenhando = false;
function redesenharCaras(){
  if(redesenhando) return;              /* abrirGente() chama de volta */
  redesenhando = true;
  try{ desenharAsCaras(); } finally{ redesenhando = false; }
}
function desenharAsCaras(){
  const chip = $('#euAv');
  if(chip && dados.eu) chip.innerHTML = caraDe(dados.eu);
  const pre = $('#caraPrevia');
  if(pre && dados.eu){
    pre.innerHTML = caraDe(dados.eu);
    pre.style.background = corDe(dados.eu);
    const bt = $('#btTirarCara');
    if(bt) bt.classList.toggle('escondido', !(dados.caras || {})[dados.eu]);
  }
  /* o mural é redesenhado sempre, mesmo escondido: senão a cara nova
     só aparecia depois de mexer em alguma outra coisa */
  desenharMural();
  if(document.getElementById('tela-gente').classList.contains('on')) abrirGente();
  if(document.getElementById('tela-privadas').classList.contains('on')) abrirPrivadas();
  if(comQuem) $('#pvAv').innerHTML = caraDe(comQuem);
}


/* =========================================================
   📲 PÔR NO APARELHO
   O Android avisa quando dá pra instalar: a gente guarda esse
   aviso e usa quando a pessoa apertar o botão. O iPhone não
   avisa nada, por isso a tela também ensina o caminho na mão.
   ========================================================= */
let convitePraInstalar = null;

window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault();
  convitePraInstalar = ev;
  const bt = $('#btInstalarJa');
  if(bt) bt.classList.remove('escondido');
  const atalho = document.querySelector('[data-ir="instalar"]');
  if(atalho) atalho.classList.add('tem-nova'), atalho.dataset.quantas = '!';
});

window.addEventListener('appinstalled', () => {
  convitePraInstalar = null;
  aviso('🎉 Instalado! Agora tem o ícone na tua tela');
  verSeJaInstalou();
});

function instalado(){
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function verSeJaInstalou(){
  const caixa = $('#jaInstalado');
  const bt = $('#btInstalarJa');
  if(!caixa) return;
  caixa.classList.toggle('escondido', !instalado());
  if(bt) bt.classList.toggle('escondido', instalado() || !convitePraInstalar);
  const atalho = document.querySelector('[data-ir="instalar"]');
  if(atalho && instalado()){ atalho.classList.remove('tem-nova'); atalho.dataset.quantas = ''; }
}

async function instalarAgora(){
  if(!convitePraInstalar){
    aviso('Olha os passos aqui embaixo 👇', 5000); return;
  }
  convitePraInstalar.prompt();
  const r = await convitePraInstalar.userChoice.catch(() => null);
  convitePraInstalar = null;
  $('#btInstalarJa').classList.add('escondido');
  if(r && r.outcome !== 'accepted') aviso('Sem problema — dá pra instalar depois');
}

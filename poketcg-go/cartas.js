/* =========================================================
   PokéTCG GO — DE ONDE VÊM AS CARTAS

   As cartas são DE VERDADE. Nome, foto, raridade e coleção
   saem da api.pokemontcg.io, a mesma que o ButterPoke usa
   aqui no repositório — de graça e sem cadastro.

   A foto NÃO é copiada pra cá: a página aponta pro endereço
   da imagem no servidor deles. A arte da carta é da empresa
   que faz o Pokémon, e colocar uma cópia dela no nosso site
   seria publicar desenho que não é nosso.

   Por isso o jogo precisa de internet PRA ENCHER o baralho
   na primeira vez. Depois disso o baralho fica guardado no
   aparelho e o jogo abre sem internet — só as fotos é que
   precisam da rede pra aparecer.
   ========================================================= */

const CHAVE_BARALHO = 'poketcg-go:baralho';
const API = 'https://api.pokemontcg.io/v2/cards';
const POR_PAGINA = 250;
const PAGINAS = [1, 2, 3];        /* ~750 cartas, iguais pra todo mundo */
const VALIDADE = 7 * 24 * 3600 * 1000;

/* ---------------------------------------------------------
   AS FAIXAS DE RARIDADE

   A API escreve a raridade de dezenas de jeitos diferentes
   ("Rare Holo", "Illustration Rare", "Rare Secret"...) e
   inventa nomes novos a cada coleção nova. Então em vez de
   uma lista fechada, que quebraria sozinha com o tempo, a
   faixa sai de um teste em cima do texto — e o que não cair
   em nada vira "Rara", em vez de derrubar a carta.
   --------------------------------------------------------- */
const FAIXAS = [
  null,
  { n:1, nome:'Comum',       sim:'◆',    cor:'#9aa6b2', peso:1000, pega:0.82, xp:10 },
  { n:2, nome:'Incomum',     sim:'◆◆',   cor:'#7dd3fc', peso:400,  pega:0.70, xp:25 },
  { n:3, nome:'Rara',        sim:'◆◆◆',  cor:'#5ee89a', peso:150,  pega:0.54, xp:60 },
  { n:4, nome:'Super Rara',  sim:'◆◆◆◆', cor:'#f2c200', peso:45,   pega:0.36, xp:150 },
  { n:5, nome:'Ultra Rara',  sim:'★',    cor:'#ff9ed8', peso:12,   pega:0.22, xp:400 },
  { n:6, nome:'Coroa',       sim:'👑',   cor:'#ffe066', peso:3,    pega:0.13, xp:1200 }
];

function faixaDa(raridade){
  const r = String(raridade || '').toLowerCase();
  if(!r) return 1;
  /* a ordem importa: "uncommon" tem "common" dentro, e quase
     tudo tem "rare" dentro */
  if(/crown/.test(r)) return 6;
  if(/hyper|rainbow|secret|special illustration|shiny/.test(r)) return 5;
  if(/illustration|ultra|vmax|vstar|double rare|radiant|amazing|legend|break|prime|lv\.?x|prism|\bgx\b|\bex\b|\bv\b/.test(r)) return 4;
  if(/uncommon/.test(r)) return 2;
  if(/common/.test(r)) return 1;
  if(/holo|rare|promo/.test(r)) return 3;
  return 3;
}
const faixa = c => FAIXAS[c.faixa] || FAIXAS[1];

/* ---------------------------------------------------------
   PEDIR PRA API

   Copiado do ButterPoke, que já levou pancada da vida: erro
   500 é soluço do servidor deles e vale uma segunda chance;
   429 é limite batido e insistir só piora.
   --------------------------------------------------------- */
async function pedirJSON(url, vezes, jaFoi){
  const limite = vezes || 2;
  const n = (jaFoi || 0) + 1;
  try{
    const r = await fetch(url, { headers:{ Accept:'application/json' } });
    if(!r.ok){ const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return await r.json();
  }catch(e){
    if((!e.status || e.status >= 500) && n < limite){
      await new Promise(f => setTimeout(f, n === 1 ? 600 : 2200));
      return pedirJSON(url, limite, n);
    }
    throw e;
  }
}

function explicarErro(e){
  const m = String((e && e.message) || e || '');
  if(typeof navigator !== 'undefined' && navigator.onLine === false)
    return 'Teu aparelho está <b>sem internet</b>. Liga o wi-fi ou os dados e tenta de novo.';
  if(/HTTP 5\d\d/.test(m))
    return 'O site das cartas está com problema <b>do lado deles</b> — não é culpa tua. ' +
           'Costuma voltar sozinho em alguns minutos.';
  if(/HTTP 429/.test(m))
    return 'O site das cartas bateu o <b>limite de pesquisas</b> de hoje. Tenta daqui a pouco.';
  if(/failed to fetch|networkerror|load failed|network request failed/i.test(m))
    return 'Não consegui chegar no site das cartas. Ou a internet oscilou, ou eles saíram do ar.';
  return 'Não consegui falar com o site das cartas.';
}

/* ---------------------------------------------------------
   O QUE A GENTE GUARDA DE CADA CARTA

   A resposta da API é enorme (regras, ataques, preços, cada
   fraqueza). Guardar tudo isso enche o espaço do aparelho
   por nada — o jogo só precisa disto aqui.
   --------------------------------------------------------- */
function enxugar(c){
  const foto = (c.images && (c.images.small || c.images.large)) || '';
  if(!c.id || !c.name || !foto) return null;        /* sem foto não dá carta */
  return {
    id: c.id,
    nome: c.name,
    foto,
    grande: (c.images && c.images.large) || foto,
    raridade: c.rarity || '',
    faixa: faixaDa(c.rarity),
    colecao: (c.set && c.set.name) || '',
    numero: c.number || '',
    hp: c.hp || '',
    tipos: Array.isArray(c.types) ? c.types.slice(0, 2) : []
  };
}

/* ---------------------------------------------------------
   O BARALHO

   Uma vez na vida (e de novo depois de uma semana) ele vem
   da internet. No resto das vezes sai do aparelho.
   --------------------------------------------------------- */
let BARALHO = [];
let deOndeVeio = '';

function lerGuardado(){
  try{
    const cru = localStorage.getItem(CHAVE_BARALHO);
    if(!cru) return null;
    const o = JSON.parse(cru);
    if(o && Array.isArray(o.cartas) && o.cartas.length) return o;
  }catch(e){}
  return null;
}

function guardar(cartas){
  try{
    localStorage.setItem(CHAVE_BARALHO, JSON.stringify({ quando:Date.now(), cartas }));
  }catch(e){ /* sem espaço: o jogo roda igual, só busca de novo na próxima */ }
}

async function buscarDaInternet(aviso){
  const achadas = [], vistos = new Set();
  for(let i = 0; i < PAGINAS.length; i++){
    if(aviso) aviso(`<span class="girando">⏳</span> buscando as cartas… ` +
                    `<b>${achadas.length}</b> até agora`);
    const url = `${API}?q=supertype:pokemon&pageSize=${POR_PAGINA}&page=${PAGINAS[i]}`;
    const r = await pedirJSON(url, 3);
    for(const bruta of (r.data || [])){
      const c = enxugar(bruta);
      if(c && !vistos.has(c.id)){ vistos.add(c.id); achadas.push(c); }
    }
  }
  if(!achadas.length) throw new Error('a API respondeu sem carta nenhuma');
  return achadas;
}

/* Devolve de onde o baralho veio, pra tela poder ser honesta:
   'internet', 'guardado' (deu erro mas tinha cópia aqui) ou
   'teste' (só os meus testes passam um baralho na mão). */
async function encherBaralho(aviso){
  if(Array.isArray(window.DECK_DE_TESTE) && window.DECK_DE_TESTE.length){
    BARALHO = window.DECK_DE_TESTE.map(enxugar).filter(Boolean);
    deOndeVeio = 'teste';
    return deOndeVeio;
  }

  const guardadas = lerGuardado();
  const velho = guardadas && (Date.now() - guardadas.quando > VALIDADE);

  if(guardadas && !velho){
    BARALHO = guardadas.cartas;
    deOndeVeio = 'guardado';
    return deOndeVeio;
  }

  try{
    BARALHO = await buscarDaInternet(aviso);
    guardar(BARALHO);
    deOndeVeio = 'internet';
    return deOndeVeio;
  }catch(e){
    if(guardadas){            /* deu erro, mas tem a cópia de antes: joga com ela */
      BARALHO = guardadas.cartas;
      deOndeVeio = 'guardado';
      return deOndeVeio;
    }
    throw e;                  /* primeira vez e sem internet: aí não tem jogo */
  }
}

const cartaPorId = id => BARALHO.find(c => c.id === id) || null;

/* ---------------------------------------------------------
   SORTEAR UMA CARTA PRA NASCER NO MAPA

   Pelo peso da faixa: comum aparece mil vezes mais que coroa.
   --------------------------------------------------------- */
function sortearCarta(){
  if(!BARALHO.length) return null;
  let soma = 0;
  for(const c of BARALHO) soma += faixa(c).peso;
  let n = Math.random() * soma;
  for(const c of BARALHO){
    n -= faixa(c).peso;
    if(n <= 0) return c;
  }
  return BARALHO[BARALHO.length - 1];
}

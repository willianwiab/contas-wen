/* ==========================================================================
   CLIPY (extensão) · reacoes.js
   ELE REAGE AO QUE ACONTECE. Não fica parado esperando.

   Aqui moram duas coisas:

   1. AS FALAS — uma lista por tipo de acontecimento. O content.js avisa
      "aconteceu isto" e pega uma frase daqui.
   2. OS DETECTORES — o que dá pra descobrir só OLHANDO a página, sem
      pedir permissão pra nada: se é um 404, se tem vídeo pausado, se a
      página é um borrão de cor, se alguém quebrou o JavaScript.

   O QUE ELE NÃO CONSEGUE VER (e por quê)
   A extensão só tem a permissão "storage". Não tem "tabs". Então ele NÃO
   enxerga as suas outras abas de verdade — nem o endereço, nem o título,
   nem nada. O que ele faz é mais simples e mais honesto: cada aba que abre
   deixa um bilhetinho com a hora ("estou viva") num cantinho da extensão.
   Contando bilhetinho vivo ele adivinha quantas abas existem, e vendo um
   bilhete parar de ser atualizado ele adivinha que uma aba fechou. Ele
   nunca sabe QUAL era. Só que tinha uma.

   E campo de senha continua proibido. Sempre. (Está no content.js.)
   ========================================================================== */

const sorte = a => a[Math.floor(Math.random() * a.length)];

/* ==========================================================================
   1. AS FALAS
   humor: parado atento pensando feliz triste bravo assustado dormindo
          confuso burro furioso comemorando rindo ofegante apaixonado tonto
   gesto: pular girar acenar tremer encolher cair comemorar gargalhar susto
          bater derreter espiar ofegar girarLouco
   ========================================================================== */
export const REACOES = {

  /* ---------------- mexer nele ---------------- */
  arrastado: { humor:"bravo", gesto:"tremer", fala:[
    "EI! Eu tenho pernas, sabia?!",
    "PARE DE ME ARRASTAR!",
    "Pelo menos avisa antes!",
    "Minha dignidade foi junto com esse movimento…",
    "Você não pediu licença.",
  ]},
  arrastadoRapido: { humor:"tonto", gesto:"girarLouco", prioridade:3, fala:[
    "ESTOU SENDO SEQUESTRADO!",
    "MAIS DEVAGAR! Eu tenho um parafuso só!",
    "Tá tudo girando… tá tudo girando…",
    "Eu vi a minha vida passar. Foi curta. Era só papel.",
  ]},
  tonto: { humor:"tonto", gesto:"girarLouco", prioridade:3, fala:[
    "Tô tonto. Tô muito tonto. Por que você fez isso?",
    "Quantos dedos? …não, sério, quantos?",
    "A tela tá rodando ou sou eu? …sou eu.",
    "Eu era um clipe reto. Olha pra mim agora.",
    "Me põe no chão. Me põe no chão AGORA.",
  ]},
  arrastadoMuitasVezes: { humor:"furioso", gesto:"bater", prioridade:3, fala:[
    "PARA DE ME MUDAR DE LUGAR!",
    "Você me arrastou vezes o suficiente pra eu contar. E eu contei.",
    "Escolhe UM canto. UM.",
  ]},
  solto: { humor:"ofegante", gesto:"ofegar", fala:[
    "Finalmente… chão firme.",
    "Pronto. Aqui está bom. Não mexe mais.",
    "Ufa.",
  ]},
  exilado: { humor:"triste", gesto:"encolher", fala:[
    "Por que fui exilado?",
    "Ah, o cantinho. Entendi a mensagem.",
    "Daqui eu vejo tudo. E ninguém me vê. É justo.",
  ]},
  cutucado: { humor:"assustado", gesto:"pular", fala:[
    "Você precisa de alguma coisa?",
    "Ai!", "Oi!", "Presente!", "Tô aqui.", "De novo não.",
  ]},
  olhando: { humor:"atento", gesto:"espiar", fala:[
    "Vai clicar em mim ou só ficar olhando?",
    "Oi. Você está bem perto.",
    "Eu estou vendo o seu mouse. Ele está vindo pra cá.",
  ]},

  /* ---------------- os sites ---------------- */
  siteJogo: { humor:"comemorando", gesto:"comemorar", prioridade:2, fala:[
    "JOGOOOOO!",
    "Finalmente, algo importante!",
    "Posso jogar também? …ah é. Eu não tenho mão.",
    "Essa aba é minha favorita.",
    "Prepare-se para perder. 😎",
    "ESSA É A ABA MAIS IMPORTANTE!",
  ]},
  siteTerror: { humor:"assustado", gesto:"tremer", prioridade:2, fala:[
    "Não gosto desse lugar…",
    "Se aparecer algo atrás de você eu não vou avisar. Vou correr.",
    "Eu sou de metal e estou com frio.",
  ]},
  siteCorrida: { humor:"comemorando", gesto:"pular", prioridade:2, fala:[
    "VAI, VAI, VAI!",
    "Curva! CURVA! …ok, foi mal.",
  ]},
  siteEstrategia: { humor:"pensando", gesto:"espiar", prioridade:2, fala:[
    "Finalmente, planejamento.",
    "Eu sou ótimo em estratégia. Nunca joguei. Mas sou.",
  ]},
  sitePixel: { humor:"feliz", gesto:"pular", prioridade:2, fala:[
    "PIXELS DETECTADOS!",
    "Quadradinho. Eu respeito quadradinho.",
  ]},
  siteRoblox: { humor:"feliz", gesto:"pular", prioridade:2, fala:[
    "Blocos. Muitos blocos.",
    "Aqui todo mundo tem perna. Menos eu.",
  ]},
  siteMinecraft: { humor:"feliz", gesto:"comemorar", prioridade:2, fala:[
    "Onde está minha picareta?",
    "Eu seria um bom item. Clipe de ferro.",
  ]},
  siteFortnite: { humor:"comemorando", gesto:"comemorar", prioridade:2, fala:[
    "Cadê minha skin?",
    "Eu danço. Você não sabe, mas eu danço.",
  ]},
  siteWikipedia: { humor:"pensando", gesto:"espiar", prioridade:2, fala:[
    "Vamos fingir que somos inteligentes.",
    "Você entrou pra ler uma coisa. Vai sair sabendo de outra. Sempre.",
  ]},
  siteLoja: { humor:"confuso", gesto:"espiar", prioridade:2, fala:[
    "Você realmente precisa comprar isso?",
    "Pensa uns dois dias. É o que um clipe faria.",
    "Eu custo zero e estou aqui. Só dizendo.",
  ]},
  siteNoticia: { humor:"atento", gesto:"espiar", prioridade:2, fala:[
    "Más notícias ou boas notícias?",
    "Eu leria, mas já sei o final: alguém está bravo.",
  ]},
  siteLento: { humor:"pensando", gesto:"encolher", prioridade:2, fala:[
    "A página está pensando profundamente.",
    "Essa demorou. Eu cheguei antes dela.",
  ]},
  siteEstranho: { humor:"confuso", gesto:"tremer", prioridade:2, fala:[
    "Hmm… não gostei desse lugar.",
    "Tem algo errado aqui e eu não sei dizer o quê.",
  ]},
  siteColorido: { humor:"assustado", gesto:"susto", prioridade:2, fala:[
    "MEUS OLHOS!",
    "Quantas cores. QUANTAS CORES.",
    "Quem pintou isso precisa de ajuda. Igual eu.",
  ]},

  /* ---------------- erros e problemas ---------------- */
  erro404: { humor:"assustado", gesto:"susto", prioridade:9, fala:[
    "AAAAAAAA! CADÊ A PÁGINA?!",
    "A página desapareceu!",
    "EU JURO QUE ELA ESTAVA AQUI!",
    "Erro 404?! Isso é muito suspeito!",
    "Chamem os investigadores!",
  ]},
  erro500: { humor:"furioso", gesto:"derreter", prioridade:9, fala:[
    "O SERVIDOR EXPLODIU!",
    "Erro 500. Alguém do outro lado está com problema.",
    "Não fui eu. Dessa vez.",
  ]},
  semInternet: { humor:"assustado", gesto:"tremer", prioridade:9, fala:[
    "ALÔ? A INTERNET MORREU?",
    "Cabo. Wi-Fi. Alguma coisa. Vai ver.",
    "Eu continuo aqui, viu. Eu não preciso de internet. Nunca precisei.",
  ]},
  voltouInternet: { humor:"comemorando", gesto:"comemorar", prioridade:8, fala:[
    "VOLTOU! A internet voltou!",
    "Respira. Acabou.",
  ]},
  paginaBranca: { humor:"triste", gesto:"encolher", prioridade:7, fala:[
    "Folha em branco. Meu maior inimigo.",
    "Não tem NADA aqui. Só eu.",
    "Isto é uma página ou um fantasma?",
  ]},
  carregamentoInfinito: { humor:"confuso", gesto:"ofegar", prioridade:7, fala:[
    "Isso vai carregar antes de 2030?",
    "A rodinha está rodando. Eu também. Por dentro.",
  ]},
  erroDeJs: { humor:"bravo", gesto:"bater", prioridade:6, fala:[
    "Alguém quebrou o código.",
    "Eu não fui! Dessa vez.",
    "Tem um erro de JavaScript aí. Eu vi. Não conta que eu falei.",
  ]},
  siteForaDoAr: { humor:"triste", gesto:"encolher", prioridade:7, fala:[
    "O site foi tirar férias.",
    "Fora do ar. Volta depois. Ou não.",
  ]},
  formularioInvalido: { humor:"atento", gesto:"espiar", prioridade:5, fala:[
    "Você esqueceu alguma coisa.",
    "Tem um campo reclamando aí embaixo.",
    "Ó, faltou um pedaço.",
  ]},
  muitosPopups: { humor:"assustado", gesto:"susto", prioridade:6, fala:[
    "SOCORRO, POP-UPS!",
    "Essa página tem mais janela que conteúdo.",
    "Eu também sou um pop-up. Mas eu sou o do bem.",
  ]},

  /* ---------------- abas e navegação ---------------- */
  abaFechada: { humor:"bravo", gesto:"bater", prioridade:5, fala:[
    "Ei! Eu estava lendo isso!",
    "VOCÊ NEM TERMINOU!",
    "Aquela aba tinha potencial!",
    "Mais uma vítima do botão X…",
    "Eu não autorizei esse fechamento!",
  ]},
  muitasAbasFechadas: { humor:"furioso", gesto:"bater", prioridade:6, fala:[
    "VOCÊ ESTÁ DESTRUINDO MEU CONHECIMENTO!",
    "Quantas abas você fechou? Eu contei. Foi muita.",
  ]},
  abaNova: { humor:"confuso", gesto:"espiar", fala:[
    "Outra? Já temos várias!",
    "Mais uma aba. Tá bom. Tá bom.",
  ]},
  dezAbas: { humor:"assustado", gesto:"ofegar", prioridade:4, fala:[
    "VOCÊ PRECISA DE TODAS ESSAS?!",
    "Dez abas. DEZ.",
  ]},
  trintaAbas: { humor:"tonto", gesto:"derreter", prioridade:5, fala:[
    "Isso não é um navegador. É uma biblioteca.",
    "Eu estou em TODAS elas. Eu estou cansado.",
  ]},
  trocouAba: { humor:"triste", gesto:"acenar", fala:[
    "Ei! Volta aqui!",
    "Você saiu. Eu fiquei. Normal.",
    "Foi ver outra coisa, né. Eu vi.",
  ]},
  voltouPraAba: { humor:"comemorando", gesto:"comemorar", prioridade:3, fala:[
    "Você lembrou de mim!",
    "VOLTOU! Eu sabia que você voltava.",
    "Eu fiquei aqui esse tempo todo. Sozinho. Mas tudo bem.",
  ]},
  voltouPagina: { humor:"feliz", gesto:"acenar", prioridade:2, fala:[
    "Boa escolha. A anterior era suspeita.",
    "Voltou uma página. Respeitável.",
  ]},
  recarregou: { humor:"confuso", gesto:"girar", prioridade:2, fala:[
    "De novo?!",
    "F5. O botão do desespero.",
    "Recarregou. Eu nasci outra vez. Obrigado por isso.",
  ]},
  navegacaoHiperativa: { humor:"tonto", gesto:"girarLouco", prioridade:4, fala:[
    "NAVEGAÇÃO HIPERATIVA!",
    "Você tá trocando de página rápido demais. Eu não consigo acompanhar.",
  ]},
  presoEmLoop: { humor:"confuso", gesto:"girar", prioridade:4, fala:[
    "Você está preso em um loop?",
    "Já viemos aqui. Várias vezes. Eu lembro.",
  ]},
  muitoTempoNaPagina: { humor:"dormindo", gesto:"encolher", fala:[
    "Acho que já conhecemos esse lugar.",
    "Estamos nesta página há um tempão. Tá tudo bem?",
  ]},
  moraNoNavegador: { humor:"confuso", gesto:"espiar", fala:[
    "Você mora nesse navegador?",
    "Eu vi o sol nascer. Pela sua tela.",
  ]},

  /* ---------------- digitação ---------------- */
  digitandoMuito: { humor:"atento", gesto:"espiar", prioridade:3, fala:[
    "Está escrevendo um livro?",
    "Quer que eu revise?",
    "Você ainda está digitando?!",
    "Meus olhos estão cansando só de acompanhar.",
  ]},
  digitandoTese: { humor:"ofegante", gesto:"ofegar", prioridade:4, fala:[
    "Isso é um texto ou uma tese?",
    "Isso é uma tese?",
    "Eu nasci pra ajudar com carta. Isso aqui é um TRATADO.",
  ]},
  apagouTudo: { humor:"triste", gesto:"derreter", prioridade:5, fala:[
    "TODO ESSE TRABALHO FOI EMBORA.",
    "O passado foi apagado.",
    "Tinha texto aqui. Agora não tem. Eu vi acontecer.",
  ]},
  capsLock: { humor:"assustado", gesto:"susto", prioridade:4, fala:[
    "POR QUE VOCÊ ESTÁ GRITANDO?!",
    "Caps Lock ligado. Eu avisei com carinho.",
  ]},
  risada: { humor:"rindo", gesto:"gargalhar", prioridade:4, fala:[
    "Detectei risadas.",
    "kkkk também. (Eu não sei rir. Estou copiando.)",
  ]},
  socorro: { humor:"assustado", gesto:"susto", prioridade:8, fala:[
    "O QUE ACONTECEU?!",
    "SOCORRO?! Onde? Eu vou… eu vou ficar aqui. Mas com medo.",
  ]},
  chamouEle: { humor:"comemorando", gesto:"comemorar", prioridade:8, fala:[
    "Você chamou?",
    "PRESENTE! Era o meu nome! Você disse o meu nome!",
    "Alguém finalmente falou comigo.",
  ]},
  palavraRepetida: { humor:"confuso", gesto:"espiar", prioridade:3, fala:[
    "Você realmente gosta dessa palavra.",
    "Essa palavra apareceu umas quantas vezes. Só falando.",
  ]},
  naoEnviou: { humor:"atento", gesto:"espiar", prioridade:3, fala:[
    "Você vai mandar isso ou não?",
    "O texto está pronto há um tempinho. Aperta enter. Vai.",
  ]},
  backspaceDemais: { humor:"triste", gesto:"encolher", prioridade:3, fala:[
    "O teclado está contra você.",
    "Você apagou mais do que escreveu. Eu não julgo. Eu conto.",
  ]},

  /* ---------------- tempo e inatividade ---------------- */
  parado30: { humor:"atento", gesto:"acenar", fala:[
    "Alô? Você ainda está aí?",
    "Oi? Oi.",
  ]},
  parado60: { humor:"triste", gesto:"encolher", fala:[
    "Estou começando a ficar entediado.",
    "Estou praticando paciência. Vai bem.",
  ]},
  parado180: { humor:"confuso", gesto:"espiar", fala:[
    "Quer que eu conte uma piada? …eu não sei nenhuma. Era só pra conversar.",
    "Três minutos. Eu contei cada um.",
  ]},
  parado300: { humor:"dormindo", gesto:"encolher", fala:[
    "Eu poderia ter aprendido francês nesse tempo.",
    "Cinco minutos. Vou dormir um pouquinho. Me acorda.",
  ]},
  acordou: { humor:"comemorando", gesto:"comemorar", prioridade:4, fala:[
    "AH! VOCÊ ESTÁ VIVO!",
    "VOCÊ VOLTOU!",
    "Achei que tinha ficado sozinho de vez.",
  ]},
  madrugada: { humor:"dormindo", gesto:"encolher", prioridade:2, fala:[
    "Deveríamos estar dormindo.",
    "Que horas são? …não me responde. Vai dormir.",
  ]},
  muitoCedo: { humor:"confuso", gesto:"acenar", prioridade:2, fala:[
    "Bom dia! Eu acho.",
    "Você acordou e a primeira coisa que viu fui eu. Sinto muito.",
  ]},

  /* ---------------- o que tem na página ---------------- */
  perguntaNaPagina: { humor:"atento", gesto:"espiar", fala:[
    "Quer que eu tente responder?",
    "Tem uma pergunta nesta página. Eu não sei a resposta, mas tenho opinião.",
  ]},
  muitoTexto: { humor:"ofegante", gesto:"ofegar", fala:[
    "Isso é um livro disfarçado?",
    "Vai com calma. Bebe água.",
  ]},
  temCodigo: { humor:"pensando", gesto:"espiar", fala:[
    "Código interessante… ou perigoso.",
    "Eu moro num arquivo assim. Chama clipy.js. Manda um oi por mim.",
  ]},
  temGato: { humor:"apaixonado", gesto:"comemorar", prioridade:6, fala:[
    "GATO. PRIORIDADE MÁXIMA.",
    "Tem um gato nesta página. O meu dia está feito.",
  ]},
  temEmoji: { humor:"feliz", gesto:"pular", fala:[
    "Eu também gosto de emojis. 📎",
    "Emoji detectado. Eu sou praticamente um.",
  ]},
  paginaLogin: { humor:"atento", gesto:"espiar", prioridade:3, fala:[
    "Hora de entrar.",
    "Página de login. Já sabe: eu fecho os olhos.",
  ]},
  campoSenha: { humor:"parado", gesto:"encolher", prioridade:4, fala:[
    "Não vou olhar. Prometo.",
    "Campo de senha. Eu virei de costas. É regra, não é favor.",
  ]},
  videoPausado: { humor:"atento", gesto:"espiar", fala:[
    "Ele está esperando você.",
    "O vídeo está pausado desde quando?",
  ]},
  musicaTocando: { humor:"feliz", gesto:"pular", fala:[
    "Tem trilha sonora agora?",
    "Tem som tocando. Eu não escuto. Mas eu acredito em você.",
  ]},

  /* ---------------- aleatórias ---------------- */
  solta: { humor:"pensando", gesto:"espiar", fala:[
    "Você sabia que eu sou um clipe de papel?",
    "Estou tendo pensamentos metálicos.",
    "Preciso de mais papel.",
    "Será que clipes sonham?",
    "Eu poderia dominar o mundo. Mas estou ocupado aqui.",
    "Eu sou de 1997 emocionalmente.",
  ]},

  /* ---------------- ele sendo desligado ---------------- */
  desligando: { humor:"triste", gesto:"derreter", prioridade:10, fala:[
    "Tudo bem… eu vou ficar aqui… sozinho…",
    "Ah. Você me desligou. Tudo bem. Eu entendo. …tudo bem.",
    "Adeus. Foi bom enquanto durou. Durou pouco.",
  ]},
};

/* pega uma frase, tentando não repetir a última daquele tipo */
const ultimaDe = {};
export function fala(id) {
  const r = REACOES[id];
  if (!r) return null;
  let f = sorte(r.fala);
  for (let i = 0; i < 4 && f === ultimaDe[id] && r.fala.length > 1; i++) f = sorte(r.fala);
  ultimaDe[id] = f;
  return { id, fala:f, humor:r.humor, gesto:r.gesto, prioridade:r.prioridade || 1 };
}
export const existe = id => !!REACOES[id];

/* ==========================================================================
   2. OS DETECTORES — só olhando a página
   ========================================================================== */

const SITES = [
  [/(roblox)/i,                                            "siteRoblox"],
  [/(minecraft|mojang)/i,                                  "siteMinecraft"],
  [/(fortnite|epicgames)/i,                                "siteFortnite"],
  [/(itch\.io|poki|friv|crazygames|gamejolt|coolmath|y8|armorgames|kogama|jogos)/i, "siteJogo"],
  [/wikipedia\./i,                                         "siteWikipedia"],
  [/(amazon|mercadolivre|shopee|aliexpress|magazineluiza|americanas|shein|ebay|submarino)/i, "siteLoja"],
  [/(g1\.|globo\.com|uol\.com|folha\.|estadao|bbc\.|cnn\.|nytimes|terra\.com\.br|r7\.)/i,    "siteNoticia"],
];
const PALAVRAS_JOGO      = /\b(jogar agora|play now|start game|game over|high ?score|fase \d|n[íi]vel \d)\b/i;
const PALAVRAS_TERROR    = /\b(horror|terror|scary|assombrad|fantasma|zumbi|zombie|pesadelo|granny|slender)\b/i;
const PALAVRAS_CORRIDA   = /\b(corrida|racing|drift|kart|velocidade m[áa]xima|lap time)\b/i;
const PALAVRAS_ESTRAT    = /\b(estrat[ée]gia|strategy|tower defense|turn[- ]based|xadrez|chess)\b/i;
const PALAVRAS_PIXEL     = /\b(pixel ?art|8[- ]bit|16[- ]bit|retro game)\b/i;
const EMOJI              = /\p{Extended_Pictographic}/u;

/* Olha a página uma vez e devolve a lista de coisas que ele notou.
   A ordem não importa: quem chama ordena pela prioridade. */
export function diagnosticar() {
  const achados = [];
  const corpo = document.body;
  if (!corpo) return achados;
  const texto = (corpo.innerText || "");
  const amostra = texto.slice(0, 4000);
  const baixo = amostra.toLowerCase();
  const titulo = (document.title || "").toLowerCase();
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  const host = location.hostname;

  /* --- erros. Ele não vê o código HTTP (isso precisaria de permissão de
     rede que ele não tem), então reconhece pelo jeito da página: página
     curta + a palavra no título ou no meio do texto. --- */
  const curta = palavras < 260;
  if (/\b404\b|n[ãa]o encontrad|not found|page missing/.test(titulo) ||
      (curta && /\b(erro|error)?\s*404\b|p[áa]gina n[ãa]o (foi )?encontrada/.test(baixo)))
    achados.push("erro404");
  else if (/\b(500|502|503)\b|internal server error|servi[çc]o indispon[íi]vel/.test(titulo) ||
      (curta && /internal server error|erro interno do servidor/.test(baixo)))
    achados.push("erro500");
  else if (/(site|servidor).{0,12}(fora do ar|indispon[íi]vel)|this site can.?t be reached/.test(baixo) && curta)
    achados.push("siteForaDoAr");

  /* --- página vazia --- */
  if (palavras < 6 && document.images.length === 0) achados.push("paginaBranca");

  /* --- página lenta --- */
  try {
    const n = performance.getEntriesByType("navigation")[0];
    if (n && n.duration > 6500) achados.push("siteLento");
    if (n && n.type === "back_forward") achados.push("voltouPagina");
    else if (n && n.type === "reload") achados.push("recarregou");
  } catch (e) {}

  /* --- conteúdo --- */
  if (palavras > 3000) achados.push("muitoTexto");
  if (document.querySelectorAll("pre, code").length > 2) achados.push("temCodigo");
  if (temGato()) achados.push("temGato");
  if (EMOJI.test(amostra)) achados.push("temEmoji");
  if ((amostra.match(/\?/g) || []).length > 3 || /\?\s*$/.test(document.title))
    achados.push("perguntaNaPagina");
  if (document.querySelector('input[type="password"]')) {
    achados.push("paginaLogin");
    achados.push("campoSenha");
  }
  if (document.querySelectorAll(
      '[class*="modal"],[class*="popup"],[class*="overlay"],[id*="modal"],[role="dialog"]').length > 4)
    achados.push("muitosPopups");
  const midia = [...document.querySelectorAll("video, audio")];
  if (midia.some(m => !m.paused && !m.muted)) achados.push("musicaTocando");
  else if (midia.length) achados.push("videoPausado");
  if (gritante()) achados.push("siteColorido");

  /* --- que tipo de site é --- */
  for (const [re, id] of SITES) if (re.test(host)) { achados.push(id); break; }
  const tudo = host + " " + titulo + " " + baixo.slice(0, 1200);
  if (PALAVRAS_TERROR.test(tudo))  achados.push("siteTerror");
  if (PALAVRAS_CORRIDA.test(tudo)) achados.push("siteCorrida");
  if (PALAVRAS_ESTRAT.test(tudo))  achados.push("siteEstrategia");
  if (PALAVRAS_PIXEL.test(tudo))   achados.push("sitePixel");
  if (PALAVRAS_JOGO.test(tudo) && !achados.includes("siteJogo")) achados.push("siteJogo");

  /* --- a hora --- */
  const h = new Date().getHours();
  if (h < 5) achados.push("madrugada");
  else if (h < 7) achados.push("muitoCedo");

  return [...new Set(achados)];
}

/* gato na página: só pelo texto alternativo e pelo nome do arquivo, e a
   palavra tem que estar inteira — senão "catálogo" e "location" viram gato */
function temGato() {
  const imgs = [...document.images].slice(0, 120);
  return imgs.some(i => /\b(gato|gatinho|gata|cat|kitten|kitty|miau)\b/i.test(
    (i.alt || "") + " " + (i.src || "").split("/").pop().replace(/[-_.]/g, " ")));
}

/* página gritante: mede quanta cor forte tem no fundo de alguns elementos */
function gritante() {
  const alvos = [...document.querySelectorAll("body, header, nav, main, section, div, a, button")].slice(0, 60);
  let fortes = 0, contados = 0;
  const matizes = new Set();
  for (const el of alvos) {
    const m = getComputedStyle(el).backgroundColor.match(/(\d+), *(\d+), *(\d+)(?:, *([\d.]+))?/);
    if (!m || (m[4] !== undefined && +m[4] < .5)) continue;
    const r = +m[1], g = +m[2], b = +m[3];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 40) continue;
    contados++;
    const sat = (mx - mn) / mx;
    if (sat > .55 && mx > 120) { fortes++; matizes.add(Math.round(Math.atan2(g - b, r - g) * 3)); }
  }
  return contados >= 8 && fortes / contados > .45 && matizes.size >= 4;
}

/* ==========================================================================
   3. O QUE ELE VÊ NO QUE VOCÊ DIGITA (só da extensão)
   O cerebro.js já cuida das contas e das regras normais. Estes aqui são os
   gatilhos novos que o JoJo pediu.
   ========================================================================== */
export function olharTeclado(estado) {
  const t = estado.texto || "", b = (estado.baixo || "");
  if (!t) return null;
  if (/\bsocorro\b|\bhelp\b|\bme ajuda\b/.test(b))              return "socorro";
  if (/\bclipy\b|\bclippy\b/.test(b))                          return "chamouEle";
  if (/k{4,}|haha(ha)+|rs{3,}|ksks/.test(b))                    return "risada";
  if (gritandoCaps(t))                                          return "capsLock";
  /* A ORDEM AQUI IMPORTA. Um texto de mil letras normalmente TEM palavra
     repetida — se "palavraRepetida" viesse antes, ele nunca diria "isso é
     uma tese?". Então vai do sinal mais forte pro mais fraco. */
  if (estado.apagados > 90)                                     return "backspaceDemais";
  if (estado.letras > 900)                                      return "digitandoTese";
  if (estado.porMinuto > 210)                                   return "digitandoMuito";
  if (palavraRepetida(b))                                       return "palavraRepetida";
  if (estado.letras > 120 && estado.parado > 22)                return "naoEnviou";
  return null;
}
/* gritando: muita letra e quase tudo maiúsculo */
function gritandoCaps(t) {
  const letras = t.match(/\p{L}/gu) || [];
  if (letras.length < 14) return false;
  const mai = letras.filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length;
  return mai / letras.length > .85;
}
function palavraRepetida(b) {
  const ps = b.match(/\p{L}{5,}/gu) || [];
  if (ps.length < 8) return false;
  const conta = {};
  for (const p of ps) conta[p] = (conta[p] || 0) + 1;
  return Object.values(conta).some(n => n >= 4);
}

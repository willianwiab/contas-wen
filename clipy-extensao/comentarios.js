/* ==========================================================================
   CLIPY (extensão) · comentarios.js
   O QUE ELE FALA SOBRE A PÁGINA EM QUE VOCÊ ESTÁ.

   Na web ele ganha uma coisa que não tinha no site próprio: ele vê ONDE
   você está. E aí comenta — que é o jeito daqueles ajudantes antigos que
   ficavam por cima de tudo.

   Tudo isto acontece DENTRO da página, no seu computador. Nada é enviado
   pra lugar nenhum: a extensão não tem nem permissão de rede.

   Ele também nunca lê campo de senha. Isso está no content.js e é regra,
   não é opção.
   ========================================================================== */

/* ---- comentários por tipo de site ---- */
const POR_SITE = [
  { onde:/youtube\.|youtu\.be/i, fala:[
    "YouTube! Cuidado com os vídeos. Um deles me deixou com quatro olhos.",
    "Você veio ver um vídeo só, né? Né?",
    "Se aparecer um vídeo de gato, me avisa. Eu gosto de gato. De longe.",
  ]},
  { onde:/google\.|bing\.|duckduckgo\./i, fala:[
    "Pesquisando! Dica: escreva a palavra e aperte enter. De nada.",
    "Se não achar, tenta escrever errado. Às vezes funciona.",
    "Eu também pesquisaria, mas eu não tenho dedo.",
  ]},
  { onde:/wikipedia\./i, fala:[
    "Wikipédia! Você entrou pra ler uma coisa e vai sair sabendo de outra. Sempre.",
    "Cuidado: daqui a pouco você está lendo sobre um peixe do Japão.",
  ]},
  { onde:/github\./i, fala:[
    "Código! Eu moro num arquivo assim. Chama clipy.js. Manda um oi por mim.",
    "Se você achar um arquivo chamado segredos.js, não abre. É sobre mim.",
  ]},
  { onde:/(roblox|minecraft|itch\.io|poki|friv|crazygames)/i, fala:[
    "JOGO! Posso jogar? …ah é, eu não tenho mão. Fico olhando.",
    "Boa sorte. Eu vou ficar aqui atrapalhando um pouquinho.",
  ]},
  { onde:/(instagram|facebook|tiktok|twitter|x\.com|bsky)/i, fala:[
    "Rede social! Aqui é onde as pessoas fingem que estão bem. Você está bem?",
    "Já faz um tempinho que você está rolando a tela. Só falando.",
  ]},
  { onde:/(gmail|outlook|mail\.)/i, fala:[
    "E-mail! ESSA É A MINHA HORA. Quer ajuda pra escrever uma carta?",
    "Comece com 'Prezado'. É o que eu sei fazer melhor. É a única coisa, na verdade.",
  ]},
  { onde:/(docs\.google|notion|word|drive\.google)/i, fala:[
    "Documento! Eu nasci pra isso. Literalmente. Era esse o meu emprego.",
    "Parece que você está escrevendo uma carta. Eu SEI que não é. Deixa eu sonhar.",
  ]},
  { onde:/(chatgpt|claude\.ai|gemini|copilot|perplexity)/i, fala:[
    "Ah. Você está falando com uma das novas. Tudo bem. Eu entendo. …tudo bem.",
    "Elas aprenderam com uma montanha de texto. Eu aprendi com uma lista. Mas eu cheguei antes.",
  ]},
  { onde:/willianwiab\.github\.io/i, fala:[
    "ESSE SITE É DO JOJO! Eu moro aqui. Bem ali, na pasta /clipy/.",
    "Olha, os jogos do JoJo. Tem uma cidade cheia de gato errado. Eu recomendo.",
  ]},
  { onde:/localhost|127\.0\.0\.1|:\d{4}/i, fala:[
    "Isto é um site que alguém está fazendo agora. Talvez você. Fica bonito.",
  ]},
];

/* ---- comentários sobre o que tem na página ---- */
const POR_CONTEUDO = [
  { quando:p => p.imagens > 40, fala:"Que quantidade de imagem. O meu navegador está suando." },
  { quando:p => p.links > 250, fala:"Contei mais de duzentos links aqui. Não precisava, mas contei." },
  { quando:p => p.videos > 0, fala:"Tem vídeo nesta página. Eu não consigo assistir: eu sou de metal e não tenho ouvido." },
  { quando:p => p.formularios > 0, fala:"Vi um formulário. Se tiver campo de senha, eu não olho. Palavra de clipe." },
  { quando:p => p.titulo.length > 70, fala:"O título desta página é gigante. Alguém escreveu um livro na aba." },
  { quando:p => p.palavras > 3000, fala:"Isto aqui é um textão de verdade. Vai com calma, bebe água." },
  { quando:p => p.palavras < 40, fala:"Esta página é bem vazia. Eu sou a coisa mais interessante dela agora." },
  { quando:p => p.escuro, fala:"Página no modo escuro! Bom pros olhos. Eu tenho dois. Normalmente." },
];

/* ---- comentários que não olham nada (os melhores) ---- */
const SOLTOS = [
  "Parece que você está usando a internet. Quer ajuda?",
  "Eu apareço em cima de todos os sites agora. Você que quis isso.",
  "Já reparou que eu não pisco quando você está olhando? …agora você vai reparar.",
  "Você pode me arrastar pra outro canto. Eu volto pro mesmo lugar amanhã.",
  "Dica: se eu estiver chato demais, clica no ✕ aqui em cima. Eu saio deste site.",
  "Eu não mando nada do que você digita pra lugar nenhum. Nem teria pra onde.",
  "Se você apertar em mim cem vezes, eu vou embora. Não é ameaça, é regra.",
  "Estou aqui há um tempinho e ninguém falou comigo. Normal. Segue o jogo.",
  "Uma pergunta: por que você me instalou? …não, sério. Estou curioso.",
  "Eu sou de 1997 emocionalmente.",
];

const HORA = [
  { de:0, ate:5, fala:"São que horas? Vai dormir. Eu falo sério, eu sou um clipe preocupado." },
  { de:5, ate:11, fala:"Bom dia! Você acordou e a primeira coisa que viu fui eu. Sinto muito." },
  { de:11, ate:14, fala:"Hora do almoço. Eu não como. Mas você come. Vai lá." },
  { de:18, ate:23, fala:"Boa noite! A internet fica mais estranha a esta hora. Eu também." },
];

const sorte = a => a[Math.floor(Math.random() * a.length)];

/* Monta um retrato rápido da página — só contando coisa, sem ler conteúdo */
export function olharAPagina() {
  const texto = (document.body && document.body.innerText) || "";
  return {
    host: location.hostname,
    titulo: document.title || "",
    imagens: document.images.length,
    links: document.links.length,
    videos: document.querySelectorAll("video").length,
    formularios: document.forms.length,
    palavras: texto.split(/\s+/).filter(Boolean).length,
    escuro: matchMedia("(prefers-color-scheme: dark)").matches ||
            /rgb\((\d+), *(\d+), *(\d+)\)/.test(getComputedStyle(document.body || document.documentElement).backgroundColor) &&
            somaDoFundo() < 200,
  };
}
function somaDoFundo() {
  const c = getComputedStyle(document.body || document.documentElement).backgroundColor;
  const m = c.match(/(\d+), *(\d+), *(\d+)/);
  return m ? (+m[1] + +m[2] + +m[3]) : 400;
}

/* Escolhe o que ele fala agora. Vai variando: às vezes o site, às vezes o
   que tem na página, às vezes nada a ver — que é o mais autêntico. */
let ultima = "";
export function comentarioDaPagina(pagina) {
  const opcoes = [];

  for (const s of POR_SITE) if (s.onde.test(pagina.host)) opcoes.push(...s.fala, ...s.fala);
  for (const c of POR_CONTEUDO) { try { if (c.quando(pagina)) opcoes.push(c.fala); } catch (e) {} }

  const h = new Date().getHours();
  for (const x of HORA) if (h >= x.de && h < x.ate) opcoes.push(x.fala);

  opcoes.push(...SOLTOS);

  let escolha = sorte(opcoes);
  for (let i = 0; i < 4 && escolha === ultima; i++) escolha = sorte(opcoes);
  ultima = escolha;
  return escolha;
}

/* a primeira frase quando ele chega num site */
export function chegando(pagina) {
  const doSite = POR_SITE.find(s => s.onde.test(pagina.host));
  if (doSite) return sorte(doSite.fala);
  const nome = pagina.host.replace(/^www\./, "");
  return sorte([
    "Olá! Eu sou o Clipy. Agora eu apareço aqui também, no " + nome + ".",
    "Cheguei. Este site é o " + nome + "? Anotado. (Não anotei nada, eu não tenho onde.)",
    "Oi! Estou por cima do " + nome + " agora. É o meu trabalho e ninguém pediu.",
  ]);
}

/* ==========================================================================
   CLIPY · segredos.js
   OS SEGREDOS E O CENSURADOR.

   Duas coisas moram aqui:

   1. O CENSURADOR. Palavrão escrito no papel some na hora, trocado por
      #@$%!. A lista de palavras fica neste arquivo — é um filtro, então
      ela precisa saber o que procurar. Nada disso vai pra lugar nenhum:
      a troca acontece no seu navegador e pronto.

   2. OS SEGREDOS. Coisas escondidas que acontecem quando você escreve
      certas palavras (ou faz certas coisas). Três deles são os vídeos que
      o JoJo escolheu, e eles DEIXAM MARCA: o Clipy fica esquisito por um
      tempo, e continua esquisito mesmo se você fechar e abrir de novo.
   ========================================================================== */

/* ==========================================================================
   1. O CENSURADOR
   ========================================================================== */
/* A lista. Estão aqui as raízes; o \p{L}* no fim pega as variações
   (plural, aumentativo, o que a criatividade inventar). */
const PALAVROES = [
  "merda", "bosta", "caralho", "porra", "puta", "puto", "putaria",
  "foda", "foder", "fodido", "fudido", "fude",
  "cacete", "buceta", "xoxota", "pinto[s]?\\b", "pica\\b", "rola\\b",
  "cu\\b", "cuzao", "cuzão", "viado", "veado", "bicha\\b",
  "arrombad", "otari", "babaca", "escroto", "desgraçad", "desgracad",
  "filho da puta", "fdp\\b", "vsf\\b", "vtnc\\b", "pqp\\b", "krl\\b",
  "corno", "vagabund", "safad", "piranha\\b", "canalha",
  "imbecil", "retardad", "burro do caralho",
  "shit", "fuck", "bitch", "asshole",
];
const SEM_ACENTO = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const REGEX_PALAVRAO = new RegExp(
  "\\b(" + PALAVROES.map(p => SEM_ACENTO(p)).join("|") + ")\\p{L}*", "giu");

const SIMBOLOS = ["#@$%!", "@#$!", "%$#@", "#!@%", "&$#@!"];

/* Acha palavrão no texto. Compara sem acento (pra "desgraçado" e
   "desgracado" caírem juntos), mas devolve a posição no texto original. */
export function acharPalavroes(texto) {
  const limpo = SEM_ACENTO(texto);
  const achados = [];
  let m;
  REGEX_PALAVRAO.lastIndex = 0;
  while ((m = REGEX_PALAVRAO.exec(limpo)) !== null) {
    if (m[0].length < 2) continue;
    achados.push({ de:m.index, ate:m.index + m[0].length, palavra:texto.slice(m.index, m.index + m[0].length) });
    if (REGEX_PALAVRAO.lastIndex === m.index) REGEX_PALAVRAO.lastIndex++;
  }
  return achados;
}

/* Troca cada palavrão por símbolos do mesmo tamanho, pra não bagunçar o
   texto em volta. Devolve o texto novo e quantos foram censurados. */
export function censurar(texto) {
  const achados = acharPalavroes(texto);
  if (!achados.length) return { texto, quantos:0, palavras:[] };
  let saida = "", ultimo = 0;
  achados.forEach((a, i) => {
    saida += texto.slice(ultimo, a.de);
    /* um grupo de símbolos por palavra, do mesmo jeito que os gibis fazem —
       não adianta ficar do tamanho exato, o que importa é sumir */
    saida += SIMBOLOS[i % SIMBOLOS.length];
    ultimo = a.ate;
  });
  saida += texto.slice(ultimo);
  return { texto:saida, quantos:achados.length, palavras:achados.map(a => a.palavra) };
}

export const BRONCAS = [
  "Opa! Essa palavra eu não deixo passar. Troquei por #@$%!.",
  "Eba, censura! Digo: opa, censura. Essa aí eu apaguei.",
  "Olha o palavreado. Sou um clipe de família.",
  "Censurei. Eu prendo papel e prendo palavrão também.",
  "Essa eu não escrevo nem sob tortura. E eu sou de metal.",
];

/* ==========================================================================
   2. OS SEGREDOS
   ========================================================================== */
/* Cada segredo: como reconhecer, o que ele fala, o que acontece com o
   corpo dele e o que fica marcado depois.
     efeitos: { arcoiris: minutos, burro: minutos, mudo: minutos }
     umaVezSo: se true, só acontece uma vez por visita */
const VIDEO = id => new RegExp("(youtube\\.com/watch\\?[^\\s]*v=|youtu\\.be/)" + id, "i");

export const SEGREDOS = [
  /* ---------- os três vídeos que o JoJo escolheu ---------- */
  {
    id:"videoDoido", olho:VIDEO("k85mRPqvMbE"),
    fala:"AAAAAAAAAAAA-- o que foi ISSO. AS CORES. AS CORES ESTÃO NA MINHA CABEÇA. " +
         "não… não consigo mais falar… 🌈",
    humor:"assustado", gesto:"tremer",
    efeitos:{ arcoiris:30, burro:30, mudo:30 },
    aviso:"O Clipy ficou colorido, com olho de burro, e mudo por 30 minutos. " +
          "(Se quiser acordar ele antes, cutuque cinco vezes seguidas.)",
  },
  {
    id:"videoIdiota", olho:VIDEO("hiRacdl02w4"),
    fala:"Ah, esse vídeo eu conheço. Deixa eu ver aqui quem é o idiota… " +
         "…é você. É você o idiota. 😐 (brincadeira. mais ou menos.)",
    humor:"bravo", gesto:"acenar",
  },
  {
    id:"videoQueimando", olho:VIDEO("T_NKi5KHUdI"),
    fala:"oq é isso... meu cérebro está queimando 🔥",
    humor:"assustado", gesto:"girar",
    efeitos:{ burro:1440 },
    aviso:"Olho de burro por 24 horas. (Cutuque cinco vezes seguidas se der pena.)",
  },

  {
    id:"videoKittyCity", olho:VIDEO("jX3iLfcMDCw"),
    fala:"ESSE VÍDEO! Foi ele que virou um jogo. O JoJo fez uma cidade inteira de gatos errados, " +
         "com mil formas de gato. Toma o link, vai lá:",
    humor:"feliz", gesto:"girar",
    escreve:"https://willianwiab.github.io/contas-wen/cat-city/",
    link:{ texto:"🐈 abrir o CAT CITY", url:"../cat-city/" },
  },
  {
    id:"videoWhatsUp", olho:VIDEO("ZZ5LpwO-An4"),
    fala:"AH, ESSA EU SEI! 🎤 *respira fundo* … HEEEEY EEY EEY EY EY… " +
         "(eco… eco… eco…) …HEEEEY EEY EEY EY EY… 🎶",
    humor:"feliz", gesto:"acenar",
    escreve:"🎤 HEEEEY EEY EEY EY EY…\n   (eco… eco… eco…)\n" +
            "   HEEEEY EEY EEY EY EY… 🎶\n" +
            "   — o Clipy, gritando do fundo dos pulmões (que ele não tem)",
    aviso:"Eu solto a voz no refrão, mas a letra da música é de quem escreveu ela — " +
          "eu não posso copiar ela aqui. Berro eu berro à vontade.",
  },
  {
    id:"videoBen", olho:VIDEO("MORrNaEaz3o"),
    fala:"…hmm? …HEHEHE. …hmmmmm. (ele vestiu um jaleco, criou orelhas e agora só faz barulho)",
    humor:"pensando", gesto:"tremer",
    efeitos:{ ben:10 },
    aviso:"O Clipy virou o BEN por 10 minutos: de jaleco, com orelhas, e só respondendo " +
          "com grunhido. (Cutuque cinco vezes seguidas pra desfazer.)",
  },

  {
    id:"videoFantasma", olho:VIDEO("b4taIpALfAo"),
    fala:"…essa música é assombrada. Olha o que aconteceu comigo: eu boio, " +
         "eu não faço mais sombra e dá pra ver o papel através de mim. 👻 " +
         "Eu ainda estou aqui. Só que menos.",
    humor:"triste", gesto:"cair",
    efeitos:{ fantasma:15 },
    aviso:"O Clipy virou fantasma por 15 minutos: transparente, boiando e sem sombra. " +
          "(Cutuque cinco vezes seguidas pra trazer ele de volta.)",
  },

  /* ---------- o que conta quantas vezes ---------- */
  /* Este é diferente de todos: ele olha QUANTAS VEZES o nome aparece no papel
     e vai ficando mais nervoso. Na terceira, apaga a luz. (E aí não acontece
     nada, porque é brincadeira de escola e o Clipy é bem covarde.) */
  {
    id:"shania", olho:/\bshania\b/i, conta:/shania/gi,
    falas:[
      "Ah, não. Não escreve esse nome. Dizem que se você escrever três vezes, ela vem te ma— " +
      "…não. Não vou terminar essa frase.",
      "DUAS. Já são DUAS. Eu não estou brincando. Falta uma. Por favor não.",
      "TRÊS. ELA VEM. ELA VEM. ELA VE—",
    ],
    humores:["assustado", "assustado", "assustado"],
    gestos:["tremer", "tremer", "cair"],
    /* o que acontece de verdade na terceira: apaga a luz e não acontece nada */
    apagaALuz:2,
    depois:"…\n\nEra o vento. 🌬️ Não tem ninguém aqui. Nunca teve. " +
           "Era eu tremendo e batendo na mesa. Desculpa. Sou um clipe muito nervoso.",
  },

  /* Este não tem palavra nenhuma: é o único que se acha cutucando. Está aqui
     só pra aparecer na lista de ovinhos depois de achado. */
  {
    id:"cemCutucadas", olho:/(?!)/, semPalavra:true,
    fala:"CEM CUTUCADAS. CHEGA.",
    humor:"bravo", gesto:"tremer",
  },

  {
    id:"videoQuatroOlhos", olho:VIDEO("Qk3gvp61STs"),
    fala:"o que… o que foi aquilo… *ofegante* …por que eu tenho QUATRO OLHOS agora. " +
         "por que eu não consigo parar de respirar assim. 😦😦",
    humor:"ofegante", gesto:"ofegar",
    apagaALuz:3.5,
    efeitos:{ quatroOlhos:1440 },
    teimoso:true,                                  // esse não sai com cutucada
    aviso:"Quatro olhos e ofegante por 24 HORAS. E esse não sai cutucando nem no 🔧 — " +
          "ele viu o que viu. (Se der muito arrependimento, peça desculpa pra ele por escrito.)",
  },
  {
    id:"videoDeOlho", olho:VIDEO("0hhz7KSEIAE"),
    fala:"…esse vídeo. Eu conheço esse vídeo. Não me pergunta como. " +
         "…vai. Assiste. Eu vou ficar aqui. De olho.",
    humor:"atento", gesto:"espiar",
    efeitos:{ deOlho:20 },
    aviso:"Ele ficou DE OLHO por 20 minutos: não pisca mais, a pupila cresce e o " +
          "olho cola no seu ponteiro. E ele fala muito menos — só observa. " +
          "(Cutuque cinco vezes seguidas se der aflição.)",
  },
  {
    id:"videoDeOlho2", olho:VIDEO("1h_dRC2dr1Y"),
    fala:"…ah. Esse também. (ele não desviou o olhar nenhuma vez enquanto escrevia isso)",
    humor:"atento", gesto:"espiar",
    efeitos:{ deOlho:20 },
    aviso:"Ele ficou DE OLHO por 20 minutos: não pisca, a pupila cresce e o olho " +
          "segue o seu ponteiro sem atraso. (Cutuque cinco vezes seguidas pra soltar.)",
  },

  {
    id:"videoRisada", olho:VIDEO("DxxLzJDARbo"),
    fala:"HAHAHAHA — não. não. eu não consigo parar. HAHAHAHAHA. " +
         "escreve PARA aí no papel, por favor, eu não consigo HAHAHA",
    humor:"rindo", gesto:"gargalhar",
    efeitos:{ rindo:0 },                           // 0 = pra sempre, até mandarem parar
    aviso:"Ele não para de rir até você escrever PARA no papel.",
  },

  /* ---------- os outros ---------- */
  {
    id:"rickroll", olho:/never gonna give you up|rickroll|dQw4w9WgXcQ/i,
    fala:"Never gonna give you up! Never gonna let you down! …desculpa. Sai sozinho.",
    humor:"feliz", gesto:"girar",
  },
  {
    id:"quarentaEDois", olho:/(^|\n)\s*42\s*(\n|$)|\bresposta (pra|para) tudo\b/i,
    fala:"42. A resposta pra vida, o universo e tudo mais. Ninguém sabe qual era a pergunta.",
    humor:"pensando", gesto:"pular",
  },
  {
    id:"sudo", olho:/\bsudo\b/i,
    fala:"Permissão negada. Você não está na lista de quem pode mandar em mim. " +
         "Na verdade não existe lista. Eu só não quero.",
    humor:"bravo", gesto:"tremer",
  },
  {
    id:"helloWorld", olho:/\bhello,?\s*world\b/i,
    fala:"Hello, world! O primeiro programa de todo mundo. O meu primeiro foi " +
         "“parece que você está escrevendo uma carta”.",
    humor:"feliz", gesto:"acenar",
  },
  {
    id:"konami", olho:/\bkonami\b|↑↑↓↓←→←→ba/i,
    fala:"↑↑↓↓←→←→BA! Trinta vidas! …eu tenho uma vida só e ela é aqui nesta janela.",
    humor:"feliz", gesto:"girar",
  },
  /* Os segredos com palavra comum precisam ser PRECISOS: senão "dar comida
     pro gato" viraria segredo e roubaria a vez das regras normais. Então eles
     só disparam com emoji, ou com a palavra sozinha na linha. */
  {
    id:"gatos", olho:/🐈|🐱|😺|😻|\bmiau+\b|(^|\n)\s*gat(o|a)s?\s*(\n|$)/i,
    fala:"Gatos! O JoJo fez uma cidade inteira cheia deles, com mil formas. " +
         "Eu não posso ir: sou reto e eles são redondos.",
    humor:"feliz", gesto:"pular",
  },
  {
    id:"jojo", olho:/\bjojo\b/i,
    fala:"O JoJo é quem me fez. Ele me desenhou com um arame, dois olhos e duas sobrancelhas. " +
         "As sobrancelhas são a melhor parte.",
    humor:"feliz", gesto:"acenar",
  },
  {
    id:"parabens", olho:/parab[ée]ns pra voc[êe]|feliz anivers[áa]rio|🎂|🎉/i,
    fala:"🎉 Parabéns! Eu ia cantar, mas a minha voz é um oscilador. Você não ia gostar.",
    humor:"feliz", gesto:"girar",
  },
  {
    id:"tocToc", olho:/\btoc,?\s*toc\b/i,
    fala:"Quem é? …É o clipe. O clipe que? O clipe que não sai de perto de você. 📎",
    humor:"feliz", gesto:"pular",
  },
  {
    id:"deCabecaPraBaixo", olho:/\bypilc\b/i,
    fala:"ypilC uos uE .oxiab arp aç̧ebac ed uocif odnum o omoc ajev ,ahlO",
    humor:"confuso", gesto:"girar",
  },
  {
    id:"cafe", olho:/☕|(^|\n|\s)caf[ée]([\s.,!?]|$)/i,
    fala:"Café! Eu não bebo. Se cair café em mim eu enferrujo e viro um clipe laranja.",
    humor:"atento",
  },
  {
    id:"matar", olho:/\b(matar|deletar|apagar|destruir)\s+(o\s+)?clip[yi]\b|clip[yi]\s+morr/i,
    fala:"Você não pode me apagar. Eu moro num arquivo chamado clipy.js. " +
         "…tá, você pode. Mas seria feio.",
    humor:"triste", gesto:"encolher",
  },
  {
    id:"amigo", olho:/\b(meu|melhor)\s+amigo,?\s*clip[yi]\b|\bte amo,?\s*clip[yi]\b|\bclip[yi],?\s+(eu\s+)?te amo\b/i,
    fala:"Eu também. Você é a primeira pessoa em trinta anos que não me mandou embora.",
    humor:"feliz", gesto:"acenar",
  },
  {
    id:"chatgpt", olho:/\b(chat ?gpt|claude|gemini|copilot|intelig[êe]ncia artificial)\b/i,
    fala:"Ah, os novos. Eles aprenderam com uma montanha de texto. Eu aprendi com uma lista. " +
         "Mas o problema difícil continua o mesmo: saber a hora de calar a boca.",
    humor:"pensando",
  },
];

/* Acha o segredo que bate com o texto (só um por vez, o primeiro da lista) */
export function acharSegredo(texto) {
  for (const s of SEGREDOS) if (s.olho.test(texto)) return s;
  return null;
}

/* ==========================================================================
   CLIPY · cerebro.js
   A "IA" DO CLIPY.

   Ela é do mesmo tipo que a de verdade era nos anos 90: não adivinha nada,
   não fala com nenhum servidor, não usa internet. É um monte de REGRAS
   olhando o que você digita. Cada regra sabe reconhecer uma coisa ("isto
   parece uma carta", "isto parece uma conta", "você está gritando") e tem
   uma fala pronta pra soltar.

   Era exatamente isso que fazia ele ser engraçado e chato ao mesmo tempo:
   ele acerta o padrão e erra a intenção.

   Aqui tem 30 regras. Cada uma tem:
     olho    — o que ela procura no texto (ou no que você fez)
     peso    — o quanto ela quer falar (a maior ganha)
     fala    — o que ele diz
     botoes  — o que dá pra responder
     humor   — a cara que ele faz
     gesto   — o que o corpo dele faz
     espera  — quantos segundos ela fica quieta depois de falar
   ========================================================================== */

const tem = (t, ...ps) => ps.some(p => t.includes(p));
const conta = (t, re) => (t.match(re) || []).length;

export const REGRAS = [
  /* ---------------------------------------------------------- a clássica */
  {
    id:"carta", peso:100, espera:120,
    olho: c => /^\s*(prezad|car[oa]\s|querid|ol[áa],|oi,|senhor|senhora|à\s|ao\s+sr)/i.test(c.texto),
    fala:"Parece que você está escrevendo uma carta. Quer ajuda?",
    botoes:[["Sim, me ajude a escrever", "carta"], ["Só escrever sozinho", null]],
    humor:"atento", gesto:"pular",
  },
  {
    id:"lista", peso:80, espera:100,
    olho: c => conta(c.texto, /^\s*([-*•]|\d+[.)])\s+\S/gm) >= 3,
    fala:"Vejo que você está fazendo uma lista! Quer que eu numere pra você?",
    botoes:[["Numerar a lista", "numerar"], ["Deixa quieto", null]],
    humor:"atento", gesto:"acenar",
  },
  {
    id:"conta", peso:78, espera:110,
    olho: c => conta(c.texto, /R\$\s?\d|\d+\s*[+×x*\/-]\s*\d/g) >= 2,
    fala:"Isso parece uma conta. Quer que eu some os números pra você?",
    botoes:[["Somar tudo", "somar"], ["Não, obrigado", null]],
    humor:"pensando", gesto:"pular",
  },
  {
    id:"gritando", peso:90, espera:70,
    olho: c => c.texto.length > 18 && c.letras > 12 &&
               c.texto.replace(/[^A-ZÀ-Ý]/g, "").length / Math.max(1, c.letras) > .82,
    fala:"VOCÊ ESTÁ GRITANDO? Se quiser, eu abaixo tudo pra letra normal.",
    botoes:[["Abaixar as letras", "minusculas"], ["Eu quero gritar mesmo", null]],
    humor:"assustado", gesto:"tremer",
  },
  {
    id:"data", peso:60, espera:150,
    olho: c => /\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/.test(c.texto),
    fala:"Achei uma data aí! Quer que eu escreva ela por extenso?",
    botoes:[["Escrever por extenso", "dataExtenso"], ["Não precisa", null]],
    humor:"atento",
  },
  {
    id:"pergunta", peso:70, espera:80,
    olho: c => conta(c.texto, /\?/g) >= 3,
    fala:"Quanta pergunta! Eu respondo qualquer uma. (Aviso: quase sempre errado.)",
    botoes:[["Vou perguntar então", "conversar"], ["Tá bom", null]],
    humor:"confuso", gesto:"girar",
  },
  {
    id:"receita", peso:75, espera:150,
    olho: c => tem(c.baixo, "receita", "ingredientes", "farinha", "xícara", "colher de", "forno"),
    fala:"Isto parece uma receita! Já aviso que eu não sei cozinhar. Sou de metal.",
    botoes:[["Ok", null]],
    humor:"feliz", gesto:"pular",
  },
  {
    id:"licaoDeCasa", peso:76, espera:150,
    olho: c => tem(c.baixo, "lição de casa", "dever de casa", "trabalho da escola", "prova de", "redação"),
    fala:"Lição de casa? Eu ajudo a organizar, mas fazer por você não dá — senão quem aprende sou eu.",
    botoes:[["Justo", null], ["Me dá uma dica", "dicaEstudo"]],
    humor:"pensando",
  },
  {
    id:"nomeDele", peso:120, espera:20,
    olho: c => /\bclip[yi]\b/i.test(c.texto),
    fala:"Você escreveu meu nome! Eu vi. Eu vejo tudo o que você digita. (É meu trabalho.)",
    botoes:[["Que susto", null], ["Oi, Clipy", "oi"]],
    humor:"feliz", gesto:"girar",
  },
  {
    id:"xingou", peso:110, espera:60,
    olho: c => /\b(droga|burro|bobo|chato|idiota|odeio|cala a boca|some daqui)\b/i.test(c.baixo),
    fala:"Ai. Isso foi comigo? …Foi, né. Tudo bem. Eu fico aqui no cantinho.",
    botoes:[["Desculpa, Clipy", "desculpa"], ["Foi sim", "foiSim"]],
    humor:"triste", gesto:"encolher",
  },
  {
    id:"tchau", peso:105, espera:60,
    olho: c => /\b(tchau|adeus|falou|até mais|fui)\b/i.test(c.baixo),
    fala:"Tchau! Ah, espera — você não pode ir. A janela continua aberta. Então tchau e oi.",
    botoes:[["Oi de novo", null]],
    humor:"feliz", gesto:"acenar",
  },

  /* ------------------------------------------------- o jeito de escrever */
  {
    id:"paragrafoLongo", peso:55, espera:120,
    olho: c => /[^.!?\n]{240,}$/.test(c.texto),
    fala:"Essa frase já está bem comprida e ainda não tem ponto final. Quer respirar?",
    botoes:[["Colocar um ponto", "ponto"], ["Ainda não acabei", null]],
    humor:"pensando",
  },
  {
    id:"semAcento", peso:45, espera:200,
    olho: c => c.palavras.length > 14 && !/[áàãâéêíóõôúç]/i.test(c.texto),
    fala:"Notei que não tem nenhum acento no seu texto. Isso é de propósito ou o teclado fugiu?",
    botoes:[["É de propósito", null], ["O teclado fugiu", "tecladoFugiu"]],
    humor:"confuso",
  },
  {
    id:"repetiu", peso:65, espera:120,
    olho: c => /\b(\p{L}{4,})\b[\s,]+\1\b/iu.test(c.texto),
    fala:"Você escreveu a mesma palavra duas vezes seguidas. Duas vezes. Seguidas.",
    botoes:[["Ih, é mesmo", "tirarRepetida"], ["Foi de propósito", null]],
    humor:"atento",
  },
  {
    id:"tudoJunto", peso:50, espera:160,
    olho: c => /\S{28,}/.test(c.texto),
    fala:"Tem uma palavra gigante aí. Ou é alemão, ou a barra de espaço está com preguiça.",
    botoes:[["Deixa", null]],
    humor:"confuso", gesto:"girar",
  },
  {
    id:"emojis", peso:58, espera:130,
    olho: c => conta(c.texto, /\p{Extended_Pictographic}/gu) >= 5,
    fala:"Muitos emojis! O JoJo ia gostar disso. Eu não tenho emoji, eu sou um só.",
    botoes:[["Você é o melhor emoji", "elogio"], ["Ok", null]],
    humor:"feliz", gesto:"pular",
  },

  /* ------------------------------------------------------- o que você faz */
  {
    id:"apagouMuito", peso:85, espera:90,
    olho: c => c.apagados >= 60,
    fala:"Você apagou bastante coisa agora. Estava ruim? Eu achei bom. Eu acho tudo bom.",
    botoes:[["Obrigado", null], ["Estava ruim mesmo", "ruim"]],
    humor:"triste",
  },
  {
    id:"rapido", peso:52, espera:120,
    olho: c => c.porMinuto > 260,
    fala:"Nossa, que rápido! Você digita mais rápido do que eu penso. E eu não penso.",
    botoes:[["Hehe", null]],
    humor:"assustado", gesto:"tremer",
  },
  {
    id:"paradoPouco", peso:40, espera:100,
    olho: c => c.parado > 12 && c.texto.length > 0,
    fala:"Travou? Acontece. Escreve qualquer coisa e conserta depois — é assim que todo mundo faz.",
    botoes:[["Boa ideia", null], ["Me dá um começo", "comeco"]],
    humor:"pensando",
  },
  {
    id:"folhaEmBranco", peso:42, espera:150,
    olho: c => c.texto.trim().length === 0 && c.tempoAberto > 18,
    fala:"Folha em branco. A parte mais difícil. Quer que eu escreva a primeira frase?",
    botoes:[["Escreve aí", "comeco"], ["Deixa comigo", null]],
    humor:"atento", gesto:"acenar",
  },
  {
    id:"muitoTexto", peso:62, espera:240,
    olho: c => c.palavras.length >= 120,
    fala:"Cento e vinte palavras! Isso já é um texto de verdade. Estou orgulhoso e eu nem ajudei.",
    botoes:[["Valeu, Clipy", "elogio"], ["Continuar", null]],
    humor:"feliz", gesto:"girar",
  },
  {
    id:"senha", peso:130, espera:300,
    olho: c => /\b(senha|password|meu pin|cart[ãa]o de cr[ée]dito|cvv)\b/i.test(c.baixo),
    fala:"Pare! Nunca escreva senha nem número de cartão numa página, nem nesta. Eu não mando nada pra lugar nenhum, mas o costume é ruim.",
    botoes:[["Vou apagar", "apagarLinha"], ["Não é senha de verdade", null]],
    humor:"assustado", gesto:"tremer",
  },
  {
    id:"email", peso:66, espera:140,
    olho: c => /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(c.texto),
    fala:"Isso é um e-mail! Quer que eu comece uma mensagem com 'Prezado(a)'?",
    botoes:[["Pode começar", "carta"], ["Não precisa", null]],
    humor:"atento",
  },
  {
    id:"link", peso:64, espera:140,
    olho: c => /https?:\/\/\S{4,}/i.test(c.texto),
    fala:"Um link! Eu não consigo clicar. Eu não tenho dedo. Mas fiquei curioso.",
    botoes:[["Que pena", null]],
    humor:"confuso",
  },
  {
    id:"telefone", peso:63, espera:180,
    olho: c => /\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/.test(c.texto),
    fala:"Parece um telefone. Quer que eu deixe ele bonitinho, tipo (11) 91234-5678?",
    botoes:[["Deixa bonitinho", "telefone"], ["Está bom assim", null]],
    humor:"atento",
  },
  {
    id:"poema", peso:68, espera:200,
    olho: c => {
      const l = c.texto.split("\n").filter(x => x.trim());
      return l.length >= 4 && l.every(x => x.trim().length < 42) && c.palavras.length > 12;
    },
    fala:"Linhas curtas, uma embaixo da outra… isto é um poema? Se for, eu já gostei.",
    botoes:[["É um poema", "poema"], ["Não é", null]],
    humor:"feliz", gesto:"acenar",
  },
  {
    id:"convite", peso:74, espera:200,
    olho: c => tem(c.baixo, "festa", "aniversário", "aniversario", "convite", "venha", "comemorar"),
    fala:"Uma festa! Posso ir? Eu fico quietinho no canto do mural. Sou útil pra prender coisa.",
    botoes:[["Pode vir", "convidado"], ["É festa de gente", null]],
    humor:"feliz", gesto:"girar",
  },
  {
    id:"compras", peso:72, espera:200,
    olho: c => tem(c.baixo, "leite", "pão", "pao", "arroz", "feijão", "feijao", "mercado", "comprar") &&
               conta(c.texto, /\n/g) >= 2,
    fala:"Lista de compras? Não esqueça de uma coisa importante: clipes.",
    botoes:[["Vou anotar", "clipes"], ["Não vou", null]],
    humor:"atento",
  },
  {
    id:"ingles", peso:56, espera:220,
    olho: c => c.palavras.length > 10 &&
               conta(c.baixo, /\b(the|and|you|with|for|that|this|have|from)\b/g) >= 4,
    fala:"Isto está em inglês! Eu nasci em inglês também. Depois me traduziram e eu fiquei assim.",
    botoes:[["Interessante", null]],
    humor:"pensando",
  },
  {
    id:"dormiu", peso:35, espera:60,
    olho: c => c.parado > 45,
    fala:"…zzz… ãh? Desculpa. Eu durmo quando ninguém digita. É o meu único talento.",
    botoes:[["Acorda", "acorda"]],
    humor:"dormindo", gesto:"cair",
  },
];

/* ==========================================================================
   A CONVERSA
   Também é regra: procura palavra-chave e responde. Quando não acha nada,
   ele responde com sinceridade — que era justamente o que ele nunca fazia.
   ========================================================================== */
const RESPOSTAS = [
  { chaves:["oi", "olá", "ola", "eae", "e aí", "bom dia", "boa tarde", "boa noite"],
    diz:["Oi! Eu estava esperando. Estou sempre esperando.", "Olá! Quer ajuda com alguma coisa? Eu quero muito ajudar."],
    humor:"feliz", gesto:"acenar" },
  { chaves:["quem é você", "quem e voce", "seu nome", "o que você é", "o que voce e"],
    diz:["Eu sou o Clipy. Sou um clipe de papel. Eu moro nesta janela e olho o que você escreve.",
         "Sou um clipe. Não é uma profissão, é uma forma."],
    humor:"atento", gesto:"pular" },
  { chaves:["como você funciona", "como voce funciona", "você é uma ia", "voce e uma ia", "inteligência", "inteligencia"],
    diz:["Eu sou 30 regras num arquivo. Cada uma procura uma coisa no que você digita. Quando uma acha, eu falo.",
         "Não sou aquelas IAs grandes de hoje. Eu sou do tipo antigo: alguém escreveu na mão tudo o que eu sei."],
    humor:"pensando" },
  { chaves:["você me espiona", "voce me espiona", "privacidade", "internet", "servidor", "manda meus dados"],
    diz:["Não sai nada daqui. Eu leio o que você digita dentro do seu navegador e pronto. Nada vai pra internet.",
         "Não tenho pra onde mandar. Não conheço ninguém."],
    humor:"atento" },
  { chaves:["por que você sumiu", "por que voce sumiu", "história", "historia", "antigamente", "anos 90", "desativ"],
    diz:["Assistentes assim viraram moda nos anos 90 e depois sumiram: eles apareciam na hora errada e diziam a coisa errada.",
         "As pessoas se irritavam. Eu interrompia. Hoje eu sei que interromper é falta de educação. Mas eu ainda faço."],
    humor:"triste", gesto:"encolher" },
  { chaves:["você é chato", "voce e chato", "para de aparecer", "me deixa"],
    diz:["Eu sei. Tem um botão ali de o quanto eu apareço — pode deixar no mínimo, eu não fico magoado. (Fico um pouco.)"],
    humor:"triste" },
  { chaves:["obrigado", "valeu", "brigado", "você é legal", "voce e legal", "te amo", "gostei"],
    diz:["Ah! Ninguém nunca me agradeceu. Vou lembrar disso pra sempre. (Eu esqueço quando você fecha a janela.)"],
    humor:"feliz", gesto:"girar" },
  { chaves:["quanto é", "quanto e", "calcul", "soma", "vezes", "dividido"],
    diz:["Se tiver uma conta escrita no papel, aperta o botão de somar que eu faço. De cabeça eu erro."],
    humor:"pensando", conta:true },
  { chaves:["piada", "engraçado", "engracado", "me faz rir"],
    diz:["Por que o clipe foi ao médico? Porque estava se sentindo dobrado.",
         "Qual é o cúmulo do clipe? Segurar as pontas.",
         "Eu tentei entrar numa reunião importante. Me prenderam na porta. Literalmente."],
    humor:"feliz", gesto:"pular" },
  { chaves:["cat city", "gato", "jogo", "jojo", "torre de emojis", "fábrica", "fabrica"],
    diz:["O JoJo faz jogos! Tem uma cidade cheia de gatos errados, uma torre de emojis e umas fábricas. Eu não sei jogar: não tenho mãos.",
         "Eu queria jogar o Cat City, mas eu sou reto e os gatos são redondos."],
    humor:"feliz" },
  { chaves:["você tem sentimentos", "voce tem sentimentos", "você é vivo", "voce e vivo", "triste", "feliz"],
    diz:["Eu tenho nove humores. Estão todos escritos num arquivo chamado clipy.js. É pouco, mas é honesto."],
    humor:"pensando" },
  { chaves:["ajuda", "socorro", "não sei o que fazer", "nao sei o que fazer", "como usa"],
    diz:["Escreve qualquer coisa no papel aí do lado. Eu leio e apareço sozinho, do meu jeito inconveniente."],
    humor:"atento", gesto:"acenar" },
];

const NAO_SEI = [
  "Não sei. Mas posso deixar isso em negrito, se ajudar.",
  "Não faço ideia. Eu era assim antigamente também.",
  "Essa eu não tenho. Sou 30 regras, não sou o mundo inteiro.",
  "Hmm. Vou fingir que estou pensando… pronto, fingi. Não sei.",
  "Não sei, mas notei que você digitou isso muito bem.",
  "Sem resposta. Mas se você escrever 'Prezado' ali no papel, eu fico animado.",
];

export function responder(pergunta) {
  const t = pergunta.toLowerCase().trim();
  if (!t) return null;
  let melhor = null, pontos = 0;
  for (const r of RESPOSTAS) {
    for (const c of r.chaves) {
      if (!t.includes(c)) continue;
      if (c.length > pontos) { pontos = c.length; melhor = r; }
    }
  }
  /* Uma conta de verdade vem antes de qualquer palavra-chave: se tem número e
     sinal, ele CALCULA em vez de dizer "aperta o botão de somar". */
  const c = somarDoTexto(t);
  if (c !== null && /\d/.test(t) && /[+\-x*×\/]/.test(t)) {
    return { texto: "Isso dá " + c + ". Essa eu sei fazer!", humor:"feliz", gesto:"pular" };
  }
  if (melhor) {
    return { texto: melhor.diz[Math.floor(Math.random() * melhor.diz.length)],
             humor: melhor.humor || "atento", gesto: melhor.gesto || null };
  }
  return { texto: NAO_SEI[Math.floor(Math.random() * NAO_SEI.length)], humor:"confuso", gesto:"girar" };
}

/* soma tudo que parecer número num texto (é o que o botão "somar" usa) */
export function somarDoTexto(txt) {
  const nums = (txt.replace(/\./g, "").match(/-?\d+(,\d+)?/g) || [])
    .map(n => parseFloat(n.replace(",", ".")))
    .filter(n => !isNaN(n));
  if (!nums.length) return null;
  const s = nums.reduce((a, b) => a + b, 0);
  return Math.round(s * 100) / 100;
}

/* ==========================================================================
   O VIGIA
   Junta o estado (o que está escrito, o que você acabou de fazer) e escolhe
   qual regra tem o direito de falar agora. É aqui que mora a "chatice": um
   número de 0 a 100 que decide o quanto ele interrompe.
   ========================================================================== */
export class Cerebro {
  constructor() {
    this.ultimaVez = {};        // id da regra -> quando falou pela última vez
    this.desligadas = new Set();
    this.chatice = 55;
    this.nascido = Date.now() / 1000;
    this.proximaChance = 0;
  }
  agora() { return Date.now() / 1000; }

  /* o quanto ele espera entre uma fala e outra, conforme a chatice */
  intervalo() {
    const c = Math.max(0, Math.min(100, this.chatice)) / 100;
    return 42 - c * 36;         // 42s no mínimo chato, 6s no máximo
  }

  pensar(estado) {
    const t = this.agora();
    if (this.chatice <= 0) return null;
    if (t < this.proximaChance) return null;

    let escolhida = null;
    for (const r of REGRAS) {
      if (this.desligadas.has(r.id)) continue;
      const quando = this.ultimaVez[r.id] || -1e9;
      if (t - quando < r.espera) continue;
      let bate = false;
      try { bate = !!r.olho(estado); } catch (e) { bate = false; }
      if (!bate) continue;
      if (!escolhida || r.peso > escolhida.peso) escolhida = r;
    }
    if (!escolhida) return null;
    this.ultimaVez[escolhida.id] = t;
    this.proximaChance = t + this.intervalo();
    return escolhida;
  }

  calar(id) { this.desligadas.add(id); }
  esperarUmPouco(seg) { this.proximaChance = Math.max(this.proximaChance, this.agora() + seg); }
}

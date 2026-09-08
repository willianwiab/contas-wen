/* ==========================================================================
   CLIPY · main.js
   Cola tudo: o papel, o cérebro, o clipe animado, a conversa, a tabela de
   regras e o instalar.
   ========================================================================== */
import { Clipe } from "./clipy.js";
import { REGRAS, Cerebro, responder, somarDoTexto } from "./cerebro.js";
import { ligarInstalar } from "./instalar.js";

const $ = id => document.getElementById(id);
const CHAVE = "clipy_v1";

const clipe = new Clipe($("telaClipy"));
const cerebro = new Cerebro();

/* ---------------------------------------------------------------- estado */
const estado = {
  texto:"", baixo:"", palavras:[], letras:0,
  apagados:0, porMinuto:0, parado:0, tempoAberto:0,
};
let ultimoTamanho = 0, teclasNoMinuto = [], apagadosRecentes = [], ultimaTecla = 0;
let dicaAberta = null;              // a regra que está no balão agora
const abertura = Date.now() / 1000;

function lerPapel() {
  const t = $("papel").value;
  estado.texto = t;
  estado.baixo = t.toLowerCase();
  estado.palavras = t.trim() ? t.trim().split(/\s+/) : [];
  estado.letras = (t.match(/\p{L}/gu) || []).length;
  estado.tempoAberto = Date.now() / 1000 - abertura;
  estado.parado = (Date.now() - ultimaTecla) / 1000;
  const agora = Date.now();
  teclasNoMinuto = teclasNoMinuto.filter(x => agora - x < 12000);
  estado.porMinuto = Math.round(teclasNoMinuto.length * 5);
  /* "apagou muito" é sobre AGORA: só conta o que sumiu nos últimos 20 segundos.
     Se fosse o total desde que abriu, depois de um tempo ele reclamaria pra sempre. */
  apagadosRecentes = apagadosRecentes.filter(x => agora - x.q < 20000);
  estado.apagados = apagadosRecentes.reduce((a, x) => a + x.n, 0);
  $("contador").textContent = estado.palavras.length + (estado.palavras.length === 1 ? " palavra" : " palavras");
}

$("papel").addEventListener("input", () => {
  const t = $("papel").value;
  if (t.length < ultimoTamanho) apagadosRecentes.push({ q:Date.now(), n:ultimoTamanho - t.length });
  else teclasNoMinuto.push(Date.now());
  ultimoTamanho = t.length;
  ultimaTecla = Date.now();
  lerPapel();
  salvar();
});

/* ---------------------------------------------------------------- o balão */
function mostrarDica(regra) {
  dicaAberta = regra;
  $("balaoTexto").textContent = regra.fala;
  const caixa = $("balaoBotoes"); caixa.innerHTML = "";
  for (const [txt, acao] of regra.botoes || [["Ok", null]]) {
    const b = document.createElement("button");
    b.textContent = txt;
    b.onclick = () => { fecharBalao(); if (acao) fazer(acao); };
    caixa.appendChild(b);
  }
  $("balao").hidden = false;
  $("btNaoMostrar").hidden = false;
  clipe.sentir(regra.humor || "atento");
  if (regra.gesto) clipe.fazer(regra.gesto);
  clipe.mostrarBalao("!", 1.2);
  atualizarTabela();
}
function fecharBalao() {
  $("balao").hidden = true; dicaAberta = null;
  clipe.sentir("parado");
}
$("btNaoMostrar").onclick = () => {
  if (dicaAberta) { cerebro.calar(dicaAberta.id); guardarCaladas(); }
  fecharBalao(); atualizarTabela();
};

/* ---------------------------------------------------------------- ações */
/* Cada botão do balão faz alguma coisa DE VERDADE no papel. É o que o
   ajudante antigo prometia e quase nunca entregava. */
const papel = () => $("papel");
function trocarPapel(novo) {
  papel().value = novo; ultimoTamanho = novo.length; lerPapel(); salvar();
}
const ACOES = {
  carta() {
    const hoje = new Date().toLocaleDateString("pt-BR", { day:"numeric", month:"long", year:"numeric" });
    trocarPapel("São Paulo, " + hoje + "\n\nPrezado(a) ,\n\n\n\nAtenciosamente,\n\n" +
      (papel().value.trim() ? "\n\n---\n\n" + papel().value : ""));
    dizer("Pronto! Já deixei a data, o começo e a despedida. O meio é com você.");
  },
  numerar() {
    const linhas = papel().value.split("\n");
    let n = 0;
    trocarPapel(linhas.map(l => {
      if (!/^\s*([-*•]|\d+[.)])\s+\S/.test(l)) return l;
      n++;
      return l.replace(/^\s*([-*•]|\d+[.)])\s+/, n + ". ");
    }).join("\n"));
    dizer("Numerei " + n + " item" + (n === 1 ? "" : "s") + ". Ficou organizado, né?");
  },
  somar() {
    const s = somarDoTexto(papel().value);
    dizer(s === null ? "Não achei número nenhum pra somar." :
      "Somando tudo que parece número, dá " + s.toLocaleString("pt-BR") + ".");
    clipe.fazer("pular");
  },
  minusculas() { trocarPapel(papel().value.toLowerCase()); dizer("Pronto, abaixei o tom."); },
  maiusculas() { trocarPapel(papel().value.toUpperCase()); dizer("AGORA SIM!"); },
  dataExtenso() {
    trocarPapel(papel().value.replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, (m, d, mes, a) => {
      const M = ["janeiro","fevereiro","março","abril","maio","junho","julho",
                 "agosto","setembro","outubro","novembro","dezembro"][(+mes) - 1];
      if (!M) return m;
      return +d + " de " + M + (a ? " de " + (a.length === 2 ? "20" + a : a) : "");
    }));
    dizer("Datas por extenso! Fica mais bonito em carta.");
  },
  telefone() {
    trocarPapel(papel().value.replace(/\(?(\d{2})\)?\s?(9?\d{4})[-\s]?(\d{4})/g, "($1) $2-$3"));
    dizer("Telefones arrumados.");
  },
  ponto() { trocarPapel(papel().value.replace(/\s*$/, ". ")); dizer("Ponto colocado. Agora respira."); },
  tirarRepetida() {
    trocarPapel(papel().value.replace(/\b(\p{L}{4,})\b([\s,]+)\1\b/giu, "$1"));
    dizer("Tirei a repetida. Ficou melhor melhor. Digo: melhor.");
  },
  apagarLinha() {
    trocarPapel(papel().value.split("\n")
      .filter(l => !/\b(senha|password|pin|cvv|cart[ãa]o de cr[ée]dito)\b/i.test(l)).join("\n"));
    dizer("Apaguei. Segredo é segredo.");
  },
  comeco() {
    const inicios = [
      "Era uma vez uma coisa que ninguém esperava.",
      "Eu preciso contar uma coisa e não sei bem por onde começar.",
      "Hoje aconteceu o seguinte:",
      "Tem três motivos pra isso, e o terceiro é o melhor.",
      "Ninguém acreditou em mim quando eu disse.",
    ];
    const frase = inicios[Math.floor(Math.random() * inicios.length)];
    trocarPapel(papel().value ? papel().value.replace(/\s*$/, "\n\n") + frase + " " : frase + " ");
    papel().focus();
    dizer("Comecei por você. Agora não dá mais pra fugir.");
    clipe.fazer("pular");
  },
  numerarNada() {},
  conversar() { irPara("conversa"); },
  oi() { dizer("Oi! Que educado. Ninguém cumprimenta clipe."); clipe.fazer("acenar"); clipe.sentir("feliz"); },
  desculpa() { dizer("Tudo bem! Já esqueci. Eu esqueço tudo. É a minha vantagem."); clipe.sentir("feliz"); },
  foiSim() { dizer("…justo. Vou diminuir um pouco."); cerebro.chatice = Math.max(0, cerebro.chatice - 20);
             $("chatice").value = cerebro.chatice; $("chaticeVal").textContent = Math.round(cerebro.chatice);
             clipe.sentir("triste"); salvar(); },
  ruim() { dizer("Escrever ruim faz parte. O papel não conta pra ninguém. Eu conto, mas ninguém me ouve."); },
  elogio() { dizer("Obrigado! Vou guardar esse elogio no lugar onde eu guardo as coisas. Não tenho esse lugar."); clipe.fazer("girar"); clipe.sentir("feliz"); },
  acorda() { dizer("Acordei! Estava sonhando com uma pilha de folhas bem organizada."); clipe.sentir("assustado"); clipe.fazer("pular"); },
  tecladoFugiu() { dizer("Se o teclado fugiu, você pode escrever sem acento mesmo. Eu entendo assim mesmo."); },
  dicaEstudo() { dizer("Dica: leia em voz alta o que você escreveu. Todo erro aparece na hora. Funciona sempre."); clipe.sentir("pensando"); },
  poema() { dizer("Um poema! Então já era pra ter uma vírgula ali. Poema adora vírgula."); clipe.sentir("feliz"); },
  convidado() { dizer("Vou levar um presente: outro clipe. É o que eu tenho."); clipe.fazer("girar"); },
  clipes() { trocarPapel(papel().value.replace(/\s*$/, "\n- clipes de papel")); dizer("Anotei. Obrigado."); },
  ajudaGeral() {
    const dicas = [
      "Escreve 'Prezado' no começo do papel e vê o que acontece.",
      "Faz uma lista com três traços. Eu não resisto a lista.",
      "ESCREVE TUDO EM MAIÚSCULA. Eu vou ficar preocupado.",
      "Escreve o meu nome no papel. Eu percebo na hora.",
      "Coloca uns números com R$ que eu tento somar.",
      "Fica um tempinho sem digitar. Eu durmo.",
      "Vai na aba 🧠 e vê as 30 regras acendendo enquanto você escreve.",
    ];
    dizer(dicas[Math.floor(Math.random() * dicas.length)]);
    clipe.sentir("atento"); clipe.fazer("acenar");
  },
};
function fazer(acao) { (ACOES[acao] || (() => {}))(); }

/* uma fala rápida do Clipy, sem botões */
function dizer(txt) {
  $("balaoTexto").textContent = txt;
  const caixa = $("balaoBotoes"); caixa.innerHTML = "";
  const b = document.createElement("button");
  b.textContent = "Ok"; b.onclick = fecharBalao;
  caixa.appendChild(b);
  $("balao").hidden = false;
  $("btNaoMostrar").hidden = true;      // não é uma dica de regra: não tem o que calar
  dicaAberta = null;
}

/* ---------------------------------------------------------------- botões */
for (const b of document.querySelectorAll(".barraFerramentas button")) {
  b.onclick = () => {
    const f = b.dataset.fer;
    if (f === "limpar") { trocarPapel(""); dizer("Papel limpo. Que vazio bonito."); clipe.sentir("triste"); return; }
    if (f === "negrito") {
      trocarPapel(papel().value.replace(/^(.+)$/m, "**$1**"));
      dizer("Deixei a primeira linha em negrito. É o que eu sei fazer.");
      return;
    }
    fazer(f);
  };
}
$("btCutucar").onclick = () => {
  const r = ["Ai!", "Oi!", "Presente!", "Tô aqui.", "De novo não."];
  clipe.mostrarBalao("!", 1);
  clipe.fazer(Math.random() < .5 ? "pular" : "girar");
  clipe.sentir(Math.random() < .5 ? "assustado" : "feliz");
  dizer(r[Math.floor(Math.random() * r.length)]);
};
$("btAjuda").onclick = () => fazer("ajudaGeral");
$("telaClipy").onclick = () => $("btCutucar").click();
addEventListener("mousemove", e => clipe.olharPara(e.clientX, e.clientY));

/* ---------------------------------------------------------------- chatice */
$("chatice").oninput = e => {
  cerebro.chatice = +e.target.value;
  $("chaticeVal").textContent = e.target.value;
  salvar();
  if (cerebro.chatice === 0) { fecharBalao(); clipe.sentir("triste"); clipe.fazer("encolher"); }
  if (cerebro.chatice === 100) { clipe.sentir("feliz"); clipe.fazer("girar"); }
};

/* ---------------------------------------------------------------- abas */
function irPara(nome) {
  for (const a of document.querySelectorAll(".aba")) a.classList.toggle("sel", a.dataset.aba === nome);
  for (const p of document.querySelectorAll(".pagina")) p.classList.remove("on");
  const id = { mesa:"pgMesa", conversa:"pgConversa", regras:"pgRegras",
               historia:"pgHistoria", instalar:"pgInstalar" }[nome];
  $(id).classList.add("on");
  if (nome === "regras") atualizarTabela();
  if (nome === "conversa") $("campoConversa").focus();
}
for (const a of document.querySelectorAll(".aba")) a.onclick = () => irPara(a.dataset.aba);
$("btVoltaInstalar").onclick = () => irPara("mesa");

/* ---------------------------------------------------------------- conversa */
function falarNaConversa(quem, txt) {
  const d = document.createElement("div");
  d.className = "fala " + (quem === "clipy" ? "dele" : "minha");
  d.innerHTML = '<span class="quem">' + (quem === "clipy" ? "📎 CLIPY" : "VOCÊ") + "</span>";
  d.appendChild(document.createTextNode(txt));
  $("conversa").appendChild(d);
  $("conversa").scrollTop = $("conversa").scrollHeight;
}
$("formConversa").onsubmit = e => {
  e.preventDefault();
  const t = $("campoConversa").value.trim();
  if (!t) return;
  falarNaConversa("voce", t);
  $("campoConversa").value = "";
  clipe.sentir("pensando");
  setTimeout(() => {
    const r = responder(t);
    falarNaConversa("clipy", r.texto);
    clipe.sentir(r.humor); if (r.gesto) clipe.fazer(r.gesto);
    setTimeout(() => clipe.sentir("parado"), 2600);
  }, 420 + Math.random() * 500);
};
const PERGUNTAS = ["Quem é você?", "Como você funciona?", "Você é uma IA?",
  "Por que você sumiu?", "Me conta uma piada", "Você me espiona?", "Você é chato"];
for (const p of PERGUNTAS) {
  const b = document.createElement("button");
  b.textContent = p;
  b.onclick = () => { $("campoConversa").value = p; $("formConversa").requestSubmit(); };
  $("sugestoes").appendChild(b);
}
falarNaConversa("clipy", "Oi! Eu sou o Clipy. Pergunta o que quiser — eu respondo com o que está escrito dentro de mim, que não é muita coisa.");

/* ---------------------------------------------------------------- tabela */
const COMO = {
  carta:"o texto começa com Prezado, Caro, Querido, Olá…",
  lista:"tem 3 ou mais linhas começando com traço ou número",
  conta:"aparecem 2 ou mais valores em R$ ou continhas",
  gritando:"mais de 82% das letras são MAIÚSCULAS",
  data:"tem algo no formato 12/03 ou 12/03/2026",
  pergunta:"tem 3 ou mais pontos de interrogação",
  receita:"aparecem palavras de cozinha (xícara, forno, farinha…)",
  licaoDeCasa:"aparece lição de casa, prova, redação…",
  nomeDele:"você escreveu a palavra Clipy",
  xingou:"você escreveu droga, chato, bobo, odeio…",
  tchau:"você escreveu tchau, adeus, falou…",
  paragrafoLongo:"passou de 240 letras sem nenhum ponto final",
  semAcento:"mais de 14 palavras e nenhum acento",
  repetiu:"a mesma palavra aparece duas vezes seguidas",
  tudoJunto:"tem uma palavra com 28 letras ou mais",
  emojis:"tem 5 ou mais emojis",
  apagouMuito:"você apagou 60 letras ou mais desde que abriu",
  rapido:"você está digitando mais de 260 letras por minuto",
  paradoPouco:"12 segundos sem digitar, com texto no papel",
  folhaEmBranco:"18 segundos aberto e o papel ainda vazio",
  muitoTexto:"o texto passou de 120 palavras",
  senha:"você escreveu senha, PIN, CVV, cartão de crédito",
  email:"tem um endereço de e-mail",
  link:"tem um link começando com http",
  telefone:"tem algo com cara de telefone",
  poema:"4 linhas ou mais, todas curtinhas",
  convite:"aparece festa, aniversário, convite…",
  compras:"aparecem itens de mercado em várias linhas",
  ingles:"aparecem 4 ou mais palavrinhas em inglês",
  dormiu:"45 segundos sem ninguém digitar nada",
};
function atualizarTabela() {
  if (!$("pgRegras").classList.contains("on")) return;
  const corpo = $("corpoRegras");
  if (corpo.children.length !== REGRAS.length) {
    corpo.innerHTML = REGRAS.map((r, i) =>
      '<tr data-id="' + r.id + '"><td class="num">' + (i + 1) + '</td>' +
      '<td class="nome">' + r.id + '</td>' +
      '<td>' + (COMO[r.id] || "") + '</td>' +
      '<td class="fala">“' + r.fala.slice(0, 74) + (r.fala.length > 74 ? "…" : "") + '”</td>' +
      '<td class="estado"></td></tr>').join("");
  }
  for (const tr of corpo.children) {
    const r = REGRAS.find(x => x.id === tr.dataset.id);
    let bate = false;
    try { bate = !!r.olho(estado); } catch (e) {}
    const calada = cerebro.desligadas.has(r.id);
    tr.classList.toggle("batendo", bate && !calada);
    tr.classList.toggle("calada", calada);
    tr.lastElementChild.textContent = calada ? "desligada" : bate ? "● batendo agora" : "esperando";
  }
}
$("qtdRegras").textContent = REGRAS.length;

/* ---------------------------------------------------------------- save */
function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({
      texto: $("papel").value, chatice: cerebro.chatice,
      caladas: [...cerebro.desligadas],
    }));
  } catch (e) {}
}
function guardarCaladas() { salvar(); }
function carregar() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch (e) {}
  if (!d) return;
  if (typeof d.texto === "string") { $("papel").value = d.texto; ultimoTamanho = d.texto.length; }
  if (typeof d.chatice === "number") {
    cerebro.chatice = d.chatice;
    $("chatice").value = d.chatice; $("chaticeVal").textContent = Math.round(d.chatice);
  }
  if (Array.isArray(d.caladas)) for (const id of d.caladas) cerebro.desligadas.add(id);
}

/* ---------------------------------------------------------------- o laço */
let ultimo = performance.now();
function quadro(agora) {
  requestAnimationFrame(quadro);
  const dt = Math.min(.05, (agora - ultimo) / 1000 || .016);
  ultimo = agora;
  clipe.passo(dt);
}
setInterval(() => {
  lerPapel();
  atualizarTabela();
  if ($("balao").hidden) {
    const r = cerebro.pensar(estado);
    if (r) mostrarDica(r);
    else if (estado.parado > 30 && cerebro.chatice > 0) clipe.sentir("dormindo");
    else if (clipe.humor === "dormindo" && estado.parado < 3) { clipe.sentir("assustado"); clipe.fazer("pular"); }
  }
}, 900);

/* ---------------------------------------------------------------- começo */
carregar();
lerPapel();
ultimaTecla = Date.now();
ligarInstalar(() => irPara("instalar"), dizer);
requestAnimationFrame(quadro);
setTimeout(() => { clipe.fazer("acenar"); clipe.sentir("feliz");
  setTimeout(() => clipe.sentir("parado"), 2000); }, 700);

/* pro teste (e pra curiosidade) alcançarem o Clipy por fora */
window.Clipy = { clipe, cerebro, estado, REGRAS, lerPapel, mostrarDica, fecharBalao,
  zerarApagados:() => { apagadosRecentes = []; estado.apagados = 0; },
  fazer, ACOES, responder, somarDoTexto, irPara, atualizarTabela, salvar, carregar, CHAVE,
  dicaAberta:() => dicaAberta };

/* ==========================================================================
   JojoOS · mesa.js
   A ÁREA DE TRABALHO — e o começo de tudo.

   Junta as peças: põe os ícones na mesa, monta o menu Iniciar, toca o
   relógio, aplica as configurações, e deixa o Clipy morando num canto
   comentando o que você faz.
   ========================================================================== */

import * as S from "./sistema.js";
import { disco, salvar } from "./guardar.js";
import { catalogo } from "./programas.js";
import { Clipe } from "./clipy.js";
import * as voz from "./voz.js";

const $ = s => document.querySelector(s);

/* ==========================================================================
   CONFIGURAÇÕES NA TELA
   ========================================================================== */
function aplicarConfig() {
  document.documentElement.dataset.tema = disco.tema;
  const mesa = $("#mesa");
  mesa.classList.toggle("quadriculado", disco.papel === "quadriculado");
  mesa.classList.toggle("estrelas", disco.papel === "estrelas");
  voz.som.ligado = !!disco.som;
  $("#cantoClipy").hidden = !disco.clipy;
  const cor = getComputedStyle(document.documentElement).getPropertyValue("--mesa").trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && cor) meta.content = cor;
}

/* ==========================================================================
   OS ÍCONES E O MENU
   ========================================================================== */
const PROGRAMAS = catalogo(aplicarConfig);

function montarIcones() {
  const caixa = $("#icones");
  caixa.innerHTML = "";
  for (const p of PROGRAMAS) {
    if (p.separador || !p.mesa) continue;
    const b = document.createElement("button");
    b.className = "icone"; b.type = "button";
    b.innerHTML = '<span class="fig" aria-hidden="true"></span><span class="rot"></span>';
    b.querySelector(".fig").textContent = p.fig;
    b.querySelector(".rot").textContent = p.nome;
    /* um clique escolhe, dois abrem — como num computador. Mas no celular
       um toque já abre, senão ninguém acha o segundo toque. */
    let escolhido = false;
    b.onclick = () => {
      const dedo = matchMedia("(pointer: coarse)").matches;
      if (dedo || escolhido) { p.abre(); escolhido = false; b.classList.remove("escolhido"); return; }
      for (const o of caixa.children) o.classList.remove("escolhido");
      b.classList.add("escolhido"); escolhido = true;
      setTimeout(() => { escolhido = false; }, 1400);
    };
    b.ondblclick = () => p.abre();
    caixa.appendChild(b);
  }
}

function montarMenu() {
  const itens = $("#menuItens");
  itens.innerHTML = "";
  for (const p of PROGRAMAS) {
    if (p.separador) { itens.appendChild(document.createElement("hr")); continue; }
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<span class="fig" aria-hidden="true"></span><span></span>';
    b.querySelector(".fig").textContent = p.fig;
    b.children[1].textContent = p.nome;
    b.onclick = () => { fecharMenu(); p.abre(); };
    itens.appendChild(b);
  }
}

const menu = () => $("#menu");
const btIniciar = () => $("#btIniciar");
function abrirMenu() {
  menu().hidden = false;
  btIniciar().setAttribute("aria-expanded", "true");
  const primeiro = menu().querySelector("button");
  if (primeiro) primeiro.focus();
}
function fecharMenu() {
  menu().hidden = true;
  btIniciar().setAttribute("aria-expanded", "false");
}
function alternarMenu() { menu().hidden ? abrirMenu() : fecharMenu(); }

/* ==========================================================================
   O RELÓGIO
   ========================================================================== */
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
function tocarRelogio() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  const r = $("#relogio");
  r.children[0].textContent = h;
  r.children[1].textContent = DIAS[d.getDay()] + " " +
    String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
  r.title = d.toLocaleString("pt-BR");
}

/* ==========================================================================
   O CLIPY NA ÁREA DE TRABALHO
   Ele não é um programa: ele mora na mesa e comenta o que o sistema faz.
   ========================================================================== */
const FALAS = {
  abriu: [
    "Abriu “{nome}”. Anotado. (Não anotei.)",
    "“{nome}”! Boa escolha. Eu acho.",
    "Abrindo “{nome}”… pronto. Eu não fiz nada, mas obrigado.",
  ],
  fechou: [
    "Fechou o “{nome}”. Tudo bem. Eu também ia fechar.",
    "Lá se foi o “{nome}”.",
    "Ei! Eu estava olhando isso!",
  ],
  minimizou: ["Minimizou. Ele continua aí, só que escondido. Igual eu."],
  moveu: ["Você arrastou a janela. Eu senti daqui.", "Ficou melhor aí? …ficou."],
  muitas: [
    "Você está com MUITA janela aberta. Eu contei.",
    "Isso não é uma área de trabalho, é uma bagunça organizada.",
  ],
  parado: [
    "Alô? Ainda tem alguém no computador?",
    "Eu estou aqui há um tempinho sem fazer nada. Como sempre.",
    "Se você não souber o que abrir, tem um Café ali. Só conversar.",
  ],
  solta: [
    "Este computador não existe. Mas as janelas arrastam de verdade.",
    "Eu morava numa pasta. Agora eu moro numa área de trabalho. Subi na vida.",
    "Clica duas vezes nos ícones. Ou uma, se for no celular. Eu não faço as regras.",
    "Tem 18 jogos aí dentro. Todos feitos pelo JoJo. Nenhum feito por mim.",
  ],
};
const sorte = a => a[Math.floor(Math.random() * a.length)];

function ligarClipy() {
  const tela = $("#telaClipy");
  const fala = $("#falaClipy");
  const clipe = new Clipe(tela);

  let ultimo = performance.now();
  (function quadro(agora) {
    requestAnimationFrame(quadro);
    clipe.passo(Math.min(.05, (agora - ultimo) / 1000 || .016));
    ultimo = agora;
  })(ultimo);

  let fecharEm = 0, ultimaFala = 0, sinal = Date.now();
  function dizer(texto, humor, gesto) {
    if (!disco.clipy) return;
    fala.hidden = false;
    fala.textContent = texto;
    clipe.sentir(humor || "atento");
    if (gesto) clipe.fazer(gesto);
    if (disco.som) { voz.tocar("balao"); voz.falar(texto, humor || "atento"); }
    ultimaFala = Date.now();
    fecharEm = Date.now() + Math.min(9000, 3200 + texto.length * 70);
  }
  fala.addEventListener("click", () => { fala.hidden = true; fecharEm = 0; });
  tela.addEventListener("click", () => {
    clipe.fazer(Math.random() < .5 ? "pular" : "girar");
    if (disco.som) voz.tocar("cutucar");
    dizer(sorte(FALAS.solta), "feliz");
  });
  addEventListener("pointermove", e => clipe.olharPara(e.clientX, e.clientY));

  /* ele ouve o sistema */
  S.ouvir((oQue, janela) => {
    sinal = Date.now();
    if (!disco.clipy) return;
    /* não fala de tudo: senão vira alarme. Um em cada três, com descanso. */
    if (Date.now() - ultimaFala < 9000) return;
    const modelos = FALAS[oQue];
    if (!modelos) return;
    if (oQue === "abriu" && S.janelas.size >= 5 && Math.random() < .6) {
      dizer(sorte(FALAS.muitas), "assustado", "susto"); return;
    }
    if (Math.random() > .34) return;
    dizer(sorte(modelos).replace("{nome}", janela ? janela.nome : "isso"),
      oQue === "fechou" ? "triste" : "atento",
      oQue === "abriu" ? "pular" : null);
  });

  for (const ev of ["pointerdown", "keydown", "wheel"])
    addEventListener(ev, () => { sinal = Date.now(); }, { passive: true });

  setInterval(() => {
    if (fecharEm && Date.now() > fecharEm) { fala.hidden = true; fecharEm = 0; }
    if (!disco.clipy || document.hidden) return;
    const parado = (Date.now() - sinal) / 1000;
    if (parado > 75 && Date.now() - ultimaFala > 60000) {
      dizer(sorte(FALAS.parado), "triste", "acenar");
      sinal = Date.now();
    } else if (parado > 25 && clipe.humor !== "dormindo" && Date.now() - ultimaFala > 20000) {
      clipe.sentir("dormindo");
    }
  }, 1500);
}

/* ==========================================================================
   A JANELA DE BOAS-VINDAS (só na primeira vez)
   ========================================================================== */
function bemVindo() {
  const j = S.abrir({ nome:"Bem-vindo ao JojoOS", fig:"👋", largura: 470, altura: 400 });
  const caixa = document.createElement("div");
  caixa.className = "bemvindo";
  caixa.innerHTML =
    "<h2>Bem-vindo ao JojoOS 1.0</h2>" +
    "<p>Este é um computador de mentira que funciona de verdade.</p>" +
    "<ul>" +
      "<li><b>Clica duas vezes</b> num ícone pra abrir (no celular, uma vez só).</li>" +
      "<li>As janelas <b>arrastam pela barra azul</b> e <b>esticam pelo cantinho</b>.</li>" +
      "<li>O botão <b>Iniciar</b> tem tudo que está instalado.</li>" +
      "<li>Em <b>Meus Jogos</b> estão os 18 jogos do JoJo, rodando aqui dentro.</li>" +
      "<li>No <b>☕ Café com o Clipy</b> não tem nada pra ganhar. É só conversar.</li>" +
    "</ul>" +
    '<p class="marca">Tudo que você guardar fica só neste aparelho.</p>';
  const b = document.createElement("button");
  b.className = "bt principal"; b.type = "button"; b.textContent = "Beleza, deixa eu usar";
  b.onclick = () => S.fechar(j);
  caixa.appendChild(b);
  j.corpo.appendChild(caixa);
  setTimeout(() => b.focus({ preventScroll:true }), 80);
}

/* ==========================================================================
   LIGAR O COMPUTADOR
   ========================================================================== */
function ligar() {
  aplicarConfig();
  montarIcones();
  montarMenu();
  tocarRelogio();
  setInterval(tocarRelogio, 15000);

  btIniciar().onclick = e => { e.stopPropagation(); alternarMenu(); };
  addEventListener("pointerdown", e => {
    if (menu().hidden) return;
    if (e.target.closest("#menu") || e.target.closest("#btIniciar")) return;
    fecharMenu();
  });
  addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (!menu().hidden) { fecharMenu(); btIniciar().focus(); return; }
      const f = S.quemEstaNaFrente();
      if (f) S.fechar(f);
    }
  });

  /* o navegador só libera o som depois que a pessoa mexe na página */
  addEventListener("pointerdown", () => voz.ligarAudio(), { once: true });

  ligarClipy();

  disco.visitas++;
  if (!disco.jaViuBemVindo) { disco.jaViuBemVindo = true; setTimeout(bemVindo, 420); }
  salvar();

  /* o service worker — é o que deixa instalar e abrir sem internet */
  if ("serviceWorker" in navigator)
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

ligar();

/* deixa o sistema à mão pro teste (e pra quem abrir o inspetor e for curioso) */
window.JojoOS = { S, disco, salvar, PROGRAMAS, aplicarConfig, abrirMenu, fecharMenu, bemVindo };

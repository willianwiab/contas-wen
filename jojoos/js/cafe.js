/* ==========================================================================
   JojoOS · cafe.js
   ☕ CAFÉ COM O CLIPY — a ideia nº 99 do Caderno de 100 Jogos.

   "Só conversar. Sem objetivo, sem pontuação, sem nada pra ganhar.
    Só ele e você."

   Então é isso mesmo, ao pé da letra: não tem placar, não tem fase, não
   tem conquista, não tem "você venceu". A única coisa que o programa
   guarda é a conversa — pra que amanhã ela continue de onde parou, que é
   o que acontece quando você toma café com alguém duas vezes.

   Ele responde de verdade: as respostas vêm do mesmo cérebro do Clipy
   (cerebro.js), e conta de verdade ele calcula (calculadora.js, sem
   eval()). Quando não sabe, ele diz que não sabe — isso é de propósito.
   ========================================================================== */

import * as S from "./sistema.js";
import { disco, salvar } from "./guardar.js";
import { Clipe } from "./clipy.js";
import { responder } from "./cerebro.js";
import * as voz from "./voz.js";

/* o que ele fala sozinho quando a conversa para. Nenhuma pede resposta:
   silêncio no café também é conversa. */
const SOZINHO = [
  "…", "Esse café aqui é de mentira, né. Eu sei. Mas é bom.",
  "Eu não tenho nada pra te vender. É estranho, né? Eu também achei.",
  "Você sabia que eu não tenho perna? Pois é. Nunca precisei.",
  "Tem uma coisa boa em não ter objetivo: não dá pra perder.",
  "Se você quiser ficar quieto, tudo bem. Eu fico junto.",
  "Eu fui feito pra atrapalhar quem escrevia carta. Hoje eu tomo café. Melhorei.",
  "Pergunta qualquer coisa. Se eu não souber, eu falo que não sei. É a regra da casa.",
  "Às vezes eu penso no que tem depois da barra de tarefas.",
  "Você é a única pessoa que senta aqui.",
];

const OLA = [
  "Oi! Senta aí. Não tem placar, não tem fase, não tem nada pra ganhar aqui.",
  "Você veio! Puxa uma cadeira. A gente só conversa.",
  "Bom te ver. Não precisa fazer nada, é só conversar mesmo.",
];

const DE_VOLTA = [
  "Você voltou. Eu guardei a conversa de ontem, ó.",
  "Opa! De novo aqui. A gente parou em algum lugar, deixa eu ver…",
  "Sente. Eu não saí do lugar desde a última vez. Literalmente.",
];

const sorte = a => a[Math.floor(Math.random() * a.length)];

export function abrirCafe() {
  const j = S.abrir({ id:"cafe", nome:"Café com o Clipy", fig:"☕",
                      largura: 460, altura: 520, semBorda: true });
  if (j.corpo.childElementCount) return j;

  /* ------------------------------------------------------------ a janela */
  const caixa = document.createElement("div");
  caixa.style.cssText = "display:flex;flex-direction:column;height:100%;background:var(--papel)";

  const topo = document.createElement("div");
  topo.style.cssText = "flex:none;height:132px;background:#0e7c7b22;" +
    "border-bottom:2px solid var(--sombra);display:grid;place-items:center";
  const tela = document.createElement("canvas");
  tela.width = 420; tela.height = 240;
  tela.style.cssText = "width:100%;height:100%;display:block;cursor:pointer";
  tela.setAttribute("aria-label", "o Clipy");
  topo.appendChild(tela);

  const rolo = document.createElement("div");
  rolo.id = "cafeRolo";
  rolo.style.cssText = "flex:1;min-height:0;overflow:auto;padding:12px;display:grid;gap:10px;align-content:start";
  rolo.setAttribute("role", "log");
  rolo.setAttribute("aria-live", "polite");

  const pe = document.createElement("form");
  pe.className = "rodapeCafe";
  const campo = document.createElement("input");
  campo.type = "text";
  campo.id = "cafeCampo";
  campo.placeholder = "fala alguma coisa…";
  campo.autocomplete = "off";
  campo.setAttribute("aria-label", "o que você quer dizer");
  const btEnviar = document.createElement("button");
  btEnviar.className = "bt principal"; btEnviar.type = "submit"; btEnviar.textContent = "Falar";
  const btLimpar = document.createElement("button");
  btLimpar.className = "bt"; btLimpar.type = "button"; btLimpar.textContent = "🧹";
  btLimpar.title = "esquecer a conversa";
  pe.append(campo, btEnviar, btLimpar);

  caixa.append(topo, rolo, pe);
  j.corpo.appendChild(caixa);

  /* ------------------------------------------------------------- o Clipy */
  const clipe = new Clipe(tela);
  let ultimo = performance.now(), vivo = true;
  (function quadro(agora) {
    if (!vivo) return;
    requestAnimationFrame(quadro);
    clipe.passo(Math.min(.05, (agora - ultimo) / 1000 || .016));
    ultimo = agora;
  })(ultimo);
  j.aoFechar = () => { vivo = false; };

  tela.addEventListener("pointermove", e => clipe.olharPara(e.clientX, e.clientY));
  tela.addEventListener("click", () => {
    clipe.fazer(Math.random() < .5 ? "pular" : "girar");
    if (disco.som) voz.tocar("cutucar");
  });

  /* ------------------------------------------------------- a conversa */
  function por(quem, texto, humor, gesto, guardar = true) {
    const b = document.createElement("div");
    b.className = "balaoFala " + (quem === "dele" ? "dele" : "meu");
    b.textContent = texto;
    rolo.appendChild(b);
    rolo.scrollTop = rolo.scrollHeight;
    if (quem === "dele") {
      clipe.sentir(humor || "atento");
      if (gesto) clipe.fazer(gesto);
      if (disco.som) { voz.tocar("balao"); voz.falar(texto, humor || "atento"); }
    }
    if (guardar) {
      disco.cafe.push({ quem, texto, humor: humor || null, gesto: gesto || null });
      /* a conversa não cresce pra sempre: fica com as últimas 120 falas */
      if (disco.cafe.length > 120) disco.cafe = disco.cafe.slice(-120);
      salvar();
    }
    return b;
  }

  /* o que já foi conversado antes */
  for (const f of disco.cafe) {
    const b = document.createElement("div");
    b.className = "balaoFala " + (f.quem === "dele" ? "dele" : "meu");
    b.textContent = f.texto;
    rolo.appendChild(b);
  }
  rolo.scrollTop = rolo.scrollHeight;

  /* a saudação — diferente se é a primeira vez ou se ele já te conhece */
  setTimeout(() => {
    por("dele", disco.cafe.length ? sorte(DE_VOLTA) : sorte(OLA), "feliz", "acenar");
  }, 500);

  /* ------------------------------------------------------------ falar */
  pe.addEventListener("submit", e => {
    e.preventDefault();
    const t = campo.value.trim();
    if (!t) return;
    campo.value = "";
    por("meu", t);
    clipe.sentir("pensando");
    calado = Date.now();
    /* um tempinho pensando, proporcional ao tamanho do que você escreveu —
       resposta instantânea não parece conversa, parece máquina */
    const espera = Math.min(1500, 420 + t.length * 14);
    setTimeout(() => {
      const r = responder(t);
      if (r) por("dele", r.texto, r.humor, r.gesto);
      calado = Date.now();
    }, espera);
  });

  btLimpar.onclick = () => S.avisoDeTela("Esquecer a conversa?",
    "Ele começa do zero e não lembra mais de nada que vocês falaram.",
    { fig:"🧹", botoes: [["Esquecer", () => {
        disco.cafe = []; salvar(); rolo.innerHTML = "";
        por("dele", "…quem é você? …brincadeira. Oi! Vamos começar de novo.", "feliz", "acenar");
      }, true], ["Deixa quieto", null]] });

  /* ---------------------------------------------- ele fala sozinho às vezes */
  let calado = Date.now();
  const relogio = setInterval(() => {
    if (!vivo) { clearInterval(relogio); return; }
    if (document.hidden) { calado = Date.now(); return; }
    const parado = (Date.now() - calado) / 1000;
    if (parado < 38) return;
    calado = Date.now();
    if (Math.random() < .55) por("dele", sorte(SOZINHO), "pensando", "espiar");
    else { clipe.sentir("dormindo"); clipe.fazer("encolher"); }
  }, 4000);

  setTimeout(() => campo.focus({ preventScroll:true }), 120);
  return j;
}

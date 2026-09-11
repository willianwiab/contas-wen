/* ==========================================================================
   CLIPY (extensão) · content.js
   O QUE ENTRA EM TODA PÁGINA.

   Este arquivo põe o Clipy por cima de qualquer site: uma janelinha
   flutuante, arrastável, que lê o que você digita e dá palpite — do jeito
   dos ajudantes que ficavam por cima de tudo nos anos 90.

   TRÊS REGRAS QUE NÃO SE NEGOCIAM AQUI
   1. Nada sai do seu computador. A extensão não tem permissão de rede
      nenhuma (olhe o manifest.json: só "storage"). Não existe pra onde
      mandar, nem com que.
   2. Campo de senha ele NUNCA lê. Está no código, logo abaixo, e não é
      uma opção que dá pra ligar.
   3. Ele não mexe no que você escreveu. No site dele o Clipy censura
      palavrão trocando o texto; aqui ele só COMENTA. Reescrever o que
      alguém digitou num site que não é nosso seria falta de educação —
      e de segurança.

   Tudo é desenhado dentro de um shadow DOM, então o estilo da extensão
   não vaza pra página e o estilo da página não deforma o Clipy.
   ========================================================================== */
(async () => {
  "use strict";

  /* não entra em quadro dentro de quadro, nem em página de extensão */
  if (window.top !== window.self) return;
  if (!document.body) return;
  if (/^(chrome|about|edge|moz)-?(extension)?:/.test(location.protocol)) return;

  const url = c => chrome.runtime.getURL(c);
  const [mod, cer, seg, voz, com] = await Promise.all([
    import(url("js/clipy.js")),
    import(url("js/cerebro.js")),
    import(url("js/segredos.js")),
    import(url("js/voz.js")),
    import(url("comentarios.js")),
  ]);

  /* ---------------------------------------------------------- preferências */
  const PADRAO = { ligado:true, chatice:55, som:true, volume:.45, bloqueados:[], canto:null };
  const guardado = await chrome.storage.local.get(PADRAO);
  const conf = Object.assign({}, PADRAO, guardado);
  const salvar = () => chrome.storage.local.set(conf);

  const host = location.hostname;
  if (!conf.ligado || (conf.bloqueados || []).includes(host)) return;

  /* ---------------------------------------------------------- a janelinha */
  const caixa = document.createElement("div");
  caixa.id = "clipy-da-extensao";
  /* deixa a pasta da extensão anotada na janelinha: serve pro teste achar o
     popup, e pra quem abrir o inspetor entender de onde ele veio */
  caixa.dataset.base = url("");
  caixa.style.cssText = "all:initial;position:fixed;z-index:2147483600;";
  const sombra = caixa.attachShadow({ mode:"open" });
  sombra.innerHTML = `
    <style>
      :host { all:initial; }
      * { box-sizing:border-box; font-family:"Segoe UI",Tahoma,system-ui,sans-serif; }
      .painel {
        position:fixed; width:252px; left:var(--x,auto); top:var(--y,auto);
        right:var(--r,18px); bottom:var(--b,18px);
        background:#c3c7cb; border:2px outset #d8dade; box-shadow:5px 5px 0 #00000044;
        padding:0 6px 6px; color:#14161a; user-select:none;
      }
      .titulo {
        display:flex; align-items:center; justify-content:space-between; gap:6px;
        margin:0 -6px 5px; padding:4px 5px 4px 8px; cursor:grab;
        background:linear-gradient(90deg,#0b4b8f,#2a7fd4); color:#fff;
        font-size:12px; font-weight:700;
      }
      .titulo:active { cursor:grabbing; }
      .titulo .bts { display:flex; gap:3px; }
      .titulo button {
        width:19px; height:17px; display:grid; place-items:center; font-size:10px; cursor:pointer;
        background:#c3c7cb; color:#14161a; border:2px outset #d8dade; padding:0; line-height:1;
      }
      .balao {
        position:relative; background:#fffbc8; border:2px solid #0f0f10; border-radius:11px;
        padding:10px 11px 8px; font-size:13px; line-height:1.5; margin-bottom:9px;
      }
      .balao[hidden] { display:none; }
      .balao::after {
        content:""; position:absolute; left:38px; bottom:-12px; width:0; height:0;
        border:11px solid transparent; border-top-color:#0f0f10; border-bottom:0;
      }
      .balao::before {
        content:""; position:absolute; left:41px; bottom:-8px; width:0; height:0; z-index:1;
        border:8px solid transparent; border-top-color:#fffbc8; border-bottom:0;
      }
      .balao p { margin:0 0 8px; word-break:break-word; }
      .balao p .porVir { visibility:hidden; }
      .balao .bts { display:flex; flex-direction:column; gap:4px; }
      .balao .bts button {
        font-size:12px; text-align:left; padding:5px 8px; cursor:pointer;
        background:#c3c7cb; border:2px outset #d8dade; color:#14161a;
      }
      .balao .bts button:active { border-style:inset; }
      .palco { height:132px; background:#0e7c7b22; border:2px inset #ffffff55; }
      canvas { display:block; width:100%; height:100%; cursor:pointer; }
      .pe { display:flex; gap:4px; margin-top:5px; }
      .pe button {
        flex:1; font-size:11px; font-weight:700; padding:5px; cursor:pointer;
        background:#c3c7cb; border:2px outset #d8dade; color:#14161a;
      }
      .pe button:active { border-style:inset; }
    </style>
    <div class="painel" part="painel">
      <div class="titulo"><span>📎 Clipy</span>
        <span class="bts">
          <button class="som" title="som">🔊</button>
          <button class="fecha" title="sair deste site">✕</button>
        </span>
      </div>
      <div class="balao" hidden><p></p><div class="bts"></div></div>
      <div class="palco"><canvas></canvas></div>
      <div class="pe"><button class="cutuca">👉 Cutucar</button><button class="calado">😶 Quieto</button></div>
    </div>`;
  document.documentElement.appendChild(caixa);

  const $ = s => sombra.querySelector(s);
  const painel = $(".painel"), balao = $(".balao"), balaoP = $(".balao p"),
        balaoBts = $(".balao .bts"), tela = $("canvas");

  /* ---------------------------------------------------------- o Clipy */
  const clipe = new mod.Clipe(tela);
  const cerebro = new cer.Cerebro();
  cerebro.chatice = conf.chatice;
  voz.som.ligado = conf.som;
  voz.volume(conf.volume);

  const estado = { texto:"", baixo:"", palavras:[], letras:0, apagados:0,
                   porMinuto:0, parado:0, tempoAberto:0, linha:"", conta:null, coluna:null };

  /* ---------------------------------------------------------- a fala */
  let escrevendo = 0, terminar = null;
  function falar(txt, humor, botoes) {
    const meu = ++escrevendo;
    balaoBts.innerHTML = "";
    for (const [rot, faz] of (botoes || [["Ok", null]])) {
      const b = document.createElement("button");
      b.textContent = rot;
      b.onclick = () => { voz.tocar("botao"); if (faz) faz(); fechar(); };
      balaoBts.appendChild(b);
    }
    balao.hidden = false;
    if (!clipe.temEfeito("mudo")) { voz.tocar("balao"); voz.falar(txt, humor || "atento"); }
    balaoP.textContent = "";
    const visto = document.createElement("span"), porVir = document.createElement("span");
    porVir.className = "porVir"; porVir.textContent = txt;
    balaoP.append(visto, porVir);
    const passo = Math.max(11, Math.min(34, 1700 / Math.max(1, txt.length)));
    let i = 0, parou = false;
    terminar = () => { parou = true; visto.textContent = txt; porVir.textContent = ""; terminar = null; };
    const tique = () => {
      if (parou || meu !== escrevendo) return;
      i++;
      visto.textContent = txt.slice(0, i); porVir.textContent = txt.slice(i);
      if (i >= txt.length) { terminar = null; return; }
      const c = txt[i - 1];
      setTimeout(tique, ".!?…".includes(c) ? passo * 5 : ",;:".includes(c) ? passo * 3 : passo);
    };
    setTimeout(tique, 50);
    clipe.sentir(humor || "atento");
  }
  const fechar = () => { balao.hidden = true; clipe.sentir("parado"); };
  balao.addEventListener("click", e => {
    if (e.target.tagName === "BUTTON") return;
    if (terminar) { voz.calar(); terminar(); }
  });

  /* ---------------------------------------------------------- ler o que digita */
  /* REGRA: campo de senha nunca. Nem lê, nem olha, nem conta letra. */
  const ehSenha = el => !el || (el.tagName === "INPUT" &&
    (el.type === "password" || /senha|password|cvv|pin|cart[aã]o/i.test(
      (el.name || "") + " " + (el.id || "") + " " + (el.autocomplete || ""))));
  const textoDe = el => {
    if (!el || ehSenha(el)) return null;
    if (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" &&
        ["text","search","email","url","tel",""].includes(el.type))) return el.value;
    if (el.isContentEditable) return el.innerText;
    return null;
  };

  let apagadosRecentes = [], teclas = [], tamanhoAntes = 0, ultimaTecla = Date.now();
  const abertura = Date.now() / 1000;

  function lerCampo() {
    const t = textoDe(document.activeElement) || "";
    estado.texto = t;
    estado.baixo = t.toLowerCase();
    estado.palavras = t.trim() ? t.trim().split(/\s+/) : [];
    estado.letras = (t.match(/\p{L}/gu) || []).length;
    estado.tempoAberto = Date.now() / 1000 - abertura;
    estado.parado = (Date.now() - ultimaTecla) / 1000;
    const agora = Date.now();
    teclas = teclas.filter(x => agora - x < 12000);
    estado.porMinuto = Math.round(teclas.length * 5);
    apagadosRecentes = apagadosRecentes.filter(x => agora - x.q < 20000);
    estado.apagados = apagadosRecentes.reduce((a, x) => a + x.n, 0);
    const linhas = t.split("\n").map(x => x.trim()).filter(Boolean);
    estado.linha = linhas[linhas.length - 1] || "";
    estado.conta = cer.calcular(estado.linha);
    estado.coluna = cer.somarColuna(t);
  }

  addEventListener("input", e => {
    if (ehSenha(e.target)) return;
    const t = textoDe(e.target);
    if (t === null) return;
    if (t.length < tamanhoAntes) apagadosRecentes.push({ q:Date.now(), n:tamanhoAntes - t.length });
    else teclas.push(Date.now());
    tamanhoAntes = t.length;
    ultimaTecla = Date.now();
    lerCampo();
    /* pergunta direta ("1+1=") ele responde na hora */
    if (/[=?]\s*$/.test(estado.linha) && estado.conta && !estado.conta.erro) responder();
  }, true);

  function responder() {
    const r = cerebro.pensar(estado, true);
    if (!r) return false;
    falar(r.falaDinamica ? r.falaDinamica(estado) : r.fala, r.humor,
      (r.botoes || []).map(([rot]) => [rot, null]));
    if (r.gesto) clipe.fazer(r.gesto);
    return true;
  }

  /* ---------------------------------------------------------- o palpite */
  let proximo = Date.now() + 9000;
  const intervalo = () => {
    const c = Math.max(0, Math.min(100, cerebro.chatice)) / 100;
    return (52000 - c * 44000) * (.7 + Math.random() * .6);
  };

  const pagina = com.olharAPagina();
  setTimeout(() => falar(com.chegando(pagina), "feliz", [["Oi, Clipy", null], ["Ai não", null]]),
    1600 + Math.random() * 1200);
  setTimeout(() => clipe.fazer("acenar"), 1500);

  setInterval(() => {
    lerCampo();

    /* palavrão: aqui ele só COMENTA, não mexe no que você escreveu */
    if (estado.texto && seg.acharPalavroes(estado.texto).length && Math.random() < .5) {
      if (balao.hidden) { falar(seg.BRONCAS[0].replace(" Troquei por #@$%!.", ""), "assustado");
        clipe.fazer("tremer"); proximo = Date.now() + intervalo(); return; }
    }

    if (!balao.hidden) return;
    if (cerebro.chatice <= 0) return;

    /* primeiro o que ele viu no que você digitou; se não tiver, um palpite
       sobre a página, que é a parte nova de morar por cima dos sites */
    const r = cerebro.pensar(estado);
    if (r) { falar(r.falaDinamica ? r.falaDinamica(estado) : r.fala, r.humor,
              (r.botoes || []).map(([rot]) => [rot, null]));
      if (r.gesto) clipe.fazer(r.gesto);
      proximo = Date.now() + intervalo();
      return;
    }
    if (Date.now() < proximo) return;
    proximo = Date.now() + intervalo();
    falar(com.comentarioDaPagina(pagina), "atento",
      [["Ok", null], ["Para de aparecer", () => { cerebro.chatice = Math.max(0, cerebro.chatice - 25);
        conf.chatice = cerebro.chatice; salvar(); }]]);
    clipe.fazer(Math.random() < .35 ? "espiar" : "pular");
  }, 1000);

  /* ---------------------------------------------------------- os botões */
  $(".cutuca").onclick = () => {
    voz.tocar("cutucar");
    clipe.fazer(Math.random() < .5 ? "pular" : "girar");
    falar(["Ai!", "Oi!", "Presente!", "Tô aqui.", "De novo não."][Math.floor(Math.random() * 5)], "assustado");
  };
  tela.onclick = () => $(".cutuca").click();
  $(".calado").onclick = () => {
    cerebro.chatice = cerebro.chatice > 0 ? 0 : 55;
    conf.chatice = cerebro.chatice; salvar();
    $(".calado").textContent = cerebro.chatice ? "😶 Quieto" : "🗣 Falar";
    falar(cerebro.chatice ? "Voltei a falar. Você vai se arrepender." :
      "Tá bom. Fico quieto. …quietinho. …aqui, no canto.", cerebro.chatice ? "feliz" : "triste");
  };
  $(".som").onclick = () => {
    voz.som.ligado = !voz.som.ligado;
    conf.som = voz.som.ligado; salvar();
    $(".som").textContent = voz.som.ligado ? "🔊" : "🔇";
    if (voz.som.ligado) { voz.ligarAudio(); voz.tocar("ligar"); }
  };
  $(".fecha").onclick = () => {
    conf.bloqueados = [...new Set([...(conf.bloqueados || []), host])];
    salvar();
    caixa.remove();
  };
  $(".som").textContent = voz.som.ligado ? "🔊" : "🔇";
  $(".calado").textContent = cerebro.chatice ? "😶 Quieto" : "🗣 Falar";

  /* ---------------------------------------------------------- arrastar */
  const barra = $(".titulo");
  let pegando = null;
  barra.addEventListener("pointerdown", e => {
    if (e.target.tagName === "BUTTON") return;
    const r = painel.getBoundingClientRect();
    pegando = { dx:e.clientX - r.left, dy:e.clientY - r.top };
    barra.setPointerCapture(e.pointerId);
  });
  barra.addEventListener("pointermove", e => {
    if (!pegando) return;
    const x = Math.max(4, Math.min(innerWidth - 260, e.clientX - pegando.dx));
    const y = Math.max(4, Math.min(innerHeight - 120, e.clientY - pegando.dy));
    painel.style.setProperty("--x", x + "px");
    painel.style.setProperty("--y", y + "px");
    painel.style.setProperty("--r", "auto");
    painel.style.setProperty("--b", "auto");
  });
  barra.addEventListener("pointerup", () => {
    if (!pegando) return;
    pegando = null;
    conf.canto = { x:painel.style.getPropertyValue("--x"), y:painel.style.getPropertyValue("--y") };
    salvar();
  });
  if (conf.canto && conf.canto.x) {
    painel.style.setProperty("--x", conf.canto.x);
    painel.style.setProperty("--y", conf.canto.y);
    painel.style.setProperty("--r", "auto");
    painel.style.setProperty("--b", "auto");
  }

  /* o navegador só libera som depois que a pessoa mexe na página */
  addEventListener("pointerdown", () => voz.ligarAudio(), { once:true });

  /* ---------------------------------------------------------- o laço */
  let ultimo = performance.now();
  (function quadro(agora) {
    requestAnimationFrame(quadro);
    clipe.passo(Math.min(.05, (agora - ultimo) / 1000 || .016));
    ultimo = agora;
  })(ultimo);
  addEventListener("mousemove", e => clipe.olharPara(e.clientX, e.clientY));
})();

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

   ELE REAGE. As falas e os detectores estão em reacoes.js; a conta das
   abas (sem espionar aba nenhuma) está em mundo.js. Aqui é só a fiação:
   ouvir o que acontece, chamar reagir("oQueFoi") e deixar a fila resolver
   quem fala primeiro.
   ========================================================================== */
(async () => {
  "use strict";

  /* não entra em quadro dentro de quadro, nem em página de extensão */
  if (window.top !== window.self) return;
  if (!document.body) return;
  if (/^(chrome|about|edge|moz)-?(extension)?:/.test(location.protocol)) return;

  const url = c => chrome.runtime.getURL(c);
  const [mod, cer, seg, voz, com, rea, mun] = await Promise.all([
    import(url("js/clipy.js")),
    import(url("js/cerebro.js")),
    import(url("js/segredos.js")),
    import(url("js/voz.js")),
    import(url("comentarios.js")),
    import(url("reacoes.js")),
    import(url("mundo.js")),
  ]);

  /* ---------------------------------------------------------- preferências */
  const PADRAO = { ligado:true, chatice:55, som:true, volume:.45, bloqueados:[], canto:null,
                   efeitos:null };
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

  /* OS EFEITOS SOBREVIVEM A TROCAR DE PÁGINA.
     No site do Clipy os efeitos ficam salvos; aqui não ficavam, então um
     efeito de 20 minutos morria no primeiro F5. Agora ficam guardados junto
     com as opções. Detalhe chato: Infinity não passa por JSON (virava null),
     então "pra sempre" é guardado como 8.64e15 — o mesmo truque do site. */
  const PRA_SEMPRE = 8.64e15;
  if (conf.efeitos) for (const k in clipe.efeitos)
    if (typeof conf.efeitos[k] === "number")
      clipe.efeitos[k] = conf.efeitos[k] >= PRA_SEMPRE ? Infinity : conf.efeitos[k];
  const guardarEfeitos = () => {
    conf.efeitos = Object.fromEntries(Object.entries(clipe.efeitos)
      .map(([k, v]) => [k, v === Infinity ? PRA_SEMPRE : v]));
    salvar();
  };

  const cerebro = new cer.Cerebro();
  cerebro.chatice = conf.chatice;
  voz.som.ligado = conf.som;
  voz.volume(conf.volume);

  const estado = { texto:"", baixo:"", palavras:[], letras:0, apagados:0,
                   porMinuto:0, parado:0, tempoAberto:0, linha:"", conta:null, coluna:null };

  /* ---------------------------------------------------------- a fala */
  /* O BALÃO FECHA SOZINHO.
     No site dele isso não importava: o balão ficava aberto até você clicar,
     e pronto. Aqui importa muito. Enquanto o balão está aberto ele não fala
     mais nada — então um balão esquecido aberto travava TODAS as reações: o
     pânico do 404, a reclamação de ser arrastado, a internet caindo. Nada
     aparecia. Agora ele fecha depois do tempo de ler, que depende do
     tamanho da frase. */
  let escrevendo = 0, terminar = null, fechaSozinho = 0;
  const tempoDeLer = txt => Math.min(19000, 4800 + txt.length * 78);

  function falar(txt, humor, botoes) {
    const meu = ++escrevendo;
    clearTimeout(fechaSozinho);
    fechaSozinho = setTimeout(() => { if (meu === escrevendo) fechar(); }, tempoDeLer(txt));
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
  const fechar = () => {
    clearTimeout(fechaSozinho);
    balao.hidden = true;
    clipe.sentir(Date.now() < tontoAte ? "tonto" : "parado");
  };
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

  /* ==========================================================================
     A FILA DE REAÇÕES
     Muita coisa pode acontecer junta: você abre um site de jogo colorido
     que deu erro de JavaScript enquanto fecha uma aba. Se ele falasse tudo
     de uma vez seria um alarme, não um ajudante. Então cada acontecimento
     entra numa fila com uma PRIORIDADE, e ele fala um de cada vez — o mais
     urgente primeiro. E cada tipo tem um tempo de descanso, pra ele não
     repetir a mesma reclamação de meio em meio minuto.
     ========================================================================== */
  const ESPERA_PADRAO = 95000;
  const ESPERAS = {
    cutucado:1200, arrastado:7000, tonto:11000, arrastadoRapido:9000,
    arrastadoMuitasVezes:25000, solto:14000, exilado:60000, olhando:50000,
    trocouAba:25000, voltouPraAba:25000, abaFechada:12000, muitasAbasFechadas:30000,
    abaNova:40000, digitandoMuito:45000, digitandoTese:70000, apagouTudo:20000,
    capsLock:40000, risada:30000, socorro:20000, chamouEle:25000,
    parado30:1e9, parado60:1e9, parado180:1e9, parado300:1e9, acordou:120000,
    erro404:6e5, erro500:6e5, paginaBranca:6e5, campoSenha:6e5, paginaLogin:6e5,
    temGato:3e5, siteColorido:6e5, semInternet:30000, voltouInternet:30000,
    erroDeJs:12e4, formularioInvalido:45000, carregamentoInfinito:6e5,
    solta:55000,
  };
  const ultimaVez = {};
  let fila = [];

  function reagir(id, urgente) {
    if (!rea.existe(id)) return;
    if (fila.some(f => f.id === id)) return;
    const espera = ESPERAS[id] !== undefined ? ESPERAS[id] : ESPERA_PADRAO;
    if (Date.now() - (ultimaVez[id] || 0) < espera) return;
    const f = rea.fala(id);
    if (!f) return;
    if (urgente) f.prioridade = Math.max(f.prioridade, 9);
    fila.push(f);
    fila.sort((a, b) => b.prioridade - a.prioridade);
    if (fila.length > 6) fila.length = 6;
    if (caixa.isConnected) caixa.dataset.fila = fila.map(x => x.id).join(",");
  }

  function dizerReacao(f) {
    ultimaVez[f.id] = Date.now();
    falar(f.fala, f.humor, [["Ok", null],
      ["Para de aparecer", () => { mudarChatice(Math.max(0, cerebro.chatice - 25)); }]]);
    if (f.gesto) clipe.fazer(f.gesto);
    proximo = Date.now() + intervalo();
  }

  function mudarChatice(n) {
    cerebro.chatice = n; conf.chatice = n; salvar();
    $(".calado").textContent = n ? "😶 Quieto" : "🗣 Falar";
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

  /* o que ele viu só de olhar a página, já na chegada */
  setTimeout(() => { for (const id of rea.diagnosticar()) reagir(id); }, 3200);

  /* O que ele está sentindo fica escrito em atributos do elemento. Não é
     enfeite: atributo de DOM é a única coisa que o teste (e você, no
     inspetor) consegue ver de fora do content script. */
  function anotar() {
    caixa.dataset.fila = fila.map(f => f.id).join(",");
    caixa.dataset.humor = clipe.humor;
    caixa.dataset.tonto = Date.now() < tontoAte ? "1" : "0";
  }

  setInterval(() => {
    lerCampo();
    anotar();

    /* palavrão: aqui ele só COMENTA, não mexe no que você escreveu */
    if (estado.texto && seg.acharPalavroes(estado.texto).length && Math.random() < .5) {
      if (balao.hidden) { falar(seg.BRONCAS[0].replace(" Troquei por #@$%!.", ""), "assustado");
        clipe.fazer("tremer"); proximo = Date.now() + intervalo(); return; }
    }

    /* o que ele notou no teclado (gritar, rir, chamar o nome dele, apagar tudo) */
    const doTeclado = rea.olharTeclado(estado);
    if (doTeclado) reagir(doTeclado);

    if (!balao.hidden) return;

    /* 1º a fila de reações. Urgência 6 ou mais fura a fila de espera —
       um 404 não pode esperar meio minuto pra ele entrar em pânico. */
    if (fila.length) {
      const f = fila[0];
      const urgente = f.prioridade >= 6;
      const podeFalar = urgente || (cerebro.chatice > 0 && Date.now() >= proximo);
      if (podeFalar) { fila.shift(); dizerReacao(f); return; }
      if (cerebro.chatice <= 0 && f.prioridade < 8) fila.shift();   // calado: descarta o miúdo
    }

    if (cerebro.chatice <= 0) return;

    /* DE OLHO: ele não dá palpite e não comenta a página. Só observa.
       Pergunta direta (uma conta, por exemplo) ele ainda responde — isso
       passa pelo responder(), que não vem por aqui. */
    if (clipe.temEfeito("deOlho")) return;

    /* 2º o que ele viu no que você digitou */
    const r = cerebro.pensar(estado);
    if (r) { falar(r.falaDinamica ? r.falaDinamica(estado) : r.fala, r.humor,
              (r.botoes || []).map(([rot]) => [rot, null]));
      if (r.gesto) clipe.fazer(r.gesto);
      proximo = Date.now() + intervalo();
      return;
    }

    /* 3º um palpite sobre a página */
    if (Date.now() < proximo) return;
    proximo = Date.now() + intervalo();
    falar(com.comentarioDaPagina(pagina), "atento",
      [["Ok", null], ["Para de aparecer", () => mudarChatice(Math.max(0, cerebro.chatice - 25))]]);
    clipe.fazer(Math.random() < .35 ? "espiar" : "pular");
  }, 1000);

  /* ---------------------------------------------------------- os botões */
  $(".cutuca").onclick = () => {
    if (cutucar()) { voz.tocar("segredo"); return; }
    voz.tocar("cutucar");
    clipe.fazer(Math.random() < .5 ? "pular" : "girar");
    ultimaVez.cutucado = 0;
    const f = rea.fala("cutucado");
    falar(f.fala, f.humor);
    ultimaVez.cutucado = Date.now();
  };
  tela.onclick = () => $(".cutuca").click();
  $(".calado").onclick = () => {
    mudarChatice(cerebro.chatice > 0 ? 0 : 55);
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

  /* ==========================================================================
     ARRASTAR — e ficar tonto
     Ele mede três coisas enquanto você arrasta: quanto andou, quão rápido
     foi, e quantas vezes você já fez isso. Andou muito ou virou muito a
     direção = tontura de verdade (humor "tonto" + gesto "girarLouco"), e a
     tontura DURA alguns segundos depois que você solta.
     ========================================================================== */
  const barra = $(".titulo");
  let pegando = null, arrastosTotal = 0, tontoAte = 0;

  /* enquanto estiver tonto, ele volta pro humor tonto sempre que o balão
     fecha — senão ele "sarava" na hora, o que não tem graça nenhuma */
  function ficarTonto(segundos) {
    tontoAte = Date.now() + segundos * 1000;
    clipe.sentir("tonto");
    clipe.fazer("girarLouco");
    reagir("tonto");
  }
  setInterval(() => {
    if (Date.now() < tontoAte && balao.hidden) clipe.sentir("tonto");
    if (caixa.isConnected) caixa.dataset.tonto = Date.now() < tontoAte ? "1" : "0";
  }, 700);

  barra.addEventListener("pointerdown", e => {
    if (e.target.tagName === "BUTTON") return;
    const r = painel.getBoundingClientRect();
    pegando = { dx:e.clientX - r.left, dy:e.clientY - r.top,
                x:e.clientX, y:e.clientY, q:performance.now(),
                andou:0, pico:0, viradas:0, vx:0, vy:0 };
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

    /* a medição da tontura */
    const q = performance.now(), dt = Math.max(1, q - pegando.q);
    const dx = e.clientX - pegando.x, dy = e.clientY - pegando.y;
    const d = Math.hypot(dx, dy);
    pegando.andou += d;
    pegando.pico = Math.max(pegando.pico, d / dt);          // pixels por milissegundo
    if (d > 3 && (dx * pegando.vx + dy * pegando.vy) < 0) pegando.viradas++;  // mudou de direção
    if (d > 3) { pegando.vx = dx; pegando.vy = dy; }
    pegando.x = e.clientX; pegando.y = e.clientY; pegando.q = q;

    /* tontura no meio do arrasto, se você estiver sacudindo ele */
    if ((pegando.viradas >= 7 || pegando.andou > 1400) && Date.now() > tontoAte - 4000)
      ficarTonto(8);
  });

  barra.addEventListener("pointerup", () => {
    if (!pegando) return;
    const p = pegando; pegando = null;
    arrastosTotal++;
    conf.canto = { x:painel.style.getPropertyValue("--x"), y:painel.style.getPropertyValue("--y") };
    salvar();

    const r = painel.getBoundingClientRect();
    const noCanto = (r.left < 90 || r.right > innerWidth - 90) &&
                    (r.top < 90 || r.bottom > innerHeight - 90);

    /* do mais dramático pro menos */
    if (p.viradas >= 7 || p.andou > 1400)        { ficarTonto(9); reagir("arrastadoRapido", true); }
    else if (p.pico > 2.2)                        reagir("arrastadoRapido");
    else if (arrastosTotal >= 4)                  reagir("arrastadoMuitasVezes");
    else if (noCanto && p.andou > 120)            reagir("exilado");
    else if (p.andou > 40)                        reagir(arrastosTotal <= 2 ? "arrastado" : "solto");
    if (p.andou > 500 && Date.now() > tontoAte)   ficarTonto(6);
  });

  if (conf.canto && conf.canto.x) {
    painel.style.setProperty("--x", conf.canto.x);
    painel.style.setProperty("--y", conf.canto.y);
    painel.style.setProperty("--r", "auto");
    painel.style.setProperty("--b", "auto");
  }

  /* o mouse chegando perto dele */
  $(".palco").addEventListener("pointerenter", () => reagir("olhando"));

  /* o navegador só libera som depois que a pessoa mexe na página */
  addEventListener("pointerdown", () => voz.ligarAudio(), { once:true });

  /* ==========================================================================
     OS ACONTECIMENTOS
     Daqui pra baixo é só ouvir o navegador e avisar a fila.
     ========================================================================== */

  /* ---- as abas (sem espionar aba nenhuma: leia o mundo.js) ---- */
  const mundo = new mun.Mundo(chrome.storage.local);
  mundo.nasci().then(ids => setTimeout(() => ids.forEach(id => reagir(id)), 2400));
  /* o batimento só vale a pena com a aba à vista: o navegador congela o
     cronômetro das abas escondidas, e aí ele acusaria fechamento à toa */
  setInterval(() => { if (!document.hidden) mundo.bater().then(ids => ids.forEach(id => reagir(id))); }, 22000);
  addEventListener("pagehide", () => mundo.saindo());

  /* ---- trocar de aba ---- */
  let saiuEm = 0;
  addEventListener("visibilitychange", () => {
    if (document.hidden) { saiuEm = Date.now(); reagir("trocouAba"); return; }
    const fora = (Date.now() - saiuEm) / 1000;
    if (saiuEm && fora > 120) reagir("voltouPraAba", true);
    else if (saiuEm && fora > 12) reagir("voltouPraAba");
    mundo.bater().then(ids => ids.forEach(id => reagir(id)));
  });

  /* ==========================================================================
     OS VÍDEOS QUE ELE RECONHECE SÓ DE ESTAR NA PÁGINA
     O YouTube troca de vídeo sem recarregar a página, então não dá pra
     conferir só na chegada: tem que ficar olhando o endereço mudar.
     A lista é curtinha e mora no reacoes.js — está explicado lá por que.
     ========================================================================== */
  let enderecoAntes = "";
  function olharOEndereco() {
    if (location.href === enderecoAntes) return;
    enderecoAntes = location.href;
    const qual = rea.videoDaPagina(location.href);
    if (!qual) return;
    reagir(qual, true);
    clipe.ligarEfeito("deOlho", 20);
    guardarEfeitos();
  }
  setTimeout(olharOEndereco, 2600);
  setInterval(olharOEndereco, 1500);

  /* ---- enquanto ele está DE OLHO ele quase não fala, só observa ---- */
  setInterval(() => {
    if (!clipe.temEfeito("deOlho") || !balao.hidden) return;
    if (Math.random() < .18) reagir("deOlhoFala");
  }, 24000);

  /* ==========================================================================
     A SAÍDA DE EMERGÊNCIA: CINCO CUTUCADAS SEGUIDAS
     No site do Clipy isso já existia e eu tinha esquecido aqui — o que era
     ruim de verdade: um efeito de 20 minutos e nenhum jeito de desfazer a
     não ser esperar ou desinstalar. Cinco cutucadas em menos de 3 segundos
     curam tudo. É o botão de pânico, e ele nunca deve faltar.
     ========================================================================== */
  let cutucadas = [];
  function cutucar() {
    const t = Date.now();
    cutucadas = cutucadas.filter(x => t - x < 3000);
    cutucadas.push(t);
    if (cutucadas.length >= 5 && Object.values(clipe.efeitos).some(v => v > t)) {
      cutucadas = [];
      clipe.curar(true);
      guardarEfeitos();
      fila = [];
      const f = rea.fala("soltou");
      falar(f.fala, f.humor); clipe.fazer("acenar");
      return true;
    }
    return false;
  }

  /* ---- a internet ---- */
  addEventListener("offline", () => reagir("semInternet", true));
  addEventListener("online",  () => reagir("voltouInternet", true));

  /* ---- alguém quebrou o código da página ---- */
  /* Não é erro DELE: é da página. Ele só dedura.
     O aviso chega pela ponte do ouvidor.js, porque o evento de erro não
     atravessa a parede entre o mundo da página e o mundo da extensão —
     está explicado lá. */
  addEventListener("clipy:erro", () => reagir("erroDeJs"));
  /* e um erro dentro da própria extensão também conta. É justo. */
  addEventListener("error", e => {
    if (e.target && e.target.tagName) return;   // imagem que não carregou não é erro de código
    reagir("erroDeJs");
  }, true);

  /* ---- formulário reclamando ---- */
  addEventListener("invalid", () => reagir("formularioInvalido"), true);

  /* ---- carregamento infinito ---- */
  setTimeout(() => { if (document.readyState !== "complete") reagir("carregamentoInfinito"); }, 13000);

  /* ---- Caps Lock ---- */
  addEventListener("keydown", e => {
    try { if (e.getModifierState && e.getModifierState("CapsLock") && /^[A-Za-zÀ-ÿ]$/.test(e.key))
      reagir("capsLock"); } catch (err) {}
  }, true);

  /* ---- apagou tudo ---- */
  let tinhaTexto = 0;
  addEventListener("input", e => {
    if (ehSenha(e.target)) return;
    const t = textoDe(e.target);
    if (t === null) return;
    if (tinhaTexto > 45 && t.length === 0) reagir("apagouTudo", true);
    tinhaTexto = t.length;
  }, true);

  /* ==========================================================================
     TÉDIO
     "Parado" aqui é você parado de verdade — sem teclar, sem mexer o mouse,
     sem rolar a tela. E só conta se a aba estiver à vista: se você está em
     outra aba, você não está parado, você está em outro lugar.
     ========================================================================== */
  let ultimoSinal = Date.now(), avisados = new Set(), estavaParado = false;
  const acordar = () => {
    if (estavaParado && Date.now() - ultimoSinal > 45000) reagir("acordou", true);
    estavaParado = false; ultimoSinal = Date.now(); avisados.clear();
  };
  for (const ev of ["pointerdown", "pointermove", "keydown", "wheel", "scroll", "touchstart"])
    addEventListener(ev, acordar, { passive:true, capture:true });

  const DEGRAUS = [[30, "parado30"], [60, "parado60"], [180, "parado180"], [300, "parado300"]];
  setInterval(() => {
    if (document.hidden) { ultimoSinal = Date.now(); return; }
    const s = (Date.now() - ultimoSinal) / 1000;
    for (const [seg2, id] of DEGRAUS)
      if (s >= seg2 && !avisados.has(id)) { avisados.add(id); estavaParado = true; reagir(id); }
  }, 3000);

  /* ---- muito tempo na mesma página / no navegador ---- */
  setTimeout(() => reagir("muitoTempoNaPagina"), 9 * 60000);
  setTimeout(() => reagir("moraNoNavegador"), 40 * 60000);

  /* ---- um pensamento solto de vez em quando ---- */
  setInterval(() => { if (!document.hidden && Math.random() < .25) reagir("solta"); }, 75000);

  /* ==========================================================================
     O PAINEL MUDOU
     Antes era preciso apertar F5 pra qualquer mudança do painel valer. Não
     precisa mais: ele escuta a gaveta de opções e se ajusta na hora. E se
     você DESLIGAR ele, ele não desaparece calado — ele faz drama primeiro.
     ========================================================================== */
  let saindoDeVez = false;
  chrome.storage.onChanged.addListener((mudou, area) => {
    if (area !== "local") return;
    if (mudou.chatice) { cerebro.chatice = mudou.chatice.newValue;
      conf.chatice = cerebro.chatice; $(".calado").textContent = cerebro.chatice ? "😶 Quieto" : "🗣 Falar"; }
    if (mudou.som) { voz.som.ligado = conf.som = mudou.som.newValue;
      $(".som").textContent = voz.som.ligado ? "🔊" : "🔇"; }
    if (mudou.volume) voz.volume(conf.volume = mudou.volume.newValue);
    if (mudou.bloqueados) {
      const lista = mudou.bloqueados.newValue || [];
      conf.bloqueados = lista;
      if (lista.includes(host)) caixa.remove();
      else if (!caixa.isConnected && !saindoDeVez) document.documentElement.appendChild(caixa);
    }
    if (mudou.ligado) {
      conf.ligado = mudou.ligado.newValue;
      if (!conf.ligado) {
        saindoDeVez = true;
        fila = [];
        const f = rea.fala("desligando");
        falar(f.fala, f.humor); clipe.fazer("derreter");
        painel.style.transition = "opacity 2.6s, transform 2.6s";
        setTimeout(() => { painel.style.opacity = "0"; painel.style.transform = "translateY(40px) scale(.8)"; }, 1400);
        setTimeout(() => caixa.remove(), 4200);
      } else if (!caixa.isConnected) {
        saindoDeVez = false;
        painel.style.transition = ""; painel.style.opacity = ""; painel.style.transform = "";
        document.documentElement.appendChild(caixa);
        setTimeout(() => { falar("Voltei! Você sentiu minha falta, admite.", "comemorando");
          clipe.fazer("comemorar"); }, 500);
      }
    }
  });

  /* ---------------------------------------------------------- o laço */
  let ultimo = performance.now();
  (function quadro(agora) {
    requestAnimationFrame(quadro);
    clipe.passo(Math.min(.05, (agora - ultimo) / 1000 || .016));
    ultimo = agora;
  })(ultimo);
  addEventListener("mousemove", e => clipe.olharPara(e.clientX, e.clientY));
})();

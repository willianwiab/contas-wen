/* ==========================================================================
   JojoOS · programas.js
   OS PROGRAMAS QUE VÊM INSTALADOS.

   Cada programa é uma função que recebe uma janela já aberta e enche o
   corpo dela. Nenhum deles sabe arrastar, fechar ou minimizar — isso é
   trabalho do sistema.js. Aqui é só o conteúdo.
   ========================================================================== */

import * as S from "./sistema.js";
import { disco, salvar, jogarNoLixo, formatar } from "./guardar.js";
import { carregarJogos, jogos } from "./jogos.js";
import { calcular, formatar as formatarConta } from "./calculadora.js";
import { abrirCafe } from "./cafe.js";

const criar = (tag, classe, texto) => {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
};

/* ==========================================================================
   MEUS JOGOS
   ========================================================================== */
export function meusJogos() {
  const j = S.abrir({ id:"jogos", nome:"Meus Jogos", fig:"🎮", largura: 700, altura: 470 });
  const grade = criar("div", "grade");
  grade.append(criar("p", null, "carregando a estante…"));
  j.corpo.appendChild(grade);

  carregarJogos().then(lista => {
    grade.innerHTML = "";
    for (const g of lista) {
      const carta = criar("button", "cartaJogo");
      carta.type = "button";
      if (g.imagem) {
        const img = criar("img");
        img.src = g.imagem; img.alt = ""; img.loading = "lazy";
        /* se o desenho não vier, entra o emoji da categoria no lugar */
        img.onerror = () => { const s = criar("div", null, g.fig); s.style.fontSize = "46px"; img.replaceWith(s); };
        carta.appendChild(img);
      } else {
        const s = criar("div", null, g.fig); s.style.fontSize = "46px"; carta.appendChild(s);
      }
      carta.append(criar("b", null, g.nome),
        criar("em", null, g.categoria + (g.deFora ? " · abre fora" : "")));
      carta.onclick = () => abrirJogo(g);
      grade.appendChild(carta);
    }
    const conta = criar("p", null, lista.length + " jogos instalados neste computador.");
    conta.style.cssText = "grid-column:1/-1;margin:4px 2px 0;font-size:12px;opacity:.7";
    grade.appendChild(conta);
  });
  return j;
}

export function abrirJogo(g) {
  /* DUAS FAMÍLIAS DE JOGO, DOIS JEITOS DE ABRIR.

     Os jogos que moram aqui neste site abrem DENTRO de uma janela, e é a
     graça toda do JojoOS.

     Os nove que moram na outra conta do JoJo no GitHub não abrem: o
     navegador não deixa um site mostrar outro site dentro de um quadro sem
     permissão, e essa permissão quem dá é o outro site. Eu tentei mostrar
     mesmo assim, com um aviso em cima — e o resultado foi uma janela branca
     com um aviso, que é pior do que não tentar.

     Então agora eles ganham um CARTUCHO: a capa, o nome, o que é, e um
     botão grande de jogar que abre numa aba nova. Sem janela branca, sem
     susto, sem "será que quebrou?". */
  return g.deFora ? cartucho(g) : jogoAqui(g);
}

function jogoAqui(g) {
  const j = S.abrir({
    id: "jogo-" + g.slug, nome: g.nome, fig: g.fig,
    largura: 900, altura: 600, semBorda: true,
    botoesExtras: [{ rotulo:"\u2197", titulo:"abrir fora do JojoOS",
                     faz: () => window.open(g.url, "_blank", "noopener") }],
  });
  if (j.corpo.childElementCount) return j;

  const quadro = document.createElement("iframe");
  quadro.src = g.url;
  quadro.title = g.nome;
  quadro.allow = "autoplay; fullscreen; gamepad";
  j.corpo.appendChild(quadro);
  return j;
}

function cartucho(g) {
  const j = S.abrir({ id: "jogo-" + g.slug, nome: g.nome, fig: g.fig,
                      largura: 460, altura: 470 });
  if (j.corpo.childElementCount) return j;

  const caixa = criar("div", "cartucho");
  caixa.style.cssText = "display:grid;gap:11px;padding:20px;text-align:center;" +
    "height:100%;align-content:center;justify-items:center";

  if (g.imagem) {
    const img = criar("img");
    img.src = g.imagem; img.alt = "";
    img.style.cssText = "width:156px;height:156px;object-fit:contain;" +
      "background:var(--caixa);border:2px solid var(--sombra-2);padding:8px";
    img.onerror = () => { const s2 = criar("div", null, g.fig); s2.style.fontSize = "84px"; img.replaceWith(s2); };
    caixa.appendChild(img);
  }

  const nome = criar("h2", null, g.nome);
  nome.style.cssText = "margin:0;font-size:19px";
  const cat = criar("p", null, g.categoria);
  cat.style.cssText = "margin:0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.65";
  const desc = criar("p", null, (g.descricao || "").split(".")[0] + ".");
  desc.style.cssText = "margin:0;font-size:13.5px;line-height:1.5;max-width:34ch";

  const bt = criar("button", "bt principal", "\u25B6  Jogar");
  bt.type = "button";
  bt.style.cssText = "font-size:16px;padding:12px 26px;margin-top:6px";
  bt.onclick = () => window.open(g.url, "_blank", "noopener");

  const nota = criar("p", null,
    "Este jogo mora num endereço diferente, ent\u00e3o ele abre numa aba nova \u2014 " +
    "o navegador n\u00e3o deixa um site mostrar o outro aqui dentro.");
  nota.style.cssText = "margin:6px 0 0;font-size:11.5px;line-height:1.5;opacity:.6;max-width:36ch";

  caixa.append(nome, cat, desc, bt, nota);
  j.corpo.appendChild(caixa);
  setTimeout(() => bt.focus({ preventScroll:true }), 80);
  return j;
}

/* ==========================================================================
   BLOCO DE NOTAS
   ========================================================================== */
export function bloco(nomeArquivo) {
  const nome = nomeArquivo || "sem-titulo.txt";
  const j = S.abrir({ id:"bloco-" + nome, nome:"Bloco de Notas — " + nome, fig:"📝",
                      largura: 520, altura: 400, semBorda: true });
  if (j.corpo.childElementCount) return j;

  const caixa = criar("div");
  caixa.style.cssText = "display:flex;flex-direction:column;height:100%";

  const barra = criar("div", "ferramentas");
  const btSalvar = criar("button", "bt principal", "💾 Guardar");
  const btNovo = criar("button", "bt", "Novo");
  const btApagar = criar("button", "bt", "🗑 Jogar fora");
  const marca = criar("span", null, "");
  marca.style.cssText = "font-size:12px;opacity:.7;margin-left:auto";
  barra.append(btSalvar, btNovo, btApagar, marca);

  const folha = criar("textarea", "folha");
  folha.value = disco.documentos[nome] || "";
  folha.placeholder = "escreve aqui…";
  folha.spellcheck = false;

  btSalvar.onclick = () => {
    disco.documentos[nome] = folha.value;
    salvar();
    marca.textContent = "guardado ✓";
    setTimeout(() => { marca.textContent = ""; }, 2200);
  };
  btNovo.onclick = () => {
    const outro = prompt("Nome do arquivo novo:", "anotacao.txt");
    if (outro) bloco(outro.trim());
  };
  btApagar.onclick = () => {
    S.avisoDeTela("Jogar fora?", "Mandar “" + nome + "” pra Lixeira?", { fig:"🗑",
      botoes: [["Sim, joga", () => {
        delete disco.documentos[nome];
        jogarNoLixo(nome, "📝"); salvar(); S.fechar(j);
      }, true], ["Não", null]] });
  };
  /* Ctrl+S guarda, como em qualquer editor */
  folha.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); btSalvar.click(); }
  });

  caixa.append(barra, folha);
  j.corpo.appendChild(caixa);
  setTimeout(() => folha.focus({ preventScroll:true }), 60);
  return j;
}

/* ==========================================================================
   MEUS DOCUMENTOS
   ========================================================================== */
export function documentos() {
  const j = S.abrir({ id:"docs", nome:"Meus Documentos", fig:"📁", largura: 470, altura: 350 });
  desenhar();
  return j;

  function desenhar() {
    j.corpo.innerHTML = "";
    const nomes = Object.keys(disco.documentos);
    if (!nomes.length) {
      const vazio = criar("div", "pad");
      vazio.append(criar("p", null, "A pasta está vazia."));
      const b = criar("button", "bt principal", "📝 Escrever alguma coisa");
      b.type = "button"; b.onclick = () => bloco("anotacao.txt");
      vazio.appendChild(b);
      j.corpo.appendChild(vazio);
      return;
    }
    const grade = criar("div", "grade");
    for (const nome of nomes) {
      const carta = criar("button", "cartaJogo");
      carta.type = "button";
      const fig = criar("div", null, "📝"); fig.style.fontSize = "38px";
      const tamanho = (disco.documentos[nome] || "").length;
      carta.append(fig, criar("b", null, nome), criar("em", null, tamanho + " letras"));
      carta.onclick = () => bloco(nome);
      grade.appendChild(carta);
    }
    j.corpo.appendChild(grade);
  }
}

/* ==========================================================================
   CALCULADORA — usa o mesmo cérebro de conta do Clipy, sem eval()
   ========================================================================== */
export function calculadora() {
  const j = S.abrir({ id:"calc", nome:"Calculadora", fig:"🧮", largura: 300, altura: 390 });
  if (j.corpo.childElementCount) return j;

  const caixa = criar("div");
  caixa.style.cssText = "display:grid;grid-template-rows:auto 1fr;height:100%;gap:6px;padding:8px";

  const visor = criar("div");
  visor.style.cssText = "background:var(--papel);border:2px inset var(--sombra);padding:10px 12px;" +
    "text-align:right;font-size:24px;min-height:52px;overflow:hidden;font-variant-numeric:tabular-nums;" +
    "word-break:break-all";
  visor.textContent = "0";

  const teclas = criar("div");
  teclas.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:5px";

  let conta = "";
  const mostrar = () => { visor.textContent = conta || "0"; };

  const TECLAS = ["7","8","9","C","4","5","6","÷","1","2","3","×","0",".","−","+"];
  for (const t of TECLAS) {
    const b = criar("button", "bt", t);
    b.type = "button";
    b.style.cssText = "font-size:17px;padding:12px 0";
    b.onclick = () => {
      if (t === "C") { conta = ""; mostrar(); return; }
      conta += { "÷":"/", "×":"*", "−":"-" }[t] || t;
      mostrar();
    };
    teclas.appendChild(b);
  }
  const igual = criar("button", "bt principal", "=");
  igual.type = "button";
  igual.style.cssText = "grid-column:1/-1;font-size:19px;padding:12px 0";
  igual.onclick = () => {
    const r = calcular(conta);
    if (!r || r.erro) { visor.textContent = r && r.erro ? r.erro : "não entendi"; return; }
    conta = formatarConta(r.valor);
    mostrar();
  };
  teclas.appendChild(igual);

  /* dá pra digitar no teclado também */
  j.el.addEventListener("keydown", e => {
    if (/^[0-9+\-*/.()]$/.test(e.key)) { conta += e.key; mostrar(); }
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); igual.click(); }
    else if (e.key === "Backspace") { conta = conta.slice(0, -1); mostrar(); }
    else if (e.key === "Escape") { conta = ""; mostrar(); }
  });
  j.el.tabIndex = -1;

  caixa.append(visor, teclas);
  j.corpo.appendChild(caixa);
  return j;
}

/* ==========================================================================
   PAINT
   ========================================================================== */
const CORES = ["#14181d", "#c8372a", "#e08c1a", "#ffd23f", "#1d8a4a",
               "#2f7ad1", "#7a41c4", "#ffffff"];

export function paint() {
  const j = S.abrir({ id:"paint", nome:"Paint do JoJo", fig:"🎨", largura: 560, altura: 460, semBorda: true });
  if (j.corpo.childElementCount) return j;

  const caixa = criar("div");
  caixa.style.cssText = "display:flex;flex-direction:column;height:100%;background:var(--caixa)";

  const barra = criar("div", "ferramentas");
  const tela = criar("canvas");
  tela.id = "paintTela";
  const ctx = tela.getContext("2d");

  let cor = CORES[0], grossura = 4, borracha = false;

  for (const c of CORES) {
    const b = criar("button", "cor");
    b.type = "button"; b.style.background = c;
    b.title = c; b.setAttribute("aria-label", "cor " + c);
    b.setAttribute("aria-pressed", String(c === cor));
    b.onclick = () => {
      cor = c; borracha = false;
      for (const o of barra.querySelectorAll(".cor")) o.setAttribute("aria-pressed", String(o.style.background === b.style.background));
      btBorracha.setAttribute("aria-pressed", "false");
    };
    barra.appendChild(b);
  }

  const fino = criar("input");
  fino.type = "range"; fino.min = "1"; fino.max = "34"; fino.value = "4";
  fino.style.width = "94px"; fino.title = "grossura";
  fino.oninput = () => { grossura = +fino.value; };

  const btBorracha = criar("button", "bt", "🩹 Borracha");
  btBorracha.type = "button"; btBorracha.setAttribute("aria-pressed", "false");
  btBorracha.onclick = () => {
    borracha = !borracha;
    btBorracha.setAttribute("aria-pressed", String(borracha));
  };

  const btLimpar = criar("button", "bt", "Limpar");
  btLimpar.type = "button";
  btLimpar.onclick = () => S.avisoDeTela("Limpar tudo?", "O desenho some. Não tem como voltar.", { fig:"🎨",
    botoes: [["Limpar", () => branco(), true], ["Deixa quieto", null]] });

  const btGuardar = criar("button", "bt principal", "💾 Guardar");
  btGuardar.type = "button";
  btGuardar.onclick = () => {
    const nome = prompt("Nome do desenho:", "desenho-" + (disco.desenhos.length + 1));
    if (!nome) return;
    disco.desenhos.push({ nome: nome.trim(), dados: tela.toDataURL("image/png"), quando: Date.now() });
    if (disco.desenhos.length > 12) disco.desenhos.shift();   // não encher o disco
    salvar();
    S.avisoDeTela("Guardado", "O desenho “" + nome.trim() + "” está na Galeria.", { fig:"💾" });
  };

  barra.append(fino, btBorracha, btLimpar, btGuardar);

  const palco = criar("div");
  palco.style.cssText = "flex:1;min-height:0;overflow:auto;display:grid;place-items:center;padding:8px";
  palco.appendChild(tela);

  caixa.append(barra, palco);
  j.corpo.appendChild(caixa);

  function branco() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tela.width, tela.height);
  }
  function ajustar() {
    const l = Math.max(200, Math.floor(palco.clientWidth - 16));
    const a = Math.max(150, Math.floor(palco.clientHeight - 16));
    if (tela.width === l && tela.height === a) return;
    /* guardar o que já foi desenhado antes de mudar o tamanho, senão o
       navegador limpa a tela e o desenho da pessoa some sem aviso */
    const antes = tela.width ? ctx.getImageData(0, 0, tela.width, tela.height) : null;
    tela.width = l; tela.height = a;
    branco();
    if (antes) ctx.putImageData(antes, 0, 0);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
  }
  ajustar();
  new ResizeObserver(ajustar).observe(palco);

  let riscando = false, ux = 0, uy = 0;
  const ponto = e => {
    const r = tela.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (tela.width / r.width),
             y: (e.clientY - r.top) * (tela.height / r.height) };
  };
  tela.addEventListener("pointerdown", e => {
    riscando = true; const p = ponto(e); ux = p.x; uy = p.y;
    tela.setPointerCapture(e.pointerId);
    risco(p.x, p.y, p.x + .01, p.y + .01);
    e.preventDefault();
  });
  tela.addEventListener("pointermove", e => {
    if (!riscando) return;
    const p = ponto(e);
    risco(ux, uy, p.x, p.y);
    ux = p.x; uy = p.y;
  });
  const parar = () => { riscando = false; };
  tela.addEventListener("pointerup", parar);
  tela.addEventListener("pointercancel", parar);

  function risco(x1, y1, x2, y2) {
    ctx.strokeStyle = borracha ? "#ffffff" : cor;
    ctx.lineWidth = borracha ? grossura * 2.4 : grossura;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  return j;
}

/* ==========================================================================
   GALERIA (os desenhos guardados)
   ========================================================================== */
export function galeria() {
  const j = S.abrir({ id:"galeria", nome:"Galeria", fig:"🖼️", largura: 520, altura: 400 });
  desenhar();
  return j;

  function desenhar() {
    j.corpo.innerHTML = "";
    if (!disco.desenhos.length) {
      const vazio = criar("div", "pad");
      vazio.append(criar("p", null, "Nenhum desenho guardado ainda."));
      const b = criar("button", "bt principal", "🎨 Abrir o Paint");
      b.type = "button"; b.onclick = () => paint();
      vazio.appendChild(b);
      j.corpo.appendChild(vazio);
      return;
    }
    const grade = criar("div", "grade");
    for (const d of [...disco.desenhos].reverse()) {
      const carta = criar("div", "cartaJogo");
      const img = criar("img"); img.src = d.dados; img.alt = d.nome;
      img.style.cssText = "width:100%;height:76px;object-fit:contain;background:#fff";
      const b = criar("button", "bt", "🗑");
      b.type = "button"; b.title = "jogar fora";
      b.onclick = () => {
        disco.desenhos = disco.desenhos.filter(x => x !== d);
        jogarNoLixo(d.nome, "🖼️"); salvar(); desenhar();
      };
      carta.append(img, criar("b", null, d.nome), b);
      grade.appendChild(carta);
    }
    j.corpo.appendChild(grade);
  }
}

/* ==========================================================================
   LIXEIRA
   ========================================================================== */
export function lixeira() {
  const j = S.abrir({ id:"lixo", nome:"Lixeira", fig:"🗑️", largura: 430, altura: 330 });
  desenhar();
  return j;

  function desenhar() {
    j.corpo.innerHTML = "";
    const caixa = criar("div", "pad");
    if (!disco.lixeira.length) {
      caixa.append(criar("p", null, "A lixeira está vazia. Parabéns pela organização."));
      j.corpo.appendChild(caixa);
      return;
    }
    caixa.append(criar("p", null, disco.lixeira.length + " coisa(s) aqui dentro:"));
    const ul = criar("ul");
    ul.style.cssText = "margin:0 0 12px;padding-left:22px;line-height:1.8";
    for (const x of [...disco.lixeira].reverse())
      ul.appendChild(criar("li", null, x.fig + "  " + x.nome));
    const b = criar("button", "bt principal", "Esvaziar a lixeira");
    b.type = "button";
    b.onclick = () => S.avisoDeTela("Esvaziar?", "Isso apaga de vez. Sem volta.", { fig:"🗑️",
      botoes: [["Esvaziar", () => { disco.lixeira = []; salvar(); desenhar(); }, true], ["Não", null]] });
    caixa.append(ul, b);
    j.corpo.appendChild(caixa);
  }
}

/* ==========================================================================
   CONFIGURAÇÕES
   ========================================================================== */
export function configuracoes(aoMudar) {
  const j = S.abrir({ id:"config", nome:"Configurações", fig:"⚙️", largura: 430, altura: 420 });
  if (j.corpo.childElementCount) return j;

  const caixa = criar("div", "pad");

  caixa.append(criar("h2", null, "Aparência"));
  caixa.append(grupo("Papel de parede", [
    ["quadriculado", "Quadriculado"], ["liso", "Liso"], ["estrelas", "Estrelas"],
  ], disco.papel, v => { disco.papel = v; salvar(); aoMudar(); }));

  caixa.append(grupo("Tema", [["dia", "Dia"], ["noite", "Noite"]],
    disco.tema, v => { disco.tema = v; salvar(); aoMudar(); }));

  caixa.append(criar("h2", null, "Sistema"));
  caixa.append(interruptor("Som ligado", "som", aoMudar));
  caixa.append(interruptor("O Clipy aparece na área de trabalho", "clipy", aoMudar));

  const perigo = criar("div");
  perigo.style.cssText = "margin-top:18px;padding-top:14px;border-top:1px solid var(--sombra)";
  const bFormatar = criar("button", "bt", "💣 Apagar tudo e começar de novo");
  bFormatar.type = "button";
  bFormatar.onclick = () => S.avisoDeTela("Apagar TUDO?",
    "Some tudo: documentos, desenhos, a conversa com o Clipy e as configurações. Sem volta.",
    { fig:"💣", botoes: [["Apagar tudo", () => { formatar(); location.reload(); }, true], ["Não, que susto", null]] });
  perigo.append(bFormatar);
  caixa.appendChild(perigo);

  j.corpo.appendChild(caixa);
  return j;

  function grupo(titulo, opcoes, agora, faz) {
    const d = criar("div");
    d.style.cssText = "margin-bottom:14px";
    d.append(criar("p", null, titulo));
    const linha = criar("div", "linha");
    for (const [valor, rotulo] of opcoes) {
      const b = criar("button", "bt", rotulo);
      b.type = "button";
      b.setAttribute("aria-pressed", String(valor === agora));
      if (valor === agora) b.classList.add("principal");
      b.onclick = () => {
        faz(valor);
        for (const o of linha.children) {
          o.classList.toggle("principal", o === b);
          o.setAttribute("aria-pressed", String(o === b));
        }
      };
      linha.appendChild(b);
    }
    d.append(linha);
    return d;
  }
  function interruptor(rotulo, chave, faz) {
    const b = criar("button", "bt", (disco[chave] ? "✅ " : "⬜ ") + rotulo);
    b.type = "button";
    b.style.cssText = "display:block;width:100%;text-align:left;margin-bottom:6px";
    b.setAttribute("aria-pressed", String(!!disco[chave]));
    b.onclick = () => {
      disco[chave] = !disco[chave];
      b.textContent = (disco[chave] ? "✅ " : "⬜ ") + rotulo;
      b.setAttribute("aria-pressed", String(!!disco[chave]));
      salvar(); faz();
    };
    return b;
  }
}

/* ==========================================================================
   SOBRE ESTE COMPUTADOR
   ========================================================================== */
export function sobre() {
  const j = S.abrir({ id:"sobre", nome:"Sobre este computador", fig:"💻", largura: 480, altura: 400 });
  if (j.corpo.childElementCount) return j;

  const caixa = criar("div", "bemvindo");
  const h = criar("h2", null, "JojoOS 1.0");
  const p1 = criar("p", null,
    "Um computador de mentira que funciona de verdade. Foi a ideia nº 1 do Caderno de 100 Jogos, " +
    "e ela existe porque o JoJo já tinha 18 jogos prontos: em vez de mais um jogo, um lugar onde " +
    "todos eles viram programa.");
  const ul = criar("ul");
  for (const linha of [
    "As janelas arrastam, esticam, minimizam e maximizam de verdade.",
    "Os jogos são lidos da mesma lista do portfólio — publicou lá, aparece aqui.",
    "A calculadora usa o mesmo leitor de conta do Clipy, que não usa eval().",
    "Tudo o que você guarda fica só neste aparelho. Não tem servidor nem conta.",
  ]) ul.appendChild(criar("li", null, linha));

  const marca = criar("p", "marca",
    "Feito pelo JoJo com o Claude · setembro de 2026 · sem nenhuma biblioteca de fora");

  caixa.append(h, p1, ul, marca);
  j.corpo.appendChild(caixa);
  return j;
}

/* ==========================================================================
   O CATÁLOGO — o que aparece na área de trabalho e no menu Iniciar
   ========================================================================== */
export function catalogo(aoMudarConfig) {
  return [
    { id:"jogos",  nome:"Meus Jogos",   fig:"🎮", mesa:true,  abre: meusJogos },
    { id:"cafe",   nome:"Café com o Clipy", fig:"☕", mesa:true, abre: abrirCafe },
    { id:"docs",   nome:"Meus Documentos", fig:"📁", mesa:true, abre: documentos },
    { id:"paint",  nome:"Paint do JoJo", fig:"🎨", mesa:true,  abre: paint },
    { id:"lixo",   nome:"Lixeira",      fig:"🗑️", mesa:true,  abre: lixeira },
    { separador:true },
    { id:"bloco",  nome:"Bloco de Notas", fig:"📝", mesa:false, abre: () => bloco() },
    { id:"calc",   nome:"Calculadora",  fig:"🧮", mesa:false, abre: calculadora },
    { id:"galeria",nome:"Galeria",      fig:"🖼️", mesa:false, abre: galeria },
    { separador:true },
    { id:"config", nome:"Configurações", fig:"⚙️", mesa:false, abre: () => configuracoes(aoMudarConfig) },
    { id:"sobre",  nome:"Sobre este computador", fig:"💻", mesa:false, abre: sobre },
  ];
}

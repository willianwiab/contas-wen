/* ==========================================================================
   TESTE DA EXTENSÃO DO CLIPY
   Roda num Chromium de verdade, com a extensão carregada de verdade, em
   páginas de verdade servidas por um servidorzinho local.

   como rodar:
     node teste-extensao.js
   ========================================================================== */
const { chromium } = require("playwright-core");
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PASTA = __dirname;
let feitos = 0, falhas = [];
const ok = (nome, cond, extra) => {
  feitos++;
  if (cond) console.log("  ✅ " + nome);
  else { falhas.push(nome + (extra ? "  → " + extra : "")); console.log("  ❌ " + nome + (extra ? "  → " + extra : "")); }
};

/* ---------------------------------------------------------- as páginas de teste */
const PAGINAS = {
  "/normal.html": `<title>Uma página comum</title><h1>Olá</h1>
    <p>${"texto comum ".repeat(80)}</p>`,

  "/404.html": `<title>404 — Página não encontrada</title>
    <h1>404</h1><p>A página que você procura não existe.</p>`,

  "/500.html": `<title>500 Internal Server Error</title>
    <h1>Internal Server Error</h1>`,

  "/branca.html": `<title>a</title>`,

  "/senha.html": `<title>Entrar</title><form>
    <input name="usuario"><input type="password" name="senha">
    <button>Entrar</button></form><p>${"palavra ".repeat(60)}</p>`,

  "/gato.html": `<title>Fotos</title><img alt="um gato dormindo" src="/x.png">
    <p>${"palavra ".repeat(60)}</p>`,

  "/codigo.html": `<title>Código</title><pre><code>a=1</code></pre>
    <pre><code>b=2</code></pre><pre><code>c=3</code></pre><p>${"palavra ".repeat(60)}</p>`,

  "/colorido.html": `<title>Cores</title><style>
    body{background:#ff0066}
    div{padding:20px;margin:4px}
    .a{background:#00ff44}.b{background:#ffdd00}.c{background:#0066ff}
    .d{background:#ff6600}.e{background:#cc00ff}.f{background:#00ffee}
  </style><div class=a>a</div><div class=b>b</div><div class=c>c</div>
    <div class=d>d</div><div class=e>e</div><div class=f>f</div>
    <div class=a>g</div><div class=b>h</div><div class=c>i</div><div class=d>j</div>
    <p>${"palavra ".repeat(60)}</p>`,

  "/emoji.html": `<title>Emojis</title><p>oi 🎉 tudo bem 😄</p><p>${"palavra ".repeat(60)}</p>`,

  "/formulario.html": `<title>Formulário</title><form id=f>
    <input id=obrigatorio required name=nome><button id=enviar>enviar</button></form>
    <p>${"palavra ".repeat(60)}</p>`,

  "/escrever.html": `<title>Escrever</title><textarea id=t rows=10 cols=60></textarea>
    <p>${"palavra ".repeat(60)}</p>`,
};

function servir() {
  return new Promise(res => {
    const s = http.createServer((req, r) => {
      const corpo = PAGINAS[req.url.split("?")[0]];
      if (corpo === undefined) { r.writeHead(404, {"Content-Type":"text/html"}); r.end("<h1>nada</h1>"); return; }
      r.writeHead(200, { "Content-Type":"text/html; charset=utf-8" });
      r.end("<!doctype html><meta charset=utf-8>" + corpo);
    });
    s.listen(0, "127.0.0.1", () => res(s));
  });
}

/* ---- ajudantes que falam com o Clipy de dentro da página ---- */
const AJUDA = {
  async esperarClipy(pg) {
    await pg.waitForFunction(() => !!document.getElementById("clipy-da-extensao"), null,
      { timeout:15000 });
    await pg.waitForFunction(() => {
      const c = document.getElementById("clipy-da-extensao");
      return c && c.shadowRoot && c.shadowRoot.querySelector(".painel");
    }, null, { timeout:15000 });
  },
  base: pg => pg.evaluate(() => document.getElementById("clipy-da-extensao").dataset.base),
  fila: pg => pg.evaluate(() => (document.getElementById("clipy-da-extensao").dataset.fila || "")
                                 .split(",").filter(Boolean)),
  tonto: pg => pg.evaluate(() => document.getElementById("clipy-da-extensao").dataset.tonto === "1"),
  humor: pg => pg.evaluate(() => document.getElementById("clipy-da-extensao").dataset.humor),
  balao: pg => pg.evaluate(() => {
    const s = document.getElementById("clipy-da-extensao").shadowRoot;
    const b = s.querySelector(".balao");
    return b.hidden ? null : s.querySelector(".balao p").textContent;
  }),
  existe: pg => pg.evaluate(() => !!document.getElementById("clipy-da-extensao")),
  /* espera até a fila conter um id (ou dar tempo) */
  async esperarNaFila(pg, id, ms = 12000) {
    try {
      await pg.waitForFunction(alvo =>
        ((document.getElementById("clipy-da-extensao") || {dataset:{}}).dataset.fila || "")
          .split(",").includes(alvo), id, { timeout:ms, polling:200 });
      return true;
    } catch (e) { return false; }
  },
  /* espera um balão que combine com um pedaço de texto */
  async esperarBalao(pg, re, ms = 14000) {
    try {
      await pg.waitForFunction(fonte => {
        const c = document.getElementById("clipy-da-extensao");
        if (!c || !c.shadowRoot) return false;
        const b = c.shadowRoot.querySelector(".balao");
        if (!b || b.hidden) return false;
        return new RegExp(fonte, "i").test(c.shadowRoot.querySelector(".balao p").textContent);
      }, re.source, { timeout:ms, polling:200 });
      return true;
    } catch (e) { return false; }
  },
  /* chama diagnosticar() do reacoes.js dentro da própria página */
  async diagnosticar(pg) {
    const base = await AJUDA.base(pg);
    return pg.evaluate(async b => {
      const m = await import(b + "reacoes.js");
      return m.diagnosticar();
    }, base);
  },
};

(async () => {
  const servidor = await servir();
  const porta = servidor.address().port;
  const site = u => `http://127.0.0.1:${porta}${u}`;
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), "clipy-perfil-"));

  /* O QUE NÃO DÁ PRA TESTAR AQUI, E POR QUE
     Trocar de aba de verdade. O Chromium sob controle de robô não esconde
     aba nenhuma: document.hidden fica false pra sempre, mesmo mandando
     bringToFront() na outra aba. Eu tentei sem tela, tentei com tela de
     verdade (xvfb) e tentei o comando de emulação do DevTools — nenhum dos
     três funciona. Então o teste 6 verifica o que dá pra verificar (a
     reação existe e sai na fila) e AVISA que o gatilho de verdade só pode
     ser conferido na mão, por uma pessoa trocando de aba. Melhor um teste
     honesto e incompleto que um teste bonito e mentiroso. */
  const comTela = !!process.env.DISPLAY;
  const args = [ `--disable-extensions-except=${PASTA}`, `--load-extension=${PASTA}` ];
  if (!comTela) args.unshift("--headless=new");

  const ctx = await chromium.launchPersistentContext(perfil, {
    executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium",
    args,
    viewport: { width:1280, height:820 },
  });

  try {
    /* ===================================================================== */
    console.log("\n1) ele entra na página e desenha");
    let pg = await ctx.newPage();
    await pg.goto(site("/normal.html"));
    await AJUDA.esperarClipy(pg);
    ok("a janelinha aparece", await AJUDA.existe(pg));
    const base = await AJUDA.base(pg);
    ok("dá pra achar a pasta da extensão", /^chrome-extension:\/\/\w+\/$/.test(base), base);
    ok("ele desenha no canvas", await pg.evaluate(() => {
      const cv = document.getElementById("clipy-da-extensao").shadowRoot.querySelector("canvas");
      return cv.width > 0 && cv.height > 0;
    }));
    ok("ele fala quando chega", await AJUDA.esperarBalao(pg, /./));

    /* ===================================================================== */
    console.log("\n2) os detectores (reacoes.js) olhando páginas de verdade");
    const casos = [
      ["/404.html",        "erro404"],
      ["/500.html",        "erro500"],
      ["/branca.html",     "paginaBranca"],
      ["/senha.html",      "paginaLogin"],
      ["/senha.html",      "campoSenha"],
      ["/gato.html",       "temGato"],
      ["/codigo.html",     "temCodigo"],
      ["/colorido.html",   "siteColorido"],
      ["/emoji.html",      "temEmoji"],
    ];
    for (const [url, esperado] of casos) {
      const p2 = await ctx.newPage();
      await p2.goto(site(url));
      await AJUDA.esperarClipy(p2);
      const achados = await AJUDA.diagnosticar(p2);
      ok(`${url} → ${esperado}`, achados.includes(esperado), achados.join(","));
      await p2.close();
    }
    /* e o contrário: a página comum não pode disparar pânico */
    const achadosNormal = await AJUDA.diagnosticar(pg);
    ok("página comum NÃO é 404", !achadosNormal.includes("erro404"), achadosNormal.join(","));
    ok("página comum NÃO é branca", !achadosNormal.includes("paginaBranca"));
    ok("página comum NÃO tem senha", !achadosNormal.includes("campoSenha"));
    ok("página comum NÃO é colorida demais", !achadosNormal.includes("siteColorido"));

    /* ===================================================================== */
    console.log("\n3) o 404 entra em pânico de verdade (sem esperar a vez)");
    const p404 = await ctx.newPage();
    await p404.goto(site("/404.html"));
    await AJUDA.esperarClipy(p404);
    ok("ele entra em pânico no 404",
      await AJUDA.esperarBalao(p404, /CADÊ A PÁGINA|desapareceu|ESTAVA AQUI|suspeito|investigadores/, 18000));
    await p404.close();

    /* ===================================================================== */
    console.log("\n4) arrastar ele — e ficar TONTO");
    const barra = () => pg.evaluate(() => {
      const r = document.getElementById("clipy-da-extensao").shadowRoot
        .querySelector(".titulo").getBoundingClientRect();
      return { x:r.left + r.width / 2, y:r.top + r.height / 2 };
    });
    let b = await barra();
    await pg.mouse.move(b.x, b.y);
    await pg.mouse.down();
    /* sacode ele pra valer: muita virada de direção */
    for (let i = 0; i < 14; i++) {
      await pg.mouse.move(300 + (i % 2 ? 420 : 0), 300 + (i % 3) * 90);
    }
    await pg.mouse.up();
    ok("sacudir deixa ele tonto", await pg.waitForFunction(() =>
      document.getElementById("clipy-da-extensao").dataset.tonto === "1",
      null, { timeout:6000 }).then(() => true).catch(() => false));
    ok("ele reclama de ser arrastado", await AJUDA.esperarBalao(pg,
      /SEQUESTRADO|tonto|girando|DEVAGAR|pernas|ARRASTAR|dignidade|vida passar|parafuso/, 12000));
    ok("o humor dele fica tonto", (await AJUDA.humor(pg)) === "tonto", await AJUDA.humor(pg));
    ok("a tontura passa depois", await pg.waitForFunction(() =>
      document.getElementById("clipy-da-extensao").dataset.tonto === "0",
      null, { timeout:20000 }).then(() => true).catch(() => false));

    /* ===================================================================== */
    console.log("\n5) o mouse chegando perto dele");
    await pg.evaluate(() => {
      const s = document.getElementById("clipy-da-extensao").shadowRoot;
      s.querySelector(".palco").dispatchEvent(new PointerEvent("pointerenter", { bubbles:true }));
    });
    ok("ele nota que você está olhando", await AJUDA.esperarNaFila(pg, "olhando", 4000));

    /* ===================================================================== */
    console.log("\n6) trocar de aba");
    const outra = await ctx.newPage();
    await outra.goto(site("/normal.html"));
    await AJUDA.esperarClipy(outra);
    await outra.bringToFront();
    await pg.waitForTimeout(900);
    const escondeu = await pg.evaluate(() => document.hidden);
    if (escondeu) {
      ok("ele nota que você saiu", await AJUDA.esperarNaFila(pg, "trocouAba", 8000));
    } else {
      console.log("  ⚠️  o gatilho de verdade não dá pra simular: o Chromium sob");
      console.log("     controle de robô nunca esconde a aba (document.hidden fica");
      console.log("     false). Esta parte precisa ser conferida na mão. O que dá");
      console.log("     pra testar, abaixo, está testado.");
    }
    await outra.close();
    await pg.bringToFront();
    /* as duas reações existem e têm fala? */
    const abas = await pg.evaluate(async b => {
      const m = await import(b + "reacoes.js");
      return { saiu:m.fala("trocouAba"), voltou:m.fala("voltouPraAba") };
    }, base);
    ok("a reação de sair da aba tem fala", /Volta aqui|Você saiu|outra coisa/.test(abas.saiu.fala), abas.saiu.fala);
    ok("a reação de voltar pra aba tem fala",
      /lembrou de mim|VOLTOU|sozinho/.test(abas.voltou.fala), abas.voltou.fala);
    ok("voltar pra aba é reação alegre", abas.voltou.humor === "comemorando", abas.voltou.humor);

    /* ===================================================================== */
    console.log("\n7) a internet caiu");
    await pg.bringToFront();
    await pg.evaluate(() => dispatchEvent(new Event("offline")));
    ok("ele grita quando a internet cai", await AJUDA.esperarBalao(pg,
      /INTERNET MORREU|Cabo|não preciso de internet/, 8000));
    await pg.evaluate(() => {
      const s = document.getElementById("clipy-da-extensao").shadowRoot;
      s.querySelector(".balao .bts button").click();
    });
    await pg.evaluate(() => dispatchEvent(new Event("online")));
    ok("ele comemora quando volta", await AJUDA.esperarBalao(pg, /VOLTOU|Respira/, 8000));

    /* ===================================================================== */
    console.log("\n8) formulário reclamando e erro de JavaScript");
    const pf = await ctx.newPage();
    await pf.goto(site("/formulario.html"));
    await AJUDA.esperarClipy(pf);
    await pf.evaluate(() => document.getElementById("f").reportValidity());
    ok("ele vê o campo em falta", await AJUDA.esperarNaFila(pf, "formularioInvalido", 6000));
    await pf.evaluate(() => setTimeout(() => { throw new Error("quebrei de propósito"); }, 0));
    ok("ele dedura o erro de JavaScript", await AJUDA.esperarNaFila(pf, "erroDeJs", 6000));
    await pf.close();

    /* ===================================================================== */
    console.log("\n9) o que ele vê no teclado");
    const pe = await ctx.newPage();
    await pe.goto(site("/escrever.html"));
    await AJUDA.esperarClipy(pe);
    const b2 = await AJUDA.base(pe);
    const teclado = await pe.evaluate(async bb => {
      const m = await import(bb + "reacoes.js");
      const est = (t, mais) => Object.assign({
        texto:t, baixo:t.toLowerCase(), palavras:t.split(/\s+/).filter(Boolean),
        letras:(t.match(/\p{L}/gu) || []).length, apagados:0, porMinuto:0, parado:0,
      }, mais || {});
      return {
        socorro:  m.olharTeclado(est("socorro me ajuda")),
        clipy:    m.olharTeclado(est("oi clipy tudo bem")),
        risada:   m.olharTeclado(est("kkkkkk que engraçado")),
        caps:     m.olharTeclado(est("POR QUE EU ESTOU GRITANDO ASSIM")),
        tese:     m.olharTeclado(est("palavra ".repeat(200))),
        rapido:   m.olharTeclado(est("escrevendo bastante aqui", { porMinuto:260 })),
        apagando: m.olharTeclado(est("texto qualquer aqui", { apagados:150 })),
        nada:     m.olharTeclado(est("oi")),
        repetida: m.olharTeclado(est("banana banana banana banana cereja abacate morango goiaba")),
      };
    }, b2);
    ok('"socorro" → socorro',            teclado.socorro === "socorro", teclado.socorro);
    ok('"clipy" → chamouEle',            teclado.clipy === "chamouEle", teclado.clipy);
    ok('"kkkkkk" → risada',              teclado.risada === "risada", teclado.risada);
    ok("TUDO MAIÚSCULO → capsLock",      teclado.caps === "capsLock", teclado.caps);
    ok("texto gigante → digitandoTese",  teclado.tese === "digitandoTese", teclado.tese);
    ok("digitar rápido → digitandoMuito",teclado.rapido === "digitandoMuito", teclado.rapido);
    ok("apagar muito → backspaceDemais", teclado.apagando === "backspaceDemais", teclado.apagando);
    ok("palavra repetida é notada",      teclado.repetida === "palavraRepetida", teclado.repetida);
    ok("texto curto não vira nada",      teclado.nada === null, String(teclado.nada));

    /* ele ainda faz conta em qualquer site */
    await pe.fill("#t", "20+20+20+7=");
    ok("ele continua respondendo conta", await AJUDA.esperarBalao(pe, /67/, 8000), await AJUDA.balao(pe));

    /* e apagar tudo é notado */
    await pe.fill("#t", "um texto bem grande pra ele ver desaparecer todinho agora");
    await pe.waitForTimeout(400);
    await pe.fill("#t", "");
    ok("apagar tudo é notado", await AJUDA.esperarNaFila(pe, "apagouTudo", 6000));
    await pe.close();

    /* ===================================================================== */
    console.log("\n10) o mundo.js conta abas sem espionar aba nenhuma");
    const contas = await pg.evaluate(async bb => {
      const m = await import(bb + "mundo.js");
      /* uma gaveta de mentira, só pra ver a lógica funcionando */
      const faz = () => { let dado = {};
        return { get:async d => ({ mundo:dado.mundo !== undefined ? dado.mundo : d.mundo }),
                 set:async o => { Object.assign(dado, o); }, espiar:() => dado }; };
      const g = faz();
      const r = {};

      const a1 = new m.Mundo(g); await a1.nasci();
      const a2 = new m.Mundo(g); r.segundaAba = await a2.nasci();
      r.abas = a1.quantasAbas ? a2.quantasAbas() : 0;

      /* a aba 2 fecha: deixa o aviso */
      a2.saindo();
      await new Promise(f => setTimeout(f, 30));
      r.temAviso = (g.espiar().mundo.saidas || []).length === 1;

      /* o aviso é NOVO: quem nascer agora entende que foi só troca de página */
      const a3 = new m.Mundo(g); r.trocouPagina = await a3.nasci();

      /* agora um aviso VELHO: aí sim foi fechamento */
      const d = g.espiar().mundo; d.saidas = [Date.now() - 60000]; await g.set({ mundo:d });
      const a4 = new m.Mundo(g); r.fechou = await a4.nasci();

      /* três avisos velhos = muitas abas fechadas */
      const d2 = g.espiar().mundo; d2.saidas = [1, 2, 3]; await g.set({ mundo:d2 });
      const a5 = new m.Mundo(g); r.muitas = await a5.nasci();

      /* nada de endereço nem título guardado */
      r.gaveta = JSON.stringify(g.espiar());
      return r;
    }, base);
    ok("a segunda aba é notada como aba nova", contas.segundaAba.includes("abaNova"), contas.segundaAba.join(","));
    ok("fechar aba deixa o aviso", contas.temAviso);
    ok("aviso recente = só trocou de página, ele fica quieto",
      !contas.trocouPagina.includes("abaFechada"), contas.trocouPagina.join(","));
    ok("aviso velho = aba fechada de verdade",
      contas.fechou.includes("abaFechada"), contas.fechou.join(","));
    ok("três avisos = muitasAbasFechadas",
      contas.muitas.includes("muitasAbasFechadas"), contas.muitas.join(","));
    ok("a gaveta NÃO guarda endereço de site nenhum",
      !/https?:|youtube|google|\/\//.test(contas.gaveta.replace(/"[^"]*hostname[^"]*"/g, "")),
      contas.gaveta.slice(0, 200));

    /* ===================================================================== */
    console.log("\n11) a privacidade continua valendo");
    const ps = await ctx.newPage();
    await ps.goto(site("/senha.html"));
    await AJUDA.esperarClipy(ps);
    await ps.fill('input[type="password"]', "999+999=");
    await ps.waitForTimeout(2500);
    const balaoSenha = await AJUDA.balao(ps);
    ok("ele NÃO responde conta digitada no campo de senha",
      !balaoSenha || !/1998/.test(balaoSenha), String(balaoSenha));
    ok("ele não mexeu no que foi digitado",
      await ps.inputValue('input[type="password"]') === "999+999=");
    ok("a extensão não pede permissão de rede",
      !JSON.parse(fs.readFileSync(path.join(PASTA, "manifest.json"), "utf8"))
        .permissions.some(x => x !== "storage"));
    await ps.close();

    /* ===================================================================== */
    console.log("\n12) desligar ele no painel — com drama, e sem F5");
    const pop = await ctx.newPage();
    await pop.goto(base + "popup.html");
    await pop.click("#btLigado");
    ok("o painel mostra NÃO", (await pop.textContent("#btLigado")).trim() === "NÃO");
    ok("ele faz drama antes de sumir", await AJUDA.esperarBalao(pg,
      /sozinho|desligou|Adeus/, 8000));
    ok("depois ele sai da tela", await pg.waitForFunction(() =>
      !document.getElementById("clipy-da-extensao"),
      null, { timeout:12000 }).then(() => true).catch(() => false));
    await pop.click("#btLigado");
    ok("religar traz ele de volta sem recarregar a página", await pg.waitForFunction(() =>
      !!document.getElementById("clipy-da-extensao"),
      null, { timeout:10000 }).then(() => true).catch(() => false));
    ok("e ele comemora a volta", await AJUDA.esperarBalao(pg, /Voltei|sentiu minha falta/, 9000));

    /* ===================================================================== */
    console.log("\n13) a chatice muda na hora, sem F5");
    await pop.evaluate(() => {
      const c = document.getElementById("chatice");
      c.value = 0; c.dispatchEvent(new Event("input", { bubbles:true }));
    });
    await pg.waitForTimeout(1200);
    ok("o botão dele vira 'Falar' quando a chatice é zero",
      await pg.evaluate(() => document.getElementById("clipy-da-extensao")
        .shadowRoot.querySelector(".calado").textContent.includes("Falar")));
    await pop.close();

  } catch (e) {
    falhas.push("EXPLODIU: " + e.message);
    console.log("\n💥 " + e.stack);
  } finally {
    await ctx.close();
    servidor.close();
    fs.rmSync(perfil, { recursive:true, force:true });
  }

  console.log(`\n${"=".repeat(58)}`);
  console.log(`${feitos - falhas.length}/${feitos} passaram`);
  if (falhas.length) { console.log("\nfalharam:"); falhas.forEach(f => console.log("  • " + f)); }
  process.exit(falhas.length ? 1 : 0);
})();

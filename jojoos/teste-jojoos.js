/* ==========================================================================
   TESTE DO JojoOS
   Roda num Chromium de verdade, contra o sistema servido de verdade.

   como rodar (da raiz do projeto):
     python3 -m http.server 8822 &
     node jojoos/teste-jojoos.js
   ========================================================================== */
const { chromium } = require("playwright-core");

const ONDE = process.env.ONDE || "http://127.0.0.1:8822/jojoos/";
let feitos = 0; const falhas = [];
const ok = (nome, cond, extra) => {
  feitos++;
  if (cond) console.log("  ✅ " + nome);
  else { falhas.push(nome + (extra ? "  → " + extra : "")); console.log("  ❌ " + nome + (extra ? "  → " + extra : "")); }
};

/* ---- ajudantes ---- */
const J = {
  abertas: p => p.evaluate(() => [...document.querySelectorAll(".janela")]
    .filter(x => !x.classList.contains("minimizada"))
    .map(x => x.querySelector(".txt").textContent)),
  frente: p => p.evaluate(() => document.querySelector(".janela.frente .txt")?.textContent || null),
  abas: p => p.evaluate(() => [...document.querySelectorAll("#abertas .aba span:nth-child(2)")]
    .map(x => x.textContent)),
  /* fecha a janela cujo título combine */
  fechar: (p, re) => p.evaluate(fonte => {
    const alvo = [...document.querySelectorAll(".janela")]
      .find(x => new RegExp(fonte).test(x.querySelector(".txt").textContent));
    if (alvo) alvo.querySelector(".bt.fecha").click();
    return !!alvo;
  }, re.source),
  /* clica num ícone da área de trabalho pelo nome */
  icone: (p, nome) => p.evaluate(n => {
    const b = [...document.querySelectorAll(".icone")].find(x => x.querySelector(".rot").textContent === n);
    if (!b) return false;
    b.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    return true;
  }, nome),
  caixa: (p, re) => p.evaluate(fonte => {
    const alvo = [...document.querySelectorAll(".janela")]
      .find(x => new RegExp(fonte).test(x.querySelector(".txt").textContent));
    if (!alvo) return null;
    const r = alvo.getBoundingClientRect();
    return { x: r.x, y: r.y, l: r.width, a: r.height };
  }, re.source),
};

(async () => {
  const b = await chromium.launch({ executablePath:"/opt/pw-browsers/chromium", args:["--headless=new"] });
  const ctx = await b.newContext({ viewport:{ width:1200, height:780 } });
  const p = await ctx.newPage();
  const erros = [];
  p.on("console", m => { if (m.type() === "error") erros.push(m.text().slice(0, 150)); });
  p.on("pageerror", e => erros.push("EXPLODIU: " + e.message.slice(0, 150)));
  p.on("dialog", d => d.accept("teste.txt"));      // o prompt do Bloco de Notas

  try {
    /* ================================================================== */
    console.log("\n1) o computador liga");
    await p.goto(ONDE, { waitUntil:"load" });
    await p.waitForFunction(() => !!window.JojoOS, null, { timeout:15000 });
    await p.waitForTimeout(900);

    ok("a área de trabalho tem ícones",
      (await p.evaluate(() => document.querySelectorAll(".icone").length)) === 5);
    ok("o relógio anda",
      /^\d{2}:\d{2}$/.test(await p.textContent("#relogio b")));
    ok("o Clipy mora na mesa", !(await p.evaluate(() => document.querySelector("#cantoClipy").hidden)));
    ok("a janela de boas-vindas abre na primeira vez",
      (await J.abertas(p)).some(t => /Bem-vindo/.test(t)));

    /* o bug que o primeiro olhar achou: focar o botão rolava o conteúdo e
       escondia o título da janela */
    ok("a janela de boas-vindas NÃO abre rolada pra baixo",
      (await p.evaluate(() => {
        const c = [...document.querySelectorAll(".janela")]
          .find(x => /Bem-vindo/.test(x.querySelector(".txt").textContent)).querySelector(".corpo");
        return c.scrollTop;
      })) === 0);

    await J.fechar(p, /Bem-vindo/);
    await p.waitForTimeout(200);
    ok("e fecha", !(await J.abertas(p)).some(t => /Bem-vindo/.test(t)));

    /* ================================================================== */
    console.log("\n2) abrir programas");
    await J.icone(p, "Meus Jogos");
    await p.waitForTimeout(1200);
    ok("Meus Jogos abre", (await J.abertas(p)).includes("Meus Jogos"));
    const quantos = await p.evaluate(() => document.querySelectorAll(".cartaJogo").length);
    ok("e lista os 18 jogos do portfólio", quantos === 18, String(quantos));
    ok("cada jogo mostra o desenho do portfólio",
      (await p.evaluate(() => [...document.querySelectorAll(".cartaJogo img")]
        .filter(i => /assets\/images/.test(i.src)).length)) >= 15);

    await J.icone(p, "Paint do JoJo");
    await J.icone(p, "Lixeira");
    await p.waitForTimeout(500);
    ok("dá pra ter várias janelas abertas", (await J.abertas(p)).length === 3,
      (await J.abertas(p)).join(", "));
    ok("cada uma ganha uma abinha na barra de tarefas", (await J.abas(p)).length === 3);
    ok("a última aberta fica na frente", (await J.frente(p)) === "Lixeira", await J.frente(p));

    /* abrir o mesmo programa duas vezes não faz janela duplicada */
    await J.icone(p, "Paint do JoJo");
    await p.waitForTimeout(300);
    ok("abrir de novo só traz pra frente (não duplica)",
      (await J.abertas(p)).filter(t => t === "Paint do JoJo").length === 1);
    ok("e ele passa a ser o da frente", (await J.frente(p)) === "Paint do JoJo");

    /* ================================================================== */
    console.log("\n3) mexer nas janelas");
    let antes = await J.caixa(p, /Lixeira/);
    await p.evaluate(() => {
      const jan = [...document.querySelectorAll(".janela")]
        .find(x => /Lixeira/.test(x.querySelector(".txt").textContent));
      jan.querySelector(".bt[aria-label='minimizar']").click();
    });
    await p.waitForTimeout(200);
    ok("minimizar esconde a janela", !(await J.abertas(p)).includes("Lixeira"));
    ok("mas a abinha continua lá", (await J.abas(p)).includes("Lixeira"));

    await p.evaluate(() => {
      [...document.querySelectorAll("#abertas .aba")]
        .find(x => /Lixeira/.test(x.textContent)).click();
    });
    await p.waitForTimeout(200);
    ok("clicar na abinha traz de volta", (await J.abertas(p)).includes("Lixeira"));

    /* arrastar pela barra de título */
    antes = await J.caixa(p, /Lixeira/);
    await p.mouse.move(antes.x + 80, antes.y + 12);
    await p.mouse.down();
    await p.mouse.move(antes.x + 300, antes.y + 190, { steps: 8 });
    await p.mouse.up();
    const depois = await J.caixa(p, /Lixeira/);
    ok("arrastar pela barra move a janela",
      Math.abs(depois.x - antes.x) > 150 && Math.abs(depois.y - antes.y) > 120,
      JSON.stringify({ antes, depois }));

    /* esticar pelo cantinho */
    const c1 = await J.caixa(p, /Lixeira/);
    await p.mouse.move(c1.x + c1.l - 4, c1.y + c1.a - 4);
    await p.mouse.down();
    await p.mouse.move(c1.x + c1.l + 130, c1.y + c1.a + 90, { steps: 6 });
    await p.mouse.up();
    const c2 = await J.caixa(p, /Lixeira/);
    ok("esticar pelo cantinho aumenta a janela",
      c2.l > c1.l + 90 && c2.a > c1.a + 60, JSON.stringify({ c1, c2 }));

    /* maximizar */
    await p.evaluate(() => {
      const jan = [...document.querySelectorAll(".janela")]
        .find(x => /Lixeira/.test(x.querySelector(".txt").textContent));
      jan.querySelector(".bt[aria-label='aumentar']").click();
    });
    await p.waitForTimeout(200);
    const cheia = await J.caixa(p, /Lixeira/);
    ok("maximizar ocupa a mesa inteira", cheia.l > 1100 && cheia.x < 4, JSON.stringify(cheia));
    await p.evaluate(() => {
      const jan = [...document.querySelectorAll(".janela")]
        .find(x => /Lixeira/.test(x.querySelector(".txt").textContent));
      jan.querySelector(".bt[aria-label='aumentar']").click();
    });
    await p.waitForTimeout(200);
    const voltou = await J.caixa(p, /Lixeira/);
    ok("e voltar devolve o tamanho de antes",
      Math.abs(voltou.l - c2.l) < 3 && Math.abs(voltou.x - c2.x) < 3,
      JSON.stringify({ c2, voltou }));

    /* ================================================================== */
    console.log("\n4) o menu Iniciar");
    await p.click("#btIniciar");
    await p.waitForTimeout(200);
    ok("o menu abre", !(await p.evaluate(() => document.querySelector("#menu").hidden)));
    /* 10 programas + 2 risquinhos de separação (que não são botões) */
    ok("e tem os 10 programas",
      (await p.evaluate(() => document.querySelectorAll("#menu button").length)) === 10);
    ok("com os separadores no lugar",
      (await p.evaluate(() => document.querySelectorAll("#menu hr").length)) === 2);
    await p.keyboard.press("Escape");
    await p.waitForTimeout(200);
    ok("Esc fecha o menu", await p.evaluate(() => document.querySelector("#menu").hidden));

    /* ================================================================== */
    console.log("\n5) a calculadora faz conta de verdade");
    await p.evaluate(() => window.JojoOS.PROGRAMAS.find(x => x.id === "calc").abre());
    await p.waitForTimeout(400);
    const clicaTecla = t => p.evaluate(txt => {
      const jan = [...document.querySelectorAll(".janela")]
        .find(x => /Calculadora/.test(x.querySelector(".txt").textContent));
      [...jan.querySelectorAll("button")].find(b => b.textContent === txt)?.click();
    }, t);
    for (const t of ["2", "0", "+", "2", "0", "+", "2", "0", "+", "7", "="]) await clicaTecla(t);
    await p.waitForTimeout(250);
    const visor = await p.evaluate(() => {
      const jan = [...document.querySelectorAll(".janela")]
        .find(x => /Calculadora/.test(x.querySelector(".txt").textContent));
      return jan.querySelector(".corpo div div").textContent;
    });
    ok("20+20+20+7 = 67", visor.trim() === "67", visor);

    /* ================================================================== */
    console.log("\n6) ☕ Café com o Clipy (a ideia nº 99)");
    await p.evaluate(() => window.JojoOS.PROGRAMAS.find(x => x.id === "cafe").abre());
    await p.waitForTimeout(1100);
    ok("o café abre", (await J.abertas(p)).includes("Café com o Clipy"));
    ok("ele cumprimenta quem chega",
      (await p.evaluate(() => document.querySelectorAll("#cafeRolo .balaoFala.dele").length)) >= 1);
    ok("o Clipy é desenhado no café",
      await p.evaluate(() => {
        const cv = document.querySelector("#cafe canvas") ||
          [...document.querySelectorAll(".janela canvas")].pop();
        return !!cv && cv.width > 0;
      }));

    await p.fill("#cafeCampo", "quanto é 12*12?");
    await p.press("#cafeCampo", "Enter");
    await p.waitForTimeout(2200);
    let falas = await p.evaluate(() => [...document.querySelectorAll("#cafeRolo .balaoFala")]
      .map(x => x.className.includes("dele") ? "ele: " + x.textContent : "eu: " + x.textContent));
    ok("o que eu escrevo aparece na conversa", falas.some(f => /^eu: quanto é 12\*12/.test(f)));
    ok("e ele responde a conta de verdade (144)",
      falas.some(f => /^ele:.*144/.test(f)), falas.slice(-2).join(" | "));

    await p.fill("#cafeCampo", "oi, tudo bem?");
    await p.press("#cafeCampo", "Enter");
    await p.waitForTimeout(1600);
    falas = await p.evaluate(() => [...document.querySelectorAll("#cafeRolo .balaoFala")].length);
    ok("a conversa continua crescendo", falas >= 5, String(falas));

    ok("e não tem placar nenhum — é o ponto da ideia 99",
      !(await p.evaluate(() => /pontos?|placar|score|n[íi]vel|fase|voc[êe] venceu/i
        .test(document.querySelector("#cafeRolo").closest(".janela").textContent))));

    /* ================================================================== */
    console.log("\n7) o que ele guarda fica guardado");
    await p.evaluate(() => {
      window.JojoOS.disco.documentos["teste.txt"] = "escrito pelo teste";
      window.JojoOS.disco.tema = "noite";
      window.JojoOS.salvar();
    });
    await p.evaluate(() => window.JojoOS.disco && localStorage.getItem("jojoos-v1"));
    await p.waitForTimeout(400);
    await p.reload({ waitUntil:"load" });
    await p.waitForFunction(() => !!window.JojoOS, null, { timeout:15000 });
    await p.waitForTimeout(700);
    ok("o documento continua lá depois de recarregar",
      (await p.evaluate(() => window.JojoOS.disco.documentos["teste.txt"])) === "escrito pelo teste");
    ok("o tema escolhido continua valendo",
      (await p.evaluate(() => document.documentElement.dataset.tema)) === "noite");
    ok("a conversa do café também ficou guardada",
      (await p.evaluate(() => window.JojoOS.disco.cafe.length)) >= 4);
    ok("e a janela de boas-vindas não aparece de novo",
      !(await J.abertas(p)).some(t => /Bem-vindo/.test(t)));

    /* o café lembra da conversa */
    await p.evaluate(() => window.JojoOS.PROGRAMAS.find(x => x.id === "cafe").abre());
    await p.waitForTimeout(900);
    ok("ao voltar, o café mostra a conversa de antes",
      (await p.evaluate(() => document.querySelectorAll("#cafeRolo .balaoFala").length)) >= 4);

    /* ================================================================== */
    console.log("\n8) o Bloco de Notas");
    await p.evaluate(() => window.JojoOS.PROGRAMAS.find(x => x.id === "bloco").abre());
    await p.waitForTimeout(400);
    await p.fill(".janela textarea.folha", "oi, eu escrevi isso");
    await p.evaluate(() => {
      const jan = [...document.querySelectorAll(".janela")]
        .find(x => /Bloco de Notas/.test(x.querySelector(".txt").textContent));
      [...jan.querySelectorAll("button")].find(b => /Guardar/.test(b.textContent)).click();
    });
    await p.waitForTimeout(500);
    ok("guardar guarda o texto",
      (await p.evaluate(() => window.JojoOS.disco.documentos["sem-titulo.txt"])) === "oi, eu escrevi isso");

    /* ================================================================== */
    console.log("\n9) instalável e sem erro");
    ok("tem manifesto", !!(await p.evaluate(() => document.querySelector('link[rel="manifest"]'))));
    ok("o service worker foi registrado",
      await p.evaluate(() => navigator.serviceWorker.getRegistrations().then(r => r.length > 0)));
    ok("nenhum erro no console", erros.length === 0, erros.join(" | "));

    /* ================================================================== */
    console.log("\n10) no celular");
    const cel = await ctx.newPage();
    await cel.setViewportSize({ width: 390, height: 720 });
    await cel.goto(ONDE, { waitUntil:"load" });
    await cel.waitForFunction(() => !!window.JojoOS, null, { timeout:15000 });
    await cel.waitForTimeout(900);
    ok("a tela não rola pro lado",
      !(await cel.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)));
    await cel.evaluate(() => window.JojoOS.PROGRAMAS.find(x => x.id === "jogos").abre());
    await cel.waitForTimeout(700);
    const cx = await J.caixa(cel, /Meus Jogos/);
    ok("a janela cabe na tela do celular", cx.l <= 390 && cx.x >= 0, JSON.stringify(cx));
    await cel.close();

  } catch (e) {
    falhas.push("EXPLODIU: " + e.message);
    console.log("\n💥 " + e.stack);
  } finally {
    await b.close();
  }

  console.log("\n" + "=".repeat(58));
  console.log(`${feitos - falhas.length}/${feitos} passaram`);
  if (falhas.length) { console.log("\nfalharam:"); falhas.forEach(f => console.log("  • " + f)); }
  process.exit(falhas.length ? 1 : 0);
})();

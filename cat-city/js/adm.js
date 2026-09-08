/* ==========================================================================
   CAT CITY · adm.js
   MODO ADM — a senha é 1234.

   Abre pelo cadeadinho 🔒 do menu, com Ctrl+Shift+A, ou escrevendo ADMIN
   com o jogo rodando.

   Os botões de número são os mesmos que o Jojo pediu na Torre de Emojis:
   1, 10, 15, 25, 100, 200, 300, 400, 500 e 1000.

   Este arquivo não sabe nada do jogo por dentro. Ele só chama o que o
   main.js entregou na API. Se um dia o jogo mudar, o painel continua.
   ========================================================================== */
const SENHA = "1234";
const NUMEROS = [1, 10, 15, 25, 100, 200, 300, 400, 500, 1000];

const $ = id => document.getElementById(id);
let API = null, liberado = false, aberto = false, digitado = "";

/* ---------------------------------------------------------------- peças */
function fileiraDeNumeros(onde, rotulo, acao) {
  const c = $(onde); c.innerHTML = "";
  for (const n of NUMEROS) {
    const b = document.createElement("button");
    b.className = "admBt"; b.textContent = rotulo(n);
    b.onclick = () => { acao(n); atualizar(); };
    c.appendChild(b);
  }
}
function botoes(onde, lista) {
  const c = $(onde); c.innerHTML = "";
  for (const it of lista) {
    const b = document.createElement("button");
    b.className = "admBt" + (it.ligado ? " sel" : "") + (it.perigo ? " perigo" : "");
    b.textContent = it.txt;
    if (it.dica) b.title = it.dica;
    b.onclick = () => { it.faz(); montar(); atualizar(); };
    c.appendChild(b);
  }
}
function interruptor(nome, chave, dica) {
  return { txt:(API.truques[chave] ? "✅ " : "⬜ ") + nome, ligado:API.truques[chave], dica,
           faz:() => { API.truques[chave] = !API.truques[chave]; } };
}
function escala(nome, chave, valores) {
  return valores.map(v => ({ txt:nome + " x" + v, ligado:API.truques[chave] === v,
    faz:() => {
      API.truques[chave] = v;
      /* o tamanho mexe no corpo: refaz a forma pra raio, altura e massa
         acompanharem (senão o gato fica gigante só no desenho) */
      if (chave === "gigante") API.aplicarForma(API.jogador.forma);
    } }));
}

/* ---------------------------------------------------------------- painel */
function montar() {
  if (!API) return;

  /* gatos */
  fileiraDeNumeros("admGatos", n => "+" + n, n => {
    const fez = API.gatosPerto(n);
    if (fez < n) API.ui.recado("o teto de gatos encheu — aumenta ali embaixo");
  });
  botoes("admGatosExtra", [
    { txt:"🌀 multiplicar", faz:() => API.multiplicar(API.jogo.t, 1, 900) },
    { txt:"🌀🌀 multiplicar 3x", faz:() => API.multiplicar(API.jogo.t, 3, 2000) },
    { txt:"🏙 espalhar 100 pela cidade", faz:() => API.espalharPelaCidade(100, API.jogo.t) },
    { txt:"🐯 um gato GIGANTE aqui", faz:() => API.nascerGato(API.jogador.x + 6, API.jogador.y + 6,
        API.jogo.t, { escala:9, tipo:1 }) },
    { txt:"🧹 limpar todos", perigo:true, faz:() => API.limparGatos() },
  ]);
  botoes("admTeto", [60, 320, 600, 900, 1500, 2200, 3000].map(n => ({
    txt:String(n), ligado:API.tetoAtual() === n, faz:() => API.mudarTeto(n) })));

  /* formas */
  const g = $("admFormas"); g.innerHTML = "";
  API.FORMAS.forEach((f, i) => {
    const tem = API.jogador.desbloqueadas.includes(f.id);
    const b = document.createElement("button");
    b.className = "admForma" + (API.jogador.forma === f.id ? " sel" : tem ? " tem" : "");
    b.innerHTML = '<span class="e">' + f.emoji + '</span><span class="n">' + f.nome + '</span>' +
                  '<span class="t">' + ((i + 1) % 10 === 0 ? "0" : i + 1) + '</span>';
    b.title = f.habilidade;
    b.onclick = () => { API.desbloquear(f.id); API.trocarPara(f.id); API.salvar(); montar(); atualizar(); };
    g.appendChild(b);
  });
  botoes("admFormasExtra", [
    { txt:"🔓 destrancar as 13", faz:() => API.desbloquearTudo() },
    { txt:"🔒 trancar tudo de novo", perigo:true, faz:() => API.trancarTudo() },
  ]);

  /* coisas */
  fileiraDeNumeros("admPeixes",   n => "+" + n, n => API.jogo.peixes += n);
  fileiraDeNumeros("admPegadas",  n => "+" + n, n => API.jogo.pegadas += n);
  fileiraDeNumeros("admEstrelas", n => "+" + n, n => API.jogo.estrelas += n);

  /* segredos */
  botoes("admSegredos", API.jogo.portais.map(p => ({
    txt:(p.achado ? "✅ " : "🔒 ") + p.e + " " + p.txt, ligado:p.achado,
    faz:() => { fechar(); API.levarPara(p.x, p.y); API.abrirSegredo(p); } })).concat([
    { txt:"🎉 abrir os 5 de uma vez",
      faz:() => { fechar(); API.jogo.portais.forEach(p => API.abrirSegredo(p)); } },
  ]));

  /* eventos */
  botoes("admEventos", API.EVENTOS.map(e => ({
    txt:(e.titulo || "câmera passeando").toLowerCase(), dica:"fase " + e.fase,
    faz:() => { fechar(); API.forcarEvento(e.id); } })));

  /* truques */
  botoes("admTruques", [
    interruptor("atravessar parede", "fantasma", "passa por prédio, carro, tudo"),
    interruptor("voar", "voar", "segura o espaço pra subir"),
    interruptor("não morrer", "imortal", "gato gigante não te amassa mais"),
  ]);
  botoes("admTurbo",   escala("velocidade", "turbo",   [1, 2, 3, 5, 10]));
  botoes("admPulo",    escala("pulo",       "pulo",    [1, 2, 3, 5]));
  botoes("admGigante", escala("tamanho",    "gigante", [.4, 1, 2, 4, 8]));
  botoes("admZerar", [{ txt:"↩ desligar todos os truques", faz:() => API.zerarTruques() }]);

  /* fim */
  botoes("admFim", [
    { txt:"🏆 ganhar o jogo agora", faz:() => { API.desbloquearTudo(); fechar(); API.vencer(true); } },
    { txt:"🔄 cidade nova", faz:() => { API.recomecar(true); fechar(); API.comecar(false); } },
    { txt:"💣 apagar TUDO", perigo:true, faz:() => {
        if (confirm("Apagar todo o progresso do Cat City? Não dá pra voltar atrás.")) API.apagarTudo(); } },
  ]);
}

function atualizar() {
  if (!API) return;
  const f = API.faseAgora(), j = API.jogador, jo = API.jogo;
  $("admInfo").textContent =
    "fase " + f.n + " · " + f.nome + "\n" +
    "formas " + j.desbloqueadas.length + "/" + API.FORMAS.length +
      " · segredos " + jo.segredos + "/5 · " + (jo.vencido ? "já virou MEGA LARVA" : "ainda não venceu") + "\n" +
    "🐟 " + jo.peixes + " · 🐾 " + jo.pegadas + " · ⭐ " + jo.estrelas + "\n" +
    "gatos vivos " + API.quantosVivos() + " / teto " + API.tetoAtual() + "\n" +
    "você está em x " + j.x.toFixed(1) + " · y " + j.y.toFixed(1) +
      " (cidade " + Math.round(API.cidade.largura) + " × " + Math.round(API.cidade.altura) + ")";
  API.ui.montarBarraFormas(j.desbloqueadas, j.forma);
}

/* ---------------------------------------------------------------- abrir */
function abrir() {
  if (aberto) return;
  aberto = true;
  $("adm").classList.add("on");
  $("admLogin").style.display = liberado ? "none" : "block";
  $("admPainel").style.display = liberado ? "block" : "none";
  $("admErro").textContent = "";
  if (liberado) { montar(); atualizar(); }
  else { $("admSenha").value = ""; setTimeout(() => $("admSenha").focus(), 60); }
}
function fechar() {
  aberto = false;
  $("adm").classList.remove("on");
}
function entrar() {
  if ($("admSenha").value.trim() !== SENHA) {
    $("admErro").textContent = "senha errada 🙀";
    $("admSenha").value = ""; $("admSenha").focus();
    return;
  }
  liberado = true;
  $("admLogin").style.display = "none";
  $("admPainel").style.display = "block";
  montar(); atualizar();
}

export function ligarAdm(api) {
  API = api;
  $("btAdm").onclick = abrir;
  $("btAdmFechar").onclick = fechar;
  $("admEntrar").onclick = entrar;
  $("admSenha").onkeydown = e => e.stopPropagation();
  $("adm").onclick = e => { if (e.target.id === "adm") fechar(); };

  const numCampo = e => e.target && e.target.tagName === "INPUT";

  addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyA") { e.preventDefault(); aberto ? fechar() : abrir(); return; }
    if (numCampo(e)) { if (e.key === "Enter") entrar(); e.stopPropagation(); return; }
    if (aberto) {
      if (e.code === "Escape") { e.preventDefault(); e.stopPropagation(); fechar(); }
      return;
    }
    /* escrever ADMIN também abre — do jeitinho da Torre */
    if (e.key && e.key.length === 1) {
      digitado = (digitado + e.key.toUpperCase()).slice(-5);
      if (digitado === "ADMIN") { digitado = ""; abrir(); }
    }
  }, true);

  /* Enquanto o painel está aberto o jogo não recebe tecla nenhuma — senão
     digitar a senha faria o gato pular pela cidade atrás do painel. */
  for (const ev of ["keydown", "keyup"]) {
    addEventListener(ev, e => {
      if (aberto && !e.ctrlKey && e.code !== "Escape" && !numCampo(e)) e.stopPropagation();
    }, true);
  }
}

export const admAberto = () => aberto;

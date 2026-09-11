/* ==========================================================================
   CLIPY (extensão) · popup.js
   As opções, e a lista de sites onde ele foi expulso pelo ✕.
   ========================================================================== */
const PADRAO = { ligado:true, chatice:55, som:true, volume:.45, bloqueados:[] };
const $ = id => document.getElementById(id);

let conf = PADRAO;
const salvar = () => chrome.storage.local.set(conf);

function mostrar() {
  $("btLigado").textContent = conf.ligado ? "SIM" : "NÃO";
  $("btLigado").classList.toggle("on", conf.ligado);
  $("chatice").value = conf.chatice;
  $("vChatice").textContent = conf.chatice;
  $("btSom").textContent = conf.som ? "🔊" : "🔇";
  $("btSom").classList.toggle("on", conf.som);
  $("volume").value = Math.round(conf.volume * 100);

  const caixa = $("bloqueados");
  const lista = conf.bloqueados || [];
  if (!lista.length) { caixa.innerHTML = '<span class="vazio">Nenhum. Ele aparece em todos.</span>'; return; }
  caixa.innerHTML = "";
  for (const site of lista) {
    const l = document.createElement("div");
    const n = document.createElement("span"); n.textContent = site;
    const b = document.createElement("button"); b.textContent = "deixar entrar";
    b.onclick = () => {
      conf.bloqueados = conf.bloqueados.filter(x => x !== site);
      salvar(); mostrar();
    };
    l.append(n, b); caixa.appendChild(l);
  }
}

$("btLigado").onclick = () => { conf.ligado = !conf.ligado; salvar(); mostrar(); };
$("btSom").onclick = () => { conf.som = !conf.som; salvar(); mostrar(); };
$("chatice").oninput = e => { conf.chatice = +e.target.value; $("vChatice").textContent = conf.chatice; salvar(); };
$("volume").oninput = e => { conf.volume = +e.target.value / 100; salvar(); };

chrome.storage.local.get(PADRAO).then(d => { conf = Object.assign({}, PADRAO, d); mostrar(); });

/* ==========================================================================
   JojoOS · guardar.js
   A MEMÓRIA DO COMPUTADOR.

   Tudo fica no próprio aparelho (localStorage). Nada sai daqui: o JojoOS
   não tem servidor, não tem conta, não tem login. Se você abrir em outro
   computador, começa do zero — igual computador de verdade.
   ========================================================================== */

const CHAVE = "jojoos-v1";

const PADRAO = {
  tema: "dia",              // dia | noite
  papel: "quadriculado",    // quadriculado | liso | estrelas
  som: true,
  clipy: true,
  documentos: {},           // nome → texto
  lixeira: [],              // { nome, fig, quando }
  desenhos: [],             // { nome, dados, quando }
  visitas: 0,
  jaViuBemVindo: false,
  cafe: [],                 // a conversa com o Clipy
};

function ler() {
  try {
    const cru = localStorage.getItem(CHAVE);
    if (!cru) return { ...PADRAO };
    const d = JSON.parse(cru);
    return { ...PADRAO, ...(d && typeof d === "object" ? d : {}) };
  } catch (e) { return { ...PADRAO }; }
}

export const disco = ler();

let marcado = 0;
/* grava no fim do rodinho: o Paint chama isto muitas vezes seguidas e não
   vale a pena escrever no disco a cada pincelada */
export function salvar() {
  clearTimeout(marcado);
  marcado = setTimeout(gravarAgora, 220);
}
export function gravarAgora() {
  clearTimeout(marcado);
  try { localStorage.setItem(CHAVE, JSON.stringify(disco)); }
  catch (e) { /* disco cheio ou navegador anônimo: o sistema continua, só não lembra */ }
}
export function formatar() {
  try { localStorage.removeItem(CHAVE); } catch (e) {}
}

/* grava antes de a página sumir, pra não perder os últimos segundos */
addEventListener("pagehide", gravarAgora);
addEventListener("visibilitychange", () => { if (document.hidden) gravarAgora(); });

/* ---- a lixeira ---- */
export function jogarNoLixo(nome, fig) {
  disco.lixeira.push({ nome, fig: fig || "📄", quando: Date.now() });
  if (disco.lixeira.length > 60) disco.lixeira.shift();
  salvar();
}

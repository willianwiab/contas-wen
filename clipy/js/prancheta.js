/* ==========================================================================
   CLIPY · prancheta.js
   A ÁREA DE TRANSFERÊNCIA.

   O nome "Clipy" é de duas coisas ao mesmo tempo. Uma é o ajudante de clipe
   dos anos 90, que é o bichinho do outro lado da tela. A outra é um programa
   de Mac, aberto e de graça, que guarda tudo o que você copia pra você poder
   colar de novo depois — herdeiro de um programa mais antigo, o ClipMenu.

   Esta aba é a segunda coisa, feita aqui dentro do navegador: histórico do
   que você copia, atalhos de texto guardados em pastas, busca, limite de
   itens e um filtro que joga fora o que parece senha.

   E é aqui que as duas viram uma coisa só: a cada item capturado, as regras
   do cérebro olham o conteúdo e o Clipy reage — que é justamente o "gancho
   de IA no evento de novo item" que qualquer proposta de juntar as duas
   ideias descreve.

   O QUE UM SITE NÃO PODE FAZER, E POR QUÊ
   Um programa de Mac fica olhando a área de transferência o tempo todo,
   sozinho, em segundo plano. Uma página da internet NÃO pode — e ainda bem:
   senão qualquer site aberto leria a sua senha na hora em que você a
   copiasse. Aqui a captura só acontece quando VOCÊ manda: colando na página
   (Ctrl+V) ou apertando o botão de capturar. É menos prático e é muito mais
   seguro.
   ========================================================================== */

const $ = id => document.getElementById(id);

/* o que a gente joga fora sem nem guardar */
const PARECE_SEGREDO = [
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,        // cartão
  /\b(senha|password|passwd|pin|cvv|token|api[_-]?key|secret)\b\s*[:=]/i,
  /\bsk-[A-Za-z0-9]{16,}\b/,                            // chave de serviço
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

/* que tipo de coisa é este pedaço de texto */
export function tipoDoTexto(t) {
  const s = t.trim();
  if (/^https?:\/\/\S+$/i.test(s)) return { id:"link", nome:"Link", e:"🔗" };
  if (/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(s)) return { id:"email", nome:"E-mail", e:"✉️" };
  if (/^\+?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}$/.test(s)) return { id:"telefone", nome:"Telefone", e:"📞" };
  if (/^-?[\d.,]+$/.test(s) && /\d/.test(s)) return { id:"numero", nome:"Número", e:"🔢" };
  if (/^R\$\s?[\d.,]+$/i.test(s)) return { id:"dinheiro", nome:"Dinheiro", e:"💰" };
  if (/[{};]\s*$|^\s*(function|const|let|var|import|def|class|<\w+>)/m.test(s))
    return { id:"codigo", nome:"Código", e:"💻" };
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return { id:"cor", nome:"Cor", e:"🎨" };
  if (s.split(/\s+/).length > 60) return { id:"textao", nome:"Texto longo", e:"📄" };
  if (s.includes("\n")) return { id:"lista", nome:"Várias linhas", e:"📋" };
  return { id:"texto", nome:"Texto", e:"📝" };
}

/* o Clipy comenta o que você acabou de copiar — o "gancho de IA" */
const COMENTARIOS = {
  link:      ["Um link! Guardei. Continuo sem conseguir clicar.", "Link salvo. Se for de gato, eu aprovo."],
  email:     ["Um e-mail. Quer que eu comece uma mensagem com 'Prezado(a)'?"],
  telefone:  ["Telefone guardado. Já deixei no formato bonitinho na hora de colar."],
  numero:    ["Um número. Copie mais alguns que eu somo tudo pra você."],
  dinheiro:  ["Dinheiro! Copie mais valores e eu faço a conta."],
  codigo:    ["Isso é código. Eu não entendo código, mas guardo com carinho."],
  cor:       ["Uma cor! Essa aí é bonita. Todas são, eu sou de metal cinza."],
  textao:    ["Isso é um textão. Guardei inteiro, pode deixar."],
  lista:     ["Várias linhas de uma vez. Quer virar um atalho salvo?"],
  texto:     ["Guardei. Está no histórico sempre que você precisar."],
};

let contador = 0;
const novoId = pre => pre + (Date.now().toString(36)) + (++contador).toString(36);

export class Prancheta {
  constructor(aoCapturar) {
    this.historico = [];
    this.pastas = [];
    this.limite = 60;
    this.aoCapturar = aoCapturar || (() => {});
    this.busca = "";
  }

  /* ---------------------------------------------------------- capturar */
  guardar(texto, comoVeio) {
    const t = (texto || "").replace(/\s+$/, "");
    if (!t.trim()) return { ok:false, motivo:"vazio" };
    if (PARECE_SEGREDO.some(re => re.test(t)))
      return { ok:false, motivo:"segredo" };
    /* já tem igualzinho? sobe pro topo em vez de duplicar */
    const igual = this.historico.findIndex(x => x.texto === t);
    if (igual >= 0) {
      const [x] = this.historico.splice(igual, 1);
      x.quando = Date.now(); x.vezes = (x.vezes || 1) + 1;
      this.historico.unshift(x);
      return { ok:true, repetido:true, item:x };
    }
    const item = {
      id: novoId("c"),
      texto: t, quando: Date.now(), tipo: tipoDoTexto(t).id, veio: comoVeio || "colar", vezes: 1,
      fixo: false,
    };
    this.historico.unshift(item);
    this.aparar();
    return { ok:true, item };
  }
  aparar() {
    const fixos = this.historico.filter(x => x.fixo);
    const soltos = this.historico.filter(x => !x.fixo).slice(0, this.limite);
    this.historico = [...fixos, ...soltos]
      .sort((a, b) => b.quando - a.quando);
  }
  apagar(id) { this.historico = this.historico.filter(x => x.id !== id); }
  fixar(id) { const x = this.historico.find(y => y.id === id); if (x) x.fixo = !x.fixo; }
  limpar() { this.historico = this.historico.filter(x => x.fixo); }

  /* ---------------------------------------------------------- atalhos */
  novaPasta(nome) {
    /* o contador é o que garante id diferente: três pastas criadas no mesmo
       milissegundo ganhavam o mesmo id e viravam a mesma pasta */
    const p = { id: novoId("p"), nome: nome || "Nova pasta", itens: [] };
    this.pastas.push(p); return p;
  }
  novoAtalho(pastaId, nome, texto) {
    const p = this.pastas.find(x => x.id === pastaId);
    if (!p) return null;
    const a = { id: novoId("a"), nome: nome || "Sem nome", texto: texto || "" };
    p.itens.push(a); return a;
  }
  apagarAtalho(id) { for (const p of this.pastas) p.itens = p.itens.filter(a => a.id !== id); }
  apagarPasta(id) { this.pastas = this.pastas.filter(p => p.id !== id); }
  acharAtalho(id) {
    for (const p of this.pastas) { const a = p.itens.find(x => x.id === id); if (a) return a; }
    return null;
  }

  /* ---------------------------------------------------------- procurar */
  filtrado() {
    const b = this.busca.trim().toLowerCase();
    if (!b) return this.historico;
    return this.historico.filter(x => x.texto.toLowerCase().includes(b));
  }

  /* ---------------------------------------------------------- guardar */
  paraSalvar() {
    return { historico:this.historico.slice(0, 200), pastas:this.pastas, limite:this.limite };
  }
  carregarDe(d) {
    if (!d) return;
    if (Array.isArray(d.historico)) this.historico = d.historico.filter(x => x && typeof x.texto === "string");
    if (Array.isArray(d.pastas)) this.pastas = d.pastas.filter(p => p && Array.isArray(p.itens));
    if (typeof d.limite === "number") this.limite = Math.max(5, Math.min(500, d.limite));
  }
}

export function comentarioSobre(tipo) {
  const c = COMENTARIOS[tipo] || COMENTARIOS.texto;
  return c[Math.floor(Math.random() * c.length)];
}

/* atalhos que já vêm prontos, pra caixa não nascer vazia */
export const ATALHOS_DE_FABRICA = [
  { nome:"Do dia a dia", itens:[
    { nome:"Assinatura", texto:"Atenciosamente,\nJoJo" },
    { nome:"Meu e-mail", texto:"escreva-seu-email-aqui@exemplo.com" },
    { nome:"Bom dia", texto:"Bom dia! Tudo bem com você?" },
  ]},
  { nome:"Escola", itens:[
    { nome:"Cabeçalho", texto:"Nome:\nTurma:\nData:\n\n" },
    { nome:"Conclusão", texto:"Por tudo isso, concluo que " },
  ]},
  { nome:"Clipy", itens:[
    { nome:"Oi, Clipy", texto:"Oi, Clipy! Tudo bem?" },
    { nome:"Link do site", texto:"https://willianwiab.github.io/contas-wen/clipy/" },
  ]},
];

/* ==========================================================================
   CLIPY · calculadora.js
   O CLIPY RESPONDENDO DE VERDADE.

   Escreveu "1+1" no papel? Ele responde 2. Escreveu "50% de 300"? Ele
   responde 150. Escreveu "quanto é dez vezes três?" Ele responde 30.

   Isto NÃO usa eval(). eval() executaria qualquer coisa que estivesse
   escrita no papel, e o papel é texto que vem de fora — nunca se manda o
   navegador executar texto assim. Aqui a conta é lida à mão, número por
   número, sinal por sinal, com um analisador de verdade (o mesmo tipo que
   uma linguagem de programação usa pra ler código).

   O caminho é sempre este:
     1. traduzir o português pra sinais   ("dez vezes três" → "10 * 3")
     2. quebrar em pedacinhos             ("10", "*", "3")
     3. montar a conta respeitando a ordem (× antes de +, parênteses primeiro)
     4. calcular
   ========================================================================== */

/* ---------------------------------------------------------- números por extenso */
const UNIDADES = { zero:0, um:1, uma:1, dois:2, duas:2, "três":3, tres:3, quatro:4, cinco:5,
  seis:6, sete:7, oito:8, nove:9, dez:10, onze:11, doze:12, treze:13, catorze:14, quatorze:14,
  quinze:15, dezesseis:16, dezessete:17, dezoito:18, dezenove:19 };
const DEZENAS = { vinte:20, trinta:30, quarenta:40, cinquenta:50, "cinquenta":50,
  sessenta:60, setenta:70, oitenta:80, noventa:90 };
const CENTENAS = { cem:100, cento:100, duzentos:200, trezentos:300, quatrocentos:400,
  quinhentos:500, seiscentos:600, setecentos:700, oitocentos:800, novecentos:900 };

/* junta "duzentos e trinta e cinco" num número só */
function numerosPorExtenso(txt) {
  const palavras = txt.split(/\b/);
  let saida = "", grupo = null, pendente = "";
  const fecha = () => {
    if (grupo === null) return "";
    const v = grupo; grupo = null; return String(v);
  };
  const partes = txt.split(/(\s+|[^\p{L}\d,.]+)/u);
  const res = [];
  let acc = null, esperandoE = false;
  for (const p of partes) {
    const w = p.toLowerCase().trim();
    if (!w) { if (acc === null) res.push(p); continue; }
    if (w === "e" && acc !== null) { esperandoE = true; continue; }
    let v = null;
    if (w in UNIDADES) v = UNIDADES[w];
    else if (w in DEZENAS) v = DEZENAS[w];
    else if (w in CENTENAS) v = CENTENAS[w];
    else if (w === "mil") { acc = (acc || 1) * 1000; esperandoE = false; continue; }
    if (v === null) {
      /* o espaço precisa voltar: sem ele "dez vezes" virava "10vezes" e o
         "vezes" deixava de ser uma palavra inteira pro tradutor achar */
      if (acc !== null) { res.push(" " + acc + " "); acc = null; }
      if (esperandoE) { res.push(" e "); esperandoE = false; }
      res.push(p);
      continue;
    }
    acc = acc === null ? v : acc + v;
    esperandoE = false;
  }
  if (acc !== null) res.push(" " + acc + " ");
  if (esperandoE) res.push(" e ");
  return res.join("");
}

/* ---------------------------------------------------------- português → sinais */
const TROCAS = [
  [/\bao\s+quadrado\b/gi, "^2"],
  [/\bao\s+cubo\b/gi, "^3"],
  [/\belevado\s+(a|à)\s*/gi, "^"],
  [/\bpor\s*cento\s+de\b/gi, "% de"],
  [/\bpor\s*cento\b/gi, "%"],
  [/\braiz\s+quadrada\s+de\b/gi, "raiz "],
  [/\braiz\s+de\b/gi, "raiz "],
  [/\bmetade\s+de\b/gi, "0.5 * "],
  [/\bdobro\s+de\b/gi, "2 * "],
  [/\btriplo\s+de\b/gi, "3 * "],
  [/\bdividido\s+(por|pra|para)\b/gi, "/"],
  [/\bdividido\b/gi, "/"],
  [/\bsobre\b/gi, "/"],
  [/\bvezes\b/gi, "*"],
  [/\bmultiplicado\s+por\b/gi, "*"],
  [/\bmais\b/gi, "+"],
  [/\bmenos\b/gi, "-"],
  [/\bsomad?[oa]?\s+(com|a)\b/gi, "+"],
  [/\bx\b/gi, "*"],
  [/×/g, "*"], [/÷/g, "/"], [/–|—/g, "-"], [/,\s*$/g, ""],
];
/* tira o que é só enfeite da pergunta */
const ENFEITE = /^\s*(e\s+)?(a[ií],?\s*)?(clipy,?\s*)?(quanto\s+(é|e|da|dá|fica|vale)|calcule?|calcula|conta[:,]?|resultado\s+de|qual\s+(é\s+)?o?\s*(resultado|valor)\s*(de)?)\s*/i;

export function limpar(txt) {
  let t = " " + txt + " ";
  t = t.replace(ENFEITE, " ");
  t = numerosPorExtenso(t);
  for (const [de, para] of TROCAS) t = t.replace(de, para);
  t = t.replace(/[=?!.\s]+$/, "");     // "1+1=" e "1+1?" pedem a mesma coisa
  return t.trim();
}

/* ---------------------------------------------------------- pedacinhos */
/* Números em português: 1.234,56 tem ponto de milhar e vírgula decimal.
   Se só tem vírgula, ela é a decimal. Se só tem ponto, ele é decimal —
   a não ser que esteja separando grupos de três (1.234), aí é milhar. */
function lerNumero(s) {
  let t = s;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  const v = parseFloat(t);
  return isNaN(v) ? null : v;
}

function pedacos(txt) {
  const saida = [];
  let i = 0;
  while (i < txt.length) {
    const c = txt[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[\d]/.test(c)) {
      let j = i;
      while (j < txt.length && /[\d.,]/.test(txt[j])) j++;
      /* uma vírgula ou ponto no fim é pontuação, não parte do número */
      while (j > i && /[.,]/.test(txt[j - 1])) j--;
      const v = lerNumero(txt.slice(i, j));
      if (v === null) return null;
      saida.push({ t:"num", v });
      i = j;
      continue;
    }
    if ("+-*/^()%".includes(c)) { saida.push({ t:c }); i++; continue; }
    if (/^raiz\b/i.test(txt.slice(i))) { saida.push({ t:"raiz" }); i += 4; continue; }
    if (/^de\b/i.test(txt.slice(i))) { saida.push({ t:"de" }); i += 2; continue; }
    return null;                    // apareceu algo que não é conta
  }
  return saida;
}

/* ---------------------------------------------------------- montar e calcular */
/* Um analisador descendente: cada função cuida de um nível de prioridade.
   soma chama produto, produto chama potência, potência chama unário,
   unário chama o pedaço mais simples de todos. */
function analisar(ps) {
  let i = 0;
  const olha = () => ps[i];
  const come = t => (ps[i] && ps[i].t === t ? (i++, true) : false);

  function soma() {
    let v = produto();
    if (v === null) return null;
    while (olha() && (olha().t === "+" || olha().t === "-")) {
      const op = ps[i++].t;
      const d = produto();
      if (d === null) return null;
      v = op === "+" ? v + d : v - d;
    }
    return v;
  }
  function produto() {
    let v = potencia();
    if (v === null) return null;
    for (;;) {
      if (come("*")) { const d = potencia(); if (d === null) return null; v *= d; continue; }
      if (come("/")) {
        const d = potencia(); if (d === null) return null;
        if (d === 0) return { erro:"dividir por zero" };
        v /= d; continue;
      }
      /* "20% de 300" = 20/100 * 300 */
      if (olha() && olha().t === "de") { i++; const d = potencia(); if (d === null) return null; v *= d; continue; }
      break;
    }
    return v;
  }
  function potencia() {
    const v = unario();
    if (v === null) return null;
    if (come("^")) {
      const e = potencia();
      if (e === null) return null;
      return Math.pow(v, e);
    }
    return v;
  }
  function unario() {
    if (come("-")) { const v = unario(); return v === null ? null : -v; }
    if (come("+")) return unario();
    if (come("raiz")) {
      const v = unario();
      if (v === null) return null;
      if (v < 0) return { erro:"raiz de número negativo" };
      return Math.sqrt(v);
    }
    return simples();
  }
  function simples() {
    if (come("(")) {
      const v = soma();
      if (v === null || !come(")")) return null;
      return posfixo(v);
    }
    if (olha() && olha().t === "num") {
      const v = ps[i++].v;
      return posfixo(v);
    }
    return null;
  }
  /* o % vem depois do número: "50%" é 0,5 */
  function posfixo(v) {
    while (come("%")) v = v / 100;
    return v;
  }

  const r = soma();
  if (r === null || i !== ps.length) return null;
  return r;
}

/* ---------------------------------------------------------- a porta de entrada */
/* coisas que TÊM barra e sinal mas não são conta nenhuma */
const NAO_E_CONTA = [
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,             // 12/03/2026 é data, não divisão
  /\bdia\s+\d{1,2}\/\d{1,2}\b/i,               // "dia 12/03" também
  /* "10/4" sozinho continua sendo dez dividido por quatro: é o que a pessoa
     quer dizer quando escreve isso num papel de conta. Data mesmo tem o ano
     junto, ou a palavra "dia" na frente. */
  /\b\d{1,2}:\d{2}\b/,                         // 10:30 é hora
  /https?:\/\//i,                               // link
];

export function calcular(texto) {
  if (!texto || !/\d|zero|um|dois|tr[êe]s|quatro|cinco|seis|sete|oito|nove|dez|vinte|cem|mil/i.test(texto))
    return null;
  if (NAO_E_CONTA.some(re => re.test(texto))) return null;
  const limpo = limpar(texto);
  if (!limpo || !/[-+*\/^%]|raiz/.test(limpo)) return null;    // sem sinal não é conta
  const ps = pedacos(limpo);
  const temFuncao = ps && ps.some(p => p.t === "raiz");
  if (!ps || ps.length < (temFuncao ? 2 : 3)) return null;
  if (!ps.some(p => p.t === "num")) return null;
  const v = analisar(ps);
  if (v === null) return null;
  if (v && typeof v === "object" && v.erro) return { erro:v.erro, conta:limpo };
  if (!isFinite(v)) return { erro:"o número ficou grande demais", conta:limpo };
  return { valor:v, conta:limpo, texto:formatar(v) };
}

export function formatar(v) {
  if (Number.isInteger(v)) return v.toLocaleString("pt-BR");
  const arredondado = Math.round(v * 1e6) / 1e6;
  return arredondado.toLocaleString("pt-BR", { maximumFractionDigits:6 });
}

/* ---------------------------------------------------------- somar uma coluna */
/* Várias linhas com um número em cada: ele soma tudo. É a conta que mais
   aparece de verdade — lista de preço, lista de nota. */
export function somarColuna(texto) {
  const linhas = texto.split("\n").map(l => l.trim()).filter(Boolean);
  if (linhas.length < 3) return null;
  const nums = [];
  for (const l of linhas) {
    const m = l.match(/(-?[\d.]*\d(?:,\d+)?)\s*$/);
    if (!m) continue;                          // um título no meio não estraga a lista
    const v = lerNumero(m[1]);
    if (v !== null) nums.push(v);
  }
  /* precisa ser MESMO uma coluna: pelo menos três números e a maioria das
     linhas com número. Senão qualquer texto com três datas viraria uma soma. */
  if (nums.length < 3 || nums.length < linhas.length * .6) return null;
  const total = nums.reduce((a, b) => a + b, 0);
  return { total, quantos: nums.length, media: total / nums.length,
    texto: formatar(Math.round(total * 100) / 100),
    textoMedia: formatar(Math.round(total / nums.length * 100) / 100) };
}

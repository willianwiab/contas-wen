/* ==========================================================================
   CLIPY (extensão) · mundo.js
   AS ABAS, SEM ESPIONAR AS ABAS.

   O JoJo pediu: "se eu fechar uma aba, ele fala 'Ei! Eu estava lendo isso!'".
   Pra fazer isso do jeito fácil, a extensão precisaria da permissão "tabs" —
   e aí ela veria o endereço e o título de TUDO que você abre. Eu não quero
   isso. Então fiz do jeito difícil e cego:

   Cada aba que abre põe um bilhetinho aqui dentro: um número sorteado, a
   hora, e nada mais. Sem endereço, sem título. De vez em quando a aba
   atualiza a hora do próprio bilhete ("continuo viva").

   - Contando bilhete vivo → ele adivinha QUANTAS abas existem.
   - Quando uma aba vai fechar, ela deixa um aviso "saí". Se em poucos
     segundos nascer uma página nova, era só troca de página na mesma aba,
     e o aviso é apagado. Se ninguém aparecer, era fechamento de verdade →
     "EI! EU ESTAVA LENDO ISSO!"

   Ele nunca sabe QUAL aba era. Só que tinha uma. E isso é de propósito.

   Detalhe chato e real: o navegador congela os cronômetros das abas que
   estão escondidas. Então o bilhete de uma aba de fundo demora pra ser
   atualizado. Por isso o prazo de validade aqui é longo (150 segundos) —
   é melhor ele contar errado pra menos do que acusar fechamento à toa.
   ========================================================================== */

const VAZIO = { abas:{}, saidas:[], idas:[], visitas:{} };
const agora = () => Date.now();

/* prazos */
const VALE_BILHETE = 150000;   // bilhete velho demais = aba provavelmente morreu
const ERA_TROCA    = 12000;    // saída seguida de página nova = só trocou de página
const JANELA_IDAS  = 45000;    // pra medir navegação hiperativa
const JANELA_LOOP  = 180000;   // pra medir "você está preso em um loop?"

export class Mundo {
  constructor(storage) {
    this.st = storage;
    this.eu = Math.random().toString(36).slice(2, 10);
    this.host = location.hostname;
    this.abasAntes = 0;
    this.cache = null;
    this.jaSaiu = false;
    this.avisou = { dez:false, trinta:false };
  }

  async ler() {
    const d = await this.st.get({ mundo:VAZIO });
    const m = Object.assign({}, VAZIO, d.mundo || {});
    m.abas = m.abas || {}; m.saidas = m.saidas || [];
    m.idas = m.idas || []; m.visitas = m.visitas || {};
    this.cache = m;               // guarda a última foto: o saindo() depende dela
    return m;
  }
  gravar(m) { this.cache = m; return this.st.set({ mundo:m }); }

  /* ---- a página nasceu ---- */
  /* devolve a lista de coisas que ele notou no mundo: aba fechada, aba
     nova, navegação hiperativa, loop… */
  async nasci() {
     const m = await this.ler();
     const t = agora();
     const notou = [];

     /* 1. alguém saiu pouco tempo atrás? então era esta aba trocando de
        página, não um fechamento. Consome o aviso e fica quieto. */
     const recentes = m.saidas.filter(s => t - s < ERA_TROCA);
     if (recentes.length) m.saidas = m.saidas.filter(s => t - s >= ERA_TROCA).slice(-9);

     /* 2. sobrou aviso velho = fechamento de verdade */
     const velhas = m.saidas.length;
     if (velhas >= 3) { notou.push("muitasAbasFechadas"); m.saidas = []; }
     else if (velhas >= 1) { notou.push("abaFechada"); m.saidas = []; }

     /* 3. bilhetes: limpa os mortos e põe o meu */
     for (const id in m.abas) if (t - m.abas[id] > VALE_BILHETE) delete m.abas[id];
     const antes = Object.keys(m.abas).length;
     m.abas[this.eu] = t;
     this.abasAntes = Object.keys(m.abas).length;
     if (antes >= 1 && recentes.length === 0) notou.push("abaNova");
     notou.push(...this.contarAbas(this.abasAntes));

     /* 4. quantas páginas nasceram nos últimos 45 segundos */
     m.idas = m.idas.filter(x => t - x < JANELA_IDAS); m.idas.push(t);
     if (m.idas.length >= 9) { notou.push("navegacaoHiperativa"); m.idas = [t]; }

     /* 5. já viemos neste site várias vezes há pouco? */
     const v = (m.visitas[this.host] || []).filter(x => t - x < JANELA_LOOP);
     v.push(t);
     m.visitas[this.host] = v.slice(-8);
     if (v.length >= 4) notou.push("presoEmLoop");
     /* não deixa a lista de sites crescer pra sempre */
     for (const h in m.visitas) {
       m.visitas[h] = m.visitas[h].filter(x => t - x < JANELA_LOOP);
       if (!m.visitas[h].length) delete m.visitas[h];
     }

     await this.gravar(m);
     return notou;
  }

  /* ---- o batimento: "continuo viva" ---- */
  /* Também é a hora em que ele descobre que uma aba fechou, porque quem
     fecha não tem como falar depois. */
  async bater() {
    const m = await this.ler();
    const t = agora();
    const notou = [];

    const velhas = m.saidas.filter(s => t - s >= ERA_TROCA).length;
    if (velhas) {
      m.saidas = m.saidas.filter(s => t - s < ERA_TROCA);
      notou.push(velhas >= 3 ? "muitasAbasFechadas" : "abaFechada");
    }

    for (const id in m.abas) if (t - m.abas[id] > VALE_BILHETE) delete m.abas[id];
    m.abas[this.eu] = t;
    const n = Object.keys(m.abas).length;
    if (n > this.abasAntes) notou.push("abaNova");
    notou.push(...this.contarAbas(n));
    this.abasAntes = n;

    await this.gravar(m);
    return notou;
  }

  contarAbas(n) {
    const notou = [];
    if (n >= 30 && !this.avisou.trinta) { this.avisou.trinta = true; notou.push("trintaAbas"); }
    else if (n >= 10 && !this.avisou.dez) { this.avisou.dez = true; notou.push("dezAbas"); }
    if (n < 8) { this.avisou.dez = false; this.avisou.trinta = false; }
    return notou;
  }

  /* ---- a página está indo embora (fechou OU trocou de página) ---- */
  /* AQUI NÃO PODE TER await, E NEM LER ANTES DE ESCREVER.
     Quando você fecha a aba, o navegador destrói a página na hora. Se eu
     fizesse "lê, depois grava", a segunda metade nunca aconteceria — e o
     aviso de fechamento nunca seria escrito. Então eu uso a última foto que
     já estava na memória (o this.cache, atualizado a cada batimento) e
     disparo UMA escrita, seca, sem esperar resposta.
     O preço: a foto pode estar até 22 segundos velha, então o batimento de
     outra aba pode reaparecer aqui por engano. Ele se corrige sozinho no
     batimento seguinte. Pra uma piada de clipe de papel, está de bom tamanho. */
  saindo() {
    if (this.jaSaiu) return;
    this.jaSaiu = true;
    const m = this.cache ? JSON.parse(JSON.stringify(this.cache)) : Object.assign({}, VAZIO);
    m.abas = m.abas || {}; delete m.abas[this.eu];
    m.saidas = [...(m.saidas || []), agora()].slice(-9);
    try { this.st.set({ mundo:m }); } catch (e) {}
  }

  quantasAbas() { return this.abasAntes; }
}

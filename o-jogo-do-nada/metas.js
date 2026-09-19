/* =========================================================
   metas.js — as 1.000 metas de O Jogo do Nada 🏆

   Mil nomes não se escrevem à mão: seriam mil linhas do mesmo
   texto. Cada faixa tem um vocabulário próprio, e o nome sai
   de SUBSTANTIVO + COMPLEMENTO — complemento sempre começando
   com de/do/da/sem/em, que é o truque que evita o problema do
   português: "Estátua Imóvel" e "Monge Imóvel" precisariam de
   adjetivos diferentes, mas "Estátua de Sal" e "Monge de Sal"
   funcionam com qualquer palavra.

   Os títulos que o JoJo pediu por número entram por cima do
   que o gerador criou.
   ========================================================= */

const MIN = 60, HORA = 3600, DIA = 86400, SEMANA = 604800, MES = 2592000, ANO = 31536000;

/* faixa por faixa, do jeito que foi pedido: quantas metas, de
   quanto tempo até quanto tempo, e com que cara */
const FAIXAS = [
  { id:'seg',   ic:'⚡', nome:'Segundos',  fase:'Primeiros Passos · Tentação Instantânea',
    de:1,          ate:59,          n:150, cor:'#7dd3fc',
    subst:['Primeiro Pisco','Respiro','Silêncio','Suspiro','Instante','Segundo','Piscar',
           'Congelamento','Pausa','Flash','Fôlego','Estátua','Freio','Tique','Susto',
           'Gelo','Ponto','Relance','Átimo','Golpe','Pestanejo','Nó','Vácuo','Mudez','Calo'],
    compl:['de Sal','do Vazio','sem Pressa','de Pedra','em Silêncio','do Nada','sem Dedo',
           'de Gelo','do Tempo','sem Toque','de Vidro','do Ar','sem Som'] },

  { id:'min',   ic:'⏱️', nome:'Minutos',   fase:'Monge Iniciante · Teste de Paciência',
    de:MIN,        ate:59*MIN,      n:200, cor:'#5ee89a',
    subst:['Café Gelando','Fila','Espera','Chá Esfriando','Sala de Espera','Monge','Bocejo',
           'Elevador','Consulta','Ponto de Ônibus','Aula Chata','Sermão','Pausa do Café',
           'Micro-ondas','Semáforo','Cozimento','Descanso','Banho Frio','Intervalo',
           'Meditação','Sesta','Soneca','Recreio','Zen','Mantra'],
    compl:['do Vazio','sem Pressa','de Pedra','em Silêncio','do Nada','sem Fim','de Gelo',
           'do Tédio','sem Toque','do Monge','em Branco','sem Nada','de Paciência'] },

  { id:'hora',  ic:'⌛', nome:'Horas',     fase:'Vigilante do Vazio · Resolução de Ferro',
    de:HORA,       ate:23*HORA,     n:200, cor:'#ffd75e',
    subst:['Turno de Trabalho','Vigília','Coruja Noturna','Plantão','Ronda','Madrugada',
           'Sentinela','Guarda','Serão','Vigia','Expediente','Turno da Noite','Farol',
           'Vela Acesa','Relógio de Ponto','Insônia','Olho Aberto','Posto','Quarto de Hora',
           'Ronda Noturna','Silêncio da Noite','Pernoite','Alvorada','Anoitecer','Crepúsculo'],
    compl:['de Ferro','do Vazio','sem Piscar','de Pedra','em Silêncio','do Nada','sem Fim',
           'de Vidro','do Relógio','sem Toque','de Gelo','em Guarda','sem Trégua'] },

  { id:'dia',   ic:'📅', nome:'Dias',      fase:'Estátua Humana · Maratona Imóvel',
    de:DIA,        ate:6*DIA,       n:150, cor:'#f0a6ff',
    subst:['Fim de Semana Imóvel','Quarta-Feira','Segunda-Feira','Feriado','Estátua Humana',
           'Dia Inteiro','Jornada','Maratona','Terça','Quinta','Sexta','Sábado','Domingo',
           'Amanhecer','Ponteiro Parado','Calendário','Folha do Dia','Rotina','Ciclo',
           'Volta do Sol','Sombra','Móvel da Sala','Poste','Monumento','Manequim'],
    compl:['de Pedra','do Vazio','sem Mexer','em Silêncio','do Nada','sem Fim','de Gesso',
           'de Mármore','sem Toque','de Bronze','em Pé','sem Pressa','de Estátua'] },

  { id:'sem',   ic:'🗓️', nome:'Semanas',   fase:'Mestre do Calendário · Quarentena do Nada',
    de:SEMANA,     ate:3*SEMANA,    n:100, cor:'#ff9e2c',
    subst:['Férias do Nada','Quinze Dias','Quarentena','Semana Santa','Recesso','Retiro',
           'Licença','Isolamento','Tripla Semana','Descanso Longo','Sabático','Pausa Longa',
           'Clausura','Eremita','Cabana','Retiro Espiritual','Refúgio','Silêncio Profundo',
           'Meia Quinzena','Quinzena','Sete Dias','Catorze Dias','Ciclo Semanal','Lua Nova','Vigília Longa'],
    compl:['no Vazio','de Pedra','sem Mexer','em Silêncio','do Nada','sem Fim','de Eremita',
           'sem Ninguém','sem Toque','de Clausura','em Paz','sem Pressa','do Calendário'] },

  { id:'mes',   ic:'🌙', nome:'1 Mês',     fase:'Senhor do Mês · 30 Dias de Pedra',
    de:MES,        ate:2*MES,       n:70,  cor:'#a5b4fc',
    subst:['Mestre de Trinta Dias','Quarentena Absoluta','O Segundo Mês','Lua Cheia','Mês Inteiro',
           'Ciclo Lunar','Hibernação','Inverno','Estação','Mês de Pedra','Trinta Sóis',
           'Folhinha','Página do Calendário','Mês Perdido','Lua Minguante','Sono Profundo',
           'Casulo','Crisálida','Semente','Raiz'],
    compl:['de Pedra','no Vazio','sem Mexer','em Silêncio','do Nada','sem Fim','de Mármore',
           'sem Ninguém','sem Toque','de Granito','em Paz','sem Pressa','do Tempo'] },

  { id:'tri',   ic:'🌿', nome:'3 Meses',   fase:'Era Trimestral · O Grande Vazio',
    de:3*MES,      ate:11*MES,      n:50,  cor:'#86efac',
    subst:['O Trimestre Sagrado','Metade do Ano','Reta Final do Ano','Estação Inteira','Safra',
           'Semestre','Primavera','Verão','Outono','Inverno','Colheita','Trimestre',
           'Grande Vazio','Nove Luas','Gestação','Bimestre Dobrado','Quarta Parte',
           'Terço do Ano','Longa Estação','Vazio Profundo'],
    compl:['do Vazio','de Pedra','sem Mexer','em Silêncio','do Nada','sem Fim','de Musgo',
           'sem Ninguém','sem Toque','de Raiz','em Paz','sem Pressa','do Grande Nada'] },

  { id:'ano',   ic:'🏆', nome:'1 Ano',     fase:'Entidade Lendária · Era dos Tempos',
    de:ANO,        ate:9*ANO,       n:40,  cor:'#fbbf24',
    subst:['Aniversário de Pedra','Entidade Lendária','Volta ao Sol','Ano Inteiro','Lenda',
           'Era','Anuário','Ciclo do Sol','Mito','Relíquia','Monumento','Marco',
           'Ano Perdido','Calendário Vencido','Testemunha','Guardião','Vigia do Ano',
           'Fóssil Novo','Anel de Árvore','Safra Antiga'],
    compl:['do Vazio','de Pedra','sem Mexer','em Silêncio','do Nada','sem Fim','de Lenda',
           'sem Ninguém','sem Toque','de Mármore','dos Tempos','sem Pressa','do Esquecimento'] },

  { id:'dec',   ic:'👑', nome:'10 Anos',   fase:'Década Imóvel · Ancestral Parado',
    de:10*ANO,     ate:24*ANO,      n:30,  cor:'#c084fc',
    subst:['A Década Imóvel','Duas Décadas Sem Tocar','Ancestral','Fóssil','Ruína',
           'Múmia','Relíquia Antiga','Estalactite','Carvalho','Pedra Milenar','Sítio Arqueológico',
           'Dinossauro','Âmbar','Geleira','Montanha','Vinte e Quatro Anos','Catedral',
           'Muralha','Obelisco','Pirâmide'],
    compl:['do Vazio','de Pedra','sem Mexer','em Silêncio','do Nada','sem Fim','de Musgo',
           'sem Ninguém','sem Toque','dos Tempos','de Era','sem Pressa','do Esquecimento'] },

  { id:'deus',  ic:'🪐', nome:'25+ Anos',  fase:'Deus do Nada · Imortalidade Atemporal',
    de:25*ANO,     ate:100*ANO,     n:10,  cor:'#f472b6',
    subst:['Jubileu de Prata','Meio Século do Nada','O Deus do Vazio Eterno','Imortal',
           'Eternidade','Constelação','Buraco Negro','Galáxia','Cosmos','Big Bang'],
    compl:['do Nada','do Vazio Eterno','sem Fim','fora do Tempo','de Pedra','sem Ninguém',
           'do Silêncio','sem Toque','dos Séculos','da Eternidade'] }
];

/* os títulos que vieram pedidos por número, na mão */
const NOMES_PEDIDOS = {
  1:'Primeiro Pisco', 75:'Estátua de Sal', 150:'Quase Um Minuto',
  151:'Café Gelando', 250:'Mestre da Procrastinação', 350:'Uma Hora Parado',
  351:'Turno de Trabalho', 450:'Coruja Noturna', 550:'Um Dia Inteiro',
  551:'Fim de Semana Imóvel', 620:'Quarta-Feira de Pedra', 700:'Quase Uma Semana',
  701:'Férias do Nada', 750:'Quinze Dias no Vazio', 800:'Tripla Semana',
  801:'Mestre de Trinta Dias', 840:'Quarentena Absoluta', 870:'O Segundo Mês',
  871:'O Trimestre Sagrado', 890:'Metade do Ano', 920:'Reta Final do Ano',
  921:'Aniversário de Pedra', 940:'Meio Século de Espera', 960:'Uma Década Quase Lá',
  961:'A Década Imóvel', 980:'Duas Décadas Sem Tocar', 990:'Vinte e Quatro Anos',
  991:'Jubileu de Prata', 999:'Meio Século do Nada', 1000:'O Deus do Vazio Eterno'
};

/* ---------------------------------------------------------
   MONTAR AS MIL
   --------------------------------------------------------- */
const METAS = [];
(() => {
  /* os títulos pedidos entram na reserva ANTES de tudo: sem isso o
     gerador criava "Quarta-Feira de Pedra" na meta 577 e a pedida
     chegava igual na 620 */
  const usados = new Set(Object.values(NOMES_PEDIDOS));
  let n = 0;

  for(const f of FAIXAS){
    f.primeira = n + 1;
    for(let i = 0; i < f.n; i++){
      n++;
      /* o tempo anda em passo igual do começo ao fim da faixa */
      const seg = f.n === 1 ? f.de : f.de + (f.ate - f.de) * (i / (f.n - 1));

      let nome = NOMES_PEDIDOS[n];
      if(!nome){
        /* (i mod A, i mod B) só se repete depois de mmc(A,B) — com 25 e 13
           isso é 325, mais que qualquer faixa. Se ainda assim o nome
           estiver na reserva, anda no complemento até achar um livre. */
        const s = f.subst[i % f.subst.length];
        for(let k = 0; k < f.compl.length; k++){
          const tentativa = `${s} ${f.compl[(i + k) % f.compl.length]}`;
          if(!usados.has(tentativa)){ nome = tentativa; break; }
        }
        nome = nome || `${s} ${f.compl[i % f.compl.length]} (${n})`;
      }
      usados.add(nome);
      METAS.push({ n, nome, seg, faixa:f.id, ic:f.ic, cor:f.cor });
    }
    f.ultima = n;
  }
})();

/* ---------------------------------------------------------
   TEMPO EM PALAVRA
   --------------------------------------------------------- */
function tempoLongo(s){
  if(s < 60)     return (Math.round(s * 10) / 10).toFixed(1).replace('.', ',') + 's';
  if(s < HORA){  const m = Math.floor(s/60), r = Math.round(s%60);
                 return r ? `${m}min ${r}s` : `${m}min`; }
  if(s < DIA){   const h = Math.floor(s/HORA), m = Math.round((s%HORA)/60);
                 return m ? `${h}h ${m}min` : `${h}h`; }
  if(s < SEMANA){const d = Math.floor(s/DIA), h = Math.round((s%DIA)/HORA);
                 return h ? `${d}d ${h}h` : `${d} dia${d>1?'s':''}`; }
  if(s < MES){   const w = Math.floor(s/SEMANA), d = Math.round((s%SEMANA)/DIA);
                 return d ? `${w}sem ${d}d` : `${w} semana${w>1?'s':''}`; }
  if(s < ANO){   const me = Math.floor(s/MES), d = Math.round((s%MES)/DIA);
                 return d ? `${me}m ${d}d` : `${me} ${me>1?'meses':'mês'}`; }
  const a = Math.floor(s/ANO), me = Math.round((s%ANO)/MES);
  return me ? `${a}a ${me}m` : `${a} ano${a>1?'s':''}`;
}

/* quantas metas o recorde já derrubou — as metas sobem em ordem
   de tempo, então basta contar quantas cabem embaixo do recorde */
const metasFeitas = recorde => METAS.filter(m => recorde >= m.seg).length;
const proximaMeta = recorde => METAS.find(m => recorde < m.seg) || null;

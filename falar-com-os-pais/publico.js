/* =========================================================
   publico.js — envio pelo servidor público (MQTT por
   WebSocket), pra quem não quer criar conta nenhuma.

   Fala MQTT na mão, sem baixar biblioteca: monta os pacotes
   byte a byte. Cada recado vai num assunto só dele, marcado
   como "retido", então o servidor guarda e entrega pra quem
   abrir depois. O conteúdo vai embaralhado com a senha da
   família (a mesma criptografia do nuvem.js).
   ========================================================= */

/* Se um servidor não deixar passar, o site tenta o próximo sozinho. */
const SERVIDORES_PUBLICOS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://test.mosquitto.org:8081/mqtt'
];
let servidorAtual = 0;
const diario = [];   // últimas coisas que aconteceram, pra mostrar nos ajustes

function anotar(txt){
  diario.unshift(new Date().toLocaleTimeString('pt-BR') + ' — ' + txt);
  diario.length = Math.min(diario.length, 8);
  const caixa = document.getElementById('diarioNuvem');
  if(caixa) caixa.innerHTML = diario.map(l => `<div>${escapar(l)}</div>`).join('');
}
const VALIDADE_RETIDO = 30 * 86400000;   // recado retido mais velho que isso é apagado

let teia = null, pingTimer = null, tentativasPublico = 0, sobra = new Uint8Array(0);

const modoPublico = () => (dados.nuvem || {}).modo === 'publico';
const assuntoBase = () => `falafamilia/${dados.nuvem.sala}`;

/* ---------- pacotinhos MQTT ---------- */
function tamanhoVariavel(n){
  const saida = [];
  do { let b = n % 128; n = Math.floor(n / 128); if(n > 0) b |= 128; saida.push(b); } while(n > 0);
  return saida;
}
function comTamanho(txt){
  const b = new TextEncoder().encode(txt);
  return [b.length >> 8, b.length & 255, ...b];
}
function pacote(tipo, flags, corpo){
  return new Uint8Array([ (tipo << 4) | flags, ...tamanhoVariavel(corpo.length), ...corpo ]);
}
function pacoteConectar(id){
  return pacote(1, 0, [ ...comTamanho('MQTT'), 4, 0x02, 0, 60, ...comTamanho(id) ]);
}
function pacoteAssinar(assunto, pid){
  return pacote(8, 2, [ pid >> 8, pid & 255, ...comTamanho(assunto), 0 ]);
}
function pacotePublicar(assunto, texto, retido){
  const corpoTxt = new TextEncoder().encode(texto);
  return pacote(3, retido ? 1 : 0, [ ...comTamanho(assunto), ...corpoTxt ]);
}

/* ---------- ler o que chega ---------- */
function juntar(a, b){
  const c = new Uint8Array(a.length + b.length);
  c.set(a); c.set(b, a.length);
  return c;
}
function lerPacotes(){
  while(sobra.length >= 2){
    let mult = 1, tam = 0, i = 1, byte;
    do{
      if(i >= sobra.length) return;              // pacote ainda não chegou inteiro
      byte = sobra[i++];
      tam += (byte & 127) * mult; mult *= 128;
    }while(byte & 128);
    if(sobra.length < i + tam) return;
    const tipo = sobra[0] >> 4;
    const corpo = sobra.slice(i, i + tam);
    sobra = sobra.slice(i + tam);
    tratarPacote(tipo, corpo, sobra.length);
  }
}
async function tratarPacote(tipo, corpo){
  if(tipo === 2){                                 // CONNACK
    if(corpo[1] !== 0){ marcarNuvem('erro', 'o servidor recusou (código ' + corpo[1] + ')'); return; }
    tentativasPublico = 0;
    CONVERSAS.forEach((c, i) => teia.send(pacoteAssinar(`${assuntoBase()}/${c.id}/#`, i + 1)));
    dados.nuvem.servidorOk = enderecoPublico(); salvar();
    anotar('pronto! ouvindo a sala ' + dados.nuvem.sala);
    marcarNuvem('ligado');
    clearInterval(pingTimer);
    pingTimer = setInterval(() => { try{ teia.send(new Uint8Array([0xC0, 0])); }catch(e){} }, 45000);
  }
  if(tipo === 3){                                 // PUBLISH
    const tamAssunto = (corpo[0] << 8) | corpo[1];
    const assunto = new TextDecoder().decode(corpo.slice(2, 2 + tamAssunto));
    const texto = new TextDecoder().decode(corpo.slice(2 + tamAssunto));
    if(!texto) return;                            // recado apagado
    let pacoteJson; try{ pacoteJson = JSON.parse(texto); }catch(e){ return; }
    const claro = await desembaralhar(pacoteJson);
    if(!claro || !claro.msg) return;
    if(Date.now() - claro.msg.ts > VALIDADE_RETIDO){ apagarRetido(assunto); return; }
    const novo = await guardarRecebido(claro.conversa, claro.msg);
    if(!novo) return;
    salvar(); desenharContatos();
    if(atual === claro.conversa) desenharMensagens();
    atualizarBolinhaDoIcone();
    if(claro.msg.tipo === 'sos' && !souEu(claro.msg.de)){
      /* só toca o alarme se for de agora: SOS velho guardado no banco não
         pode assustar quem abrir o site dias depois */
      if(Date.now() - claro.msg.ts < 600000) chegouPedidoDeAjuda(claro.msg);
      return;
    }
    const p = PESSOAS[claro.msg.de] || PESSOAS.jojo;
    blim(false);
    avisar(`${p.emoji} ${p.nome}`, textoDe(claro.msg), claro.conversa);
  }
}
function apagarRetido(assunto){
  try{ teia.send(pacotePublicar(assunto, '', true)); }catch(e){}
}

/* ---------- ligar / desligar ---------- */
function enderecoPublico(){
  return dados.nuvem.servidor || SERVIDORES_PUBLICOS[servidorAtual % SERVIDORES_PUBLICOS.length];
}

function ligarPublico(){
  desligarPublico();
  if(!dados.nuvem || !dados.nuvem.sala || !dados.nuvem.senha) return;
  marcarNuvem('ligando');
  const endereco = enderecoPublico();
  anotar('tentando ' + endereco.split('/')[2]);
  const id = 'fam' + Math.random().toString(36).slice(2, 12);
  try{
    teia = new WebSocket(endereco, 'mqtt');
  }catch(e){ marcarNuvem('erro', 'não achei o servidor'); trocarServidor(); return; }

  /* se em 8 segundos não conectar, tenta o próximo servidor */
  const desistir = setTimeout(() => {
    if(teia && teia.readyState !== 1){ anotar('demorou demais, trocando de servidor'); trocarServidor(); }
  }, 8000);
  teia.addEventListener('open', () => clearTimeout(desistir));
  teia.binaryType = 'arraybuffer';
  sobra = new Uint8Array(0);

  teia.onopen = () => { anotar('conectei, dizendo oi pro servidor'); try{ teia.send(pacoteConectar(id)); }catch(e){} };
  teia.onmessage = ev => { sobra = juntar(sobra, new Uint8Array(ev.data)); lerPacotes(); };
  teia.onerror = () => { anotar('deu erro na conexão'); marcarNuvem('erro', 'não consegui falar com o servidor'); };
  teia.onclose = () => {
    clearInterval(pingTimer);
    if(!modoPublico()) return;
    anotar('a conexão caiu');
    marcarNuvem('erro', 'caiu — tentando de novo');
    if(tentativasPublico > 0 && tentativasPublico % 2 === 0) servidorAtual++;
    const espera = Math.min(30000, 2000 * Math.pow(2, tentativasPublico++));
    setTimeout(() => { if(modoPublico()) ligarPublico(); }, espera);
  };
}

function desligarPublico(){
  clearInterval(pingTimer);
  if(teia){
    try{ teia.onclose = null; teia.close(); }catch(e){}
    teia = null;
  }
}

async function mandarPeloPublico(conversa, msg){
  if(!teia || teia.readyState !== 1) return false;
  const copia = Object.assign({}, msg);
  delete copia.naNuvem;
  if(copia.id && !copia.b64){
    const blob = await pegarAudio(copia.id);
    if(blob && blob.size <= LIMITE_ANEXO) copia.b64 = await blobParaTexto(blob);
    else if(blob) copia.semArquivo = true;
  }
  if(copia.b64 && copia.b64.length > LIMITE_ANEXO * 1.4){ delete copia.b64; copia.semArquivo = true; }
  const uid = copia.uid || (copia.uid = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  msg.uid = uid;
  try{
    const embrulho = await embaralhar({ conversa, msg: copia });
    teia.send(pacotePublicar(`${assuntoBase()}/${conversa}/${uid}`, JSON.stringify(embrulho), true));
    return true;
  }catch(e){ marcarNuvem('erro', e.message); return false; }
}


function trocarServidor(){
  desligarPublico();
  servidorAtual++;
  if(modoPublico()) setTimeout(ligarPublico, 400);
}

/* ---------- teste de conexão ---------- */
/* Manda um recadinho de teste pra própria sala e vê se ele volta.
   Se voltar, o caminho está inteiro: conectar, assinar, mandar e receber. */
function testarPublico(){
  const passos = document.getElementById('passosTeste');
  if(!passos) return;
  const marcar = (txt, estado) => {
    passos.insertAdjacentHTML('beforeend', `<div class="passo ${estado}">${txt}</div>`);
  };
  passos.innerHTML = '';
  marcar('1. Conectando no servidor...', 'indo');

  if(!teia || teia.readyState !== 1){
    ligarPublico();
    marcar('conexão estava desligada — liguei agora, espera uns segundos e testa de novo', 'ruim');
    return;
  }
  passos.innerHTML = '';
  marcar('1. Conectado no servidor ' + enderecoPublico().split('/')[2], 'bom');
  marcar('2. Ouvindo a sala ' + dados.nuvem.sala, 'bom');

  const marca = 'teste-' + Math.random().toString(36).slice(2, 8);
  let voltou = false;
  const ouvinte = ev => {
    const t = new TextDecoder().decode(new Uint8Array(ev.data));
    if(t.includes(marca)) voltou = true;
  };
  teia.addEventListener('message', ouvinte);
  try{
    teia.send(pacotePublicar(`${assuntoBase()}/${CONVERSAS[0].id}/teste`, JSON.stringify({ marca }), false));
    marcar('3. Mandei um recado de teste', 'bom');
  }catch(e){ marcar('3. Não consegui mandar: ' + e.message, 'ruim'); return; }

  setTimeout(() => {
    teia.removeEventListener('message', ouvinte);
    if(voltou){
      marcar('4. O recado voltou! O envio está funcionando ✅', 'bom');
      marcar('Se mesmo assim não chega no outro aparelho, é porque lá o código da sala ou a senha estão diferentes — usa o 📋 convite.', 'aviso');
    }else{
      marcar('4. O recado NÃO voltou 😕', 'ruim');
      marcar('Esse servidor não deixou passar. Aperta “trocar de servidor” e testa de novo.', 'aviso');
    }
  }, 2500);
}

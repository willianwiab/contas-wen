# 🎒 Fala, Turma!

O irmão do [Fala, Família](../falar-com-os-pais/) — mesma cara, mesmo roxo — mas pra turma
da escola. Um mural com **recado, lição, prova, combinar de sair, enquete, passeio,
vaquinha e aniversário**.

## A regra que manda neste app

**Nem todo mundo da turma tem celular.** Isso não é um detalhe: é o que decide como o app
foi feito.

- **Abre em qualquer navegador** — computador de casa, computador da escola, celular
  emprestado do irmão. Sem instalar, sem conta, sem senha.
- **📱 Modo emprestado** — quem entra pelo aparelho de outra pessoa marca uma caixinha, e
  aí nada é gravado ali: vai pra `sessionStorage` e some quando a aba fecha.
- **🖨️ Imprimir o mural** — pra quem não tem aparelho nenhum, alguém imprime a semana e
  leva no papel. É a razão de este app existir do jeito que existe.

## 🏫 A ficha da turma

Quem cria põe o **nome da escola** e o **professor(a)** junto com o nome da turma. Isso
**viaja dentro do convite**, então a turma inteira vê a mesma coisa — se ficasse só no
aparelho de quem criou, cada um veria uma coisa diferente.

Aparece no topo do app, na tela 👥, no texto do convite e **no mural impresso** — que é
justamente o que chega em quem não tem aparelho. Qualquer um da turma pode arrumar depois
(não tem dono aqui); pra valer pra todo mundo, é mandar o convite de novo.

Turma sem escola não fica com um traço solto na tela: a linha simplesmente não aparece.

## Como as pessoas entram

Sem cadastro: quem cria a turma manda um **link de convite**; quem recebe abre, escreve o
nome e está dentro. O link carrega o código da turma e o **segredo** que abre os recados.

O código tem 8 letras sorteadas de um alfabeto **sem I, O, 0 e 1** — as que todo mundo
confunde na hora de copiar.

## Segurança

Os recados vão **embaralhados** (AES-GCM, chave derivada por PBKDF2 com 210 000 voltas) do
**segredo que viaja no convite** — não do código da turma, que anda de mão em mão. O banco
guarda, mas não entende.

**O nome também não pode ser a chave.** Se a pasta da conversa se chamasse `Ana~Jojo`, o
banco não leria o que foi escrito, mas leria **quem conversa com quem** — e isso já é
informação demais. Então a chave de cada conversa particular e de cada foto de perfil é um
SHA-256 do segredo da turma + os nomes. Quem tem o convite calcula igual; quem não tem só
vê letra solta (`9f08662474cbae16…`).

O que chega do banco foi escrito por outro aparelho, então passa por `avisoConfere()`:
dono, horário, tipo, tamanho e formato das opções são conferidos antes de virar tela.

> Usa o mesmo banco do Fala, Família, num caminho separado (`turmas/<código>`). **Isso é
> conta e cota do adulto da casa** — vale combinar com ele antes de espalhar o convite pra
> turma inteira.

## O que tem no mural

Cada recado mostra o bichinho e a cor de quem escreveu (nascem do nome, então são sempre
os mesmos), o tipo numa etiqueta colorida, 😀 reagir com emoji, ↩️ responder, 👀 quem já
viu, 📌 fixar no topo e 🚨 avisar que o recado é ruim.
Enquete desenha a **barra de proporção** por trás de cada resposta. Endereço escrito vira
link — a detecção roda depois do escape do HTML e só aceita `http`, `https` e `www.`.

No alto da tela ficam **o dia de hoje por extenso e a hora**, e abaixo os avisos que não
podem passar batido: **prova amanhã** e **aniversário desta semana**.

### O que dá pra fazer

| | |
|---|---|
| ⏰ **Contagem pra prova** | Bola grande com "É AMANHÃ!" / "faltam 3 dias" |
| 🔔 **Aviso na véspera** | Notificação no celular, uma vez por dia por prova |
| 📸 **Foto do quadro** | Encolhida no próprio aparelho antes de sair (≈300 KB) |
| 📷 **Álbum da turma** | Todas as fotos do mural numa tela só |
| ✅ **Já fiz a lição** | Marca **só neste aparelho** — não vai pro banco nem pros outros |
| 🎂 **Aniversários** | Conta pro **próximo**, não pro nascimento |
| 😀 **Reagir** | 👍 ❤️ 😂 😮 😢 🎉, uma por pessoa, e chega nos outros aparelhos |
| ↩️ **Responder** | O recado citado aparece dentro da resposta |
| 💬 **Conversa particular** | Só entre duas pessoas — com o aviso honesto abaixo |
| 🎉 **Passeio** | Quem vai / talvez / não vai, e **quem leva o quê** |
| 💰 **Vaquinha** | Barra de quanto já juntou. O dinheiro **não passa pelo app** |
| 🌧️ **Vai chover na saída?** | Hoje, amanhã, depois, 1 semana e 1 mês |
| 🚌 **Como cada um vai** | Ônibus, carro, a pé, bici — e quem precisa/pode dar carona |
| 📍 **Onde é o encontro** | O lugar vai junto do recado e abre no mapa |
| 🚨 **Recado ruim** | Com 2 avisos ele some da frente de todo mundo (dá pra abrir mesmo assim) |
| 🙂 **Foto de perfil** | Cada um põe a sua; quem não põe fica com o bichinho |
| 🚨 **Gente, tô em perigo** | Alarme, localização e aviso no celular da turma |
| 🔔 **Falta pro sinal** | Contagem pro recreio e pra saída, de segundo em segundo |
| 📆 **O mês** | Grade com provas, passeios, aniversários e feriados |
| 🏖️ **Férias** | Barrinha que enche, e os próximos feriados nacionais |
| 💛 **Dizer obrigado** | Estrelinha pra quem te ajudou |
| 😀 **Como tu tá hoje** | Humor da turma, sem nome |
| 🏠 **Cheguei em casa** | Avisa a turma que chegou bem |
| 🔎 **Achados e perdidos** | Com foto e botão de "é meu!" |
| 🎵 **Playlist** | Cada um põe uma música |
| 🔊 **Ler em voz alta** | O recado inteiro, com quem escreveu e a data |
| 🌐 **Traduzir** | 8 línguas, sem chave de API nenhuma |
| 🔍 **Procurar** | Sem ligar pra maiúscula nem pra acento |
| 👨‍👩‍👧 **Folha pros pais** | A semana num papel, com linha pra assinar |
| ✍️ **Autorização do passeio** | Papel pronto pra mãe assinar |
| 📶 **Modo internet ruim** | As fotos só abrem se tu pedir |
| 👑 **Modo adm** | Apagar recado ruim, trancar o mural, silenciar, tirar da turma |

## 👑 O modo adm

### Por que chave pública, e não uma senha compartilhada

A primeira ideia foi assinar as ordens com a senha do adm (HMAC). Só que aí **quem não sabe
a senha não consegue conferir a assinatura** — e sobram duas saídas ruins: ou todo mundo
sabe a senha (aí não é senha), ou os outros conferem por um valor público, que qualquer um
copiaria. A segunda foi exatamente o furo que apareceu no primeiro teste.

Então é um **par de chaves ECDSA P-256**:

- a **chave de conferir** (pública) vai no mural, à vista de todos;
- a **chave de assinar** (privada) vai no mural também, mas **trancada com AES-GCM** numa
  chave derivada da senha do adm (PBKDF2, 210 000 voltas). Sem a senha ela não abre.

Resultado: **qualquer aparelho confere sozinho** se a ordem é do adm de verdade, e só quem
sabe a senha consegue assinar. A senha nunca sai do aparelho — nem pro banco, nem pro
`localStorage`.

A **lista de quem é adm também vai assinada**: sem isso qualquer um escrevia o próprio nome
nela e aparecia de coroa. Lista com assinatura torta é descartada, e vale a última que
estava certa. E a assinatura é o que manda: `obedecer()` não pergunta se o nome está na
lista, pergunta se a assinatura confere.

Ordem com mais de 7 dias não vale mais, pra ninguém guardar uma ordem antiga e soltar
depois.

### O que o adm pode

Apagar qualquer recado (some do banco também, senão voltava na sincronização seguinte),
resolver denúncias, trancar o mural, silenciar por 1h/1dia/1semana, tirar da turma
(a pessoa continua **lendo**, só não escreve), fixar, limpar o que passou de 30 dias,
coroar mais gente e trocar a senha (o que invalida as ordens antigas).

### O que o adm NÃO pode — de propósito

**Ler conversa particular de ninguém** e **ver quem respondeu o quê no 😀 humor.** Não
existe função nenhuma pra isso no app, e o teste confirma: uma adm de verdade não vê a
conversa de duas outras pessoas, mesmo depois de puxar tudo que o banco tem.

### ⚠️ Não é um cofre — é uma chave de zelador

A assinatura impede que alguém **finja ser adm**, e isso é de verdade. Mas quem souber
mexer no código do navegador ainda consegue ignorar a conferência no próprio aparelho e
escrever direto no banco. Só um servidor com contas e regras resolveria, e este app usa um
banco de graça, sem conta nenhuma.

**É por isso que o adm não vê nada privado.** Se burlar não dá acesso a segredo nenhum, o
pior que acontece é bagunça no mural — e bagunça a gente arruma. Isso está escrito dentro
do app, na própria tela do adm.

### 🔔 Os horários são da turma, não do aparelho

Quem arruma, arruma pra todo mundo: eles viajam pelo mural num recado especial
(`tipo: 'sinos'`) que fica **fora da lista e fora da contagem dos filtros**. O mesmo vale
pro último dia de aula (`tipo: 'ferias'`).

`"25:99"` tem cara de hora e não é hora nenhuma. Conferir só o formato deixaria passar, e
a contagem daria número maluco — então `horaVale()` confere o intervalo, e horário torto
que chegue de outro aparelho é ignorado em vez de quebrar a tela.

### 😀 Anônimo de verdade — e quando não dá

A resposta vai com a chave embaralhada do nome + do dia: o banco não sabe de quem é. Mas
**"sem nome" numa turma de 4 pessoas não engana ninguém** — então o resultado só aparece a
partir de **3 respostas**, e o app diz na tela por quê. Quando tem gente mal, ele avisa que
tem, sem dizer quem, e manda contar pra um adulto se for sério.

### 💛 Obrigado só soma

Não tem ranking. Um ranking viraria também uma lista de quem ninguém agradeceu, e não é
isso que a gente quer pendurado na parede.

### 🌐 Traduzir e 🔊 ler, sem pagar nada

Ler em voz alta é o `speechSynthesis` que já vem no navegador, um tiquinho devagar — é pra
quem tem dificuldade de ler. Ele fala **quem escreveu, o tipo e a data**, não só o texto.

Traduzir tenta o tradutor embutido do navegador; alguns navegadores **têm** esse tradutor
mas ficam baixando o idioma pra sempre, então tem tempo limite de 6 s e depois cai no
Google Tradutor numa aba. Nenhuma chave de API em lugar nenhum — o repositório é público.

### 🎌 Feriados: a conta da Páscoa

Carnaval, Sexta-feira Santa e Corpus Christi andam com a Páscoa, então a Páscoa é
calculada (algoritmo de Gauss) em vez de escrita numa lista que venceria todo ano. Os
feriados **da cidade** e as emendas da escola não estão aí — esses a turma marca no mural,
e o app diz isso.

### 🚨 O botão de perigo

**O que ele é:** avisa a TURMA. Alarme alto, notificação no celular, faixa vermelha na
frente de tudo, e **a localização de quem pediu** (precisão de ~1 metro, atualizada a cada
25 s enquanto o pedido está de pé).

**O que ele NÃO é**, e isto está escrito na tela em cima do botão: ele **não chama a
polícia** e não avisa a mãe de ninguém. Os colegas podem estar no silencioso, sem bateria
ou sem celular — este app inteiro existe assumindo isso. Por isso **190 / 192 / 193 vêm
antes do botão**, não depois, e "grita por um adulto perto de ti" é a primeira frase.

Decisões que valem explicar:

- **São dois toques pra mandar** (o botão vermelho e depois o "MANDAR AGORA"). Um toque só
  dispararia no bolso, e um alarme que grita à toa é um alarme que todo mundo aprende a
  ignorar — aí no dia que for de verdade, ninguém corre. Pelo mesmo motivo o botão pulsa
  o *brilho*, não o tamanho: um botão que se mexe é difícil de acertar com a mão tremendo.
- **O aviso sai antes do GPS.** Um GPS lento seguraria o socorro inteiro; a localização
  entra na batida seguinte.
- **Quem toca em "🏃 Tô indo" leva um recado antes de sair:** avisa um adulto agora, não vá
  sozinho, e liga 190/192 se for grave. Chegar junto é bom; chegar junto *com um adulto* é
  melhor.
- **O pedido vence sozinho em 2 horas**, e "💚 Já tô bem" para o alarme de todo mundo. Não
  é um rastreador: a localização só sai enquanto o pedido está de pé.
- **No mural, socorro não é um recado**: não dá pra reagir com 😂, fixar nem denunciar a
  emergência de alguém. Ele mostra só o estado — pedindo agora, já está bem, ou venceu.


### 🙂 A foto de perfil

Ela é **minúscula de propósito**: 160px, cortada quadrada, uns 2 KB. Uma turma de 30
pessoas com foto de celular seriam 120 MB toda vez que alguém abrisse o app — na internet
da escola isso nunca ia carregar.

E o app **não fica puxando as fotos toda hora**: só busca quando aparece um nome sem cara,
ou de 5 em 5 minutos.

O que chega de outro aparelho passa por `caraConfere()`: só `data:image/png|jpeg|webp` em
base64, até 60 000 letras, com dono de nome válido. `javascript:`, HTML e `data:text/html`
são recusados.

### 🌧️ O tempo, e até onde dá pra saber

Cinco botões: **hoje, amanhã, depois de amanhã, 1 semana e 1 mês**. Nos três primeiros vale
a **hora que tu sai da escola**; nos dois últimos é dia inteiro, então o campo da hora some.

**"1 mês" não entrega um mês** — e o app fala isso na cara: o Open-Meteo só enxerga
**16 dias**, e depois de uns 7 já é mais chute do que conta. Melhor prometer 16 dias de
verdade do que 30 dias inventados.

Cada resposta fica guardada **1 hora**: o tempo não muda de minuto em minuto e a internet
da escola agradece. Trocar a hora da saída só derruba o que era por hora — a semana e o
mês continuam valendo.

### 🔄 O app se conserta sozinho

O celular guarda o site pra abrir sem internet, e às vezes fica **preso numa versão velha**
— a pessoa não vê as coisas novas de jeito nenhum. Então o app pergunta ao servidor
(`versao.json`, com `cache: no-store`, e o service worker é proibido de guardar esse
arquivo) qual versão está no ar. Se for outra, joga fora todo o cache, desregistra o
service worker e recarrega — **uma vez só**. Se mesmo assim não pegar, ele para e avisa em
vez de virar um pião de recarga.

**Se mesmo assim travar:** `fala-turma/consertar.html` é a página de socorro. Ela apaga
todos os caches, desregistra o service worker e devolve pro app com um endereço novo
(`./?nova=<agora>`), que não existe em cache nenhum. **Não apaga os recados nem a turma** —
esses ficam no `localStorage`, que ela não toca. O service worker é proibido de guardar
essa página, senão ela viraria parte do próprio problema.

### 💬 O que a conversa particular NÃO é

Ela é embaralhada com a **mesma chave da turma**. Quem tem o convite tem a chave — então é
particular na tela, não é segredo de verdade, e o app fala isso em cima da lista. Coisa
séria se fala pessoalmente.

Mensagem nova chega **mesmo com a conversa fechada** (uma bolinha vermelha no atalho 💬):
sem isso, quem escrevesse pra ti não aparecia em lugar nenhum e tu nunca ia saber.

### 🚨 Recado ruim

Denunciar não apaga nada e não chama ninguém: com **2 avisos** o recado sai da frente de
todo mundo, com um "ver mesmo assim" pra quem quiser. O aviso na tela diz o que importa —
**se for coisa séria, conta pra um adulto**; o app não substitui isso.

Os filtros mostram **quantos tem de cada tipo**: sem isso a pessoa toca num filtro vazio
sem saber e parece que o app perdeu os recados.

## 👥 Quem está na turma

Não existe lista de membros no banco — ninguém "se cadastra". A turma **é quem apareceu no
mural**: a lista nasce de quem escreveu, votou, reagiu, marcou que viu, disse que vai no passeio,
pôs na vaquinha ou escolheu como vai pra escola. A mesma tela
mostra o **código de 8 letras**, pra ditar em voz alta pra quem não recebeu o link.

## Arquivos

| Arquivo | Pra que serve |
|---|---|
| `index.html` | As telas e o visual (as mesmas cores do Fala, Família) |
| `turma.js` | Entrar, o mural, a nuvem, a criptografia e a impressão |
| `turma-mais.js` | Foto do quadro, álbum, conversa particular, transporte, tempo e aniversários |
| `turma-cara.js` | A foto de perfil e o "pôr no celular" |
| `turma-socorro.js` | 🚨 o botão de perigo, a sirene e a localização ao vivo |
| `turma-escola.js` | 🔔 o sinal, 📆 o mês, 🏖️ férias, 🔍 procurar, 📶 modo internet ruim |
| `turma-adm.js` | 👑 o modo adm: as chaves, as ordens assinadas e a tela |
| `turma-junto.js` | 💛 obrigado, 😀 humor, 🏠 cheguei, 🔎 achados, 🎵 playlist, 🔊 ler, 🌐 traduzir, folhas |
| `manifest.webmanifest` + `icone-*.png` | O que faz virar app instalável |
| `versao.json` | Qual versão está no ar, pro app se atualizar sozinho |
| `consertar.html` | Página de socorro: limpa o cache preso, sem apagar os recados |
| `sw.js` | Abrir sem internet — a rede da escola costuma ser ruim |

`turma-mais.js` e `turma-cara.js` carregam **antes** de `turma.js`: o `turma.js` liga os
botões assim que roda, e um botão só liga se a função já existir.

## 📲 Pôr no celular (Android e iPhone)

O app é um **PWA**: instala pelo próprio navegador, sem loja.

- **Android (Chrome):** ⋮ → *Instalar app*. O Chrome também oferece sozinho, e aí o botão
  **📲 Instalar agora** aparece dentro do app (é o `beforeinstallprompt` guardado).
- **iPhone/iPad (Safari):** botão de compartilhar → *Adicionar à Tela de Início*. O iOS não
  oferece nada sozinho — por isso a tela ensina o caminho na mão.
- **Computador (Chrome/Edge):** ícone de instalar na barra de endereço.

Depois de instalado tem ícone próprio, abre sem barra de navegador (`display: standalone`),
tem atalhos de "Escrever" e "Álbum" ao segurar o ícone, e funciona sem internet.

Os ícones são **PNG de verdade** (192, 512, 180 pro iOS e um *maskable* com folga de 12%,
porque o Android corta as pontas em círculo). SVG sozinho não basta: o iOS ignora.

**Play Store e App Store ficam de fora** — precisam de conta de desenvolvedor paga, de um
Mac no caso da Apple, e de documento de adulto.

## O que foi testado de verdade

327 checagens em dois navegadores ao mesmo tempo (Playwright), com um Firebase de mentira e
localização simulada: recado chegando de um aparelho no outro, reação, resposta, passeio,
vaquinha, conversa particular, denúncia, modo emprestado, o mural impresso, a foto de
perfil viajando de um aparelho pro outro, a escola viajando dentro do convite e o
manifesto com todos os ícones respondendo.

> ⚠️ **Ao publicar uma versão nova, mexe no `versao.json` junto.** É por ele que os
> aparelhos descobrem que precisam se atualizar.

**O que não deu pra testar de verdade:** a caixa onde este app foi feito não alcança o
`firebaseio.com` nem o `api.open-meteo.com`. O Firebase foi testado contra um de mentira
com as mesmas respostas, e o tempo contra uma resposta gravada do Open-Meteo. Na primeira
vez que rodar no celular de verdade, vale conferir esses dois.

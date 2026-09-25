# 🟣 Ditto's Pokédex

Os **1025 Pokémon**, com quem já chegou no **Pokémon GO**, quem ainda não chegou ❌ e quem
você já pegou ✅.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/dittospokedex/

O nome e a lista vieram de quem pediu: os nomes do #001 ao #1025, com um ❌ do lado de
quem ainda não tem no jogo. O site é essa lista virada coisa de tocar.

## O que dá pra fazer

- **Ver todos**, com a foto de cada um. Quem não tem no GO fica cinza e com ❌.
- **Filtrar**: todos, tem no GO, não tem no GO, peguei, falta pegar. E por geração.
- **Procurar** por nome ou número. Acento, maiúscula, ponto e traço não atrapalham
  (`mr mime`, `porygonz`, `nidoran♀` e `029` acham o que devem).
- **Marcar "Peguei!"** e ver o placar subir: quantos você pegou dos que existem no GO.
- **Ditto, se transforma!** sorteia um Pokémon. Se tiver filtro ligado, sorteia só entre
  os que estão na tela.

## A lista envelhece, então dá pra corrigir

O Pokémon GO ganha Pokémon novo o tempo todo, e uma lista escrita à mão fica velha. Por
isso cada Pokémon tem o botão **"Já chegou no GO!"** (ou o contrário). A correção fica
guardada no aparelho, vale por cima da lista, e tem "voltar pra lista" pra desfazer.

Marcar que um Pokémon **não** tem no GO tira o ✅ dele: não dá pra ter pego o que não
existe no jogo, e o placar mentiria.

## De onde vêm as coisas

- **Nomes e ❌**: escritos à mão, dentro do `index.html`. Nada é buscado de fora.
- **Fotos**: as imagens do projeto PokeAPI, direto do GitHub deles. Sem internet, no
  lugar da foto aparece o número numa bolinha, não um quadrado quebrado.
- **O que você pegou**: fica no aparelho (`localStorage`). Não tem cadastro nem servidor.

Funciona sem internet depois de aberto (menos as fotos), e tem o mesmo botão de
"buscar a versão mais nova" no rodapé que o ButterPoke e o RaroDex.

## Formas

Alguns Pokémon têm formas diferentes, e no GO às vezes só algumas saíram. O **Rotom** é
o primeiro: estava com ❌ na lista, mas ele tem no GO, só que **não todas as formas**. Na
página dele aparecem as 6 (normal, Calor, Lavagem, Gelo, Ventilador e Corte), cada uma
com o seu ✅. Marcar uma forma também marca o Rotom como pego.

Também têm formas as **regionais**: 🌴 Alola, ⚔️ Galar, 🏯 Hisui e 🌺 Paldea. Cada
Pokémon mostra a forma normal e a de cada região (o Meowth tem três: normal, Alola e
Galar). O filtro **🌍 Com formas** mostra só eles.

Pra pôr formas em outro Pokémon é só acrescentar o número no `REGIOES`, ou um item novo
no `FORMAS`, no `index.html`.

## Recomeçar do zero

No rodapé tem o botão **🗑️ Recomeçar do zero**: apaga todos os ✅, as formas marcadas e
as correções de "chegou no GO". Ele pergunta antes, porque não tem volta.

## Especiais e o 🏆 Top mais raros

Cada Pokémon tem uma parte **Especiais** pra marcar o que o seu tem: ✨ Shiny, 🎭 Fantasia,
🌟 XXL, 🔹 XXS, 🧬 Clone, 🍀 Lucky, 🤝 Trocado, 💯 Hundo, 0️⃣ Nundo, 🌍 🎟️ 🎖️ fundos, e como
pegou (🥚 ovo, 🎁 pesquisa, ⚔️ raid, 🚀 Shadow, 🧼 Purificado, 🏆 evento, 📸 Snapshot,
🥇 movimento legado). Quem não anda junto se desmarca sozinho: Hundo e Nundo, XXL e XXS,
Shadow e Purificado, Shadow e Lucky/Trocado (Shadow não dá pra trocar).

Cada especial vale **🔥 pontos de raridade**, contados em "bits": 1 em 500 dá uns 9,
1 em 4096 dá 12, e somar os pontos é multiplicar as chances. O Hundo tem desconto quando
o jogo garante IV mínimo: troca lucky (12/12/12) é 1 em 64, raid/ovo/pesquisa (10/10/10)
é 1 em 216.

O **🏆 Top mais raros** tem duas abas: **Os meus** (os 20 que mais valem do que você marcou)
e **No jogo** (as combinações famosas, medidas com a mesma régua). As chances de IV são
conta de verdade; as de shiny e os pontos das outras coisas são chute, e o site diz isso.

## 🔊 O som de cada Pokémon

Na página de cada Pokémon tem **🔊 Ouvir o som**: toca o grito dele, que vem do projeto
PokeAPI (o mesmo das fotos). Se o som novo falhar, tenta o antigo; se os dois falharem,
a tela avisa. Os arquivos são `.ogg`, que iPhone antigo pode não tocar. O **Ditto, se
transforma!** também toca o som do Pokémon em que ele virou.

## Tipos, evoluções, Quem é?, medalhas, amigo e modo shiny

- **Tipos e fraquezas**: cada Pokémon mostra o tipo, de quem ele leva muito dano, o que ele
  aguenta e contra quem os golpes do tipo dele são fortes. Tem filtro por tipo. Os tipos, as
  evoluções e a tabela vêm do banco do Pokémon Showdown (`@pkmn/dex`), copiados pra dentro
  do `index.html`, então funciona sem internet. A conta é a dos jogos principais; no GO os
  números mudam (o dobro vira 1,6x, "não sente nada" vira "resiste muito"), mas quem é forte
  e quem é fraco é igual. São os tipos da forma normal: forma regional pode ter outro.
- **Evoluções**: a família inteira, com os ramos (Eevee mostra os 8). Toque pra ir.
- **🎮 Quem é?**: sombra preta, o som e quatro nomes. Sequência vale mais pontos, e o
  recorde fica guardado. Sorteia entre os que estão na tela, então dá pra jogar só Kanto.
- **🏅 Medalhas**: 27, de "Primeiro!" até "Tudo de Paldea". Quando ganha uma, aparece um
  aviso. O "recomeçar" tira as medalhas junto.
- **🤝 Amigo**: o código `DITTO1.` guarda nome, quem pegou (um mapa de bits) e os especiais.
  Colar o código do amigo só mostra e compara; nunca mexe na sua coleção.
- **✨ Modo shiny**: o botão lá em cima troca todas as fotos pela shiny.

## Doces, parceiro e tipos das formas (do próprio Pokémon GO)

Estes vêm do **masterfile** do Pokémon GO, o arquivo de dados do jogo, pelo pacote
`pogo-masterfile-types` (atualizado junto com o jogo). Foram copiados pra dentro do
`index.html`:

- **Evoluções**: embaixo de cada Pokémon da família aparece o que precisa no GO pra chegar
  nele: 🍬 doces, 🪨 item (Pedra Sinnoh, Pedra do Rei…), 🧲 isca, 🚶 km de parceiro,
  ☀️ dia / 🌙 noite, ♀/♂, 🙃 celular de cabeça pra baixo (Inkay), 📜 missão, 🔄 de graça
  se trocar. Quando o GO não tem aquela evolução, diz isso.
- **Parceiro**: quantos km andando junto pra ganhar 1 doce.
- **Tipos das formas**: cada forma mostra o tipo dela no GO, e avisa quando é diferente do
  normal (o Vulpix de Alola é Gelo). O Tauros de Paldea virou três: Combate, Chamas e
  Aquático.

**Ovos não entraram**: o que sai de cada ovo não está no arquivo do jogo, muda a cada
temporada e evento. Uma lista fixa ia ficar errada em poucas semanas.

## Versão 9: coleção de verdade

- **Três estados** em todo lugar: ❌ não chegou no GO, 🟡 chegou mas falta pegar, ✅ você
  tem. Na página de cada um, o resumo "✨ Shiny · 🍀 Lucky · 💯 Hundo" com ✅ ou ❌.
- **Quem é?** virou jogo: 😊 Fácil (Kanto), 😎 Médio (todos), 🔥 Difícil (5ª geração pra
  frente, digitando). Dá pra escolher entre 4 ou digitar o nome, e um errinho de digitação
  em nome comprido vale. +100 por acerto, aviso nos 5, 10, 20 e 50 seguidos, recorde
  guardado. "Formas menos conhecidas" não deu: as fotos das formas não têm número fixo no
  projeto das imagens.
- **Dois tipos no filtro**: Água + Voador acha o Gyarados. Um terceiro troca o primeiro.
- **Shiny que tenho / Shiny que faltam** nos filtros.
- **42 medalhas** ("12 / 42 medalhas desbloqueadas"), com Lucky Hunter, Pokédex 100%,
  Sequência de 50, Todos os Rotom, Família Eevee…
- **Amigo sem nome**: o código agora leva só a coleção. A comparação vira tabela (Pokémon,
  Shiny, Lucky, Hundo, Shadow) e três listas: 🟢 você tem e ele não, 🔵 ele tem e você não,
  🟣 os dois têm. Um código curto tipo `JOJO-7F92K` precisaria de servidor, e o site não tem.

## ❤️ Favoritos

Na página de cada Pokémon tem **🤍 Favoritar**. O favorito ganha um ❤️ no canto da
cartinha, e o filtro **❤️ Favoritos** mostra só eles. É só gosto: não conta no placar nem
marca como pego. Duas medalhas novas (1 e 10 favoritos), e o "Recomeçar do zero" apaga
junto.

## Som no iPhone

O som não tocava em alguns celulares. Dois motivos: os gritos do PokeAPI são `.ogg`, que
iPhone não toca; e quando o primeiro falhava, o site tentava o próximo sozinho, mas o
celular só deixa tocar som no toque da pessoa, então a segunda tentativa era bloqueada.

Agora o site pergunta pro navegador se ele toca `.ogg` **antes** de tocar. Se não toca, vai
direto no `.mp3` do Pokémon Showdown (`play.pokemonshowdown.com/audio/cries/<nome>.mp3`).
Se toca, tenta o `.ogg` novo, o `.mp3` e o `.ogg` antigo, nessa ordem. Se o celular
bloquear o som, a tela diz pra tocar no 🔊.

## Convite pro ButterPoke

Depois de **2 minutos** com o site na tela, aparece "Gostou de ver Pokémon?" com o endereço e
um botão pro ButterPoke (pra quem gosta de TCG). Não aparece sempre:

- nunca no meio de uma folha aberta (espera fechar o Pokémon ou o jogo);
- no máximo uma vez a cada **3 dias** ("Agora não" só fecha);
- **"Não, obrigado"** faz nunca mais aparecer, e ir pro ButterPoke também.

## ⚡ Formas de batalha e 🧑‍🤝‍🧑 NPCs

- **Formas de batalha** na página de cada Pokémon (259 têm alguma): 🔴 Dynamax, 🟣 Mega
  (inclusive X/Y), 🟥 Gigantamax, 🟠 Primal, 🟩 Origem, 🟪 Encarnada / 🟧 Therian, 👑 Coroado,
  🔷 Fusão, ⚫ Ultra Burst, 🌊 Battle Bond, 🟨 Cardume, 🟦 Totem, 💚 Zygarde Completo,
  🌌 Eternamax. Cada uma com ✅ e dizendo se tem no Pokémon GO. Quais formas existem vem do
  Pokémon Showdown; o "tem no GO" vem do masterfile do jogo (Mega/Primal pelas
  mega-evoluções, Dynamax/Gigantamax pelas Batalhas Max, o resto pelas formas que existem lá),
  e só aparece se o próprio Pokémon já chegou no GO. Filtro "⚡ Formas de batalha" e
  3 medalhas novas.
- **❓ O que é cada uma?**: página explicando todas, inclusive Tera, Movimento Z e Poder Z,
  que são só dos jogos principais.
- **NPCs do GO**: Professor Willow, Blanche, Candela, Spark, Rhi, os Recrutas, Arlo, Cliff,
  Sierra e Giovanni, com o que cada um faz. E dá pra escolher o seu time, que aparece do
  lado do placar.

## ⭐ Lendários e 👤 conta

- **Lendários**: cada Pokémon tem a classe dele, das tags do Pokémon Showdown: ⭐ Lendário
  (71), 🌟 Mítico (23), 🌀 Ultra Besta (11), ⏳ Paradoxo (20; os 1020–1023 vieram sem tag
  e foram marcados à mão). Selo na página, estrelinha do lado do número, filtros e 4
  medalhas.
- **Conta**, igual à do ButterPoke: não é cadastro de verdade (sem servidor não dá pra
  guardar senha com segurança, e login de mentira seria pior que não ter). É um perfil no
  aparelho: nome, símbolo e fundo, que viram um **cartão de treinador** (Pokémon, Shiny,
  Lucky, Hundo, Lendas, Medalhas, time, recorde e os favoritos) e um "Olá, Nome!" no topo.
  O **código da conta** (`DITTOCONTA1.`) leva tudo pra outro aparelho, e colar **junta**,
  nunca apaga. Esse código leva o nome, então é pra dar pra si mesmo; pra comparar com
  amigo continua o 🤝 Amigo, que não leva nada pessoal. Colar um código de amigo no lugar
  da conta dá recado explicando.

## Versão 15: tamanho, Pokémon do dia, mais jogos, desejos, time, cores e configurações

- **📏 Tamanho e peso** na página de cada um, e quantos Dittos isso dá ("1,7 m · 90,5 kg —
  5,7 Dittos de altura, 23 de peso"). Altura do masterfile do GO, peso do Showdown.
- **🎲 Pokémon do dia**: sai da data, então é o mesmo pra todo mundo naquele dia.
- **Jogos**: o Quem é? ganhou abas: 🧩 **Qual é o tipo?** e 🔢 **Qual é o número?**
  (4 opções, números perto do certo pra não ficar fácil), com as mesmas dificuldades.
- **🏆 Ranking**: cada partida (do abrir até fechar ou trocar de jogo) entra no histórico
  com data; o ranking mostra as 5 melhores de cada jogo.
- **🎯 Lista de desejos**: "Quero pegar!" na página, 🎯 na cartinha, filtro, e quando você
  pega ele sai da lista com "Desejo realizado!".
- **👥 Meu time de batalha**: 3 Pokémon por liga (Grande até 1500 PC, Ultra até 2500,
  Mestra sem limite), dá pra pôr pelo nome ou pela página do Pokémon. O site soma o time e
  avisa de que tipo tomar cuidado (2 ou mais fracos) e o que ele aguenta bem.
- **⚙️ Configurações**: 🎨 cor do site (Ditto, Pikachu, Charizard, Squirtle, Bulbasaur,
  Gengar, Jigglypuff; só troca a cor de destaque), 🔊 tocar o som sozinho ao abrir um
  Pokémon (só quando abre outro, não quando a página redesenha), ✨ modo shiny e 🌓 claro,
  escuro ou automático.
- 5 medalhas novas; a conta leva desejos e times; o "Recomeçar" limpa tudo isso também
  (as configurações ficam).

## Versão 16: ferramentas, doces, álbum, jogo do som, sons esquisitos e baixar o GO

- **🧰 Ferramentas** (um botão só pra não lotar a tela):
  - 🗓️ **Eventos**: anote nome, datas e uma nota; aparece "acontecendo agora", "faltam N
    dias" e "já passaram".
  - 🥚 **Meus ovos**: até 9 (o máximo do jogo), com os km andados e "🐣 Chocou!".
  - 🔍 **Comparar**: dois Pokémon lado a lado (tipo, altura, peso, PC máximo, fraquezas,
    classe, se você tem) e quem leva vantagem nos tipos.
  - 🗺️ **Regiões**: quanto você tem de cada uma; tocar filtra a lista por ela.
  - 🧮 **Calculadora de PC**: a conta do jogo com os números do masterfile (base + IV,
    multiplicador de cada nível; meio nível usa a média dos quadrados). Conferida com o
    Mewtwo 100%: 4178 no nível 40, 4724 no 50. Diz também até que nível cabe em cada liga.
  - 🎛️ **Sons esquisitos**: o grito com Web Audio: 🐿️ esquilo, 🐢 lento, 👹 monstro,
    🔁 ao contrário, 🏔️ eco e 🤖 robô, mais 🎲 sortear e uma lista dos que a gente acha
    mais esquisitos. Se não der pra baixar o som, o rápido e o lento ainda funcionam.
- Na página de cada Pokémon: **💪 PC máximo** (nível 40 e 50), **🍬 Meus doces** (por
  família, como no jogo, e diz se já dá pra evoluir), **📸 Pôr no álbum** (6 que aparecem
  no cartão de treinador), 🔍 Comparar e 🧮 Calcular PC.
- 🎵 **De quem é esse som?**: nova aba nos jogos, só com o som.
- 📲 **Baixar Pokémon GO**: links das lojas oficiais (Google Play e App Store), com o do
  seu celular destacado e o aviso de pedir ajuda a um adulto se tiver menos de 13 anos.
- 3 medalhas novas, a conta leva álbum/eventos/ovos/doces, avisos empilham em vez de
  ficar um em cima do outro.

## O pôster do mais raro

A aba **Os meus** do 🏆 Top já ordenava tudo pelos pontos, então o mais raro sempre esteve
ali — só que escrito **do mesmo tamanho do vigésimo**. Quem abre o Top quer ver *o* mais
raro, não procurar por ele.

Agora o primeiro sai da fila e vira pôster: figura grande, o nome, o apelido quando tem
(**Shundo!**, Lucky Hundo!…), os emojis das marcas e os pontos.

E, embaixo, **de onde saiu cada ponto**: *"Shiny (+9) · 100% (Hundo) (+12)"*. Dizer só "é o
mais raro" não ensina nada; mostrar a conta ensina — e deixa a pessoa conferir se eu somei
direito.

Ele **continua no 1º lugar da lista** atrás do pôster. Tirar de lá faria a contagem pular
do 2 pro 1, e aí a lista mentiria sobre o tamanho dela.

# 🐈 CAT CITY

Uma cidade normal. Ruas, prédios, calçadas, postes, semáforos, placas, carros
parados, um parque, becos, lojas. Gente indo trabalhar.

E gatos. **Os gatos estão errados.**

Você começa como um gato normal e vai virando coisas que não deviam existir:
gato-bola, gato-larva, gato-carro, gato-trem, gato-maçã, gato-árvore, gato de
perna gigante — e, se achar o portal, a **MEGA LARVA**.

▶️ **Jogar:** https://willianwiab.github.io/contas-wen/cat-city/

## De onde veio

Duas referências, dadas pelo JoJo:

- **Toadled**, pela estrutura: um bicho pequeno, uma barra que enche, formas
  cada vez mais absurdas e upgrades no meio.
- **Três fotos de gatos deformados** (do universo do Cyriak), que são a
  **referência visual principal**. O que elas ensinam, e o jogo copia:
  - o gato é um **tabby com branco** — cabeça e costas rajadas, peito, focinho
    e patas brancos;
  - **as pernas não são pernas: são gatos inteiros pendurados de cabeça pra
    baixo**, andando;
  - a versão "melhorada" tem **duas cabeças** no mesmo corpo comprido e uns dez
    gatos-perna embaixo;
  - a **mega larva** é uma cabeça enorme com um corpo feito de **nacos de gato
    empacotados em fileiras**;
  - e o fundo é sempre uma cidade comum, desfocada. O contraste é o piada.

## Sobre os gatos: eles NÃO são emoji

O gato é desenhado por código como se fosse uma **foto**: gradiente de pelo,
mil e quinhentos fiapos curtos de pelo em três tons, listras de tabby só na
parte escura, máscara branca no focinho, olho com íris, **pupila em fenda**,
brilho e reflexo, focinho rosa, bigodes e um escurecido nas bordas (que é o que
foto tem e desenho não). Emoji só aparece nos ícones da interface.

**E dá pra trocar pelas fotos de verdade.** Basta pôr os arquivos em
`assets/cats/` (veja o `LEIA-ME.md` de lá) — o jogo detecta sozinho e passa a
usar as fotos, sem mexer em uma linha de código. Todas as 13 formas continuam
funcionando, porque **elas são deformações da mesma figura**: esticar, achatar,
repetir e empilhar.

## As 13 formas (e o que cada uma FAZ)

| | Forma | Habilidade (SHIFT) |
| --- | --- | --- |
| 🐈 | Gato Normal | miar — os gatos por perto vêm ver |
| ⚪ | Gato Bola Pequeno | rolar |
| 🔵 | Gato Bola | rolar forte, quebra caixa |
| 😾 | Gato Bola com Rosto | quicar |
| 🐛 | Gato Larva Pequeno | esgueirar — o corpo afina e passa por vão estreito |
| 🪱 | Gato Larva | esgueirar rápido |
| 🚗 | Gato Carro | acelerar e derrapar (o dobro de velocidade) |
| 🚃 | Gato Trem | buzinar e arrebentar barreira |
| 🍎 | Gato Maçã | rolar pesado |
| 🌳 | Gato Árvore | enraizar — fica parado, vira plataforma e alcança o alto |
| 🦵 | Gato de Perna Gigante | passo gigante — alcança longe e derruba tudo em volta |
| 🕷️ | Gato de Perna Melhor | passo enorme, alcance dobrado |
| 🐛 | **MEGA LARVA** | ESMAGAR — atravessa prédio |

Nenhuma é só skin: cada uma muda raio de colisão, velocidade, força do pulo,
massa, o que quebra e se passa por vão estreito.

## A cidade que vira gato

Cinco fases, e elas chegam conforme você acha formas e segredos:

1. **Cidade Normal** — poucos gatos, tudo no lugar.
2. **A Cidade dos Gatos** — começam a aparecer gatos diferentes.
3. **Caos** — eles não param de se multiplicar.
4. **Metamorfose** — os carros viram gato-carro, as árvores criam rosto, os
   prédios ficam cobertos de gato (inclusive pendurados de cabeça pra baixo).
5. **MEGA LARVA** — não tem mais cidade.

O céu escurece e enche de gato junto.

## Os 9 eventos

Um gato gigante atravessando a rua · todos se multiplicando (1→2→4→8…) · os
gatos se juntando numa larva · um gato gigante passando na frente da câmera ·
todos os carros virando gato · as árvores virando gato · o céu cheio de gatos ·
a cidade tomada · e a **MEGA LARVA**.

## Os 5 segredos

O beco dos gatos · a sala secreta · o botão gigante (só uma perna muito grande
alcança) · a área onde todo mundo fica gigante · e o **portal da MEGA LARVA**,
que precisa de 9 formas pra abrir. Achar segredo desbloqueia forma.

## Controles

| | |
| --- | --- |
| **W A S D** ou setas | andar |
| **ESPAÇO** | pular |
| **SHIFT** | a habilidade da forma |
| **E** | usar / pegar / entrar |
| **Q** | forma anterior · **1…9 0 - =** forma direta |
| **ESC** | pausar |
| **Ctrl + Shift + A** | modo adm |
| 🎮 | controle: analógico anda, A pula, X poder, B usa, Y troca de forma |
| 📱 | celular: arraste do lado esquerdo, botões do lado direito |

## Modo adm

**Senha: 1234.** Abre pelo cadeadinho 🔒 no rodapé do menu, com **Ctrl+Shift+A**,
ou escrevendo **ADMIN** com o jogo rodando — igual à Torre de Emojis.

Os botões de número são os mesmos que o Jojo pediu lá:
**1, 10, 15, 25, 100, 200, 300, 400, 500 e 1000**.

| grupo | o que faz |
| --- | --- |
| 🐈 gatos | fazem nascer N gatos em volta de você; multiplicar (1x e 3x), espalhar 100 pela cidade, colocar um gato GIGANTE do seu lado, limpar todos |
| teto | 60 a **3000** gatos ao mesmo tempo (as opções normais param em 900) |
| 🐾 formas | as 13 numa grade: clicar destranca **e** vira aquilo na hora; destrancar as 13 ou trancar tudo de novo |
| 🐟 🐾 ⭐ | somar peixes, pegadas e estrelas |
| 🗝 segredos | te leva até cada um dos 5 e abre; ou abre os 5 de uma vez |
| 🌀 eventos | força qualquer um dos 9 agora |
| ✨ truques | atravessar parede, voar, não morrer; velocidade x1…x10, pulo x1…x5, tamanho x0,4…x8 |
| 🏁 fim | ganhar o jogo, cidade nova, apagar tudo |

Os truques mexem no jogo de verdade, não só no desenho: o tamanho muda o raio de
colisão, a altura e a massa (a câmera afasta junto), e o fantasma desliga a
colisão inteira. Eles **não** ficam salvos: recarregar a página devolve tudo ao
normal, e a senha é pedida de novo. O que o adm destranca (formas, segredos,
peixes) fica salvo como qualquer progresso.

## Por que Canvas 2D e não Three.js

O pedido sugeria Three.js. A escolha foi outra, de propósito:

1. **A deformação é o jogo.** "Esticar o gato pra virar larva", "esticar numa
   direção pra virar perna", "juntar vários pra virar mega larva" — em 2D isso
   é uma transformação de desenho, de graça. Em 3D seria treze malhas.
2. **As referências são fotos**, e foto é uma imagem chata. Colar imagem chata
   deformada é exatamente o que o Canvas faz melhor.
3. **Roda em computador comum.** Sem WebGL, sem shader, sem GPU boa: 39 FPS com
   320 gatos vivos e a cidade inteira desenhada, medido no teste.
4. **Sem dependência externa** — o jogo abre offline, como os outros do JoJo.

A câmera é de terceira pessoa mesmo assim: a cidade é vista de cima e de trás
(o eixo y encolhe, o z levanta), tudo é desenhado de trás pra frente, e a
câmera **afasta sozinha** quando o bicho cresce.

## Como os milhares de gatos não derretem o computador

- **Pool fixo.** Os gatos nunca são criados nem destruídos, só ligados e
  desligados. O array tem tamanho fixo desde o começo do jogo.
- **Teto.** Existe um número máximo de gatos vivos (ajustável nas opções, 60 a
  900). Passou disso, o mais velho é reciclado.
- **LOD.** Perto: gato inteiro, andando e balançando. Longe: a figura sem
  balanço. Muito longe: quatro pixels.
- **IA por quadro alternado.** Quem está a mais de 60 metros pensa 1 vez a cada
  4 quadros, com o dt multiplicado — anda igual e custa um quarto.
- **Colisão só entre vizinhos.** Gato só empurra gato num raio de 22 metros do
  jogador, e cada um só testa contra os 6 seguintes da lista. Sem isso seria n².

## Estrutura

```
cat-city/
  index.html · style.css
  js/main.js        laço, mundo desenhado, itens, segredos, menus
  js/sprites.js     O GATO (e o carregador das fotos de verdade)
  js/formas.js      as 13 formas: corpo, habilidade e desenho
  js/city.js        geração da cidade e a corrupção dela
  js/player.js      o gato do jogador e os poderes
  js/cats.js        NPCs, pool, multiplicação e LOD
  js/physics.js     colisão, empurrão, quique, gravidade
  js/camera.js      terceira pessoa e a projeção
  js/events.js      os 9 eventos surreais
  js/ui.js          HUD, fases e telas
  js/audio.js       todos os sons, gerados na hora
  js/adm.js         o painel de administrador (senha 1234)
  assets/cats/      ← as fotos entram aqui
```

## Testando

Precisa de http (o jogo usa módulos ES):

```
python3 -m http.server 8822    # na raiz do repositório
npm i playwright-core
node teste-catcity.js
node teste-adm.js
```

**21 checagens**: a cidade nasce inteira, o menu começa a partida, WASD anda
mesmo, o espaço pula, o gato não atravessa prédio, trocar de forma muda o
gameplay (não só o desenho), as formas das fotos têm o número certo de
gatos-perna e cabeças, o SHIFT dá o impulso, a multiplicação faz 1→2→4 sem
estourar o pool, o evento do gato gigante acontece, os segredos desbloqueiam
formas, o portal vira MEGA LARVA e ganha, e o progresso sobrevive ao recarregar.
Uma delas mede o **FPS com a cidade cheia**.

`teste-adm.js` tem mais **27 checagens** só do modo adm: senha errada não entra,
cada grupo de botões faz o que promete, e — o que importa — os truques mudam o
jogo e não só o botão: com "atravessar parede" ligado o gato fica *dentro* do
prédio, com "não morrer" o gato gigante não derruba, o tamanho x8 muda o raio de
colisão, e com o painel aberto as teclas não vazam pro gato lá atrás.

## O que ainda dá pra fazer

O jogo está jogável e fechável. As próximas coisas na fila seriam: mais coisa
pra quebrar (vitrine, hidrante, banca), o gato-trem carregando os gatos da
colônia atrás de verdade, e um segundo bairro do outro lado do rio.

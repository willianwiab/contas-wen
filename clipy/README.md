# 📎 CLIPY

Um ajudante de clipe de papel que fica num canto da tela, **lê o que você
escreve** e aparece sozinho pra atrapalhar — igual aos assistentes que vinham
nos programas de escritório dos anos 90.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/clipy/

## O que ele é (e o que não é)

O Clipy **não é** uma dessas inteligências artificiais de hoje. Ele é do tipo
antigo: **33 regras escritas na mão**, cada uma sabendo reconhecer uma coisa no
texto e com uma frase pronta pra soltar. Nada sai do navegador — sem internet,
sem servidor, sem conta, sem nada sendo enviado pra lugar nenhum.

É justamente isso que fazia o ajudante de verdade ser engraçado e chato ao mesmo
tempo: **ele acerta o padrão e erra a intenção.** Vê "Prezado" e conclui
"carta". Não faz ideia do que você quer dizer.

O site tem quatro partes:

| aba | o que é |
| --- | --- |
| 📝 **A mesa** | um papel pra escrever, com o Clipy do lado lendo tudo |
| 📋 **Área de transferência** | histórico do que você copia + atalhos de texto em pastas — a outra ideia que também se chama Clipy |
| 💬 **Conversar** | dá pra fazer perguntas; ele responde com o que tem escrito dentro dele |
| 🧠 **Como ele pensa** | as 30 regras, uma por uma, e **acendendo em verde** quando estão batendo com o que você acabou de escrever |
| 📜 **Quem é o Clipy** | a história dos ajudantes animados, por que sumiram, e o que eles ensinam sobre as IAs de hoje |

## Ele responde de verdade

Escreva **`1+1=`** numa linha do papel e ele responde **2**. Escreva
**"quanto é dez vezes três?"** e ele responde **30**. Faça uma lista de preços,
um por linha, e ele soma tudo e ainda dá a média.

Três das regras são assim: em vez de **comentar** o que você está fazendo, elas
**respondem**. E elas **furam a fila da chatice** — perguntar não é ser
interrompido, então ele responde na hora, mesmo com a chatice no zero.

A calculadora entende:

| você escreve | ele responde |
| --- | --- |
| `1+1=` · `12 x 8` · `(2+3)*4` | 2 · 96 · 20 |
| `3 + 4 * 2` | 11 — vezes vem antes de mais |
| `10/4` · `2^10` · `12 ao quadrado` | 2,5 · 1.024 · 144 |
| `50% de 300` · `metade de 50` · `dobro de 12` | 150 · 25 · 24 |
| `raiz de 81` | 9 |
| `quanto é dez vezes três?` | 30 |
| `duzentos e trinta e cinco + 5` | 240 |
| `1.234,56 + 1` · `0,1+0,2` | 1.235,56 · 0,3 |
| `10 / 0` | "essa eu não consigo: dividir por zero" |

E ela sabe o que **não** é conta: `12/03/2026` é data, `10:30` é hora,
`3 gatos e 4 gatos` é texto, um link é um link.

> **Ela não usa `eval()`.** `eval()` executaria qualquer coisa escrita no papel,
> e o papel é texto que vem de fora — nunca se manda o navegador executar texto
> assim. A conta é lida à mão, número por número, sinal por sinal, com um
> analisador descendente de verdade (o mesmo tipo que uma linguagem de
> programação usa pra ler código). Tem um teste que escreve código no papel e
> verifica que nada acontece.

## Tem dois Clipys, e o site é os dois

O nome **Clipy** é de duas coisas. Uma é o ajudante de clipe dos anos 90 — o
bichinho que fica na tela. A outra é um **gerenciador de área de transferência
para Mac**, aberto e de graça (MIT), que guarda tudo o que você copia e tem
atalhos de texto em pastas; ele nasceu como continuação do **ClipMenu**, do
desenvolvedor **@naotaka**, ficou anos parado e voltou pelas mãos da comunidade.
Os dados dele ficam todos no computador, sem nuvem e sem conta.

A aba **📋 Área de transferência** deste site é essa segunda ideia, feita dentro
do navegador: histórico, atalhos em pastas, busca, limite de itens, itens
fixados que nunca somem, e um filtro que recusa o que parece senha ou cartão.

E é aí que as duas viram uma coisa só: **cada item capturado passa pelas regras
do bichinho**, que olha o tipo (link, e-mail, telefone, dinheiro, código, cor,
texto longo) e comenta. É o ajudante dos anos 90 morando dentro do gerenciador.

> **Uma diferença de propósito.** O programa de Mac fica olhando a área de
> transferência sozinho, o tempo todo, em segundo plano. Uma página da internet
> **não pode fazer isso** — e ainda bem: senão qualquer site aberto leria a sua
> senha na hora em que você a copiasse. Por isso, aqui, a captura só acontece
> quando **você manda**: colando na página (Ctrl+V) ou apertando o botão. É menos
> prático e é muito mais seguro, e o site explica isso na própria tela.

## As 33 regras

Cada regra tem: o que ela procura, o peso (quem grita mais alto ganha), a fala,
os botões e quantos segundos ela fica quieta depois de falar.

**As três que respondem** — a conta da linha onde está o cursor, a conta que
não dá (dividir por zero), e a coluna de números pra somar.

**As clássicas** — carta ("Prezado…"), lista (3 traços), conta (valores em R$),
gritar (82% das letras em maiúscula), data, muitas interrogações, receita,
lição de casa, o nome dele, xingamento, tchau.

**O jeito de escrever** — frase de 240 letras sem ponto, texto sem nenhum
acento, palavra repetida duas vezes seguidas, palavra de 28 letras, 5 emojis,
poema (4 linhas curtinhas), inglês.

**O que você faz** — apagou 60 letras nos últimos 20 segundos, está digitando
rápido demais, parou 12 segundos, folha em branco há 18 segundos, passou de 120
palavras, 45 segundos parado (aí ele dorme).

**E uma de verdade útil:** se você escrever "senha", "PIN" ou "cartão de
crédito", ele para tudo e avisa pra nunca digitar isso numa página.

### Os botões fazem coisa de verdade

O ajudante antigo prometia ajuda e não entregava. Este entrega: **montar a
carta** (com data e despedida), **numerar a lista**, **somar** todos os números
do papel, **abaixar as maiúsculas**, escrever **datas por extenso**, arrumar
**telefones**, tirar a **palavra repetida**, apagar a linha da **senha**, e até
escrever a **primeira frase** por você quando a folha está em branco.

## A chatice

Tem um controle lá em cima, de 0 a 100. Ele decide quanto tempo o Clipy espera
entre uma fala e outra: **42 segundos** no mínimo e **6 segundos** no máximo. No
zero ele fica completamente quieto (e um pouco magoado).

E cada dica tem um **"não mostrar mais esta dica"** que cala aquela regra pra
sempre — o botão que todo mundo queria ter nos anos 90.

## O desenho

O Clipy é **desenhado por código** num canvas: um arame dobrado (uma linha só,
com dois arcos e três retas), dois olhos que seguem o mouse, duas sobrancelhas
e uma boca. Não tem nenhuma imagem na página.

São **9 humores** (parado, atento, pensando, feliz, triste, bravo, assustado,
dormindo, confuso) e **6 gestos** (pular, girar, acenar, tremer, encolher,
cair), que se misturam com respiração e piscada automáticas. As sobrancelhas
fazem quase todo o trabalho — é onde mora a expressão de um personagem.

> O desenho é original: é o **Clipy do JoJo**, não o personagem de nenhuma
> empresa. Mesma ideia, clipe novo.

## Estrutura

```
clipy/
  index.html · style.css
  js/clipy.js       o desenho e as animações do clipe
  js/cerebro.js     as 33 regras, a conversa e o vigia
  js/calculadora.js a calculadora escrita do zero, sem eval
  js/prancheta.js   o histórico da área de transferência e os atalhos
  js/main.js        o papel, o balão, as abas, o save
  js/instalar.js    service worker + instalar como aplicativo
```

Sem build, sem dependência, sem framework. Módulos ES e canvas 2D.

## Instalar

Botão **📲 Instalar** lá em cima. Onde o navegador oferece sozinho (Chrome,
Edge, Brave), instala na hora; onde não oferece, o botão abre o passo a passo do
aparelho — no iPhone é *Compartilhar ⬆️ → Adicionar à Tela de Início*. Instalado
ou não, o site **funciona sem internet** depois de abrir uma vez, e o seu texto
fica salvo no aparelho.

## Testando

```
python3 -m http.server 8822    # na raiz do repositório
npm i playwright-core
node teste-clipy.js
```

**54 checagens**: as 30 regras existem e nenhuma está pela metade; "Prezado"
dispara a carta e o botão **monta a carta de verdade**; três traços viram lista
e o botão numera 1. 2. 3.; R$ 10,50 + R$ 4 + R$ 25 dá **39,5**; MAIÚSCULA vira
minúscula; "senha" dispara o aviso; apagar 60 letras dispara o comentário; "não
mostrar mais" cala a regra **e ela não volta**; chatice 0 emudece e 100 acelera
pra 6 segundos; a tabela acende a regra certa; a conversa responde, **admite
quando não sabe** e faz conta; cutucar mexe o clipe; o desenho é canvas puro,
sem nenhuma `<img>`; tudo fica salvo; e — desligando a internet de verdade — o
site abre inteiro e o Clipy continua reagindo.

Da calculadora: escrever `1+1=` no papel responde 2 **no navegador de verdade**;
mudar a conta muda a resposta e apagar faz ela sumir; as 18 contas da tabela
acima batem; texto que não é conta não vira conta; dividir por zero avisa;
**escrever código no papel não executa nada** (a prova de que não tem `eval`); a
lista de preços é somada com o total escrito no papel; com a chatice no zero ele
ainda responde; e na conversa também.

Da aba da área de transferência: as 3 pastas de fábrica nascem com id próprio;
ele reconhece link, e-mail, telefone, dinheiro, código e cor; capturar guarda **e**
faz o Clipy comentar; **senha e número de cartão são recusados** e não entram no
histórico; copiar a mesma coisa não duplica (sobe pro topo e conta as vezes); o
limite corta o histórico mas nunca joga fora o que está fixado 📌; a busca
filtra; Ctrl+V na caixinha captura; "no papel" cola o atalho e troca de aba; e
tudo fica salvo.

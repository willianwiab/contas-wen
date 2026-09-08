# 📎 CLIPY

Um ajudante de clipe de papel que fica num canto da tela, **lê o que você
escreve** e aparece sozinho pra atrapalhar — igual aos assistentes que vinham
nos programas de escritório dos anos 90.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/clipy/

## O que ele é (e o que não é)

O Clipy **não é** uma dessas inteligências artificiais de hoje. Ele é do tipo
antigo: **30 regras escritas na mão**, cada uma sabendo reconhecer uma coisa no
texto e com uma frase pronta pra soltar. Nada sai do navegador — sem internet,
sem servidor, sem conta, sem nada sendo enviado pra lugar nenhum.

É justamente isso que fazia o ajudante de verdade ser engraçado e chato ao mesmo
tempo: **ele acerta o padrão e erra a intenção.** Vê "Prezado" e conclui
"carta". Não faz ideia do que você quer dizer.

O site tem quatro partes:

| aba | o que é |
| --- | --- |
| 📝 **A mesa** | um papel pra escrever, com o Clipy do lado lendo tudo |
| 💬 **Conversar** | dá pra fazer perguntas; ele responde com o que tem escrito dentro dele |
| 🧠 **Como ele pensa** | as 30 regras, uma por uma, e **acendendo em verde** quando estão batendo com o que você acabou de escrever |
| 📜 **Quem é o Clipy** | a história dos ajudantes animados, por que sumiram, e o que eles ensinam sobre as IAs de hoje |

## As 30 regras

Cada regra tem: o que ela procura, o peso (quem grita mais alto ganha), a fala,
os botões e quantos segundos ela fica quieta depois de falar.

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
  js/cerebro.js     as 30 regras, a conversa e o vigia
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

**29 checagens**: as 30 regras existem e nenhuma está pela metade; "Prezado"
dispara a carta e o botão **monta a carta de verdade**; três traços viram lista
e o botão numera 1. 2. 3.; R$ 10,50 + R$ 4 + R$ 25 dá **39,5**; MAIÚSCULA vira
minúscula; "senha" dispara o aviso; apagar 60 letras dispara o comentário; "não
mostrar mais" cala a regra **e ela não volta**; chatice 0 emudece e 100 acelera
pra 6 segundos; a tabela acende a regra certa; a conversa responde, **admite
quando não sabe** e faz conta; cutucar mexe o clipe; o desenho é canvas puro,
sem nenhuma `<img>`; tudo fica salvo; e — desligando a internet de verdade — o
site abre inteiro e o Clipy continua reagindo.

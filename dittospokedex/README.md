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

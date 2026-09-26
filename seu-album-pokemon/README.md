# 🎴 Seu Álbum Pokémon

O álbum das suas cartas Pokémon: quantas você tem de cada uma, as repetidas pra trocar
e as que você quer. Na mesma pegada do ButterPoke e da Ditto's Pokédex: um arquivo só,
funciona no celular e guarda tudo no aparelho.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/seu-album-pokemon/

## O que dá pra fazer

- **Achar a carta** pelo nome ou pelo número do cantinho (`25` ou `25/102`), em inglês ou
  português. A busca é a mesma ideia do ButterPoke: o site principal (Pokémon TCG API, só
  inglês) e o reserva (TCGdex, que fala português). Se o principal falhar, vai pro reserva.
- **📖 Álbum**: um fichário de 9 bolsos por página, com quantas você tem de cada (`×3`).
  Ordena por mais novas, nome ou mais repetidas.
- **Quantidade**: toque na carta e use o − e o +. Pode ter quantas quiser da mesma.
- **🔁 Pra trocar**: as repetidas entram sozinhas (tendo 3, 2 vão pra troca). Dá pra mudar
  na mão; aí o site para de mexer sozinho naquela carta.
- **💖 Quero**: a lista de desejos. Quando você põe a carta no álbum, ela sai daqui.
- **💾 Guardar**: um código com o álbum inteiro pra levar pra outro aparelho. Colar
  **junta** com o que já tem, nunca apaga.

## 🤝 Trocar — e por que sem localização

O pedido foi trocar "com a localização real". **Isso não entrou, de propósito.** GPS aponta
pra porta da casa, e quem usa isto é criança: um site de troca mostrando isso pra
desconhecidos é perigoso de verdade. O ButterPoke já tinha decidido a mesma coisa.

A troca é por **código**, com amigo que a pessoa já conhece:

1. O código (`TROCA1.`) leva **só cartas**: as que você troca e as que você quer. Nada de
   nome, nada de lugar.
2. O amigo cola, e o site mostra: 🎁 o que ele pode te dar (você quer), 📦 o que você pode
   dar (ele quer) e 👀 outras que ele troca e você não tem. Quando bate dos dois lados,
   aparece "🤝 Dá troca!".
3. A troca de verdade é pessoalmente, com um adulto sabendo. Depois é só mexer nas
   quantidades.

Colar o código do amigo só **mostra**; não mexe no seu álbum. As cartas que vêm num código
passam por uma limpeza: tamanho máximo nos textos e foto só dos dois sites de cartas.

## O resto

- Modo escuro, botão "versão" no rodapé que busca a mais nova (a mesma saída de emergência
  dos outros sites), service worker guardando a casca pra abrir sem internet. Sem
  internet o álbum continua aí; só a busca de carta nova precisa de rede.

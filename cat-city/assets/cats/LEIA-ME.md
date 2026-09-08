# 🐈 Fotos dos gatos

O jogo desenha um gato "fotográfico" por código (pelo com textura, listras,
olhos com pupila e brilho, focinho, bigodes). Isso é **placeholder**.

## Pra trocar pelas fotos de verdade

Coloque os arquivos aqui com estes nomes e o jogo passa a usar eles sozinho,
sem mexer em código nenhum:

| Arquivo | Pra que serve |
| --- | --- |
| `gato.png` | o gato principal — é a partir dele que TODAS as formas são deformadas |
| `gato2.png`, `gato3.png`, `gato4.png` | variações, usadas nos gatos da cidade |
| `perna.png` | (opcional) a perna gigante; sem ele o jogo estica o próprio gato |

**Como preparar a imagem:** fundo transparente (PNG), gato de lado ou de frente,
mais ou menos quadrada, entre 256 e 512 pixels. O jogo cuida do resto —
esticar, achatar, repetir e empilhar são deformações feitas em tempo real.

Se um arquivo não existir, o jogo simplesmente usa o gato desenhado por código.
Nada quebra.

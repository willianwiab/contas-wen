# 🎒 Fala, Turma!

O irmão do [Fala, Família](../falar-com-os-pais/) — mesma cara, mesmo roxo — mas pra turma
da escola. Um mural com **recado, lição, prova, combinar de sair e enquete**.

## A regra que manda neste app

**Nem todo mundo da turma tem celular.** Isso não é um detalhe: é o que decide como o app
foi feito.

- **Abre em qualquer navegador** — computador de casa, computador da escola, celular
  emprestado do irmão. Sem instalar, sem conta, sem senha.
- **📱 Modo emprestado** — quem entra pelo aparelho de outra pessoa marca uma caixinha, e
  aí nada é gravado ali: vai pra `sessionStorage` e some quando a aba fecha.
- **🖨️ Imprimir o mural** — pra quem não tem aparelho nenhum, alguém imprime a semana e
  leva no papel. É a razão de este app existir do jeito que existe.

## Como as pessoas entram

Sem cadastro: quem cria a turma manda um **link de convite**; quem recebe abre, escreve o
nome e está dentro. O link carrega o código da turma e o **segredo** que abre os recados.

O código tem 8 letras sorteadas de um alfabeto **sem I, O, 0 e 1** — as que todo mundo
confunde na hora de copiar.

## Segurança

Os recados vão **embaralhados** (AES-GCM, chave derivada por PBKDF2 com 210 000 voltas) do
**segredo que viaja no convite** — não do código da turma, que anda de mão em mão. O banco
guarda, mas não entende.

O que chega do banco foi escrito por outro aparelho, então passa por `avisoConfere()`:
dono, horário, tipo, tamanho e formato das opções são conferidos antes de virar tela.

> Usa o mesmo banco do Fala, Família, num caminho separado (`turmas/<código>`). **Isso é
> conta e cota do adulto da casa** — vale combinar com ele antes de espalhar o convite pra
> turma inteira.

## O que tem no mural

Cada recado mostra o bichinho e a cor de quem escreveu (nascem do nome, então são sempre
os mesmos), o tipo numa etiqueta colorida, 👍 joinha, 👀 quem já viu e 📌 fixar no topo.
Enquete desenha a **barra de proporção** por trás de cada resposta. Endereço escrito vira
link — a detecção roda depois do escape do HTML e só aceita `http`, `https` e `www.`.

Os filtros mostram **quantos tem de cada tipo**: sem isso a pessoa toca num filtro vazio
sem saber e parece que o app perdeu os recados.

## 👥 Quem está na turma

Não existe lista de membros no banco — ninguém "se cadastra". A turma **é quem apareceu no
mural**: a lista nasce de quem escreveu, votou, deu joinha ou marcou que viu. A mesma tela
mostra o **código de 8 letras**, pra ditar em voz alta pra quem não recebeu o link.

## Arquivos

| Arquivo | Pra que serve |
|---|---|
| `index.html` | As telas e o visual (as mesmas cores do Fala, Família) |
| `turma.js` | Entrar, o mural, a nuvem, a criptografia e a impressão |
| `sw.js` | Abrir sem internet — a rede da escola costuma ser ruim |

# 🐷 Cofrinho de Objetivo

Cê escolhe uma coisa que quer comprar, diz quanto custa e pra quando — e ele responde a
única pergunta que importa: **quanto guardar por semana.**

## A conta que manda neste app

O site inteiro existe pra deixar uma divisão na cara de quem olha:

```
o que falta ÷ semanas que sobram = quanto guardar por semana
```

"R$ 1.200 até novembro" não diz nada pra ninguém — é um número grande e uma data longe.
**"R$ 105 por semana"** dá pra decidir hoje. Por isso esse valor é o maior da tela, e o
resto (por mês, por dia) vem pequeno embaixo.

## O ritmo de verdade vs. o plano

Um app que só mostra o plano é fácil de enganar: a barra fica parada e ninguém comenta.
Então ele também calcula **o seu ritmo real** — quanto entrou por semana desde o primeiro
depósito — e põe os dois lado a lado:

- 🚀 **Tá adiantado** — no seu ritmo cê chega antes da data.
- 🐌 **Tá devagar** — no seu ritmo cê chega depois, e ele repete quanto teria que ser.

Essa previsão **só aparece depois de uma semana e de dois depósitos**. Com um depósito só,
a conta diria coisas como "cê compra amanhã", e um número obviamente errado faz a pessoa
parar de confiar no resto da tela.

## Dinheiro é guardado em centavos

Tudo é número inteiro de centavos, nunca reais com vírgula. Em ponto flutuante,
`0.1 + 0.2` dá `0.30000000000000004` — o cofrinho fecharia com um centavo sobrando do
nada, e ninguém entenderia por quê.

Na entrada, `50`, `50,00`, `R$ 1.234,56` e `1.234` têm que virar o número certo. O caso
chato é o ponto sozinho: **`1.234` é mil duzentos e trinta e quatro, mas `1.23` é um e
vinte e três.** A regra é o tamanho do que vem depois do ponto — 3 dígitos é separador de
milhar.

## Três decisões que parecem detalhe

- **A festa é só na virada.** Chuva de moedas quando o cofrinho enche, e um respingo
  pequeno em cada depósito. Se comemorasse tudo igual, comemorar pararia de significar
  alguma coisa.
- **O prazo estourado não dá bronca.** Ele diz o que aconteceu e mostra onde mudar a data.
  Um cofrinho que vira vermelho e xinga é um cofrinho que a pessoa fecha e não abre mais.
- **Cofrinho cheio desce na lista.** Já cumpriu o papel dele; quem precisa de atenção é o
  que ainda falta.

## Onde as coisas ficam

No `localStorage` **deste aparelho**. Sem conta, sem senha, sem servidor — igual aos
outros apps daqui.

O problema é que localStorage some quando se limpa o navegador, e ninguém avisa antes.
Por isso tem **💾 Salvar backup** (baixa um `.json`) e **📂 Abrir backup**.

Abrir um backup **junta** em vez de substituir: ele só traz os cofrinhos que ainda não
estão aqui. Assim, abrir o arquivo errado nunca apaga nada — e restaurar num aparelho
limpo dá no mesmo, porque lá não tem nada pra conflitar.

## Funciona sem internet

Tem `sw.js` e `manifest.webmanifest`, então dá pra instalar na tela de início e abrir
offline. Cofrinho é coisa de olhar toda semana, e travar numa tela branca porque o wi-fi
caiu seria o jeito mais rápido de a pessoa desistir de usar.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | A tela e o estilo (tem modo escuro) |
| `cofrinho.js` | As contas, o extrato e o backup |
| `sw.js` | Guarda o site pra abrir sem internet |
| `manifest.webmanifest` | Deixa instalar como aplicativo |
| `icone.svg` | O porquinho |

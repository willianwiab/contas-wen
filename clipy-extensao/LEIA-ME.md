# 📎 Clipy — a extensão

O Clipy sai do site dele e passa a aparecer **por cima de qualquer página** que
você abrir. YouTube, Google, joguinho, o que for: ele fica num cantinho, lê o
que você digita, comenta a página em que você está e pula na sua frente sem ser
chamado — que era exatamente o que os ajudantes faziam nos anos 90.

---

## Como instalar no Chrome (ou Edge, ou Brave)

Não precisa de conta, não precisa pagar, não passa por loja nenhuma.

1. **Baixe a pasta.** No GitHub do projeto, clique no botão verde **Code** →
   **Download ZIP**. Descompacte em algum lugar que você não vá apagar sem
   querer (a Área de Trabalho serve). O que importa é a pasta
   **`clipy-extensao`** lá de dentro.

2. **Abra a página de extensões.** Digite na barra de endereço:
   `chrome://extensions` (no Edge é `edge://extensions`) e aperte enter.

3. **Ligue o "Modo do desenvolvedor".** É um interruptor no canto de cima, à
   direita.

4. **Clique em "Carregar sem compactação"** (em inglês: *Load unpacked*).

5. **Escolha a pasta `clipy-extensao`.** Não o ZIP, não um arquivo de dentro
   dela: a **pasta**.

Pronto. Abra qualquer site e espere uns segundos — ele aparece no canto de
baixo, à direita.

> **No celular não dá.** O Chrome do Android e o Safari do iPhone não aceitam
> extensão. No celular use o site: ele instala como aplicativo pelo botão 📲.

---

## O que ele faz

- **Lê o que você digita** em qualquer caixa de texto da página e dá palpite,
  com as mesmas 33 regras do site — inclusive **respondendo conta**: escreva
  `20+20+20+7=` em qualquer campo e ele responde `67`.
- **Comenta a página em que você está.** Ele sabe se você está no YouTube, numa
  pesquisa, num e-mail, num site de jogo — e fala alguma coisa sobre isso. E às
  vezes fala uma coisa que não tem nada a ver, que é o mais autêntico.
- **Tem a vozinha de bipe** e todas as animações do site.
- **Dá pra arrastar** pela barra de título, e ele lembra do canto onde ficou.

## Os botões

| botão | o que faz |
| --- | --- |
| **👉 Cutucar** | ele reage |
| **😶 Quieto** | ele para de dar palpite neste navegador (e volta com 🗣 Falar) |
| **🔊** | liga e desliga a voz |
| **✕** | ele sai **deste site** e não volta mais nele |

No **ícone da extensão** (ao lado da barra de endereço) tem o resto: ligar e
desligar tudo, a **chatice** (de 0 a 100 — é o quanto ele interrompe), o volume,
e a lista dos sites de onde você expulsou ele, com um botão pra deixar entrar de
novo.

---

## Privacidade — e por que isso importa aqui

Extensão que lê o que você digita é exatamente o tipo de coisa que pode ser
usada pra espionar. Por isso esta aqui é feita ao contrário:

- **Ela não tem permissão de internet.** Abra o `manifest.json`: a única
  permissão é `storage`, que serve pra guardar as suas opções. **Não existe pra
  onde mandar os seus dados, nem com que.** Tudo acontece dentro da página, no
  seu computador.

- **Ela nunca lê campo de senha.** Está no `content.js`, na função `ehSenha()`:
  campo de senha, PIN, CVV e cartão são pulados antes de qualquer coisa. Não é
  uma opção que dá pra ligar — é regra.

- **Ela não mexe no que você escreveu.** No site dele, o Clipy censura palavrão
  trocando o texto. Aqui ele **só comenta**. Reescrever o que alguém digitou num
  site que não é nosso seria falta de educação e de segurança.

- **Ela não mostra propaganda e não tem nada escondido.** O código todo está
  aqui, em português, pra qualquer um ler.

> Um ajudante parecido chamado **BonziBuddy** ficou famoso nos anos 2000 e era
> justamente o contrário disso: enchia a tela de propaganda, ficava de olho no
> que a pessoa fazia e era difícil de remover. A empresa foi multada por isso.
> A graça do bichinho na tela dá pra ter sem nada disso — é o que esta extensão
> tenta mostrar.

---

## Estrutura

```
clipy-extensao/
  manifest.json      as permissões (só "storage") e onde a extensão entra
  content.js         o que entra em toda página: a janelinha, a leitura, o laço
  comentarios.js     o que ele fala sobre a página em que você está
  popup.html/.js     as opções no ícone da extensão
  js/                copiados do site: o desenho, as regras, a conta, os
                     segredos e a voz
```

Os arquivos de `js/` são **cópias** dos do site (`/clipy/js/`). Uma extensão não
consegue carregar arquivo de fora dela, então eles moram nos dois lugares —
quando um mudar, o outro precisa ser copiado junto.

## Como desinstalar

`chrome://extensions` → ache o Clipy → **Remover**. Ou só desligue o
interruptor, se quiser deixar guardado pra depois.

# 🎮 Jogos do JoJo

> Onde cada linha de código vira diversão — aperte **START** e explore!

Portfólio de jogos do JoJo: um site divertido, moderno e 100% estático, feito para rodar direto no **GitHub Pages** — sem backend, sem build, sem complicação.

---

## ✨ Apresentação

O **Jogos do JoJo** reúne todos os jogos criados pelo JoJo em um único lugar, com:

- 🏠 **Página inicial** com fundo animado de partículas, destaques, estatísticas e linha do tempo
- 🎮 **Página de jogos** com pesquisa, filtro por categoria/status e ordenação
- 📄 **Página individual** para cada jogo: banner, trailer, galeria, história, controles, curiosidades, changelog, ranking e área de comentários (preparada para o futuro)
- 🕹️ **Sobre Mim** com uma entrevista interativa em formato de chat que **gera a biografia automaticamente**
- 🌙 Tema escuro gamer com detalhes vibrantes, animações suaves e design responsivo

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura das páginas |
| **CSS3** | Tema escuro, animações, grid responsivo (sem frameworks) |
| **JavaScript** (vanilla) | Componentes, filtros, entrevista, canvas animado |
| **JSON** | Todo o conteúdo (jogos e biografia) vem de `/data` |
| **GitHub Pages** | Hospedagem gratuita |

Sem dependências, sem `npm install`, sem etapa de build. 🎉

## 🚀 Como executar

### Online (GitHub Pages)

1. No GitHub, vá em **Settings → Pages**
2. Em **Source**, escolha a branch desejada e a pasta **/ (root)**
3. Salve — o site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

### Localmente

Como o site carrega arquivos JSON via `fetch`, abra-o por um servidor local (não pelo duplo clique no arquivo):

```bash
# Python
python3 -m http.server 8000

# ou Node
npx serve
```

Depois acesse `http://localhost:8000`.

## 🕹️ Como adicionar um novo jogo

Basta editar **um único arquivo**: [`data/games.json`](data/games.json). Adicione um objeto ao array `jogos`:

```jsonc
{
  "slug": "meu-novo-jogo",              // identificador único, usado na URL (sem espaços/acentos)
  "nome": "Meu Novo Jogo",
  "descricao": "Resumo curto que aparece no cartão.",
  "comoFunciona": "Explicação de como o jogo funciona.",
  "objetivo": "Qual é o objetivo do jogador.",
  "mecanicas": ["Mecânica 1", "Mecânica 2"],
  "categoria": "Arcade",                 // usada no filtro por categoria
  "plataforma": "Navegador (PC e celular)",
  "ano": 2026,
  "status": "Em desenvolvimento",        // "Finalizado" | "Em desenvolvimento" | "Atualizações futuras"
  "dificuldade": "Média",
  "fases": 10,                           // opcional — use null se não houver
  "recorde": "5.000 pontos",
  "pontuacao": "Como os pontos são calculados",
  "popularidade": 75,                    // 0 a 100 — define a ordem em "Mais populares"
  "imagem": "assets/images/meu-jogo.png",   // vazio "" = placeholder automático
  "banner": "",                          // banner da página individual (vazio = placeholder)
  "trailer": "",                         // link do YouTube (opcional)
  "url": "https://link-para-jogar.com",  // link do botão "Jogar" (vazio = abre a página de detalhes)
  "galeria": ["", ""],                   // caminhos de imagens (vazios viram placeholders)
  "historia": "A história do jogo...",
  "comoJogar": "Instruções para o jogador...",
  "controles": [
    { "tecla": "W A S D", "acao": "Mover" }
  ],
  "curiosidades": ["Curiosidade 1"],
  "creditos": "Criado por JoJo.",
  "atualizacoes": "O que vem por aí...",
  "changelog": [
    { "versao": "1.0", "data": "2026", "mudancas": "Lançamento!" }
  ],
  "ranking": [
    { "jogador": "JoJo", "pontos": "5.000" }
  ]
}
```

Pronto! O jogo aparece automaticamente na página inicial, na lista de jogos, na linha do tempo e ganha a própria página em `pages/jogo.html?id=meu-novo-jogo`.

> ⚠️ Os três jogos que já estão no `games.json` são **exemplos** — substitua pelos seus!

Outros ajustes rápidos:

- **Horas de desenvolvimento** (estatísticas): edite `estatisticas.horasDeDesenvolvimento` no `games.json`
- **Imagens**: coloque os arquivos em `assets/images/` e aponte o caminho nos campos `imagem`, `banner` e `galeria`

## 🧑‍🚀 Como preencher o "Sobre Mim"

1. Abra a página **Sobre Mim** do site
2. Responda a entrevista interativa (12 perguntas)
3. A biografia é gerada automaticamente ✨
4. Clique em **⬇ Baixar about.json** e substitua o arquivo `data/about.json` do repositório
5. Faça commit — a biografia passa a aparecer para todos os visitantes

## 📁 Estrutura do projeto

```
├── index.html              # Página inicial (hero, destaques, stats, timeline)
├── pages/
│   ├── jogos.html          # Lista de jogos (busca, filtros, ordenação)
│   ├── jogo.html           # Página individual (?id=slug-do-jogo)
│   └── sobre.html          # Entrevista interativa / biografia
├── components/
│   ├── header.js           # Cabeçalho + navegação (reutilizado em todas as páginas)
│   ├── footer.js           # Rodapé
│   └── game-card.js        # Cartão de jogo (home e lista)
├── css/
│   └── style.css           # Tema completo (variáveis, animações, responsivo)
├── js/
│   ├── utils.js            # Funções compartilhadas (fetch JSON, helpers)
│   ├── background.js       # Fundo animado de partículas (canvas)
│   ├── main.js             # Animações de entrada ao rolar
│   ├── home.js             # Lógica da página inicial
│   ├── games.js            # Busca / filtros / ordenação
│   ├── game.js             # Montagem da página individual
│   └── about.js            # Entrevista + gerador de biografia
├── data/
│   ├── games.json          # ⭐ TODOS os jogos ficam aqui
│   └── about.json          # Biografia (gerada pela entrevista)
├── assets/
│   ├── images/             # Capas, banners e placeholders
│   ├── icons/              # Favicon e ícones
│   └── fonts/              # Fontes locais (opcional)
├── contas.html             # (arquivo pré-existente do repositório, preservado)
└── README.md
```

## 📜 Licença

Este projeto está sob a licença **MIT** — use, modifique e compartilhe à vontade. Os jogos exibidos no portfólio pertencem ao seu autor.

---

Feito com ❤ e muita imaginação — **Jogos do JoJo** 🎮

# ☁️ Como ligar o envio de verdade (pro papai/mamãe)

Por padrão o **Fala, Família!** guarda tudo só no aparelho. Pra os recados
viajarem de um computador/celular pro outro, a família precisa de um **banco
Firebase** — é grátis nesse tamanho e leva uns 10 minutos.

## O que vai acontecer

- Os recados passam por esse banco, mas saem do aparelho **embaralhados**
  (criptografia AES-GCM) com a **senha da família**. Quem olhar o banco vê só
  letra embaralhada — nem o Google entende o conteúdo.
- O endereço da sala é um código sorteado de 20 letras. Quem não tem o código
  **e** a senha não lê nada.
- Áudios, fotos e vídeos até ~300 KB viajam junto; os maiores ficam só no
  aparelho de origem (aparece um aviso no recado).

## Passo a passo

1. Entrar em **https://console.firebase.google.com** com a conta Google.
2. **Adicionar projeto** → nome (ex.: `fala-familia`) → pode **desativar** o
   Google Analytics → Criar.
3. No menu da esquerda: **Criar → Realtime Database → Criar banco de dados**.
   - Escolher a região (qualquer uma, `us-central1` serve).
   - Começar em **modo bloqueado** (as regras a gente troca no passo 5).
4. Copiar o **endereço** que aparece no topo, algo como
   `https://fala-familia-default-rtdb.firebaseio.com`.
5. Abrir a aba **Regras**, apagar o que estiver lá, colar isto e **Publicar**:

```json
{
  "rules": {
    "salas": {
      "$sala": {
        ".read": "$sala.length > 12",
        ".write": "$sala.length > 12",
        "$recado": {
          ".validate": "newData.hasChildren(['iv','c'])"
        }
      }
    }
  }
}
```

   Isso libera só o caminho `/salas/<código longo>` e só aceita recado
   embaralhado. Quem não souber o código não acha a sala.

6. No site, em **⚙️ Ajustes → ☁️ Enviar de verdade**:
   - colar o **endereço do banco**;
   - apertar **🎲 Sortear um código** de sala;
   - escrever uma **senha da família** (a mesma em todos os aparelhos);
   - apertar **☁️ Ligar**. A bolinha lá em cima fica verde.
7. Apertar **📋 Copiar convite** e mandar o texto pros outros aparelhos. Neles:
   **⚙️ Ajustes → 📥 Colar convite**. Pronto, ninguém precisa digitar nada.

## Quanto custa

O plano gratuito (Spark) dá 1 GB de armazenamento e 10 GB de transferência por
mês. Uma família conversando o dia inteiro usa uma fração disso. Não precisa
cadastrar cartão.

## Se quiser desligar

**⚙️ Ajustes → 🔌 Desligar**. Os recadinhos que já estão no aparelho continuam
lá; só param de viajar. Pra apagar o que está no banco, é só apagar o nó
`salas/<código>` no console do Firebase (ou o projeto inteiro).

# PokéZap 💬

Um celular de mentira onde os Pokémon mandam mensagem pra você: Pikachu, Snorlax, Psyduck, Gengar, Charmander, Jigglypuff, Eevee e Magikarp.

▶️ **Abrir:** https://willianwiab.github.io/contas-wen/pokezap/

- No site, eles respondem com **frases prontas espertas**: percebem oi, tchau, comida, kkk… e combinam a resposta.
- **🧠 Ligar IA**: roda uma IA pequena (Qwen2.5 1.5B, via [WebLLM](https://github.com/mlc-ai/web-llm)) **dentro do computador**, sem chave e sem Claude. Na primeira vez baixa uns 1 GB, que ficam guardados no navegador. Precisa de Chrome ou Edge de computador com WebGPU. Depois de ligada uma vez, liga sozinha nas próximas visitas.
- Na mesma janelinha, **✨ Abrir no Claude** abre a versão com a IA do Claude (melhor, mas precisa da conta do Claude).
- A IA do Claude não fica direto no site porque precisaria de uma chave secreta, e qualquer pessoa poderia pegar ela.
- `web-llm-0.2.84.js` é a biblioteca WebLLM 0.2.84 (licença Apache-2.0, em `web-llm-LICENSE.txt`).
- Segurança: se alguém tentar contar senha, endereço, escola ou telefone, o Pokémon avisa pra não contar isso na internet.
- As conversas ficam salvas só no seu navegador. O 🗑️ Apagar recomeça uma conversa.

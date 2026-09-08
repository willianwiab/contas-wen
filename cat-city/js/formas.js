/* ==========================================================================
   CAT CITY · formas.js
   AS 13 FORMAS.

   Todas são o mesmo gato, torcido. As três últimas seguem as fotos que o
   JoJo mandou:
     · GATO DE PERNA GIGANTE — o corpo é um gato grande e as PERNAS SÃO GATOS
       INTEIROS pendurados de cabeça pra baixo.
     · GATO DE PERNA MELHOR — corpo comprido, DUAS CABEÇAS na frente e um
       monte de gatos-perna andando embaixo.
     · MEGA LARVA — uma cabeça enorme e o corpo feito de nacos de gato
       empacotados em fileiras.
   ========================================================================== */
import { gato, cabeca, pernaGato, nacoDeGatos } from "./sprites.js";
import { gerarFormas } from "./formario.js";

/* cada forma diz: como é o corpo (pro jogo), como se desenha, e o que ela faz.
   raio  — o tamanho pra colisão, em metros do mundo
   alto  — a altura, pra desenhar e pra saber o que ela alcança
   vel   — velocidade base
   pulo  — força do pulo (0 = não pula)
   massa — o quanto empurra as coisas e o quanto é empurrada
   fino  — passa por vãos estreitos
   quebra— o que ela consegue destruir: 0 nada, 1 frágil, 2 barreira, 3 tudo */
export const LENDARIAS = [
  {
    id:"normal", nome:"Gato Normal", emoji:"🐈", nivel:0,
    raio:.5, alto:1, vel:7.4, pulo:7.2, massa:1, quebra:0,
    habilidade:"Miar (e ser um gato normal)", tecla:"SHIFT",
    conta:"Um gato. Só um gato. Aproveite enquanto dura.",
    poder:{ tipo:"miar", tempo:.6, recarga:1.2 },
  },
  {
    id:"bolaP", nome:"Gato Bola Pequeno", emoji:"⚪", nivel:1,
    raio:.42, alto:.85, vel:8.6, pulo:8, massa:.8, quebra:1, rola:true,
    habilidade:"Rolar", tecla:"SHIFT",
    conta:"Alguém amassou o gato até virar bola. Ele parece não se importar.",
    poder:{ tipo:"rolar", forca:17, tempo:.5, recarga:.9 },
  },
  {
    id:"bola", nome:"Gato Bola", emoji:"🔵", nivel:2,
    raio:.78, alto:1.55, vel:8, pulo:7.4, massa:2.2, quebra:1, rola:true,
    habilidade:"Rolar forte", tecla:"SHIFT",
    conta:"A bola cresceu. Agora ela quebra coisa.",
    poder:{ tipo:"rolar", forca:24, tempo:.6, recarga:1 },
  },
  {
    id:"bolaRosto", nome:"Gato Bola com Rosto", emoji:"😾", nivel:3,
    raio:.95, alto:1.9, vel:7.6, pulo:9.6, massa:3, quebra:1, rola:true, quica:true,
    habilidade:"Quicar", tecla:"SHIFT",
    conta:"O rosto ocupa a bola inteira. Ele quica. Ninguém explicou por quê.",
    poder:{ tipo:"quicar", forca:15, tempo:.4, recarga:.8 },
  },
  {
    id:"larvaP", nome:"Gato Larva Pequeno", emoji:"🐛", nivel:4,
    raio:.4, alto:.7, vel:8.2, pulo:5.4, massa:.9, quebra:0, fino:true, larva:3,
    habilidade:"Esgueirar (passa por vão estreito)", tecla:"SHIFT",
    conta:"Três gatos amassados um atrás do outro. Anda ondulando.",
    poder:{ tipo:"esgueirar", tempo:1.6, recarga:1.4 },
  },
  {
    id:"larva", nome:"Gato Larva", emoji:"🪱", nivel:5,
    raio:.55, alto:.9, vel:9.6, pulo:5.8, massa:1.6, quebra:1, fino:true, larva:7,
    habilidade:"Esgueirar rápido", tecla:"SHIFT",
    conta:"Sete gatos. Um corpo. Passa por onde nada passa.",
    poder:{ tipo:"esgueirar", tempo:2.2, recarga:1.2, forca:8 },
  },
  {
    id:"carro", nome:"Gato Carro", emoji:"🚗", nivel:6,
    raio:1.05, alto:1.2, vel:15, pulo:4.4, massa:4, quebra:1, veiculo:true,
    habilidade:"Acelerar e derrapar", tecla:"SHIFT",
    conta:"O corpo virou carro. O rosto continua na frente, olhando pra você.",
    poder:{ tipo:"acelerar", forca:34, tempo:1.4, recarga:1.6 },
  },
  {
    id:"trem", nome:"Gato Trem", emoji:"🚃", nivel:7,
    raio:1.15, alto:1.7, vel:13, pulo:3.2, massa:9, quebra:2, veiculo:true, larva:5, carrega:true,
    habilidade:"Buzinar e arrebentar barreira", tecla:"SHIFT",
    conta:"Cinco vagões, todos gato. Os outros gatos entram atrás e vão junto.",
    poder:{ tipo:"buzinar", forca:26, tempo:1.2, recarga:2 },
  },
  {
    id:"maca", nome:"Gato Maçã", emoji:"🍎", nivel:8,
    raio:.85, alto:1.7, vel:7, pulo:6.4, massa:5, quebra:1, rola:true, pesado:true,
    habilidade:"Rolar pesado (afunda placa de pressão)", tecla:"SHIFT",
    conta:"É uma maçã. Tem rosto de gato. Não pergunte.",
    poder:{ tipo:"rolar", forca:20, tempo:.7, recarga:1.1, pesa:true },
  },
  {
    id:"arvore", nome:"Gato Árvore", emoji:"🌳", nivel:9,
    raio:.9, alto:5.2, vel:4, pulo:0, massa:12, quebra:0, planta:true,
    habilidade:"Enraizar (vira plataforma e alcança o alto)", tecla:"SHIFT",
    conta:"Ficou parado tempo demais e criou raiz. Os galhos são gato.",
    poder:{ tipo:"enraizar", tempo:6, recarga:1 },
  },
  {
    id:"pernaG", nome:"Gato de Perna Gigante", emoji:"🦵", nivel:10,
    raio:1.2, alto:6.5, vel:6.2, pulo:5, massa:14, quebra:2, pernas:4, pernaAlt:4.4,
    habilidade:"Passo gigante", tecla:"SHIFT",
    conta:"As pernas dele são outros gatos, pendurados de cabeça pra baixo. Eles andam.",
    poder:{ tipo:"passo", forca:26, tempo:.5, recarga:1.1, alcance:9 },
  },
  {
    id:"pernaM", nome:"Gato de Perna Melhor", emoji:"🕷️", nivel:11,
    raio:1.9, alto:9, vel:7.4, pulo:5.4, massa:26, quebra:2, pernas:10, pernaAlt:6, cabecas:2,
    habilidade:"Passo enorme (alcança o que ninguém alcança)", tecla:"SHIFT",
    conta:"Duas cabeças, corpo comprido e dez gatos servindo de perna. Piorou.",
    poder:{ tipo:"passo", forca:36, tempo:.55, recarga:1, alcance:16 },
  },
  {
    id:"megaLarva", nome:"MEGA LARVA", emoji:"🐛", nivel:12,
    raio:3.4, alto:7, vel:9, pulo:0, massa:120, quebra:3, larva:14, mega:true,
    habilidade:"ESMAGAR", tecla:"SHIFT",
    conta:"Uma cabeça na frente e o corpo inteiro feito de gato empacotado. A cidade que se cuide.",
    poder:{ tipo:"esmagar", forca:40, tempo:1, recarga:1.4, raio:9 },
  },
];

/* AS MIL FORMAS.
   13 feitas à mão (as lendárias, com as três das fotos do JoJo) e 987 saídas
   da fábrica de formas — corpo x tinta x mania. Ver js/formario.js. */
export const GERADAS = gerarFormas(987, LENDARIAS.length);
export const FORMAS = LENDARIAS.concat(GERADAS);
export const TOTAL = FORMAS.length;

/* Com mil formas, procurar por id varrendo a lista custaria caro — e porId()
   é chamado a cada quadro. Um mapa resolve em uma consulta. */
const ONDE = new Map(FORMAS.map((f, i) => [f.id, i]));
export const porId = id => FORMAS[ONDE.has(id) ? ONDE.get(id) : 0];
export const indiceDe = id => (ONDE.has(id) ? ONDE.get(id) : 0);
export const existe = id => ONDE.has(id);

/* ==========================================================================
   O DESENHO DE CADA FORMA
   ctx já está transladado pro pé do bicho, com escala em pixels por metro.
   t  — o tempo, pra andar/ondular
   px — quantos pixels vale 1 metro
   ========================================================================== */
export function desenharForma(ctx, forma, px, t, andando, olhandoPraDireita, qual = 0) {
  /* As geradas trazem a própria pelagem e a própria tinta; as lendárias usam
     o gato como ele nasceu. E a mania "Reversa" olha pro outro lado, porque
     sim. */
  if (forma.pelo !== undefined) qual = forma.pelo;
  const cor = forma.cor || null, tinta = forma.tinta || .42;
  if (forma.espelho) olhandoPraDireita = !olhandoPraDireita;
  const img = gato(qual, cor, tinta);
  const prop = img.height / img.width;
  ctx.save();
  if (!olhandoPraDireita) ctx.scale(-1, 1);

  switch (forma.base || forma.id) {
    case "normal": {
      const h = forma.alto * px, w = h / prop;
      const pisa = andando ? Math.abs(Math.sin(t * 9)) * h * .05 : Math.sin(t * 2) * h * .012;
      ctx.drawImage(img, -w / 2, -h - pisa, w, h);
      break;
    }
    case "bolaP": case "bola": case "bolaRosto": {
      const d = forma.alto * px;
      const giro = t * (andando ? 5 : .6);
      ctx.save();
      ctx.translate(0, -d / 2);
      ctx.rotate(giro);
      ctx.beginPath(); ctx.arc(0, 0, d / 2, 0, 6.2832); ctx.clip();
      /* o gato é esmagado dentro da bola — o rosto continua inteiro */
      ctx.drawImage(img, -d * .62, -d * .62, d * 1.24, d * 1.24);
      ctx.restore();
      /* o rosto por cima, sem girar: é o que faz a bola ainda ser um gato */
      const c = cabeca(qual, cor, tinta), cd = d * ((forma.base || forma.id) === "bolaRosto" ? .92 : .66);
      ctx.drawImage(c, -cd / 2, -d / 2 - cd / 2 + d * .04, cd, cd);
      /* brilho de esfera */
      ctx.save();
      ctx.beginPath(); ctx.arc(0, -d / 2, d / 2, 0, 6.2832); ctx.clip();
      const br = ctx.createRadialGradient(-d * .18, -d * .68, d * .05, 0, -d / 2, d * .6);
      br.addColorStop(0, "#ffffff44"); br.addColorStop(.6, "#ffffff00"); br.addColorStop(1, "#00000055");
      ctx.fillStyle = br; ctx.fillRect(-d, -d, d * 2, d * 2);
      ctx.restore();
      break;
    }
    case "larvaP": case "larva": case "trem": case "megaLarva": {
      const n = forma.larva;
      const h = forma.alto * px;
      const w = h / prop;
      const mega = !!forma.mega;
      /* o rabo pra trás, a cabeça na frente */
      for (let i = n - 1; i >= 1; i--) {
        const k = i / n;
        const x = -i * w * (mega ? .62 : forma.veiculo ? .82 : .5);
        const y = Math.sin(t * (andando ? 7 : 2) - i * .8) * h * (mega ? .1 : .16);
        const e = mega ? 1 - k * .25 : 1 - k * .3;
        if (mega) nacoDeGatos(ctx, x, -h * .5 + y, w * 1.5 * e, h * 1.1 * e, t * 2 + i, qual, cor);
        else if (forma.veiculo) {
          ctx.save(); ctx.translate(x, y);
          ctx.drawImage(img, -w * .55 * e, -h * e, w * 1.1 * e, h * e);
          ctx.restore();
        } else {
          ctx.save(); ctx.translate(x, y);
          ctx.drawImage(img, -w * .42 * e, -h * e, w * .84 * e, h * e);
          ctx.restore();
        }
      }
      /* a cabeça: nas fotos ela é sempre maior que o corpo, e olha pra frente */
      const c = cabeca(qual, cor, tinta);
      const cd = h * (mega ? 1.5 : forma.veiculo ? 1.05 : .95);
      const bal = Math.sin(t * (andando ? 7 : 2)) * h * .06;
      ctx.drawImage(c, -cd * .42, -h * (mega ? .95 : .85) - cd * .3 + bal, cd, cd);
      break;
    }
    case "carro": {
      const h = forma.alto * px, w = h * 2.5;
      /* o corpo esticado na horizontal: é a deformação mais simples que existe */
      ctx.drawImage(img, -w * .5, -h * 1.25, w, h * 1.25);
      /* rodas, que são cabeças de gato girando */
      const c = cabeca(qual, cor, tinta), rd = h * .62;
      for (const dx of [-w * .3, w * .3]) {
        ctx.save();
        ctx.translate(dx, -rd * .42);
        ctx.rotate(t * (andando ? 14 : 1));
        ctx.drawImage(c, -rd / 2, -rd / 2, rd, rd);
        ctx.restore();
      }
      /* o rosto na frente, olhando */
      ctx.drawImage(c, w * .18, -h * 1.3, h * .95, h * .95);
      break;
    }
    case "maca": {
      const d = forma.alto * px;
      ctx.save();
      ctx.translate(0, -d * .52);
      ctx.rotate(t * (andando ? 4.4 : .4));
      ctx.beginPath();
      /* silhueta de maçã: dois lóbulos e um beliscão em cima */
      ctx.moveTo(0, -d * .42);
      ctx.bezierCurveTo(d * .55, -d * .6, d * .58, d * .5, 0, d * .5);
      ctx.bezierCurveTo(-d * .58, d * .5, -d * .55, -d * .6, 0, -d * .42);
      ctx.clip();
      ctx.drawImage(img, -d * .6, -d * .6, d * 1.2, d * 1.2);
      ctx.fillStyle = "#c0392b55"; ctx.fillRect(-d, -d, d * 2, d * 2);
      ctx.restore();
      /* cabinho e folha */
      ctx.strokeStyle = "#6b4a2a"; ctx.lineWidth = d * .06; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, -d * .92); ctx.lineTo(d * .04, -d * 1.1); ctx.stroke();
      ctx.fillStyle = "#5aa049";
      ctx.beginPath(); ctx.ellipse(d * .16, -d * 1.08, d * .13, d * .06, -.5, 0, 6.2832); ctx.fill();
      const c = cabeca(qual, cor, tinta), cd = d * .74;
      ctx.drawImage(c, -cd / 2, -d * .72 - cd * .2, cd, cd);
      break;
    }
    case "arvore": {
      const h = forma.alto * px, w = h / prop;
      /* tronco: o gato esticado pra cima, bem fininho */
      ctx.drawImage(img, -w * .16, -h * .78, w * .32, h * .78);
      /* copa: um monte de cabeça de gato amontoada */
      const c = cabeca(qual, cor, tinta), cd = h * .3;
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * 6.2832, r = h * (.16 + (i % 3) * .05);
        const bal = Math.sin(t * 1.6 + i) * h * .012;
        ctx.drawImage(c, Math.cos(a) * r - cd / 2, -h + Math.sin(a) * r * .7 - cd / 2 + bal, cd, cd);
      }
      break;
    }
    case "pernaG": case "pernaM": {
      /* AS FOTOS: o corpo é um gato grande e as pernas são gatos inteiros,
         de cabeça pra baixo, andando. Na versão "melhor" tem duas cabeças. */
      const altPerna = forma.pernaAlt * px;
      const corpoH = (forma.alto - forma.pernaAlt) * px;
      const corpoW = corpoH / prop * ((forma.base || forma.id) === "pernaM" ? 3.1 : 1.7);
      const n = forma.pernas;
      const passo = andando ? t * 7 : t * 1.4;
      for (let i = 0; i < n; i++) {
        const k = n === 1 ? .5 : i / (n - 1);
        const x = (k - .5) * corpoW * .82;
        const fase = passo + i * (6.2832 / n) * 1.7;
        const sobe = Math.max(0, Math.sin(fase)) * altPerna * .16;
        const lp = altPerna * .34;
        ctx.globalAlpha = .97;
        pernaGato(ctx, x, -sobe, lp, altPerna, fase, qual + (i % 2), cor);
      }
      ctx.globalAlpha = 1;
      /* o corpo comprido por cima das pernas */
      const cy = -altPerna - corpoH * .5;
      ctx.save();
      ctx.translate(0, cy);
      ctx.drawImage(img, -corpoW / 2, -corpoH * .5, corpoW, corpoH);
      ctx.restore();
      /* a(s) cabeça(s) na frente */
      const c = cabeca(qual, cor, tinta), cd = corpoH * 1.15;
      if (forma.cabecas === 2) {
        ctx.drawImage(c, corpoW * .18 - cd * .5, cy - cd * .62, cd, cd);
        ctx.drawImage(c, corpoW * .34 - cd * .5, cy - cd * .78, cd * .92, cd * .92);
      } else {
        ctx.drawImage(c, corpoW * .3 - cd * .5, cy - cd * .55, cd, cd);
      }
      break;
    }
  }
  ctx.restore();
}

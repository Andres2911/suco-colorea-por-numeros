// Generado por playables/construir.js a partir de app/app.js (bloques @nucleo). No editar a mano.
'use strict';
window.SUCONucleo = (() => {
  // Un píxel más oscuro que esto se considera línea del dibujo.
  const UMBRAL_LINEA = 175;
  // Cambiar si se modifica el análisis de zonas: invalida las partidas por números guardadas.
  const VERSION_ZONAS = 1;

  const DIFICULTAD = {
    facil:   { nombre: 'Fácil',   colores: 8,  minArea: 500, minRadio: 6 },
    medio:   { nombre: 'Medio',   colores: 12, minArea: 160, minRadio: 4 },
    dificil: { nombre: 'Difícil', colores: 18, minArea: 45,  minRadio: 2.5 },
  };

  // Paletas por temática. El primer color es el tono suave del fondo; el orden
  // importa porque las dificultades fáciles usan solo los primeros colores.
  const PALETAS = {
    floral:    ['#fbeee0', '#f49ab0', '#ffd166', '#8cc084', '#b79ae0', '#ff8c69', '#7ec4e6', '#e0567a', '#4f9d69', '#ffb347', '#9b6fd0', '#fbe3a1', '#5aa9d6', '#c43d63', '#b8e0c2', '#fcd0dc', '#2f7a5b', '#ffcf9e'],
    mar:       ['#e6f5f7', '#2a9d8f', '#48cae4', '#f4d58d', '#ff8c69', '#0077b6', '#90be6d', '#ffb4a2', '#023e8a', '#ade8f4', '#f9c74f', '#6a994e', '#e76f51', '#caf0f8', '#b8b8ff', '#ffd6a5', '#00b4d8', '#e5989b'],
    arrecife:  ['#eaf6f3', '#00a6a6', '#f7b267', '#5e60ce', '#80ed99', '#f4845f', '#48bfe3', '#ffd670', '#3a86ff', '#ff99c8', '#57cc99', '#e9c46a', '#6930c3', '#bde0fe', '#f25c54', '#c7f9cc', '#1d4e89', '#fde4cf'],
    dinos:     ['#f3f6e6', '#7cb342', '#ffb74d', '#4fc3f7', '#f06292', '#aed581', '#ffe082', '#8d6e63', '#9575cd', '#26a69a', '#ff8a65', '#558b2f', '#d7ccc8', '#e57373', '#81d4fa', '#c5e1a5', '#5d4037', '#fff59d'],
    conejita:  ['#fbf3e4', '#f6b7a5', '#e9c46a', '#a8c686', '#8ecae6', '#e76f51', '#c49a6c', '#f4a261', '#d4a5c9', '#6a994e', '#fff1a8', '#9c6644', '#e5989b', '#219ebc', '#b5838d', '#ddbea9', '#588157', '#ffcad4'],
    oso:       ['#fbf2e2', '#a47148', '#e9c46a', '#d95d39', '#8ab17d', '#f4dcb5', '#6d4c3d', '#f2a65a', '#7fa7c9', '#c9ada7', '#e76f51', '#b5c99a', '#8b5e34', '#ffd6a5', '#9a8c98', '#f7ede2', '#4a5759', '#dda15e'],
    bosque:    ['#f3f0e2', '#e05a47', '#8fbf6a', '#c8a27a', '#f2b134', '#7fb7be', '#b388d9', '#5c8d4f', '#f7e1a0', '#9a6b4f', '#ef8a5a', '#d3e8b0', '#4a7fa7', '#f5b8c4', '#7a5230', '#e8d5b7', '#35633f', '#ffd972'],
    celestial: ['#eef0fb', '#2b3a67', '#f2c14e', '#7b6cd9', '#5fb3b3', '#e07a9a', '#a3c4f3', '#453a94', '#f7e4a0', '#b392ac', '#3e7cb1', '#f49d6e', '#cdb4db', '#1f6f78', '#ffd6e0', '#8e7dbe', '#14213d', '#d9e4f5'],
    loto:      ['#f7f1f8', '#d96c9a', '#6a4c93', '#f2c14e', '#4fb3a9', '#9ec1e8', '#f4a3b5', '#355c7d', '#c3aed6', '#83c5be', '#e76f51', '#ffe8a3', '#2a9d8f', '#b5179e', '#a7c957', '#fbc4ab', '#3a0ca3', '#fde2e4'],
    oceano:    ['#e8f3f6', '#1b6f8a', '#3fb8af', '#ff8c61', '#f6d186', '#0b3c5d', '#7fd1b9', '#e76f7f', '#5aa9e6', '#2e8b57', '#c9e4de', '#8367c7', '#f9a03f', '#14546b', '#b5ead7', '#ffb5a7', '#4ecdc4', '#264653'],
    botanico:  ['#f4f6ec', '#a8d5a2', '#b784c9', '#5d8a4e', '#f2c6de', '#d1e8c3', '#7a4e9c', '#e9d985', '#3e6b48', '#f4a7b9', '#c7e3a0', '#8fb8de', '#955f3b', '#e0b1cb', '#2f5233', '#f7e7b4', '#c05780', '#9bc49a'],
    arcoiris:  ['#f6f4ef', '#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#f78c6b', '#9b5de5', '#83c5be', '#ffadad', '#073b4c', '#caffbf', '#fdffb6', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#e76f51', '#2a9d8f', '#f4a261'],
  };

  function hashTexto(t) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hexARgb = (h) => { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  const hexA32 = (h) => { const [r, g, b] = hexARgb(h); return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; };
  const rgbAHex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  const esOscuro = (h) => { const [r, g, b] = hexARgb(h); return 0.299 * r + 0.587 * g + 0.114 * b < 150; };

  const paletaDe = (libro) => PALETAS[libro.paleta] || PALETAS.arcoiris;

  // ---------- Análisis de la página ----------
  // Estas tres funciones no usan nada de fuera: se copian tal cual a un Web Worker
  // para que el análisis no congele la interfaz.
  function segmentar(gris, W, H, umbral) {
    const N = W * H;
    const linea = new Uint8Array(N);
    let lx0 = W, ly0 = H, lx1 = 0, ly1 = 0;
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i++) {
        if (gris[i] < umbral) {
          linea[i] = 1;
          if (x < lx0) lx0 = x; if (x > lx1) lx1 = x;
          if (y < ly0) ly0 = y; if (y > ly1) ly1 = y;
        }
      }
    }

    // Zonas: componentes conexas de píxeles que no son línea.
    const dueno = new Int32Array(N).fill(-1);
    const cola = new Int32Array(N);
    const areasL = [];
    let n = 0;
    for (let i = 0; i < N; i++) {
      if (linea[i] || dueno[i] !== -1) continue;
      let sp = 0, a = 0;
      cola[sp++] = i; dueno[i] = n;
      while (sp > 0) {
        const p = cola[--sp]; a++;
        const x = p % W;
        let q;
        if (x > 0 && !linea[q = p - 1] && dueno[q] === -1) { dueno[q] = n; cola[sp++] = q; }
        if (x < W - 1 && !linea[q = p + 1] && dueno[q] === -1) { dueno[q] = n; cola[sp++] = q; }
        if (p >= W && !linea[q = p - W] && dueno[q] === -1) { dueno[q] = n; cola[sp++] = q; }
        if (p < N - W && !linea[q = p + W] && dueno[q] === -1) { dueno[q] = n; cola[sp++] = q; }
      }
      areasL.push(a); n++;
    }
    const areas = Int32Array.from(areasL);

    // Distancia a la línea más cercana (chamfer): da el mejor sitio para el número.
    const dist = new Float32Array(N);
    for (let i = 0; i < N; i++) dist[i] = linea[i] ? 0 : 1e9;
    const D = 1.4142;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let m = dist[i];
        if (m === 0) continue;
        const iz = x > 0 ? dist[i - 1] : 0, ar = y > 0 ? dist[i - W] : 0;
        const ai = x > 0 && y > 0 ? dist[i - W - 1] : 0, ad = x < W - 1 && y > 0 ? dist[i - W + 1] : 0;
        if (iz + 1 < m) m = iz + 1; if (ar + 1 < m) m = ar + 1;
        if (ai + D < m) m = ai + D; if (ad + D < m) m = ad + D;
        dist[i] = m;
      }
    }
    for (let y = H - 1; y >= 0; y--) {
      for (let x = W - 1; x >= 0; x--) {
        const i = y * W + x;
        let m = dist[i];
        if (m === 0) continue;
        const de = x < W - 1 ? dist[i + 1] : 0, ab = y < H - 1 ? dist[i + W] : 0;
        const bd = x < W - 1 && y < H - 1 ? dist[i + W + 1] : 0, bi = x > 0 && y < H - 1 ? dist[i + W - 1] : 0;
        if (de + 1 < m) m = de + 1; if (ab + 1 < m) m = ab + 1;
        if (bd + D < m) m = bd + D; if (bi + D < m) m = bi + D;
        dist[i] = m;
      }
    }

    const radio = new Float32Array(n), punto = new Int32Array(n);
    const sx = new Float64Array(n), sy = new Float64Array(n), borde = new Uint8Array(n);
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i++) {
        const r = dueno[i];
        if (r < 0) continue;
        sx[r] += x; sy[r] += y;
        if (dist[i] > radio[r]) { radio[r] = dist[i]; punto[r] = i; }
        if (x === 0 || y === 0 || x === W - 1 || y === H - 1) borde[r] = 1;
      }
    }

    // Reparte los píxeles de línea a la zona más cercana, para que los rellenos
    // lleguen hasta debajo del trazo y no queden bordes blancos.
    let qi = 0, qf = 0;
    for (let i = 0; i < N; i++) {
      if (dueno[i] < 0) continue;
      const x = i % W;
      if ((x > 0 && linea[i - 1]) || (x < W - 1 && linea[i + 1]) || (i >= W && linea[i - W]) || (i < N - W && linea[i + W])) cola[qf++] = i;
    }
    while (qi < qf) {
      const p = cola[qi++], r = dueno[p], x = p % W;
      let q;
      if (x > 0 && dueno[q = p - 1] === -1) { dueno[q] = r; cola[qf++] = q; }
      if (x < W - 1 && dueno[q = p + 1] === -1) { dueno[q] = r; cola[qf++] = q; }
      if (p >= W && dueno[q = p - W] === -1) { dueno[q] = r; cola[qf++] = q; }
      if (p < N - W && dueno[q = p + W] === -1) { dueno[q] = r; cola[qf++] = q; }
    }

    // Lista de píxeles por zona (formato CSR) y caja envolvente.
    const inicio = new Int32Array(n + 1);
    for (let i = 0; i < N; i++) if (dueno[i] >= 0) inicio[dueno[i] + 1]++;
    for (let r = 0; r < n; r++) inicio[r + 1] += inicio[r];
    const lista = new Int32Array(inicio[n]);
    const pos = inicio.slice(0, n);
    const caja = new Int32Array(n * 4);
    for (let r = 0; r < n; r++) { caja[r * 4] = W; caja[r * 4 + 1] = H; caja[r * 4 + 2] = -1; caja[r * 4 + 3] = -1; }
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i++) {
        const r = dueno[i];
        if (r < 0) continue;
        lista[pos[r]++] = i;
        const c = r * 4;
        if (x < caja[c]) caja[c] = x; if (y < caja[c + 1]) caja[c + 1] = y;
        if (x > caja[c + 2]) caja[c + 2] = x; if (y > caja[c + 3]) caja[c + 3] = y;
      }
    }

    // Zonas vecinas (se tocan a través de una línea), también en formato CSR.
    const pares = new Set();
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i++) {
        const a = dueno[i];
        if (a < 0) continue;
        if (x < W - 1) { const b = dueno[i + 1]; if (b >= 0 && b !== a) pares.add(a < b ? a * n + b : b * n + a); }
        if (y < H - 1) { const b = dueno[i + W]; if (b >= 0 && b !== a) pares.add(a < b ? a * n + b : b * n + a); }
      }
    }
    const vecInicio = new Int32Array(n + 1);
    for (const k of pares) { vecInicio[Math.floor(k / n) + 1]++; vecInicio[(k % n) + 1]++; }
    for (let r = 0; r < n; r++) vecInicio[r + 1] += vecInicio[r];
    const vecLista = new Int32Array(vecInicio[n]);
    const vp = vecInicio.slice(0, n);
    for (const k of pares) { const a = Math.floor(k / n), b = k % n; vecLista[vp[a]++] = b; vecLista[vp[b]++] = a; }

    return {
      W, H, n, dueno, areas, radio, punto, sx, sy, borde, inicio, lista, caja, vecInicio, vecLista,
      centro: [(lx0 + lx1) / 2, (ly0 + ly1) / 2],
    };
  }

  function procesarPixeles(rgba, W, H, umbral) {
    const N = W * H;
    const gris = new Uint8Array(N);
    for (let i = 0, j = 0; i < N; i++, j += 4) gris[i] = (rgba[j] * 77 + rgba[j + 1] * 150 + rgba[j + 2] * 29) >> 8;
    const seg = segmentar(gris, W, H, umbral);
    // Capa de líneas: tinta casi negra con transparencia según la oscuridad del trazo.
    const lineas = new Uint8ClampedArray(N * 4);
    const l32 = new Uint32Array(lineas.buffer);
    for (let i = 0; i < N; i++) {
      const g = gris[i];
      if (g >= 232) continue;
      const a = g <= 70 ? 255 : Math.round(((232 - g) / 162) * 255);
      l32[i] = ((a << 24) | (32 << 16) | (22 << 8) | 26) >>> 0;
    }
    seg.lineas = lineas;
    return seg;
  }

  // Matiz (0-360), saturación y luminosidad (0-1) de un color.
  function hexHsl(hex) {
    const [r, g, b] = hexARgb(hex).map((v) => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    let h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return { h, s, l };
  }

  // ---------- Asignación de colores para "por números" (y para la referencia coloreada) ----------
  // Criterios de ilustración para que el resultado sea lógico y coherente con el dibujo (D-25):
  //  · el fondo lleva el tono más suave de la paleta;
  //  · las piezas repetidas reciben el mismo color: en los mandalas, las de igual tamaño a igual distancia
  //    del centro (simetría); en las escenas, las de forma y tamaño parecidos en la misma zona (hojas, escamas…);
  //  · jerarquía tonal: las zonas grandes van en tonos claros, las medianas en tonos medios y los
  //    detalles pequeños en los tonos más intensos u oscuros, como se hace al colorear a mano;
  //  · dos zonas vecinas nunca comparten color y se evita que tengan una luminosidad casi igual;
  //  · en las escenas, una zona grande pegada al borde superior tiende a cielo (azules claros) y una
  //    pegada al borde inferior, a suelo (verdes o tierras), si la paleta los tiene.
  function prepararNumeros(seg, libro, pagina, dif, opc = {}) {
    const cfg = DIFICULTAD[dif];
    const { n, areas, radio, sx, sy, borde, vecInicio, vecLista, W, H } = seg;
    const paleta = PALETAS[opc.paleta] || paletaDe(libro);
    const K = Math.min(cfg.colores, paleta.length);
    // Sin opciones la semilla es la de siempre: la referencia por defecto coincide con el modo Medio.
    const semilla = `${libro.id}|${pagina}|${dif}` + (opc.variante ? `|v${opc.variante}` : '') +
      (opc.paleta && opc.paleta !== libro.paleta ? `|${opc.paleta}` : '');
    const rnd = mulberry32(hashTexto(semilla));
    const areaTotal = W * H;

    let fondo = -1;
    for (let r = 0; r < n; r++) if (borde[r] && (fondo < 0 || areas[r] > areas[fondo])) fondo = r;

    const numerable = new Uint8Array(n);
    for (let r = 0; r < n; r++) numerable[r] = areas[r] >= cfg.minArea && radio[r] >= cfg.minRadio ? 1 : 0;

    // Grupos de piezas que deben compartir color.
    const grupo = new Int32Array(n);
    let G = 0;
    const mapa = new Map();
    const escala = Math.max(W, H);
    for (let r = 0; r < n; r++) {
      if (r === fondo) { grupo[r] = G++; continue; }
      const cx = sx[r] / areas[r], cy = sy[r] / areas[r];
      let k;
      if (libro.simetria) {
        const d = Math.hypot(cx - seg.centro[0], cy - seg.centro[1]) / escala;
        k = Math.round(Math.log(areas[r]) * 5) + ':' + Math.round(d * 60);
      } else if (areas[r] < areaTotal * 0.015) {
        // Forma (redondez) y tamaño parecidos dentro de la misma novena parte del dibujo.
        const redondez = Math.min(1, (Math.PI * radio[r] * radio[r]) / areas[r]);
        const celda = Math.min(2, (cx / W * 3) | 0) + 3 * Math.min(2, (cy / H * 3) | 0);
        k = Math.round(Math.log(areas[r]) * 3) + ':' + Math.round(redondez * 4) + ':' + celda;
      }
      let g = k === undefined ? undefined : mapa.get(k);
      if (g === undefined) { g = G++; if (k !== undefined) mapa.set(k, g); }
      grupo[r] = g;
    }

    const vecG = Array.from({ length: G }, () => new Set());
    const areaG = new Float64Array(G), pesoG = new Float64Array(G), cuentaG = new Float64Array(G);
    const syG = new Float64Array(G), bordeG = new Uint8Array(G);
    for (let r = 0; r < n; r++) {
      const g = grupo[r];
      areaG[g] += areas[r];
      pesoG[g] += numerable[r];
      cuentaG[g]++;
      syG[g] += sy[r];
      if (borde[r]) bordeG[g] = 1;
      for (let j = vecInicio[r], f = vecInicio[r + 1]; j < f; j++) {
        const gv = grupo[vecLista[j]];
        if (gv !== g) vecG[g].add(gv);
      }
    }

    // Bandas tonales de la paleta (sin el color de fondo): 0 = claros, 1 = medios, 2 = intensos/oscuros.
    const tono = paleta.slice(0, K).map(hexHsl);
    const porLuz = Array.from({ length: K - 1 }, (_, i) => i + 1).sort((a, b) => tono[b].l - tono[a].l);
    const banda = new Int8Array(K);
    porLuz.forEach((c, i) => { banda[c] = Math.min(2, Math.floor((i * 3) / porLuz.length)); });
    // Papel de cada grupo según el tamaño medio de sus piezas: grandes → claros, pequeñas → intensos.
    const papel = new Int8Array(G);
    const porTamano = Array.from({ length: G }, (_, g) => g).filter((g) => g !== grupo[fondo]).sort((a, b) => areaG[b] / cuentaG[b] - areaG[a] / cuentaG[a]);
    porTamano.forEach((g, i) => { const q = i / Math.max(1, porTamano.length); papel[g] = q < 0.3 ? 0 : q < 0.75 ? 1 : 2; });
    // Preferencias de escena (no mandalas): cielo arriba, suelo abajo.
    const escena = new Int8Array(G); // 1 = cielo, 2 = suelo
    if (!libro.simetria) {
      for (let g = 0; g < G; g++) {
        if (!bordeG[g] || areaG[g] < areaTotal * 0.02 || g === grupo[fondo]) continue;
        const cy = syG[g] / areaG[g] / H;
        if (cy < 0.35) escena[g] = 1; else if (cy > 0.7) escena[g] = 2;
      }
    }
    const afinidad = (c, pref) => {
      if (!pref) return 0;
      const { h, s, l } = tono[c];
      if (pref === 1) return h >= 175 && h <= 250 && l > 0.55 ? -6 : 2;
      return h >= 60 && h <= 165 ? -5 : h >= 18 && h <= 50 && s < 0.65 ? -3 : 2;
    };

    const colorG = new Int16Array(G).fill(-1);
    const uso = new Float64Array(K);
    let usoTotal = 0;
    if (fondo >= 0) { colorG[grupo[fondo]] = 0; uso[0] += 1; usoTotal += 1; }
    const orden = Array.from({ length: G }, (_, g) => g).sort((a, b) => areaG[b] - areaG[a]);
    const choques = new Int32Array(K);
    for (const g of orden) {
      if (colorG[g] >= 0) continue;
      choques.fill(0);
      const vecinos = [], vecinosGrandes = [];
      for (const v of vecG[g]) {
        if (colorG[v] < 0) continue;
        choques[colorG[v]]++;
        vecinos.push(colorG[v]);
        if (papel[v] <= 1 && v !== grupo[fondo]) vecinosGrandes.push(colorG[v]);
      }
      // En las escenas, una zona grande junto a otra grande suele ser parte del mismo objeto (cara y cuerpo,
      // tejado y pared): se prefieren colores análogos (matiz cercano, distinta luz) para que se lea como un todo.
      const analogos = !libro.simetria && papel[g] <= 1 && vecinosGrandes.length > 0;
      const enorme = areaG[g] > areaTotal * 0.1;
      const media = usoTotal / K + 1;
      let mejor = 1, costeMin = Infinity;
      for (let c = 0; c < K; c++) {
        let poco = 0, matiz = 0;
        for (const v of vecinos) if (v !== c && Math.abs(tono[v].l - tono[c].l) < 0.07) poco++;
        if (analogos) {
          for (const v of vecinosGrandes) { const dh = Math.abs(tono[v].h - tono[c].h); matiz += Math.min(dh, 360 - dh) / 180; }
          matiz /= vecinosGrandes.length;
        }
        const coste = choques[c] * 50 + poco * 2.5 + (c === 0 ? 6 : Math.abs(banda[c] - papel[g]) * 3.5)
          + matiz * 4 + (enorme ? tono[c].s * 3 : 0)
          + (uso[c] / media) * 1.6 + afinidad(c, escena[g]) + rnd() * 1.2;
        if (coste < costeMin) { costeMin = coste; mejor = c; }
      }
      colorG[g] = mejor;
      const peso = pesoG[g] || 0.3;
      uso[mejor] += peso; usoTotal += peso;
    }

    const colorR = new Int16Array(n);
    for (let r = 0; r < n; r++) colorR[r] = colorG[grupo[r]];

    // Numeración correlativa solo de los colores que aparecen en zonas numeradas.
    const presente = new Uint8Array(K);
    for (let r = 0; r < n; r++) if (numerable[r]) presente[colorR[r]] = 1;
    const numDeColor = new Int16Array(K).fill(-1);
    const numeros = [];
    for (let c = 0; c < K; c++) {
      if (!presente[c]) continue;
      numDeColor[c] = numeros.length;
      numeros.push({ hex: paleta[c], rgba: hexA32(paleta[c]), idx: c, total: 0, hechas: 0 });
    }
    const numR = new Int16Array(n).fill(-1);
    const etiquetas = [];
    let total = 0;
    for (let r = 0; r < n; r++) {
      if (!numerable[r]) continue;
      numR[r] = numDeColor[colorR[r]];
      numeros[numR[r]].total++;
      etiquetas.push(r);
      total++;
    }
    // De mayor a menor: al dibujar, en cuanto un número no cabe, tampoco cabrán los siguientes.
    etiquetas.sort((a, b) => radio[b] - radio[a]);
    return {
      dif, colorR, numR, numDeColor, numeros, paleta, total, hechas: 0,
      rellena: new Uint8Array(n), sel: 0, etiquetas: Int32Array.from(etiquetas),
    };
  }
  return { UMBRAL_LINEA, DIFICULTAD, PALETAS, hashTexto, mulberry32, hexARgb, hexA32, rgbAHex, esOscuro, paletaDe, segmentar, procesarPixeles, hexHsl, prepararNumeros };
})();

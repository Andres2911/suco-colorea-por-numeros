// SUCO · Colorea por números — versión para YouTube Playables.
// Usa el mismo núcleo que la web y las apps (análisis de zonas y asignación de colores, extraído de app/app.js
// por playables/construir.js) y cumple los requisitos de certificación de Playables:
//  · el progreso se guarda solo con ytgame.game.saveData (nada de localStorage ni IndexedDB);
//  · sin llamadas a servidores externos, sin enlaces, sin cuentas y sin compras;
//  · pausa total con onPause/onResume y sonido según el ajuste de YouTube;
//  · idioma según ytgame.system.getLanguage (con inglés siempre disponible);
//  · táctil y ratón en cualquier proporción de pantalla, y Esc cierra los diálogos.
'use strict';
(() => {
  const N = window.SUCONucleo;
  const CAT = window.SUCO_PLAYABLE;
  const $ = (s, r = document) => r.querySelector(s);
  const ESC = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- Textos (inglés obligatorio; español si YouTube indica ese idioma) ----------
  const TEXTOS = {
    en: {
      titulo: 'Color by Number', puntos: '{n} points', puntos_1: '1 point', fin_puntos_1: '+1 point', completados: '{a} of {b} done', volver: 'Back', como_jugar: 'How to play',
      ayuda: '<p>Pick a color in the palette and tap the areas with its number. Striped areas are the ones for the selected color.</p><p>Pinch or use the mouse wheel to zoom, and drag to move around. Tap <strong>Hint</strong> if you cannot find an area.</p><p>Each finished picture gives you points: 1 on Easy, 2 on Medium and 3 on Hard. Your progress is saved automatically.</p>',
      dibujo: 'Picture {n}', elige_nivel: 'Choose a level', facil: 'Easy', medio: 'Medium', dificil: 'Hard', colores: '{n} colors',
      continuar: 'Continue · {d} · {p}%', nueva: 'Start over', seguro: 'Start over? Your progress on this picture will be lost.',
      si_nueva: 'Yes, start over', cancelar: 'Cancel', completado_en: 'Completed on {d}', jugar_otra: 'Play again',
      preparando: 'Preparing the picture…', pista: 'Hint', referencia: 'Reference', ref_titulo: 'Colored reference',
      ref_texto: 'See how the finished picture will look. Unlock it for this picture by watching a short ad.',
      ref_anuncio: 'Watch an ad to unlock', ref_ver: 'See the reference', ref_no: 'The ad was not completed. You can try again.',
      cerrar: 'Close', zona_de: 'This area is number {n}', color_hecho: 'Color {n} complete!', sin_pista: 'This color is complete',
      fin_titulo: 'Picture complete!', fin_puntos: '+{n} points', fin_repetida: 'You had already completed this picture on this level.',
      siguiente: 'Next picture', volver_libro: 'Back to the book', todo_hecho: 'You have completed every picture! More are coming soon.',
      libro_hecho: 'Book complete!', acercar: 'Zoom in', alejar: 'Zoom out', ajustar: 'Fit to screen',
      error_cargar: 'The picture could not be loaded.', reintentar: 'Try again', progreso: '{p}%', hecho: 'Done', lienzo: 'Picture to color',
      color_n: 'Color {n}', quedan: '{n} left',
    },
    es: {
      titulo: 'Colorea por números', puntos: '{n} puntos', puntos_1: '1 punto', fin_puntos_1: '+1 punto', completados: '{a} de {b} completados', volver: 'Volver', como_jugar: 'Cómo se juega',
      ayuda: '<p>Elige un color de la paleta y toca las zonas con su número. Las zonas rayadas son las del color elegido.</p><p>Pellizca o usa la rueda del ratón para acercar, y arrastra para moverte. Toca <strong>Pista</strong> si no encuentras una zona.</p><p>Cada dibujo terminado te da puntos: 1 en Fácil, 2 en Medio y 3 en Difícil. Tu progreso se guarda solo.</p>',
      dibujo: 'Dibujo {n}', elige_nivel: 'Elige el nivel', facil: 'Fácil', medio: 'Medio', dificil: 'Difícil', colores: '{n} colores',
      continuar: 'Continuar · {d} · {p} %', nueva: 'Empezar de nuevo', seguro: '¿Empezar de nuevo? Se perderá el progreso de este dibujo.',
      si_nueva: 'Sí, empezar de nuevo', cancelar: 'Cancelar', completado_en: 'Completado en {d}', jugar_otra: 'Jugar otra vez',
      preparando: 'Preparando el dibujo…', pista: 'Pista', referencia: 'Referencia', ref_titulo: 'Referencia coloreada',
      ref_texto: 'Mira cómo quedará el dibujo terminado. Desbloquéala para este dibujo viendo un anuncio breve.',
      ref_anuncio: 'Ver un anuncio y desbloquearla', ref_ver: 'Ver la referencia', ref_no: 'El anuncio no se completó. Puedes intentarlo de nuevo.',
      cerrar: 'Cerrar', zona_de: 'Esta zona es el número {n}', color_hecho: '¡Color {n} completado!', sin_pista: 'Este color ya está completo',
      fin_titulo: '¡Dibujo completado!', fin_puntos: '+{n} puntos', fin_repetida: 'Ya habías completado este dibujo en este nivel.',
      siguiente: 'Siguiente dibujo', volver_libro: 'Volver al libro', todo_hecho: '¡Has completado todos los dibujos! Pronto añadiremos más.',
      libro_hecho: '¡Libro completado!', acercar: 'Acercar', alejar: 'Alejar', ajustar: 'Ver entero',
      error_cargar: 'No se pudo cargar el dibujo.', reintentar: 'Reintentar', progreso: '{p} %', hecho: 'Hecho', lienzo: 'Dibujo para colorear',
      color_n: 'Color {n}', quedan: 'Quedan {n}',
    },
  };
  let idioma = 'en';
  const T = (k, v) => {
    let s = TEXTOS[idioma][k] ?? TEXTOS.en[k] ?? k;
    if (v) s = s.replace(/\{(\w+)\}/g, (_, n) => (v[n] ?? ''));
    return s;
  };
  const tituloLibro = (l) => (idioma === 'es' ? l.titulo : l.titulo_en || l.titulo);

  // ---------- Plataforma: SDK de YouTube Playables ----------
  // Fuera de YouTube el SDK no hace nada: la partida vive en memoria o, en la versión web de pruebas
  // (construir.js --demo, nunca en el paquete de YouTube), en el almacén que ofrece demo.js.
  const yt = typeof ytgame !== 'undefined' ? ytgame : null;
  const enYT = !!(yt && yt.IN_PLAYABLES_ENV);
  const DEMO = !enYT && window.SUCO_DEMO ? window.SUCO_DEMO : null;
  let memoria = '';
  const P = {
    primerFotograma() { try { if (yt) yt.game.firstFrameReady(); } catch (e) { P.error(e); } },
    listo() { try { if (yt) yt.game.gameReady(); } catch (e) { P.error(e); } },
    async cargar() {
      if (!enYT) return DEMO ? DEMO.cargar() : memoria;
      for (let intento = 0; ; intento++) {
        try { return (await yt.game.loadData()) || ''; } catch (e) {
          if (intento >= 2 || e?.errorType !== 'API_UNAVAILABLE') throw e;
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    },
    async guardar(s) { if (!enYT) { memoria = s; if (DEMO) DEMO.guardar(s); return; } await yt.game.saveData(s); },
    sonidoActivo() { try { return enYT ? yt.system.isAudioEnabled() : true; } catch { return true; } },
    alCambiarSonido(cb) { if (enYT) yt.system.onAudioEnabledChange(cb); },
    alPausar(cb) { if (enYT) yt.system.onPause(cb); },
    alReanudar(cb) { if (enYT) yt.system.onResume(cb); },
    async idioma() {
      if (enYT) { try { return await yt.system.getLanguage(); } catch (e) { P.error(e); return 'en'; } }
      return new URLSearchParams(location.search).get('lang') || (DEMO && DEMO.idioma) || 'es';
    },
    puntuacion(v) { if (enYT) yt.engagement.sendScore({ value: v }).catch((e) => P.error(e)); },
    // Anuncio recompensado de YouTube: true si se ganó la recompensa. Si los anuncios no están disponibles
    // (por ejemplo, durante la vista previa), se concede igualmente: nunca se bloquea a quien juega.
    async anuncioRecompensa(id) {
      if (!enYT) return true;
      try { return await yt.ads.requestRewardedAd(id); } catch { return true; }
    },
    anuncioIntersticial() { return enYT ? yt.ads.requestInterstitialAd().catch(() => {}) : Promise.resolve(); },
    error(e) { try { if (enYT) yt.health.logError(); } catch { /* sin registro */ } console.error(e); },
  };
  window.addEventListener('error', (e) => P.error(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => P.error(e.reason));

  // ---------- Sonido sintetizado (sin archivos): solo tras una acción y si YouTube no está en silencio ----------
  const Sonido = (() => {
    let ac = null, activo = true, pausado = false, permitido = false;
    // El audio solo se crea tras un gesto (toque, clic o tecla): nunca suena sin una acción de la persona.
    const permitir = () => { permitido = true; };
    for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, permitir, { capture: true, once: true });
    const contexto = () => {
      if (!ac) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
      return ac;
    };
    const aplicar = () => { if (ac) (activo && !pausado ? ac.resume() : ac.suspend()).catch(() => {}); };
    function nota(a, f, t0, dur, tipo = 'sine', vol = 0.12) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = tipo; o.frequency.value = f;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    }
    return {
      tocar(nombre) {
        if (!activo || pausado || !permitido) return;
        const a = contexto(); if (!a) return;
        if (a.state === 'suspended') a.resume().catch(() => {});
        const t = a.currentTime + 0.01;
        if (nombre === 'pop') nota(a, 660 + Math.random() * 120, t, 0.12, 'sine', 0.1);
        else if (nombre === 'error') nota(a, 180, t, 0.18, 'triangle', 0.08);
        else if (nombre === 'color') { nota(a, 784, t, 0.18); nota(a, 1046, t + 0.09, 0.25); }
        else if (nombre === 'fin') [523, 659, 784, 1046].forEach((f, i) => nota(a, f, t + i * 0.11, 0.4, 'sine', 0.11));
      },
      activar(v) { activo = !!v; aplicar(); },
      pausar(p) { pausado = !!p; aplicar(); },
    };
  })();

  // ---------- Partida guardada (solo con saveData; formato compacto y versionado) ----------
  const LETRA = { facil: 'f', medio: 'm', dificil: 'x' }, NIVEL = { f: 'facil', m: 'medio', x: 'dificil' };
  const PUNTOS = { facil: 1, medio: 2, dificil: 3 };
  const nueva = () => ({ v: 1, hechas: {}, curso: {}, ref: [], comp: 0 });
  let G = nueva(), cargado = false, tGuardar = 0, cola = Promise.resolve();
  const clave = (l, n) => `${l.id}/${n}`;
  const puntos = () => Object.values(G.hechas).reduce((a, l) => a + (PUNTOS[NIVEL[l]] || 0), 0);
  function leerPartida(txt) {
    // Debe aceptar partidas de versiones anteriores (o dañadas) sin fallar.
    try {
      const d = JSON.parse(txt || '{}');
      const g = nueva();
      if (d && typeof d === 'object') {
        if (d.hechas && typeof d.hechas === 'object') for (const [k, v] of Object.entries(d.hechas)) if (NIVEL[v]) g.hechas[k] = v;
        if (d.curso && typeof d.curso === 'object') for (const [k, v] of Object.entries(d.curso)) if (v && NIVEL[v.d] && typeof v.b === 'string' && v.n > 0) g.curso[k] = v;
        if (Array.isArray(d.ref)) g.ref = d.ref.filter((k) => typeof k === 'string');
        if (Number.isFinite(d.comp)) g.comp = d.comp;
      }
      return g;
    } catch { return nueva(); }
  }
  function guardarPronto() { clearTimeout(tGuardar); tGuardar = setTimeout(guardarYa, 3000); }
  function guardarYa() {
    clearTimeout(tGuardar);
    if (!cargado) return cola; // nunca se guarda antes de haber leído la partida (requisito de integración 9)
    volcarPartida();
    const s = JSON.stringify(G);
    cola = cola.then(() => P.guardar(s)).catch((e) => {
      if (e?.errorType === 'SIZE_LIMIT_EXCEEDED') recortarPartida();
      P.error(e);
    });
    return cola;
  }
  // Si algún día se superase el límite, se conservan solo los 10 dibujos en curso más recientes.
  function recortarPartida() {
    const orden = Object.entries(G.curso).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
    G.curso = Object.fromEntries(orden.slice(0, 10));
  }
  function aBits(rellena) {
    const b = new Uint8Array((rellena.length + 7) >> 3);
    for (let i = 0; i < rellena.length; i++) if (rellena[i]) b[i >> 3] |= 1 << (i & 7);
    let s = '';
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function deBits(txt, n) {
    const s = atob(txt), r = new Uint8Array(n);
    for (let i = 0; i < n; i++) r[i] = (s.charCodeAt(i >> 3) >> (i & 7)) & 1;
    return r;
  }

  // ---------- Vistas y diálogos ----------
  const VISTAS = ['biblioteca', 'libro', 'juego'];
  let vista = 'biblioteca', libroActual = null;
  // Cada lista recuerda dónde estaba: al volver de un dibujo, el libro sigue en el mismo sitio.
  const app = $('#app'), posiciones = {};
  function mostrar(v) {
    if (vista !== 'juego') posiciones[vista] = app.scrollTop;
    vista = v;
    for (const n of VISTAS) $(`#v-${n}`).hidden = n !== v;
    document.body.classList.toggle('en-juego', v === 'juego');
    app.scrollTop = v === 'juego' ? 0 : posiciones[v] || 0;
  }

  // ---------- Desplazamiento táctil propio ----------
  // El SDK de YouTube Playables desactiva el desplazamiento táctil del navegador (pone touch-action: none
  // en <body>), así que con el dedo las listas se desplazan con este código, con inercia, igual en Android,
  // iOS y web. El ratón y la rueda siguen usando el desplazamiento nativo.
  let suprimirClic = 0;
  document.addEventListener('click', (e) => {
    // Un arrastre no debe acabar abriendo el libro o el dibujo sobre el que se levantó el dedo.
    if (performance.now() < suprimirClic) { e.stopPropagation(); e.preventDefault(); }
  }, true);
  const inercias = new Set();
  function desplazable(el, ignorar = null) {
    let ini = null, ultimo = null, vx = 0, vy = 0, arrastre = false, anim = 0;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || (ignorar && e.target.closest(ignorar))) return;
      cancelAnimationFrame(anim);
      ini = { id: e.pointerId, x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
      ultimo = { x: e.clientX, y: e.clientY, t: performance.now() };
      vx = vy = 0; arrastre = false;
    });
    el.addEventListener('pointermove', (e) => {
      if (!ini || e.pointerId !== ini.id) return;
      const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      if (!arrastre) {
        if (Math.hypot(dx, dy) < 8) return;
        arrastre = true;
        try { el.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
      }
      el.scrollLeft = ini.sl - dx;
      el.scrollTop = ini.st - dy;
      const t = performance.now(), dt = Math.max(8, t - ultimo.t);
      vx = 0.7 * ((ultimo.x - e.clientX) / dt) + 0.3 * vx;
      vy = 0.7 * ((ultimo.y - e.clientY) / dt) + 0.3 * vy;
      ultimo = { x: e.clientX, y: e.clientY, t };
    });
    const soltar = (e) => {
      if (!ini || e.pointerId !== ini.id) return;
      ini = null;
      if (!arrastre) return;
      suprimirClic = performance.now() + 350;
      // Si el dedo se quedó quieto antes de soltar, no hay inercia.
      if (performance.now() - ultimo.t > 120) return;
      let px = vx * 16, py = vy * 16;
      const paso = () => {
        if (J.pausado) return;
        px *= 0.94; py *= 0.94;
        el.scrollLeft += px; el.scrollTop += py;
        if (Math.abs(px) > 0.4 || Math.abs(py) > 0.4) anim = requestAnimationFrame(paso); else inercias.delete(detener);
      };
      const detener = () => cancelAnimationFrame(anim);
      inercias.add(detener);
      anim = requestAnimationFrame(paso);
    };
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
  }
  const modal = $('#modal');
  function abrirModal(html, clase = '') {
    modal.className = `modal ${clase}`;
    modal.innerHTML = `<div class="modal-cuerpo">${html}</div>`;
    if (!modal.open) modal.showModal();
  }
  const cerrarModal = () => { if (modal.open) modal.close(); };
  modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
  desplazable(app, '#v-juego');
  desplazable($('#paleta'));
  desplazable(modal);

  function aplicarTextos() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((e) => { e.textContent = T(e.dataset.t); });
    document.querySelectorAll('[data-t-aria]').forEach((e) => { e.setAttribute('aria-label', T(e.dataset.tAria)); });
    document.querySelectorAll('[data-t-title]').forEach((e) => { e.title = T(e.dataset.tTitle); });
    $('#lienzo').setAttribute('aria-label', T('lienzo'));
  }

  // ---------- Biblioteca y libro ----------
  const hechasDe = (l) => Array.from({ length: l.paginas }, (_, i) => G.hechas[clave(l, i + 1)]).filter(Boolean).length;
  const todoHecho = () => CAT.libros.every((l) => hechasDe(l) === l.paginas);
  function renderBiblioteca() {
    $('#puntos').textContent = puntos() === 1 ? T('puntos_1') : T('puntos', { n: puntos() });
    const fin = $('#aviso-fin');
    fin.hidden = !todoHecho();
    fin.textContent = T('todo_hecho');
    $('#rejilla-libros').innerHTML = CAT.libros.map((l) => {
      const h = hechasDe(l);
      return `<button type="button" class="libro" data-libro="${l.id}">
        <span class="portada"><img src="miniaturas/${l.id}/1.png" alt="" width="240" height="321" decoding="async"></span>
        <span class="info"><strong>${ESC(tituloLibro(l))}</strong>
        <span class="avance" aria-hidden="true"><i style="width:${(100 * h) / l.paginas}%"></i></span>
        <small>${h === l.paginas ? `✓ ${T('libro_hecho')}` : T('completados', { a: h, b: l.paginas })}</small></span></button>`;
    }).join('');
  }
  function renderLibro() {
    const l = libroActual;
    $('#libro-titulo').textContent = tituloLibro(l);
    $('#libro-sub').textContent = T('completados', { a: hechasDe(l), b: l.paginas });
    $('#rejilla-paginas').innerHTML = Array.from({ length: l.paginas }, (_, i) => {
      const n = i + 1, k = clave(l, n), hecha = G.hechas[k], curso = G.curso[k];
      const sello = hecha ? `<span class="sello hecho">✓ ${T(NIVEL[hecha])}</span>`
        : curso ? `<span class="sello curso">${T('progreso', { p: curso.p || 0 })}</span>` : '';
      return `<button type="button" class="pagina" data-pagina="${n}" aria-label="${ESC(T('dibujo', { n }))}">
        <span class="lamina"><img src="miniaturas/${l.id}/${n}.png" alt="" width="240" height="321" loading="lazy" decoding="async"></span>
        <span class="pie">${ESC(T('dibujo', { n }))}${sello}</span></button>`;
    }).join('');
  }
  function abrirLibro(id) {
    libroActual = CAT.libros.find((l) => l.id === id);
    if (!libroActual) return;
    posiciones.libro = 0;
    renderLibro();
    mostrar('libro');
  }
  function elegirNivel(l, n) {
    const k = clave(l, n), curso = G.curso[k], hecha = G.hechas[k];
    const niveles = ['facil', 'medio', 'dificil'].map((d) =>
      `<button type="button" class="nivel" data-nivel="${d}"><strong>${T(d)}</strong><small>${T('colores', { n: N.DIFICULTAD[d].colores })}</small></button>`).join('');
    abrirModal(`<h2>${ESC(T('dibujo', { n }))} · <span class="tenue">${ESC(tituloLibro(l))}</span></h2>
      ${hecha ? `<p class="sello hecho grande">✓ ${T('completado_en', { d: T(NIVEL[hecha]) })}</p>` : ''}
      ${curso ? `<button type="button" class="btn primario ancho" data-continuar="1">${T('continuar', { d: T(NIVEL[curso.d]), p: curso.p || 0 })}</button>
        <p class="separador">${T('nueva')}</p>` : `<p class="tenue">${hecha ? T('jugar_otra') : T('elige_nivel')}</p>`}
      <div class="niveles">${niveles}</div>
      <button type="button" class="btn texto ancho" data-acc="cerrar-modal">${T('cancelar')}</button>`);
    modal.dataset.libro = l.id; modal.dataset.pagina = n;
  }

  // ---------- Juego: análisis, estado y dibujo ----------
  const lienzo = $('#lienzo'), ctx = lienzo.getContext('2d');
  const zona = $('#zona');
  const J = {
    libro: null, n: 0, seg: null, num: null, pintura: null, ctxP: null, img: null, u32: null, lineas: null,
    s: 1, tx: 0, ty: 0, s0: 1, cw: 1, ch: 1, dpr: 1, ajustado: true, pausado: false, pulsos: [], anim: null,
  };
  const cacheSeg = new Map();
  async function analizar(l, n) {
    const k = clave(l, n);
    if (cacheSeg.has(k)) return cacheSeg.get(k);
    const img = new Image();
    img.src = `paginas/${l.id}/${n}.png`;
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0);
    // Deja pintar el indicador antes del cálculo (se hace en el hilo principal: sin Web Workers ni eval).
    await new Promise((r) => setTimeout(r, 30));
    const seg = N.procesarPixeles(x.getImageData(0, 0, W, H).data, W, H, N.UMBRAL_LINEA);
    const lc = document.createElement('canvas');
    lc.width = W; lc.height = H;
    lc.getContext('2d').putImageData(new ImageData(seg.lineas, W, H), 0, 0);
    seg.lienzoLineas = lc;
    cacheSeg.set(k, seg);
    while (cacheSeg.size > 2) cacheSeg.delete(cacheSeg.keys().next().value);
    return seg;
  }

  async function abrirJuego(l, n, dif, continuar) {
    guardarYa();
    cerrarModal();
    J.libro = l; J.n = n; J.num = null;
    confeti = []; cancelAnimationFrame(J.animConfeti);
    { const c = $('#confeti'); c.getContext('2d').clearRect(0, 0, c.width, c.height); }
    $('#mensaje').classList.remove('visible');
    mostrar('juego');
    $('#juego-titulo').textContent = tituloLibro(l);
    $('#juego-sub').textContent = `${T('dibujo', { n })} · ${T(dif)}`;
    $('#paleta').innerHTML = '';
    $('#preparando').hidden = false;
    medir();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    let seg;
    try { seg = await analizar(l, n); } catch (e) {
      P.error(e);
      $('#preparando').hidden = true;
      abrirModal(`<h2>${T('error_cargar')}</h2><div class="botones"><button type="button" class="btn primario" data-reintentar="${dif}">${T('reintentar')}</button>
        <button type="button" class="btn texto" data-acc="salir-juego">${T('volver')}</button></div>`);
      modal.dataset.libro = l.id; modal.dataset.pagina = n;
      return;
    }
    if (J.libro !== l || J.n !== n) return;
    const num = N.prepararNumeros(seg, l, n, dif);
    const c = G.curso[clave(l, n)];
    if (continuar && c && c.n === seg.n && NIVEL[c.d] === dif) {
      const bits = deBits(c.b, seg.n);
      for (let r = 0; r < seg.n; r++) {
        if (bits[r] && num.numR[r] >= 0 && !num.rellena[r]) { num.rellena[r] = 1; num.numeros[num.numR[r]].hechas++; num.hechas++; }
      }
    } else delete G.curso[clave(l, n)];
    J.seg = seg; J.num = num;
    J.pintura = document.createElement('canvas');
    J.pintura.width = seg.W; J.pintura.height = seg.H;
    J.ctxP = J.pintura.getContext('2d');
    J.img = J.ctxP.createImageData(seg.W, seg.H);
    J.u32 = new Uint32Array(J.img.data.buffer);
    const primero = num.numeros.findIndex((x) => x.hechas < x.total);
    num.sel = primero < 0 ? 0 : primero;
    $('#preparando').hidden = true;
    ajustar();
    pintarTodo();
    renderPaleta();
    actualizarProgreso();
  }

  const completoColor = (k) => { const c = J.num.numeros[k]; return !!c && c.hechas >= c.total; };
  const todoCompleto = () => J.num.hechas >= J.num.total;
  // Rayas del color elegido (mezclado con blanco) en las zonas que le faltan.
  function rayas() {
    const [r, g, b] = N.hexARgb(J.num.numeros[J.num.sel]?.hex || '#cccccc');
    const mezcla = (f) => { const m = (v) => Math.round(v * (1 - f) + 255 * f); return ((255 << 24) | (m(b) << 16) | (m(g) << 8) | m(r)) >>> 0; };
    return [mezcla(0.78), mezcla(0.6)];
  }
  function colorDeZona(r, raya) {
    const { num } = J, k = num.numR[r];
    if (k >= 0) {
      if (num.rellena[r]) return num.numeros[k].rgba;
      return k === num.sel && !todoCompleto() ? raya : 0;
    }
    const kc = num.numDeColor[num.colorR[r]];
    return todoCompleto() || (kc >= 0 && completoColor(kc)) ? N.hexA32(num.paleta[num.colorR[r]]) : 0;
  }
  function pintarZona(r, color) {
    const { seg } = J, u = J.u32, W = seg.W;
    for (let j = seg.inicio[r], f = seg.inicio[r + 1]; j < f; j++) {
      const p = seg.lista[j];
      u[p] = color === 0 ? 0xffffffff : Array.isArray(color) ? color[(((p % W) + ((p / W) | 0)) >> 3) & 1] : color;
    }
  }
  function pintarTodo() {
    const { seg } = J;
    J.u32.fill(0xffffffff);
    const raya = rayas();
    for (let r = 0; r < seg.n; r++) { const c = colorDeZona(r, raya); if (c) pintarZona(r, c); }
    J.ctxP.putImageData(J.img, 0, 0);
    J.ctxP.drawImage(seg.lienzoLineas, 0, 0);
    dibujar();
  }
  function refrescarZona(r) {
    const c = J.seg.caja, x0 = c[r * 4], y0 = c[r * 4 + 1], w = c[r * 4 + 2] - x0 + 1, h = c[r * 4 + 3] - y0 + 1;
    J.ctxP.putImageData(J.img, 0, 0, x0, y0, w, h);
    J.ctxP.drawImage(J.seg.lienzoLineas, x0, y0, w, h, x0, y0, w, h);
  }

  // Vista: escala y desplazamiento en píxeles CSS de la zona.
  function medir() {
    J.cw = Math.max(1, zona.clientWidth); J.ch = Math.max(1, zona.clientHeight);
    J.dpr = Math.min(3, window.devicePixelRatio || 1);
    lienzo.width = Math.round(J.cw * J.dpr); lienzo.height = Math.round(J.ch * J.dpr);
    lienzo.style.width = J.cw + 'px'; lienzo.style.height = J.ch + 'px';
    const conf = $('#confeti');
    conf.width = lienzo.width; conf.height = lienzo.height;
    conf.style.width = lienzo.style.width; conf.style.height = lienzo.style.height;
  }
  function ajustar() {
    if (!J.seg) return;
    J.s0 = Math.min(J.cw / J.seg.W, J.ch / J.seg.H) * 0.94;
    J.s = J.s0; J.tx = (J.cw - J.seg.W * J.s) / 2; J.ty = (J.ch - J.seg.H * J.s) / 2;
    J.ajustado = true;
    dibujar();
  }
  function encuadrar() {
    // El dibujo nunca se pierde de vista: siempre queda al menos un margen dentro de la zona.
    const m = 80, w = J.seg.W * J.s, h = J.seg.H * J.s;
    J.tx = limitar(J.tx, Math.min(m - w, (J.cw - w) / 2), Math.max(J.cw - m, (J.cw - w) / 2));
    J.ty = limitar(J.ty, Math.min(m - h, (J.ch - h) / 2), Math.max(J.ch - m, (J.ch - h) / 2));
  }
  function zoomEn(f, cx, cy) {
    if (!J.seg) return;
    const s = limitar(J.s * f, J.s0 * 0.9, J.s0 * 14), k = s / J.s;
    J.tx = cx - (cx - J.tx) * k; J.ty = cy - (cy - J.ty) * k; J.s = s;
    J.ajustado = false;
    encuadrar(); dibujar();
  }
  new ResizeObserver(() => {
    if (vista !== 'juego') return;
    // Conserva el punto central del dibujo al cambiar el tamaño o la orientación (el progreso no se pierde).
    const cxi = J.seg ? (J.cw / 2 - J.tx) / J.s : 0, cyi = J.seg ? (J.ch / 2 - J.ty) / J.s : 0;
    const relativa = J.s / J.s0;
    medir();
    if (!J.seg) return;
    if (J.ajustado) { ajustar(); return; }
    J.s0 = Math.min(J.cw / J.seg.W, J.ch / J.seg.H) * 0.94;
    J.s = J.s0 * relativa;
    J.tx = J.cw / 2 - cxi * J.s; J.ty = J.ch / 2 - cyi * J.s;
    encuadrar(); dibujar();
  }).observe(zona);

  let pendiente = false;
  function dibujar() {
    if (pendiente || J.pausado) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; if (!J.pausado) dibujarYa(); });
  }
  function dibujarYa() {
    const x = ctx, d = J.dpr;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, lienzo.width, lienzo.height);
    if (!J.seg || !J.num) return;
    x.setTransform(d * J.s, 0, 0, d * J.s, d * J.tx, d * J.ty);
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, J.seg.W, J.seg.H);
    x.drawImage(J.pintura, 0, 0);
    // Números de las zonas que faltan (de mayor a menor: en cuanto uno no cabe, tampoco caben los siguientes).
    x.setTransform(d, 0, 0, d, 0, 0);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const { seg, num } = J, W = seg.W;
    for (const r of num.etiquetas) {
      if (num.rellena[r]) continue;
      const rs = seg.radio[r] * J.s;
      if (rs < 5.5) break;
      const p = seg.punto[r], sx = (p % W + 0.5) * J.s + J.tx, sy = (((p / W) | 0) + 0.5) * J.s + J.ty;
      if (sx < -30 || sy < -30 || sx > J.cw + 30 || sy > J.ch + 30) continue;
      const k = num.numR[r], sel = k === num.sel;
      x.font = `${sel ? 900 : 700} ${limitar(rs * 1.15, 9, 30).toFixed(1)}px Nunito, system-ui, sans-serif`;
      x.fillStyle = sel ? '#1f1c26' : 'rgba(42,39,51,.55)';
      x.fillText(String(k + 1), sx, sy);
    }
    // Pulsos al pintar o al mostrar una pista
    const ahora = performance.now();
    J.pulsos = J.pulsos.filter((q) => ahora - q.t0 < 600);
    for (const q of J.pulsos) {
      const t = (ahora - q.t0) / 600;
      x.strokeStyle = q.color; x.globalAlpha = 1 - t; x.lineWidth = 3;
      x.beginPath(); x.arc(q.x * J.s + J.tx, q.y * J.s + J.ty, (q.r * J.s) * (0.6 + t * 1.2) + 6, 0, Math.PI * 2); x.stroke();
      x.globalAlpha = 1;
    }
    if (J.pulsos.length) dibujar();
  }

  // ---------- Paleta y progreso ----------
  function renderPaleta() {
    const { num } = J;
    $('#paleta').innerHTML = num.numeros.map((c, k) => {
      const hecho = c.hechas >= c.total;
      const oscuro = N.esOscuro(c.hex);
      return `<button type="button" class="muestra ${hecho ? 'hecha' : ''}" role="radio" aria-checked="${k === num.sel}" data-color="${k}"
        aria-label="${ESC(T('color_n', { n: k + 1 }))}, ${hecho ? T('hecho') : T('quedan', { n: c.total - c.hechas })}"
        style="--c:${c.hex};--t:${oscuro ? '#fff' : '#1f1c26'}"><span class="disco">${hecho ? '✓' : k + 1}</span>
        <span class="resto">${hecho ? '' : c.total - c.hechas}</span></button>`;
    }).join('');
    $('#paleta [aria-checked="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function seleccionar(k) {
    if (!J.num || k < 0 || k >= J.num.numeros.length || k === J.num.sel) return;
    J.num.sel = k;
    document.querySelectorAll('#paleta .muestra').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.color === k)));
    pintarTodo();
  }
  function actualizarProgreso() {
    const p = J.num.total ? Math.floor((100 * J.num.hechas) / J.num.total) : 0;
    $('#progreso-barra').style.width = p + '%';
    $('#progreso-texto').textContent = T('progreso', { p });
  }
  let tMensaje = 0;
  function mensaje(t) {
    const m = $('#mensaje');
    m.textContent = t; m.classList.add('visible');
    clearTimeout(tMensaje); tMensaje = setTimeout(() => m.classList.remove('visible'), 1800);
  }

  // ---------- Pintar ----------
  function zonaCercana(ix, iy, k) {
    const { seg, num } = J, W = seg.W, H = seg.H, rad = Math.round(limitar(14 / J.s, 3, 40));
    let mejor = -1, dMin = Infinity;
    for (let y = Math.max(0, iy - rad); y <= Math.min(H - 1, iy + rad); y += 2) {
      for (let x = Math.max(0, ix - rad); x <= Math.min(W - 1, ix + rad); x += 2) {
        const r = seg.dueno[y * W + x];
        if (r < 0 || num.numR[r] !== k || num.rellena[r]) continue;
        const d = (x - ix) ** 2 + (y - iy) ** 2;
        if (d < dMin) { dMin = d; mejor = r; }
      }
    }
    return mejor;
  }
  function tocar(sx, sy) {
    const { seg, num } = J;
    if (!seg || !num || todoCompleto()) return;
    const ix = Math.floor((sx - J.tx) / J.s), iy = Math.floor((sy - J.ty) / J.s);
    if (ix < 0 || iy < 0 || ix >= seg.W || iy >= seg.H) return;
    let r = seg.dueno[iy * seg.W + ix];
    if (r < 0 || num.numR[r] !== num.sel || num.rellena[r]) {
      const cerca = zonaCercana(ix, iy, num.sel);
      if (cerca >= 0) r = cerca;
    }
    if (r < 0) return;
    const k = num.numR[r];
    if (k < 0 || num.rellena[r]) return;
    if (k !== num.sel) {
      mensaje(T('zona_de', { n: k + 1 }));
      Sonido.tocar('error');
      const b = $(`#paleta [data-color="${k}"]`);
      if (b) { b.classList.remove('sacudir'); void b.offsetWidth; b.classList.add('sacudir'); }
      return;
    }
    num.rellena[r] = 1; num.numeros[k].hechas++; num.hechas++;
    pintarZona(r, num.numeros[k].rgba);
    refrescarZona(r);
    const p = seg.punto[r];
    J.pulsos.push({ x: p % seg.W, y: (p / seg.W) | 0, r: seg.radio[r], t0: performance.now(), color: num.numeros[k].hex });
    actualizarProgreso();
    guardarPronto();
    if (todoCompleto()) { renderPaleta(); pintarTodo(); completar(); return; }
    if (completoColor(k)) {
      Sonido.tocar('color');
      mensaje(T('color_hecho', { n: k + 1 }));
      // Se descubren las zonas pequeñas de ese color y se pasa al siguiente color pendiente.
      let sig = num.numeros.findIndex((c, i) => i > k && c.hechas < c.total);
      if (sig < 0) sig = num.numeros.findIndex((c) => c.hechas < c.total);
      num.sel = sig < 0 ? k : sig;
      renderPaleta();
      pintarTodo();
    } else {
      Sonido.tocar('pop');
      const b = $(`#paleta [data-color="${k}"] .resto`);
      if (b) b.textContent = num.numeros[k].total - num.numeros[k].hechas;
      dibujar();
    }
  }
  function pista() {
    const { seg, num } = J;
    if (!num) return;
    let mejor = -1;
    for (let r = 0; r < seg.n; r++) if (num.numR[r] === num.sel && !num.rellena[r] && (mejor < 0 || seg.radio[r] > seg.radio[mejor])) mejor = r;
    if (mejor < 0) { mensaje(T('sin_pista')); return; }
    const p = seg.punto[mejor], x = p % seg.W, y = (p / seg.W) | 0;
    const s = limitar(Math.max(J.s, 18 / Math.max(2, seg.radio[mejor])), J.s0, J.s0 * 14);
    animarVista(s, J.cw / 2 - x * s, J.ch / 2 - y * s, () => {
      J.pulsos.push({ x, y, r: seg.radio[mejor], t0: performance.now(), color: '#e4572e' });
      dibujar();
    });
  }
  function animarVista(s, tx, ty, fin) {
    const s0 = J.s, tx0 = J.tx, ty0 = J.ty, t0 = performance.now(), dur = 380;
    cancelAnimationFrame(J.anim);
    const paso = (ahora) => {
      if (J.pausado) return;
      const t = Math.min(1, (ahora - t0) / dur), e = 1 - (1 - t) ** 3;
      J.s = s0 + (s - s0) * e; J.tx = tx0 + (tx - tx0) * e; J.ty = ty0 + (ty - ty0) * e;
      J.ajustado = false;
      dibujarYa();
      if (t < 1) J.anim = requestAnimationFrame(paso); else if (fin) fin();
    };
    J.anim = requestAnimationFrame(paso);
  }

  // ---------- Referencia coloreada (desbloqueable con un anuncio recompensado de YouTube) ----------
  function imagenFinal() {
    const { seg, num } = J;
    const c = document.createElement('canvas');
    c.width = seg.W; c.height = seg.H;
    const x = c.getContext('2d');
    const img = x.createImageData(seg.W, seg.H), u = new Uint32Array(img.data.buffer);
    for (let r = 0; r < seg.n; r++) {
      const rgba = N.hexA32(num.paleta[num.colorR[r]]);
      for (let j = seg.inicio[r], f = seg.inicio[r + 1]; j < f; j++) u[seg.lista[j]] = rgba;
    }
    x.putImageData(img, 0, 0);
    x.drawImage(seg.lienzoLineas, 0, 0);
    return c;
  }
  function verReferencia() {
    if (!J.num) return;
    const k = clave(J.libro, J.n);
    if (!G.ref.includes(k)) {
      abrirModal(`<h2>${T('ref_titulo')}</h2><p>${T('ref_texto')}</p>
        <button type="button" class="btn primario ancho" data-acc="ref-anuncio">${enYT ? T('ref_anuncio') : T('ref_ver')}</button>
        <button type="button" class="btn texto ancho" data-acc="cerrar-modal">${T('cancelar')}</button>`);
      return;
    }
    abrirModal(`<h2>${T('ref_titulo')}</h2><div class="referencia"></div>
      <button type="button" class="btn primario ancho" data-acc="cerrar-modal">${T('cerrar')}</button>`, 'modal-ancho');
    const c = imagenFinal();
    c.className = 'ref-lienzo';
    modal.querySelector('.referencia').appendChild(c);
  }
  async function desbloquearReferencia() {
    const k = clave(J.libro, J.n);
    const boton = modal.querySelector('[data-acc="ref-anuncio"]');
    if (boton) boton.disabled = true;
    const ok = await P.anuncioRecompensa('referencia');
    if (!ok) { if (boton) boton.disabled = false; mensaje(T('ref_no')); return; }
    if (!G.ref.includes(k)) G.ref.push(k);
    guardarYa();
    verReferencia();
  }

  // ---------- Dibujo completado ----------
  function completar() {
    const l = J.libro, n = J.n, k = clave(l, n), dif = J.num.dif;
    const antes = puntos(), previa = G.hechas[k];
    if (!previa || PUNTOS[NIVEL[previa]] < PUNTOS[dif]) G.hechas[k] = LETRA[dif];
    delete G.curso[k];
    G.comp++;
    const ganados = puntos() - antes;
    guardarYa();
    if (ganados > 0) P.puntuacion(puntos());
    Sonido.tocar('fin');
    lanzarConfeti();
    const final = imagenFinal().toDataURL('image/png');
    setTimeout(() => {
      if (J.libro !== l || J.n !== n || vista !== 'juego') return;
      const libroHecho = hechasDe(l) === l.paginas;
      abrirModal(`<h2>${T('fin_titulo')}</h2>
        <img class="fin-img" src="${final}" alt="">
        <p class="fin-puntos">${ganados === 1 ? T('fin_puntos_1') : ganados > 0 ? T('fin_puntos', { n: ganados }) : T('fin_repetida')}</p>
        ${todoHecho() ? `<p class="aviso-fin">${T('todo_hecho')}</p>` : libroHecho ? `<p class="aviso-fin">✓ ${T('libro_hecho')}</p>` : ''}
        <div class="botones">${todoHecho() ? '' : `<button type="button" class="btn primario" data-acc="siguiente">${T('siguiente')}</button>`}
        <button type="button" class="btn texto" data-acc="salir-juego">${T('volver_libro')}</button></div>`, 'modal-fin');
    }, 900);
  }
  // Siguiente dibujo sin completar (en este libro y, si no quedan, en los siguientes).
  function siguientePendiente(l, n) {
    const orden = [];
    const i0 = CAT.libros.indexOf(l);
    for (let i = 0; i < CAT.libros.length; i++) {
      const lb = CAT.libros[(i0 + i) % CAT.libros.length];
      for (let p = 1; p <= lb.paginas; p++) if (i > 0 || p > n) orden.push([lb, p]);
    }
    for (let p = 1; p <= n; p++) orden.push([l, p]);
    return orden.find(([lb, p]) => !G.hechas[clave(lb, p)]) || null;
  }
  async function siguiente() {
    const dif = J.num?.dif || 'facil';
    const sig = siguientePendiente(J.libro, J.n);
    cerrarModal();
    if (!sig) { salirJuego(); return; }
    // Pausa natural entre dibujos: cada 2 dibujos terminados, un anuncio de YouTube (si los hay).
    if (G.comp % 2 === 0) await P.anuncioIntersticial();
    const [lb, p] = sig;
    libroActual = lb;
    const c = G.curso[clave(lb, p)];
    abrirJuego(lb, p, c ? NIVEL[c.d] : dif, !!c);
  }

  // Guarda en la partida el dibujo en curso (bits de las zonas pintadas).
  function volcarPartida() {
    if (!J.num || !J.seg || !J.libro) return;
    const k = clave(J.libro, J.n);
    if (todoCompleto()) { delete G.curso[k]; return; }
    if (!J.num.hechas) return;
    G.curso[k] = { d: LETRA[J.num.dif], n: J.seg.n, b: aBits(J.num.rellena), p: Math.floor((100 * J.num.hechas) / J.num.total), t: Date.now() };
  }
  function salirJuego() {
    guardarYa();
    cerrarModal();
    J.num = null; J.seg = null;
    if (libroActual) { renderLibro(); mostrar('libro'); } else { renderBiblioteca(); mostrar('biblioteca'); }
  }

  // ---------- Confeti (se detiene al pausar) ----------
  let confeti = [];
  function lanzarConfeti() {
    const c = $('#confeti'), x = c.getContext('2d'), d = J.dpr;
    const colores = J.num.numeros.map((n) => n.hex);
    confeti = Array.from({ length: 90 }, () => ({
      x: J.cw * (0.2 + Math.random() * 0.6), y: J.ch * 0.35, vx: (Math.random() - 0.5) * 9, vy: -4 - Math.random() * 7,
      r: 3 + Math.random() * 4, c: colores[Math.floor(Math.random() * colores.length)], a: Math.random() * 6,
    }));
    const paso = () => {
      if (J.pausado) return;
      x.setTransform(d, 0, 0, d, 0, 0);
      x.clearRect(0, 0, J.cw, J.ch);
      confeti = confeti.filter((p) => p.y < J.ch + 20);
      for (const p of confeti) {
        p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.a += 0.15;
        x.fillStyle = p.c;
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore();
      }
      if (confeti.length) J.animConfeti = requestAnimationFrame(paso); else x.clearRect(0, 0, J.cw, J.ch);
    };
    cancelAnimationFrame(J.animConfeti);
    J.animConfeti = requestAnimationFrame(paso);
  }

  // ---------- Pausa y reanudación (requisito de integración 6): se detiene todo ----------
  function pausar() {
    J.pausado = true;
    for (const detener of inercias) detener();
    cancelAnimationFrame(J.anim);
    cancelAnimationFrame(J.animConfeti);
    Sonido.pausar(true);
    guardarYa();
  }
  function reanudar() {
    J.pausado = false;
    Sonido.pausar(false);
    if (confeti.length) lanzarConfeti();
    dibujar();
  }

  // ---------- Entrada: táctil y ratón (con pellizco y rueda), y teclado ----------
  const punteros = new Map();
  let gesto = null;
  const posicion = (e) => { const r = lienzo.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  lienzo.addEventListener('pointerdown', (e) => {
    if (!J.seg) return;
    lienzo.setPointerCapture(e.pointerId);
    punteros.set(e.pointerId, posicion(e));
    const ps = [...punteros.values()];
    if (ps.length === 1) gesto = { tipo: 'toque', x0: ps[0].x, y0: ps[0].y, tx0: J.tx, ty0: J.ty };
    else if (ps.length === 2) {
      const [a, b] = ps;
      gesto = { tipo: 'pinza', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, s0: J.s, mx0: (a.x + b.x) / 2, my0: (a.y + b.y) / 2, tx0: J.tx, ty0: J.ty };
    }
  });
  lienzo.addEventListener('pointermove', (e) => {
    if (!punteros.has(e.pointerId) || !gesto) return;
    punteros.set(e.pointerId, posicion(e));
    const ps = [...punteros.values()];
    if (gesto.tipo === 'pinza' && ps.length >= 2) {
      const [a, b] = ps, d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const s = limitar(gesto.s0 * (d / gesto.d0), J.s0 * 0.9, J.s0 * 14);
      J.tx = mx - (gesto.mx0 - gesto.tx0) * (s / gesto.s0);
      J.ty = my - (gesto.my0 - gesto.ty0) * (s / gesto.s0);
      J.s = s; J.ajustado = false;
      encuadrar(); dibujar();
      return;
    }
    const p = ps[0], dx = p.x - gesto.x0, dy = p.y - gesto.y0;
    if (gesto.tipo === 'toque' && Math.hypot(dx, dy) > 8) gesto.tipo = 'arrastre';
    if (gesto.tipo === 'arrastre') { J.tx = gesto.tx0 + dx; J.ty = gesto.ty0 + dy; J.ajustado = false; encuadrar(); dibujar(); }
  });
  const soltar = (e) => {
    if (!punteros.has(e.pointerId)) return;
    const p = punteros.get(e.pointerId);
    punteros.delete(e.pointerId);
    if (gesto?.tipo === 'toque' && e.type === 'pointerup') tocar(p.x, p.y);
    if (punteros.size === 1) { const q = [...punteros.values()][0]; gesto = { tipo: 'arrastre', x0: q.x, y0: q.y, tx0: J.tx, ty0: J.ty }; }
    else if (!punteros.size) gesto = null;
  };
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);
  lienzo.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = posicion(e);
    zoomEn(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), p.x, p.y);
  }, { passive: false });
  document.addEventListener('keydown', (e) => {
    if (vista !== 'juego' || modal.open || !J.num) return; // Esc nunca se intercepta
    const c = { x: J.cw / 2, y: J.ch / 2 };
    if (e.key === '+' || e.key === '=') zoomEn(1.25, c.x, c.y);
    else if (e.key === '-') zoomEn(0.8, c.x, c.y);
    else if (e.key === '0') ajustar();
    else if (/^[1-9]$/.test(e.key)) seleccionar(+e.key - 1);
    else if (e.key === ']') seleccionar((J.num.sel + 1) % J.num.numeros.length);
    else if (e.key === '[') seleccionar((J.num.sel - 1 + J.num.numeros.length) % J.num.numeros.length);
    else if (e.key.toLowerCase() === 'h') pista();
    else if (e.key.startsWith('Arrow')) {
      const d = 60;
      J.tx += e.key === 'ArrowLeft' ? d : e.key === 'ArrowRight' ? -d : 0;
      J.ty += e.key === 'ArrowUp' ? d : e.key === 'ArrowDown' ? -d : 0;
      J.ajustado = false; encuadrar(); dibujar();
    } else return;
    e.preventDefault();
  });

  // ---------- Clics ----------
  document.addEventListener('click', (e) => {
    const lb = e.target.closest('[data-libro]');
    if (lb && !e.target.closest('#modal')) { abrirLibro(lb.dataset.libro); return; }
    const pg = e.target.closest('[data-pagina]');
    if (pg && !e.target.closest('#modal')) { elegirNivel(libroActual, +pg.dataset.pagina); return; }
    const mc = e.target.closest('[data-color]');
    if (mc) { seleccionar(+mc.dataset.color); return; }
    const nv = e.target.closest('[data-nivel]');
    if (nv) {
      const l = CAT.libros.find((x) => x.id === modal.dataset.libro), n = +modal.dataset.pagina;
      if (G.curso[clave(l, n)]) {
        // Empezar de nuevo borra el progreso: se pide confirmación dentro del juego (no hay confirm() en Playables).
        abrirModal(`<h2>${T('nueva')}</h2><p>${T('seguro')}</p><div class="botones">
          <button type="button" class="btn primario" data-confirmar-nivel="${nv.dataset.nivel}">${T('si_nueva')}</button>
          <button type="button" class="btn texto" data-acc="cerrar-modal">${T('cancelar')}</button></div>`);
        modal.dataset.libro = l.id; modal.dataset.pagina = n;
        return;
      }
      abrirJuego(l, n, nv.dataset.nivel, false);
      return;
    }
    const cn = e.target.closest('[data-confirmar-nivel]');
    if (cn) {
      const l = CAT.libros.find((x) => x.id === modal.dataset.libro), n = +modal.dataset.pagina;
      delete G.curso[clave(l, n)];
      abrirJuego(l, n, cn.dataset.confirmarNivel, false);
      return;
    }
    if (e.target.closest('[data-continuar]')) {
      const l = CAT.libros.find((x) => x.id === modal.dataset.libro), n = +modal.dataset.pagina;
      abrirJuego(l, n, NIVEL[G.curso[clave(l, n)].d], true);
      return;
    }
    const rt = e.target.closest('[data-reintentar]');
    if (rt) { abrirJuego(CAT.libros.find((x) => x.id === modal.dataset.libro), +modal.dataset.pagina, rt.dataset.reintentar, true); return; }
    const a = e.target.closest('[data-acc]');
    if (!a) return;
    switch (a.dataset.acc) {
      case 'biblioteca': libroActual = null; renderBiblioteca(); mostrar('biblioteca'); break;
      case 'salir-juego': salirJuego(); break;
      case 'cerrar-modal': cerrarModal(); break;
      case 'ayuda': abrirModal(`<h2>${T('como_jugar')}</h2>${T('ayuda')}<button type="button" class="btn primario ancho" data-acc="cerrar-modal">${T('cerrar')}</button>`); break;
      case 'pista': pista(); break;
      case 'referencia': verReferencia(); break;
      case 'ref-anuncio': desbloquearReferencia(); break;
      case 'siguiente': siguiente(); break;
      case 'acercar': zoomEn(1.3, J.cw / 2, J.ch / 2); break;
      case 'alejar': zoomEn(1 / 1.3, J.cw / 2, J.ch / 2); break;
      case 'ajustar': ajustar(); break;
      default: break;
    }
  });

  // ---------- Inicio ----------
  async function iniciar() {
    // 1. La pantalla de carga ya está pintada: se avisa a YouTube (firstFrameReady).
    await new Promise((r) => requestAnimationFrame(() => r()));
    P.primerFotograma();
    P.alPausar(pausar);
    P.alReanudar(reanudar);
    Sonido.activar(P.sonidoActivo());
    P.alCambiarSonido((v) => Sonido.activar(v));
    // 2. Idioma y partida guardada.
    const [lang, datos] = await Promise.all([P.idioma(), P.cargar().catch((e) => { P.error(e); return ''; })]);
    idioma = /^es\b/i.test(lang) ? 'es' : 'en';
    G = leerPartida(datos);
    cargado = true;
    aplicarTextos();
    renderBiblioteca();
    // 3. Espera a las portadas y a las fuentes (con tope) para no mostrar una biblioteca a medio pintar.
    const portadas = [...document.querySelectorAll('#rejilla-libros img')].map((i) => i.decode().catch(() => {}));
    await Promise.race([Promise.all([...portadas, document.fonts ? document.fonts.ready : null]), new Promise((r) => setTimeout(r, 2500))]);
    $('#carga').hidden = true;
    $('#app').hidden = false;
    // 4. Ya se puede jugar: gameReady (nunca con la pantalla de carga visible).
    requestAnimationFrame(() => { P.listo(); if (puntos() > 0) P.puntuacion(puntos()); });
  }
  if (DEMO) DEMO.alSalir = () => guardarYa();
  iniciar().catch((e) => { P.error(e); $('#carga').hidden = true; $('#app').hidden = false; P.listo(); });

  // Ayuda para las pruebas automáticas, solo fuera de YouTube y con ?prueba en la dirección.
  if (!enYT && /[?&]prueba\b/.test(location.search)) {
    window.__sucoPrueba = {
      estado: () => JSON.parse(JSON.stringify(G)),
      guardado: () => memoria,
      vista: () => vista,
      juego: () => (J.num ? { dif: J.num.dif, total: J.num.total, hechas: J.num.hechas, colores: J.num.numeros.length, sel: J.num.sel } : null),
      // Toca el centro de una zona pendiente del color elegido (como haría una persona).
      tocarSiguiente() {
        const { seg, num } = J;
        for (let r = 0; r < seg.n; r++) {
          if (num.numR[r] === num.sel && !num.rellena[r]) {
            const p = seg.punto[r];
            tocar((p % seg.W + 0.5) * J.s + J.tx, (((p / seg.W) | 0) + 0.5) * J.s + J.ty);
            return true;
          }
        }
        return false;
      },
      completarTodo() {
        for (let i = 0; i < 100000 && J.num && !todoCompleto(); i++) {
          if (!this.tocarSiguiente()) { const k = J.num.numeros.findIndex((c) => c.hechas < c.total); if (k < 0) break; seleccionar(k); }
        }
      },
      pausar, reanudar,
    };
  }
})();

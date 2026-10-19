// Solo para la versión web de pruebas (por ejemplo, GitHub Pages). Nunca se incluye en el paquete de
// YouTube Playables, donde el progreso se guarda únicamente con ytgame.game.saveData.
// Guarda la partida en el propio dispositivo y usa el idioma del navegador.
'use strict';
(() => {
  const CLAVE = 'suco-playable-demo';
  const demo = {
    idioma: navigator.language || 'es',
    cargar() { try { return localStorage.getItem(CLAVE) || ''; } catch { return ''; } },
    guardar(s) { try { localStorage.setItem(CLAVE, s); } catch { /* sin almacenamiento: la partida dura lo que la página */ } },
    alSalir: null, // juego.js pone aquí su función de guardado
  };
  window.SUCO_DEMO = demo;
  // Al salir o pasar a segundo plano (cerrar la pestaña, cambiar de app en el móvil) se guarda al momento.
  const salir = () => { if (demo.alSalir) demo.alSalir(); };
  window.addEventListener('pagehide', salir);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') salir(); });
})();

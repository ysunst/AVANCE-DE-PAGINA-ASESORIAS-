/* =========================================================
   Splash Screen de bienvenida — Trinomio SAS
   Logo de tres aros entrelazados.
   Uso: en index.html, justo después de <body>, agregar:
     <script src="splash.js"></script>
   ========================================================= */
(function () {
  'use strict';

  // ---- Configuración ----
  var UNA_VEZ_POR_VISITA = true; // true: solo la primera vez que abre el sitio en esa pestaña/sesión
  var FONDO = '#ffffff';         // color de fondo del splash
  var KEY = 'trinomio-splash-visto';

  if (UNA_VEZ_POR_VISITA) {
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, '1');
    } catch (e) { /* si el navegador bloquea el almacenamiento, se muestra igual */ }
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Estilos ----
  var style = document.createElement('style');
  style.textContent =
    '#tri-splash{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;' +
    'background:' + FONDO + ';opacity:1;transition:opacity .6s ease;cursor:pointer}' +
    '#tri-splash.tri-out{opacity:0;pointer-events:none}' +
    '#tri-splash svg{width:min(72vw,420px);height:auto;display:block;overflow:visible}' +
    '#tri-splash .tri-ring{fill:none;stroke-width:24;stroke-linecap:butt}' +
    '#tri-rightRing{stroke:#979fa8}#tri-leftRing,#tri-leftBridge{stroke:#68757d}#tri-blueRing{stroke:#103f69}' +
    '#tri-leftBridge{fill:none;stroke-width:24;stroke-linecap:butt;opacity:0}' +
    '#tri-skip{position:absolute;bottom:24px;right:24px;font:600 13px Inter,Arial,sans-serif;' +
    'color:#66717a;background:none;border:0;cursor:pointer;padding:8px 12px}' +
    '#tri-skip:hover{color:#103f69}';
  document.head.appendChild(style);

  // ---- Estructura ----
  var ov = document.createElement('div');
  ov.id = 'tri-splash';
  ov.setAttribute('aria-label', 'Bienvenido a Trinomio SAS');
  ov.innerHTML =
    '<svg viewBox="0 0 397 321" role="img" aria-label="Logo Trinomio SAS">' +
      '<circle id="tri-rightRing" class="tri-ring" cx="273" cy="204" r="77.5"/>' +
      '<circle id="tri-leftRing"  class="tri-ring" cx="157" cy="204" r="77.5"/>' +
      '<circle id="tri-blueRing"  class="tri-ring" cx="215" cy="132" r="77.5"/>' +
      '<path id="tri-leftBridge" d="M 228.2,173.3 A 77.5,77.5 0 0 1 226.1,239.0"/>' +
    '</svg>' +
    '<button id="tri-skip" type="button">Saltar ›</button>';
  (document.body || document.documentElement).appendChild(ov);

  var root = document.documentElement;
  var prevOverflow = root.style.overflow;
  root.style.overflow = 'hidden'; // evita que la página se desplace detrás del splash

  var rings = [
    document.getElementById('tri-leftRing'),
    document.getElementById('tri-rightRing'),
    document.getElementById('tri-blueRing')
  ];
  var bridge = document.getElementById('tri-leftBridge');
  var C = 2 * Math.PI * 77.5;
  rings.forEach(function (r) { r.style.strokeDasharray = String(C); });

  var clamp = function (x) { return Math.min(1, Math.max(0, x)); };
  var smooth = function (t) { t = clamp(t); return t * t * (3 - 2 * t); };
  var prog = function (t, a, b) { return smooth((t - a) / (b - a)); };

  var begin = 0, raf = 0, closed = false;
  var END = 4700; // ms: cuando empieza a desvanecerse (dibujo completo a los ~3.9 s)

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    ov.classList.add('tri-out');
    setTimeout(function () {
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      root.style.overflow = prevOverflow;
    }, 650);
  }

  function frame(ms) {
    var t = ms - begin;
    rings[0].style.strokeDashoffset = String(C * (1 - prog(t, 100, 1900)));
    rings[1].style.strokeDashoffset = String(C * (1 - prog(t, 650, 2500)));
    rings[2].style.strokeDashoffset = String(C * (1 - prog(t, 1900, 3850)));
    bridge.style.opacity = String(prog(t, 2900, 3800));
    if (t < END) raf = requestAnimationFrame(frame); else close();
  }

  if (reduceMotion) {
    // Sin animación: muestra el logo completo un momento y desaparece
    rings.forEach(function (r) { r.style.strokeDashoffset = '0'; });
    bridge.style.opacity = '1';
    setTimeout(close, 1200);
  } else {
    rings.forEach(function (r) { r.style.strokeDashoffset = String(C); });
    raf = requestAnimationFrame(function (ms) { begin = ms; frame(ms); });
  }

  // Clic en cualquier parte o tecla Esc para saltar
  ov.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  setTimeout(close, 8000); // seguro: nunca bloquea la página más de 8 s
})();

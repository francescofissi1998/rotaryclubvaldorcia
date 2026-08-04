/* Rotary Club Val d'Orcia — comportamenti della landing.
   File esterno e differito: consente una CSP con script-src 'self'
   (nessuno script inline, nessun gestore onclick= nell'HTML).

   PRESTAZIONI — come evito i reflow forzati.
   Il report Lighthouse segnalava 75 ms di "adattamento dinamico forzato": il
   codice leggeva la geometria (offsetTop, innerHeight) e subito dopo scriveva
   una trasformazione, nello stesso ciclo, costringendo il browser a
   ricalcolare il layout a ogni giro. Qui le due cose sono separate: si legge
   SOLO al caricamento e al ridimensionamento, tenendo i valori in memoria; si
   scrive soltanto dentro requestAnimationFrame, e solo transform, che il
   browser gestisce sul compositor.                                          */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= navbar =================
     Una sentinella alta 60 px in cima alla pagina: quando esce dal campo
     visivo la barra diventa opaca. Nessun listener di scroll, nessuna
     lettura di scrollY, quindi nessun rischio di reflow.                  */
  var hdr = document.getElementById('hdr');
  var sentinel = document.getElementById('top-sentinel');
  if (hdr) {
    /* stato iniziale: serve se si ricarica la pagina a metà scorrimento */
    hdr.classList.toggle('stuck', window.scrollY > 60);
    if (sentinel && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        hdr.classList.toggle('stuck', !e[0].isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    } else {
      window.addEventListener('scroll', function () {
        hdr.classList.toggle('stuck', window.scrollY > 60);
      }, { passive: true });
    }
  }

  /* ================= menu mobile ================= */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ================= comparsa allo scorrimento ================= */
  var rv = [].slice.call(document.querySelectorAll('.rv,.rv-mask,.zoom-in'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    /* ritardo a cascata fra elementi fratelli: entrano uno dopo l'altro */
    rv.forEach(function (el) {
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) {
        return c.classList.contains('rv') || c.classList.contains('rv-mask');
      });
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = (Math.min(i, 5) * 90) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });

    /* Rete di sicurezza: se per qualsiasi motivo l'osservatore non scattasse,
       dopo 3 secondi il contenuto viene mostrato comunque. Meglio un'animazione
       persa che un testo invisibile.                                        */
    setTimeout(function () {
      rv.forEach(function (el) { el.classList.add('in'); });
    }, 3000);
  }

  /* ================= numeri che salgono =================
     Scrive solo textContent: nessuna proprietà geometrica viene letta.
     L'andamento è un ease-out cubico, così la corsa rallenta sul finale. */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  function format(el, v) {
    var dec = +(el.dataset.dec || 0);
    var s = el.dataset.group
      ? Math.round(v).toLocaleString('it-IT')
      : v.toFixed(dec).replace('.', ',');
    return (el.dataset.prefix || '') + s + (el.dataset.suffix || '');
  }
  function run(el) {
    var target = parseFloat(el.dataset.count);
    var dur = 1700, t0 = 0;
    el.classList.add('counting');
    function step(now) {
      if (!t0) t0 = now;
      var p = Math.min((now - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = format(el, target * e);
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = format(el, target); el.classList.remove('counting'); }
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = format(el, parseFloat(el.dataset.count)); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { el.textContent = format(el, 0); cio.observe(el); });
    }
  }

  /* ================= parallasse =================
     Vale per tutti i browser. Ogni sfondo è ingrandito (--sc) e scorre in
     verticale entro l'eccedenza creata dall'ingrandimento (--shift): la foto
     si muove più lentamente della pagina e sembra scorrere all'infinito.
     Le immagini delle aree di intervento hanno una deriva più leggera.     */
  if (reduce) return;

  var layers = [];
  ['.hero-bg', '.panel-bg', '.rot-bg', '.q-bg', '.join-bg'].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    var cs = getComputedStyle(el);
    layers.push({
      el: el, host: el.parentElement,
      sc: parseFloat(cs.getPropertyValue('--sc')) || 1,
      over: parseFloat(cs.getPropertyValue('--over')) || 0,
      shift: 0, h: 0, top: 0, bed: true
    });
  });
  [].slice.call(document.querySelectorAll('.arow .media img')).forEach(function (img) {
    /* le foto delle aree sono alte il 120% del riquadro: 10% di margine */
    layers.push({ el: img, host: img.parentElement, sc: 1, over: 0, shift: 22, h: 0, top: 0, bed: false });
  });

  var vh = 0, ticking = false, misurato = false;

  /* FASE DI LETTURA — solo al caricamento e al ridimensionamento.
     Qui ricalcolo anche lo spostamento massimo: è l'eccedenza verticale
     disponibile (--over più quella prodotta da un eventuale zoom), meno un
     margine di sicurezza dell'8% perché il bordo non affiori mai.          */
  function measure() {
    vh = window.innerHeight || 800;
    var y = window.scrollY;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var r = L.host.getBoundingClientRect();
      L.h = r.height;
      L.top = r.top + y;
      if (L.bed) {
        var altezzaRiquadro = L.h + L.over * 2;
        var eccedenza = L.over + altezzaRiquadro * (L.sc - 1) / 2;
        L.shift = eccedenza * 0.92;
      }
    }
    misurato = true;
  }

  /* FASE DI SCRITTURA — nessuna lettura geometrica qui dentro:
     window.scrollY non invalida il layout.                                 */
  function paint() {
    ticking = false;
    if (!misurato) return;
    var y = window.scrollY;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var top = L.top - y;
      if (top + L.h < -300 || top > vh + 300) continue;
      /* -1 quando la sezione è appena uscita in alto, +1 quando sta per
         entrare dal basso, 0 quando è centrata nello schermo.              */
      var p = (top + L.h / 2 - vh / 2) / vh;
      if (p > 1) p = 1; else if (p < -1) p = -1;
      var dy = (-p * L.shift).toFixed(1);
      L.el.style.transform = L.bed
        ? 'translate3d(0,' + dy + 'px,0) scale(' + L.sc + ')'
        : 'translate3d(0,' + dy + 'px,0)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }

  var rt;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { measure(); paint(); }, 150);
  });
  /* Le immagini che arrivano dopo possono cambiare le altezze: rimisuro. */
  window.addEventListener('load', function () { measure(); paint(); });
  measure();
  paint();
})();

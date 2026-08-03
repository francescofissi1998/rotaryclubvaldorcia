/* Rotary Club Val d'Orcia — comportamenti della landing.
   File esterno: consente una CSP con script-src 'self' (nessun inline).

   NOTA PRESTAZIONI — reflow forzati.
   La versione precedente leggeva getBoundingClientRect()/offsetHeight e subito
   dopo scriveva style.transform, all'interno dello stesso ciclo: ogni scrittura
   invalidava il layout e la lettura successiva costringeva il browser a
   ricalcolarlo (layout thrashing, ~177 ms nel report Lighthouse).
   Qui il lavoro è separato in due fasi: prima TUTTE le letture, poi TUTTE le
   scritture. Le altezze, che cambiano solo al resize, sono messe in cache.      */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;

  /* ---------------- navbar adattiva ---------------- */
  var hdr = document.getElementById('hdr');
  var stuck = false;
  function navState(y) {
    var next = y > 60;
    if (next !== stuck) { stuck = next; hdr.classList.toggle('stuck', next); }
  }

  /* ---------------- menu mobile ---------------- */
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

  /* ---------------- parallasse ---------------- */
  var layers = [];
  [['.hero .hero-bg', '.hero', 1.35, 0.16],
   ['.panel .panel-bg', '.panel', 1.20, 0.08],
   ['.rotary .rot-bg', '.rotary', 1.20, 0.08],
   ['.quote .q-bg', '.quote', 1.22, 0.09],
   ['.join .join-bg', '.join', 1.25, 0.10]].forEach(function (c) {
    var el = document.querySelector(c[0]), host = document.querySelector(c[1]);
    if (el && host) layers.push({ el: el, host: host, scale: c[2], speed: c[3], h: 0, top: 0, overhang: 0, bed: true });
  });
  [].slice.call(document.querySelectorAll('.arow .media img')).forEach(function (img) {
    var host = img.parentElement;
    layers.push({ el: img, host: host, scale: 1, speed: 0, h: 0, top: 0, overhang: 0, bed: false });
  });

  var vh = window.innerHeight;

  /* FASE DI LETTURA — solo al load e al resize, mai durante lo scroll. */
  function measure() {
    vh = window.innerHeight;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      L.h = L.host.offsetHeight;
      var t = 0, n = L.host;
      while (n) { t += n.offsetTop; n = n.offsetParent; }
      L.top = t;
      L.overhang = (L.h * L.scale - L.h) / 2;
    }
  }

  /* FASE DI SCRITTURA — usa solo valori in cache e window.scrollY
     (che non invalida il layout). Nessuna lettura geometrica qui dentro. */
  function paint() {
    var y = window.scrollY;
    navState(y);
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var top = L.top - y;
      if (top + L.h < -240 || top > vh + 240) continue;
      var progress = (top + L.h / 2 - vh / 2) / vh;
      if (L.bed) {
        var shift = progress * L.speed * L.h;
        if (shift > L.overhang) shift = L.overhang;
        else if (shift < -L.overhang) shift = -L.overhang;
        L.el.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(' + L.scale + ')';
      } else {
        L.el.style.transform = 'translate3d(0,' + (progress * 14).toFixed(1) + 'px,0)';
      }
    }
    ticking = false;
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }

  var rt;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { measure(); onScroll(); }, 150); }

  if (reduce) {
    navState(window.scrollY);
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { navState(window.scrollY); ticking = false; });
      }
    }, { passive: true });
  } else {
    /* misura dopo il primo paint: non blocca il rendering iniziale */
    requestAnimationFrame(function () { measure(); paint(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    /* le immagini possono cambiare l'altezza delle sezioni: rimisura a load */
    window.addEventListener('load', function () { measure(); onScroll(); });
  }

  /* ---------------- comparsa allo scorrimento ---------------- */
  var rv = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    rv.forEach(function (el) {
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains('rv'); });
      el.style.transitionDelay = (Math.min(sibs.indexOf(el), 5) * 80) + 'ms';
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
  }
})();

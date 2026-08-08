/* Rotary Club Val d'Orcia — comportamenti della landing.
   File esterno e differito: consente una CSP con script-src 'self'.

   PRESTAZIONI. La geometria viene letta SOLO al caricamento e al
   ridimensionamento e tenuta in memoria; durante lo scorrimento si scrive
   soltanto transform, dentro requestAnimationFrame. Nessun reflow forzato.  */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= navbar =================
     Sentinella alta 60 px in cima: quando esce dal campo visivo la barra
     diventa opaca. Niente listener di scroll, niente letture di scrollY.   */
  var hdr = document.getElementById('hdr');
  var sentinel = document.getElementById('top-sentinel');
  if (hdr) {
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

  /* ================= menu telefono ================= */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var aperto = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', aperto ? 'true' : 'false');
      document.body.style.overflow = aperto ? 'hidden' : '';
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ================= comparse allo scorrimento ================= */
  var rv = [].slice.call(document.querySelectorAll('.rv,.rv-mask,.zoom-in'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    rv.forEach(function (el) {
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) {
        return c.classList.contains('rv') || c.classList.contains('rv-mask');
      });
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = (Math.min(i, 5) * 85) + 'ms';
    });
    var scattato = false;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        scattato = true;
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
    /* rete di sicurezza SOLO se l'osservatore non e' mai scattato:
       se rivelasse tutto a prescindere, su desktop si resterebbe sulla
       copertina piu' di 3 secondi e nessuna animazione si vedrebbe. */
    setTimeout(function () {
      if (scattato) return;
      rv.forEach(function (el) { el.classList.add('in'); });
    }, 3000);
  }

  /* ================= numeri che salgono ================= */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  function formatta(el, v) {
    var dec = +(el.dataset.dec || 0);
    var s = el.dataset.group ? Math.round(v).toLocaleString('it-IT') : v.toFixed(dec).replace('.', ',');
    return (el.dataset.prefix || '') + s + (el.dataset.suffix || '');
  }
  function conta(el) {
    var target = parseFloat(el.dataset.count), dur = 1700, t0 = 0;
    el.classList.add('counting');
    function passo(now) {
      if (!t0) t0 = now;
      var p = Math.min((now - t0) / dur, 1);
      el.textContent = formatta(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
      else { el.textContent = formatta(el, target); el.classList.remove('counting'); }
    }
    requestAnimationFrame(passo);
  }
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = formatta(el, parseFloat(el.dataset.count)); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { conta(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { el.textContent = formatta(el, 0); cio.observe(el); });
    }
  }

  /* ================= rassegna stampa: carosello continuo =================
     Per non avere un inizio e una fine, le schede vengono duplicate ai due
     lati: quando lo scorrimento arriva su un doppione si riporta la pista
     sull'originale corrispondente senza transizione, e il salto non si vede. */
  (function () {
    var pista = document.getElementById('press-track');
    var finestra = document.getElementById('press-viewport');
    if (!pista || !finestra) return;

    var originali = [].slice.call(pista.children);
    var n = originali.length;
    if (n < 2) return;

    originali.forEach(function (c) { pista.appendChild(c.cloneNode(true)); });
    originali.slice().reverse().forEach(function (c) { pista.insertBefore(c.cloneNode(true), pista.firstChild); });

    /* Unica sorgente di verita': "pos", indice nello spazio del DOM.
       Le schede reali stanno da n a 2n-1; si parte da n. Dopo ogni
       transizione, se pos e' finito su un doppione lo si riporta
       sull'originale corrispondente senza animazione: il salto non si vede. */
    var pos = n;
    var passo = 0, animando = false;

    var punti = document.getElementById('press-dots');
    if (punti) {
      for (var k = 0; k < n; k++) {
        var i = document.createElement('i');
        i.setAttribute('role', 'tab');
        punti.appendChild(i);
      }
    }
    function segnaPunti() {
      if (!punti) return;
      var attivo = ((pos - n) % n + n) % n;
      [].slice.call(punti.children).forEach(function (p, k) {
        p.classList.toggle('on', k === attivo);
        p.setAttribute('aria-selected', k === attivo ? 'true' : 'false');
      });
    }
    function misura() {
      var prima = pista.children[n];
      var g = parseFloat(getComputedStyle(pista).columnGap);
      if (isNaN(g)) g = 0;
      passo = prima.getBoundingClientRect().width + g;
    }
    function posiziona(conAnimazione, extra) {
      pista.style.transition = conAnimazione ? 'transform .5s cubic-bezier(.22,.75,.3,1)' : 'none';
      pista.style.transform = 'translate3d(' + (-pos * passo + (extra || 0)) + 'px,0,0)';
      pista.dataset.pos = pos;            /* stato visibile, utile a diagnosticare */
      pista.dataset.passo = Math.round(passo);
    }
    function vai(d) {
      if (animando || !passo) return;
      animando = true;
      pos += d;
      posiziona(true);
      segnaPunti();
      setTimeout(function () {
        if (pos < n || pos >= 2 * n) {
          pos = ((pos - n) % n + n) % n + n;      /* rientro silenzioso */
          posiziona(false);
          void pista.offsetWidth;
        }
        animando = false;
      }, 520);
    }

    var prev = document.getElementById('press-prev');
    var next = document.getElementById('press-next');
    if (prev) prev.addEventListener('click', function () { vai(-1); });
    if (next) next.addEventListener('click', function () { vai(1); });

    /* trascinamento col dito */
    var x0 = null, dx = 0;
    finestra.addEventListener('touchstart', function (e) {
      if (animando) return;
      x0 = e.touches[0].clientX; dx = 0;
      pista.style.transition = 'none';
    }, { passive: true });
    finestra.addEventListener('touchmove', function (e) {
      if (x0 === null) return;
      dx = e.touches[0].clientX - x0;
      posiziona(false, dx);
    }, { passive: true });
    finestra.addEventListener('touchend', function () {
      if (x0 === null) return;
      var soglia = Math.min(70, passo * 0.22);
      var g = dx;
      x0 = null; dx = 0;
      if (g <= -soglia) vai(1);
      else if (g >= soglia) vai(-1);
      else posiziona(true);
    });

    var rc;
    window.addEventListener('resize', function () {
      clearTimeout(rc); rc = setTimeout(function () { misura(); posiziona(false); }, 120);
    });
    misura(); posiziona(false); segnaPunti();
    window.addEventListener('load', function () { misura(); posiziona(false); });
  })();

  /* ================= parallasse — desktop e telefono =================
     Ogni sfondo e' ritagliato piu' alto della sezione: --over dice di quanto.
     Lo spostamento resta dentro quel margine, cosi' il bordo non affiora.   */
  if (reduce) return;

  var livelli = [];
  [].slice.call(document.querySelectorAll('.bg')).forEach(function (el) {
    livelli.push({ el: el, host: el.parentElement, bed: true, over: 0, h: 0, top: 0, shift: 0 });
  });
  [].slice.call(document.querySelectorAll('.arow .media img')).forEach(function (img) {
    livelli.push({ el: img, host: img.parentElement, bed: false, over: 0, h: 0, top: 0, shift: 20 });
  });
  if (!livelli.length) return;

  var vh = 0, ticking = false, pronto = false;

  function misura() {
    vh = window.innerHeight || 800;
    var y = window.scrollY;
    for (var i = 0; i < livelli.length; i++) {
      var L = livelli[i];
      var r = L.host.getBoundingClientRect();
      L.h = r.height;
      L.top = r.top + y;
      if (L.bed) {
        L.over = parseFloat(getComputedStyle(L.el).getPropertyValue('--over')) || 0;
        L.shift = L.over * 0.92;                 /* margine di sicurezza */
        /* Alcune foto non hanno pixel sotto il ritaglio del progetto: i pixel
           in piu' stanno tutti sopra. La polarizzazione sposta il riposo verso
           il basso, cosi' a meta' schermo si vede l'inquadratura giusta e
           scorrendo si scopre la parte alta. */
        L.bias = parseFloat(getComputedStyle(L.el).getPropertyValue('--bias')) || 0;
      }
    }
    pronto = true;
  }
  function disegna() {
    ticking = false;
    if (!pronto) return;
    var y = window.scrollY;
    for (var i = 0; i < livelli.length; i++) {
      var L = livelli[i];
      if (!L.shift) continue;
      var top = L.top - y;
      if (top + L.h < -300 || top > vh + 300) continue;
      var p = (top + L.h / 2 - vh / 2) / vh;
      if (p > 1) p = 1; else if (p < -1) p = -1;
      L.el.style.transform = 'translate3d(0,' + ((L.bias || 0) - p * L.shift).toFixed(1) + 'px,0)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(disegna); } }

  var rt;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { misura(); disegna(); }, 150);
  });
  window.addEventListener('load', function () { misura(); disegna(); });
  misura();
  disegna();
})();

/* Rotary Club Val d'Orcia — pagine legali: navbar adattiva e menu mobile.
   File esterno: consente una CSP con script-src 'self'. */
(function () {
  'use strict';
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var s = function () { hdr.classList.toggle('stuck', window.scrollY > 60); };
    s();
    window.addEventListener('scroll', s, { passive: true });
  }
  var b = document.getElementById('burger');
  var m = document.getElementById('menu');
  if (b && m) {
    b.addEventListener('click', function () {
      var o = m.classList.toggle('open');
      b.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    m.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { m.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('open')) {
        m.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.focus();
      }
    });
  }
})();

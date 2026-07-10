// EL Finans tanıtım sitesi — kaydırma animasyonları
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Nav gölgesi ──
  var nav = document.querySelector('.nav');
  function onNavScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // ── Scroll reveal (Apple hissi: görünüme girince yumuşak yükselme) ──
  var revealables = document.querySelectorAll('.reveal, .reveal-scale, .stagger');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  // ── Telefonlarda hafif paralaks (görünürken, scroll'a bağlı) ──
  if (!reduceMotion) {
    var phones = Array.prototype.slice.call(document.querySelectorAll('.phone[data-parallax]'));
    var ticking = false;
    function parallax() {
      var vh = window.innerHeight;
      phones.forEach(function (p) {
        var r = p.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // Eleman merkezi viewport merkezinden ne kadar uzaksa o kadar kaydır (maks ~26px)
        var progress = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 civarı
        p.style.transform = 'translateY(' + (progress * 52).toFixed(1) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }
})();

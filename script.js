// EL Finans tanıtım sitesi v2 — animasyonlar + TR/EN dil değişimi
(function () {
  'use strict';

  var reduceMotion = false; // Animasyonlar işletim sistemi tercihinden bağımsız olarak açık kalır.
  var docEl = document.documentElement;

  // Keep the 1920x930 desktop composition intact by scaling each scene as one unit.
  // Mobile uses its own natural-flow layout below the existing 901px breakpoint.
  var desktopScaleFrame = 0;
  function syncDesktopLayoutScale() {
    desktopScaleFrame = 0;
    var scale = 1;
    if (window.innerWidth >= 901) {
      var navHeight = parseFloat(window.getComputedStyle(docEl).getPropertyValue('--nav-h')) || 64;
      var widthScale = window.innerWidth / 1920;
      var heightScale = (window.innerHeight - navHeight) / (930 - 64);
      scale = Math.max(.48, Math.min(1, widthScale, heightScale));
    }
    var inverseScale = 1 / scale;
    docEl.style.setProperty('--desktop-layout-scale', scale.toFixed(4));
    docEl.style.setProperty('--desktop-safe-layout-scale', (scale * .92).toFixed(4));
    docEl.style.setProperty('--desktop-layout-width', (inverseScale * 100).toFixed(4) + '%');
    docEl.style.setProperty('--desktop-layout-offset', (-(inverseScale - 1) * 50).toFixed(4) + '%');
  }
  function queueDesktopLayoutScale() {
    if (desktopScaleFrame) return;
    desktopScaleFrame = window.requestAnimationFrame(syncDesktopLayoutScale);
  }
  syncDesktopLayoutScale();
  window.addEventListener('resize', queueDesktopLayoutScale, { passive: true });

  var previewHost = window.location.hostname;
  var usePhysicalHtmlLinks = window.location.protocol === 'file:'
    || previewHost === 'localhost'
    || previewHost === '127.0.0.1'
    || previewHost === '[::1]';

  // Production URLs stay extensionless; local static previews resolve to physical .html files.
  function localizeStaticRoutes(root) {
    if (!usePhysicalHtmlLinks) return;
    var routeFiles = {
      '/': 'index.html',
      '/support': 'support.html',
      '/privacy-policy': 'privacy-policy.html',
      '/terms': 'terms.html',
      '/account-deletion': 'account-deletion.html'
    };
    Array.prototype.forEach.call((root || document).querySelectorAll('a[href]'), function (link) {
      var href = link.getAttribute('href');
      var match = href && href.match(/^(\/(?:support|privacy-policy|terms|account-deletion)?)([?#].*)?$/);
      if (!match || !routeFiles[match[1]]) return;
      link.setAttribute('href', routeFiles[match[1]] + (match[2] || ''));
    });
  }

  if (!usePhysicalHtmlLinks && /^https?:$/.test(window.location.protocol) && /\.html$/.test(window.location.pathname)) {
    var cleanPath = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }
  localizeStaticRoutes(document);
  if (new URLSearchParams(window.location.search).get('embed') === '1') {
    docEl.classList.add('embed-policy');
  }
  // ── Mobil menü: soldan açılır çekmece ──
  // Nav linklerinden kopyalanarak JS ile kurulur; tüm sayfalarda ortaktır.
  var navBurger = document.querySelector('.nav-burger');
  if (navBurger) {
    var drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Menü');
    drawer.setAttribute('aria-hidden', 'true');
    var drawerLinksHtml = '';
    Array.prototype.forEach.call(document.querySelectorAll('.nav-links a'), function (a) {
      drawerLinksHtml += '<a href="' + a.getAttribute('href') + '"' +
        (a.dataset.en ? ' data-en="' + a.dataset.en + '"' : '') + '>' + a.innerHTML + '</a>';
    });
    drawer.innerHTML =
      '<div class="drawer-head">' +
        '<a class="brand" href="' + (usePhysicalHtmlLinks ? 'index.html' : '/') + '" aria-label="EL Finans"><span class="brand-mark"><img src="images/logo-nav.png" alt="" width="42" height="42"></span><span class="brand-name">Finans</span></a>' +
        '<button type="button" class="drawer-close" aria-label="Menüyü kapat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
      '</div>' +
      '<nav class="drawer-links">' + drawerLinksHtml + '</nav>' +
      '<div class="drawer-lang"><h5>Dil / Language</h5><div class="opts">' +
        '<button type="button" data-set-lang="tr">Türkçe</button>' +
        '<button type="button" data-set-lang="en">English</button>' +
      '</div></div>';
    var drawerBackdrop = document.createElement('div');
    drawerBackdrop.className = 'drawer-backdrop';
    document.body.appendChild(drawerBackdrop);
    document.body.appendChild(drawer);
    var setDrawer = function (open) {
      drawer.classList.toggle('open', open);
      drawerBackdrop.classList.toggle('show', open);
      document.body.classList.toggle('drawer-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      navBurger.setAttribute('aria-expanded', String(open));
    };
    navBurger.addEventListener('click', function () { setDrawer(true); });
    drawerBackdrop.addEventListener('click', function () { setDrawer(false); });
    drawer.querySelector('.drawer-close').addEventListener('click', function () { setDrawer(false); });
    Array.prototype.forEach.call(drawer.querySelectorAll('.drawer-links a'), function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) setDrawer(false);
    });
  }

  // ── Dil değişimi (TR/EN) ──
  // data-en="..." taşıyan elemanların içeriği değiştirilir.
  var LANG_KEY = 'el-finans-language';
  var renderAiDemo = null; // hareket azaltıldığında örneği dil değişimine göre günceller
  var langButtons = document.querySelectorAll('[data-set-lang]');
  var langRoot = document.querySelector('.lang-switch');
  var langToggle = document.querySelector('.lang-toggle');
  var langCurrent = document.querySelector('.lang-current');

  function closeLangMenu() {
    if (!langRoot) return;
    langRoot.classList.remove('open');
    if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
  }

  function applyLang(lang) {
    var translatables = document.querySelectorAll('[data-en]');
    Array.prototype.forEach.call(translatables, function (el) {
      if (!el.dataset.tr) el.dataset.tr = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.tr;
    });
    docEl.dataset.activeLang = lang;
    docEl.lang = lang;
    Array.prototype.forEach.call(langButtons, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });
    if (langCurrent) langCurrent.textContent = lang.toUpperCase();
    closeLangMenu();
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* gizli mod vb. */ }
    buildLegalToc(lang);
    if (renderAiDemo) renderAiDemo();
    if (window.__supportBotRefresh) window.__supportBotRefresh();
  }

  Array.prototype.forEach.call(langButtons, function (btn) {
    btn.addEventListener('click', function () { applyLang(btn.dataset.setLang); });
  });

  if (langToggle && langRoot) {
    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = langRoot.classList.toggle('open');
      langToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!langRoot.contains(e.target)) closeLangMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLangMenu();
    });
  }

  var savedLang = null;
  try {
    savedLang = localStorage.getItem(LANG_KEY) || localStorage.getItem('el-finans-privacy-language');
  } catch (e) { /* gizli mod vb. */ }
  applyLang(savedLang === 'en' ? 'en' : 'tr');

  // ── Destek iletişim formu: alanları güvenli mailto akışına çevirir ──
  var contactForms = document.querySelectorAll('form.contact-form');
  Array.prototype.forEach.call(contactForms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var name = (form.elements.name.value || '').trim();
      var email = (form.elements.email.value || '').trim();
      var message = (form.elements.message.value || '').trim();
      var isEnglish = form.closest('[data-lang="en"]') !== null;
      var subject = (isEnglish ? 'EL Finans Support' : 'EL Finans Destek') + (name ? ' - ' + name : '');
      var body = message + '\n\n' + (isEnglish ? 'Name: ' : 'Ad Soyad: ') + name
        + '\n' + (isEnglish ? 'Email: ' : 'E-posta: ') + email;
      window.location.href = 'mailto:support@elfinans.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
  });
  var privacyReader = document.getElementById('privacy-reader');
  if (privacyReader) {
    var privacyLinks = document.querySelectorAll('.privacy-modal-link');
    var privacyFrame = privacyReader.querySelector('iframe');
    var privacyAccept = privacyReader.querySelector('.privacy-accept');
    var privacyClose = privacyReader.querySelector('.privacy-reader-close');
    var privacyNote = privacyReader.querySelector('.privacy-scroll-note');
    var pendingConsent = null;
    function openPrivacyReader(link) {
      var form = link.closest('form');
      if (!form) {
        form = document.querySelector('section[data-lang="' + docEl.lang + '"] form.contact-form');
      }
      pendingConsent = form && form.querySelector('input[name="privacy_consent"]');
      privacyAccept.disabled = false;
      if (privacyNote) privacyNote.textContent = docEl.lang === 'en'
        ? 'Review the policy, then confirm.'
        : 'Politikayı inceleyip onaylayabilirsiniz.';
      privacyReader.classList.add('open');
      privacyReader.setAttribute('aria-hidden', 'false');
      document.body.classList.add('privacy-reader-open');
      privacyClose.focus();
      try {
        privacyFrame.contentWindow.scrollTo(0, 0);
        var root = privacyFrame.contentDocument.scrollingElement || privacyFrame.contentDocument.documentElement;
        root.scrollTop = 0;
      } catch (e) { /* iframe henüz yüklenmemiş olabilir */ }
    }

    function closePrivacyReader() {
      privacyReader.classList.remove('open');
      privacyReader.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('privacy-reader-open');
    }

    Array.prototype.forEach.call(privacyLinks, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openPrivacyReader(link);
      });
    });
    privacyClose.addEventListener('click', closePrivacyReader);
    privacyAccept.addEventListener('click', function () {
      if (privacyAccept.disabled) return;
      if (pendingConsent) {
        pendingConsent.checked = true;
        pendingConsent.dispatchEvent(new Event('change', { bubbles: true }));
      }
      closePrivacyReader();
    });
    privacyReader.addEventListener('click', function (e) {
      if (e.target === privacyReader) closePrivacyReader();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && privacyReader.classList.contains('open')) closePrivacyReader();
    });
  }
  // ── Nav gölgesi ──
  var nav = document.querySelector('.nav');
  function onNavScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // ── Kaydırma ilerleme çubuğu (tüm sayfalar) ──
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);
  var progressTicking = false;
  function updateProgress() {
    var max = docEl.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    progressTicking = false;
  }
  function requestProgress() {
    if (!progressTicking) { progressTicking = true; requestAnimationFrame(updateProgress); }
  }
  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestProgress, { passive: true });
  updateProgress();

  // ── Hero başlığı: kelime kelime giriş ──
  // Metin düğümleri span.hw'lere bölünür; span.accent içi de aynı şekilde işlenir.
  var heroTitle = document.getElementById('hero-title');
  if (heroTitle && !reduceMotion) {
    var wordIndex = 0;
    function splitWords(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      children.forEach(function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span');
            w.className = 'hw';
            w.style.setProperty('--i', wordIndex++);
            w.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          splitWords(child);
        }
      });
    }
    splitWords(heroTitle);
  }

  // ── Scroll reveal ──
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

  // ── Sayaçlar (istatistik bandı) ──
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    function runCounter(el) {
      var target = parseInt(el.dataset.count, 10) || 0;
      if (reduceMotion || target === 0) { el.textContent = String(target); return; }
      var dur = 1300;
      var start = null;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    } else {
      Array.prototype.forEach.call(counters, function (el) { el.textContent = el.dataset.count; });
    }
  }

  // ── Sabit özellik sahnesi: scroll ilerledikçe kart ve telefon ekranı değişir ──
  var showcase = document.querySelector('.showcase');
  var showcaseStage = document.querySelector('.showcase-stage');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.showcase .step'));
  var shots = Array.prototype.slice.call(document.querySelectorAll('.showcase-sticky .screen img'));
  if (showcase && showcaseStage && steps.length && shots.length) {
    showcase.style.setProperty('--showcase-steps', String(steps.length));
    var activeShot = -1;
    var showcaseTicking = false;
    var desktopShowcase = window.matchMedia('(min-width: 901px)');

    function activate(index) {
      var next = Math.max(0, Math.min(index, steps.length - 1));
      if (next === activeShot) return;
      var previousShot = activeShot >= 0 ? shots[activeShot] : null;
      activeShot = next;
      steps.forEach(function (s) { s.classList.toggle('active', +s.dataset.shot === next); });
      shots.forEach(function (img) {
        img.classList.remove('active', 'outgoing');
      });
      if (previousShot && previousShot !== shots[next]) previousShot.classList.add('outgoing');
      shots[next].classList.add('active');
      if (previousShot) {
        window.setTimeout(function () {
          if (!previousShot.classList.contains('active')) previousShot.classList.remove('outgoing');
        }, 520);
      }
    }

    function showcaseRange() {
      var navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
      var start = showcase.offsetTop - navHeight;
      var distance = Math.max(1, showcase.offsetHeight - showcaseStage.offsetHeight);
      return { start: start, end: start + distance };
    }

    function updateShowcase() {
      showcaseTicking = false;
      if (!desktopShowcase.matches) return;
      var range = showcaseRange();
      var progress = (window.scrollY - range.start) / (range.end - range.start);
      var clamped = Math.max(0, Math.min(progress, 1));
      activate(Math.round(clamped * (steps.length - 1)));
    }

    function requestShowcaseUpdate() {
      if (showcaseTicking) return;
      showcaseTicking = true;
      requestAnimationFrame(updateShowcase);
    }

    steps.forEach(function (s) {
      s.addEventListener('click', function () {
        var index = +s.dataset.shot;
        if (!desktopShowcase.matches) { activate(index); return; }
        var range = showcaseRange();
        var ratio = steps.length > 1 ? index / (steps.length - 1) : 0;
        window.scrollTo({
          top: range.start + (range.end - range.start) * ratio,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
      });
    });

    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        if (desktopShowcase.matches) return;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activate(+entry.target.dataset.shot);
        });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      steps.forEach(function (s) { sio.observe(s); });
    }

    window.addEventListener('scroll', requestShowcaseUpdate, { passive: true });
    window.addEventListener('resize', requestShowcaseUpdate, { passive: true });
    activate(0);
    requestShowcaseUpdate();
  }
  // ── Yapay zeka yazma demosu ──
  var aiTyped = document.getElementById('ai-typed');
  var aiResult = document.getElementById('ai-result');
  if (aiTyped && aiResult) {
    var aiTags = Array.prototype.slice.call(aiResult.querySelectorAll('.ai-tag'));
    var aiValues = Array.prototype.slice.call(aiResult.querySelectorAll('.ai-tag .v'));
    var PHRASES = {
      tr: [
        { text: 'Markete 450 TL', v: ['₺450', 'Market', 'Bugün'] },
        { text: 'Maaş yattı 85.000 TL', v: ['₺85.000', 'Maaş', 'Bugün'] },
        { text: 'Dün akşam yemeği 1.250 TL', v: ['₺1.250', 'Restoran', 'Dün'] }
      ],
      en: [
        { text: '450 TL groceries', v: ['₺450', 'Groceries', 'Today'] },
        { text: 'Salary received 85,000 TL', v: ['₺85,000', 'Salary', 'Today'] },
        { text: 'Dinner last night 1,250 TL', v: ['₺1,250', 'Dining', 'Yesterday'] }
      ]
    };
    function setValues(vals) {
      aiValues.forEach(function (el, i) { el.textContent = vals[i] || ''; });
    }
    function showTags(show, cb) {
      aiTags.forEach(function (tag, i) {
        setTimeout(function () { tag.classList.toggle('show', show); }, show ? i * 130 : 0);
      });
      if (cb) setTimeout(cb, show ? aiTags.length * 130 : 260);
    }
    if (reduceMotion) {
      renderAiDemo = function () {
        var staticPhrase = (PHRASES[docEl.dataset.activeLang] || PHRASES.tr)[0];
        aiTyped.textContent = staticPhrase.text;
        setValues(staticPhrase.v);
        aiTags.forEach(function (tag) { tag.classList.add('show'); });
      };
      renderAiDemo();
    } else {
      var phraseIdx = 0;
      var demoStarted = false;
      function typeLoop() {
        var lang = docEl.dataset.activeLang === 'en' ? 'en' : 'tr';
        var phrase = PHRASES[lang][phraseIdx % PHRASES[lang].length];
        var chars = Array.from(phrase.text);
        var charIdx = 0;
        aiTyped.textContent = '';
        setValues([]);
        function typeChar() {
          if (charIdx < chars.length) {
            aiTyped.textContent += chars[charIdx++];
            setTimeout(typeChar, 52);
          } else {
            setTimeout(function () {
              setValues(phrase.v);
              showTags(true, function () {
                setTimeout(function () {
                  showTags(false, function () {
                    (function erase() {
                      var currentText = aiTyped.textContent;
                      if (currentText.length) {
                        aiTyped.textContent = currentText.slice(0, -1);
                        setTimeout(erase, 24);
                      } else {
                        phraseIdx++;
                        setTimeout(typeLoop, 420);
                      }
                    })();
                  });
                }, 2300);
              });
            }, 380);
          }
        }
        typeChar();
      }
      if ('IntersectionObserver' in window) {
        var aiObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !demoStarted) {
              demoStarted = true;
              setTimeout(typeLoop, 400);
              aiObserver.disconnect();
            }
          });
        }, { threshold: 0.4 });
        aiObserver.observe(aiTyped.closest('.ai-demo'));
      } else {
        typeLoop();
      }
    }
  }
  // ── Galeri şeridi: geniş ekranlarda boşluk kalmayacak kadar çoğalt ──
  var marqueeTracks = document.querySelectorAll('.gallery .marquee-track');
  var galleryMarqueeSpeed = 54; // CSS pixels per second; track length determines loop duration.
  Array.prototype.forEach.call(marqueeTracks, function (track) {
    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;
    var targetWidth = window.innerWidth * 1.35;
    var guard = 0;
    while (track.scrollWidth < targetWidth && guard < 4) {
      originals.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute('tabindex', '-1');
        if (clone.tagName === 'BUTTON') clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      guard++;
    }
    track.style.setProperty(
      '--gallery-marquee-duration',
      (track.scrollWidth / galleryMarqueeSpeed).toFixed(3) + 's'
    );
  });
  // ── Galeri: ekran görüntüsünü büyük önizlemede aç ──
  var shotModal = document.getElementById('shot-modal');
  var shotButtons = document.querySelectorAll('.gallery .shot[data-full]');
  if (shotModal && shotButtons.length) {
    var modalImg = shotModal.querySelector('.shot-modal-frame img');
    var modalClose = shotModal.querySelector('.shot-modal-close');
    var lastShotButton = null;
    var modalLoadToken = 0;
    var fullShotCache = Object.create(null);

    function getFullShot(src) {
      if (!src) return null;
      if (!fullShotCache[src]) {
        var image = new Image();
        image.decoding = 'async';
        image.src = src;
        fullShotCache[src] = image;
      }
      return fullShotCache[src];
    }

    function setModalImageSize() {
      modalImg.style.maxWidth = 'min(92vw, ' + modalImg.naturalWidth + 'px)';
      modalImg.style.maxHeight = 'min(92svh, ' + modalImg.naturalHeight + 'px)';
    }

    function closeShotModal() {
      modalLoadToken++;
      shotModal.classList.remove('open');
      shotModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (modalImg) {
        modalImg.onload = null;
        modalImg.removeAttribute('src');
        modalImg.alt = '';
      }
      if (lastShotButton && typeof lastShotButton.focus === 'function') lastShotButton.focus();
    }

    function openShotModal(btn) {
      if (!modalImg) return;
      lastShotButton = btn;
      var token = ++modalLoadToken;
      var thumb = btn.querySelector('img');
      var previewSrc = thumb ? (thumb.currentSrc || thumb.src) : '';
      var fullSrc = btn.dataset.full;

      modalImg.alt = thumb ? thumb.alt : '';
      modalImg.onload = setModalImageSize;
      modalImg.src = previewSrc || fullSrc;
      shotModal.classList.add('open');
      shotModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (modalClose) modalClose.focus();

      var fullImage = getFullShot(fullSrc);
      if (!fullImage) return;
      function showFullImage() {
        if (token !== modalLoadToken || !shotModal.classList.contains('open')) return;
        modalImg.onload = setModalImageSize;
        modalImg.src = fullSrc;
      }
      if (fullImage.complete && fullImage.naturalWidth) {
        if (typeof fullImage.decode === 'function') fullImage.decode().then(showFullImage, showFullImage);
        else showFullImage();
      } else {
        fullImage.addEventListener('load', showFullImage, { once: true });
      }
    }

    Array.prototype.forEach.call(shotButtons, function (btn) {
      function preloadFullShot() { getFullShot(btn.dataset.full); }
      btn.addEventListener('pointerenter', preloadFullShot, { passive: true });
      btn.addEventListener('pointerdown', preloadFullShot, { passive: true });
      btn.addEventListener('focus', preloadFullShot);
      btn.addEventListener('click', function () { openShotModal(btn); });
    });    if (modalClose) modalClose.addEventListener('click', closeShotModal);
    shotModal.addEventListener('click', function (e) {
      if (e.target === shotModal) closeShotModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && shotModal.classList.contains('open')) closeShotModal();
    });
  }
  // ── Yasal sayfalar: içindekiler (TOC) + scrollspy ──
  // Aktif dilin bölüm başlıklarından kenar menüsü kurulur. Aktif bölüm,
  // referans çizgisini (viewport'un ~%30'u) geçen SON başlıktır; sayfa
  // sonuna ulaşılınca son madde seçilir. Böylece alt bölümler de kısa
  // olsalar bile mutlaka seçilebilir. applyLang her dil değişiminde
  // yeniden çağırır (fonksiyon bildirimi hoist edilir).
  var tocScrollHandler = null;
  function buildLegalToc(lang) {
    var toc = document.querySelector('.legal-toc');
    if (!toc) return;
    var nav = toc.querySelector('nav');
    var title = toc.querySelector('h4');
    var section = document.querySelector('.legal-layout section[data-lang="' + lang + '"]');
    if (!nav || !section) return;
    if (title) title.textContent = lang === 'en' ? 'Contents' : 'İçindekiler';
    nav.innerHTML = '';
    if (tocScrollHandler) {
      window.removeEventListener('scroll', tocScrollHandler);
      window.removeEventListener('resize', tocScrollHandler);
      tocScrollHandler = null;
    }
    var blocks = section.querySelectorAll('.legal-block');
    var links = [];
    Array.prototype.forEach.call(blocks, function (block, i) {
      var h2 = block.querySelector('h2');
      if (!h2) return;
      var id = 'bolum-' + lang + '-' + (i + 1);
      block.id = id;
      var a = document.createElement('a');
      a.href = '#' + id;
      // Başlıktaki "1. " gibi numaralar atılır; sıra numarasını CSS sayacı basar
      a.textContent = h2.textContent.replace(/^\d+\.\s*/, '');
      nav.appendChild(a);
      links.push({ block: block, link: a });
    });
    if (!links.length) return;
    function setActive(block) {
      links.forEach(function (l) {
        l.link.classList.toggle('active', l.block === block);
      });
    }
    // Tıklanan madde "sabitlenir": kullanıcı kendisi kaydırana kadar vurgu
    // orada kalır. Böylece sayfa dibine yakın kısa bölümler de tıklamayla
    // güvenle seçilebilir; spy vurguyu geri çalamaz.
    var pinned = null;
    var ticking = false;
    function update() {
      ticking = false;
      if (pinned) { setActive(pinned); return; }
      var refY = Math.max(140, window.innerHeight * 0.3);
      var active = links[0].block;
      links.forEach(function (l) {
        if (l.block.getBoundingClientRect().top <= refY) active = l.block;
      });
      // Sayfanın dibine ulaşıldıysa son bölüm aktif olsun
      if (window.innerHeight + window.scrollY >= docEl.scrollHeight - 8) {
        active = links[links.length - 1].block;
      }
      setActive(active);
    }
    tocScrollHandler = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    function unpin() { pinned = null; }
    window.addEventListener('scroll', tocScrollHandler, { passive: true });
    window.addEventListener('resize', tocScrollHandler, { passive: true });
    // Gerçek kullanıcı hareketi sabitlemeyi kaldırır (programatik scroll kaldırmaz)
    window.addEventListener('wheel', unpin, { passive: true });
    window.addEventListener('touchstart', unpin, { passive: true });
    window.addEventListener('keydown', unpin, { passive: true });
    links.forEach(function (l) {
      l.link.addEventListener('click', function () {
        pinned = l.block;
        setActive(l.block);
      });
    });
    update();
  }

  // ── SSS akordeonu (destek sayfası) ──
  var faqButtons = document.querySelectorAll('.faq-q');
  Array.prototype.forEach.call(faqButtons, function (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      // Aynı listedeki diğer açık öğeleri kapat
      var siblings = item.parentElement.querySelectorAll('.faq-item.open');
      Array.prototype.forEach.call(siblings, function (other) {
        if (other === item) return;
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = '0px';
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
    });
  });

  // ── Telefonlarda hafif paralaks (görünürken, scroll'a bağlı) ──
  // Transform yerine --py CSS değişkeni yazılır; tilt (--rx/--ry) ile çakışmaz.
  if (!reduceMotion) {
    var phones = Array.prototype.slice.call(document.querySelectorAll('.phone[data-parallax]'));
    if (phones.length) {
      var parallaxTicking = false;
      function parallax() {
        var vh = window.innerHeight;
        phones.forEach(function (p) {
          var r = p.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var progress = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 civarı
          p.style.setProperty('--py', (progress * 44).toFixed(1) + 'px');
        });
        parallaxTicking = false;
      }
      window.addEventListener('scroll', function () {
        if (!parallaxTicking) { parallaxTicking = true; requestAnimationFrame(parallax); }
      }, { passive: true });
      parallax();
    }
  }

  // ── Telefonlarda 3D tilt (yalnızca imleçli cihazlar) ──
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tiltPhones = document.querySelectorAll('.phone:not(.float)');
    Array.prototype.forEach.call(tiltPhones, function (p) {
      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        p.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        p.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      p.addEventListener('pointerleave', function () {
        p.style.setProperty('--rx', '0deg');
        p.style.setProperty('--ry', '0deg');
      });
    });
  }

  // ── Destek chatbotu: sağ altta açılan, kural tabanlı SSS asistanı ──
  // Sunucu/API kullanmaz; support.html SSS'i ve yasal sayfalarla tutarlı sabit
  // yanıtlardan anahtar kelime eşleştirmesiyle en uygun cevabı seçer.
  (function setupSupportBot() {
    var CHAT_KEY = 'el-finans-chat-open';
    var HISTORY_KEY = 'el-finans-chat-history';
    var MAX_TRANSCRIPT = 40;
    var qa = [
      {
        id: 'account',
        question: { tr: "Hesap oluşturmadan kullanabilir miyim?", en: "Can I use it without an account?" },
        category: 'security',
        related: ['security', 'device', 'app-lock'],
        keywords: ['hesap olu', 'hesapsız', 'hesap açmadan', 'kayıt olmadan', 'create an account', 'creating an account', 'sign up', 'without an account', 'without account'],
        tr: 'Evet. Gelir-gider kaydı, bütçe ve birikim gibi temel özellikleri hesap açmadan cihazınızda kullanabilirsiniz. Premium; satın alma doğrulaması, AI hakları, şifreli bulut yedekleri ve ortak hesap yetkileri için hesap gerektirir.',
        en: 'Yes. You can use basic features like income/expense tracking, budgets and savings locally without an account. Premium requires an account for purchase verification, AI allowances, encrypted cloud backups and shared-account permissions.'
      },
      {
        id: 'security',
        question: { tr: "Verilerim güvende mi?", en: "Is my data safe?" },
        category: 'security',
        related: ['app-lock', 'shared-account', 'delete'],
        keywords: ['güvenli', 'şifreli', 'encrypt', 'safe', 'security', 'gizli', 'veri güvenliği', 'aes'],
        tr: 'Kişisel finans verileriniz cihazınızda ve kişisel bulut yedeklerinde AES-256-GCM ile şifrelenir; açık anahtarlar sunucuya gönderilmez. Ortak hesap senkronizasyon verileri, yetkili üyelerin birlikte kullanabilmesi için şifrelenmemiş tutulur ve rol tabanlı erişimle (RLS, üyelik, sahip/yönetici kontrolleri) korunur. Detaylar için Gizlilik Politikası sayfasına bakın.',
        en: 'Your personal financial data is protected with AES-256-GCM on-device and in personal cloud backups; plaintext keys are never sent to the server. Shared-account sync data is kept unencrypted so authorized members can collaborate, and is protected by role-based access (RLS, membership, owner/admin checks). See the Privacy Policy for details.'
      },
      {
        id: 'device',
        question: { tr: "Yeni cihaza geçersem ne olur?", en: "What happens if I switch devices?" },
        category: 'security',
        related: ['backup', 'account', 'security'],
        keywords: ['yeni cihaz', 'cihaz değiş', 'telefon değiş', 'new device', 'switch device', 'restore', 'geri yükle', 'yedek'],
        tr: 'Google/Apple hesabınızla giriş yaptığınızda bulut senkronizasyonu verilerinizi getirir. Ayrıca Ayarlar\'dan şifreli yedek dosyası (.elfb) oluşturup yeni cihazda geri yükleyebilirsiniz.',
        en: 'Signing in with your Google/Apple account restores your data via cloud sync. You can also create an encrypted backup file (.elfb) from Settings and restore it on the new device.'
      },
      {
        id: 'premium',
        question: { tr: "Premium aboneliğimi nasıl yönetirim?", en: "How do I manage my Premium subscription?" },
        category: 'premium',
        related: ['ai', 'ads', 'terms'],
        keywords: ['premium', 'abone', 'üyelik', 'subscription', 'satın al', 'purchase', 'iptal', 'cancel'],
        tr: 'Premium satın alma ve geri yükleme öncesinde EL Finans hesabınızla giriş yapmanız gerekir. Abonelik ödemesi App Store veya Google Play üzerinden yönetilir; iptal için cihazınızın abonelik ayarlarını kullanın. Uygulamada bu seçenekler Ayarlar → Hesap ve Üyelik bölümündedir.',
        en: 'You must sign in to your EL Finans account before purchasing or restoring Premium. Subscription payments are managed through the App Store or Google Play; cancel via your device\'s subscription settings. In the app, this is under Settings → Account & Membership.'
      },
      {
        id: 'terms',
        question: { tr: "Kullanım şartları nelerdir?", en: "What are the terms of use?" },
        category: 'premium',
        related: ['premium', 'delete', 'contact'],
        keywords: ['kullanım şart', 'şartlar', 'terms', 'sorumluluk', 'fikri mülkiyet'],
        tr: 'Kullanım şartları; kullanıcı sorumlulukları, premium üyelik, reklamlar, sorumluluk sınırı ve fikri mülkiyet gibi başlıkları Kullanım Şartları sayfasında bulabilirsiniz.',
        en: 'You can find the terms of use — user responsibilities, premium membership, advertising, limitation of liability and intellectual property — on the Terms of Use page.'
      },
      {
        id: 'delete',
        question: { tr: "Hesabımı nasıl silerim?", en: "How do I delete my account?" },
        category: 'security',
        related: ['security', 'shared-account', 'contact'],
        keywords: ['hesap sil', 'veri sil', 'delete account', 'delete my data', 'delete data'],
        tr: 'Hesabınızı ve verilerinizi uygulama içinden kalıcı olarak silebilirsiniz. Adımlar için Hesap Silme sayfasına bakın. Silme işlemi kişisel Supabase verilerinizi ve özel depolama yedeklerinizi kaldırır; yalnızca yasal/mağaza doğrulama gibi zorunlu kayıtlar ve ortak hesap verileri (sahibi tarafından silinene kadar) kalabilir.',
        en: 'You can permanently delete your account and data from within the app. See the Account Deletion page for the steps. Deletion removes your user-scoped Supabase data and private storage backups; only records required for legal/store verification and shared-account data (until the owner deletes it) may remain.'
      },
      {
        id: 'ai',
        question: { tr: "Yapay zekâ özellikleri nasıl çalışır?", en: "How do the AI features work?" },
        category: 'premium',
        related: ['premium', 'reports', 'onboarding'],
        keywords: ['yapay zeka', 'yapay zekâ', 'ai ', ' ai', 'gemini', 'asistan'],
        tr: 'Yapay zekâ özellikleri 18 yaş ve üzeri kullanıcılar için sunulur, yalnızca kullanıcı talebiyle ve ayrı bir onay sonrası çalışır; istekler kimlik doğrulamalı bir Supabase Edge Function üzerinden Google Gemini API\'ye iletilir.',
        en: 'AI features are available for users aged 18+, run only after a user-initiated request and separate explicit consent, and route through an authenticated Supabase Edge Function to the Google Gemini API.'
      },
      {
        id: 'ads',
        question: { tr: "Uygulamada reklam var mı?", en: "Are there ads in the app?" },
        category: 'premium',
        related: ['premium', 'security'],
        keywords: ['reklam', 'ad ', 'ads', 'admob'],
        tr: 'Ücretsiz kullanıcılar banner veya ödüllü AdMob reklamları görebilir; ancak kişisel finansal kayıtlarınız reklam hedeflemesinde kullanılmaz.',
        en: 'Free users may see banner or rewarded AdMob ads, but your personal financial records are never used for ad targeting.'
      },
      {
        id: 'bug',
        question: { tr: "Bir hata buldum, nasıl bildiririm?", en: "I found a bug — how do I report it?" },
        category: 'support',
        related: ['contact'],
        keywords: ['hata', 'bug', 'çöktü', 'crash', 'sorun bildir', 'report'],
        tr: 'Hatanın hangi ekranda ve hangi adımlarla oluştuğunu kısaca yazıp Destek sayfasındaki formdan gönderin. Cihaz modeli ve işletim sistemi sürümünü eklerseniz çözüm süreci hızlanır.',
        en: 'Briefly describe on which screen and with which steps the bug occurs, and send it via the form on the Support page. Including your device model and OS version speeds up the resolution.'
      },
      {
        id: 'contact',
        question: { tr: "Destek ekibine nasıl ulaşırım?", en: "How do I contact support?" },
        category: 'support',
        related: ['bug', 'terms'],
        keywords: ['iletişim', 'e-posta', 'email', 'mail', 'contact', 'ulaş'],
        tr: 'Destek ekibine Destek sayfasındaki formdan ya da support@elfinans.com adresinden ulaşabilirsiniz.',
        en: 'You can reach the support team via the form on the Support page or at support@elfinans.com.'
      },
      {
        id: 'categories',
        question: { tr: "Kategorileri özelleştirebilir miyim?", en: "Can I customize categories?" },
        category: 'features',
        related: ['budget', 'creditcard', 'appearance'],
        keywords: ['kategori', 'category', 'categories'],
        tr: 'Gelir/gider kategorileri (Maaş, Ek Gelir, Kira, Kredi Borcu, Kredi Kartı, Market vb.) hazır renk ve emoji ile gelir; Ayarlar → Kategori Yönetimi bölümünden kendi kategorilerinizi ekleyebilir, yeniden adlandırabilir veya renk/simgesini değiştirebilirsiniz.',
        en: 'Income/expense categories (Salary, Extra Income, Rent, Loan Debt, Credit Card, Market, etc.) come with a color and emoji; you can add, rename or recolor your own categories from Settings → Category Management.'
      },
      {
        id: 'currency',
        question: { tr: "Hangi para birimlerini destekliyor?", en: "Which currencies are supported?" },
        category: 'features',
        related: ['savings', 'reports'],
        keywords: ['para birim', 'döviz', 'currency', 'usd', 'euro', 'altın', 'gümüş', 'kripto', 'crypto', 'gold', 'silver'],
        tr: 'Uygulamanın ana para birimi Türk Lirası\'dır. Ayrıca döviz (USD/EUR/GBP), altın (gram/çeyrek/yarım/tam), gümüş ve kripto (BTC/ETH/USDT) gibi varlıkları güncel piyasa kurlarıyla birikimlerinizde takip edebilirsiniz.',
        en: 'The app\'s base currency is Turkish Lira. You can also track assets like foreign currency (USD/EUR/GBP), gold (gram/quarter/half/full), silver and crypto (BTC/ETH/USDT) in your savings with live market rates.'
      },
      {
        id: 'creditcard',
        question: { tr: "Kredi kartımı nasıl takip ederim?", en: "How do I track my credit card?" },
        category: 'features',
        related: ['budget', 'categories', 'reports'],
        keywords: ['kredi kart', 'ekstre', 'limit', 'asgari ödeme', 'credit card', 'statement', 'minimum payment', 'taksit', 'installment'],
        tr: 'Kredi kartı takibinde ekstre/son ödeme tarihi, asgari ödeme tutarı, kullanılabilir/kullanılan limit, taksitli alışverişler, nakit avans ve gecikme faizi gibi tüm ekstre süreci modellenir. Yaklaşan ekstreleri önden görebilirsiniz.',
        en: 'Credit card tracking models the full statement cycle: statement/due dates, minimum payment amount, available/used limit, installment purchases, cash advances and late fees. You can preview upcoming statements in advance.'
      },
      {
        id: 'budget',
        question: { tr: "Bütçe limiti nasıl kurulur?", en: "How do I set a budget limit?" },
        category: 'features',
        related: ['categories', 'notifications', 'reports'],
        keywords: ['bütçe', 'budget', 'limit aş', 'harcama limit'],
        tr: 'Her kategori için bütçe limiti belirleyebilirsiniz; harcamalarınız limitin %80\'ine ulaştığında uyarı, %100\'üne ulaştığında ise aşım bildirimi Özet ekranındaki bütçe hedefleri kartında görünür.',
        en: 'You can set a budget limit per category; a warning appears at 80% of the limit and an over-limit alert at 100%, shown on the budget goals card in the Summary screen.'
      },
      {
        id: 'savings',
        question: { tr: "Birikim hedefi nasıl oluşturulur?", en: "How do I create a savings goal?" },
        category: 'features',
        related: ['currency', 'budget', 'reports'],
        keywords: ['birikim', 'hedef', 'saving', 'goal'],
        tr: 'Birikim sekmesinden hedef tutarlı birikim hedefleri oluşturabilir, zamanla katkı ekleyebilir ve hedef/mevcut tutarı düzenleyebilirsiniz.',
        en: 'From the Savings tab you can create goals with a target amount, contribute over time, and edit the target or current amount.'
      },
      {
        id: 'shared-account',
        question: { tr: "Ortak hesap nasıl çalışır?", en: "How do shared accounts work?" },
        category: 'features',
        related: ['security', 'delete', 'backup'],
        keywords: ['ortak hesap', 'davet', 'shared account', 'joint account', 'invite', 'rol', 'role'],
        tr: 'Ortak hesaplarda bir davet kodu (QR veya bağlantı) ile diğer kullanıcıları ekleyebilirsiniz. Sahip, Yönetici, Düzenleyici ve Görüntüleyici olmak üzere 4 rol vardır; rol değişikliği ve sahiplik devri Sahip/Yönetici tarafından yapılabilir.',
        en: 'In shared accounts, you invite other users via a code (QR or link). There are 4 roles — Owner, Admin, Editor and Viewer — and role changes or ownership transfer can be done by the Owner/Admin.'
      },
      {
        id: 'reports',
        question: { tr: "Rapor alabilir miyim?", en: "Can I export reports?" },
        category: 'features',
        related: ['ai', 'budget', 'backup'],
        keywords: ['rapor', 'analiz', 'grafik', 'report', 'analytics', 'chart', 'export', 'dışa aktar', 'excel', 'pdf'],
        tr: 'Nakit akışı ve kategori dağılımı gibi grafiklerin yanı sıra raporlarınızı Excel veya PDF olarak dışa aktarabilir, ayrıca yapay zekâ destekli bir finansal danışman özetini görüntüleyebilirsiniz.',
        en: 'Besides charts like cash flow and category distribution, you can export reports as Excel or PDF, and view an AI-powered financial advisor summary.'
      },
      {
        id: 'backup',
        question: { tr: "Verilerimi nasıl yedeklerim?", en: "How do I back up my data?" },
        category: 'features',
        related: ['device', 'security', 'shared-account'],
        keywords: ['yedek', 'backup', 'senkron', 'sync', 'aktar', 'transfer', 'qr'],
        tr: 'Verileriniz cihazda AES-256-GCM ile şifrelenir; manuel/otomatik bulut yedeği, yedek geçmişi ve QR kod ile telefondan telefona veri aktarımı desteklenir.',
        en: 'Your data is encrypted on-device with AES-256-GCM; manual/automatic cloud backup, backup history and phone-to-phone transfer via QR code are supported.'
      },
      {
        id: 'notifications',
        question: { tr: "Bildirimleri nasıl yönetirim?", en: "How do I manage notifications?" },
        category: 'features',
        related: ['budget', 'appearance', 'onboarding'],
        keywords: ['bildirim', 'hatırlat', 'notification', 'reminder'],
        tr: 'Günlük hatırlatma, haftalık/aylık özet, yedekleme hatırlatması ve sabit ödeme/taksit hatırlatmaları gibi bildirimleri Ayarlar\'dan ayrı ayrı açıp kapatabilirsiniz.',
        en: 'You can individually toggle notifications like daily reminders, weekly/monthly summaries, backup reminders and recurring payment/installment reminders from Settings.'
      },
      {
        id: 'appearance',
        question: { tr: "Karanlık mod var mı?", en: "Is there a dark mode?" },
        category: 'features',
        related: ['language', 'notifications', 'platform'],
        keywords: ['tema', 'karanlık mod', 'dark mode', 'theme', 'görünüm', 'appearance', 'renk'],
        tr: 'Açık/Koyu/Sistem tema modu ile birlikte 7 farklı vurgu rengi (Mavi, Slate, Ruby, Pembe, Mor, Teal, Altın) arasından seçim yapabilirsiniz.',
        en: 'You can choose Light/Dark/System theme mode along with 7 accent color themes (Blue, Slate, Ruby, Pink, Purple, Teal, Gold).'
      },
      {
        id: 'language',
        question: { tr: "Hangi dilleri destekliyor?", en: "Which languages are supported?" },
        category: 'features',
        related: ['appearance', 'platform', 'onboarding'],
        keywords: ['dil', 'language', 'türkçe', 'ingilizce', 'almanca', 'fransızca'],
        tr: 'Uygulama Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Portekizce ve İtalyanca olmak üzere 7 dili destekler.',
        en: 'The app supports 7 languages: Turkish, English, German, French, Spanish, Portuguese and Italian.'
      },
      {
        id: 'app-lock',
        question: { tr: "PIN veya biyometrik kilit var mı?", en: "Is there a PIN or biometric lock?" },
        category: 'security',
        related: ['security', 'account', 'delete'],
        keywords: ['pin', 'biyometrik', 'parmak izi', 'yüz tanıma', 'biometric', 'face id', 'touch id', 'kilit'],
        tr: 'Uygulamayı 4 haneli PIN ve biyometrik kilit (Face ID/Touch ID veya Android biyometrisi) ile ek bir güvenlik katmanıyla koruyabilirsiniz.',
        en: 'You can protect the app with a 4-digit PIN and biometric lock (Face ID/Touch ID or Android biometrics) as an extra security layer.'
      },
      {
        id: 'platform',
        question: { tr: "Hangi cihazlarda çalışıyor?", en: "Which devices does it run on?" },
        category: 'features',
        related: ['language', 'appearance', 'onboarding'],
        keywords: ['ios', 'android', 'tablet', 'hangi cihaz', 'platform'],
        tr: 'EL Finans iOS ve Android telefonlarda kullanılabilir; tablet desteği şu an bulunmamaktadır.',
        en: 'EL Finans is available on iOS and Android phones; tablet support is not currently available.'
      },
      {
        id: 'onboarding',
        question: { tr: "Uygulamayı nasıl kullanmaya başlarım?", en: "How do I get started with the app?" },
        category: 'features',
        related: ['ai', 'savings', 'notifications'],
        keywords: ['nasıl kullan', 'başlarken', 'getting started', 'how to use', 'tanıtım turu', 'onboarding'],
        tr: 'İlk açılışta uygulama içi 11 adımlık bir tanıtım turu sizi ilk kayıt, sabit işlem, bütçe hedefleri, yapay zekâ danışmanı ve birikim hedefi oluşturma gibi temel adımlarda yönlendirir; istediğiniz zaman kaldığınız yerden devam edebilirsiniz.',
        en: 'On first launch, an in-app 11-step guided tour walks you through basics like your first transaction, recurring plans, budget goals, the AI advisor and creating a savings goal; you can resume it anytime.'
      }
    ];
    var byId = {};
    qa.forEach(function (entry) { byId[entry.id] = entry; });

    var categoryMeta = {
      security: { tr: 'Güvenlik', en: 'Security' },
      premium: { tr: 'Premium', en: 'Premium' },
      features: { tr: 'Uygulama Özellikleri', en: 'App Features' },
      support: { tr: 'Destek', en: 'Support' }
    };
    var categoryOrder = ['security', 'premium', 'features', 'support'];
    // Her kategoriden ilk madde, o kategoriye girildiğinde gösterilecek soru listesini oluşturur.
    var categoryEntries = {};
    qa.forEach(function (entry) {
      if (!categoryEntries[entry.category]) categoryEntries[entry.category] = [];
      categoryEntries[entry.category].push(entry);
    });
    var fallback = {
      tr: 'Bunu tam olarak bilemiyorum, ama Destek sayfasındaki Sık Sorulan Sorular\'a bakabilir ya da support@elfinans.com üzerinden bize yazabilirsiniz.',
      en: 'I\'m not sure about that one, but you can check the FAQ on the Support page or reach us at support@elfinans.com.'
    };
    var greeting = {
      tr: 'Merhaba! EL Finans hakkında sorularınızı yanıtlayabilirim. Bir konu seçin ya da sorunuzu doğrudan yazın:',
      en: 'Hi! I can answer questions about EL Finans. Pick a topic below or just type your question:'
    };

    function normalize(text) {
      return text
        .toLocaleLowerCase('tr')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Basit Levenshtein mesafesi: yazım hatalarını/çekim eklerini tolere eder.
    function editDistance(a, b) {
      if (a === b) return 0;
      var la = a.length, lb = b.length;
      if (!la) return lb;
      if (!lb) return la;
      var prev = [];
      for (var j = 0; j <= lb; j++) prev[j] = j;
      for (var i = 1; i <= la; i++) {
        var cur = [i];
        for (var k = 1; k <= lb; k++) {
          var cost = a[i - 1] === b[k - 1] ? 0 : 1;
          cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
        }
        prev = cur;
      }
      return prev[lb];
    }

    // Bir sorgu kelimesi, bir anahtar kelimenin (tam) kelimelerinden birine
    // yeterince yakınsa (uzunluğa göre orantılı toleransla) eşleşme sayılır.
    // Not: phrase'in rastgele bir alt-dizisiyle değil, tam kelimeleriyle
    // karşılaştırılır — aksi halde "mi", "reminder" içindeki "mi" ile eşleşir.
    function wordMatches(word, phrase) {
      var phraseWords = phrase.split(' ');
      if (phraseWords.indexOf(word) !== -1) return true;
      if (word.length < 4) return false;
      var tolerance = word.length <= 5 ? 1 : 2;
      for (var i = 0; i < phraseWords.length; i++) {
        var pw = phraseWords[i];
        if (pw.length < 4) continue; // kısa kelimeler yalnızca tam eşleşmeyle sayılır
        if (Math.abs(pw.length - word.length) > tolerance) continue;
        if (editDistance(word, pw) <= tolerance) return true;
      }
      return false;
    }

    // Kısa anahtar kelimeler için: bir kelimenin BAŞINDA geçiyor mu kontrol eder
    // ("dil" -> "dilleri" eşleşir, çekim ekleri tolere edilir) ama rastgele metin
    // içinde herhangi bir yerde geçen harfleri eşleşme saymaz ("ad" -> "dsadasdsada" elenir).
    function containsAsWordPrefix(haystack, needle) {
      if (!needle) return false;
      var words = haystack.split(' ');
      for (var i = 0; i < words.length; i++) {
        if (words[i].indexOf(needle) === 0) return true;
      }
      return false;
    }

    function findAnswer(query) {
      var normalized = normalize(query);
      var queryWords = normalized.split(' ').filter(function (w) { return w.length > 1; });
      var best = null;
      var bestScore = 0;
      qa.forEach(function (entry) {
        var score = 0;
        entry.keywords.forEach(function (kw) {
          var normKw = normalize(kw);
          // Tek kelimelik, kısa (≤3 harf) anahtar kelimeler (ör. "ad", "ai") rastgele
          // metin içinde alt-dize olarak kolayca yanlış eşleşir; bunlar için sadece
          // tam kelime sınırı eşleşmesi sayılır, serbest fuzzy toleransı uygulanmaz.
          var isShortSingleWord = normKw.indexOf(' ') === -1 && normKw.length <= 3;
          if (isShortSingleWord) {
            if (containsAsWordPrefix(normalized, normKw)) score += normKw.length * 2;
            return;
          }
          if (normalized.indexOf(normKw) !== -1) {
            score += normKw.length * 2; // tam ifade eşleşmesi en güçlü sinyal
            return;
          }
          var kwWords = normKw.split(' ').filter(function (w) { return w.length > 1; });
          var matchedAll = kwWords.length > 0 && kwWords.every(function (kwWord) {
            return queryWords.some(function (qWord) { return wordMatches(qWord, kwWord) || wordMatches(kwWord, qWord); });
          });
          if (matchedAll) score += normKw.length;
        });
        if (score > bestScore) { bestScore = score; best = entry; }
      });
      return bestScore > 0 ? best : null;
    }

    var BOT_AVATAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/><circle cx="9" cy="14" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.4" fill="currentColor" stroke="none"/><path d="M9 17.5h6"/></svg>';

    var root = document.createElement('div');
    root.className = 'support-bot';
    root.innerHTML =
      '<button type="button" class="support-bot-toggle" aria-haspopup="dialog" aria-expanded="false" aria-label="Destek asistanı">' +
        '<svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
        '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
      '</button>' +
      '<div class="support-bot-panel" role="dialog" aria-label="Destek asistanı" aria-hidden="true">' +
        '<div class="support-bot-head">' +
          '<div class="sb-avatar">' + BOT_AVATAR_SVG + '</div>' +
          '<div class="sb-head-text"><strong class="sb-title">EL Finans Asistanı</strong><span class="sb-sub sb-bot-tag">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/></svg>' +
            '<span class="sb-bot-tag-text">Otomatik yanıt botu</span></span></div>' +
          '<button type="button" class="support-bot-close" aria-label="Kapat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
        '</div>' +
        '<div class="support-bot-body" role="log" aria-live="polite"></div>' +
        '<form class="support-bot-form">' +
          '<input type="text" class="sb-input" autocomplete="off" maxlength="200">' +
          '<button type="submit" class="sb-send" aria-label="Gönder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg></button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(root);

    var toggle = root.querySelector('.support-bot-toggle');
    var panel = root.querySelector('.support-bot-panel');
    var body = root.querySelector('.support-bot-body');
    var form = root.querySelector('.support-bot-form');
    var input = root.querySelector('.sb-input');
    var titleEl = root.querySelector('.sb-title');
    var botTagEl = root.querySelector('.sb-bot-tag-text');
    var started = false;
    var activeSuggestions = null; // en son gösterilen öneri bloğu; yeni mesajda kaldırılır
    var transcript = []; // { text, who, time } — sayfalar arası kalıcılık için
    var currentScreen = { screen: 'categories' }; // restore sırasında hangi chip seti üretilecek
    var visitedIds = []; // bu oturumda zaten sorulmuş konu id'leri; tekrar önerilmez

    function currentLang() {
      return docEl.dataset.activeLang === 'en' ? 'en' : 'tr';
    }

    function formatTime() {
      var d = new Date();
      var h = String(d.getHours()).padStart(2, '0');
      var m = String(d.getMinutes()).padStart(2, '0');
      return h + ':' + m;
    }

    function persistHistory() {
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify({ transcript: transcript, screen: currentScreen, visited: visitedIds }));
      } catch (e) { /* gizli mod vb. */ }
    }

    function clearSuggestions() {
      if (activeSuggestions && activeSuggestions.parentNode) activeSuggestions.parentNode.removeChild(activeSuggestions);
      activeSuggestions = null;
    }

    function addMessage(text, who, time, skipPersist) {
      clearSuggestions();
      var row = document.createElement('div');
      row.className = 'sb-row sb-row-' + who;
      if (who === 'bot') {
        row.innerHTML = '<div class="sb-avatar sb-avatar-sm">' + BOT_AVATAR_SVG + '</div>';
      }
      var col = document.createElement('div');
      col.className = 'sb-col';
      var msg = document.createElement('div');
      msg.className = 'sb-msg sb-' + who;
      msg.textContent = text;
      var timeEl = document.createElement('span');
      timeEl.className = 'sb-time';
      timeEl.textContent = time || formatTime();
      col.appendChild(msg);
      col.appendChild(timeEl);
      row.appendChild(col);
      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
      if (!skipPersist) {
        transcript.push({ text: text, who: who, time: timeEl.textContent });
        if (transcript.length > MAX_TRANSCRIPT) transcript = transcript.slice(transcript.length - MAX_TRANSCRIPT);
        persistHistory();
      }
    }

    function showTyping(callback) {
      var row = document.createElement('div');
      row.className = 'sb-row sb-row-bot sb-typing-row';
      row.innerHTML = '<div class="sb-avatar sb-avatar-sm">' + BOT_AVATAR_SVG + '</div>' +
        '<div class="sb-col"><div class="sb-msg sb-bot sb-typing"><span></span><span></span><span></span></div></div>';
      body.appendChild(row);
      body.scrollTop = body.scrollHeight;
      window.setTimeout(function () {
        if (row.parentNode) row.parentNode.removeChild(row);
        callback();
      }, 550 + Math.random() * 350);
    }

    function renderChips(items, opts) {
      clearSuggestions();
      var all = (items || []).slice();
      if (opts && opts.withHome) {
        var lang = currentLang();
        all.push({ label: lang === 'en' ? '← Main topics' : '← Ana konular', onClick: renderCategoryChips, isHome: true });
      }
      if (!all.length) return;
      var wrap = document.createElement('div');
      wrap.className = 'sb-suggestions-inline';
      all.forEach(function (item) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sb-chip' + (item.isHome ? ' sb-chip-home' : '');
        chip.textContent = item.label;
        chip.addEventListener('click', item.onClick);
        wrap.appendChild(chip);
      });
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      activeSuggestions = wrap;
    }

    // Mevcut sayfada destek formu varsa oraya kaydırır; yoksa /support sayfasına yönlendirir.
    function goToSupportForm() {
      var lang = currentLang();
      var localForm = document.querySelector('section[data-lang="' + lang + '"] form.contact-form');
      if (localForm) {
        var card = localForm.closest('.form-card') || localForm;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('sb-highlight');
        window.setTimeout(function () { card.classList.remove('sb-highlight'); }, 1600);
        return;
      }
      window.location.href = usePhysicalHtmlLinks ? 'support.html#contact-form' : '/support#contact-form';
    }

    // related id listesinden chip tanımları üretir (askEntry'e bağlı).
    // Bu oturumda zaten sorulmuş konular tekrar önerilmez.
    function chipsForRelated(relatedIds, excludeId) {
      var lang = currentLang();
      return (relatedIds || [])
        .map(function (id) { return byId[id]; })
        .filter(function (e) { return e && e.id !== excludeId && visitedIds.indexOf(e.id) === -1; })
        .map(function (relEntry) {
          return { label: relEntry.question[lang], onClick: function () { askEntry(relEntry); } };
        });
    }

    // İlk açılışta: 4 geniş konu başlığı (kategori seçimi).
    function renderCategoryChips() {
      var lang = currentLang();
      currentScreen = { screen: 'categories' };
      renderChips(categoryOrder.map(function (catId) {
        return { label: categoryMeta[catId][lang], onClick: function () { openCategory(catId); } };
      }));
      persistHistory();
    }

    // Bir kategoriye girildiğinde: o kategorideki tüm soru başlıkları.
    function openCategory(catId) {
      var lang = currentLang();
      var label = categoryMeta[catId][lang];
      addMessage(label, 'user');
      showTyping(function () {
        var intro = lang === 'en' ? 'Here are the topics under "' + label + '":' : '"' + label + '" altındaki konular:';
        addMessage(intro, 'bot');
        currentScreen = { screen: 'category', catId: catId };
        renderChips((categoryEntries[catId] || [])
          .filter(function (entry) { return visitedIds.indexOf(entry.id) === -1; })
          .map(function (entry) {
            return { label: entry.question[lang], onClick: function () { askEntry(entry); } };
          }), { withHome: true });
        persistHistory();
      });
    }

    // Bir soruya doğrudan (chip veya eşleşen serbest metinle) cevap verir,
    // ardından o konuyla ilişkili takip sorularını önerir.
    function askEntry(entry) {
      var lang = currentLang();
      addMessage(entry.question[lang], 'user');
      if (visitedIds.indexOf(entry.id) === -1) visitedIds.push(entry.id);
      showTyping(function () {
        addMessage(entry[lang], 'bot');
        currentScreen = { screen: 'entry', entryId: entry.id };
        renderChips(chipsForRelated(entry.related, entry.id), { withHome: true });
        persistHistory();
      });
    }

    function refreshStrings() {
      var lang = currentLang();
      toggle.setAttribute('aria-label', lang === 'en' ? 'Support assistant' : 'Destek asistanı');
      panel.setAttribute('aria-label', lang === 'en' ? 'Support assistant' : 'Destek asistanı');
      titleEl.textContent = lang === 'en' ? 'EL Finans Assistant' : 'EL Finans Asistanı';
      botTagEl.textContent = lang === 'en' ? 'Automated reply bot' : 'Otomatik yanıt botu';
      input.setAttribute('placeholder', lang === 'en' ? 'Type your question…' : 'Sorunuzu yazın…');
    }

    function ask(text) {
      var trimmed = text.trim();
      if (!trimmed) return;
      var lang = currentLang();
      addMessage(trimmed, 'user');
      input.value = '';
      showTyping(function () {
        var match = findAnswer(trimmed);
        if (match) {
          addMessage(match[lang], 'bot');
          if (visitedIds.indexOf(match.id) === -1) visitedIds.push(match.id);
          currentScreen = { screen: 'entry', entryId: match.id };
          renderChips(chipsForRelated(match.related, match.id), { withHome: true });
          persistHistory();
        } else {
          addMessage(fallback[lang], 'bot');
          currentScreen = { screen: 'fallback' };
          renderChips([{
            label: lang === 'en' ? 'Go to support form' : 'Destek formuna git',
            onClick: goToSupportForm
          }], { withHome: true });
          persistHistory();
        }
      });
    }

    // Chip fonksiyon referansları serileştirilemediği için, geri yüklenen ekran etiketinden
    // (currentScreen) chip setini persist etmeden yeniden üretir.
    function renderChipsForScreen(screen) {
      var lang = currentLang();
      if (screen.screen === 'category') {
        renderChips((categoryEntries[screen.catId] || [])
          .filter(function (entry) { return visitedIds.indexOf(entry.id) === -1; })
          .map(function (entry) {
            return { label: entry.question[lang], onClick: function () { askEntry(entry); } };
          }), { withHome: true });
      } else if (screen.screen === 'entry') {
        var entry = byId[screen.entryId];
        renderChips(entry ? chipsForRelated(entry.related, entry.id) : [], { withHome: true });
      } else if (screen.screen === 'fallback') {
        renderChips([{
          label: lang === 'en' ? 'Go to support form' : 'Destek formuna git',
          onClick: goToSupportForm
        }], { withHome: true });
      } else {
        renderChips(categoryOrder.map(function (catId) {
          return { label: categoryMeta[catId][lang], onClick: function () { openCategory(catId); } };
        }));
      }
    }

    function restoreHistory() {
      var raw;
      try { raw = sessionStorage.getItem(HISTORY_KEY); } catch (e) { return false; }
      if (!raw) return false;
      var saved;
      try { saved = JSON.parse(raw); } catch (e) { return false; }
      if (!saved || !Array.isArray(saved.transcript) || !saved.transcript.length) return false;
      saved.transcript.forEach(function (m) { addMessage(m.text, m.who, m.time, true); });
      transcript = saved.transcript;
      visitedIds = Array.isArray(saved.visited) ? saved.visited : [];
      currentScreen = saved.screen || { screen: 'categories' };
      renderChipsForScreen(currentScreen);
      return true;
    }

    function openPanel() {
      root.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      if (!started) {
        started = true;
        if (!restoreHistory()) {
          addMessage(greeting[currentLang()], 'bot');
          renderCategoryChips();
        }
      }
      window.setTimeout(function () { input.focus(); }, 260);
      try { sessionStorage.setItem(CHAT_KEY, '1'); } catch (e) { /* gizli mod vb. */ }
    }

    function closePanel() {
      root.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      try { sessionStorage.removeItem(CHAT_KEY); } catch (e) { /* gizli mod vb. */ }
    }

    toggle.addEventListener('click', function () {
      if (root.classList.contains('open')) closePanel(); else openPanel();
    });
    root.querySelector('.support-bot-close').addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('open')) closePanel();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input.value);
    });

    refreshStrings();
    var previousRenderHook = window.__supportBotRefresh;
    window.__supportBotRefresh = function () {
      refreshStrings();
      if (started) {
        var lang = currentLang();
        titleEl.textContent = lang === 'en' ? 'EL Finans Assistant' : 'EL Finans Asistanı';
      }
      if (previousRenderHook) previousRenderHook();
    };

    try {
      if (sessionStorage.getItem(CHAT_KEY) === '1') openPanel();
    } catch (e) { /* gizli mod vb. */ }
  })();
})();

// EL Finans tanıtım sitesi v2 — animasyonlar + TR/EN dil değişimi
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var docEl = document.documentElement;
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

  // Gömülü gizlilik metninin sonuna ulaşıldığını üst pencereye bildirir.
  if (docEl.classList.contains('embed-policy')) {
    var privacyEndMarker = document.createElement('div');
    privacyEndMarker.setAttribute('aria-hidden', 'true');
    privacyEndMarker.style.cssText = 'height:1px;width:100%;pointer-events:none';
    document.body.appendChild(privacyEndMarker);
    if ('IntersectionObserver' in window) {
      var privacyEndObserver = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) {
          window.parent.postMessage({ type: 'el-finans-privacy-read' }, window.location.origin);
        }
      }, { root: null, threshold: 1 });
      privacyEndObserver.observe(privacyEndMarker);
    }
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
    var frameScrollTarget = null;
    var privacyScrollTimer = null;

    function setPrivacyReady(ready) {
      privacyAccept.disabled = !ready;
      if (ready && privacyNote) {
        privacyNote.textContent = docEl.lang === 'en' ? 'You reached the end of the policy.' : 'Politikanın sonuna ulaştınız.';
      }
    }

    function checkPrivacyScroll() {
      try {
        var frameWindow = privacyFrame.contentWindow;
        var frameDocument = privacyFrame.contentDocument;
        if (!frameWindow || !frameDocument) return;
        var root = frameDocument.scrollingElement || frameDocument.documentElement;
        var body = frameDocument.body;
        var scrollTop = Math.max(frameWindow.scrollY || 0, root.scrollTop || 0, body ? body.scrollTop || 0 : 0);
        var viewportHeight = Math.max(frameWindow.innerHeight || 0, root.clientHeight || 0, privacyFrame.clientHeight || 0);
        var scrollHeight = Math.max(root.scrollHeight || 0, body ? body.scrollHeight || 0 : 0);
        var maxScroll = Math.max(0, scrollHeight - viewportHeight);
        setPrivacyReady(maxScroll === 0 || scrollTop >= maxScroll - 120);
      } catch (e) { setPrivacyReady(true); }
    }

    function bindPrivacyFrame() {
      try {
        frameScrollTarget = privacyFrame.contentWindow;
        frameScrollTarget.addEventListener('scroll', checkPrivacyScroll, { passive: true });
        checkPrivacyScroll();
      } catch (e) { setPrivacyReady(true); }
    }

    function openPrivacyReader(link) {
      var form = link.closest('form');
      if (!form) {
        form = document.querySelector('section[data-lang="' + docEl.lang + '"] form.contact-form');
      }
      pendingConsent = form && form.querySelector('input[name="privacy_consent"]');
      setPrivacyReady(true);
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
      checkPrivacyScroll();
      clearInterval(privacyScrollTimer);
      privacyScrollTimer = setInterval(checkPrivacyScroll, 180);
    }

    function closePrivacyReader() {
      privacyReader.classList.remove('open');
      privacyReader.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('privacy-reader-open');
      clearInterval(privacyScrollTimer);
      privacyScrollTimer = null;
    }

    Array.prototype.forEach.call(privacyLinks, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openPrivacyReader(link);
      });
    });
    window.addEventListener('message', function (event) {
      if (event.origin === window.location.origin && event.data && event.data.type === 'el-finans-privacy-read') {
        setPrivacyReady(true);
      }
    });
    privacyFrame.addEventListener('load', bindPrivacyFrame);
    if (privacyFrame.contentDocument && privacyFrame.contentDocument.readyState === 'complete') bindPrivacyFrame();
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
      activeShot = next;
      steps.forEach(function (s) { s.classList.toggle('active', +s.dataset.shot === next); });
      shots.forEach(function (img, i) { img.classList.toggle('active', i === next); });
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
})();

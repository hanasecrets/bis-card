/* BIS NFC card page — language switch, video, lead form */
(function () {
  'use strict';

  // ===== SETTINGS =====
  // Google Apps Script web app URL (see apps-script/Code.gs). Leave '' to fall back to e-mail.
  var LEADS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzjJIZlJgnRPGBvPFxdqWHKi7gpuFsnYXUqkaHPJImQ3t2g7zq5K5s-4zQdP54SMlfG/exec';
  // Person data comes from window.CARD, set in each person's index.html.
  var CARD = window.CARD || {};
  var FALLBACK_EMAIL = CARD.email || 'eshipment@bissolution.org';
  var SOURCE = CARD.source || 'nfc';
  // One video per language. A missing file hides the video section.
  var VIDEOS = { tr: '../assets/eshipment-tr.mp4', ar: '../assets/eshipment-ar.mp4', en: '../assets/eshipment-tr.mp4' };

  var T = {
    tr: {
      pageTitle: 'İkram Aldibs — BIS NFC Dijital Kartvizit',
      name: 'İkram Aldibs', title: 'Geliştirme ve Halkla İlişkiler Müdürü',
      save: 'Rehbere kaydet', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', email: 'E-posta',
      videoTitle: 'e-shipment’i kısaca tanıyın', play: 'Videoyu oynat',
      formTitle: 'Tanışalım', formSub: 'Bilgilerinizi bırakın, en kısa sürede size dönelim.',
      fName: 'Ad Soyad', fCompany: 'Firma', fContact: 'Telefon veya e-posta',
      phName: 'Adınız ve Soyadınız', phCompany: 'Firma Adı', phContact: '+90 ... veya ad@firma.com',
      submit: 'Gönder', sending: 'Gönderiliyor…',
      thanks: 'Teşekkürler! En kısa sürede size ulaşacağız.',
      error: 'Lütfen adınızı ve telefon veya e-posta bilginizi yazın.',
      products: 'BIS ürünleri', mailSubject: 'logitrans 2026 — Tanışalım'
    },
    ar: {
      pageTitle: 'إكرام الدبس — بطاقة BIS الذكية NFC',
      name: 'إكرام الدبس', title: 'مديرة التطوير والعلاقات العامة',
      save: 'حفظ جهة الاتصال', whatsapp: 'واتساب', linkedin: 'لينكدإن', email: 'البريد',
      videoTitle: 'تعرّف على e-shipment باختصار', play: 'تشغيل الفيديو',
      formTitle: 'خلّينا نتعرّف', formSub: 'اترك بياناتك ومنتواصل معك بأقرب وقت.',
      fName: 'الاسم', fCompany: 'الشركة', fContact: 'الهاتف أو الإيميل',
      phName: 'الاسم الكامل', phCompany: 'اسم الشركة', phContact: 'رقم الهاتف أو البريد الإلكتروني',
      submit: 'إرسال', sending: 'جاري الإرسال…',
      thanks: 'شكراً! رح نتواصل معك قريباً.',
      error: 'اكتب اسمك ورقم هاتفك أو بريدك الإلكتروني.',
      products: 'منتجات BIS', mailSubject: 'logitrans 2026 — خلّينا نتعرّف'
    },
    en: {
      pageTitle: 'Ikram Aldibs — BIS NFC Digital Card',
      name: 'Ikram Aldibs', title: 'Development & Public Relations Manager',
      save: 'Save contact', whatsapp: 'WhatsApp', linkedin: 'LinkedIn', email: 'Email',
      videoTitle: 'Meet e-shipment', play: 'Play video',
      formTitle: 'Let’s connect', formSub: 'Leave your details and we’ll get back to you shortly.',
      fName: 'Full name', fCompany: 'Company', fContact: 'Phone or email',
      phName: 'Your full name', phCompany: 'Company name', phContact: '+90 ... or name@company.com',
      submit: 'Send', sending: 'Sending…',
      thanks: 'Thank you! We’ll be in touch soon.',
      error: 'Please enter your name and a phone number or email.',
      products: 'BIS products', mailSubject: 'logitrans 2026 — Let’s connect'
    }
  };

  ['tr', 'ar', 'en'].forEach(function (l) {
    if (CARD.name && CARD.name[l]) T[l].name = CARD.name[l];
    if (CARD.title && CARD.title[l]) T[l].title = CARD.title[l];
    T[l].pageTitle = T[l].name + (l === 'ar' ? ' — بطاقة BIS الذكية NFC' : l === 'tr' ? ' — BIS NFC Dijital Kartvizit' : ' — BIS NFC Digital Card');
  });

  var lang = 'tr';

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function pickInitialLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && T[q]) return q;
    var saved = read('bis-card-lang');
    if (saved && T[saved]) return saved;
    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('ar') === 0) return 'ar';
    return 'tr';
  }

  function applyLang(l) {
    lang = l;
    var t = T[l];
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.title = t.pageTitle;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n'); if (t[k]) el.textContent = t[k];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph'); if (t[k]) el.setAttribute('placeholder', t[k]);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria'); if (t[k]) el.setAttribute('aria-label', t[k]);
    });
    document.querySelectorAll('.lang-pill').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false');
    });
    setupVideo();
  }

  // ===== Video =====
  var video = document.getElementById('video');
  var videoSection = document.getElementById('video-section');
  function setupVideo() {
    var src = VIDEOS[lang];
    if (!src) { videoSection.hidden = true; return; }
    fetch(src, { method: 'HEAD' }).then(function (r) {
      videoSection.hidden = !r.ok;
      if (r.ok && video.getAttribute('data-src') !== src) {
        video.pause(); video.hidden = true;
        document.querySelectorAll('.video-poster').forEach(function (el) { el.hidden = false; });
        video.setAttribute('data-src', src);
        video.removeAttribute('src');
      }
    }).catch(function () { videoSection.hidden = true; });
  }
  document.getElementById('video-play').addEventListener('click', function () {
    video.src = video.getAttribute('data-src');
    document.querySelectorAll('.video-poster').forEach(function (el) { el.hidden = true; });
    video.hidden = false;
    video.play().catch(function () {});
  });

  // ===== Lead form =====
  var form = document.getElementById('lead-form');
  var errorEl = document.getElementById('form-error');
  var thanks = document.getElementById('form-thanks');
  var submitBtn = document.getElementById('f-submit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f['name'].value.trim();
    var company = f['company'].value.trim();
    var contact = f['contact'].value.trim();
    f['name'].setAttribute('aria-invalid', name ? 'false' : 'true');
    f['contact'].setAttribute('aria-invalid', contact ? 'false' : 'true');
    if (!name || !contact) { errorEl.hidden = false; return; }
    errorEl.hidden = true;

    var t = T[lang];
    if (!LEADS_ENDPOINT) {
      var body = name + '\n' + company + '\n' + contact + '\n\n(' + SOURCE + ', ' + lang + ')';
      location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(t.mailSubject) + '&body=' + encodeURIComponent(body);
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = t.sending;
    var data = new URLSearchParams({
      name: name, company: company, contact: contact, lang: lang, source: SOURCE,
      page: location.pathname, ua: navigator.userAgent
    });
    fetch(LEADS_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () { form.hidden = true; thanks.hidden = false; })
      .catch(function () {
        submitBtn.disabled = false; submitBtn.textContent = t.submit;
        location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(t.mailSubject) + '&body=' + encodeURIComponent(name + '\n' + company + '\n' + contact);
      });
  });

  document.querySelectorAll('.lang-pill').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang'); store('bis-card-lang', l); applyLang(l);
    });
  });

  applyLang(pickInitialLang());
})();

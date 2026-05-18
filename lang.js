// MasterStock USA — Language toggle (EN / ES)
// Persists choice in localStorage. Strings opt in via [data-en] / [data-es] attributes.
// Elements without translation attributes stay in their original language.

(function () {
  'use strict';

  var STORAGE_KEY = 'ms-lang';
  var DEFAULT_LANG = 'en';

  function getLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === 'es' ? 'es' : 'en';
    } catch (e) { return DEFAULT_LANG; }
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  // Stash original (English) content the first time we touch a node, so toggling
  // back to EN restores the exact original markup even if it had inline HTML.
  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);

    // Translate any element with a data-en / data-es attribute pair.
    var nodes = document.querySelectorAll('[data-en],[data-es]');
    nodes.forEach(function (el) {
      // Cache the original HTML once.
      if (!el.hasAttribute('data-i18n-original')) {
        el.setAttribute('data-i18n-original', el.innerHTML);
      }
      var original = el.getAttribute('data-i18n-original');
      var en = el.getAttribute('data-en');
      var es = el.getAttribute('data-es');

      if (lang === 'es' && es != null) {
        el.innerHTML = es;
      } else if (lang === 'en') {
        // Prefer explicit data-en, fall back to the captured original markup.
        el.innerHTML = (en != null ? en : original);
      }
    });

    // Also support attribute translations (e.g. aria-label, placeholder, title).
    // Use data-en-<attr> / data-es-<attr> pairs.
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    attrNodes.forEach(function (el) {
      var attrs = (el.getAttribute('data-i18n-attr') || '').split(',');
      attrs.forEach(function (raw) {
        var attr = raw.trim();
        if (!attr) return;
        var val = el.getAttribute('data-' + lang + '-' + attr);
        if (val != null) el.setAttribute(attr, val);
      });
    });

    // Update toggle button visual state.
    var btn = document.getElementById('ms-lang-toggle');
    if (btn) {
      btn.querySelectorAll('[data-lang-pill]').forEach(function (pill) {
        pill.classList.toggle('is-active', pill.getAttribute('data-lang-pill') === lang);
      });
      btn.setAttribute('aria-label', lang === 'es' ? 'Cambiar idioma' : 'Change language');
    }
  }

  function injectStyles() {
    if (document.getElementById('ms-lang-toggle-styles')) return;
    var css = ''
      + '.ms-lang-toggle{display:inline-flex;align-items:center;gap:0;padding:3px;border:1px solid #E2E8F0;border-radius:999px;background:#fff;cursor:pointer;margin-right:6px;line-height:1;}'
      + '.ms-lang-toggle:hover{border-color:#CBD5E1;}'
      + '.ms-lang-toggle [data-lang-pill]{padding:4px 9px;font-size:10.5px;font-weight:700;letter-spacing:0.04em;color:#64748B;border-radius:999px;transition:background .15s ease,color .15s ease;}'
      + '.ms-lang-toggle [data-lang-pill].is-active{background:#0A5CD8;color:#fff;}'
      + '@media (max-width:640px){.ms-lang-toggle{margin-right:4px;}.ms-lang-toggle [data-lang-pill]{padding:3px 7px;font-size:10px;}}';
    var style = document.createElement('style');
    style.id = 'ms-lang-toggle-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function injectButton() {
    if (document.getElementById('ms-lang-toggle')) return;

    // Anchor: the "Log in" link inside the header nav. Insert before its
    // preceding divider span (if present), otherwise before the link itself.
    var loginLink = document.querySelector('header a[href$="/login.html"], header a[href="login.html"]');
    if (!loginLink) return;
    var divider = loginLink.previousElementSibling;
    var anchor = (divider && divider.tagName === 'SPAN') ? divider : loginLink;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ms-lang-toggle';
    btn.className = 'ms-lang-toggle';
    btn.setAttribute('aria-label', 'Change language');
    btn.innerHTML = '<span data-lang-pill="en">EN</span><span data-lang-pill="es">ES</span>';
    btn.addEventListener('click', function () {
      var next = getLang() === 'en' ? 'es' : 'en';
      setLang(next);
      applyLang(next);
    });

    anchor.parentNode.insertBefore(btn, anchor);
  }

  function init() {
    injectStyles();
    injectButton();
    applyLang(getLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

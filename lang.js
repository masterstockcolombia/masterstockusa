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
      + '.ms-lang-toggle{display:inline-flex;align-items:center;gap:4px;padding:3px 3px 3px 8px;border:1px solid #E2E8F0;border-radius:999px;background:#fff;cursor:pointer;margin-right:6px;line-height:1;}'
      + '.ms-lang-toggle:hover{border-color:#0A5CD8;}'
      + '.ms-lang-toggle .ms-lang-globe{width:14px;height:14px;color:#64748B;display:inline-block;flex:0 0 auto;}'
      + '.ms-lang-toggle:hover .ms-lang-globe{color:#0A5CD8;}'
      + '.ms-lang-toggle [data-lang-pill]{padding:4px 9px;font-size:10.5px;font-weight:700;letter-spacing:0.04em;color:#64748B;border-radius:999px;transition:background .15s ease,color .15s ease;}'
      + '.ms-lang-toggle [data-lang-pill].is-active{background:#0A5CD8;color:#fff;}'
      + '@media (max-width:640px){.ms-lang-toggle{margin-right:4px;padding-left:6px;}.ms-lang-toggle .ms-lang-globe{width:12px;height:12px;}.ms-lang-toggle [data-lang-pill]{padding:3px 7px;font-size:10px;}}';
    var style = document.createElement('style');
    style.id = 'ms-lang-toggle-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  var GLOBE_SVG = ''
    + '<svg class="ms-lang-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    +   '<circle cx="12" cy="12" r="9"/>'
    +   '<line x1="3" y1="12" x2="21" y2="12"/>'
    +   '<path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
    + '</svg>';

  function injectButton() {
    if (document.getElementById('ms-lang-toggle')) return;

    // Anchor: the "Log in" link inside the header nav. Insert before its
    // preceding divider span (if present), otherwise before the link itself.
    // IMPORTANT: skip anchors nested in dropdown / mega-menu containers — those
    // are hidden until hover and would render the toggle invisible.
    function isInsideDropdown(el) {
      return !!(el.closest('.nav-mega-inner') ||
                el.closest('.nav-dropdown') ||
                el.closest('[role="menu"]') ||
                el.closest('[data-dropdown]'));
    }

    var candidates = document.querySelectorAll(
      'header a[href$="/login.html"], header a[href="login.html"], ' +
      'header a[data-es="Iniciar sesión"], ' +
      'header a[href*="portal.masterstock"]'
    );
    var loginLink = null;
    for (var i = 0; i < candidates.length; i++) {
      if (!isInsideDropdown(candidates[i])) { loginLink = candidates[i]; break; }
    }
    if (!loginLink) {
      // Fallback: visible anchor with "Log in" / "Iniciar sesión" text content.
      var anchors = document.querySelectorAll('header a');
      for (var j = 0; j < anchors.length; j++) {
        var t = (anchors[j].textContent || '').trim().toLowerCase();
        if ((t === 'log in' || t === 'login' || t === 'iniciar sesión') &&
            !isInsideDropdown(anchors[j])) {
          loginLink = anchors[j]; break;
        }
      }
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ms-lang-toggle';
    btn.className = 'ms-lang-toggle';
    btn.setAttribute('aria-label', 'Change language');
    btn.innerHTML = GLOBE_SVG + '<span data-lang-pill="en">EN</span><span data-lang-pill="es">ES</span>';
    btn.addEventListener('click', function () {
      var next = getLang() === 'en' ? 'es' : 'en';
      setLang(next);
      applyLang(next);
    });

    if (loginLink) {
      // Preferred: place toggle just before the "Log in" link (or its divider).
      var divider = loginLink.previousElementSibling;
      var anchor = (divider && divider.tagName === 'SPAN') ? divider : loginLink;
      anchor.parentNode.insertBefore(btn, anchor);
      return;
    }

    // Last-resort fallback for pages without a Log-in link (privacy, terms, etc.):
    // append the toggle to the header's nav container, or to the header itself.
    var header = document.querySelector('header');
    if (!header) return;
    var anchorContainer = header.querySelector('nav') || header;
    // If header is a flex row, ensure the toggle sits at the end of the row.
    anchorContainer.appendChild(btn);
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

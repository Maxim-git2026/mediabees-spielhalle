/* MediaBees Spielhalle – Einstellungsseite im Backend: Vorschau-Bienen, Kopier-Knöpfe, Zusammenfassung */
(function () {
  'use strict';
  var root = document.querySelector('.mbbj-admin');
  if (!root) return;

  /* Bienen-Vorschau (gleiche Zeichnung wie auf der Website) */
  if (window.MBBJTeaserBee) {
    root.querySelectorAll('[data-bee]').forEach(function (el) { el.innerHTML = window.MBBJTeaserBee(); });
  }

  /* Vorschau-Knöpfe sollen nicht wegführen, nur auswählen */
  root.querySelectorAll('.mbbj-preview a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
    a.setAttribute('tabindex', '-1');
  });

  /* Shortcode kopieren */
  root.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.getAttribute('data-copy'), hint = b.querySelector('.mbbj-chip-hint');
      var ok = function () {
        b.classList.add('is-copied'); if (hint) hint.textContent = 'Kopiert ✓';
        setTimeout(function () { b.classList.remove('is-copied'); if (hint) hint.textContent = 'Kopieren'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, fallback);
      else fallback();
      function fallback() {
        var t = document.createElement('textarea'); t.value = code; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(t);
      }
    });
  });

  /* Zusammenfassung der Bienen-Zeiten in Worten */
  var sum = root.querySelector('[data-summary]');
  function dur(s) {
    s = Math.max(0, parseInt(s, 10) || 0);
    if (s < 60) return s + ' Sekunden';
    var m = Math.floor(s / 60), r = s % 60;
    return (m === 1 ? '1 Minute' : m + ' Minuten') + (r ? ' ' + r + ' Sekunden' : '');
  }
  function upd() {
    if (!sum) return;
    var on = root.querySelector('[name=mbbj_bee]').checked;
    var f = root.querySelector('[name=mbbj_bee_first]').value, e = root.querySelector('[name=mbbj_bee_every]').value, m = parseInt(root.querySelector('[name=mbbj_bee_max]').value, 10) || 1;
    sum.textContent = on
      ? 'Die erste Biene kommt nach etwa ' + dur(f) + (m > 1 ? ', danach etwa alle ' + dur(e) + ', insgesamt höchstens ' + m + ' Bienen pro Seite.' : '. Danach kommt keine mehr.')
      : 'Die Biene ist ausgeschaltet.';
    root.classList.toggle('is-bee-off', !on);
    root.classList.toggle('is-btn-off', !root.querySelector('[name=mbbj_button]').checked);
  }
  root.addEventListener('input', upd);
  root.addEventListener('change', upd);
  upd();
  /* ---------------- Darstellung der Seite: Hell / Auto / Dunkel (sofort, gespeichert wird mit „Speichern“) */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    var sel = document.querySelector('[name=mbbj_admin_theme]:checked');
    var v = sel ? sel.value : 'auto';
    var dark = v === 'dark' || (v === 'auto' && mq && mq.matches);
    document.body.classList.toggle('mbbj-dark', !!dark);
  }
  document.querySelectorAll('[name=mbbj_admin_theme]').forEach(function (r) { r.addEventListener('change', applyTheme); });
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);
  applyTheme();

  /* ---------------- Knopf anpassen: Live-Vorschau */
  function mix(hex, to, t) {
    var a = hex.replace('#', ''), b = to.replace('#', ''), o = '#';
    for (var i = 0; i < 3; i++) {
      var x = parseInt(a.substr(i * 2, 2), 16), y = parseInt(b.substr(i * 2, 2), 16);
      var v = Math.round(x + (y - x) * t).toString(16);
      o += v.length < 2 ? '0' + v : v;
    }
    return o;
  }
  var SIZE = { s: 0.8, m: 1, l: 1.25 };
  function val(n) { var el = root.querySelector('[name=' + n + ']:checked') || root.querySelector('[name=' + n + ']'); return el ? el.value : ''; }
  function updKnopf() {
    var mode = val('mbbj_k_text_mode'), txt = (root.querySelector('[name=mbbj_k_text]') || {}).value || '';
    var colors = root.querySelector('[name=mbbj_k_colors]').checked;
    root.classList.toggle('is-colors-off', !colors);
    root.querySelectorAll('[data-show-if]').forEach(function (el) { el.hidden = el.getAttribute('data-show-if') !== mode; });
    root.querySelectorAll('.mbbj-color').forEach(function (l) {
      var i = l.querySelector('input'), c = l.querySelector('[data-hex]'); if (c) c.textContent = i.value.toUpperCase();
    });
    var cap = val('mbbj_k_cap'), vars = { '--mbbj-size': SIZE[val('mbbj_k_size')] || 1 };
    if (colors) {
      vars['--mbbj-cap-hi'] = mix(cap, '#ffffff', 0.55); vars['--mbbj-cap-mid'] = mix(cap, '#ffffff', 0.18);
      vars['--mbbj-cap'] = cap; vars['--mbbj-cap-lo'] = mix(cap, '#000000', 0.38); vars['--mbbj-cap-edge'] = mix(cap, '#000000', 0.58);
      vars['--mbbj-tagbg'] = val('mbbj_k_tagbg'); vars['--mbbj-tagfg'] = val('mbbj_k_tagfg'); vars['--mbbj-accent'] = val('mbbj_k_accent');
    }
    root.querySelectorAll('.mbbj-preview .mbbj-k').forEach(function (k) {
      k.removeAttribute('style');
      for (var v in vars) k.style.setProperty(v, vars[v]);
      k.classList.toggle('is-nolabel', mode === 'none');
      var lab = k.querySelector('.mbbj-k-label');
      if (lab) lab.textContent = mode === 'custom' && txt.trim() ? txt : k.getAttribute('data-std');
    });
  }
  root.addEventListener('input', updKnopf);
  root.addEventListener('change', updKnopf);
  root.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.getAttribute('data-preset').split(','), names = ['mbbj_k_cap', 'mbbj_k_tagbg', 'mbbj_k_tagfg', 'mbbj_k_accent'];
      root.querySelector('[name=mbbj_k_colors]').checked = true;
      names.forEach(function (n, i) { root.querySelector('[name=' + n + ']').value = c[i].toLowerCase(); });
      updKnopf();
    });
  });
  /* Vorschau auf hellem oder dunklem Footer */
  root.querySelectorAll('[data-bg]').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('[data-bg]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      root.classList.toggle('is-preview-light', b.getAttribute('data-bg') === 'light');
    });
  });
  updKnopf();
})();

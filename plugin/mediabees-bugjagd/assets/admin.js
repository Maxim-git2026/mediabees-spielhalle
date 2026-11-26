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
})();

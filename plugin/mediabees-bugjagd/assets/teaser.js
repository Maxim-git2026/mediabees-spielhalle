/*
 * MediaBees Spielhalle – Köder für die ganze Website:
 * roter Knopf (kommt als HTML aus PHP, Footer-Shortcode [mediabees_knopf] oder schwebend)
 * und eine Biene, die ab und zu durchs Bild fliegt. Beides führt zur Spielhalle.
 * Keine Cookies, kein Speicher, keine externen Dienste.
 * Einstellungen: window.MBBJ_TEASER = { url, bee, first, every, max, test }.
 * Wichtig: Theme/Elementor stylen <button> gern gelb mit Polster. Deshalb ist die Biene ein <div role="button">
 * und das CSS setzt alles hart zurück.
 */
(function () {
  'use strict';
  var C = window.MBBJ_TEASER;
  if (!C || !C.url || window.__mbbjTeaser) return;
  window.__mbbjTeaser = true;

  var doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var going = false;

  function samePage() {
    try {
      var a = new URL(C.url, location.href);
      var clean = function (p) { return p.replace(/\/+$/, '') || '/'; };
      return a.host === location.host && clean(a.pathname) === clean(location.pathname);
    } catch (e) { return false; }
  }

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* Kurzer Alarm (nur nach einem Klick, also ohne Autoplay-Probleme) */
  function alarm() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ac = new AC(), t = ac.currentTime;
      for (var i = 0; i < 3; i++) {
        var o = ac.createOscillator(), g = ac.createGain(), t1 = t + i * 0.28;
        o.type = 'square';
        o.frequency.setValueAtTime(880, t1);
        o.frequency.linearRampToValueAtTime(620, t1 + 0.22);
        g.gain.setValueAtTime(0.0001, t1);
        g.gain.exponentialRampToValueAtTime(0.06, t1 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.24);
        o.connect(g); g.connect(ac.destination);
        o.start(t1); o.stop(t1 + 0.26);
      }
      setTimeout(function () { try { ac.close(); } catch (e) {} }, 1200);
    } catch (e) {}
  }

  function go() { location.href = C.url; }

  /* Vollbild „STRENG GEHEIM!“, dann weiter zur Spielhalle */
  function secret(lines) {
    if (going) return;
    going = true;
    var bees = doc.querySelectorAll('.mbbj-t-bee');
    for (var i = 0; i < bees.length; i++) bees[i].style.display = 'none';
    alarm();
    var ov = el('div', 'mbbj-t-secret' + (reduce ? ' is-calm' : ''));
    ov.setAttribute('role', 'alert');
    var stamp = el('div', 'mbbj-t-stamp', 'STRENG GEHEIM!');
    var line = el('div', 'mbbj-t-line', lines[0]);
    ov.appendChild(stamp); ov.appendChild(line);
    ov.addEventListener('click', go);
    doc.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('is-on'); });
    setTimeout(function () { line.textContent = lines[1]; line.classList.add('is-ok'); }, 950);
    setTimeout(go, 2100);
  }

  /* ------------------------------------------------------------ Knopf */
  function initButtons() {
    var ks = doc.querySelectorAll('.mbbj-k');
    if (!ks.length) return;
    for (var i = 0; i < ks.length; i++) {
      ks[i].addEventListener('click', function (e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return; /* neuer Tab: einfach normal öffnen */
        e.preventDefault();
        this.classList.add('is-pressed');
        secret([pick(['Zugriff verweigert …', 'Das war ein Befehl!', 'Du hast ihn gedrückt, oder?']),
          pick(['… na gut, komm rein.', '… okay, du darfst spielen.', '… dann eben ab in die Spielhalle.'])]);
      });
    }
    if (!reduce) {
      (function wobble() {
        setTimeout(function () {
          if (!doc.hidden && !going) {
            for (var j = 0; j < ks.length; j++) {
              var k = ks[j];
              var r = k.getBoundingClientRect();
              if (r.bottom < 0 || r.top > innerHeight) continue; /* nur wenn sichtbar */
              k.classList.remove('is-wobble'); void k.offsetWidth; k.classList.add('is-wobble');
            }
          }
          wobble();
        }, 6000 + Math.random() * 7000);
      })();
    }
  }

  /* ------------------------------------------------------------ Biene */
  var uid = 0;
  function beeSvg() {
    var id = 'mbbjb' + (++uid);
    return '<svg viewBox="-48 -44 100 84" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<radialGradient id="' + id + 'g" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#FFE680"/><stop offset=".55" stop-color="#FDC506"/><stop offset="1" stop-color="#D99A00"/></radialGradient>' +
      '<radialGradient id="' + id + 'h" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#FFE680"/><stop offset="1" stop-color="#E9A800"/></radialGradient>' +
      '<clipPath id="' + id + 'c"><ellipse cx="-6" cy="6" rx="25" ry="18"/></clipPath>' +
      '</defs>' +
      /* hinterer Flügel */
      '<g class="mbbj-t-wing mbbj-t-wing-b"><ellipse cx="2" cy="-20" rx="11" ry="17" transform="rotate(24 2 -20)" fill="rgba(210,235,255,.55)" stroke="#2a2a2a" stroke-width="1.6"/></g>' +
      /* Beinchen */
      '<path d="M-14 22 l-3 7 M-4 23 l-1 8 M6 22 l2 7" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      /* Stachel */
      '<path d="M-30 4 L-44 7 L-30 11 Z" fill="#1a1a1a"/>' +
      /* Körper mit Streifen */
      '<ellipse cx="-6" cy="6" rx="25" ry="18" fill="url(#' + id + 'g)"/>' +
      '<g clip-path="url(#' + id + 'c)" fill="#1a1a1a"><rect x="-22" y="-14" width="7" height="40" rx="2" transform="rotate(8 -18 6)"/><rect x="-9" y="-14" width="7" height="40" rx="2" transform="rotate(6 -5 6)"/><rect x="4" y="-14" width="6" height="40" rx="2" transform="rotate(4 7 6)"/></g>' +
      '<ellipse cx="-6" cy="6" rx="25" ry="18" fill="none" stroke="#1a1a1a" stroke-width="2.6"/>' +
      '<ellipse cx="-12" cy="-3" rx="9" ry="4" fill="rgba(255,255,255,.45)" transform="rotate(-12 -12 -3)"/>' +
      /* Kopf */
      '<circle cx="24" cy="0" r="14" fill="url(#' + id + 'h)" stroke="#1a1a1a" stroke-width="2.6"/>' +
      '<ellipse cx="29" cy="-3" rx="5" ry="6" fill="#fff" stroke="#1a1a1a" stroke-width="1.4"/>' +
      '<circle cx="30.5" cy="-2" r="3.2" fill="#1a1a1a"/><circle cx="31.6" cy="-3.4" r="1.2" fill="#fff"/>' +
      '<ellipse cx="22" cy="5" rx="3.2" ry="2" fill="#FF9AAE" opacity=".8"/>' +
      '<path d="M26 7 Q31 12 36 6" stroke="#1a1a1a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      /* Fühler */
      '<path d="M20 -13 Q18 -26 11 -31 M27 -13 Q31 -26 38 -29" stroke="#1a1a1a" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<circle cx="11" cy="-31" r="2.8" fill="#1a1a1a"/><circle cx="38" cy="-29" r="2.8" fill="#1a1a1a"/>' +
      /* vorderer Flügel */
      '<g class="mbbj-t-wing mbbj-t-wing-f"><ellipse cx="-8" cy="-20" rx="13" ry="20" transform="rotate(-22 -8 -20)" fill="rgba(225,242,255,.75)" stroke="#2a2a2a" stroke-width="1.6"/>' +
      '<path d="M-12 -32 Q-8 -22 -6 -10" stroke="rgba(255,255,255,.9)" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
      '</svg>';
  }

  var BUBBLES = ['Psst! Lust auf ein Spiel?', 'Tipp mich an!', 'Komm mit in die Spielhalle!',
    'Ich kenn da was Geheimes …', 'Keine Lust auf Arbeit?', 'Hier geht’s zum Highscore!'];

  var flights = 0, maxBees = Math.max(1, Math.min(20, C.max || 2));

  function jitter(sec) { return sec * 1000 * (0.85 + Math.random() * 0.3); }

  function flyBee() {
    if (going) return;
    if (doc.hidden || innerWidth < 300) return scheduleBee(5000);
    flights++;
    var b = el('div', 'mbbj-t-bee');
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
    b.setAttribute('aria-label', 'Biene: führt zur MediaBees-Spielhalle');
    var inner = el('div', 'mbbj-t-bee-in');
    inner.innerHTML = beeSvg();
    b.appendChild(inner);
    var bub = el('div', 'mbbj-t-bubble', pick(BUBBLES));
    b.appendChild(bub);
    doc.body.appendChild(b);

    var W = innerWidth, H = innerHeight, size = W < 640 ? 70 : 92;
    var dir = Math.random() < 0.5 ? 1 : -1;
    var x0 = dir > 0 ? -size * 1.5 : W + size * 1.5, x1 = dir > 0 ? W + size * 1.5 : -size * 1.5;
    var baseY = H * (0.22 + Math.random() * 0.4), amp = 24 + Math.random() * 30;
    var stopAt = 0.42 + Math.random() * 0.16; /* hier bleibt sie kurz stehen und spricht */
    var tFly = Math.max(5.5, W / 190), tStop = 2.4, t0 = 0, done = false, caught = false;
    b.style.width = size + 'px'; b.style.height = Math.round(size * 0.84) + 'px';
    if (dir < 0) b.classList.add('is-left');

    function end() {
      if (done) return;
      done = true;
      if (b.parentNode) b.parentNode.removeChild(b);
      if (!caught && flights < maxBees) scheduleBee(jitter(C.every || 120));
    }
    function catchIt(e) {
      if (e) e.preventDefault();
      if (caught) return;
      caught = true;
      b.classList.add('is-caught');
      secret([pick(['Gefangen!', 'Erwischt!', 'Summ summ!']), '… ab in die Spielhalle.']);
    }
    b.addEventListener('click', catchIt);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') catchIt(e); });

    function frame(now) {
      if (done || caught) return;
      if (!t0) t0 = now;
      var s = (now - t0) / 1000, u, hover = false;
      if (s >= tFly + tStop) return end();
      var sStop = tFly * stopAt;
      if (s < sStop) u = s / tFly;
      else if (s < sStop + tStop) { u = stopAt; hover = true; }
      else u = (s - tStop) / tFly;
      var x = x0 + (x1 - x0) * u, y = baseY + Math.sin(u * Math.PI * 3) * amp;
      var hy = hover ? Math.sin(s * 6) * 4 : 0;
      var slope = Math.cos(u * Math.PI * 3) * amp * Math.PI * 3 / Math.abs(x1 - x0);
      var rot = hover ? 0 : Math.max(-0.35, Math.min(0.35, slope * 0.8)) * dir;
      b.style.transform = 'translate3d(' + (x - size / 2).toFixed(1) + 'px,' + (y - size / 2 + hy).toFixed(1) + 'px,0) rotate(' + rot.toFixed(3) + 'rad)';
      if (hover !== b.classList.contains('is-talk')) b.classList.toggle('is-talk', hover);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    setTimeout(end, (tFly + tStop + 3) * 1000);
  }

  function scheduleBee(ms) { setTimeout(flyBee, ms); }

  function init() {
    if (doc.getElementById('mb404') || samePage()) {
      /* Auf der Spielhalle selbst nicht nötig */
      var ks = doc.querySelectorAll('.mbbj-k-wrap, .mbbj-k-float');
      for (var i = 0; i < ks.length; i++) ks[i].style.display = 'none';
      return;
    }
    initButtons();
    if (C.bee && !reduce) scheduleBee(C.test ? 1500 : jitter(C.first || 40));
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();

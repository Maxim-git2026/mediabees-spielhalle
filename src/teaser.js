/*
 * MediaBees Spielhalle – Köder für die ganze Website:
 * kleiner roter Knopf „Nicht drücken!“ und eine Biene, die ab und zu durchs Bild fliegt.
 * Beides führt zur Spielhalle. Keine Cookies, kein Speicher, keine externen Dienste.
 * Einstellungen kommen aus PHP als window.MBBJ_TEASER = { url, button, bee, side }.
 */
(function () {
  'use strict';
  var C = window.MBBJ_TEASER;
  if (!C || !C.url || window.__mbbjTeaser) return;
  window.__mbbjTeaser = true;

  var doc = document, html = doc.documentElement;
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
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(880, t + i * 0.28);
        o.frequency.linearRampToValueAtTime(620, t + i * 0.28 + 0.22);
        g.gain.setValueAtTime(0.0001, t + i * 0.28);
        g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.28 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.28 + 0.24);
        o.connect(g); g.connect(ac.destination);
        o.start(t + i * 0.28); o.stop(t + i * 0.28 + 0.26);
      }
      setTimeout(function () { try { ac.close(); } catch (e) {} }, 1200);
    } catch (e) {}
  }

  function go() { location.href = C.url; }

  /* Vollbild „STRENG GEHEIM!“, dann weiter zur Spielhalle */
  function secret(lines) {
    if (going) return;
    going = true;
    var bees = doc.querySelectorAll('.mbbj-t-bee:not(.is-caught)');
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
  function makeButton() {
    var wrap = el('div', 'mbbj-t-btnwrap mbbj-t-' + (C.side === 'right' ? 'right' : 'left'));
    var btn = el('button', 'mbbj-t-btn');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Nicht drücken! (führt zur MediaBees-Spielhalle)');
    btn.appendChild(el('span', 'mbbj-t-cap'));
    var tag = el('span', 'mbbj-t-tag', 'Nicht drücken!');
    tag.setAttribute('aria-hidden', 'true');
    wrap.appendChild(btn); wrap.appendChild(tag);
    btn.addEventListener('click', function () {
      btn.classList.add('is-pressed');
      secret([pick(['Zugriff verweigert …', 'Das war ein Befehl!', 'Du hast ihn gedrückt, oder?']),
        pick(['… na gut, komm rein.', '… okay, du darfst spielen.', '… dann eben ab in die Spielhalle.'])]);
    });
    doc.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('is-on'); });
    if (!reduce) {
      (function wobble() {
        setTimeout(function () {
          if (!doc.hidden && !going) {
            wrap.classList.remove('is-wobble'); void wrap.offsetWidth; wrap.classList.add('is-wobble');
          }
          wobble();
        }, 9000 + Math.random() * 9000);
      })();
    }
  }

  /* ------------------------------------------------------------ Biene */
  var BEE_SVG =
    '<svg viewBox="-40 -34 80 64" aria-hidden="true">' +
    '<g class="mbbj-t-wings"><ellipse cx="-4" cy="-17" rx="11" ry="15" transform="rotate(-24 -4 -17)"/>' +
    '<ellipse cx="9" cy="-16" rx="9" ry="13" transform="rotate(20 9 -16)"/></g>' +
    '<path d="M-24 2 L-35 5 L-24 8 Z" fill="#111"/>' +
    '<ellipse cx="-4" cy="5" rx="21" ry="15" fill="#FDC506" stroke="#111" stroke-width="2.5"/>' +
    '<path d="M-14 -8 Q-10 5 -14 18 M-4 -10 Q0 5 -4 20 M6 -8 Q10 5 6 18" stroke="#111" stroke-width="5" fill="none"/>' +
    '<circle cx="21" cy="1" r="11" fill="#FDC506" stroke="#111" stroke-width="2.5"/>' +
    '<circle cx="25" cy="-2" r="3.4" fill="#111"/><circle cx="26.2" cy="-3.2" r="1.1" fill="#fff"/>' +
    '<path d="M21 6 Q25 9 29 5" stroke="#111" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M18 -9 Q18 -20 12 -24 M24 -9 Q27 -20 33 -22" stroke="#111" stroke-width="1.8" fill="none"/>' +
    '<circle cx="12" cy="-24" r="2" fill="#111"/><circle cx="33" cy="-22" r="2" fill="#111"/>' +
    '</svg>';

  var BUBBLES = ['Psst! Lust auf ein Spiel?', 'Tipp mich an!', 'Komm mit in die Spielhalle!',
    'Ich kenn da was Geheimes …', 'Keine Lust auf Arbeit?', 'Hier geht’s zum Highscore!'];

  var flights = 0;

  function flyBee() {
    if (going || doc.hidden || innerWidth < 300) return scheduleBee(20000);
    flights++;
    var b = el('button', 'mbbj-t-bee');
    b.type = 'button';
    b.setAttribute('aria-label', 'Biene: führt zur MediaBees-Spielhalle');
    b.innerHTML = BEE_SVG;
    var bub = el('span', 'mbbj-t-bubble', pick(BUBBLES));
    b.appendChild(bub);
    doc.body.appendChild(b);

    var W = innerWidth, H = innerHeight, size = W < 640 ? 62 : 80;
    var dir = Math.random() < 0.5 ? 1 : -1;
    var x0 = dir > 0 ? -size * 1.5 : W + size * 1.5, x1 = dir > 0 ? W + size * 1.5 : -size * 1.5;
    var baseY = H * (0.22 + Math.random() * 0.4), amp = 24 + Math.random() * 30;
    var stopAt = 0.42 + Math.random() * 0.16; /* hier bleibt sie kurz stehen und spricht */
    var tFly = Math.max(5.5, W / 190), tStop = 2.2, t0 = 0, done = false, caught = false;
    b.style.width = size + 'px'; b.style.height = Math.round(size * 0.8) + 'px';
    if (dir < 0) b.classList.add('is-left');

    function pos(u) {
      return { x: x0 + (x1 - x0) * u, y: baseY + Math.sin(u * Math.PI * 3) * amp };
    }
    function end() {
      if (done) return;
      done = true;
      if (b.parentNode) b.parentNode.removeChild(b);
      if (!caught && flights < 3) scheduleBee(100000 + Math.random() * 80000);
    }
    b.addEventListener('click', function () {
      caught = true;
      b.classList.add('is-caught');
      secret([pick(['Gefangen!', 'Erwischt!', 'Summ summ!']), '… ab in die Spielhalle.']);
    });

    function frame(now) {
      if (done) return;
      if (!t0) t0 = now;
      var s = (now - t0) / 1000, total = tFly + tStop, u, hover = false;
      if (caught) return;
      if (s >= total) return end();
      var sStop = tFly * stopAt;
      if (s < sStop) u = s / tFly;
      else if (s < sStop + tStop) { u = stopAt; hover = true; }
      else u = (s - tStop) / tFly;
      var p = pos(u), hy = hover ? Math.sin(s * 6) * 4 : 0;
      var dy = Math.cos(u * Math.PI * 3) * amp * 3 * Math.PI / (x1 - x0) * dir;
      var rot = hover ? 0 : Math.max(-0.35, Math.min(0.35, dy * dir));
      b.style.transform = 'translate(' + (p.x - size / 2).toFixed(1) + 'px,' + (p.y - size / 2 + hy).toFixed(1) + 'px) rotate(' + rot.toFixed(3) + 'rad)';
      b.classList.toggle('is-talk', hover);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    setTimeout(end, (tFly + tStop + 2) * 1000);
  }

  function scheduleBee(ms) { setTimeout(flyBee, ms); }

  function init() {
    if (doc.getElementById('mb404') || samePage()) return; /* Auf der Spielhalle selbst nicht nötig */
    if (C.button) makeButton();
    if (C.bee && !reduce) scheduleBee(C.test ? 1500 : 30000 + Math.random() * 30000);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();

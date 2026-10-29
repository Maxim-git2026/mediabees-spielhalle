/* MediaBees Arcade – 404-Spielhalle. Speichert nichts auf dem Gerät. */
(function () {
  'use strict';

  var tiles = [], full = {}, waiters = {};
  var TAU = Math.PI * 2;

  /* ---------- Gemeinsame Zeichnungen (lokale Koordinaten, Blick nach rechts) ---------- */
  function ell(g, x, y, rx, ry, rot) { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, TAU); }
  function rrect(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  function feelers(g, x1, y1, x2, y2, c) {
    g.strokeStyle = c || '#111'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(x1 + 1, y1 - 10, x1 + 7, y1 - 12); g.stroke();
    g.beginPath(); g.moveTo(x2, y2); g.quadraticCurveTo(x2 + 5, y2 - 7, x2 + 10, y2 - 7); g.stroke();
    g.fillStyle = c || '#111';
    g.beginPath(); g.arc(x1 + 7, y1 - 12, 2.2, 0, TAU); g.fill();
    g.beginPath(); g.arc(x2 + 10, y2 - 7, 2.2, 0, TAU); g.fill();
  }
  function beeWings(g, wing, big) {
    var f = 0.45 + 0.55 * Math.abs(wing), s = big || 1;
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.strokeStyle = 'rgba(17,17,17,0.55)'; g.lineWidth = 1.5;
    ell(g, -4, -15 * s, 9 * s, 15 * s * f + 2, -0.35); g.fill(); g.stroke();
    ell(g, 6, -14 * s, 7 * s, 12 * s * f + 2, 0.25); g.fill(); g.stroke();
  }

  var art = {
    bee: function (g, wing) {
      g.lineJoin = 'round';
      beeWings(g, wing);
      g.save();
      ell(g, -10, 3, 17, 14); g.fillStyle = '#F7B500'; g.fill(); g.clip();
      g.fillStyle = '#3A2410';
      g.fillRect(-17, -14, 5, 30); g.fillRect(-8, -14, 5, 30); g.fillRect(-30, -14, 6, 30);
      g.restore();
      ell(g, -10, 3, 17, 14); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
      g.beginPath(); g.moveTo(-26, 3); g.lineTo(-33, 5); g.lineTo(-26, 7); g.closePath(); g.fillStyle = '#111'; g.fill();
      g.beginPath(); g.arc(11, 2, 10, 0, TAU); g.fillStyle = '#3A2410'; g.fill(); g.stroke();
      g.beginPath(); g.arc(15, 0, 3.4, 0, TAU); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.arc(16, 0, 1.7, 0, TAU); g.fillStyle = '#111'; g.fill();
      g.beginPath(); g.arc(14, 5, 3.2, 0.3, Math.PI - 0.5); g.strokeStyle = '#F7B500'; g.lineWidth = 1.6; g.stroke();
      feelers(g, 10, -7, 15, -6);
    },
    bumble: function (g, wing) {
      g.lineJoin = 'round';
      var f = 0.45 + 0.55 * Math.abs(wing);
      g.fillStyle = 'rgba(255,255,255,0.8)'; g.strokeStyle = 'rgba(17,17,17,0.55)'; g.lineWidth = 1.5;
      ell(g, -2, -18, 7, 11 * f + 2, -0.3); g.fill(); g.stroke();
      ell(g, 6, -17, 6, 9 * f + 2, 0.25); g.fill(); g.stroke();
      g.strokeStyle = '#2A2A2A'; g.lineWidth = 2.5;
      for (var a = 0; a < TAU; a += 0.42) {
        var cx = -9 + Math.cos(a) * 20, cy = 3 + Math.sin(a) * 17;
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 3.5, cy + Math.sin(a) * 3.5); g.stroke();
      }
      g.save();
      ell(g, -9, 3, 20, 17); g.fillStyle = '#1C1C1C'; g.fill(); g.clip();
      g.fillStyle = '#F7C21B'; g.fillRect(-8, -16, 9, 40);
      g.fillStyle = '#F4F4F4'; g.fillRect(-32, -16, 8, 40);
      g.restore();
      ell(g, -9, 3, 20, 17); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
      g.beginPath(); g.arc(11, 1, 10, 0, TAU); g.fillStyle = '#F7C21B'; g.fill(); g.stroke();
      g.beginPath(); g.arc(19, 3, 7, 0, TAU); g.fillStyle = '#1C1C1C'; g.fill(); g.stroke();
      g.beginPath(); g.arc(21, 1.5, 2.4, 0, TAU); g.fillStyle = '#fff'; g.fill();
      feelers(g, 18, -3, 22, -1);
    },
    queen: function (g, wing) {
      g.lineJoin = 'round';
      beeWings(g, wing, 1.1);
      g.save();
      ell(g, -17, 3, 25, 12); g.fillStyle = '#EBA800'; g.fill(); g.clip();
      g.fillStyle = '#5A3510';
      g.fillRect(-14, -14, 5, 30); g.fillRect(-24, -14, 5, 30); g.fillRect(-34, -14, 5, 30); g.fillRect(-44, -14, 6, 30);
      g.restore();
      ell(g, -17, 3, 25, 12); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
      g.beginPath(); g.moveTo(-41, 3); g.lineTo(-48, 5); g.lineTo(-41, 7); g.closePath(); g.fillStyle = '#111'; g.fill();
      g.beginPath(); g.arc(12, 2, 10, 0, TAU); g.fillStyle = '#5A3510'; g.fill(); g.stroke();
      g.beginPath(); g.arc(16, 0, 3.4, 0, TAU); g.fillStyle = '#fff'; g.fill();
      g.beginPath(); g.arc(17, 0, 1.7, 0, TAU); g.fillStyle = '#111'; g.fill();
      g.beginPath();
      g.moveTo(3, -6); g.lineTo(4, -18); g.lineTo(8.5, -11); g.lineTo(12, -20); g.lineTo(15.5, -11); g.lineTo(20, -18); g.lineTo(21, -6); g.closePath();
      g.fillStyle = '#FFD84D'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.arc(12, -9.5, 2, 0, TAU); g.fillStyle = '#D3272F'; g.fill();
    },
    wasp: function (g, wing, body, stripe) {
      body = body || '#FFD400'; stripe = stripe || '#111';
      var f = 0.4 + 0.6 * Math.abs(wing);
      g.lineJoin = 'round';
      g.fillStyle = 'rgba(205,220,240,0.6)'; g.strokeStyle = 'rgba(17,17,17,0.5)'; g.lineWidth = 1.2;
      ell(g, -8, -11, 16, 4 * f + 1.5, -0.4); g.fill(); g.stroke();
      ell(g, 0, -11, 12, 3.5 * f + 1.5, -0.15); g.fill(); g.stroke();
      g.strokeStyle = '#111'; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(0, 6); g.lineTo(-5, 15); g.moveTo(4, 7); g.lineTo(5, 17); g.moveTo(8, 6); g.lineTo(13, 15); g.stroke();
      function abd() { g.beginPath(); g.moveTo(-5, -1); g.bezierCurveTo(-12, -11, -30, -8, -38, 3); g.bezierCurveTo(-30, 13, -12, 12, -5, 3); g.closePath(); }
      g.save(); abd(); g.fillStyle = body; g.fill(); g.clip();
      g.fillStyle = stripe;
      g.fillRect(-15, -12, 4.5, 26); g.fillRect(-24, -12, 4.5, 26); g.fillRect(-33, -12, 6, 26);
      g.beginPath(); g.moveTo(-11, -8); g.lineTo(-8, -3); g.lineTo(-11, 1); g.fill();
      g.restore();
      abd(); g.strokeStyle = '#111'; g.lineWidth = 2.2; g.stroke();
      g.beginPath(); g.moveTo(-37, 2); g.lineTo(-45, 5); g.lineTo(-37, 6); g.closePath(); g.fillStyle = '#111'; g.fill();
      ell(g, 3, 1, 8.5, 7); g.fillStyle = '#151515'; g.fill();
      ell(g, 3, -2.5, 3.2, 1.6); g.fillStyle = body; g.fill();
      ell(g, 13.5, 2, 6.5, 7); g.fillStyle = body; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.ellipse(13, -2, 6, 3.5, 0, Math.PI, TAU); g.fillStyle = '#111'; g.fill();
      ell(g, 15.5, 1, 2.2, 3.4, 0.35); g.fillStyle = '#111'; g.fill();
      g.beginPath(); g.moveTo(11.5, -3.5); g.lineTo(18, -1); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
      g.beginPath(); g.moveTo(12, -4); g.lineTo(17, -12); g.lineTo(23, -13); g.moveTo(15, -3); g.lineTo(21, -9); g.lineTo(26, -8); g.lineWidth = 1.8; g.stroke();
    },
    goldwasp: function (g, wing) {
      art.wasp(g, wing, '#FFE680', '#A87400');
      g.fillStyle = '#FFFFFF';
      [[-20, -16, 4], [6, 14, 3], [-34, 12, 3]].forEach(function (s) {
        var x = s[0], y = s[1], r = s[2];
        g.beginPath(); g.moveTo(x, y - r * 2); g.lineTo(x + r * 0.6, y - r * 0.6); g.lineTo(x + r * 2, y); g.lineTo(x + r * 0.6, y + r * 0.6);
        g.lineTo(x, y + r * 2); g.lineTo(x - r * 0.6, y + r * 0.6); g.lineTo(x - r * 2, y); g.lineTo(x - r * 0.6, y - r * 0.6); g.closePath(); g.fill();
      });
    },
    hornet: function (g, wing) {
      var f = 0.4 + 0.6 * Math.abs(wing);
      g.lineJoin = 'round';
      g.fillStyle = 'rgba(150,110,70,0.5)'; g.strokeStyle = 'rgba(17,17,17,0.55)'; g.lineWidth = 1.2;
      ell(g, -9, -12, 17, 5 * f + 1.5, -0.4); g.fill(); g.stroke();
      ell(g, 0, -12, 13, 4 * f + 1.5, -0.15); g.fill(); g.stroke();
      g.strokeStyle = '#E8B42A'; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(0, 7); g.lineTo(-5, 16); g.moveTo(4, 8); g.lineTo(5, 18); g.moveTo(9, 7); g.lineTo(14, 16); g.stroke();
      g.save();
      ell(g, -18, 3, 19, 11); g.fillStyle = '#2A1A10'; g.fill(); g.clip();
      g.fillStyle = '#E8902A'; g.fillRect(-34, -12, 9, 30);
      g.fillStyle = '#C9A227'; g.fillRect(-13, -12, 2, 30); g.fillRect(-21, -12, 2, 30);
      g.restore();
      ell(g, -18, 3, 19, 11); g.strokeStyle = '#111'; g.lineWidth = 2.2; g.stroke();
      g.beginPath(); g.moveTo(-36, 2); g.lineTo(-43, 5); g.lineTo(-36, 6); g.closePath(); g.fillStyle = '#111'; g.fill();
      ell(g, 4, 1, 10, 9); g.fillStyle = '#1A100A'; g.fill(); g.stroke();
      ell(g, 16, 2, 7.5, 8); g.fillStyle = '#E8902A'; g.fill(); g.stroke();
      ell(g, 18, 0, 2.6, 4, 0.3); g.fillStyle = '#111'; g.fill();
      g.beginPath(); g.moveTo(14, -5); g.lineTo(19, -14); g.lineTo(26, -15); g.moveTo(17, -4); g.lineTo(24, -10); g.lineTo(29, -9); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    },
    /* Ruhrpott-Silhouette: Häuser, Fördertürme, Gasometer, Schlote */
    skyline: function (g, x0, width, baseY, color, rng, win) {
      var x = x0, end = x0 + width - 40;
      while (x < end) {
        var r = rng();
        g.fillStyle = color; g.strokeStyle = color;
        if (r < 0.13) {
          var w = 46, h = 110 + rng() * 40, cx = x + w / 2;
          g.beginPath();
          g.moveTo(x, baseY); g.lineTo(cx - 7, baseY - h); g.lineTo(cx + 7, baseY - h); g.lineTo(x + w, baseY);
          g.lineTo(x + w - 7, baseY); g.lineTo(cx + 3, baseY - h + 14); g.lineTo(cx - 3, baseY - h + 14); g.lineTo(x + 7, baseY); g.closePath(); g.fill();
          g.lineWidth = 2.5; g.beginPath();
          for (var yy = baseY - 20; yy > baseY - h + 20; yy -= 22) { var sp = (baseY - yy) / h; g.moveTo(x + 7 + sp * (w / 2 - 10), yy); g.lineTo(x + w - 7 - sp * (w / 2 - 10), yy - 18); }
          g.stroke();
          g.lineWidth = 4; g.beginPath(); g.arc(cx, baseY - h - 8, 13, 0, TAU); g.stroke();
          g.fillRect(cx - 3, baseY - h - 4, 6, 6);
          g.fillRect(x + w - 4, baseY - 38, 42, 38);
          x += w + 46;
        } else if (r < 0.23) {
          var w2 = 64 + rng() * 20, h2 = 120 + rng() * 50;
          g.fillRect(x, baseY - h2, w2, h2);
          g.beginPath(); g.ellipse(x + w2 / 2, baseY - h2, w2 / 2, 9, 0, Math.PI, TAU); g.fill();
          if (win) { g.fillStyle = 'rgba(0,0,0,0.18)'; for (var k = 8; k < w2; k += 10) g.fillRect(x + k, baseY - h2, 2, h2); }
          x += w2 + 10;
        } else if (r < 0.40) {
          var h3 = 100 + rng() * 90;
          g.fillRect(x, baseY - h3, 10, h3); g.fillRect(x - 2, baseY - h3, 14, 6);
          if (win) { g.fillStyle = '#FF5A4A'; g.fillRect(x + 3, baseY - h3 - 4, 4, 4); }
          x += 22;
        } else {
          var w4 = 24 + rng() * 46, h4 = 28 + rng() * 74;
          g.fillRect(x, baseY - h4, w4, h4);
          if (win) {
            for (var wy = baseY - h4 + 8; wy < baseY - 8; wy += 11) {
              for (var wx = x + 5; wx < x + w4 - 6; wx += 9) {
                if (rng() < 0.22) { g.fillStyle = win; g.globalAlpha = 0.45 + rng() * 0.45; g.fillRect(wx, wy, 4, 5); g.globalAlpha = 1; }
              }
            }
          }
          x += w4 + 2;
        }
      }
      g.fillStyle = color; g.fillRect(x0, baseY, width, 600);
    },
    /* Halde mit Tetraeder */
    halde: function (g, cx, baseY, w, h, color) {
      g.fillStyle = color; g.strokeStyle = color;
      g.beginPath(); g.moveTo(cx - w / 2, baseY);
      g.quadraticCurveTo(cx - w * 0.22, baseY - h * 1.08, cx, baseY - h);
      g.quadraticCurveTo(cx + w * 0.22, baseY - h * 1.08, cx + w / 2, baseY);
      g.closePath(); g.fill();
      var ty = baseY - h + 2, s = Math.min(64, w * 0.16);
      g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath();
      g.moveTo(cx - s / 2, ty); g.lineTo(cx, ty - s * 0.95); g.lineTo(cx + s / 2, ty); g.closePath();
      g.moveTo(cx, ty - s * 0.95); g.lineTo(cx + s * 0.12, ty - 4);
      g.moveTo(cx - s / 4, ty - s * 0.47); g.lineTo(cx + s / 4, ty - s * 0.47);
      g.stroke();
    },
    /* Autos von oben, Bug zeigt nach oben, Mitte = 0,0 (40 × 72) */
    car: function (g, body, roof) {
      g.lineJoin = 'round';
      g.fillStyle = body; g.strokeStyle = '#111'; g.lineWidth = 2;
      g.fillRect(-24, -15, 5, 7); g.strokeRect(-24, -15, 5, 7); g.fillRect(19, -15, 5, 7); g.strokeRect(19, -15, 5, 7);
      rrect(g, -20, -36, 40, 72, 10); g.fillStyle = body; g.fill(); g.lineWidth = 2.5; g.stroke();
      g.fillStyle = '#1B2230';
      g.beginPath(); g.moveTo(-15, -17); g.lineTo(15, -17); g.lineTo(12, -6); g.lineTo(-12, -6); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-12, 20); g.lineTo(12, 20); g.lineTo(14, 27); g.lineTo(-14, 27); g.closePath(); g.fill();
      rrect(g, -13, -6, 26, 26, 4); g.fillStyle = roof || 'rgba(0,0,0,0.18)'; g.fill();
      g.fillStyle = '#FFF6D6'; g.fillRect(-16, -35, 8, 4); g.fillRect(8, -35, 8, 4);
      g.fillStyle = '#E5322D'; g.fillRect(-17, 32, 8, 3); g.fillRect(9, 32, 8, 3);
    },
    /* Der Bienenflitzer: gelb-braun gestreift, Flügel auf dem Dach, Fühler vorn */
    flitzer: function (g, wing) {
      var f = 0.45 + 0.55 * Math.abs(wing);
      g.lineJoin = 'round';
      g.strokeStyle = '#111'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-7, -35); g.quadraticCurveTo(-9, -45, -15, -49); g.moveTo(7, -35); g.quadraticCurveTo(9, -45, 15, -49); g.stroke();
      g.fillStyle = '#111';
      g.beginPath(); g.arc(-15, -49, 2.8, 0, TAU); g.arc(15, -49, 2.8, 0, TAU); g.fill();
      g.save();
      rrect(g, -21, -37, 42, 74, 12); g.fillStyle = '#FDC506'; g.fill(); g.clip();
      g.fillStyle = '#3A2410'; g.fillRect(-21, -27, 42, 6); g.fillRect(-21, 21, 42, 6); g.fillRect(-21, 30, 42, 4);
      g.restore();
      rrect(g, -21, -37, 42, 74, 12); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = '#1B2230';
      g.beginPath(); g.moveTo(-16, -18); g.lineTo(16, -18); g.lineTo(13, -7); g.lineTo(-13, -7); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-12, 13); g.lineTo(12, 13); g.lineTo(14, 19); g.lineTo(-14, 19); g.closePath(); g.fill();
      rrect(g, -13, -7, 26, 20, 5); g.fillStyle = '#3A2410'; g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.strokeStyle = 'rgba(17,17,17,0.55)'; g.lineWidth = 1.5;
      ell(g, -16, 2, 13, 4 * f + 2, 0.45); g.fill(); g.stroke();
      ell(g, 16, 2, 13, 4 * f + 2, -0.45); g.fill(); g.stroke();
      g.fillStyle = '#FFF6D6'; g.fillRect(-17, -36, 9, 4); g.fillRect(8, -36, 9, 4);
      g.fillStyle = '#E5322D'; g.fillRect(-17, 33, 8, 3); g.fillRect(9, 33, 8, 3);
    },
    hex: function (g, cx, cy, r, fill, stroke, lw) {
      g.beginPath();
      for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      g.closePath();
      if (fill) { g.fillStyle = fill; g.fill(); }
      if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); }
    },
    rrect: rrect,
    rng: function (seed) {
      var s = seed >>> 0;
      return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    }
  };

  /* ---------- Icons für die Anleitung und die Werkzeugleiste ---------- */
  var MOUSE = '<rect x="2" y="2" width="28" height="40" rx="14" fill="#fff" stroke="#111" stroke-width="2.5"/>';
  var ICONS = {
    'mouse-left': '<svg viewBox="0 0 32 44" aria-hidden="true">' + MOUSE + '<path d="M16 3.25V16.75H3.25V16A12.75 12.75 0 0 1 16 3.25Z" fill="#E5322D"/><path d="M16 2v16M2 18h28" stroke="#111" stroke-width="2.5"/></svg>',
    'mouse-right': '<svg viewBox="0 0 32 44" aria-hidden="true">' + MOUSE + '<path d="M16 3.25V16.75H28.75V16A12.75 12.75 0 0 0 16 3.25Z" fill="#E5322D"/><path d="M16 2v16M2 18h28" stroke="#111" stroke-width="2.5"/></svg>',
    'swipe': '<svg viewBox="0 0 40 46" aria-hidden="true"><path d="M5 7h28M5 7l4.5-4.5M5 7l4.5 4.5M33 7l-4.5-4.5M33 7l-4.5 4.5" fill="none" stroke="#FDC506" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15.5v14.5l-3.6-3.4c-1.9-1.8-4.8.6-3.2 2.8L14.5 43h13c2.2 0 4-1.8 4-4V24.5c0-2.6-4-2.6-4 0v-1.8c0-2.6-4-2.6-4 0v-1.2c0-2.6-4-2.6-4 0V15.5c0-2.6-4-2.6-4 0z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>',
    'tap': '<svg viewBox="0 0 40 46" aria-hidden="true"><circle cx="15" cy="11" r="9" fill="none" stroke="#FDC506" stroke-width="2.5"/><path d="M12 11.5v18.5l-3.6-3.4c-1.9-1.8-4.8.6-3.2 2.8L14.5 43h13c2.2 0 4-1.8 4-4V24.5c0-2.6-4-2.6-4 0v-1.8c0-2.6-4-2.6-4 0v-1.2c0-2.6-4-2.6-4 0V11.5c0-2.6-4-2.6-4 0z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>'
  };
  var TOOL = {
    pause: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/></svg>',
    play: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><path d="M5 3l12 7-12 7z"/></svg>',
    soundOff: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M3 8h3l4-4v12l-4-4H3z" fill="currentColor"/><path d="M13 8l4 4M17 8l-4 4"/></svg>',
    soundOn: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M3 8h3l4-4v12l-4-4H3z" fill="currentColor"/><path d="M13.5 7a4 4 0 0 1 0 6M15.5 4.5a7.5 7.5 0 0 1 0 11"/></svg>',
    fs: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5"/></svg>',
    fsExit: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3v5H3M17 8h-5V3M12 17v-5h5M3 12h5v5"/></svg>'
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  window.MBArcade = {
    tile: function (t) { tiles.push(t); },
    register: function (g) {
      full[g.id] = g;
      (waiters[g.id] || []).forEach(function (fn) { fn(g); });
      delete waiters[g.id];
    },
    art: art
  };

  function boot() {
    var root = document.getElementById('mb404');
    if (!root || root.getAttribute('data-ready') || !tiles.length) return;
    root.setAttribute('data-ready', '1');

    var REST = root.getAttribute('data-rest') || '';
    var HOME = (root.getAttribute('data-home') || '/').replace(/\/?$/, '/');
    var ASSETS = root.getAttribute('data-assets') || '';
    var VER = root.getAttribute('data-ver') || '';
    var TOP = 10;
    function $(s) { return root.querySelector(s); }
    function $$(s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }

    var arcade = $('.mb4-arcade'), tilesEl = $('[data-tiles]'), player = $('[data-player]');
    var stage = $('[data-stage]'), screen = $('[data-screen]'), overlay = $('[data-overlay]');
    var elTitle = $('[data-game-title]');
    var elScore = $('[data-score]'), elTime = $('[data-time]'), elBest = $('[data-best]'), elBar = $('[data-bar]');
    var timeBox = $('[data-time-box]'), barBox = $('[data-bar-box]');
    var elMsg = $('[data-msg]'), elLive = $('[data-live]');
    var startTitle = $('[data-start-title]'), startText = $('[data-start-text]'), helpBoxes = $$('[data-help]');
    var rankEl = $('[data-rank]'), resultEl = $('[data-result]'), statsEl = $('[data-stats]'), ctaEl = $('[data-cta]');
    var btnStart = $('[data-start]'), btnResume = $('[data-resume]'), btnRestart = $('[data-restart]'), btnAgain = $('[data-again]');
    var btnHelp = $('[data-help-btn]'), btnPause = $('[data-pause]'), btnSound = $('[data-sound]'), btnFs = $('[data-fs]');
    var topGame = $('[data-top-game]'), form = $('[data-entry]'), entryText = $('[data-entry-text]');
    var inName = $('#mb4-name'), inHp = $('#mb4-website'), btnSubmit = $('[data-submit]');
    var feedback = $('[data-feedback]'), list = $('[data-list]'), empty = $('[data-empty]');
    var podium = $('[data-podium]'), podiumBox = $('[data-podium-box]');
    var allBtn = $('[data-all-btn]'), allBox = $('[data-all]'), allGrid = $('[data-all-grid]');
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    arcade.hidden = false;

    function fmt(n) { try { return Number(n).toLocaleString('de-DE'); } catch (e) { return String(n); } }
    function setTool(btn, icon, text, pressed) {
      btn.innerHTML = icon + '<span class="mb4-tool-txt">' + text + '</span>';
      btn.setAttribute('aria-label', text);
      if (pressed !== undefined) btn.setAttribute('aria-pressed', String(pressed));
    }

    /* Ton, standardmäßig aus */
    var ac = null, soundOn = false;
    function tone(f1, f2, dur, type, vol, delay) {
      if (!soundOn || !ac) return;
      try {
        var t = ac.currentTime + (delay || 0);
        var o = ac.createOscillator(), gn = ac.createGain();
        o.type = type || 'triangle';
        o.frequency.setValueAtTime(f1, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
        gn.gain.setValueAtTime(vol || 0.05, t);
        gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(gn); gn.connect(ac.destination);
        o.start(t); o.stop(t + dur + 0.03);
      } catch (e) {}
    }
    function renderSound() { setTool(btnSound, soundOn ? TOOL.soundOn : TOOL.soundOff, soundOn ? 'Ton aus' : 'Ton an', soundOn); }
    btnSound.addEventListener('click', function () {
      soundOn = !soundOn;
      if (soundOn && !ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
      if (ac && ac.state === 'suspended') ac.resume();
      renderSound();
    });
    renderSound();

    var msgTimer = 0;
    function say(text) {
      elMsg.textContent = text;
      elMsg.classList.add('is-on');
      clearTimeout(msgTimer);
      msgTimer = setTimeout(function () { elMsg.classList.remove('is-on'); }, 2400);
    }
    function announce(text) { elLive.textContent = ''; setTimeout(function () { elLive.textContent = text; }, 50); }

    /* Zustand: nur im Arbeitsspeicher, nichts auf dem Gerät */
    var S = { sel: null, game: null, inst: null, running: false, paused: false, round: null, best: {}, tops: {}, topErr: {}, ownIds: {}, lastName: '' };
    window.MBArcade.current = function () { return S.inst; };

    function setScore(n) { elScore.textContent = fmt(n); }
    function setTime(left, total) {
      left = Math.max(0, left);
      elTime.textContent = Math.ceil(left / 1000);
      elBar.style.transform = 'scaleX(' + (total ? left / total : 0) + ')';
    }

    var ctx = {
      screen: screen, stage: stage, reduce: reduce,
      setScore: setScore, setTime: setTime,
      finish: function (score, stats) { endRound(score, stats); },
      say: say, tone: tone, announce: announce,
      touch: function () { return !!(window.matchMedia && window.matchMedia('(hover: none)').matches); }
    };

    function showView(name) {
      overlay.hidden = !name;
      $$('.mb4-view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
      if (name) overlay.scrollTop = 0;
    }

    /* Anleitung mit Icons */
    function iconHTML(k) {
      if (k.indexOf('kbd:') === 0) return '<kbd class="mb4-kbd">' + esc(k.slice(4)) + '</kbd>';
      return '<span class="mb4-ico">' + (ICONS[k] || '') + '</span>';
    }
    function renderHelp(g) {
      var h = g.help || {};
      var html = '<div><p class="mb4-help-h">Steuerung</p><ul class="mb4-help-list">';
      (h.controls || []).forEach(function (c) {
        var sep = '<span class="mb4-or">' + (c.sep || 'oder') + '</span>';
        var desk = c.icons.filter(function (k) { return k !== 'tap'; });
        var touch = c.icons.filter(function (k) { return k === 'tap'; });
        if (c.touch) { desk = []; touch = c.icons; }
        if (c.kb) touch = [];
        var cls = (!touch.length ? 'is-kb' : '') + (!desk.length ? ' is-touch' : '');
        var icons = (desk.length ? '<span class="mb4-help-icons is-desk">' + desk.map(iconHTML).join(sep) + '</span>' : '') +
          (touch.length ? '<span class="mb4-help-icons is-tap">' + touch.map(iconHTML).join(sep) + '</span>' : '');
        html += '<li class="' + cls + '">' + icons + '<span class="mb4-help-txt">' + esc(c.text) + '</span></li>';
      });
      html += '</ul></div><div><p class="mb4-help-h">' + esc(h.legendTitle || 'Punkte') + '</p><ul class="mb4-help-list">';
      (h.legend || []).forEach(function (l, i) {
        html += '<li><span class="mb4-help-icons" data-sprite="' + i + '"></span><span class="mb4-help-txt">' + esc(l.text) + '</span>' + (l.val ? '<span class="mb4-help-val' + (l.minus ? ' is-minus' : '') + '">' + esc(l.val) + '</span>' : '') + '</li>';
      });
      html += '</ul></div>';
      helpBoxes.forEach(function (box) {
        box.innerHTML = html;
        Array.prototype.forEach.call(box.querySelectorAll('[data-sprite]'), function (span) {
          var l = h.legend[+span.getAttribute('data-sprite')];
          if (l.svg) { span.innerHTML = '<span class="mb4-sprite">' + l.svg + '</span>'; return; }
          var c = document.createElement('canvas'), d = 2;
          c.className = 'mb4-sprite'; c.width = 46 * d; c.height = 46 * d;
          var x = c.getContext('2d'); x.scale(d, d);
          if (l.draw) l.draw(x, 46);
          span.appendChild(c);
        });
      });
    }

    /* Vollbild, mit Ersatz für Geräte ohne Vollbild-Schnittstelle (iPhone) */
    function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
    function isFs() { return fsEl() === player || player.classList.contains('is-fakefs'); }
    function renderFs() { setTool(btnFs, isFs() ? TOOL.fsExit : TOOL.fs, isFs() ? 'Vollbild beenden' : 'Vollbild'); }
    function afterFs() {
      player.classList.toggle('is-fs', fsEl() === player);
      renderFs();
      setTimeout(function () { if (S.inst && S.inst.resize) S.inst.resize(); }, 60);
    }
    function fakeFs(on) {
      player.classList.toggle('is-fakefs', on);
      document.documentElement.classList.toggle('mb4-noscroll', on);
      afterFs();
    }
    function enterFs() {
      var req = player.requestFullscreen || player.webkitRequestFullscreen;
      if (req) {
        try {
          var p = req.call(player);
          if (p && p.catch) p.catch(function () { fakeFs(true); });
          return;
        } catch (e) {}
      }
      fakeFs(true);
    }
    function exitFs() {
      if (player.classList.contains('is-fakefs')) { fakeFs(false); return; }
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) { try { ex.call(document); } catch (e) {} }
    }
    btnFs.addEventListener('click', function () { if (isFs()) exitFs(); else enterFs(); stage.focus({ preventScroll: true }); });
    document.addEventListener('fullscreenchange', function () { afterFs(); if (!fsEl()) pause(true); });
    document.addEventListener('webkitfullscreenchange', function () { afterFs(); if (!fsEl()) pause(true); });
    renderFs();

    function ensureVisible() {
      if (isFs()) return;
      var r = player.getBoundingClientRect();
      if (r.top < 100 || r.bottom > window.innerHeight) player.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    /* Ranglisten */
    function api(path, opts) {
      if (!REST) return Promise.resolve({ ok: false });
      opts = opts || {};
      opts.credentials = 'omit';
      opts.headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      return fetch(REST + path, opts)
        .then(function (r) { return r.json(); })
        .catch(function () { return { ok: false, message: 'Keine Verbindung. Versuch es gleich nochmal.' }; });
    }

    /* Rangstufen stehen in der Kachel, damit sie für alle Spiele bekannt sind */
    function tileOf(gid) { return tiles.filter(function (t) { return t.id === gid; })[0]; }
    function rankFor(gid, score) {
      var t = tileOf(gid), ranks = (t && t.ranks) || [[0, '', '']];
      return ranks.filter(function (r) { return score >= r[0]; })[0] || ranks[ranks.length - 1];
    }
    function row(pos, name, score, cls, gid) {
      var li = document.createElement('li');
      li.className = (cls || '') + (pos <= 3 ? ' is-top' : '');
      var p = document.createElement('span'); p.className = 'mb4-pos'; p.textContent = pos + '.';
      var n = document.createElement('span'); n.className = 'mb4-name';
      var nn = document.createElement('span'); nn.className = 'mb4-name-n'; nn.textContent = name; n.appendChild(nn);
      var title = gid ? rankFor(gid, score)[1] : '';
      if (title) { var nt = document.createElement('span'); nt.className = 'mb4-name-t'; nt.textContent = title; n.appendChild(nt); }
      var s = document.createElement('span'); s.className = 'mb4-pts'; s.textContent = fmt(score);
      li.appendChild(p); li.appendChild(n); li.appendChild(s);
      return li;
    }

    function renderTop(gid) {
      updateTile(gid);
      renderAll();
      if (S.sel !== gid) return;
      var top = S.tops[gid];
      list.innerHTML = '';
      if (!top) {
        empty.textContent = S.topErr[gid] ? 'Die Rangliste ist gerade nicht erreichbar.' : 'Rangliste lädt …';
        empty.hidden = false;
        return;
      }
      top.forEach(function (e, i) { list.appendChild(row(i + 1, e.name, e.score, e.id && e.id === S.ownIds[gid] ? 'is-me' : '', gid)); });
      empty.textContent = 'Noch alles frei. Hol dir Platz 1.';
      empty.hidden = top.length > 0;
    }

    /* Übersicht: alle Spiele mit ihren besten Plätzen */
    function renderAll() {
      if (!allBox || allBox.hidden) return;
      allGrid.innerHTML = '';
      var ALL_N = window.innerWidth <= 640 ? 3 : 5;
      tiles.forEach(function (t) {
        var card = document.createElement('div'); card.className = 'mb4-all-card' + (t.id === S.sel ? ' is-sel' : '');
        var h = document.createElement('p'); h.className = 'mb4-all-h'; h.textContent = t.title; card.appendChild(h);
        var top = S.tops[t.id], ol = document.createElement('ol'); ol.className = 'mb4-list';
        if (top && top.length) top.slice(0, ALL_N).forEach(function (e, i) { ol.appendChild(row(i + 1, e.name, e.score, e.id && e.id === S.ownIds[t.id] ? 'is-me' : '', t.id)); });
        if (top && top.length) card.appendChild(ol);
        else {
          var em = document.createElement('p'); em.className = 'mb4-empty';
          em.textContent = top ? 'Noch alles frei. Hol dir Platz 1.' : (S.topErr[t.id] ? 'Gerade nicht erreichbar.' : 'Lädt …');
          card.appendChild(em);
        }
        var b = document.createElement('button'); b.type = 'button'; b.className = 'mb4-all-go';
        b.textContent = t.id === S.sel ? 'Wird gerade gespielt' : (top && top.length > ALL_N ? 'Top 10 und spielen' : 'Spielen');
        b.disabled = t.id === S.sel;
        b.addEventListener('click', function () { select(t.id, true); });
        card.appendChild(b);
        allGrid.appendChild(card);
      });
    }
    function toggleAll(open) {
      allBox.hidden = !open;
      allBtn.setAttribute('aria-expanded', String(open));
      allBtn.textContent = open ? 'Übersicht schließen' : 'Ranglisten aller Spiele';
      if (open) { renderAll(); tiles.forEach(function (t) { loadTop(t.id); }); }
    }

    function loadTop(gid) {
      return api('top?game=' + encodeURIComponent(gid)).then(function (d) {
        if (d && d.ok) { S.tops[gid] = d.top || []; S.topErr[gid] = false; }
        else if (!S.tops[gid]) { S.topErr[gid] = true; }
        renderTop(gid);
      });
    }

    function qualifies(gid, score) {
      var top = S.tops[gid];
      if (!top || score <= 0) return false;
      return top.length < TOP || score > top[top.length - 1].score;
    }
    function place(gid, score) {
      var p = 1;
      (S.tops[gid] || []).forEach(function (e) { if (e.score >= score) p++; });
      return p;
    }

    /* Top 3 im Endscreen, auf Wunsch mit „Du“ an der erreichten Stelle */
    function renderPodium(gid, mine) {
      var top = S.tops[gid];
      podium.innerHTML = '';
      if (!top) { podiumBox.hidden = true; return; }
      podiumBox.hidden = false;
      var rows = top.map(function (e) { return { name: e.name, score: e.score, me: e.id && e.id === S.ownIds[gid] }; });
      var myPos = 0;
      if (mine) { myPos = place(gid, mine); rows.splice(myPos - 1, 0, { name: 'Du', score: mine, me: true }); }
      if (!rows.length) {
        var li = document.createElement('li'); li.className = 'is-gap'; li.textContent = 'Noch frei. Platz 1 wartet.';
        podium.appendChild(li);
        return;
      }
      rows.slice(0, 3).forEach(function (r, i) { podium.appendChild(row(i + 1, r.name, r.score, r.me ? 'is-me' : '', gid)); });
      if (myPos > 3) {
        var gap = document.createElement('li'); gap.className = 'is-gap'; gap.textContent = '…';
        podium.appendChild(gap);
        podium.appendChild(row(myPos, 'Du', mine, 'is-me', gid));
      }
    }

    function setFeedback(text) { feedback.textContent = text || ''; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var round = S.round;
      if (!round || !round.done) return;
      var name = inName.value.replace(/\s+/g, ' ').trim();
      if (name.length < 2 || name.length > 16) { setFeedback('Der Spitzname braucht 2 bis 16 Zeichen.'); inName.focus(); return; }
      if (!round.token) { setFeedback('Diese Runde lässt sich nicht mehr eintragen. Spiel einfach nochmal.'); return; }
      btnSubmit.disabled = true;
      setFeedback('');
      api('score', { method: 'POST', body: JSON.stringify({ game: round.gid, token: round.token, name: name, score: round.score, website: inHp.value }) })
        .then(function (d) {
          btnSubmit.disabled = false;
          if (d && d.ok) {
            round.token = null;
            S.lastName = name;
            if (d.top) S.tops[round.gid] = d.top;
            if (d.rank) S.ownIds[round.gid] = d.id;
            form.hidden = true;
            renderTop(round.gid);
            renderPodium(round.gid, 0);
            var txt = d.rank ? 'Eingetragen! Du bist auf Platz ' + d.rank + '.' : (d.message || 'Knapp vorbei, die Top 10 haben sich gerade geändert.');
            resultEl.textContent = txt;
            say(txt);
            announce(txt);
            btnAgain.focus({ preventScroll: true });
          } else {
            setFeedback((d && d.message) || 'Das hat nicht geklappt. Versuch es nochmal.');
          }
        });
    });

    /* Runden */
    function startRound() {
      var g = S.game;
      if (!g || !S.inst) return;
      if (S.running && S.inst.abort) S.inst.abort();
      var round = { gid: g.id, token: null, score: 0, done: false };
      round.p = api('start', { method: 'POST', body: JSON.stringify({ game: g.id }) })
        .then(function (d) { if (d && d.ok) round.token = d.token; });
      S.round = round;
      S.running = true; S.paused = false;
      form.hidden = true; setFeedback('');
      btnPause.disabled = false; renderPause();
      elMsg.classList.remove('is-on');
      showView(null);
      setScore(0);
      if (g.duration) setTime(g.duration, g.duration);
      stage.classList.add('is-running');
      ensureVisible();
      S.inst.start();
      announce(g.title + ' läuft.');
    }

    function renderPause() { setTool(btnPause, S.paused ? TOOL.play : TOOL.pause, S.paused ? 'Fortsetzen' : 'Pause'); }

    function pause(on) {
      if (!S.running || S.paused === on) return;
      S.paused = on;
      S.inst.setPaused(on);
      renderPause();
      if (on) { showView('pause'); btnResume.focus({ preventScroll: true }); announce('Pausiert.'); }
      else { showView(null); }
    }

    function endRound(score, stats) {
      if (!S.running) return;
      var g = S.game, gid = g.id, round = S.round;
      S.running = false; S.paused = false;
      stage.classList.remove('is-running');
      btnPause.disabled = true; renderPause();
      setScore(score);
      if (g.duration) setTime(0, g.duration);
      round.score = score; round.done = true;

      var isNew = score > (S.best[gid] || 0);
      if (isNew) { S.best[gid] = score; elBest.textContent = fmt(score); }
      var rank = rankFor(gid, score);
      rankEl.textContent = rank[1];
      resultEl.textContent = fmt(score) + ' Punkte. ' + (isNew && score > 0 ? 'Neuer Rekord!' : rank[2]);
      statsEl.textContent = (g.stats && stats) ? g.stats(stats) : '';
      statsEl.hidden = !statsEl.textContent;
      ctaEl.textContent = g.cta.text;
      ctaEl.href = HOME + g.cta.path;
      form.hidden = true;
      renderPodium(gid, 0);
      showView('end');
      tone(440, 660, 0.15, 'triangle', 0.07); tone(660, 880, 0.25, 'triangle', 0.07, 0.15);
      btnAgain.focus({ preventScroll: true });

      var base = 'Runde vorbei. ' + score + ' Punkte, ' + rank[1] + '.';
      /* Rangliste frisch holen, falls andere gerade nachgelegt haben */
      Promise.all([round.p, loadTop(gid)]).then(function () {
        if (S.round !== round || S.running) return;
        if (round.token && qualifies(gid, score)) {
          var pl = place(gid, score);
          entryText.textContent = 'Das reicht für Platz ' + pl + '! Trag dich ein.';
          if (S.lastName && !inName.value) inName.value = S.lastName;
          renderPodium(gid, score);
          form.hidden = false;
          inName.focus({ preventScroll: true });
          announce(base + ' Das reicht für Platz ' + pl + ' der Rangliste.');
        } else {
          renderPodium(gid, 0);
          announce(base);
        }
      });
    }

    if (allBtn) allBtn.addEventListener('click', function () { toggleAll(allBox.hidden); });
    btnStart.addEventListener('click', startRound);
    btnAgain.addEventListener('click', startRound);
    btnRestart.addEventListener('click', startRound);
    btnResume.addEventListener('click', function () { pause(false); });
    btnPause.addEventListener('click', function () { pause(!S.paused); });
    btnHelp.addEventListener('click', function () {
      if (S.running) { pause(true); return; }
      showView('start');
      btnStart.focus({ preventScroll: true });
    });

    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(true); });
    window.addEventListener('blur', function () { pause(true); });

    document.addEventListener('keydown', function (e) {
      if (!S.running) return;
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      if (e.key === 'Escape') { e.preventDefault(); pause(!S.paused); return; }
      if (S.paused || e.ctrlKey || e.metaKey || e.altKey) return;
      if (S.inst && S.inst.key && S.inst.key(e)) e.preventDefault();
    });

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (S.inst && S.inst.resize) S.inst.resize();
        tiles.forEach(drawThumb);
      }, 150);
    });

    /* Spielauswahl als Kacheln */
    function drawThumb(g) {
      var c = g._thumb;
      var r = c.getBoundingClientRect();
      if (!r.width || !r.height || !g.thumb) return;
      var d = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * d); c.height = Math.round(r.height * d);
      var x = c.getContext('2d');
      x.setTransform(d, 0, 0, d, 0, 0);
      g.thumb(x, r.width, r.height);
    }
    function updateTile(gid) {
      tiles.forEach(function (g) {
        if (g.id !== gid) return;
        var top = S.tops[gid];
        g._rec.textContent = top && top.length ? 'Rekord: ' + fmt(top[0].score) + ' von ' + top[0].name : (top ? 'Noch kein Rekord' : ' ');
      });
    }

    /* Spiel-Code wird erst geladen, wenn jemand die Kachel wählt */
    var loading = {};
    function loadGame(id, cb) {
      if (full[id]) { if (cb) cb(full[id]); return; }
      if (cb) (waiters[id] = waiters[id] || []).push(cb);
      if (loading[id] || !ASSETS) return;
      loading[id] = true;
      var sc = document.createElement('script');
      sc.src = ASSETS + 'games/' + id + '.js' + (VER ? '?ver=' + encodeURIComponent(VER) : '');
      sc.async = true;
      sc.onerror = function () {
        loading[id] = false;
        var w = waiters[id] || []; delete waiters[id];
        w.forEach(function (fn) { fn(null); });
        if (sc.parentNode) sc.parentNode.removeChild(sc);
      };
      document.head.appendChild(sc);
    }

    function teardown() {
      if (S.inst) {
        if (S.running && S.inst.abort) S.inst.abort();
        if (S.inst.unmount) S.inst.unmount();
      }
      S.inst = null; S.game = null;
      S.running = false; S.paused = false; S.round = null;
      screen.innerHTML = '';
      stage.classList.remove('is-running');
    }

    function select(id, scroll) {
      var t = null;
      tiles.forEach(function (x) { if (x.id === id) t = x; });
      if (!t || id === S.sel) { if (scroll) ensureVisible(); return; }
      teardown();
      S.sel = id;
      tiles.forEach(function (x) { x._tile.setAttribute('aria-pressed', String(x === t)); });
      stage.setAttribute('data-game', id);
      stage.setAttribute('aria-label', 'Spielfeld ' + t.title);
      elTitle.textContent = t.title;
      topGame.textContent = t.title;
      startTitle.textContent = t.title;
      startText.textContent = 'Spiel lädt …';
      helpBoxes.forEach(function (box) { box.innerHTML = ''; });
      btnStart.disabled = true;
      btnPause.disabled = true; renderPause();
      form.hidden = true; setFeedback(''); elMsg.classList.remove('is-on');
      elBest.textContent = fmt(S.best[id] || 0);
      setScore(0);
      renderTop(id);
      renderAll();
      if (S.booted) loadTop(id);
      showView('start');
      if (scroll) ensureVisible();
      loadGame(id, function (g) {
        if (S.sel !== id) return;
        if (!g) { startText.textContent = 'Das Spiel ließ sich nicht laden. Lade die Seite bitte neu.'; return; }
        setup(g);
      });
    }

    function setup(g) {
      S.game = g;
      var timed = !!g.duration;
      timeBox.hidden = !timed; barBox.hidden = !timed;
      if (timed) setTime(g.duration, g.duration);
      startText.textContent = g.startText;
      renderHelp(g);
      btnStart.disabled = false;
      S.inst = g.mount(ctx);
    }

    tiles.forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mb4-tile';
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="mb4-tile-pic" aria-hidden="true"><canvas></canvas></span><span class="mb4-tile-name"></span><span class="mb4-tile-rec"> </span>';
      b.querySelector('.mb4-tile-name').textContent = g.title;
      b.addEventListener('click', function () { select(g.id, true); });
      ['pointerenter', 'focus', 'touchstart'].forEach(function (ev) { b.addEventListener(ev, function () { loadGame(g.id); }, { passive: true }); });
      tilesEl.appendChild(b);
      g._tile = b;
      g._thumb = b.querySelector('canvas');
      g._rec = b.querySelector('.mb4-tile-rec');
    });

    /* Handy: Kacheln als Karussell mit Pfeilen und Punkten */
    var car = document.createElement('div'); car.className = 'mb4-carousel';
    tilesEl.parentNode.insertBefore(car, tilesEl); car.appendChild(tilesEl);
    function arrow(dir) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'mb4-car-btn is-' + (dir < 0 ? 'prev' : 'next');
      b.setAttribute('aria-label', dir < 0 ? 'Vorherige Spiele' : 'Weitere Spiele');
      b.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="' + (dir < 0 ? 'M12.5 4l-6 6 6 6' : 'M7.5 4l6 6-6 6') + '"/></svg>';
      b.addEventListener('click', function () { tilesEl.scrollBy({ left: dir * tilesEl.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); });
      car.appendChild(b);
      return b;
    }
    var carPrev = arrow(-1), carNext = arrow(1);
    var dots = document.createElement('div'); dots.className = 'mb4-car-dots'; dots.setAttribute('aria-hidden', 'true');
    car.parentNode.insertBefore(dots, car.nextSibling);
    function carState() {
      var max = tilesEl.scrollWidth - tilesEl.clientWidth, x = tilesEl.scrollLeft, on = max > 4;
      car.classList.toggle('is-scroll', on);
      carPrev.hidden = !on || x < 4; carNext.hidden = !on || x > max - 4;
      var pages = on ? Math.ceil(tilesEl.scrollWidth / tilesEl.clientWidth - 0.05) : 0;
      if (dots.children.length !== pages) { dots.innerHTML = ''; for (var i = 0; i < pages; i++) dots.appendChild(document.createElement('span')); }
      var cur = Math.round(x / (tilesEl.clientWidth || 1));
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('is-on', i === Math.min(cur, pages - 1)); });
    }
    tilesEl.addEventListener('scroll', carState, { passive: true });
    window.addEventListener('resize', carState);
    setTimeout(carState, 50);

    var first = root.getAttribute('data-start-game');
    if (!first || !tiles.some(function (t) { return t.id === first; })) first = tiles[0].id;
    select(first, false);
    if (first !== tiles[0].id) setTimeout(function () { var el = tiles.filter(function (t) { return t.id === first; })[0]._tile; tilesEl.scrollLeft = el.offsetLeft - (tilesEl.clientWidth - el.offsetWidth) / 2; }, 300);
    tiles.forEach(function (g) { drawThumb(g); loadTop(g.id); });
    S.booted = true;
    /* Solange niemand spielt: alle 30 Sekunden die aktuelle Rangliste nachladen */
    setInterval(function () {
      if (S.running || document.hidden || !S.sel) return;
      if (!form.hidden && document.activeElement === inName) return;
      loadTop(S.sel);
    }, 30000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();

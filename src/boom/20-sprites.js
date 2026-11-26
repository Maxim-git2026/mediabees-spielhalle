
  /* ------------------------------------------------------------------ Sprites (flache Bilder, die sich immer zu dir drehen) */
  function spr(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d');
    draw(g, w, h);
    return { w: w, h: h, px: new Uint32Array(g.getImageData(0, 0, w, h).data.buffer) };
  }
  function ell(g, x, y, rx, ry, fill, stroke, lw) {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.lineWidth = lw || 1.5; g.strokeStyle = stroke; g.stroke(); }
  }

  /* Wespe von vorn. o: wing 0..1, atk (Angriff), type */
  function drawWasp(g, type, o) {
    var body = type === 'feuer' ? '#FF7A1A' : '#FDC506', dark = '#141414';
    var sc = o.big ? 1.12 : 1;
    g.save(); g.translate(32, 34); g.scale(sc, sc); g.translate(-32, -34);
    if (type === 'feuer') { /* Flammen-Aura */
      for (var i = 0; i < 9; i++) { var a = i / 9 * TAU + o.wing; ell(g, 32 + Math.cos(a) * 18, 34 + Math.sin(a) * 18, 7, 9, 'rgba(255,' + (90 + i * 12) + ',20,0.45)'); }
    }
    /* Flügel */
    var wf = 0.35 + 0.65 * o.wing;
    g.save(); g.globalAlpha = 0.75;
    [[-1, 13], [1, 51]].forEach(function (s) {
      g.save(); g.translate(s[1], 20); g.rotate(s[0] * -0.5); g.scale(1, wf);
      ell(g, 0, 0, 11, 15, 'rgba(210,235,255,0.7)', '#2A2A2A', 1.2); g.restore();
    });
    g.restore();
    /* Hinterleib mit Streifen und Stachel */
    ell(g, 32, 49, 11, 12, body, dark, 2);
    g.save(); g.beginPath(); g.ellipse(32, 49, 11, 12, 0, 0, TAU); g.clip();
    g.fillStyle = dark; g.fillRect(18, 44, 30, 3); g.fillRect(18, 51, 30, 3); g.restore();
    g.fillStyle = dark; g.beginPath(); g.moveTo(29, 59); g.lineTo(35, 59); g.lineTo(32, 64); g.fill();
    /* Brust und Beinchen */
    ell(g, 32, 35, 9, 7, '#2A2018', dark, 1.5);
    g.strokeStyle = dark; g.lineWidth = 1.5;
    [[-1], [1]].forEach(function (s) { for (var k = 0; k < 2; k++) { g.beginPath(); g.moveTo(32 + s[0] * 7, 37 + k * 3); g.lineTo(32 + s[0] * 14, 42 + k * 4); g.stroke(); } });
    /* Kopf */
    ell(g, 32, 21, 12, 11, body, dark, 2);
    /* Fühler */
    g.strokeStyle = dark; g.lineWidth = 1.6; g.beginPath(); g.moveTo(27, 12); g.quadraticCurveTo(22, 4, 17, 3); g.moveTo(37, 12); g.quadraticCurveTo(42, 4, 47, 3); g.stroke();
    /* Böse Augen */
    var eye = type === 'feuer' ? '#FFE680' : '#E5322D';
    ell(g, 26, 20, 5, 6, dark); ell(g, 38, 20, 5, 6, dark);
    ell(g, 27, 21, 2, 2.4, eye); ell(g, 37, 21, 2, 2.4, eye);
    g.strokeStyle = dark; g.lineWidth = 2.4; g.beginPath(); g.moveTo(20, 13); g.lineTo(30, 17); g.moveTo(44, 13); g.lineTo(34, 17); g.stroke();
    /* Mundwerkzeuge */
    if (o.atk || type === 'kami') { ell(g, 32, 29, 4.5, 3.5, '#5A0A08', dark, 1.2); g.fillStyle = '#FFF'; g.fillRect(29, 26, 2, 2); g.fillRect(33, 26, 2, 2); }
    else { g.strokeStyle = dark; g.lineWidth = 1.8; g.beginPath(); g.moveTo(28, 28); g.lineTo(31, 31); g.moveTo(36, 28); g.lineTo(33, 31); g.stroke(); }
    /* Ausrüstung */
    if (type === 'wach') {
      g.fillStyle = '#26406B'; g.beginPath(); g.ellipse(32, 11, 12, 5, 0, PI, TAU); g.fill(); g.fillRect(20, 10, 24, 3); g.fillStyle = '#1A2A48'; g.fillRect(30, 11, 14, 2);
      g.fillStyle = '#FDC506'; g.fillRect(30, 7, 4, 3);
      /* Stachler zeigt auf dich */
      g.fillStyle = '#C98A1A'; g.fillRect(40, 38, 10, 8); g.fillStyle = '#7A4A10'; g.fillRect(42, 44, 4, 6);
      ell(g, 45, 41, 3, 3, '#111');
    } else if (type === 'flinte') {
      g.fillStyle = '#B3261E'; g.fillRect(20, 13, 24, 3); g.fillRect(43, 13, 5, 2); g.fillRect(45, 15, 3, 5);
      g.fillStyle = '#6B4A26'; g.fillRect(36, 40, 18, 7); g.fillStyle = '#3A3F46'; g.fillRect(36, 37, 18, 5);
      ell(g, 41, 39, 3, 3, '#0A0A0A', '#5E656E', 1); ell(g, 49, 39, 3, 3, '#0A0A0A', '#5E656E', 1);
    } else if (type === 'kami') {
      g.fillStyle = '#5E656E'; g.beginPath(); g.ellipse(32, 12, 12, 6, 0, PI, TAU); g.fill();
      ell(g, 32, 6, 3.2, 3.2, o.blink ? '#FF3B2F' : '#5A1410', o.blink ? '#FFD0C8' : '#111', 1);
      for (var d = 0; d < 3; d++) { g.fillStyle = '#C0281E'; g.fillRect(24 + d * 6, 31, 5, 10); g.fillStyle = '#F2D7A0'; g.fillRect(24 + d * 6, 31, 5, 2); }
      g.strokeStyle = '#E9E2D0'; g.lineWidth = 1; g.beginPath(); g.moveTo(26, 31); g.quadraticCurveTo(30, 26, 36, 29); g.stroke();
    }
    /* Mündungsfeuer */
    if (o.atk && (type === 'wach' || type === 'flinte')) {
      var mx = type === 'wach' ? 45 : 45, my = type === 'wach' ? 41 : 39, rr2 = type === 'flinte' ? 11 : 8;
      ell(g, mx, my, rr2, rr2, 'rgba(255,230,120,0.95)'); ell(g, mx, my, rr2 * 0.5, rr2 * 0.5, '#FFFFFF');
    }
    if (o.atk && type === 'feuer') { ell(g, 32, 30, 8, 8, 'rgba(255,200,60,0.9)'); ell(g, 32, 30, 4, 4, '#FFF6C0'); }
    g.restore();
  }
  /* Zerplatzen in Wachssplitter und Honig */
  function drawSplat(g, k, type) {
    var body = type === 'feuer' ? '#FF7A1A' : '#FDC506', rg = art.rng(7 + k);
    if (k < 2) {
      var s = k === 0 ? 1 : 1.6;
      ell(g, 32, 40, 14 * s, 11 * s, 'rgba(240,170,20,0.9)');
      for (var i = 0; i < 14; i++) { var a = rg() * TAU, d = (6 + rg() * 16) * s; g.fillStyle = i % 3 ? body : '#141414'; g.fillRect(32 + Math.cos(a) * d, 40 + Math.sin(a) * d * 0.8, 3 + rg() * 3, 2 + rg() * 3); }
      ell(g, 32, 40, 6 * s, 5 * s, '#FFF2B0');
    } else {
      ell(g, 32, 58, 18, 5, 'rgba(220,150,20,0.95)', '#8A5A00', 1);
      g.fillStyle = '#141414'; g.fillRect(24, 56, 4, 2); g.fillRect(37, 57, 5, 2);
      g.fillStyle = 'rgba(210,235,255,0.8)'; g.beginPath(); g.ellipse(40, 55, 5, 2, 0.3, 0, TAU); g.fill();
      g.fillStyle = body; g.fillRect(29, 55, 4, 3);
    }
  }
  function drawMite(g, o) {
    var leg = o.wing > 0.5 ? 2 : -2;
    g.strokeStyle = '#2A0E08'; g.lineWidth = 2;
    for (var i = 0; i < 4; i++) { var y = 50 + i * 3; g.beginPath(); g.moveTo(22, y); g.lineTo(10, y + 4 + (i % 2 ? leg : -leg)); g.moveTo(42, y); g.lineTo(54, y + 4 + (i % 2 ? -leg : leg)); g.stroke(); }
    ell(g, 32, 52, o.atk ? 15 : 14, o.atk ? 11 : 9, '#8A2E18', '#2A0E08', 2);
    ell(g, 28, 48, 6, 3, 'rgba(255,170,130,0.45)');
    ell(g, 32, 60, 6, 3, '#5A1A0C', '#2A0E08', 1);
    ell(g, 29, 60, 1.4, 1.4, '#FF5A3A'); ell(g, 35, 60, 1.4, 1.4, '#FF5A3A');
  }

  function makeSprites() {
    var S = {};
    ['wespe', 'wach', 'flinte', 'feuer', 'kami'].forEach(function (t) {
      S[t] = {
        fly: [spr(64, 64, function (g) { drawWasp(g, t, { wing: 1 }); }), spr(64, 64, function (g) { drawWasp(g, t, { wing: 0, blink: true }); })],
        atk: spr(64, 64, function (g) { drawWasp(g, t, { wing: 0.6, atk: true, big: t === 'wespe' || t === 'kami', blink: true }); }),
        die: [0, 1, 2].map(function (k) { return spr(64, 64, function (g) { drawSplat(g, k, t); }); })
      };
    });
    S.milbe = {
      fly: [spr(64, 64, function (g) { drawMite(g, { wing: 1 }); }), spr(64, 64, function (g) { drawMite(g, { wing: 0 }); })],
      atk: spr(64, 64, function (g) { drawMite(g, { wing: 1, atk: true }); }),
      die: [0, 1, 2].map(function (k) { return spr(64, 64, function (g) { if (k < 2) { ell(g, 32, 52, 16 + k * 5, 8, 'rgba(120,30,10,0.9)'); } ell(g, 32, 60, 14, 4, '#5A1A0C'); }); })
    };
    /* Gegenstände (unten im Bild) */
    function item(draw) { return spr(64, 64, draw); }
    S.sta10 = item(function (g) { for (var i = 0; i < 6; i++) { g.save(); g.translate(26 + i * 3, 58); g.rotate(-0.15 + i * 0.06); g.fillStyle = '#C98A1A'; g.fillRect(-1.5, -20, 3, 20); g.fillStyle = '#1A1A1A'; g.beginPath(); g.moveTo(-1.5, -20); g.lineTo(1.5, -20); g.lineTo(0, -26); g.fill(); g.restore(); } g.fillStyle = '#B3261E'; g.fillRect(24, 48, 18, 4); });
    S.sta50 = item(function (g) { g.fillStyle = '#6B4A26'; g.fillRect(14, 40, 36, 22); g.fillStyle = '#8A6232'; g.fillRect(14, 40, 36, 4); g.strokeStyle = '#3E2810'; g.lineWidth = 2; g.strokeRect(14, 40, 36, 22); pixText(g, 'STACHEL', 32, 50, 1, '#FDC506', 'center'); });
    S.pol4 = item(function (g) { for (var i = 0; i < 4; i++) { ell(g, 22 + i * 7, 56, 4, 4, '#FDC506', '#8A5A00', 1); ell(g, 21 + i * 7, 55, 1.4, 1.4, '#FFF6C0'); } });
    S.pol20 = item(function (g) { g.fillStyle = '#B3261E'; g.fillRect(16, 42, 32, 20); g.fillStyle = '#E5322D'; g.fillRect(16, 42, 32, 4); for (var i = 0; i < 4; i++) ell(g, 22 + i * 7, 52, 3, 3, '#FDC506', '#8A5A00', 1); pixText(g, 'POLLEN', 32, 56, 1, '#FFF', 'center'); });
    function gunFlinte(g) { g.fillStyle = '#3A3F46'; g.fillRect(8, 50, 40, 4); g.fillRect(8, 55, 40, 3); g.fillStyle = '#6B4A26'; g.beginPath(); g.moveTo(46, 49); g.lineTo(60, 50); g.lineTo(60, 60); g.lineTo(46, 58); g.fill(); g.fillStyle = '#FDC506'; g.fillRect(30, 49, 4, 10); }
    S.flinteItem = item(gunFlinte);
    S.stachler = item(function (g) { g.fillStyle = '#C98A1A'; g.fillRect(18, 48, 26, 8); g.fillStyle = '#7A4A10'; g.fillRect(34, 54, 8, 9); g.fillStyle = '#1A1A1A'; g.fillRect(16, 50, 3, 4); art.hex(g, 26, 52, 2.5, '#FDC506', null, 1); });
    S.tropfen = item(function (g) { g.fillStyle = '#F2A900'; g.beginPath(); g.moveTo(32, 40); g.quadraticCurveTo(42, 54, 32, 60); g.quadraticCurveTo(22, 54, 32, 40); g.fill(); ell(g, 29, 53, 2, 3, 'rgba(255,255,255,0.6)'); });
    S.glas = item(function (g) { g.fillStyle = '#E9A800'; g.fillRect(22, 42, 20, 20); g.fillStyle = '#C9A100'; g.fillRect(22, 52, 20, 10); g.fillStyle = '#B3261E'; g.fillRect(20, 38, 24, 5); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(25, 44, 3, 14); });
    S.topf = item(function (g) { ell(g, 32, 50, 16, 13, '#C47A1A', '#5A3008', 2); g.fillStyle = '#FDC506'; g.beginPath(); g.ellipse(32, 40, 14, 4, 0, 0, TAU); g.fill(); g.fillStyle = '#FDC506'; g.fillRect(24, 40, 4, 10); pixText(g, 'HONIG', 32, 50, 1, '#3A2008', 'center'); });
    S.plaett = item(function (g) { art.hex(g, 32, 54, 7, '#F2D27A', '#8A6A1A', 1.5); art.hex(g, 32, 54, 3, '#FFF0B8'); });
    S.panzer = item(function (g) { g.fillStyle = '#E9C25A'; g.beginPath(); g.moveTo(18, 36); g.lineTo(46, 36); g.lineTo(50, 46); g.lineTo(44, 62); g.lineTo(20, 62); g.lineTo(14, 46); g.fill(); g.strokeStyle = '#7A5A10'; g.lineWidth = 2; g.stroke(); for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) art.hex(g, 24 + x * 8 + (y % 2) * 4, 44 + y * 6, 3.5, null, '#9A7A20', 1); });
    S.berserk = item(function (g) { g.fillStyle = '#B3261E'; g.fillRect(20, 40, 24, 22); g.fillStyle = '#E5322D'; g.fillRect(18, 36, 28, 5); pixText(g, '!', 32, 46, 2, '#FFF', 'center'); });
    S.lampe = item(function (g) { ell(g, 32, 52, 15, 9, '#FDC506', '#7A5800', 2); g.fillStyle = '#FDC506'; g.fillRect(17, 52, 30, 6); ell(g, 32, 50, 5, 4, '#FFF6C0', '#555', 1.5); g.fillStyle = 'rgba(255,246,192,0.35)'; g.beginPath(); g.moveTo(32, 50); g.lineTo(10, 30); g.lineTo(54, 30); g.fill(); });
    S.marke = item(function (g) { ell(g, 32, 50, 10, 10, '#C99A3A', '#5A3A08', 2); ell(g, 32, 50, 6, 6, '#E5322D'); g.fillStyle = '#111'; g.fillRect(31, 40, 2, 3); pixText(g, '1', 32, 48, 1, '#FFF', 'center'); });
    S.curry = item(function (g) { g.fillStyle = '#F2F2F2'; g.beginPath(); g.moveTo(14, 52); g.lineTo(50, 52); g.lineTo(46, 62); g.lineTo(18, 62); g.fill(); ell(g, 26, 52, 10, 3.5, '#8A3A10'); g.fillStyle = '#B3261E'; g.fillRect(17, 50, 18, 2); for (var i = 0; i < 6; i++) { g.fillStyle = '#F2C94C'; g.fillRect(38 + (i % 3) * 3, 42 + Math.floor(i / 3) * 3, 2, 10); } g.fillStyle = '#FFF'; g.fillRect(36, 50, 10, 2); });
    /* Deko */
    S.stempel = spr(32, 64, function (g) { g.fillStyle = '#6B4A26'; g.fillRect(11, 0, 10, 64); g.fillStyle = '#8A6232'; g.fillRect(12, 0, 2, 64); g.fillStyle = '#4A3218'; g.fillRect(19, 0, 2, 64); g.fillStyle = '#5A3E1E'; g.fillRect(2, 0, 28, 6); g.fillStyle = '#3E2810'; g.fillRect(2, 6, 28, 1); for (var y = 10; y < 64; y += 12) { g.fillStyle = '#3E2810'; g.fillRect(13, y, 6, 1); } });
    S.lore = spr(64, 48, function (g) { g.fillStyle = '#16120F'; ell(g, 32, 14, 26, 6, '#16120F'); for (var i = 0; i < 9; i++) ell(g, 12 + i * 5, 12 + (i % 3), 4, 3, '#26262C'); g.fillStyle = '#5E646C'; g.beginPath(); g.moveTo(4, 14); g.lineTo(60, 14); g.lineTo(54, 40); g.lineTo(10, 40); g.fill(); g.fillStyle = '#7A5030'; g.fillRect(6, 18, 52, 3); g.fillRect(8, 30, 48, 3); g.fillStyle = '#3C4148'; g.fillRect(4, 14, 56, 2); ell(g, 16, 42, 5, 5, '#222', '#555', 1.5); ell(g, 48, 42, 5, 5, '#222', '#555', 1.5); pixText(g, 'GLÜCK AUF', 32, 23, 1, '#FDC506', 'center'); });
    S.fass = spr(48, 64, function (g) { g.fillStyle = '#C9A100'; g.fillRect(8, 14, 32, 48); for (var y = 18; y < 60; y += 10) { g.fillStyle = '#1A1A1A'; g.fillRect(8, y, 32, 4); } g.fillStyle = '#E9C200'; g.fillRect(10, 14, 4, 48); g.fillStyle = '#5A4800'; g.fillRect(36, 14, 4, 48); ell(g, 24, 14, 16, 4, '#8A7000', '#3A3000', 1); g.fillStyle = '#F2F2F2'; g.fillRect(14, 34, 20, 9); pixText(g, 'CH4', 24, 36, 1, '#B3261E', 'center'); });
    S.fassBoom = [0, 1, 2].map(function (k) { return spr(64, 64, function (g) { var r = 12 + k * 9; ell(g, 32, 34, r + 6, r + 4, 'rgba(255,80,20,' + (0.8 - k * 0.2) + ')'); ell(g, 32, 34, r, r * 0.8, 'rgba(255,200,60,' + (0.95 - k * 0.25) + ')'); ell(g, 32, 34, r * 0.45, r * 0.4, 'rgba(255,255,220,' + (1 - k * 0.3) + ')'); }); });
    S.licht = spr(32, 64, function (g) { g.strokeStyle = '#222'; g.lineWidth = 1; g.beginPath(); g.moveTo(16, 0); g.lineTo(16, 18); g.stroke(); g.fillStyle = '#3A3F46'; g.beginPath(); g.moveTo(8, 22); g.lineTo(24, 22); g.lineTo(20, 18); g.lineTo(12, 18); g.fill(); ell(g, 16, 25, 5, 4, '#FFF6C0'); g.strokeStyle = '#3A3F46'; g.beginPath(); g.moveTo(11, 23); g.lineTo(13, 29); g.moveTo(21, 23); g.lineTo(19, 29); g.moveTo(16, 23); g.lineTo(16, 30); g.stroke(); });
    /* Feuerball, Treffer, Explosion */
    S.ball = [0, 1].map(function (k) { return spr(32, 32, function (g) { ell(g, 16, 16, 12 - k, 12 - k, 'rgba(255,90,20,0.85)'); ell(g, 16 + k, 16, 7, 7, '#FFC23A'); ell(g, 15, 15, 3, 3, '#FFF6C0'); }); });
    S.puff = [0, 1, 2].map(function (k) { return spr(16, 16, function (g) { ell(g, 8, 8, 2 + k * 2, 2 + k * 2, 'rgba(200,190,170,' + (0.9 - k * 0.25) + ')'); if (!k) ell(g, 8, 8, 2, 2, '#FFE680'); }); });
    S.spritz = [0, 1, 2].map(function (k) { return spr(16, 16, function (g) { for (var i = 0; i < 5; i++) { var a = i / 5 * TAU; g.fillStyle = '#F2A900'; g.fillRect(8 + Math.cos(a) * (2 + k * 2.5), 8 + Math.sin(a) * (2 + k * 2.5), 2, 2); } }); });
    return S;
  }

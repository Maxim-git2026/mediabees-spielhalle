
  /* ------------------------------------------------------------------ Texturen (64 × 64, im Code gezeichnet) */
  var TS = 64;
  function texCanvas(draw) {
    var c = document.createElement('canvas'); c.width = TS; c.height = TS;
    var g = c.getContext('2d');
    draw(g, art.rng(Math.floor(Math.random() * 1e6)));
    return new Uint32Array(g.getImageData(0, 0, TS, TS).data.buffer);
  }
  function noise(g, rg, n, cols, a) {
    for (var i = 0; i < n; i++) { g.globalAlpha = (a || 0.25) * rg(); g.fillStyle = cols[Math.floor(rg() * cols.length)]; g.fillRect(Math.floor(rg() * TS), Math.floor(rg() * TS), 1 + Math.floor(rg() * 2), 1 + Math.floor(rg() * 2)); }
    g.globalAlpha = 1;
  }
  function rivet(g, x, y) { g.fillStyle = '#2A2A2A'; g.fillRect(x, y, 3, 3); g.fillStyle = '#B8BCC4'; g.fillRect(x, y, 2, 2); }

  function makeTextures() {
    var T = {};
    /* Fels mit Kohleflöz und Holzverbau */
    T['#'] = texCanvas(function (g, rg) {
      g.fillStyle = '#4A4038'; g.fillRect(0, 0, TS, TS);
      noise(g, rg, 900, ['#2E2722', '#5C5046', '#6B5E52', '#3A322C'], 0.8);
      g.fillStyle = '#16120F'; g.fillRect(0, 26, TS, 7); noise(g, rg, 60, ['#000', '#2B2B33', '#55555F'], 0.9);
      g.fillStyle = 'rgba(120,120,140,0.35)'; for (var i = 0; i < 8; i++) g.fillRect(Math.floor(rg() * TS), 27 + Math.floor(rg() * 5), 2, 1);
      /* Stempel links und rechts, Kappe oben */
      g.fillStyle = '#6B4A26'; g.fillRect(0, 0, 7, TS); g.fillRect(57, 0, 7, TS); g.fillRect(0, 0, TS, 6);
      g.fillStyle = '#4A3218'; g.fillRect(6, 0, 1, TS); g.fillRect(57, 0, 1, TS); g.fillRect(0, 6, TS, 1);
      g.fillStyle = '#8A6232'; g.fillRect(1, 0, 1, TS); g.fillRect(59, 0, 1, TS); g.fillRect(0, 1, TS, 1);
    });
    /* Fliesen der Waschkaue */
    T.T = texCanvas(function (g, rg) {
      g.fillStyle = '#7C8A86'; g.fillRect(0, 0, TS, TS);
      for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
        var low = y >= 5, base = low ? [74, 110, 98] : [206, 214, 206], d = Math.floor(rg() * 18) - 9;
        g.fillStyle = 'rgb(' + (base[0] + d) + ',' + (base[1] + d) + ',' + (base[2] + d) + ')';
        g.fillRect(x * 8 + 1, y * 8 + 1, 7, 7);
        if (rg() < 0.06) { g.fillStyle = '#5A625E'; g.fillRect(x * 8 + 2, y * 8 + 3, 5, 1); g.fillRect(x * 8 + 4, y * 8 + 1, 1, 6); }
      }
      g.fillStyle = 'rgba(70,50,20,0.35)'; for (var i = 0; i < 6; i++) g.fillRect(Math.floor(rg() * TS), 40 + Math.floor(rg() * 8), 1, 8 + Math.floor(rg() * 16));
    });
    /* Spinde */
    T.L = texCanvas(function (g, rg) {
      for (var i = 0; i < 2; i++) {
        var x = i * 32;
        g.fillStyle = i ? '#5B7186' : '#4F6578'; g.fillRect(x, 0, 32, TS);
        g.fillStyle = '#2B3846'; g.fillRect(x, 0, 1, TS); g.fillRect(x + 31, 0, 1, TS); g.fillRect(x, 0, 32, 2); g.fillRect(x, 62, 32, 2);
        g.fillStyle = '#7F95A8'; g.fillRect(x + 1, 2, 1, 60);
        for (var k = 0; k < 4; k++) { g.fillStyle = '#26323E'; g.fillRect(x + 8, 6 + k * 3, 16, 1); }
        g.fillStyle = '#D9DDE2'; g.fillRect(x + 11, 22, 10, 5); g.fillStyle = '#333'; g.fillRect(x + 13, 24, 6, 1);
        g.fillStyle = '#C9CED6'; g.fillRect(x + 25, 30, 2, 8); g.fillStyle = '#2B3846'; g.fillRect(x + 27, 30, 1, 8);
        if (rg() < 0.7) { g.fillStyle = 'rgba(60,40,20,0.5)'; g.fillRect(x + 4 + Math.floor(rg() * 20), 44 + Math.floor(rg() * 10), 4, 3); }
      }
      noise(g, rg, 200, ['#1E2830', '#8FA3B3'], 0.3);
    });
    /* Holzverschalung */
    T.W = texCanvas(function (g, rg) {
      for (var i = 0; i < 4; i++) {
        var d = Math.floor(rg() * 24) - 12;
        g.fillStyle = 'rgb(' + (118 + d) + ',' + (80 + d) + ',' + (44 + d) + ')'; g.fillRect(i * 16, 0, 16, TS);
        g.fillStyle = '#3E2810'; g.fillRect(i * 16, 0, 1, TS);
        for (var k = 0; k < 7; k++) { g.fillStyle = 'rgba(70,44,18,0.6)'; g.fillRect(i * 16 + 2 + Math.floor(rg() * 12), Math.floor(rg() * TS), 1, 6 + Math.floor(rg() * 14)); }
        g.fillStyle = '#9DA3AA'; g.fillRect(i * 16 + 3, 4, 1, 1); g.fillRect(i * 16 + 12, 4, 1, 1); g.fillRect(i * 16 + 3, 58, 1, 1); g.fillRect(i * 16 + 12, 58, 1, 1);
      }
      g.fillStyle = '#4A3016'; g.fillRect(0, 30, TS, 4); g.fillStyle = '#6E4A22'; g.fillRect(0, 30, TS, 1);
    });
    /* Backstein */
    T.B = texCanvas(function (g, rg) {
      g.fillStyle = '#5A4A40'; g.fillRect(0, 0, TS, TS);
      for (var y = 0; y < 8; y++) for (var x = -1; x < 4; x++) {
        var off = y % 2 ? 8 : 0, d = Math.floor(rg() * 30) - 15;
        g.fillStyle = 'rgb(' + (150 + d) + ',' + (62 + d / 2) + ',' + (44 + d / 3) + ')';
        g.fillRect(x * 16 + off + 1, y * 8 + 1, 15, 7);
        g.fillStyle = 'rgba(255,200,170,0.15)'; g.fillRect(x * 16 + off + 1, y * 8 + 1, 15, 1);
      }
      noise(g, rg, 400, ['#2A1A14', '#B0705A'], 0.35);
    });
    /* Metallplatten mit Nieten und Warnstreifen */
    T.M = texCanvas(function (g, rg) {
      g.fillStyle = '#5E646C'; g.fillRect(0, 0, TS, TS);
      g.fillStyle = '#6C737C'; g.fillRect(1, 1, 30, 46); g.fillRect(33, 1, 30, 46);
      g.fillStyle = '#3C4148'; g.fillRect(31, 0, 2, 48); g.fillRect(0, 47, TS, 2);
      [[3, 3], [26, 3], [3, 41], [26, 41], [35, 3], [58, 3], [35, 41], [58, 41]].forEach(function (p) { rivet(g, p[0], p[1]); });
      for (var x = -16; x < TS; x += 10) { g.fillStyle = '#FDC506'; g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 5, 64); g.lineTo(x + 20, 49); g.lineTo(x + 15, 49); g.fill(); }
      g.fillStyle = '#1A1A1A'; g.fillRect(0, 49, TS, 1);
      noise(g, rg, 250, ['#3A2A1A', '#8A5A30', '#2A2E33'], 0.45);
    });
    /* Förderkorb-Gitter */
    T.K = texCanvas(function (g) {
      g.fillStyle = '#0D0D10'; g.fillRect(0, 0, TS, TS);
      g.fillStyle = '#3A3F46'; for (var x = 2; x < TS; x += 8) g.fillRect(x, 0, 2, TS);
      for (var y = 4; y < TS; y += 12) g.fillRect(0, y, TS, 2);
      g.fillStyle = '#E9A800'; g.fillRect(0, 0, TS, 4); g.fillRect(0, 60, TS, 4); g.fillRect(0, 0, 3, TS); g.fillRect(61, 0, 3, TS);
      g.fillStyle = '#7A5800'; g.fillRect(0, 3, TS, 1); g.fillRect(0, 60, TS, 1);
    });
    /* Tür mit Warnstreifen und Sichtfenster */
    function door(red) {
      return texCanvas(function (g, rg) {
        g.fillStyle = '#4E545C'; g.fillRect(0, 0, TS, TS);
        g.fillStyle = '#5E656E'; g.fillRect(3, 3, 58, 58);
        g.fillStyle = '#23272C'; g.fillRect(22, 10, 20, 12); g.fillStyle = red ? '#5A1410' : '#14202A'; g.fillRect(24, 12, 16, 8);
        g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(25, 13, 6, 2);
        for (var x = -16; x < TS; x += 12) { g.fillStyle = red ? '#E5322D' : '#FDC506'; g.beginPath(); g.moveTo(x, 54); g.lineTo(x + 6, 54); g.lineTo(x + 14, 44); g.lineTo(x + 8, 44); g.fill(); }
        g.fillStyle = '#1A1A1A'; g.fillRect(3, 43, 58, 1); g.fillRect(3, 54, 58, 1);
        if (red) { g.beginPath(); g.arc(32, 32, 6, 0, TAU); g.fillStyle = '#E5322D'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#3A0A08'; g.stroke(); g.fillStyle = '#FFD7D2'; g.fillRect(30, 30, 2, 2); }
        else { g.fillStyle = '#2A2E33'; g.fillRect(48, 28, 6, 10); g.fillStyle = '#C9CED6'; g.fillRect(49, 29, 4, 3); }
        [[5, 5], [56, 5], [5, 56], [56, 56]].forEach(function (p) { rivet(g, p[0], p[1]); });
        noise(g, rg, 180, ['#2A2E33', '#7A5030'], 0.4);
      });
    }
    T.D = door(false); T.R = door(true);
    /* Türrahmen (Seitenwand neben Türen) */
    T.J = texCanvas(function (g, rg) {
      g.fillStyle = '#3C4148'; g.fillRect(0, 0, TS, TS);
      g.fillStyle = '#545B63'; g.fillRect(8, 0, 48, TS);
      for (var y = 4; y < TS; y += 14) rivet(g, 30, y);
      noise(g, rg, 120, ['#22262B', '#6E757E'], 0.4);
    });
    /* Ausgangsschalter: aus / an */
    function lever(on) {
      return texCanvas(function (g) {
        g.drawImage(texToCanvas(T.K), 0, 0);
        g.fillStyle = '#3C4148'; g.fillRect(14, 10, 36, 44); g.fillStyle = '#5E656E'; g.fillRect(16, 12, 32, 40);
        g.fillStyle = on ? '#3BE06A' : '#E5322D'; g.beginPath(); g.arc(32, 18, 4, 0, TAU); g.fill();
        g.fillStyle = '#1A1A1A'; g.fillRect(29, 26, 6, 22);
        g.save(); g.translate(32, 44); g.rotate(on ? 0.7 : -0.7); g.fillStyle = '#C9CED6'; g.fillRect(-2, -18, 4, 18); g.fillStyle = '#E5322D'; g.beginPath(); g.arc(0, -19, 4, 0, TAU); g.fill(); g.restore();
        pixText(g, on ? 'AUF' : 'AB', 32, 55, 1, '#FDC506', 'center');
      });
    }
    T.X = lever(false); T.X2 = lever(true);
    /* Poster (Insider) auf Backstein */
    var POSTERS = [
      function (g) { g.fillStyle = '#F1E9D2'; g.fillRect(10, 6, 44, 50); pixText(g, 'MITARB.', 32, 9, 1, '#222', 'center'); pixText(g, 'D.MONATS', 32, 15, 1, '#222', 'center'); g.fillStyle = '#FDC506'; g.beginPath(); g.arc(32, 32, 9, 0, TAU); g.fill(); g.fillStyle = '#3A2410'; g.fillRect(28, 30, 2, 2); g.fillRect(34, 30, 2, 2); g.fillRect(29, 35, 6, 1); pixText(g, 'SPRÜCHE-', 32, 44, 1, '#B3261E', 'center'); pixText(g, 'KLOPFER', 32, 50, 1, '#B3261E', 'center'); },
      function (g) { g.fillStyle = '#1A1A1A'; g.fillRect(8, 10, 48, 40); g.fillStyle = '#FDC506'; g.fillRect(10, 12, 44, 36); pixText(g, 'GLÜCK', 32, 18, 2, '#1A1A1A', 'center'); pixText(g, 'AUF!', 32, 32, 2, '#1A1A1A', 'center'); },
      function (g) { pixText(g, 'DIE', 32, 14, 2, '#F2F2F2', 'center'); pixText(g, 'MASCHINE', 32, 27, 1, '#3BE06A', 'center'); pixText(g, 'WAR HIER', 32, 36, 1, '#F2F2F2', 'center'); g.strokeStyle = '#FF8AD8'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 48); g.lineTo(54, 44); g.stroke(); },
      function (g) { g.fillStyle = '#F1E9D2'; g.fillRect(9, 8, 46, 48); g.fillStyle = '#E5322D'; g.fillRect(9, 8, 46, 10); pixText(g, 'ACHTUNG', 32, 11, 1, '#FFF', 'center'); art.wasp && (function () { g.save(); g.translate(32, 33); g.scale(0.35, 0.35); art.wasp(g, 0.3); g.restore(); })(); pixText(g, 'HELM AUF!', 32, 47, 1, '#222', 'center'); },
      function (g) { g.fillStyle = '#F1E9D2'; g.fillRect(10, 6, 44, 50); pixText(g, 'GESUCHT', 32, 9, 1, '#222', 'center'); g.fillStyle = '#FDC506'; g.beginPath(); g.arc(32, 28, 9, 0, TAU); g.fill(); g.fillStyle = '#111'; g.fillRect(25, 26, 14, 3); pixText(g, 'ALLES-', 32, 42, 1, '#222', 'center'); pixText(g, 'MACHER', 32, 48, 1, '#222', 'center'); }
    ];
    T.posters = POSTERS.map(function (draw) { return texCanvas(function (g) { g.drawImage(texToCanvas(T.B), 0, 0); draw(g); }); });
    /* Geheimwände: gleiche Wand, aber mit feinem Riss */
    T.secret = {};
    ['W', 'B', 'M', '#', 'T'].forEach(function (k) {
      T.secret[k] = texCanvas(function (g) {
        g.drawImage(texToCanvas(T[k]), 0, 0);
        g.strokeStyle = 'rgba(10,8,6,0.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(30, 6); g.lineTo(33, 18); g.lineTo(29, 30); g.lineTo(34, 41); g.lineTo(31, 56); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(31, 6); g.lineTo(34, 18); g.lineTo(30, 30); g.stroke();
      });
    });

    /* Böden und Decken */
    var F = {};
    F.erde = texCanvas(function (g, rg) { g.fillStyle = '#3A3028'; g.fillRect(0, 0, TS, TS); noise(g, rg, 1100, ['#241D18', '#4E4236', '#1A1612', '#5A4C3E'], 0.8); });
    F.fels = texCanvas(function (g, rg) { g.fillStyle = '#2C2622'; g.fillRect(0, 0, TS, TS); noise(g, rg, 900, ['#1A1613', '#3A322C', '#45392F'], 0.8); g.fillStyle = '#4A3218'; g.fillRect(0, 28, TS, 8); g.fillStyle = '#6B4A26'; g.fillRect(0, 29, TS, 2); });
    F.fliese = texCanvas(function (g, rg) { g.fillStyle = '#5E6A66'; g.fillRect(0, 0, TS, TS); for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) { var d = Math.floor(rg() * 14); g.fillStyle = (x + y) % 2 ? 'rgb(' + (150 + d) + ',' + (160 + d) + ',' + (154 + d) + ')' : 'rgb(' + (120 + d) + ',' + (130 + d) + ',' + (126 + d) + ')'; g.fillRect(x * 4, y * 4, 3, 3); } noise(g, rg, 120, ['#3A3020'], 0.4); });
    F.beton = texCanvas(function (g, rg) { g.fillStyle = '#5A5856'; g.fillRect(0, 0, TS, TS); noise(g, rg, 1200, ['#4A4846', '#6A6866', '#3E3C3A'], 0.6); g.fillStyle = '#44423F'; g.fillRect(0, 0, TS, 1); g.fillRect(0, 0, 1, TS); });
    F.dielen = texCanvas(function (g, rg) { for (var i = 0; i < 8; i++) { var d = Math.floor(rg() * 20) - 10; g.fillStyle = 'rgb(' + (96 + d) + ',' + (64 + d) + ',' + (36 + d) + ')'; g.fillRect(0, i * 8, TS, 8); g.fillStyle = '#2E1C0A'; g.fillRect(0, i * 8, TS, 1); g.fillRect(Math.floor(rg() * 60), i * 8, 1, 8); } });
    F.balken = texCanvas(function (g, rg) { g.fillStyle = '#2A1E12'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#6B4A26'; g.fillRect(0, 0, 14, TS); g.fillRect(32, 0, 14, TS); g.fillStyle = '#4A3218'; g.fillRect(13, 0, 1, TS); g.fillRect(45, 0, 1, TS); noise(g, rg, 200, ['#1A1208'], 0.5); });
    F.gitter = texCanvas(function (g) { g.fillStyle = '#16181B'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#4A5058'; for (var i = 0; i < TS; i += 8) { g.fillRect(i, 0, 2, TS); g.fillRect(0, i, TS, 2); } });
    F.streifen = texCanvas(function (g, rg) { g.drawImage(texToCanvas(F.beton), 0, 0); g.fillStyle = '#C9A100'; g.fillRect(28, 0, 8, TS); noise(g, rg, 80, ['#3A3020'], 0.6); });
    F.platte = texCanvas(function (g, rg) { g.fillStyle = '#4A4E54'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#565B62'; g.fillRect(1, 1, 30, 30); g.fillRect(33, 33, 30, 30); g.fillStyle = '#3E4247'; g.fillRect(33, 1, 30, 30); g.fillRect(1, 33, 30, 30); for (var i = 0; i < 30; i++) { g.fillStyle = '#6A7078'; g.fillRect(4 + (i % 6) * 4, 4 + Math.floor(i / 6) * 5, 2, 1); } noise(g, rg, 200, ['#2A2E33', '#7A5030'], 0.4); });
    F.traeger = texCanvas(function (g) { g.fillStyle = '#141619'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#3C4148'; g.fillRect(0, 26, TS, 12); g.fillStyle = '#2A2E33'; g.fillRect(0, 31, TS, 2); g.fillStyle = '#E9A800'; g.fillRect(26, 0, 12, TS); g.fillStyle = '#7A5800'; g.fillRect(31, 0, 2, TS); });
    T.flats = F;
    return T;
  }
  /* Textur zurück in eine Leinwand (zum Weiterzeichnen) */
  function texToCanvas(tex) {
    var c = document.createElement('canvas'); c.width = TS; c.height = TS;
    var g = c.getContext('2d'), id = g.createImageData(TS, TS);
    new Uint32Array(id.data.buffer).set(tex);
    g.putImageData(id, 0, 0);
    return c;
  }

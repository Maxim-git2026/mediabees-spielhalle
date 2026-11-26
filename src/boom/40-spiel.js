
  /* ------------------------------------------------------------------ Gesicht in der Statusleiste */
  /* Hautfarben zur Auswahl (Kopf der Biene). Standard steht in FACE_SKIN */
  var SKINS = { braun: ['#3A2410', '#2A1C10', '#F7B500'], honig: ['#E9A23B', '#B87A20', '#5A2A08'], hell: ['#F2C9A0', '#D9A980', '#7A3A1A'] };
  var FACE_SKIN = 'braun';
  /* f: { look -1..1, hurt 0..4, pain, grin, rage, dead, ouch, smirk, skin } – Grundausdruck grimmig wie die Helden der 90er */
  function drawFace(g, cx, cy, s, f) {
    var sk = SKINS[f.skin || FACE_SKIN] || SKINS.braun, line = sk[2];
    g.save(); g.translate(cx, cy); g.scale(s, s);
    if (f.dead) g.rotate(0.25);
    /* Fühler */
    g.strokeStyle = '#111'; g.lineWidth = 2.2; g.lineCap = 'round';
    var bent = f.hurt >= 3;
    g.beginPath(); g.moveTo(-6, -14); g.quadraticCurveTo(-11, -24, -15, -25); g.moveTo(6, -14); g.quadraticCurveTo(bent ? 14 : 11, bent ? -18 : -24, bent ? 19 : 15, bent ? -17 : -25); g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.arc(-15, -25, 2.4, 0, TAU); g.arc(bent ? 19 : 15, bent ? -17 : -25, 2.4, 0, TAU); g.fill();
    /* Kopf */
    g.beginPath(); g.arc(0, 2, 17, 0, TAU);
    g.fillStyle = f.rage ? '#9A2A18' : f.dead ? sk[1] : sk[0]; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#111'; g.stroke();
    /* Bartstoppeln / Schatten unten (hart wie ein Kumpel) */
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(0, 12, 11, 6, 0, 0, TAU); g.fill();
    /* Grubenhelm mit Lampe */
    g.save(); if (f.dead) g.rotate(-0.4);
    g.beginPath(); g.ellipse(0, -8, 19, 13, 0, PI, TAU); g.fillStyle = '#F2C200'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#C99A00'; g.fillRect(-21, -9, 42, 4); g.strokeRect(-21, -9, 42, 4);
    g.fillStyle = '#5E646C'; g.fillRect(-5, -20, 10, 7); g.fillStyle = f.dead ? '#555' : '#FFF6C0'; g.beginPath(); g.arc(0, -16.5, 3, 0, TAU); g.fill();
    if (f.hurt >= 2) { g.strokeStyle = '#7A5A00'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(9, -16); g.lineTo(12, -11); g.lineTo(10, -8); g.stroke(); }
    g.restore();
    var lx = clamp(f.look, -1, 1) * 2.4;
    if (f.dead) {
      g.strokeStyle = '#FFF'; g.lineWidth = 2;
      [[-6, 3], [6, 3]].forEach(function (e) { g.beginPath(); g.moveTo(e[0] - 3, e[1] - 3); g.lineTo(e[0] + 3, e[1] + 3); g.moveTo(e[0] + 3, e[1] - 3); g.lineTo(e[0] - 3, e[1] + 3); g.stroke(); });
      g.fillStyle = '#E86A8A'; g.beginPath(); g.ellipse(3, 13, 3, 4, 0.3, 0, TAU); g.fill();
      g.strokeStyle = line; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, 11); g.lineTo(6, 11); g.stroke();
    } else if (f.pain) {
      g.strokeStyle = '#FFF'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-9, 1); g.lineTo(-4, 3); g.lineTo(-9, 5); g.moveTo(9, 1); g.lineTo(4, 3); g.lineTo(9, 5); g.stroke();
      g.fillStyle = '#5A0A08'; g.beginPath(); g.ellipse(0, 12, f.ouch ? 4 : 5, f.ouch ? 4.5 : 2.5, 0, 0, TAU); g.fill();
      if (!f.ouch) { g.fillStyle = '#FFF'; g.fillRect(-4, 11, 8, 1.4); }
    } else {
      /* Augen: leicht zusammengekniffen, entschlossen */
      var half = f.hurt >= 4 ? 0.5 : f.rampage ? 0.7 : f.grin ? 0.9 : 0.82;
      [-6, 6].forEach(function (ex, i) {
        var sd = i ? -1 : 1;
        g.fillStyle = '#FFF'; g.beginPath(); g.ellipse(ex, 3.4, 4.2, 4.6 * half, 0, 0, TAU); g.fill();
        g.fillStyle = '#111'; g.beginPath(); g.arc(ex + lx, 3.8, 2, 0, TAU); g.fill();
        /* Augenbrauen: immer schräg nach innen (grimmig), beim fiesen Grinsen noch steiler */
        var hard = f.grin || f.rage || f.rampage;
        g.strokeStyle = '#111'; g.lineWidth = hard ? 2.4 : 2.1;
        g.beginPath(); g.moveTo(ex - 5 * sd, hard ? -3.2 : -2.4); g.lineTo(ex + 4 * sd, hard ? -0.4 : -1.2); g.stroke();
      });
      if (f.hurt >= 3) { g.fillStyle = 'rgba(120,60,140,0.8)'; g.beginPath(); g.ellipse(6, 3.4, 6, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#FFF'; g.beginPath(); g.ellipse(6, 3.4, 3.5, 2.2, 0, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(6 + lx, 3.6, 1.6, 0, TAU); g.fill(); }
      /* Mund */
      if (f.rampage) {
        /* Dauerfeuer: Comic-Kampfschrei (offener Mund, oben eine Zahnreihe) – wütend, aber kindgerecht */
        g.fillStyle = '#5A1A10'; g.beginPath(); g.ellipse(0, 12.5, 5.5, 4.2, 0, 0, TAU); g.fill();
        g.fillStyle = '#FFF'; g.fillRect(-4, 9.2, 8, 1.8);
        g.fillStyle = '#E86A8A'; g.beginPath(); g.ellipse(0, 15, 3, 1.4, 0, 0, TAU); g.fill();
      } else if (f.grin) {
        g.fillStyle = '#111'; g.beginPath(); g.moveTo(-9, 9); g.quadraticCurveTo(0, 19, 9, 9); g.closePath(); g.fill();
        g.fillStyle = '#FFF'; for (var t = -7; t < 7; t += 3.4) g.fillRect(t, 9.6, 2.4, 2.6);
      } else if (f.rage || f.hurt >= 2) {
        /* zusammengebissene Zähne (weich gezeichnet) */
        g.fillStyle = '#FFF'; art.rrect(g, -6, 10, 12, 4, 2); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.2; g.stroke();
        g.beginPath(); g.moveTo(-6, 12); g.lineTo(6, 12); g.moveTo(-2, 10); g.lineTo(-2, 14); g.moveTo(2, 10); g.lineTo(2, 14); g.stroke();
      } else if (f.smirk) {
        g.strokeStyle = line; g.lineWidth = 1.9; g.beginPath(); g.moveTo(-5, 11.5); g.lineTo(2, 11.5); g.quadraticCurveTo(5, 11.2, 6.5, 9); g.stroke();
      } else {
        g.strokeStyle = line; g.lineWidth = 1.9; g.beginPath(); g.moveTo(-5.5, 12.2); g.quadraticCurveTo(0, 10.6, 5.5, 12.2); g.stroke();
      }
    }
    /* Pflaster und Kratzer */
    if (f.hurt >= 1 && !f.dead) { g.save(); g.translate(-11, -2); g.rotate(-0.6); g.fillStyle = '#F2D7B0'; g.fillRect(-5, -2, 10, 4); g.fillStyle = '#C9A880'; g.fillRect(-1, -2, 2, 4); g.restore(); }
    if (f.hurt >= 2 && !f.dead) { g.strokeStyle = '#B3261E'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(10, 9); g.lineTo(14, 13); g.stroke(); }
    g.restore();
  }

  /* ------------------------------------------------------------------ Waffen in der Hand (auf den kleinen Puffer gezeichnet = Pixel-Look) */
  function glove(g, x, y, r, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.fillStyle = '#8A5A2A'; g.beginPath(); g.ellipse(0, 0, r, r * 0.85, 0, 0, TAU); g.fill(); g.strokeStyle = '#3A2410'; g.lineWidth = Math.max(1, r * 0.12); g.stroke(); g.fillStyle = '#A8763E'; for (var i = 0; i < 3; i++) g.fillRect(-r * 0.6 + i * r * 0.42, -r * 0.7, r * 0.3, r * 0.5); g.restore(); }
  function sleeve(g, x0, y0, x1, y1, w) {
    g.save(); g.lineCap = 'butt';
    var n = 6;
    for (var i = 0; i < n; i++) { var t0 = i / n, t1 = (i + 1) / n; g.strokeStyle = i % 2 ? '#141414' : '#FDC506'; g.lineWidth = w; g.beginPath(); g.moveTo(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0); g.lineTo(x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1); g.stroke(); }
    g.restore();
  }
  function drawWeapon(g, W, H, wp, o) {
    var u = Math.min(W / 320, H / 170), bx = o.bobX * u, by = o.bobY * u + o.lower * 70 * u;
    g.save(); g.translate(bx, by);
    if (wp === 0) {
      var p = o.anim; /* 0..1 Schlag */
      var k = p > 0 ? Math.sin(Math.min(1, p / 0.6) * PI) : 0;
      var fx = W * 0.66 - k * W * 0.16, fy = H - 22 * u - k * 34 * u, fr = (17 + k * 7) * u;
      sleeve(g, W * 0.95, H + 10 * u, fx + 10 * u, fy + 12 * u, 20 * u);
      glove(g, fx, fy, fr, -0.3 - k * 0.2);
      if (o.rage) { g.globalAlpha = 0.35; g.fillStyle = '#E5322D'; g.beginPath(); g.arc(fx, fy, fr * 1.2, 0, TAU); g.fill(); g.globalAlpha = 1; }
      /* zweite Faust links, ruhend */
      sleeve(g, W * 0.05, H + 10 * u, W * 0.22, H - 8 * u, 18 * u); glove(g, W * 0.24, H - 10 * u, 14 * u, 0.4);
    } else if (wp === 1) {
      var r1 = o.anim > 0 ? Math.max(0, 1 - o.anim * 2.5) : 0, cx = W * 0.56, cy = H - 30 * u + r1 * 10 * u;
      if (o.flash) { g.fillStyle = 'rgba(255,230,120,0.95)'; g.beginPath(); g.arc(cx, cy - 34 * u, 13 * u, 0, TAU); g.fill(); g.fillStyle = '#FFF'; g.beginPath(); g.arc(cx, cy - 34 * u, 6 * u, 0, TAU); g.fill(); }
      sleeve(g, W * 0.78, H + 12 * u, cx + 8 * u, cy + 18 * u, 18 * u);
      g.fillStyle = '#C98A1A'; g.beginPath(); g.moveTo(cx - 9 * u, cy - 26 * u); g.lineTo(cx + 9 * u, cy - 26 * u); g.lineTo(cx + 13 * u, cy + 6 * u); g.lineTo(cx - 13 * u, cy + 6 * u); g.fill();
      g.strokeStyle = '#5A3008'; g.lineWidth = Math.max(1, 1.4 * u); g.stroke();
      g.fillStyle = '#E9A800'; g.fillRect(cx - 7 * u, cy - 24 * u, 3 * u, 26 * u);
      art.hex(g, cx + 2 * u, cy - 10 * u, 4 * u, '#FDC506', '#7A4A10', Math.max(1, u));
      g.fillStyle = '#1A1A1A'; g.fillRect(cx - 2 * u, cy - 30 * u, 4 * u, 5 * u);
      glove(g, cx + 2 * u, cy + 10 * u, 13 * u, 0.1);
    } else {
      var r2 = o.anim > 0 ? Math.max(0, 1 - o.anim * 3) : 0, rl = o.reload, cy2 = H - 18 * u + r2 * 14 * u + rl * 30 * u, cx2 = W * 0.5;
      g.save(); g.translate(cx2, cy2); g.rotate(rl * 0.35);
      if (o.flash) { g.fillStyle = 'rgba(255,220,110,0.95)'; g.beginPath(); g.ellipse(0, -66 * u, 30 * u, 20 * u, 0, 0, TAU); g.fill(); g.fillStyle = '#FFF6C0'; g.beginPath(); g.ellipse(0, -64 * u, 14 * u, 10 * u, 0, 0, TAU); g.fill(); }
      /* zwei Läufe in Perspektive */
      g.fillStyle = '#2E3238'; g.beginPath(); g.moveTo(-15 * u, 8 * u); g.lineTo(15 * u, 8 * u); g.lineTo(7 * u, -58 * u); g.lineTo(-7 * u, -58 * u); g.fill();
      g.fillStyle = '#4A5058'; g.beginPath(); g.moveTo(-13 * u, 8 * u); g.lineTo(-1 * u, 8 * u); g.lineTo(-1 * u, -58 * u); g.lineTo(-6 * u, -58 * u); g.fill();
      g.fillStyle = '#0A0A0A'; g.beginPath(); g.arc(-3.5 * u, -58 * u, 3 * u, 0, TAU); g.arc(3.5 * u, -58 * u, 3 * u, 0, TAU); g.fill();
      g.fillStyle = '#FDC506'; g.fillRect(-1 * u, -40 * u, 2 * u, 34 * u);
      /* Vorderschaft aus Holz */
      g.fillStyle = '#7A5030'; g.beginPath(); g.moveTo(-20 * u, -6 * u); g.lineTo(20 * u, -6 * u); g.lineTo(16 * u, -28 * u); g.lineTo(-16 * u, -28 * u); g.fill();
      g.fillStyle = '#5A3818'; for (var i2 = 0; i2 < 4; i2++) g.fillRect(-14 * u, (-24 + i2 * 5) * u, 28 * u, Math.max(1, u));
      glove(g, -22 * u, -16 * u, 13 * u, 0.5);
      g.restore();
      sleeve(g, W * 0.88, H + 14 * u, cx2 + 18 * u, cy2 + 8 * u, 20 * u);
      glove(g, cx2 + 16 * u, cy2 + 6 * u, 14 * u, -0.2);
    }
    g.restore();
  }

  /* ------------------------------------------------------------------ Sprüche */
  var QUIPS_KILL = ['Sauber, Kumpel!', 'Glück auf!', 'Ab in die Grube!', 'Schicht im Schacht!', 'Das war’s mit Summen.', 'Platz da, Kumpel kommt!', 'Wachs on, Wachs off.', 'Feierabend für dich!', 'Sprücheklopfer wär stolz!', 'Die Maschine nickt anerkennend.'];
  var QUIPS_MULTI = ['Doppelstich!', 'Zwei auf einen Streich!', 'Gemischtes Doppel!'];
  var QUIPS_MASS = ['Wespen-Grillfest!', 'Massenkarambolage!', 'Großreinemachen!'];
  var QUIPS_HURT = ['Aua!', 'Das gibt ’nen Stich.', 'Nicht ins Gesicht!'];
  var QUIPS_DEAD = ['SCHICHT IM SCHACHT!', 'Kumpel, das war nix.', 'Ab in die Waschkaue.'];

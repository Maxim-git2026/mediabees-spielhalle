/* Spiel 2: Bienenstich */
(function () {
  'use strict';
  var TAU = Math.PI * 2, H = 600, DURATION = 60000, MAG = 8;
  var art = MBArcade.art;
  var LAYERS = [
    { s: 0.5, speed: [75, 115], y: [110, 290], pts: 25 },
    { s: 0.75, speed: [125, 175], y: [150, 360], pts: 10 },
    { s: 1.05, speed: [185, 245], y: [210, 430], pts: 5 }
  ];
  /* Wer fliegt hier rum: Feinde bringen Punkte, Freunde kosten welche */
  var TYPES = {
    wasp:     { p: 0.50, size: 1,    speed: 1,    r: 28, foe: true },
    hornet:   { p: 0.16, size: 1.25, speed: 1,    r: 28, foe: true },
    goldwasp: { p: 0.04, size: 0.9,  speed: 1.6,  r: 30, foe: true, flat: 50 },
    bee:      { p: 0.15, size: 1,    speed: 0.85, r: 28, minus: 25 },
    bumble:   { p: 0.11, size: 1.05, speed: 0.7,  r: 30, minus: 25 },
    queen:    { p: 0.04, size: 1.15, speed: 0.55, r: 32, minus: 100 }
  };
  var LINES = {
    bee: ['Halt, das war eine von uns!', 'Autsch! Kollegin!', 'Bienen sind die Guten!'],
    bumble: ['Die Hummel hat doch nix gemacht!', 'Hummeln sind Freunde. Minus 25.'],
    queen: ['Die Königin! Der ganze Stock ist sauer.', 'Majestätsbeleidigung! Minus 100.'],
    hornet: ['Hornisse erwischt, doppelte Punkte!', 'Asiatische Hornisse? Nicht mit uns.'],
    goldwasp: ['Goldwespe! Plus 50.', 'Glänzt wie ein Award. Plus 50.']
  };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rollType() {
    var r = Math.random(), acc = 0, last = 'wasp';
    for (var k in TYPES) { acc += TYPES[k].p; last = k; if (r < acc) return k; }
    return last;
  }
  function sprite(type, s) {
    return function (g, size) { g.translate(size / 2 + 3, size / 2 + 2); g.scale(s, s); art[type](g, 0.6); };
  }

  MBArcade.register({
    id: 'wespen',
    title: 'Bienenstich',
    duration: DURATION,
    startText: 'Wespen und Hornissen wollen an unseren Honig. 60 Sekunden, 8 Schuss pro Magazin.',
    help: {
      controls: [
        { icons: ['mouse-left', 'tap'], text: 'Zielen und schießen' },
        { icons: ['kbd:Leertaste', 'mouse-right'], text: 'Sofort nachladen', kb: true },
        { icons: ['tap'], text: 'Patronen unten links antippen: nachladen', touch: true },
        { icons: ['kbd:← ↑ → ↓', 'kbd:Enter'], sep: 'und', text: 'Ohne Maus zielen und schießen', kb: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: sprite('wasp', 0.62), text: 'Wespe nah, mittel, fern', val: '+5 / +10 / +25' },
        { draw: sprite('hornet', 0.55), text: 'Hornisse', val: 'doppelt' },
        { draw: sprite('goldwasp', 0.62), text: 'Goldwespe, selten und flott', val: '+50' },
        { draw: sprite('bee', 0.62), text: 'Biene oder Hummel', val: '−25', minus: true },
        { draw: sprite('queen', 0.5), text: 'Bienenkönigin', val: '−100', minus: true },
        { draw: function (g) { g.fillStyle = '#FDC506'; g.font = '900 20px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('×3', 23, 30); }, text: 'Treffer-Serie ab 3 am Stück', val: '+5 extra' }
      ]
    },
    cta: { path: 'webseiten-wartung/', text: 'Plagegeister auf deiner Website? Die halten wir fern.' },
    stats: function (s) {
      var t = s.hits + ' Treffer bei ' + s.shots + ' Schuss';
      t += s.friends ? ', ' + s.friends + (s.friends === 1 ? ' Freund' : ' Freunde') + ' erwischt.' : '.';
      return t + (s.streak >= 3 ? ' Beste Serie: ' + s.streak + '.' : '');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas is-aim';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);

      var g = cv.getContext('2d');
      var W = 960, k = 1, dpr = 1, layers = {};
      var targets = [], pops = [], flashes = [], parts = [], aim = { x: 480, y: 300, show: false, until: 0 };
      var st = fresh(), raf = 0, lastPointer = 'mouse';
      var AMMO = { x: 14, y: H - 96, w: 212, h: 82 };

      function fresh() { return { on: false, paused: false, t: 0, last: 0, next: 400, score: 0, shots: 0, hits: 0, friends: 0, ammo: MAG, reloadFx: 0, recoil: 0, shake: 0, shakeMag: 0, streak: 0, bestStreak: 0 }; }

      /* Hintergrund in drei Ebenen, damit Ziele hinter der Halde verschwinden können */
      function paintBack(x) {
        var gr = x.createLinearGradient(0, 0, 0, H * 0.82);
        gr.addColorStop(0, '#1E1630'); gr.addColorStop(0.45, '#6E2E3A'); gr.addColorStop(0.78, '#D9731F'); gr.addColorStop(1, '#FDC506');
        x.fillStyle = gr; x.fillRect(0, 0, W, H);
        var sx = W * 0.62, sy = H * 0.7;
        var glow = x.createRadialGradient(sx, sy, 20, sx, sy, 240);
        glow.addColorStop(0, 'rgba(255,236,150,0.85)'); glow.addColorStop(1, 'rgba(255,236,150,0)');
        x.fillStyle = glow; x.fillRect(0, 0, W, H);
        x.beginPath(); x.arc(sx, sy, 56, 0, TAU); x.fillStyle = '#FFF1B8'; x.fill();
        art.skyline(x, -20, W + 60, H * 0.8, '#4E2430', art.rng(7), null);
      }
      function paintMid(x) {
        art.halde(x, Math.max(200, W * 0.2), H * 0.84, Math.max(360, W * 0.42), 150, '#2B1622');
      }
      function paintFront(x) {
        var top = H * 0.86;
        x.fillStyle = '#151515';
        x.beginPath(); x.moveTo(0, top + 8);
        for (var i = 0; i <= W; i += 40) x.quadraticCurveTo(i + 20, top - 6 + (i % 80 ? 4 : -2), i + 40, top + 6);
        x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill();
        var r = art.rng(11);
        x.strokeStyle = '#2A2A2A'; x.lineWidth = 2;
        for (var gx = 4; gx < W; gx += 9) {
          var hgt = 8 + r() * 16;
          x.beginPath(); x.moveTo(gx, top + 10); x.quadraticCurveTo(gx + 2, top + 4 - hgt / 2, gx + 4 - r() * 8, top + 8 - hgt); x.stroke();
        }
        for (var f = 0; f < W / 26; f++) {
          var fx = r() * W, fy = top + 14 + r() * (H - top - 24);
          x.fillStyle = r() < 0.7 ? '#FDC506' : '#FFFFFF';
          x.beginPath(); x.arc(fx, fy, 2 + r() * 2.5, 0, TAU); x.fill();
        }
        var bx = W - 150, by = H - 24, bw = 104;
        x.lineWidth = 3; x.strokeStyle = '#111';
        for (var b = 0; b < 3; b++) {
          x.fillStyle = b % 2 ? '#F0B800' : '#FDC506';
          x.fillRect(bx, by - 34 * (b + 1), bw, 34); x.strokeRect(bx, by - 34 * (b + 1), bw, 34);
        }
        x.fillStyle = '#2E2E2E';
        x.beginPath(); x.moveTo(bx - 10, by - 102); x.lineTo(bx + bw / 2, by - 128); x.lineTo(bx + bw + 10, by - 102); x.closePath(); x.fill(); x.stroke();
        x.fillStyle = '#111'; x.fillRect(bx + bw / 2 - 18, by - 12, 36, 6);
        x.fillStyle = '#2E2E2E'; x.fillRect(bx + 8, by, 10, 24); x.fillRect(bx + bw - 18, by, 10, 24);
      }

      function offscreen(paint) {
        var c = document.createElement('canvas');
        c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d');
        x.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        paint(x);
        return c;
      }

      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2, 2400 / r.width);
        cv.width = Math.round(r.width * dpr);
        cv.height = Math.round(r.height * dpr);
        k = r.height / H;
        W = r.width / k;
        layers.back = offscreen(paintBack);
        layers.mid = offscreen(paintMid);
        layers.front = offscreen(paintFront);
        aim.x = Math.min(aim.x, W);
        render();
      }

      function spawn() {
        var p = st.t / DURATION, alive = 0;
        targets.forEach(function (t) { if (!t.dead) alive++; });
        if (alive >= 4 + Math.floor(p * 6)) return;
        var lr = Math.random(), li = lr < 0.3 ? 0 : lr < 0.65 ? 1 : 2;
        var L = LAYERS[li], type = rollType(), T = TYPES[type];
        var dir = Math.random() < 0.5 ? 1 : -1;
        targets.push({
          type: type, li: li, s: L.s * T.size,
          x: dir > 0 ? -70 : W + 70, by: rnd(L.y[0], L.y[1]), y: 0,
          vx: rnd(L.speed[0], L.speed[1]) * (1 + p * 0.45) * T.speed * dir,
          amp: rnd(8, 26) * L.s * 1.4, fr: rnd(1.5, 3.2), ph: rnd(0, TAU), wing: rnd(0, TAU),
          dead: false, vy: 0, rot: 0, vr: 0
        });
      }

      function update(dt) {
        st.t += dt * 1000;
        var p = st.t / DURATION, sec = st.t / 1000;
        for (var i = targets.length - 1; i >= 0; i--) {
          var t = targets[i];
          if (!t.dead) {
            t.x += t.vx * dt;
            t.y = t.by + Math.sin(sec * t.fr + t.ph) * t.amp;
            if (t.x < -100 || t.x > W + 100) targets.splice(i, 1);
          } else {
            t.vy += 1100 * dt; t.y += t.vy * dt; t.x += t.vx * 0.15 * dt; t.rot += t.vr * dt;
            if (t.y > H + 60) targets.splice(i, 1);
          }
        }
        for (var j = pops.length - 1; j >= 0; j--) { pops[j].t += dt; if (pops[j].t > 0.9) pops.splice(j, 1); }
        for (var f = flashes.length - 1; f >= 0; f--) { flashes[f].t += dt; if (flashes[f].t > 0.14) flashes.splice(f, 1); }
        if (st.reloadFx > 0) st.reloadFx = Math.max(0, st.reloadFx - dt * 4);
        st.recoil = Math.max(0, st.recoil - dt * 7);
        st.shake = Math.max(0, st.shake - dt);
        for (var q = parts.length - 1; q >= 0; q--) {
          var pt = parts[q];
          pt.t += dt; pt.vy += (pt.g || 700) * dt; pt.vx *= 0.985;
          pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.rot += pt.vr * dt;
          if (pt.t > pt.life) parts.splice(q, 1);
        }
        if (st.t >= st.next) {
          spawn();
          st.next = st.t + rnd(0.75, 1.25) * (650 - 330 * p);
        }
        ctx.setTime(DURATION - st.t, DURATION);
      }

      function drawTargets(li) {
        var sec = st.t / 1000;
        targets.forEach(function (t) {
          if (t.li !== li) return;
          g.save();
          g.translate(t.x, t.y);
          if (t.dead) { g.rotate(t.rot); g.globalAlpha = 0.85; }
          g.scale(t.s * (t.vx < 0 ? -1 : 1), t.s);
          art[t.type](g, t.dead ? 0.2 : Math.sin(sec * 38 + t.wing));
          g.restore();
        });
      }

      /* Munition groß unten links, wie damals */
      function drawAmmo() {
        var a = AMMO, low = st.ammo <= 2;
        g.save();
        g.beginPath();
        if (g.roundRect) g.roundRect(a.x, a.y, a.w, a.h, 16); else g.rect(a.x, a.y, a.w, a.h);
        g.fillStyle = 'rgba(17,17,17,0.72)'; g.fill();
        g.lineWidth = 2;
        g.strokeStyle = st.ammo === 0 ? (Math.floor(st.t / 250) % 2 ? '#FDC506' : '#FF7A6B') : low ? '#FDC506' : 'rgba(255,255,255,0.25)';
        g.stroke();
        for (var i = 0; i < MAG; i++) {
          var x = a.x + 16 + i * 23.5, y = a.y + 12, full = i < st.ammo;
          var lift = st.reloadFx > 0 ? Math.sin((st.reloadFx + i * 0.08) * Math.PI) * 6 : 0;
          g.beginPath();
          if (g.roundRect) g.roundRect(x, y - lift, 16, 38, [8, 8, 3, 3]); else g.rect(x, y - lift, 16, 38);
          if (full) {
            g.fillStyle = low ? '#FF7A6B' : '#FDC506'; g.fill();
            g.fillStyle = '#8A6A00'; g.fillRect(x, y + 28 - lift, 16, 10);
          } else {
            g.strokeStyle = '#555'; g.lineWidth = 2; g.stroke();
          }
        }
        g.fillStyle = '#FFFFFF'; g.font = '600 14px Poppins, sans-serif'; g.textAlign = 'left';
        g.fillText(lastPointer === 'touch' ? 'Antippen: nachladen' : 'Leertaste: nachladen', a.x + 16, a.y + a.h - 12);
        g.restore();
      }

      function drawEmpty() {
        if (st.ammo > 0 || !st.on || st.paused) return;
        var blink = 0.65 + 0.35 * Math.sin(st.t / 90);
        g.save();
        g.textAlign = 'center'; g.lineJoin = 'round';
        g.globalAlpha = blink;
        g.font = '900 76px Poppins, sans-serif';
        g.lineWidth = 10; g.strokeStyle = 'rgba(17,17,17,0.85)'; g.strokeText('LEER!', W / 2, H * 0.42);
        g.fillStyle = '#FDC506'; g.fillText('LEER!', W / 2, H * 0.42);
        g.globalAlpha = 1;
        g.font = '700 24px Poppins, sans-serif';
        var sub = lastPointer === 'touch' ? 'Patronen unten links antippen' : 'Leertaste oder Rechtsklick';
        g.lineWidth = 6; g.strokeText(sub, W / 2, H * 0.42 + 42);
        g.fillStyle = '#FFFFFF'; g.fillText(sub, W / 2, H * 0.42 + 42);
        g.restore();
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = st.shakeMag * Math.min(1, st.shake / 0.15); sx = (Math.random() * 2 - 1) * m; sy = (Math.random() * 2 - 1) * m; }
        var full = function () { g.setTransform(1, 0, 0, 1, sx * k * dpr, sy * k * dpr); };
        var virt = function () { g.setTransform(k * dpr, 0, 0, k * dpr, sx * k * dpr, sy * k * dpr); };
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#1E1630'; g.fillRect(0, 0, cv.width, cv.height);
        full();
        if (layers.back) g.drawImage(layers.back, 0, 0);
        virt(); drawTargets(0);
        full(); if (layers.mid) g.drawImage(layers.mid, 0, 0);
        virt(); drawTargets(1); drawTargets(2);
        full(); if (layers.front) g.drawImage(layers.front, 0, 0);
        virt();
        flashes.forEach(function (fl) {
          var a = 1 - fl.t / 0.14;
          g.beginPath(); g.arc(fl.x, fl.y, 10 + fl.t * 160, 0, TAU);
          g.fillStyle = 'rgba(255,240,180,' + (0.55 * a) + ')'; g.fill();
        });
        parts.forEach(function (pt) {
          var a = 1 - pt.t / pt.life;
          g.save(); g.globalAlpha = Math.max(0, a); g.translate(pt.x, pt.y); g.rotate(pt.rot);
          g.fillStyle = pt.c;
          if (pt.shape === 'wing') { g.beginPath(); g.ellipse(0, 0, pt.size * 1.6, pt.size * 0.6, 0, 0, TAU); g.fill(); }
          else if (pt.shape === 'star') { g.fillRect(-pt.size / 2, -1, pt.size, 2); g.fillRect(-1, -pt.size / 2, 2, pt.size); }
          else { g.beginPath(); g.arc(0, 0, pt.size, 0, TAU); g.fill(); }
          g.restore();
        });
        g.textAlign = 'center';
        g.lineJoin = 'round';
        pops.forEach(function (pp) {
          var a = Math.min(1, 1.6 - pp.t * 1.8), y = pp.y - pp.t * 70;
          var sc = pp.t < 0.12 ? 1.7 - pp.t * 5.8 : 1;
          g.save(); g.globalAlpha = Math.max(0, a); g.translate(pp.x, y); g.scale(sc, sc);
          g.font = '800 ' + (pp.big ? 30 : 22) + 'px Poppins, sans-serif';
          g.lineWidth = 5; g.strokeStyle = '#111'; g.strokeText(pp.txt, 0, 0);
          g.fillStyle = pp.c; g.fillText(pp.txt, 0, 0);
          if (pp.sub) { g.font = '700 16px Poppins, sans-serif'; g.lineWidth = 4; g.strokeText(pp.sub, 0, 22); g.fillStyle = '#FFFFFF'; g.fillText(pp.sub, 0, 22); }
          g.restore();
        });
        if (st.on) drawAmmo();
        drawEmpty();
        if (aim.show && st.on && !st.paused && (aim.until === 0 || st.t < aim.until)) drawCross(aim.x, aim.y);
      }

      function drawCross(x, y) {
        var empty = st.ammo === 0, blink = empty ? (Math.floor(st.t / 160) % 2 === 0) : true;
        var r = 20 * (1 + st.recoil * 0.35), main = empty ? '#FF4A3D' : '#FFFFFF';
        g.lineCap = 'round';
        if (blink) {
          for (var pass = 0; pass < 2; pass++) {
            g.lineWidth = pass ? 2.2 : 5;
            g.strokeStyle = pass ? main : 'rgba(17,17,17,0.65)';
            g.beginPath(); g.arc(x, y, r, 0, TAU);
            g.moveTo(x - r - 8, y); g.lineTo(x - 6, y); g.moveTo(x + 6, y); g.lineTo(x + r + 8, y);
            g.moveTo(x, y - r - 8); g.lineTo(x, y - 6); g.moveTo(x, y + 6); g.lineTo(x, y + r + 8);
            g.stroke();
          }
        }
        /* Munitionsring: ein Segment pro Patrone */
        var R = r + 13, seg = TAU / MAG, gap = 0.16;
        for (var i = 0; i < MAG; i++) {
          var a0 = -Math.PI / 2 + i * seg + gap / 2, a1 = a0 + seg - gap;
          var full = i < st.ammo;
          var pop = st.reloadFx > 0 ? Math.max(0, Math.sin((st.reloadFx * 1.6 - i * 0.07) * Math.PI)) * 4 : 0;
          g.beginPath(); g.arc(x, y, R + pop, a0, a1);
          g.lineWidth = 8; g.strokeStyle = 'rgba(17,17,17,0.55)'; g.stroke();
          g.beginPath(); g.arc(x, y, R + pop, a0, a1);
          g.lineWidth = 5;
          g.strokeStyle = full ? (st.ammo <= 2 ? '#FF7A6B' : '#FDC506') : (empty && blink ? 'rgba(255,74,61,0.7)' : 'rgba(255,255,255,0.22)');
          g.stroke();
        }
        g.beginPath(); g.arc(x, y, 2.5, 0, TAU); g.fillStyle = empty ? '#FF4A3D' : '#FDC506'; g.fill();
        if (st.streak >= 3) {
          var ty = y + R + 26 > H - 8 ? y - R - 14 : y + R + 24, tx = Math.max(50, Math.min(W - 50, x));
          g.font = '800 15px Poppins, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(17,17,17,0.8)';
          g.strokeText('Serie ×' + st.streak, tx, ty); g.fillStyle = '#FDC506'; g.fillText('Serie ×' + st.streak, tx, ty);
        }
      }

      function burst(x, y, colors, n, speed, shape) {
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8);
          parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.3, t: 0, life: 0.45 + Math.random() * 0.4,
            size: 2 + Math.random() * 3.5, c: colors[i % colors.length], rot: Math.random() * TAU, vr: rnd(-10, 10), shape: shape && i % 3 === 0 ? shape : 'dot' });
        }
      }
      var COLORS = {
        wasp: ['#FFD400', '#111111', '#FFD400'], hornet: ['#E8902A', '#2A1A10', '#C9A227'], goldwasp: ['#FFE680', '#FFFFFF', '#FDC506'],
        bee: ['#F7B500', '#3A2410', '#FF7A6B'], bumble: ['#F7C21B', '#1C1C1C', '#FF7A6B'], queen: ['#EBA800', '#FFD84D', '#FF7A6B']
      };
      function shakeIt(mag, dur) { if (mag >= st.shakeMag || st.shake <= 0) { st.shakeMag = mag; st.shake = dur; } }

      function reload() {
        if (!st.on || st.paused || st.ammo === MAG) return;
        st.ammo = MAG;
        st.reloadFx = 1;
        st.recoil = 0;
        ctx.tone(300, 520, 0.05, 'square', 0.04);
        ctx.tone(520, 320, 0.05, 'square', 0.04, 0.07);
      }

      function inAmmo(x, y) { return x >= AMMO.x && x <= AMMO.x + AMMO.w && y >= AMMO.y && y <= AMMO.y + AMMO.h; }

      function shoot(x, y) {
        if (!st.on || st.paused) return;
        if (st.ammo <= 0) { ctx.tone(220, 180, 0.05, 'square', 0.04); return; }
        st.ammo--; st.shots++;
        st.recoil = 1;
        flashes.push({ x: x, y: y, t: 0 });
        ctx.tone(760, 90, 0.09, 'sawtooth', 0.05);
        var hit = null;
        for (var li = 2; li >= 0 && !hit; li--) {
          for (var i = targets.length - 1; i >= 0; i--) {
            var t = targets[i];
            if (t.dead || t.li !== li) continue;
            var cx = t.x - 8 * t.s * (t.vx < 0 ? -1 : 1), r = TYPES[t.type].r * t.s;
            var dx = x - cx, dy = y - t.y;
            if (dx * dx + dy * dy <= r * r) { hit = t; break; }
          }
        }
        if (!hit) {
          if (st.streak >= 3) ctx.say('Serie gerissen.');
          st.streak = 0;
          burst(x, y, ['rgba(255,255,255,0.7)', 'rgba(255,240,180,0.7)'], 5, 120);
          return;
        }
        var T = TYPES[hit.type];
        burst(hit.x, hit.y, COLORS[hit.type], T.foe ? 14 : 18, T.foe ? 260 : 300, hit.type === 'goldwasp' ? 'star' : 'wing');
        hit.dead = true; hit.vy = -170; hit.vr = (hit.vx > 0 ? 1 : -1) * rnd(5, 9);
        if (!T.foe) {
          st.friends++;
          st.streak = 0;
          st.score = Math.max(0, st.score - T.minus);
          pops.push({ x: hit.x, y: hit.y - 20, txt: '−' + T.minus, c: '#FF7A6B', t: 0, big: true });
          shakeIt(hit.type === 'queen' ? 12 : 8, 0.3);
          ctx.say(pick(LINES[hit.type]));
          ctx.tone(170, 120, 0.28, 'sawtooth', 0.05);
        } else {
          var pts = T.flat || LAYERS[hit.li].pts * (hit.type === 'hornet' ? 2 : 1);
          st.hits++;
          st.streak++;
          st.bestStreak = Math.max(st.bestStreak, st.streak);
          var bonus = st.streak >= 3 ? 5 : 0;
          st.score += pts + bonus;
          pops.push({ x: hit.x, y: hit.y - 20, txt: '+' + (pts + bonus), c: '#FDC506', t: 0, big: pts >= 25, sub: bonus ? 'Serie ×' + st.streak : '' });
          shakeIt(pts >= 25 ? 5 : 3, 0.14);
          if (st.streak === 5 || st.streak === 10 || st.streak === 15) { ctx.say(st.streak + ' Treffer am Stück!'); ctx.tone(660, 1320, 0.15, 'triangle', 0.06, 0.05); }
          if (LINES[hit.type] && (hit.type === 'goldwasp' || Math.random() < 0.5)) ctx.say(pick(LINES[hit.type]));
          ctx.tone(900, 1300, 0.07, 'triangle', 0.05, 0.03);
        }
        ctx.setScore(st.score);
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.05, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.t >= DURATION) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }

      function stop() {
        st.on = false;
        cancelAnimationFrame(raf);
        aim.show = false;
        render();
      }

      function finish() {
        stop();
        ctx.finish(st.score, { hits: st.hits, shots: st.shots, friends: st.friends, streak: st.bestStreak });
      }

      function toV(e) {
        var r = cv.getBoundingClientRect();
        return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
      }
      cv.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        lastPointer = 'mouse';
        var p = toV(e); aim.x = p.x; aim.y = p.y; aim.show = true; aim.until = 0;
      });
      cv.addEventListener('pointerleave', function () { aim.show = false; });
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        e.preventDefault();
        lastPointer = e.pointerType === 'mouse' ? 'mouse' : 'touch';
        var p = toV(e);
        if (e.pointerType === 'mouse') {
          if (e.button === 2) { reload(); return; }
          if (e.button !== 0) return;
          aim.x = p.x; aim.y = p.y; aim.show = true;
        }
        if (inAmmo(p.x, p.y)) { reload(); return; }
        if (e.pointerType !== 'mouse') { aim.x = p.x; aim.y = p.y; aim.show = true; aim.until = st.t + 450; }
        else aim.until = 0;
        shoot(p.x, p.y);
      });
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

      lastPointer = ctx.touch() ? 'touch' : 'mouse';
      resize();

      return {
        start: function () {
          targets = []; pops = []; flashes = []; parts = [];
          st = fresh();
          st.on = true;
          st.last = performance.now();
          aim.x = W / 2; aim.y = H * 0.45;
          ctx.stage.focus({ preventScroll: true });
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
          render();
        },
        abort: stop,
        unmount: stop,
        resize: resize,
        key: function (e) {
          var step = e.shiftKey ? 60 : 28;
          switch (e.key) {
            case 'ArrowLeft': aim.x = Math.max(0, aim.x - step); aim.show = true; return true;
            case 'ArrowRight': aim.x = Math.min(W, aim.x + step); aim.show = true; return true;
            case 'ArrowUp': aim.y = Math.max(0, aim.y - step); aim.show = true; return true;
            case 'ArrowDown': aim.y = Math.min(H, aim.y + step); aim.show = true; return true;
            case 'Enter': aim.show = true; shoot(aim.x, aim.y); return true;
            case ' ': case 'r': case 'R': lastPointer = 'mouse'; reload(); return true;
          }
          return false;
        },
        _debug: function () { return { targets: targets, k: k, W: W, st: st, cv: cv, TYPES: TYPES }; }
      };
    }
  });
})();

/* Spiel 12: Hummelhopser (Crossy-Road-Prinzip) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, COLS = 9, HOP_MS = 130, HONEY = 5;
  var art = MBArcade.art, rr = art.rrect;
  var CAR_COLORS = [['#2F6FD0', '#4C86E0'], ['#D3272F', '#E04A50'], ['#F2F2F2', '#FFFFFF'], ['#2E8B57', '#45A06C'], ['#E8902A', '#F0A64C'], ['#4A4F5C', '#5E6472']];
  var MILESTONES = { 25: 'Erste Kreuzung geschafft!', 50: 'Halbe Strecke bis zur Zeche!', 100: 'Einmal quer durch Herne!', 150: 'Ruhrpott-Profi!', 200: 'Unplattbar!' };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function drawHoneyJar(g, x, y, s, t) {
    g.save(); g.translate(x, y + Math.sin(t / 220) * s * 0.08); g.scale(s / 24, s / 24);
    var gl = g.createRadialGradient(0, 0, 2, 0, 0, 20); gl.addColorStop(0, 'rgba(253,197,6,0.55)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.fill();
    rr(g, -8, -6, 16, 16, 4); g.fillStyle = '#E9A800'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = '#111'; g.stroke();
    g.fillStyle = '#FFF6D6'; g.fillRect(-5, -1, 10, 6);
    rr(g, -9, -11, 18, 5.5, 1.5); g.fillStyle = '#7A4A1A'; g.fill(); g.stroke();
    g.restore();
  }

  MBArcade.register({
    id: 'hopser',
    title: 'Hummelhopser',
    duration: 0,
    startText: 'Die Hummel will nach Hause. Hüpf über Straßen, S-Bahn-Gleise und die Emscher, so weit du kommst. Nicht trödeln, sonst schnappt dich die Wespe!',
    help: {
      legendTitle: 'So läuft es',
      controls: [
        { icons: ['kbd:W', 'kbd:↑'], text: 'Nach vorn hüpfen (A/D bzw. ← → zur Seite, S/↓ zurück)', kb: true },
        { icons: ['tap'], text: 'Tippen hüpft nach vorn', touch: true },
        { icons: ['swipe'], text: 'Wischen hüpft zur Seite oder zurück', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.translate(23, 25); g.scale(0.5, 0.5); art.bumble(g, 0.5); }, text: 'Jede neue Reihe nach vorn', val: '+1' },
        { draw: function (g) { drawHoneyJar(g, 23, 25, 28, 0); }, text: 'Honigglas einsammeln', val: '+' + HONEY },
        { draw: function (g) { g.fillStyle = '#5B4126'; rr(g, 4, 17, 38, 14, 6); g.fill(); g.strokeStyle = '#3A2814'; g.lineWidth = 2; g.stroke(); }, text: 'In der Emscher nur auf Stämmen und Kähnen stehen' },
        { draw: function (g) { g.translate(23, 23); g.rotate(Math.PI / 2); g.scale(0.5, 0.5); art.car(g, '#D3272F', '#E04A50'); }, text: 'Von Auto, S-Bahn oder Wespe erwischt', val: 'Ende', minus: true }
      ]
    },
    cta: { path: 'kontakt/', text: 'Kein Hüpfen über Umwege: Wir bringen deine Website sicher ans Ziel.' },
    stats: function (s) {
      return s.rows + (s.rows === 1 ? ' Reihe' : ' Reihen') + ' weit gehüpft' + (s.honey ? ', ' + s.honey + (s.honey === 1 ? ' Honigglas.' : ' Honiggläser.') : '.') + ' ' + s.why;
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, T = 40, ox = 0, margin = 4;
      var raf = 0, idleRaf = 0, ptr = null;
      var st = fresh();

      function fresh() {
        return {
          on: false, paused: false, t: 0, last: 0, over: false, dead: 0, why: '',
          rows: {}, genTop: -1, lastType: 'grass', prevFree: null,
          px: 4, pr: 0, hop: null, queue: [], best: 0, score: 0, honey: 0,
          cam: -2.5, creep: 0, started: false, face: 0,
          parts: [], squash: 0, hint: true, idleT: 0
        };
      }

      /* Reihen werden nach vorn hin erzeugt */
      function genRow(r) {
        var d = Math.min(1, Math.max(0, r - 6) / 140);
        var row;
        if (r < 4) row = grassRow(r, true);
        else {
          var last = st.lastType, rnd1 = Math.random();
          var type;
          if (last === 'grass') type = rnd1 < 0.45 ? 'road' : rnd1 < 0.7 ? 'water' : rnd1 < 0.82 + d * 0.06 ? 'rail' : 'grass';
          else if (st.run >= (last === 'road' ? 1 + Math.floor(rnd(0, 2 + d * 3)) : last === 'water' ? 1 + Math.floor(rnd(0, 2 + d * 2)) : 1)) type = 'grass';
          else type = last;
          if (type !== last) st.run = 0;
          st.run = (st.run || 0) + 1;
          if (type === 'grass') row = grassRow(r, false);
          else if (type === 'road') row = roadRow(r, d);
          else if (type === 'water') row = waterRow(r, d);
          else row = railRow(r, d);
        }
        st.lastType = row.type;
        st.rows[r] = row;
      }
      function grassRow(r, safe) {
        var trees = {}, free = [];
        if (!safe) {
          var n = Math.floor(rnd(1, 4.5));
          for (var i = 0; i < n; i++) { var c = Math.floor(Math.random() * COLS); trees[c] = true; }
          /* Immer genug Lücken, die zur Reihe davor passen */
          if (st.prevFree) st.prevFree.slice(0, 3).forEach(function (c2) { delete trees[c2]; });
        }
        for (var c3 = 0; c3 < COLS; c3++) if (!trees[c3]) free.push(c3);
        st.prevFree = free.sort(function () { return Math.random() - 0.5; });
        var honey = !safe && Math.random() < 0.18 ? pick(free) : -1;
        var deco = [];
        for (var k = -margin; k < COLS + margin; k++) if (k < 0 || k >= COLS) { if (Math.random() < 0.55) deco.push(k); }
        return { type: 'grass', trees: trees, honey: honey, deco: deco, shade: r % 2 };
      }
      function laneObjs(len, gapMin, gapMax, speed) {
        var objs = [], span = COLS + margin * 2 + 6, x = -margin - 3 + rnd(0, gapMax);
        while (x < span - margin - 3) { objs.push({ x: x, w: len() }); x += objs[objs.length - 1].w + rnd(gapMin, gapMax); }
        return { objs: objs, span: span, speed: speed };
      }
      function roadRow(r, d) {
        var dir = Math.random() < 0.5 ? 1 : -1, truck = Math.random() < 0.3;
        var speed = (truck ? rnd(1.6, 2.6) : rnd(2.2, 3.6)) * (1 + d * 1.1) * dir;
        var l = laneObjs(function () { return truck ? 2 : 1; }, truck ? 3 : 2.2, truck ? 6.5 : 5.5 - d * 1.5, speed);
        l.objs.forEach(function (o) { o.c = pick(CAR_COLORS); });
        return { type: 'road', speed: l.speed, objs: l.objs, span: l.span, truck: truck };
      }
      function waterRow(r, d) {
        var dir = st.lastWaterDir ? -st.lastWaterDir : (Math.random() < 0.5 ? 1 : -1);
        st.lastWaterDir = dir;
        var barge = Math.random() < 0.3;
        var speed = rnd(1.1, 2) * (1 + d * 0.8) * dir;
        var l = laneObjs(function () { return barge ? 3 : Math.floor(rnd(2, 4.2 - d * 1.2)); }, 1.2, 2.6 + d, speed);
        l.objs.forEach(function (o) { o.barge = barge; });
        return { type: 'water', speed: l.speed, objs: l.objs, span: l.span };
      }
      function railRow() {
        return { type: 'rail', dir: Math.random() < 0.5 ? 1 : -1, next: rnd(2, 6), warn: 0, train: null };
      }
      function rowAt(r) {
        /* Hinter dem Start: ruhige Wiese mit Bäumen am Rand */
        if (r < 0) {
          if (!st.rows[r]) { var deco = []; for (var k = -margin; k < COLS + margin; k++) if (k < 0 || k >= COLS) deco.push(k); st.rows[r] = { type: 'grass', trees: {}, honey: -1, deco: deco, shade: (r + 100) % 2 }; }
          return st.rows[r];
        }
        while (st.genTop < r) { st.genTop++; genRow(st.genTop); }
        return st.rows[r];
      }

      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        T = Math.min(cssW / COLS, cssH / 10.5);
        ox = (cssW - T * COLS) / 2;
        margin = Math.ceil(ox / T) + 2;
      }
      function sx(x) { return ox + (x + 0.5) * T; }
      function sy(r) { return cssH - T * 2.2 - (r - st.cam) * T; }

      function blocked(c, r) {
        if (c < 0 || c >= COLS) return true;
        var row = rowAt(r);
        return row && row.type === 'grass' && row.trees[c];
      }
      function tryHop(dc, dr) {
        if (!st.on || st.paused || st.dead) return;
        if (st.hop) { if (st.queue.length < 2) st.queue.push([dc, dr]); return; }
        st.hint = false; st.started = true; st.idleT = 0;
        if (dc) st.face = dc;
        var row = rowAt(st.pr), fromX = st.px;
        var tc = Math.round(st.px) + dc, tr = st.pr + dr;
        if (row.type === 'water' && !dr) tc = Math.round(st.px + dc);
        if (tr < st.best - 6 || blocked(tc, tr)) {
          st.squash = 1; ctx.tone(160, 120, 0.05, 'square', 0.03);
          return;
        }
        st.hop = { fx: fromX, fr: st.pr, tx: tc, tr: tr, t: 0 };
        ctx.tone(dr > 0 ? 600 : 480, dr > 0 ? 820 : 600, 0.06, 'triangle', 0.03);
      }

      function die(why, kind) {
        if (st.dead) return;
        st.dead = st.t; st.why = why;
        var x = sx(st.px), y = sy(st.pr);
        if (kind === 'water') {
          ctx.fx.ring(x, y, '#7FD3FF', T * 2.2, 5, 600); ctx.fx.sparkle(x, y, ['#7FD3FF', '#FFFFFF', '#2F6FD0'], 18, 200, false);
          ctx.fx.flash('127,211,255', 0.6); ctx.tone(500, 90, 0.5, 'sine', 0.06);
        } else {
          ctx.fx.flash('255,74,61', 1); ctx.fx.shake(0.45, 12); ctx.fx.ring(x, y, '#FF5A4A', T * 3, 7, 600);
          ctx.fx.sparkle(x, y, ['#F7C21B', '#1C1C1C', '#FFFFFF'], 22, 260, false);
          ctx.tone(220, 50, 0.45, 'sawtooth', 0.07);
        }
        ctx.fx.text(x, y - T, kind === 'water' ? 'PLATSCH!' : kind === 'wasp' ? 'GESCHNAPPT!' : 'PLATT!', '#FFFFFF', 28);
      }

      function land() {
        var h = st.hop; st.hop = null;
        st.px = h.tx; st.pr = h.tr; st.squash = 0.7;
        var row = rowAt(st.pr);
        for (var i = 0; i < 4; i++) st.parts.push({ x: sx(st.px) + rnd(-T * 0.3, T * 0.3), y: sy(st.pr) + T * 0.3, vx: rnd(-40, 40), vy: rnd(-40, -10), t: 0, life: 0.35, size: rnd(1.5, 3), c: row.type === 'water' ? '#BFE6FF' : row.type === 'road' ? '#9AA2B4' : '#C8E6A8' });
        if (st.pr > st.best) {
          st.best = st.pr; st.score++; ctx.setScore(st.score);
          if (MILESTONES[st.best]) {
            ctx.fx.banner(MILESTONES[st.best], '#FDC506'); ctx.fx.flash('253,197,6', 0.5);
            ctx.fx.sparkle(sx(st.px), sy(st.pr), null, 24, 260); ctx.tone(660, 1320, 0.2, 'triangle', 0.05);
          } else if (st.best % 10 === 0) { ctx.fx.ring(sx(st.px), sy(st.pr), '#FDC506', T * 1.5, 4, 400); ctx.fx.text(sx(st.px), sy(st.pr) - T, String(st.best), '#FDC506', 22); }
        }
        if (row.type === 'grass' && row.honey === st.px) {
          row.honey = -1; st.honey++; st.score += HONEY; ctx.setScore(st.score);
          ctx.fx.ring(sx(st.px), sy(st.pr), '#FDC506', T * 1.6, 5, 420); ctx.fx.sparkle(sx(st.px), sy(st.pr), null, 12, 180);
          ctx.fx.text(sx(st.px), sy(st.pr) - T * 0.8, '+' + HONEY, '#FDC506', 20);
          ctx.tone(880, 1320, 0.08, 'triangle', 0.05); ctx.tone(1320, 1760, 0.1, 'triangle', 0.04, 0.07);
        }
        if (row.type === 'water') { st.onLog = logAt(row, st.px); if (!st.onLog) die('Ab in die Emscher.', 'water'); }
        else st.onLog = null;
        if (st.queue.length) { var q = st.queue.shift(); tryHop(q[0], q[1]); }
      }
      function logAt(row, x) {
        for (var i = 0; i < row.objs.length; i++) { var o = row.objs[i]; if (x > o.x - 0.35 && x < o.x + o.w - 0.65) return o; }
        return null;
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var p = st.parts[q]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > p.life) st.parts.splice(q, 1); }
        st.squash = Math.max(0, st.squash - dt * 5);
        /* Bewegung in allen sichtbaren Reihen */
        var r0 = Math.floor(st.cam) - 3, r1 = Math.ceil(st.cam + cssH / T) + 2;
        for (var r = r0; r <= r1; r++) {
          var row = rowAt(r);
          if (!row) continue;
          if (row.type === 'road' || row.type === 'water') {
            row.objs.forEach(function (o) {
              o.x += row.speed * dt;
              if (row.speed > 0 && o.x > COLS + margin + 1) o.x -= row.span;
              if (row.speed < 0 && o.x + o.w < -margin - 1) o.x += row.span;
            });
          } else if (row.type === 'rail') {
            if (row.train) {
              row.train.x += row.dir * 28 * dt;
              if ((row.dir > 0 && row.train.x > COLS + margin + 2) || (row.dir < 0 && row.train.x + row.train.w < -margin - 2)) { row.train = null; row.next = rnd(3, 7); }
            } else {
              row.next -= dt;
              if (row.next < 1.2 && !row.warn) { row.warn = 1; if (Math.abs(r - st.pr) < 6) ctx.tone(1200, 1200, 0.08, 'square', 0.03); }
              if (row.next <= 0) { row.warn = 0; row.train = { x: row.dir > 0 ? -margin - 14 : COLS + margin + 1, w: 13 }; }
            }
          }
        }
        if (st.dead) { if (st.t - st.dead > 1300) st.over = true; return; }
        /* Hüpfen */
        if (st.hop) { st.hop.t += dt * 1000; if (st.hop.t >= HOP_MS) land(); }
        var row2 = rowAt(st.pr);
        if (!st.hop && row2.type === 'water' && st.onLog) {
          st.px += row2.speed * dt;
          if (st.px < -0.4 || st.px > COLS - 0.6) die('Mit dem Kahn davongetrieben.', 'water');
        }
        /* Treffer auf Straße und Gleis */
        if (!st.hop) {
          if (row2.type === 'road') row2.objs.forEach(function (o) { if (st.px > o.x - 0.7 && st.px < o.x + o.w - 0.3) die('Unters Auto gekommen.', 'car'); });
          if (row2.type === 'rail' && row2.train && st.px > row2.train.x - 0.7 && st.px < row2.train.x + row2.train.w - 0.3) die('Die S-Bahn war schneller.', 'car');
        }
        /* Kamera: folgt nach vorn und schiebt langsam nach, wer trödelt wird geschnappt */
        var target = Math.max(st.cam, st.pr - 2.5);
        st.cam += (target - st.cam) * Math.min(1, dt * 4);
        if (st.started) { st.creep = Math.min(1.1, 0.22 + st.best / 260); st.cam += st.creep * dt; }
        if (st.pr < st.cam - 1.3 && !st.hop) die('Die Wespe hat dich geschnappt.', 'wasp');
        if (st.started) { st.idleT += dt; }
      }

      /* Zeichnen */
      function drawRow(r) {
        var row = rowAt(r), y = sy(r), top = y - T / 2;
        if (row.type === 'grass') {
          g.fillStyle = row.shade ? '#5DAE4B' : '#67B954'; g.fillRect(0, top, cssW, T + 0.5);
          g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, top, ox, T + 0.5); g.fillRect(ox + T * COLS, top, cssW, T + 0.5);
        } else if (row.type === 'road') {
          g.fillStyle = '#3A3D46'; g.fillRect(0, top, cssW, T + 0.5);
          g.fillStyle = 'rgba(255,255,255,0.5)';
          var below = rowAt(r - 1);
          if (below && below.type === 'road') for (var xx = (st.t / 1000 * 0) % 1; xx < cssW; xx += T) g.fillRect(xx + T * 0.15, top + T - 2, T * 0.5, 3);
        } else if (row.type === 'water') {
          g.fillStyle = '#3B7FB8'; g.fillRect(0, top, cssW, T + 0.5);
          g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2; g.beginPath();
          for (var wx = ((st.t / 1000 * row.speed * T * 0.4) % (T * 1.3)) - T * 1.3; wx < cssW; wx += T * 1.3) { g.moveTo(wx, top + T * 0.5); g.quadraticCurveTo(wx + T * 0.2, top + T * 0.35, wx + T * 0.4, top + T * 0.5); }
          g.stroke();
        } else {
          g.fillStyle = '#6E5A44'; g.fillRect(0, top, cssW, T + 0.5);
          g.fillStyle = '#4A3A2A'; for (var tx = 0; tx < cssW; tx += T * 0.45) g.fillRect(tx, top + T * 0.12, T * 0.14, T * 0.76);
          g.fillStyle = '#B9BEC8'; g.fillRect(0, top + T * 0.28, cssW, 3); g.fillRect(0, top + T * 0.68, cssW, 3);
          /* Warnlicht am Rand */
          var lx = ox - T * 0.4 > 4 ? ox - T * 0.4 : ox + T * 0.2;
          g.beginPath(); g.arc(lx, top + T * 0.5, T * 0.16, 0, TAU);
          g.fillStyle = row.warn && Math.floor(st.t / 150) % 2 ? '#FF3B30' : '#4A1010'; g.fill();
          if (row.warn && Math.floor(st.t / 150) % 2) { var wg = g.createRadialGradient(lx, top + T / 2, 2, lx, top + T / 2, T); wg.addColorStop(0, 'rgba(255,59,48,0.45)'); wg.addColorStop(1, 'rgba(255,59,48,0)'); g.fillStyle = wg; g.fillRect(lx - T, top - T / 2, T * 2, T * 2); }
        }
      }
      function drawRowObjs(r) {
        var row = rowAt(r), y = sy(r);
        if (row.type === 'grass') {
          row.deco.forEach(function (c) { tree(sx(c), y, 0.9); });
          for (var c = 0; c < COLS; c++) if (row.trees[c]) tree(sx(c), y, 1);
          if (row.honey >= 0) drawHoneyJar(g, sx(row.honey), y, T * 0.6, st.t + r * 50);
        } else if (row.type === 'road') {
          row.objs.forEach(function (o) {
            var cx = ox + (o.x + o.w / 2) * T;
            g.save(); g.translate(cx, y); g.rotate(row.speed > 0 ? Math.PI / 2 : -Math.PI / 2);
            var s = T / 84; g.scale(s * (o.w > 1 ? 1.15 : 1), s * (o.w > 1 ? 1.9 : 1));
            g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-18, -34, 40, 72);
            art.car(g, o.c[0], o.c[1]);
            g.restore();
          });
        } else if (row.type === 'water') {
          row.objs.forEach(function (o) {
            var x = ox + o.x * T, w = o.w * T;
            if (o.barge) {
              rr(g, x + 2, y - T * 0.36, w - 4, T * 0.72, T * 0.2); g.fillStyle = '#2B2F38'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
              g.fillStyle = '#15161A'; for (var k = 0; k < o.w; k++) { g.beginPath(); g.ellipse(x + (k + 0.5) * T, y, T * 0.32, T * 0.22, 0, 0, TAU); g.fill(); }
              g.fillStyle = '#FDC506'; g.fillRect(x + 4, y - T * 0.36, w - 8, 3);
            } else {
              rr(g, x + 3, y - T * 0.3, w - 6, T * 0.6, T * 0.28); g.fillStyle = '#7A5532'; g.fill(); g.strokeStyle = '#3A2814'; g.lineWidth = 2; g.stroke();
              g.strokeStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.moveTo(x + 8, y - T * 0.08); g.lineTo(x + w - 8, y - T * 0.08); g.moveTo(x + 12, y + T * 0.12); g.lineTo(x + w - 12, y + T * 0.12); g.stroke();
              g.beginPath(); g.ellipse(x + w - 5, y, T * 0.1, T * 0.26, 0, 0, TAU); g.fillStyle = '#B08458'; g.fill();
            }
          });
        } else if (row.train) {
          var tx0 = ox + row.train.x * T, tw = row.train.w * T;
          rr(g, tx0, y - T * 0.42, tw, T * 0.84, T * 0.2); g.fillStyle = '#E5322D'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#F4F4F4'; g.fillRect(tx0 + 4, y - T * 0.42, tw - 8, T * 0.2);
          g.fillStyle = '#1B2230'; for (var wi = tx0 + T * 0.5; wi < tx0 + tw - T * 0.5; wi += T * 0.9) g.fillRect(wi, y - T * 0.15, T * 0.55, T * 0.3);
        }
      }
      function tree(x, y, s) {
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x + T * 0.08, y + T * 0.12, T * 0.38 * s, T * 0.3 * s, 0, 0, TAU); g.fill();
        g.fillStyle = '#2E6B33'; g.beginPath(); g.arc(x, y - T * 0.05, T * 0.38 * s, 0, TAU); g.fill();
        g.fillStyle = '#3E8A42'; g.beginPath(); g.arc(x - T * 0.1, y - T * 0.15, T * 0.2 * s, 0, TAU); g.fill();
      }
      function drawPlayer() {
        var x = st.px, r = st.pr, arc = 0;
        if (st.hop) {
          var a = Math.min(1, st.hop.t / HOP_MS);
          x = st.hop.fx + (st.hop.tx - st.hop.fx) * a; r = st.hop.fr + (st.hop.tr - st.hop.fr) * a;
          arc = Math.sin(a * Math.PI) * T * 0.35;
        }
        var X = sx(x), Y = sy(r);
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(X, Y + T * 0.22, T * 0.3, T * 0.12, 0, 0, TAU); g.fill();
        g.save(); g.translate(X, Y - arc);
        if (st.dead) { var d = (st.t - st.dead) / 1300; if (st.why.indexOf('Emscher') >= 0 || st.why.indexOf('davongetrieben') >= 0) g.scale(1 - d, 1 - d); else g.scale(1.4, 0.25); }
        else { var sq = st.squash; g.scale(1 + sq * 0.2, 1 - sq * 0.2); }
        if (st.face < 0) g.scale(-1, 1);
        var s = T / 60; g.scale(s, s); g.rotate(-0.15);
        art.bumble(g, Math.sin(st.t / 30));
        g.restore();
      }
      function drawWasp() {
        /* Die Wespe lauert unten, sobald man trödelt */
        var danger = st.started ? Math.max(0, Math.min(1, (st.cam - st.pr + 0.3) / 1.6)) : 0;
        if (danger <= 0.05 && !(st.dead && st.why.indexOf('Wespe') >= 0)) return;
        var X = sx(st.px), Y = cssH - T * 0.2 - danger * T * 1.2;
        if (st.dead && st.why.indexOf('Wespe') >= 0) Y = sy(st.pr);
        g.save(); g.translate(X, Y); g.rotate(-Math.PI / 2); g.scale(T / 55, T / 55);
        art.wasp(g, Math.sin(st.t / 20));
        g.restore();
      }

      function render() {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        var r0 = Math.floor(st.cam) - 3, r1 = Math.ceil(st.cam + cssH / T) + 2;
        for (var r = r0; r <= r1; r++) drawRow(r);
        for (var r2 = r1; r2 >= r0; r2--) { drawRowObjs(r2); if (r2 === Math.round(st.hop ? st.hop.tr : st.pr)) drawPlayer(); }
        drawWasp();
        st.parts.forEach(function (p) { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fillStyle = p.c; g.fill(); });
        g.globalAlpha = 1;
        /* Punkte oben links */
        g.textAlign = 'left'; g.textBaseline = 'top'; g.lineJoin = 'round';
        g.font = '900 ' + Math.max(26, T * 0.8) + 'px Poppins, sans-serif';
        g.lineWidth = 6; g.strokeStyle = 'rgba(17,17,17,0.8)'; g.strokeText(String(st.score), 12, 10);
        g.fillStyle = '#FFFFFF'; g.fillText(String(st.score), 12, 10);
        if (st.on && st.hint && !st.paused) {
          var txt = ctx.touch() ? 'Tippen hüpft, wischen geht zur Seite' : 'W oder ↑ hüpft nach vorn';
          g.font = '700 14px Poppins, sans-serif';
          var w = Math.min(cssW - 20, g.measureText(txt).width + 26), h = 32, hx = cssW / 2, hy = sy(st.pr) - T * 1.6;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, hx - w / 2, hy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, hx, hy + 1, w - 14);
          g.globalAlpha = 1;
        }
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.05, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.over) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }
      function idle(now) {
        if (st.on) return;
        var dt = st.idleLast ? Math.min(0.05, (now - st.idleLast) / 1000) : 0; st.idleLast = now;
        st.t += dt * 1000;
        var r0 = Math.floor(st.cam) - 3, r1 = Math.ceil(st.cam + cssH / T) + 2;
        for (var r = r0; r <= r1; r++) { var row = rowAt(r); if (row.objs) row.objs.forEach(function (o) { o.x += row.speed * dt; if (row.speed > 0 && o.x > COLS + margin + 1) o.x -= row.span; if (row.speed < 0 && o.x + o.w < -margin - 1) o.x += row.span; }); }
        render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() { st.on = false; ptr = null; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() { stop(); render(); ctx.finish(st.score, { rows: st.best, honey: st.honey, why: st.why }); }

      /* Tippen = vor, Wischen = Richtung */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e);
        ptr = { id: e.pointerId, x: p.x, y: p.y, done: false };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id || ptr.done) return;
        var p = local(e), dx = p.x - ptr.x, dy = p.y - ptr.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        ptr.done = true;
        if (Math.abs(dx) > Math.abs(dy)) tryHop(dx > 0 ? 1 : -1, 0); else tryHop(0, dy < 0 ? 1 : -1);
      });
      cv.addEventListener('pointerup', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        if (!ptr.done) tryHop(0, 1);
        ptr = null;
      });
      cv.addEventListener('pointercancel', function () { ptr = null; });

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); layout();
          st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; ptr = null; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); layout(); render(); },
        unmount: stop,
        resize: function () { layout(); render(); },
        key: function (e) {
          var k = e.key;
          if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') { if (!e.repeat) tryHop(0, 1); return true; }
          if (k === 'ArrowDown' || k === 's' || k === 'S') { if (!e.repeat) tryHop(0, -1); return true; }
          if (k === 'ArrowLeft' || k === 'a' || k === 'A') { if (!e.repeat) tryHop(-1, 0); return true; }
          if (k === 'ArrowRight' || k === 'd' || k === 'D') { if (!e.repeat) tryHop(1, 0); return true; }
          return false;
        },
        _debug: function () { return { st: st, rowAt: rowAt, sx: sx, sy: sy, T: T }; }
      };
    }
  });
})();

/* Spiel 7: Wespennest (Minesweeper-Prinzip auf Waben) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, SQ3 = Math.sqrt(3), BAR = 56, LONG_PRESS = 420;
  var art = MBArcade.art, rr = art.rrect;
  var NUM_COLORS = ['', '#5FA8E8', '#5CC46A', '#FF7A6B', '#B78CFF', '#FF9F1A', '#FF4FA0'];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Level: mehr Waben und mehr Nester */
  function levelConf(lv) {
    return { cells: Math.min(190, 56 + (lv - 1) * 26), density: Math.min(0.2, 0.13 + (lv - 1) * 0.012) };
  }
  /* Nachbarn bei versetzten Reihen (ungerade Reihen eine halbe Wabe nach rechts) */
  var NB = [
    [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]],
    [[0, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]]
  ];

  function drawNest(g, x, y, r) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.ellipse(0, r * 0.08, r * 0.62, r * 0.72, 0, 0, TAU);
    g.fillStyle = '#B8AE9C'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.07); g.strokeStyle = '#111'; g.stroke();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(80,70,55,0.6)'; g.lineWidth = Math.max(1, r * 0.06);
    for (var i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(0, r * (0.08 + i * 0.2), r * 0.7, r * 0.12, 0, 0, Math.PI); g.stroke(); }
    g.restore();
    g.fillStyle = '#111'; g.beginPath(); g.ellipse(0, r * 0.5, r * 0.16, r * 0.12, 0, 0, TAU); g.fill();
    g.fillStyle = '#6B5E48'; g.fillRect(-r * 0.06, -r * 0.82, r * 0.12, r * 0.2);
    g.restore();
  }
  function drawFlag(g, x, y, r) {
    g.save(); g.translate(x, y);
    g.strokeStyle = '#111'; g.lineWidth = Math.max(1.5, r * 0.09); g.lineCap = 'round';
    g.beginPath(); g.moveTo(-r * 0.25, r * 0.55); g.lineTo(-r * 0.25, -r * 0.55); g.stroke();
    g.beginPath(); g.moveTo(-r * 0.22, -r * 0.55); g.lineTo(r * 0.5, -r * 0.32); g.lineTo(-r * 0.22, -r * 0.08); g.closePath();
    g.fillStyle = '#E5322D'; g.fill(); g.lineWidth = Math.max(1, r * 0.06); g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.ellipse(-r * 0.25, r * 0.58, r * 0.3, r * 0.09, 0, 0, TAU); g.fill();
    g.restore();
  }
  function hexPath(g, x, y, r) {
    g.beginPath();
    for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.closePath();
  }
  function coverCell(g, x, y, r, hl) {
    hexPath(g, x, y, r * 0.94);
    var gr = g.createLinearGradient(0, y - r, 0, y + r);
    gr.addColorStop(0, hl ? '#4A4433' : '#34302A'); gr.addColorStop(1, hl ? '#2E2A20' : '#201D19');
    g.fillStyle = gr; g.fill();
    g.lineWidth = Math.max(1.5, r * 0.1); g.strokeStyle = hl ? '#FDC506' : '#6B5A2A'; g.stroke();
  }
  function openCell(g, x, y, r) {
    hexPath(g, x, y, r * 0.94);
    g.fillStyle = '#5A4410'; g.fill();
    hexPath(g, x, y, r * 0.8);
    g.fillStyle = '#7A5C14'; g.fill();
  }

  MBArcade.register({
    id: 'nester',
    title: 'Wespennest',
    duration: 0,
    startText: 'Unter den Waben haben sich Wespen eingenistet. Deck alle freien Waben auf, ohne ein Nest zu erwischen. Die Zahl sagt, wie viele Nester direkt daneben liegen.',
    help: {
      legendTitle: 'So funktioniert es',
      controls: [
        { icons: ['mouse-left', 'tap'], text: 'Wabe aufdecken' },
        { icons: ['mouse-right'], text: 'Nest markieren (rechte Maustaste oder Taste F)', kb: true },
        { icons: ['tap'], text: 'Lange drücken oder unten auf „Markieren“ umschalten', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { openCell(g, 23, 23, 20); g.fillStyle = NUM_COLORS[2]; g.font = '800 18px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('2', 23, 24); }, text: 'Die Zahl zeigt die Nester in den 6 Nachbarwaben', val: '+' },
        { draw: function (g) { coverCell(g, 23, 23, 20, false); drawFlag(g, 24, 23, 15); }, text: 'Markiere Waben, unter denen ein Nest sein muss' },
        { draw: function (g) { openCell(g, 23, 23, 20); drawNest(g, 23, 24, 15); }, text: 'Nest erwischt', val: 'Ende', minus: true },
        { draw: function (g) { g.translate(23, 23); g.scale(0.5, 0.5); art.queen(g, 0.5); }, text: 'Feld leer geräumt: Bonus und nächstes Level', val: 'Bonus' }
      ]
    },
    cta: { path: 'webseiten-wartung/', text: 'Sicherheitslücken auf deiner Website finden wir, bevor sie zustechen.' },
    stats: function (s) {
      var t = 'Level ' + s.level + ' erreicht, ' + s.opened + (s.opened === 1 ? ' Wabe' : ' Waben') + ' aufgedeckt';
      return t + (s.cleared ? ', ' + s.cleared + (s.cleared === 1 ? ' Feld komplett geräumt.' : ' Felder komplett geräumt.') : '.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, raf = 0, idleRaf = 0, ptr = null;
      var R = 24, ox = 0, oy = 0;
      var st = fresh(1);

      function fresh(level) {
        var s = {
          on: false, paused: false, dead: false, deadT: 0, t: 0, last: 0, levelT: 0,
          level: level, score: 0, opened: 0, cleared: 0,
          cols: 0, rows: 0, cells: [], nests: 0, placed: false, flagMode: false, flags: 0,
          cur: null, parts: [], pops: [], wasps: [], reveal: [], shake: 0, flash: 0, flashC: '255,74,61',
          nextAt: 0, boom: [], hint: true
        };
        st = s;
        build(s);
        return s;
      }

      function build(s) {
        var r = cv.getBoundingClientRect();
        var aw = r.width || 900, ah = (r.height || 500) - BAR;
        var conf = levelConf(s.level), asp = aw / ah;
        var cols = Math.max(5, Math.round(Math.sqrt(conf.cells * asp * 1.5 / SQ3)));
        var rows = Math.max(5, Math.round(conf.cells / cols));
        s.cols = cols; s.rows = rows;
        s.cells = [];
        for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) s.cells.push({ x: x, y: y, nest: false, n: 0, open: false, flag: false, openT: 0, pop: 0 });
        s.nests = Math.max(4, Math.round(cols * rows * conf.density));
        s.placed = false; s.flags = 0; s.levelT = 0;
        s.cur = cell(s, Math.floor(cols / 2), Math.floor(rows / 2));
      }
      function cell(s, x, y) { return x < 0 || y < 0 || x >= s.cols || y >= s.rows ? null : s.cells[y * s.cols + x]; }
      function neighbors(c) {
        var out = [];
        NB[c.y % 2].forEach(function (d) { var n = cell(st, c.x + d[0], c.y + d[1]); if (n) out.push(n); });
        return out;
      }
      /* Erst nach dem ersten Klick verteilen: Die erste Wabe und ihre Nachbarn sind immer frei */
      function place(first) {
        var safe = [first].concat(neighbors(first));
        var pool = st.cells.filter(function (c) { return safe.indexOf(c) < 0; });
        for (var i = 0; i < st.nests && pool.length; i++) {
          var j = Math.floor(Math.random() * pool.length);
          pool[j].nest = true; pool.splice(j, 1);
        }
        st.cells.forEach(function (c) { c.n = neighbors(c).filter(function (n) { return n.nest; }).length; });
        st.placed = true;
      }

      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        var aw = cssW - 16, ah = cssH - BAR - 12;
        R = Math.min(aw / (SQ3 * (st.cols + 0.5)), ah / (1.5 * st.rows + 0.5));
        var bw = SQ3 * R * (st.cols + 0.5), bh = R * (1.5 * st.rows + 0.5);
        ox = (cssW - bw) / 2 + SQ3 * R / 2; oy = 6 + (ah - bh) / 2 + R;
      }
      function center(c) { return { x: ox + SQ3 * R * (c.x + (c.y % 2 ? 0.5 : 0)), y: oy + 1.5 * R * c.y }; }
      function cellAt(px, py) {
        var best = null, bd = 1e9;
        st.cells.forEach(function (c) { var p = center(c), d = (p.x - px) * (p.x - px) + (p.y - py) * (p.y - py); if (d < bd) { bd = d; best = c; } });
        return bd <= R * R ? best : null;
      }

      function pop(x, y, text, color, big) { st.pops.push({ x: x, y: y, text: text, color: color || '#FDC506', t0: st.t, big: !!big }); }
      function puff(x, y, colors, n, speed) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.4 + Math.random() * 0.4, size: 1.5 + Math.random() * 2.5, c: colors[i % colors.length] });
        }
      }
      function shakeIt(v) { if (!ctx.reduce) st.shake = Math.max(st.shake, v); }

      function safeLeft() { return st.cells.filter(function (c) { return !c.nest && !c.open; }).length; }

      /* Aufdecken: leere Waben öffnen sich als Welle nach außen */
      function open(c) {
        if (!st.on || st.paused || st.dead || st.nextAt || !c || c.open || c.flag) return;
        st.hint = false;
        if (!st.placed) place(c);
        if (c.nest) { explode(c); return; }
        var q = [[c, 0]], seen = [c], n = 0;
        while (q.length) {
          var it = q.shift(), cc = it[0];
          cc.open = true; cc.openT = st.t + it[1] * (ctx.reduce ? 0 : 35); n++;
          if (cc.n === 0) neighbors(cc).forEach(function (nb) { if (!nb.open && !nb.flag && !nb.nest && seen.indexOf(nb) < 0) { seen.push(nb); q.push([nb, it[1] + 1]); } });
        }
        var pts = n * 2 * st.level;
        st.opened += n; st.score += pts; ctx.setScore(st.score);
        var p = center(c);
        pop(p.x, p.y - R * 0.6, '+' + pts, n > 8 ? '#FFE680' : '#FDC506');
        puff(p.x, p.y, ['#FDC506', '#FFE680', '#C98A00'], n > 1 ? 14 : 6, n > 1 ? 160 : 90);
        if (n > 8) { shakeIt(0.08); ctx.tone(520, 1040, 0.15, 'triangle', 0.05); }
        else ctx.tone(700 + Math.random() * 120, 980, 0.05, 'triangle', 0.04);
        if (!safeLeft()) win();
      }
      /* Auf einer Zahl: Sind genug Waben markiert, werden die übrigen Nachbarn aufgedeckt */
      function chord(c) {
        var nb = neighbors(c), fl = nb.filter(function (x) { return x.flag; }).length;
        if (!c.n || fl !== c.n) { ctx.tone(180, 150, 0.06, 'square', 0.02); c.pop = 1; return; }
        nb.forEach(function (x) { if (!x.open && !x.flag) open(x); });
      }
      function toggleFlag(c) {
        if (!st.on || st.paused || st.dead || st.nextAt || !c || c.open) return;
        st.hint = false;
        c.flag = !c.flag; c.pop = 1;
        st.flags += c.flag ? 1 : -1;
        ctx.tone(c.flag ? 440 : 330, c.flag ? 660 : 220, 0.06, 'triangle', 0.04);
        if (navigator.vibrate && ptr) { try { navigator.vibrate(15); } catch (e) {} }
      }
      function tap(c) {
        if (!c) return;
        st.cur = c;
        if (c.open) chord(c);
        else if (st.flagMode) toggleFlag(c);
        else open(c);
      }

      function explode(c) {
        st.dead = true; st.deadT = st.t; c.open = true; c.openT = st.t;
        st.flash = 1; st.flashC = '255,74,61';
        shakeIt(0.45);
        var p = center(c);
        puff(p.x, p.y, ['#B8AE9C', '#111', '#FFD400'], 26, 260);
        ctx.tone(220, 60, 0.4, 'sawtooth', 0.07);
        /* Die übrigen Nester gehen nacheinander auf */
        var others = st.cells.filter(function (x) { return x.nest && x !== c; });
        others.sort(function (a, b) { var pa = center(a), pb = center(b); return Math.hypot(pa.x - p.x, pa.y - p.y) - Math.hypot(pb.x - p.x, pb.y - p.y); });
        st.boom = others.map(function (x, i) { return { c: x, at: st.t + 180 + i * 70 }; });
        for (var i = 0; i < 6; i++) wasp(p.x, p.y);
      }
      function wasp(x, y) {
        if (ctx.reduce && st.wasps.length > 6) return;
        var a = rnd(0, TAU), v = rnd(160, 320);
        st.wasps.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, t: 0, wob: rnd(0, 10) });
      }

      function win() {
        var secs = st.levelT / 1000, bonus = 100 * st.level + Math.max(0, Math.round((40 + 20 * st.level - secs) * 2));
        st.score += bonus; st.cleared++; ctx.setScore(st.score);
        st.nextAt = st.t + 1500;
        st.flash = 0.6; st.flashC = '253,197,6';
        pop(cssW / 2, (cssH - BAR) * 0.45, 'Feld geräumt! +' + bonus, '#FDC506', true);
        st.cells.forEach(function (c) { if (c.nest && !c.flag) { c.flag = true; c.pop = 1; } });
        for (var i = 0; i < 4; i++) puff(rnd(0, cssW), rnd(0, cssH - BAR), ['#FDC506', '#FFE680', '#FFFFFF'], 12, 220);
        ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.12, 'triangle', 0.06, 0.12); ctx.tone(1046, 1568, 0.2, 'triangle', 0.05, 0.24);
      }
      function nextLevel() {
        var keep = { score: st.score, opened: st.opened, cleared: st.cleared, t: st.t };
        fresh(st.level + 1);
        st.score = keep.score; st.opened = keep.opened; st.cleared = keep.cleared; st.t = keep.t;
        st.on = true; st.last = performance.now(); st.hint = false;
        layout();
        st.cells.forEach(function (c) { var p = center(c); c.openT = st.t + (p.x + p.y) * 0.6; });
        pop(cssW / 2, (cssH - BAR) * 0.45, 'Level ' + st.level, '#FFFFFF', true);
        ctx.tone(330, 660, 0.2, 'triangle', 0.05);
      }

      function update(dt) {
        st.t += dt * 1000;
        if (!st.dead && !st.nextAt && st.placed) st.levelT += dt * 1000;
        if (st.nextAt && st.t >= st.nextAt) { st.nextAt = 0; nextLevel(); }
        for (var b = st.boom.length - 1; b >= 0; b--) {
          if (st.t >= st.boom[b].at) {
            var c = st.boom[b].c, p = center(c);
            c.open = true; c.openT = st.t;
            puff(p.x, p.y, ['#B8AE9C', '#111'], 8, 140);
            if (Math.random() < 0.6) wasp(p.x, p.y);
            ctx.tone(rnd(160, 260), 80, 0.08, 'sawtooth', 0.03);
            shakeIt(0.08);
            st.boom.splice(b, 1);
          }
        }
        st.wasps.forEach(function (w) {
          w.t += dt; w.vx += Math.sin(st.t / 120 + w.wob) * 600 * dt; w.vy += Math.cos(st.t / 150 + w.wob) * 500 * dt - 40 * dt;
          w.x += w.vx * dt; w.y += w.vy * dt;
        });
        st.wasps = st.wasps.filter(function (w) { return w.t < 3; });
        st.cells.forEach(function (c) { c.pop = Math.max(0, c.pop - dt * 5); });
        for (var q = st.parts.length - 1; q >= 0; q--) {
          var pt = st.parts[q];
          pt.t += dt; pt.vy += 300 * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt;
          if (pt.t > pt.life) st.parts.splice(q, 1);
        }
        st.pops = st.pops.filter(function (pp) { return st.t - pp.t0 < (pp.big ? 1300 : 800); });
        st.shake = Math.max(0, st.shake - dt);
        st.flash = Math.max(0, st.flash - dt * 2.2);
      }

      function drawCell(c) {
        var p = center(c), r = R, age = st.t - c.openT;
        var s = 1 + c.pop * 0.12;
        if (!c.open || age < 0) {
          var appear = st.t - c.openT < 0 && !c.open ? Math.max(0, 1 + (st.t - c.openT) / 300) : 1;
          g.save(); g.translate(p.x, p.y); g.scale(s * Math.min(1, appear + 0.001), s * Math.min(1, appear + 0.001));
          coverCell(g, 0, 0, r, st.cur === c && !ctx.touch());
          if (c.flag) drawFlag(g, 1, 0, r * 0.72);
          g.restore();
          return;
        }
        var e = Math.min(1, age / 160);
        g.save(); g.translate(p.x, p.y); g.scale(0.7 + 0.3 * e, 0.7 + 0.3 * e);
        openCell(g, 0, 0, r);
        if (c.nest) {
          drawNest(g, 0, 1, r * 0.72);
          if (c.flag) { g.strokeStyle = '#5CC46A'; g.lineWidth = Math.max(2, r * 0.1); hexPath(g, 0, 0, r * 0.88); g.stroke(); }
        } else if (c.n) {
          g.font = '800 ' + r * 0.95 + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = Math.max(2, r * 0.14); g.strokeStyle = 'rgba(17,17,17,0.6)'; g.strokeText(String(c.n), 0, r * 0.06);
          g.fillStyle = NUM_COLORS[c.n]; g.fillText(String(c.n), 0, r * 0.06);
        }
        if (c.flag && !c.nest && st.dead) {
          g.strokeStyle = '#E5322D'; g.lineWidth = Math.max(2, r * 0.12); g.lineCap = 'round';
          g.beginPath(); g.moveTo(-r * 0.4, -r * 0.4); g.lineTo(r * 0.4, r * 0.4); g.moveTo(r * 0.4, -r * 0.4); g.lineTo(-r * 0.4, r * 0.4); g.stroke();
        }
        if (st.cur === c && !ctx.touch()) { hexPath(g, 0, 0, r * 0.92); g.strokeStyle = '#FDC506'; g.lineWidth = Math.max(1.5, r * 0.1); g.stroke(); }
        g.restore();
      }

      function drawBar() {
        var y = cssH - BAR;
        g.fillStyle = '#151515'; g.fillRect(0, y, cssW, BAR);
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.textAlign = 'left'; g.textBaseline = 'middle';
        g.font = '700 ' + (cssW < 420 ? 13 : 15) + 'px Poppins, sans-serif';
        g.fillText('Level ' + st.level, 14, y + BAR / 2 - 9);
        g.font = '600 ' + (cssW < 420 ? 12 : 13) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.6)';
        g.fillText('Nester: ' + st.nests + ' · markiert: ' + st.flags, 14, y + BAR / 2 + 10);
        var bw = Math.min(200, cssW * 0.44), bh = BAR - 16, bx = cssW - bw - 10, by = y + 8;
        rr(g, bx, by, bw, bh, bh / 2); g.fillStyle = '#262626'; g.fill();
        var half = bw / 2;
        rr(g, bx + (st.flagMode ? half : 0) + 3, by + 3, half - 6, bh - 6, (bh - 6) / 2); g.fillStyle = '#FDC506'; g.fill();
        g.textAlign = 'center'; g.font = '700 13px Poppins, sans-serif';
        g.fillStyle = st.flagMode ? '#FFFFFF' : '#111'; g.fillText('Aufdecken', bx + half / 2, by + bh / 2 + 1, half - 10);
        g.fillStyle = st.flagMode ? '#111' : '#FFFFFF'; g.fillText('Markieren', bx + half * 1.5, by + bh / 2 + 1, half - 10);
      }
      function inToggle(px, py) {
        var bw = Math.min(200, cssW * 0.44);
        return py > cssH - BAR && px > cssW - bw - 14;
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = 9 * Math.min(1, st.shake / 0.2); sx = (Math.random() * 2 - 1) * m * dpr; sy = (Math.random() * 2 - 1) * m * dpr; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        var bg = g.createRadialGradient(cv.width / 2, cv.height * 0.4, 10, cv.width / 2, cv.height * 0.4, Math.max(cv.width, cv.height) * 0.7);
        bg.addColorStop(0, '#1D1A14'); bg.addColorStop(1, '#0D0C0A');
        g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(dpr, 0, 0, dpr, sx, sy);
        st.cells.forEach(drawCell);
        st.parts.forEach(function (pt) {
          g.globalAlpha = Math.max(0, 1 - pt.t / pt.life);
          g.beginPath(); g.arc(pt.x, pt.y, pt.size, 0, TAU); g.fillStyle = pt.c; g.fill();
        });
        g.globalAlpha = 1;
        st.wasps.forEach(function (w) {
          g.save(); g.translate(w.x, w.y); g.scale((w.vx < 0 ? -1 : 1) * R / 60, R / 60);
          art.wasp(g, Math.sin(st.t / 20 + w.wob));
          g.restore();
        });
        st.pops.forEach(function (p) {
          var life = p.big ? 1300 : 800, age = (st.t - p.t0) / life;
          g.save(); g.translate(p.x, p.y - age * (p.big ? 24 : 36));
          var s = age < 0.15 ? 0.6 + age / 0.15 * 0.6 : 1.2 - Math.min(0.2, age - 0.15);
          g.scale(s, s);
          g.globalAlpha = age > 0.65 ? Math.max(0, 1 - (age - 0.65) / 0.35) : 1;
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
          g.font = '800 ' + (p.big ? Math.min(36, cssW / 12) : 18) + 'px Poppins, sans-serif';
          g.lineWidth = p.big ? 7 : 4; g.strokeStyle = 'rgba(17,17,17,0.9)'; g.strokeText(p.text, 0, 0);
          g.fillStyle = p.color; g.fillText(p.text, 0, 0);
          g.restore();
        });
        if (st.on && st.hint && !st.paused) {
          var txt = ctx.touch() ? 'Tipp auf eine Wabe, die erste ist immer frei' : 'Klick auf eine Wabe, die erste ist immer frei';
          g.font = '700 14px Poppins, sans-serif';
          var w = Math.min(cssW - 20, g.measureText(txt).width + 26), h = 32, cx = cssW / 2, cy = (cssH - BAR) - 30;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, cx - w / 2, cy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cx, cy + 1, w - 14);
          g.globalAlpha = 1;
        }
        drawBar();
        if (st.flash > 0) {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.fillStyle = 'rgba(' + st.flashC + ',' + st.flash * 0.3 + ')'; g.fillRect(0, 0, cv.width, cv.height);
        }
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.033, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.dead && !st.boom.length && st.t - st.deadT > 1400) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }
      function idle(now) {
        if (st.on) return;
        st.t = now;
        render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() {
        st.on = false; ptr = null;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(idleRaf);
      }
      function finish() {
        stop();
        render();
        ctx.finish(st.score, { level: st.level, opened: st.opened, cleared: st.cleared });
      }

      /* Eingabe: Tippen deckt auf, langes Drücken oder Rechtsklick markiert */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        e.preventDefault();
        var p = local(e);
        if (p.y > cssH - BAR) {
          if (inToggle(p.x, p.y)) { st.flagMode = !st.flagMode; ctx.tone(600, 800, 0.05, 'triangle', 0.03); }
          return;
        }
        var c = cellAt(p.x, p.y);
        if (!c) return;
        if (e.pointerType === 'mouse') {
          if (e.button === 2) { st.cur = c; if (c.open) chord(c); else toggleFlag(c); }
          else if (e.button === 0) tap(c);
          return;
        }
        ptr = { id: e.pointerId, x: p.x, y: p.y, c: c, done: false };
        ptr.timer = setTimeout(function () {
          if (!ptr || ptr.done) return;
          ptr.done = true;
          st.cur = c;
          if (c.open) chord(c); else toggleFlag(c);
        }, LONG_PRESS);
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var p = local(e);
        if (Math.hypot(p.x - ptr.x, p.y - ptr.y) > 14) { clearTimeout(ptr.timer); ptr = null; }
      });
      cv.addEventListener('pointerup', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        clearTimeout(ptr.timer);
        if (!ptr.done) tap(ptr.c);
        ptr = null;
      });
      cv.addEventListener('pointercancel', function () { if (ptr) clearTimeout(ptr.timer); ptr = null; });

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf);
          cancelAnimationFrame(raf);
          fresh(1);
          layout();
          st.on = true; st.t = 0;
          st.last = performance.now();
          st.cells.forEach(function (c) { var p = center(c); c.openT = (p.x + p.y) * 0.5; });
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on;
          if (ptr) { clearTimeout(ptr.timer); ptr = null; }
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); fresh(1); layout(); render(); },
        unmount: stop,
        resize: function () { layout(); render(); },
        key: function (e) {
          var c = st.cur;
          if (!c) return false;
          var k = e.key, nx = c.x, ny = c.y;
          if (k === 'ArrowLeft' || k === 'a' || k === 'A') nx--;
          else if (k === 'ArrowRight' || k === 'd' || k === 'D') nx++;
          else if (k === 'ArrowUp' || k === 'w' || k === 'W') ny--;
          else if (k === 'ArrowDown' || k === 's' || k === 'S') ny++;
          else if (k === ' ' || k === 'Enter') { tap(c); return true; }
          else if (k === 'f' || k === 'F' || k === 'm' || k === 'M') { if (c.open) chord(c); else toggleFlag(c); return true; }
          else return false;
          var n = cell(st, Math.max(0, Math.min(st.cols - 1, nx)), Math.max(0, Math.min(st.rows - 1, ny)));
          if (n) { st.cur = n; st.hint = false; }
          return true;
        },
        _debug: function () { return { st: st, center: center, open: open, R: R }; }
      };
    }
  });
})();

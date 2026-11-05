/* Spiel 10: Wabenbau (Tetris-Prinzip mit Sechseck-Waben) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, SQ3 = Math.sqrt(3), COLS = 9, ROWS = 16, TOP = 46;
  var LOCK_MS = 450, MAX_RESETS = 12;
  /* Teile aus je vier Waben, Koordinaten axial (q, r), Spalten stehen senkrecht */
  var SHAPES = [
    { k: 'stab', c: '#FDC506', cells: [[0, 0], [0, -1], [0, 1], [0, 2]] },
    { k: 'welle', c: '#FF9F1A', cells: [[0, 0], [0, -1], [1, 0], [1, 1]] },
    { k: 'welle2', c: '#E9A800', cells: [[0, 0], [0, -1], [-1, 1], [-1, 2]] },
    { k: 'biene', c: '#FFE680', cells: [[0, 0], [1, -1], [1, 0], [0, 1]] },
    { k: 'stern', c: '#FF8AD8', cells: [[0, 0], [1, -1], [-1, 0], [0, 1]] },
    { k: 'haken', c: '#5CC46A', cells: [[0, 0], [0, -1], [0, 1], [1, 0]] },
    { k: 'bogen', c: '#7FD3FF', cells: [[0, 0], [1, -1], [-1, 0], [-1, 1]] }
  ];
  var LINE_PTS = [0, 100, 300, 500, 800], LINE_TXT = ['', '', 'Doppelt!', 'Dreifach!', 'WABEN-WAHNSINN!'];
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rot(c) { return [-c[1], c[0] + c[1]]; }
  function toOffset(q, r) { return { c: q, r: r + (q - (q & 1)) / 2 }; }
  function toAxial(c, r) { return { q: c, r: r - (c - (c & 1)) / 2 }; }
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f)))); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  function flatHex(g, x, y, r) {
    g.beginPath();
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.closePath();
  }
  /* Eine gefüllte Wabe mit Glanz, wie ein Honigtropfen */
  function drawCell(g, x, y, r, color, alpha) {
    g.save(); g.globalAlpha = alpha === undefined ? 1 : alpha;
    flatHex(g, x, y, r * 0.94);
    var gr = g.createLinearGradient(x, y - r, x, y + r);
    gr.addColorStop(0, shade(color, 0.35)); gr.addColorStop(1, shade(color, -0.25));
    g.fillStyle = gr; g.fill();
    g.lineWidth = Math.max(1.2, r * 0.12); g.strokeStyle = '#111'; g.stroke();
    flatHex(g, x, y - r * 0.05, r * 0.55); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fill();
    g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.4, r * 0.22, r * 0.11, -0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
    g.restore();
  }

  MBArcade.register({
    id: 'wabenbau',
    title: 'Wabenbau',
    duration: 0,
    startText: 'Bau den Stock! Die Waben-Teile fallen von oben. Ist eine Wabenreihe quer übers Feld voll, verschwindet sie. Wird es oben zu eng, ist der Bau vorbei.',
    help: {
      legendTitle: 'Punkte',
      controls: [
        { icons: ['kbd:← →'], text: 'Teil verschieben', kb: true },
        { icons: ['kbd:↑', 'kbd:X'], text: 'Drehen (Z dreht andersherum)', kb: true },
        { icons: ['kbd:↓'], text: 'Schneller fallen lassen', kb: true },
        { icons: ['kbd:Leertaste'], text: 'Teil sofort ganz nach unten', kb: true },
        { icons: ['swipe'], text: 'Wischen links/rechts schiebt, nach unten lässt fallen', touch: true },
        { icons: ['tap'], text: 'Tippen dreht das Teil', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { for (var i = 0; i < 4; i++) drawCell(g, 6 + i * 11, 23 + (i % 2 ? 6 : 0), 7, '#FDC506'); }, text: 'Eine Reihe voll', val: '100 × Level' },
        { draw: function (g) { for (var j = 0; j < 2; j++) for (var i = 0; i < 4; i++) drawCell(g, 6 + i * 11, 16 + j * 12 + (i % 2 ? 6 : 0), 7, j ? '#FF9F1A' : '#FDC506'); }, text: 'Zwei, drei oder vier Reihen auf einmal', val: 'bis 800 × Level' },
        { draw: function (g) { drawCell(g, 23, 15, 8, '#5CC46A'); drawCell(g, 23, 30, 8, '#5CC46A', 0.3); }, text: 'Sofort fallen lassen bringt 2 Punkte pro Wabe Fallhöhe', val: '+2' }
      ]
    },
    cta: { path: 'unsere-leistungen/', text: 'Wir bauen Websites, die genauso gut zusammenpassen. Sprich uns an.' },
    stats: function (s) {
      return s.lines + (s.lines === 1 ? ' Reihe' : ' Reihen') + ' geschafft, Level ' + s.level + ', ' + s.pieces + ' Teile verbaut' + (s.best >= 2 ? ', bester Zug: ' + s.best + ' Reihen auf einmal.' : '.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, R = 16, ox = 0, oy = 0, bw = 0, bh = 0;
      var raf = 0, idleRaf = 0, ptr = null, bag = [];
      var st = fresh();

      function fresh() {
        var grid = [];
        for (var c = 0; c < COLS; c++) { grid.push([]); for (var r = 0; r < ROWS; r++) grid[c].push(null); }
        return {
          on: false, paused: false, over: false, t: 0, last: 0, score: 0, lines: 0, level: 1, pieces: 0, best: 0,
          grid: grid, cur: null, next: null, fall: 0, lockT: 0, resets: 0, clearing: null, dying: 0,
          parts: [], shake: 0, flash: 0, hint: true, idleY: 0
        };
      }
      function draw7() { if (!bag.length) { bag = SHAPES.slice(); bag.sort(function () { return Math.random() - 0.5; }); } return bag.pop(); }
      function newPiece(shape) { return { s: shape, cells: shape.cells.map(function (c) { return c.slice(); }), pc: 4, pr: 1 }; }
      function cellsOf(p, pc, pr, cells) {
        var a = toAxial(pc === undefined ? p.pc : pc, pr === undefined ? p.pr : pr);
        return (cells || p.cells).map(function (c) { return toOffset(a.q + c[0], a.r + c[1]); });
      }
      function fits(cs) {
        for (var i = 0; i < cs.length; i++) {
          var c = cs[i];
          if (c.c < 0 || c.c >= COLS || c.r >= ROWS) return false;
          if (c.r >= 0 && st.grid[c.c][c.r]) return false;
        }
        return true;
      }

      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        var aw = cssW - 16, ah = cssH - TOP - 12;
        R = Math.min(aw / (1.5 * (COLS - 1) + 2), ah / (SQ3 * (ROWS + 0.5)));
        bw = R * (1.5 * (COLS - 1) + 2); bh = R * SQ3 * (ROWS + 0.5);
        ox = (cssW - bw) / 2; oy = TOP + (ah - bh) / 2 + 4;
      }
      function cx(c) { return ox + R + c * 1.5 * R; }
      function cy(c, r) { return oy + SQ3 * R * (r + 0.5) + (c & 1 ? SQ3 * R / 2 : 0); }

      function spawn() {
        st.cur = newPiece(st.next ? st.next : draw7());
        st.next = draw7();
        st.fall = 0; st.lockT = 0; st.resets = 0;
        if (!fits(cellsOf(st.cur))) { gameOver(); return; }
      }
      function gameOver() {
        st.dying = st.t; st.cur = null;
        ctx.fx.flash('255,74,61', 1); ctx.fx.shake(0.5, 12);
        ctx.fx.banner('Der Stock ist voll!', '#FF7A6B');
        ctx.tone(440, 60, 0.9, 'sawtooth', 0.05);
      }

      /* Seitlich: eine Spalte weiter, die Zeile bleibt (die Wabe rutscht dabei halb hoch oder runter) */
      function tryMove(dc, dr) {
        var p = st.cur;
        if (!p) return false;
        var npc = p.pc + dc, npr = p.pr + dr;
        if (fits(cellsOf(p, npc, npr))) {
          p.pc = npc; p.pr = npr;
          if (st.lockT && st.resets < MAX_RESETS) { st.lockT = 0; st.resets++; }
          return true;
        }
        return false;
      }
      function rotate(dir) {
        var p = st.cur;
        if (!p) return;
        var cells = p.cells.map(function (c) { var n = c; var times = dir > 0 ? 1 : 5; for (var i = 0; i < times; i++) n = rot(n); return n; });
        var kicks = [[0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]];
        for (var i = 0; i < kicks.length; i++) {
          var npc = p.pc + kicks[i][0], npr = p.pr + kicks[i][1];
          if (fits(cellsOf(p, npc, npr, cells))) {
            p.cells = cells; p.pc = npc; p.pr = npr;
            if (st.lockT && st.resets < MAX_RESETS) { st.lockT = 0; st.resets++; }
            ctx.tone(660, 880, 0.04, 'triangle', 0.03);
            return;
          }
        }
        ctx.tone(160, 140, 0.05, 'square', 0.02);
      }
      function hardDrop() {
        var p = st.cur;
        if (!p) return;
        var n = 0;
        while (fits(cellsOf(p, p.pc, p.pr + 1))) { p.pr++; n++; }
        st.score += n * 2; ctx.setScore(st.score);
        var cs = cellsOf(p), mx = 0, my = 0;
        cs.forEach(function (c) { mx += cx(c.c) / cs.length; my = Math.max(my, cy(c.c, c.r)); });
        ctx.fx.ring(mx, my + R * 0.6, '#FFFFFF', R * 4, 4, 350);
        ctx.fx.shake(0.12, 3 + Math.min(6, n * 0.4));
        for (var i = 0; i < 6; i++) st.parts.push({ x: mx + rnd(-R * 1.5, R * 1.5), y: my + R * 0.6, vx: rnd(-80, 80), vy: rnd(-90, -20), t: 0, life: rnd(0.3, 0.5), size: rnd(1.5, 3), c: 'rgba(255,240,200,0.8)' });
        lock();
      }

      function lock() {
        var p = st.cur, top = false;
        cellsOf(p).forEach(function (c) { if (c.r < 0) top = true; else st.grid[c.c][c.r] = p.s.c; });
        st.pieces++;
        st.cur = null;
        ctx.tone(220, 180, 0.06, 'square', 0.03);
        if (top) { gameOver(); return; }
        var full = [];
        for (var r = 0; r < ROWS; r++) { var ok = true; for (var c = 0; c < COLS; c++) if (!st.grid[c][r]) { ok = false; break; } if (ok) full.push(r); }
        if (full.length) {
          st.clearing = { rows: full, t0: st.t };
          var n = full.length, pts = LINE_PTS[Math.min(4, n)] * st.level;
          st.score += pts; st.lines += n; st.best = Math.max(st.best, n);
          ctx.setScore(st.score);
          var midY = cy(0, full[Math.floor(full.length / 2)]);
          ctx.fx.text(cssW / 2, midY, '+' + pts, '#FDC506', 22 + n * 3);
          if (n >= 2) ctx.fx.banner(LINE_TXT[Math.min(4, n)], n >= 4 ? '#FF8AD8' : '#FDC506', n >= 4 ? 40 : 32);
          ctx.fx.flash(n >= 4 ? '255,138,216' : '253,197,6', 0.3 + n * 0.17);
          ctx.fx.shake(0.15 + n * 0.08, 4 + n * 2.5);
          full.forEach(function (row) {
            for (var c = 0; c < COLS; c++) {
              var x = cx(c), y = cy(c, row), col = st.grid[c][row];
              for (var i = 0; i < (ctx.reduce ? 2 : 4); i++) st.parts.push({ x: x, y: y, vx: rnd(-220, 220), vy: rnd(-260, -40), t: 0, life: rnd(0.5, 0.9), size: rnd(2, 4.5), c: i % 2 ? col : '#FFFFFF', grav: 700 });
            }
            ctx.fx.ring(cssW / 2, cy(0, row), '#FFFFFF', bw * 0.6, 5, 450);
          });
          ctx.tone(523, 784, 0.1, 'triangle', 0.05);
          if (n >= 2) ctx.tone(784, 1046, 0.12, 'triangle', 0.05, 0.08);
          if (n >= 3) ctx.tone(1046, 1568, 0.14, 'triangle', 0.05, 0.16);
          if (n >= 4) ctx.tone(1568, 2093, 0.25, 'triangle', 0.05, 0.24);
          var lv = Math.floor(st.lines / 10) + 1;
          if (lv > st.level) {
            st.level = lv;
            setTimeout(function () { if (st.on) { ctx.fx.banner('Level ' + lv + '!', '#7FD3FF', 36); ctx.fx.sparkle(cssW / 2, cssH * 0.4, ['#7FD3FF', '#FFFFFF', '#FDC506'], 26, 300); } }, 500);
          }
        } else spawn();
      }
      function collapse() {
        var rows = st.clearing.rows;
        for (var c = 0; c < COLS; c++) {
          var col = st.grid[c].filter(function (v, r) { return rows.indexOf(r) < 0; });
          while (col.length < ROWS) col.unshift(null);
          st.grid[c] = col;
        }
        st.clearing = null;
        spawn();
      }
      function gravityMs() { return Math.max(70, 820 * Math.pow(0.84, st.level - 1)); }

      function update(dt) {
        st.t += dt * 1000;
        st.shake = Math.max(0, st.shake - dt);
        for (var q = st.parts.length - 1; q >= 0; q--) {
          var pt = st.parts[q];
          pt.t += dt; pt.vy += (pt.grav || 300) * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt;
          if (pt.t > pt.life) st.parts.splice(q, 1);
        }
        if (st.dying) { if (st.t - st.dying > 1600) st.over = true; return; }
        if (st.clearing) { if (st.t - st.clearing.t0 > 380) collapse(); return; }
        if (!st.cur) return;
        var p = st.cur, can = fits(cellsOf(p, p.pc, p.pr + 1));
        if (can) {
          st.lockT = 0;
          st.fall += dt * 1000 * (st.soft ? 12 : 1);
          var step = gravityMs();
          while (st.fall >= step) {
            st.fall -= step;
            if (fits(cellsOf(p, p.pc, p.pr + 1))) { p.pr++; if (st.soft) { st.score += 1; ctx.setScore(st.score); } }
            else break;
          }
        } else {
          st.lockT += dt * 1000;
          if (st.lockT >= LOCK_MS) lock();
        }
      }

      function ghostRow(p) { var r = p.pr; while (fits(cellsOf(p, p.pc, r + 1))) r++; return r; }

      function render() {
        g.setTransform(1, 0, 0, 1, 0, 0);
        var bg = g.createLinearGradient(0, 0, 0, cv.height);
        bg.addColorStop(0, '#16120A'); bg.addColorStop(1, '#0C0A06');
        g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        /* leere Waben als Raster */
        for (var c = 0; c < COLS; c++) for (var r = 0; r < ROWS; r++) {
          flatHex(g, cx(c), cy(c, r), R * 0.94);
          g.fillStyle = (c + r) % 2 ? '#211B0E' : '#1D180C'; g.fill();
          g.lineWidth = 1; g.strokeStyle = 'rgba(253,197,6,0.12)'; g.stroke();
        }
        /* fertig gebaute Waben */
        var fl = st.clearing ? (st.t - st.clearing.t0) / 380 : 0;
        for (var c2 = 0; c2 < COLS; c2++) for (var r2 = 0; r2 < ROWS; r2++) {
          var col = st.grid[c2][r2];
          if (!col) continue;
          if (st.clearing && st.clearing.rows.indexOf(r2) >= 0) {
            var s = 1 + fl * 0.4;
            g.save(); g.translate(cx(c2), cy(c2, r2)); g.scale(s, s);
            drawCell(g, 0, 0, R, Math.floor(st.t / 60) % 2 ? '#FFFFFF' : col, 1 - fl);
            g.restore();
          } else drawCell(g, cx(c2), cy(c2, r2), R, st.dying ? '#5A4A3A' : col);
        }
        /* Landeschatten und fallendes Teil */
        if (st.cur) {
          var p = st.cur, gr = ghostRow(p);
          cellsOf(p, p.pc, gr).forEach(function (c3) { if (c3.r >= 0) { flatHex(g, cx(c3.c), cy(c3.c, c3.r), R * 0.9); g.lineWidth = 2; g.strokeStyle = p.s.c; g.globalAlpha = 0.45; g.stroke(); g.globalAlpha = 1; } });
          var pulse = st.lockT ? 0.6 + 0.4 * Math.sin(st.t / 40) : 1;
          cellsOf(p).forEach(function (c4) { if (c4.r >= 0) drawCell(g, cx(c4.c), cy(c4.c, c4.r), R, p.s.c, pulse); });
        }
        st.parts.forEach(function (pt) {
          g.globalAlpha = Math.max(0, 1 - pt.t / pt.life);
          g.beginPath(); g.arc(pt.x, pt.y, pt.size, 0, TAU); g.fillStyle = pt.c; g.fill();
        });
        g.globalAlpha = 1;
        /* Leiste oben: nächstes Teil, Level, Reihen */
        g.fillStyle = '#151515'; g.fillRect(0, 0, cssW, TOP);
        g.textAlign = 'left'; g.textBaseline = 'middle';
        g.font = '700 14px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.85)';
        g.fillText('Level ' + st.level, 14, TOP / 2 - 8);
        g.font = '600 12px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillText(st.lines + (st.lines === 1 ? ' Reihe' : ' Reihen'), 14, TOP / 2 + 10);
        g.textAlign = 'right'; g.font = '600 12px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
        /* Vorschau: passend skaliert, damit auch lange Teile in die Leiste passen */
        if (st.next) {
          var cellsN = st.next.cells.map(function (cc) { return toOffset(cc[0], cc[1] + 4); });
          var minC = Math.min.apply(null, cellsN.map(function (q) { return q.c; }));
          var us = cellsN.map(function (q) { return { x: (q.c - minC) * 1.5, y: q.r * SQ3 + (q.c & 1 ? SQ3 / 2 : 0) }; });
          var minY = Math.min.apply(null, us.map(function (u) { return u.y; })), maxY = Math.max.apply(null, us.map(function (u) { return u.y; }));
          var maxX = Math.max.apply(null, us.map(function (u) { return u.x; }));
          var nr = Math.min(9, (TOP - 8) / (maxY - minY + SQ3), 64 / (maxX + 2));
          var nx0 = cssW - 14 - (maxX + 1) * nr;
          g.fillText('Nächstes', nx0 - nr - 8, TOP / 2);
          us.forEach(function (u) { drawCell(g, nx0 + u.x * nr, TOP / 2 + (u.y - (minY + maxY) / 2) * nr, nr, st.next.c); });
        }
        if (st.on && st.hint && !st.paused) {
          var txt = ctx.touch() ? 'Wischen schiebt, Tippen dreht' : '← → schieben, ↑ drehen, Leertaste fallen';
          g.font = '700 14px Poppins, sans-serif';
          var w = Math.min(cssW - 20, g.measureText(txt).width + 26), h = 32, hx = cssW / 2, hy = oy + bh * 0.62;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, hx - w / 2, hy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(txt, hx, hy + 1, w - 14);
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
      /* Vor dem Start: ein Teil schwebt zur Deko herunter */
      function idle(now) {
        if (st.on) return;
        st.t = now;
        if (!st.cur) { st.cur = newPiece(SHAPES[0]); st.cur.pc = 4; st.cur.pr = 3; }
        render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() { st.on = false; ptr = null; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() { stop(); render(); ctx.finish(st.score, { lines: st.lines, level: st.level, pieces: st.pieces, best: st.best }); }

      function act(what) {
        if (!st.on || st.paused || !st.cur || st.clearing || st.dying) return;
        st.hint = false;
        if (what === 'left' || what === 'right') { if (tryMove(what === 'left' ? -1 : 1, 0)) ctx.tone(400, 420, 0.03, 'triangle', 0.02); }
        else if (what === 'rot') rotate(1);
        else if (what === 'rotl') rotate(-1);
        else if (what === 'drop') hardDrop();
      }

      /* Handy: wischen schiebt Schritt für Schritt, nach unten fallen lassen, tippen dreht */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e);
        ptr = { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false, t: performance.now() };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var p = local(e), step = Math.max(32, R * 1.9);
        while (p.x - ptr.x > step) { act('right'); ptr.x += step; ptr.moved = true; }
        while (ptr.x - p.x > step) { act('left'); ptr.x -= step; ptr.moved = true; }
        if (p.y - ptr.sy > 70 && Math.abs(p.x - ptr.sx) < 40 && !ptr.dropped) { ptr.dropped = true; ptr.moved = true; act('drop'); }
      });
      cv.addEventListener('pointerup', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        if (!ptr.moved && performance.now() - ptr.t < 400) act('rot');
        ptr = null;
      });
      cv.addEventListener('pointercancel', function () { ptr = null; });
      function onKeyUp(e) { if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') st.soft = false; }
      document.addEventListener('keyup', onKeyUp);

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); bag = [];
          layout();
          st.on = true; st.last = performance.now();
          spawn();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; st.soft = false; ptr = null; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); layout(); render(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: function () { layout(); render(); },
        key: function (e) {
          var k = e.key;
          if (k === 'ArrowLeft' || k === 'a' || k === 'A') { act('left'); return true; }
          if (k === 'ArrowRight' || k === 'd' || k === 'D') { act('right'); return true; }
          if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'x' || k === 'X') { if (!e.repeat) act('rot'); return true; }
          if (k === 'z' || k === 'Z' || k === 'y' || k === 'Y') { if (!e.repeat) act('rotl'); return true; }
          if (k === 'ArrowDown' || k === 's' || k === 'S') { st.soft = true; st.hint = false; return true; }
          if (k === ' ') { if (!e.repeat) act('drop'); return true; }
          return false;
        },
        _debug: function () { return { st: st, cellsOf: cellsOf, fits: fits, lock: lock, cx: cx, cy: cy }; }
      };
    }
  });
})();

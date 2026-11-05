/* Spiel 11: Bienen-Solitär (Patience-Prinzip, eigene Karten) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, BAR = 46;
  /* Farben: 0 Blume und 1 Wabe sind rot, 2 Käfer und 3 Klee sind schwarz */
  var SUITS = [
    { name: 'Blume', c: '#D3273F', red: true },
    { name: 'Wabe', c: '#C0262F', red: true },
    { name: 'Käfer', c: '#1A1A1A', red: false },
    { name: 'Klee', c: '#1A1A1A', red: false }
  ];
  var RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'];
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Farb-Symbole, Mitte = 0,0, Größe s */
  function drawSuit(g, si, x, y, s) {
    var su = SUITS[si];
    g.save(); g.translate(x, y); g.lineJoin = 'round';
    if (si === 0) {
      for (var i = 0; i < 5; i++) { g.save(); g.rotate(i / 5 * TAU - Math.PI / 2); g.beginPath(); g.ellipse(s * 0.42, 0, s * 0.36, s * 0.24, 0, 0, TAU); g.fillStyle = su.c; g.fill(); g.restore(); }
      g.beginPath(); g.arc(0, 0, s * 0.22, 0, TAU); g.fillStyle = '#FDC506'; g.fill();
    } else if (si === 1) {
      art.hex(g, 0, 0, s * 0.62, su.c, null);
      art.hex(g, 0, 0, s * 0.3, '#FFE1A8', null);
    } else if (si === 2) {
      g.strokeStyle = su.c; g.lineWidth = Math.max(1, s * 0.09); g.lineCap = 'round';
      g.beginPath(); g.moveTo(-s * 0.15, -s * 0.45); g.lineTo(-s * 0.3, -s * 0.7); g.moveTo(s * 0.15, -s * 0.45); g.lineTo(s * 0.3, -s * 0.7);
      for (var l = -1; l <= 1; l++) { g.moveTo(-s * 0.35, l * s * 0.22); g.lineTo(-s * 0.6, l * s * 0.3); g.moveTo(s * 0.35, l * s * 0.22); g.lineTo(s * 0.6, l * s * 0.3); }
      g.stroke();
      g.beginPath(); g.ellipse(0, s * 0.08, s * 0.4, s * 0.5, 0, 0, TAU); g.fillStyle = su.c; g.fill();
      g.beginPath(); g.arc(0, -s * 0.45, s * 0.2, 0, TAU); g.fill();
      g.strokeStyle = '#6B6B6B'; g.lineWidth = Math.max(1, s * 0.05); g.beginPath(); g.moveTo(0, -s * 0.3); g.lineTo(0, s * 0.55); g.stroke();
    } else {
      [[0, -0.3], [-0.3, 0.06], [0.3, 0.06]].forEach(function (o) { g.beginPath(); g.arc(o[0] * s, o[1] * s, s * 0.27, 0, TAU); g.fillStyle = su.c; g.fill(); });
      g.strokeStyle = su.c; g.lineWidth = Math.max(1, s * 0.1); g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(s * 0.05, s * 0.4, s * 0.2, s * 0.65); g.stroke();
    }
    g.restore();
  }
  /* Kartenrückseite: Waben in Honigfarbe */
  function drawBack(g, x, y, w, h) {
    rr(g, x, y, w, h, w * 0.1); g.fillStyle = '#7A4A10'; g.fill();
    g.save(); rr(g, x + w * 0.07, y + w * 0.07, w * 0.86, h - w * 0.14, w * 0.07); g.clip();
    g.fillStyle = '#A8650F'; g.fillRect(x, y, w, h);
    var r = w * 0.11;
    for (var yy = y; yy < y + h + r; yy += r * 1.5) for (var xx = x + ((Math.round((yy - y) / (r * 1.5)) % 2) ? r * 0.87 : 0); xx < x + w + r; xx += r * 1.73) art.hex(g, xx, yy, r * 0.82, '#C9821A', null);
    g.restore();
    rr(g, x + w * 0.07, y + w * 0.07, w * 0.86, h - w * 0.14, w * 0.07); g.strokeStyle = '#FDC506'; g.lineWidth = Math.max(1, w * 0.03); g.stroke();
    g.font = '900 ' + w * 0.26 + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = w * 0.06; g.strokeStyle = '#5A3508'; g.strokeText('MB', x + w / 2, y + h / 2);
    g.fillStyle = '#FDC506'; g.fillText('MB', x + w / 2, y + h / 2);
    rr(g, x, y, w, h, w * 0.1); g.strokeStyle = '#111'; g.lineWidth = Math.max(1, w * 0.025); g.stroke();
  }
  function drawFace(g, c, x, y, w, h, hl) {
    var su = SUITS[c.s], txt = su.red ? '#C0262F' : '#1A1A1A';
    rr(g, x, y, w, h, w * 0.1); g.fillStyle = '#FFF8E6'; g.fill();
    g.lineWidth = hl ? Math.max(2, w * 0.05) : Math.max(1, w * 0.025); g.strokeStyle = hl ? '#FDC506' : '#111'; g.stroke();
    g.textAlign = 'left'; g.textBaseline = 'top';
    var fs = w * (RANKS[c.r].length > 1 ? 0.3 : 0.34);
    g.font = '800 ' + fs + 'px Poppins, sans-serif'; g.fillStyle = txt;
    g.fillText(RANKS[c.r], x + w * 0.08, y + w * 0.05);
    drawSuit(g, c.s, x + w * 0.78, y + w * 0.22, w * 0.18);
    if (c.r >= 11) {
      /* Figuren: König = Königin, Dame = Hummel, Bube = Arbeitsbiene */
      g.save(); g.translate(x + w / 2, y + h * 0.6); var sc = w / 80; g.scale(sc, sc);
      if (c.r === 13) art.queen(g, 0.5); else if (c.r === 12) art.bumble(g, 0.5); else art.bee(g, 0.5);
      g.restore();
      drawSuit(g, c.s, x + w * 0.2, y + h * 0.85, w * 0.14);
    } else drawSuit(g, c.s, x + w / 2, y + h * 0.6, w * (c.r === 1 ? 0.36 : 0.27));
  }

  MBArcade.register({
    id: 'solitaer',
    title: 'Bienen-Solitär',
    duration: 0,
    startText: 'Sortier alle Karten auf die vier Ablagen oben, jede Farbe vom Ass bis zum König. Unten legst du abwechselnd rot und dunkel absteigend aufeinander.',
    help: {
      legendTitle: 'Punkte',
      controls: [
        { icons: ['mouse-left', 'tap'], text: 'Karte antippen: Sie springt automatisch an den besten Platz' },
        { icons: ['swipe'], text: 'Karten oder ganze Reihen auch ziehen und ablegen' },
        { icons: ['kbd:Leertaste'], text: 'Neue Karte vom Stapel ziehen', kb: true },
        { icons: ['mouse-left', 'tap'], text: 'Unten links „Zug zurück“ nimmt den letzten Zug zurück (Taste U)' },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { drawFace(g, { s: 0, r: 1 }, 10, 3, 28, 40); }, text: 'Karte auf eine Ablage oben', val: '+10' },
        { draw: function (g) { drawBack(g, 6, 3, 28, 40); drawFace(g, { s: 2, r: 7 }, 14, 6, 28, 40); }, text: 'Verdeckte Karte aufgedeckt oder Karte vom Stapel angelegt', val: '+5' },
        { draw: function (g) { drawBack(g, 10, 3, 28, 40); }, text: 'Stapel nochmal durchgehen', val: '−50', minus: true },
        { draw: function (g) { g.translate(23, 24); g.scale(0.45, 0.45); art.queen(g, 0.5); }, text: 'Gewonnen: Bonus, je schneller desto mehr', val: '+500' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Bei uns liegen die Karten offen auf dem Tisch. Lass uns reden.' },
    stats: function (s) {
      var m = Math.floor(s.secs / 60), sec = s.secs % 60;
      var t = s.won ? 'Alle Karten sortiert in ' + m + ':' + (sec < 10 ? '0' : '') + sec + ' Minuten!' : s.found + ' von 52 Karten sortiert.';
      return t + ' ' + s.moves + (s.moves === 1 ? ' Zug.' : ' Züge.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, cw = 60, ch = 84, gap = 8, ox = 0, topY = 10, tabY = 100;
      var raf = 0, idleRaf = 0, ptr = null, anim = {}, cascade = null, layer = null, cache = {};
      var st = fresh();

      function fresh() {
        var deck = [];
        for (var s = 0; s < 4; s++) for (var r = 1; r <= 13; r++) deck.push({ s: s, r: r, up: false, id: s * 13 + r });
        for (var i = deck.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
        var tab = [];
        for (var c = 0; c < 7; c++) { tab.push([]); for (var k = 0; k <= c; k++) { var card = deck.pop(); card.up = k === c; tab[c].push(card); } }
        return {
          on: false, paused: false, over: false, won: false, t: 0, last: 0, startT: 0,
          stock: deck, waste: [], found: [[], [], [], []], tab: tab,
          score: 0, moves: 0, recycles: 0, undo: [], auto: 0, wiggle: null, hint: true, flash: {}
        };
      }
      function red(c) { return SUITS[c.s].red; }
      function top(a) { return a[a.length - 1]; }
      function foundCount() { return st.found.reduce(function (n, f) { return n + f.length; }, 0); }

      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        gap = Math.max(4, Math.min(14, cssW * 0.012));
        cw = Math.min(96, (cssW - gap * 8) / 7, (cssH - BAR - 30) / 1.4 / 3.2);
        ch = cw * 1.4;
        ox = (cssW - (7 * cw + 6 * gap)) / 2;
        topY = 10; tabY = topY + ch + gap * 1.6;
        layer = null; cache = {};
      }
      function colX(i) { return ox + i * (cw + gap); }
      function stackOffsets(col) {
        var avail = cssH - BAR - tabY - 8, downs = 0, ups = 0;
        col.forEach(function (c) { if (c.up) ups++; else downs++; });
        var d = ch * 0.13, u = ch * 0.27;
        var need = downs * d + Math.max(0, ups - 1) * u + ch;
        if (need > avail && col.length > 1) { var f = Math.max(0.3, (avail - ch) / (need - ch)); d *= f; u *= f; }
        return { d: d, u: u };
      }
      /* Zielposition jeder Karte */
      function places() {
        var out = {};
        st.stock.forEach(function (c, i) { out[c.id] = { x: colX(0) - Math.min(i, 4) * 0.4, y: topY - Math.min(i, 4) * 0.4, z: i }; });
        st.waste.forEach(function (c, i) { var k = st.waste.length - 1 - i; out[c.id] = { x: colX(1) + Math.max(0, 2 - k) * cw * 0.16 * (k < 3 ? 1 : 0), y: topY, z: 100 + i }; });
        st.found.forEach(function (f, fi) { f.forEach(function (c, i) { out[c.id] = { x: colX(3 + fi), y: topY, z: 200 + i }; }); });
        st.tab.forEach(function (col, ci) {
          var o = stackOffsets(col), y = tabY;
          col.forEach(function (c, i) { out[c.id] = { x: colX(ci), y: y, z: 300 + i }; y += c.up ? o.u : o.d; });
        });
        return out;
      }

      /* Züge */
      function snapshot() {
        var cp = function (a) { return a.map(function (c) { return { s: c.s, r: c.r, up: c.up, id: c.id }; }); };
        st.undo.push({ stock: cp(st.stock), waste: cp(st.waste), found: st.found.map(cp), tab: st.tab.map(cp), score: st.score, moves: st.moves, recycles: st.recycles });
        if (st.undo.length > 60) st.undo.shift();
      }
      function undo() {
        var u = st.undo.pop();
        if (!u) { ctx.tone(160, 140, 0.05, 'square', 0.02); return; }
        st.stock = u.stock; st.waste = u.waste; st.found = u.found; st.tab = u.tab; st.score = u.score; st.moves = u.moves; st.recycles = u.recycles;
        ctx.setScore(st.score);
        st.stuck = false; checkStuck();
        ctx.tone(500, 380, 0.06, 'triangle', 0.03);
      }
      function addScore(n) { st.score = Math.max(0, st.score + n); ctx.setScore(st.score); }
      /* Jede Ablage gehört fest zu ihrer Farbe (Symbol auf dem leeren Platz): 0 Blume, 1 Wabe, 2 Käfer, 3 Klee */
      function canFound(c, fi) { var f = st.found[fi]; if (c.s !== fi) return false; return f.length ? top(f).r === c.r - 1 : c.r === 1; }
      function canTab(c, ci) { var col = st.tab[ci]; if (!col.length) return c.r === 13; var t = top(col); return t.up && red(t) !== red(c) && t.r === c.r + 1; }
      function flipTop(ci) {
        var col = st.tab[ci], t = top(col);
        if (t && !t.up) {
          t.up = true; addScore(5);
          (anim[t.id] = anim[t.id] || {}).flip = 1;
          ctx.tone(700, 900, 0.04, 'triangle', 0.025);
        }
      }
      function celebrate(id, fi) {
        st.flash[fi] = 1;
        var x = colX(3 + fi) + cw / 2, y = topY + ch / 2;
        ctx.fx.ring(x, y, '#FDC506', cw * 1.1, 4, 380);
        ctx.fx.sparkle(x, y, ['#FDC506', '#FFE680', '#FFFFFF'], 6, 140);
        var n = foundCount();
        ctx.tone(600 + n * 14, 900 + n * 14, 0.07, 'triangle', 0.04);
        var f = st.found[fi];
        if (f.length === 13) { ctx.fx.boom(x, y, '#FDC506', '253,197,6', 1); ctx.fx.text(x, y + ch * 0.8, SUITS[fi === undefined ? 0 : top(f).s].name + ' komplett!', '#FFE680', 20); }
      }
      /* Quelle: { from: 'waste' | 'tab' | 'found', i: Stapel, k: Index } */
      function moveTo(src, dest) {
        snapshot();
        var cards;
        if (src.from === 'waste') cards = [st.waste.pop()];
        else if (src.from === 'found') cards = [st.found[src.i].pop()];
        else cards = st.tab[src.i].splice(src.k);
        if (dest.to === 'found') {
          st.found[dest.i].push(cards[0]);
          addScore(src.from === 'found' ? 0 : 10);
          celebrate(cards[0].id, dest.i);
        } else {
          Array.prototype.push.apply(st.tab[dest.i], cards);
          if (src.from === 'waste') addScore(5);
          if (src.from === 'found') addScore(-15);
          ctx.tone(420, 520, 0.05, 'triangle', 0.03);
        }
        if (src.from === 'tab') flipTop(src.i);
        st.moves++; st.hint = false;
        checkWin();
        checkStuck();
      }
      function draw() {
        if (st.auto || st.won) return;
        st.hint = false;
        if (st.stock.length) {
          snapshot();
          var c = st.stock.pop(); c.up = true; st.waste.push(c); st.moves++;
          (anim[c.id] = anim[c.id] || {}).flip = 1;
          ctx.tone(520, 660, 0.04, 'triangle', 0.025);
        } else if (st.waste.length) {
          snapshot();
          st.stock = st.waste.reverse().map(function (c) { c.up = false; return c; }); st.waste = [];
          st.recycles++; addScore(-50); st.moves++;
          ctx.tone(300, 200, 0.12, 'square', 0.03);
          ctx.fx.ring(colX(0) + cw / 2, topY + ch / 2, '#FFFFFF', cw, 3, 300);
        }
        checkStuck();
      }
      /* Bester Zug für eine angetippte Karte */
      function autoMove(src) {
        var card = src.from === 'waste' ? top(st.waste) : src.from === 'found' ? top(st.found[src.i]) : st.tab[src.i][src.k];
        var single = src.from !== 'tab' || src.k === st.tab[src.i].length - 1;
        if (single && src.from !== 'found') for (var fi = 0; fi < 4; fi++) if (canFound(card, fi)) { moveTo(src, { to: 'found', i: fi }); return true; }
        var empty = -1;
        for (var ci = 0; ci < 7; ci++) {
          if (src.from === 'tab' && ci === src.i) continue;
          if (!canTab(card, ci)) continue;
          if (!st.tab[ci].length) { if (empty < 0) empty = ci; continue; }
          moveTo(src, { to: 'tab', i: ci }); return true;
        }
        /* Ein König ganz unten im Stapel muss nicht auf einen leeren Platz umziehen */
        if (empty >= 0 && !(src.from === 'tab' && src.k === 0)) { moveTo(src, { to: 'tab', i: empty }); return true; }
        st.wiggle = { ids: src.from === 'tab' ? st.tab[src.i].slice(src.k).map(function (c) { return c.id; }) : [card.id], t0: st.t };
        ctx.tone(180, 150, 0.06, 'square', 0.025);
        return false;
      }
      /* Gibt es überhaupt noch einen sinnvollen Zug? */
      function hasMoves() {
        var i, ci, k, fi;
        var pool = st.stock.concat(st.waste);
        for (i = 0; i < pool.length; i++) {
          for (fi = 0; fi < 4; fi++) if (canFound(pool[i], fi)) return true;
          for (ci = 0; ci < 7; ci++) if (canTab(pool[i], ci)) return true;
        }
        for (ci = 0; ci < 7; ci++) {
          var col = st.tab[ci], t = top(col);
          if (t) for (fi = 0; fi < 4; fi++) if (canFound(t, fi)) return true;
          for (k = 0; k < col.length; k++) {
            if (!col[k].up) continue;
            var reveals = k > 0 && !col[k - 1].up;
            for (var cj = 0; cj < 7; cj++) {
              if (cj === ci || !canTab(col[k], cj)) continue;
              if (reveals || (k === 0 && st.tab[cj].length)) return true;
            }
            break;
          }
        }
        return false;
      }
      function checkStuck() {
        var was = st.stuck;
        st.stuck = st.on && !st.won && !st.auto && !hasMoves();
        if (st.stuck && !was) {
          ctx.fx.flash('255,74,61', 0.5); ctx.fx.shake(0.2, 6);
          ctx.tone(330, 140, 0.4, 'sawtooth', 0.04);
        }
      }
      function checkWin() {
        if (foundCount() === 52 && !st.won) {
          st.won = true; st.auto = 0;
          var secs = Math.round((st.t - st.startT) / 1000), bonus = 500 + Math.max(0, (600 - secs) * 2);
          addScore(bonus);
          ctx.fx.banner('Gewonnen! +' + bonus, '#FDC506', 40);
          ctx.fx.flash('253,197,6', 1); ctx.fx.shake(0.3, 8);
          ctx.tone(523, 784, 0.15, 'triangle', 0.06); ctx.tone(784, 1046, 0.15, 'triangle', 0.06, 0.15); ctx.tone(1046, 1568, 0.3, 'triangle', 0.06, 0.3);
          startCascade();
          return;
        }
        /* Alles offen und Stapel leer: der Rest geht automatisch */
        if (!st.stock.length && !st.waste.length && st.tab.every(function (col) { return col.every(function (c) { return c.up; }); }) && !st.auto) {
          st.auto = st.t + 300;
          ctx.fx.text(cssW / 2, tabY + ch, 'Der Rest geht von allein!', '#FFE680', 22);
        }
      }
      function autoStep() {
        var best = null;
        st.tab.forEach(function (col, ci) {
          var c = top(col); if (!c) return;
          for (var fi = 0; fi < 4; fi++) if (canFound(c, fi) && (!best || c.r < best.r)) best = { r: c.r, src: { from: 'tab', i: ci, k: col.length - 1 }, fi: fi };
        });
        if (best) moveTo(best.src, { to: 'found', i: best.fi });
        else st.auto = 0;
      }

      /* Gewinn-Kaskade: Karten springen von den Ablagen und hinterlassen eine Spur */
      function startCascade() {
        var list = [];
        for (var r = 13; r >= 1; r--) for (var fi = 0; fi < 4; fi++) list.push({ c: { s: fi, r: r, id: -1 }, fi: fi });
        cascade = { list: list, i: 0, next: 0, flying: [], end: st.t + (ctx.reduce ? 1500 : 6500) };
        layer = document.createElement('canvas'); layer.width = cv.width; layer.height = cv.height;
      }
      function cascadeStep(dt) {
        var cs = cascade;
        if (!ctx.reduce && cs.i < cs.list.length && st.t >= cs.next) {
          var it = cs.list[cs.i++], x = colX(3 + (cs.i % 4));
          var foundCard = st.found[cs.i % 4].pop();
          cs.flying.push({ c: foundCard || it.c, x: x, y: topY, vx: rnd(-260, -90) * (Math.random() < 0.5 ? 1 : -1), vy: rnd(-150, 50) });
          cs.next = st.t + 120;
        }
        var lg = layer.getContext('2d');
        lg.setTransform(dpr, 0, 0, dpr, 0, 0);
        cs.flying.forEach(function (f) {
          f.vy += 1400 * dt; f.x += f.vx * dt; f.y += f.vy * dt;
          var floorY = cssH - BAR - ch;
          if (f.y > floorY) { f.y = floorY; f.vy *= -0.82; }
          drawFace(lg, f.c, f.x, f.y, cw, ch);
        });
        cs.flying = cs.flying.filter(function (f) { return f.x > -cw * 1.5 && f.x < cssW + cw * 0.5; });
        if (st.t >= cs.end) { st.over = true; }
      }

      function update(dt) {
        st.t += dt * 1000;
        if (cascade) { cascadeStep(dt); return; }
        if (st.auto && st.t >= st.auto) { autoStep(); if (st.auto) st.auto = st.t + 110; }
        Object.keys(st.flash).forEach(function (k) { st.flash[k] = Math.max(0, st.flash[k] - dt * 3); });
      }

      function render() {
        g.setTransform(1, 0, 0, 1, 0, 0);
        /* Filztisch nur einmal vorzeichnen */
        if (!cache.bg) {
          var bc = document.createElement('canvas'); bc.width = cv.width; bc.height = cv.height;
          var bx = bc.getContext('2d'), bgr = bx.createRadialGradient(cv.width / 2, cv.height * 0.4, 10, cv.width / 2, cv.height * 0.4, Math.max(cv.width, cv.height) * 0.8);
          bgr.addColorStop(0, '#1F4A2C'); bgr.addColorStop(1, '#0F2617');
          bx.fillStyle = bgr; bx.fillRect(0, 0, cv.width, cv.height);
          cache.bg = bc;
        }
        g.drawImage(cache.bg, 0, 0);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        /* leere Plätze */
        function slot(x, y, label, fl) {
          rr(g, x, y, cw, ch, cw * 0.1); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fill();
          g.lineWidth = 2; g.strokeStyle = fl ? 'rgba(253,197,6,' + (0.4 + fl * 0.6) + ')' : 'rgba(253,197,6,0.35)'; g.stroke();
          if (label !== null) {
            g.beginPath(); g.arc(x + cw / 2, y + ch / 2, cw * 0.3, 0, TAU); g.fillStyle = 'rgba(255,248,230,0.28)'; g.fill();
            g.globalAlpha = 0.75; drawSuit(g, label, x + cw / 2, y + ch / 2, cw * 0.26); g.globalAlpha = 1;
          }
        }
        slot(colX(0), topY, null);
        if (!st.stock.length && st.waste.length) {
          g.strokeStyle = 'rgba(253,197,6,0.7)'; g.lineWidth = 3;
          g.beginPath(); g.arc(colX(0) + cw / 2, topY + ch / 2, cw * 0.22, 0.3, TAU - 0.3); g.stroke();
        }
        slot(colX(1), topY, null);
        for (var fi = 0; fi < 4; fi++) slot(colX(3 + fi), topY, fi, st.flash[fi] || 0);
        for (var ci = 0; ci < 7; ci++) slot(colX(ci), tabY, null);

        var pl = places(), list = [];
        var dragIds = ptr && ptr.drag ? ptr.drag.ids : [];
        [st.stock, st.waste].concat(st.found, st.tab).forEach(function (a) { a.forEach(function (c) { list.push(c); }); });
        list.sort(function (a, b) { return pl[a.id].z - pl[b.id].z; });
        var later = [];
        list.forEach(function (c) {
          var p = pl[c.id], a = anim[c.id] || (anim[c.id] = { x: p.x, y: p.y, flip: 0 });
          var di = dragIds.indexOf(c.id);
          var tx = p.x, ty = p.y;
          if (di >= 0) { tx = ptr.x - ptr.drag.dx; ty = ptr.y - ptr.drag.dy + di * ch * 0.27; a.x = tx; a.y = ty; later.push(c); return; }
          a.x += (tx - a.x) * Math.min(1, 0.35); a.y += (ty - a.y) * Math.min(1, 0.35);
          var moving = Math.abs(tx - a.x) > 2 || Math.abs(ty - a.y) > 2;
          if (moving) later.push(c); else drawCard(c, a);
        });
        later.forEach(function (c) { var a = anim[c.id]; g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 12; g.shadowOffsetY = 6; drawCard(c, a); g.restore(); });
        if (layer) { g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layer, 0, 0); g.setTransform(dpr, 0, 0, dpr, 0, 0); }

        /* Leiste unten */
        var by = cssH - BAR;
        g.fillStyle = 'rgba(10,20,14,0.92)'; g.fillRect(0, by, cssW, BAR);
        g.textBaseline = 'middle';
        function btn(x, w, label, on, main) {
          rr(g, x, by + 6, w, BAR - 12, (BAR - 12) / 2);
          g.fillStyle = main && on ? '#FDC506' : on ? '#262626' : '#1A1A1A'; g.fill();
          g.lineWidth = 2; g.strokeStyle = main ? (on ? '#FDC506' : 'rgba(253,197,6,0.3)') : on ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'; g.stroke();
          g.fillStyle = main && on ? '#111' : on ? '#FFFFFF' : 'rgba(255,255,255,0.35)'; g.textAlign = 'center'; g.font = '800 14px Poppins, sans-serif'; g.fillText(label, x + w / 2, by + BAR / 2 + 1, w - 10);
        }
        var bw2 = Math.min(140, cssW * 0.3);
        btn(10, bw2, '↶ Zug zurück', st.undo.length > 0 && !st.won, true);
        btn(cssW - bw2 - 10, bw2, 'Aufgeben', !st.won);
        var secs = st.on ? Math.floor((st.t - st.startT) / 1000) : 0, m = Math.floor(secs / 60), s = secs % 60;
        g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = '700 14px Poppins, sans-serif'; g.textAlign = 'center';
        g.fillText(m + ':' + (s < 10 ? '0' : '') + s + '  ·  ' + foundCount() + '/52', cssW / 2, by + BAR / 2 + 1);
        /* Keine Züge mehr: blinkender Hinweis mit zwei Knöpfen */
        if (st.stuck && !st.paused) {
          var bh2 = Math.min(170, cssH * 0.34), byy = (cssH - BAR) / 2 - bh2 / 2;
          g.fillStyle = 'rgba(10,10,10,0.88)'; g.fillRect(0, byy, cssW, bh2);
          g.fillStyle = '#FDC506'; g.fillRect(0, byy, cssW, 3); g.fillRect(0, byy + bh2 - 3, cssW, 3);
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(performance.now() / 300));
          g.font = '900 ' + Math.min(30, cssW / 12) + 'px Poppins, sans-serif'; g.fillStyle = '#FF7A6B';
          g.fillText('Keine Züge mehr!', cssW / 2, byy + bh2 * 0.3);
          g.globalAlpha = 1;
          stuckButtons().forEach(function (b) {
            rr(g, b.x, b.y, b.w, b.h, b.h / 2); g.fillStyle = b.main ? '#FDC506' : 'rgba(0,0,0,0)'; g.fill();
            g.lineWidth = 2; g.strokeStyle = b.main ? '#FDC506' : '#FFFFFF'; g.stroke();
            g.fillStyle = b.main ? '#111' : '#FFFFFF'; g.font = '800 14px Poppins, sans-serif'; g.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, b.w - 10);
          });
        }
        if (st.on && st.hint && !st.paused) {
          var txt = ctx.touch() ? 'Karte antippen, sie springt an den besten Platz' : 'Karte anklicken oder ziehen, Stapel links oben klicken';
          g.font = '700 13px Poppins, sans-serif';
          var w = Math.min(cssW - 20, g.measureText(txt).width + 26), h = 30, hx = cssW / 2, hy = by - 26;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, hx - w / 2, hy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.fillText(txt, hx, hy + 1, w - 14);
          g.globalAlpha = 1;
        }
      }
      /* Jede Karte wird einmal vorgezeichnet und danach nur noch als Bild hingelegt (gegen Ruckeln) */
      function img(c, up) {
        var key = up ? c.id : 'b';
        if (!cache[key]) {
          var cc = document.createElement('canvas'), pad = 2;
          cc.width = Math.ceil((cw + pad * 2) * dpr); cc.height = Math.ceil((ch + pad * 2) * dpr);
          var x = cc.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr);
          if (up) drawFace(x, c, 0, 0, cw, ch); else drawBack(x, 0, 0, cw, ch);
          cache[key] = cc;
        }
        return cache[key];
      }
      function blit(c, up, x, y) { g.drawImage(img(c, up), x - 2, y - 2, cw + 4, ch + 4); }
      function drawCard(c, a) {
        var x = a.x, y = a.y;
        if (st.wiggle && st.wiggle.ids.indexOf(c.id) >= 0) {
          var wt = (st.t - st.wiggle.t0) / 300;
          if (wt < 1) x += Math.sin(wt * 30) * 5 * (1 - wt); else st.wiggle = null;
        }
        if (a.flip > 0) {
          a.flip = Math.max(0, a.flip - 0.12);
          var sx = Math.abs(Math.cos(a.flip * Math.PI / 2 * 2));
          g.save(); g.translate(x + cw / 2, y); g.scale(Math.max(0.05, sx), 1); g.translate(-cw / 2, 0);
          blit(c, a.flip <= 0.5, 0, 0);
          g.restore();
          return;
        }
        blit(c, c.up, x, y);
      }

      function stuckButtons() {
        var bh2 = Math.min(170, cssH * 0.34), byy = (cssH - BAR) / 2 - bh2 / 2, w = Math.min(170, cssW * 0.4), h = 42, y = byy + bh2 * 0.62;
        return [
          { k: 'undo', label: '↶ Zug zurück', x: cssW / 2 - w - 8, y: y, w: w, h: h },
          { k: 'end', label: 'Runde beenden', x: cssW / 2 + 8, y: y, w: w, h: h, main: true }
        ];
      }
      /* Was liegt unter dem Finger? */
      function hit(x, y) {
        if (x >= colX(0) && x <= colX(0) + cw && y >= topY && y <= topY + ch) return { from: 'stock' };
        if (st.waste.length && x >= colX(1) && x <= colX(1) + cw + cw * 0.35 && y >= topY && y <= topY + ch) return { from: 'waste' };
        for (var fi = 0; fi < 4; fi++) if (st.found[fi].length && x >= colX(3 + fi) && x <= colX(3 + fi) + cw && y >= topY && y <= topY + ch) return { from: 'found', i: fi };
        var pl = places();
        for (var ci = 0; ci < 7; ci++) {
          if (x < colX(ci) || x > colX(ci) + cw) continue;
          var col = st.tab[ci];
          for (var k = col.length - 1; k >= 0; k--) { var p = pl[col[k].id]; if (y >= p.y && y <= p.y + ch) return col[k].up ? { from: 'tab', i: ci, k: k } : null; }
        }
        return null;
      }
      function dropTarget(x, y) {
        /* Mitte der gezogenen Karte entscheidet */
        var best = null, bd = 1e9, pl = places();
        for (var fi = 0; fi < 4; fi++) { var fx = colX(3 + fi) + cw / 2, fy = topY + ch / 2, d = Math.hypot(x - fx, y - fy); if (d < cw * 0.9 && d < bd) { bd = d; best = { to: 'found', i: fi }; } }
        for (var ci = 0; ci < 7; ci++) {
          var col = st.tab[ci], t = top(col), tx = colX(ci) + cw / 2, ty = t ? pl[t.id].y + ch / 2 : tabY + ch / 2;
          var d2 = Math.abs(x - tx) < cw * 0.75 && y > ty - ch ? Math.abs(x - tx) + Math.max(0, y - ty - ch) * 0.2 : 1e9;
          if (d2 < bd) { bd = d2; best = { to: 'tab', i: ci }; }
        }
        return best;
      }

      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused || st.won) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e);
        if (st.stuck) {
          stuckButtons().forEach(function (b) {
            if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) { if (b.k === 'undo') undo(); else st.over = true; }
          });
          return;
        }
        if (p.y > cssH - BAR) {
          var bw2 = Math.min(140, cssW * 0.3);
          if (p.x < 10 + bw2) undo();
          else if (p.x > cssW - bw2 - 10) { ctx.fx.banner('Aufgegeben', '#FFFFFF', 30); st.over = true; }
          return;
        }
        if (st.auto) return;
        var h = hit(p.x, p.y);
        ptr = { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, h: h, drag: null };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var p = local(e); ptr.x = p.x; ptr.y = p.y;
        if (!ptr.drag && ptr.h && ptr.h.from !== 'stock' && Math.hypot(p.x - ptr.sx, p.y - ptr.sy) > 8) {
          var h = ptr.h, cards = h.from === 'waste' ? [top(st.waste)] : h.from === 'found' ? [top(st.found[h.i])] : st.tab[h.i].slice(h.k);
          var a = anim[cards[0].id];
          ptr.drag = { ids: cards.map(function (c) { return c.id; }), dx: ptr.sx - a.x, dy: ptr.sy - a.y };
        }
      });
      cv.addEventListener('pointerup', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var pp = ptr; ptr = null;
        if (pp.drag) {
          var cx = pp.x - pp.drag.dx + cw / 2, cy = pp.y - pp.drag.dy + ch / 2, d = dropTarget(cx, cy), h = pp.h;
          var card = h.from === 'waste' ? top(st.waste) : h.from === 'found' ? top(st.found[h.i]) : st.tab[h.i][h.k];
          var single = h.from !== 'tab' || h.k === st.tab[h.i].length - 1;
          var ok = d && ((d.to === 'found' && single && h.from !== 'found' && canFound(card, d.i)) || (d.to === 'tab' && !(h.from === 'tab' && h.i === d.i) && canTab(card, d.i)));
          if (ok) moveTo(h, d);
          else { st.wiggle = { ids: pp.drag.ids, t0: st.t }; ctx.tone(180, 150, 0.06, 'square', 0.025); }
          return;
        }
        if (!pp.h) return;
        if (pp.h.from === 'stock') draw(); else autoMove(pp.h);
      });
      cv.addEventListener('pointercancel', function () { ptr = null; });

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.05, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.over) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }
      function idle(now) { if (st.on) return; st.t = now; render(); idleRaf = requestAnimationFrame(idle); }
      function stop() { st.on = false; ptr = null; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() {
        stop(); render();
        ctx.finish(st.score, { won: st.won, found: foundCount() + (cascade ? 52 - foundCount() : 0), moves: st.moves, secs: Math.round((st.t - st.startT) / 1000) });
      }

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); anim = {}; cascade = null;
          layout();
          st.on = true; st.last = performance.now(); st.t = 0; st.startT = 0;
          /* Austeilen: Karten fliegen vom Stapel an ihren Platz */
          var pl = places();
          [].concat.apply([], st.tab).forEach(function (c, i) { anim[c.id] = { x: colX(0), y: topY - i * 0.2, flip: c.up ? 1 : 0 }; void pl; });
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          ctx.tone(400, 800, 0.2, 'triangle', 0.03);
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; ptr = null; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); anim = {}; cascade = null; layout(); render(); },
        unmount: stop,
        resize: function () { layout(); render(); },
        key: function (e) {
          if (e.key === ' ' || e.key === 'Enter') { if (!e.repeat) draw(); return true; }
          if (e.key === 'u' || e.key === 'U' || e.key === 'Backspace') { if (!e.repeat && !st.won) undo(); return true; }
          return false;
        },
        _debug: function () { return { st: st, places: places, colX: colX, cw: cw, ch: ch, topY: topY, tabY: tabY, moveTo: moveTo, checkWin: checkWin }; }
      };
    }
  });
})();

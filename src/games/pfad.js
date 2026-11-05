/* Spiel 9: Pollenpfad (Pac-Man-Prinzip, eigenes Labyrinth) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, BAR = 40, LIVES = 3;
  var MAZE = [
    '###################',
    '#........#........#',
    '#o##.###.#.###.##o#',
    '#.................#',
    '#.##.#.#####.#.##.#',
    '#....#...#...#....#',
    '####.###.#.###.####',
    '####.#.......#.####',
    '####.#.##-##.#.####',
    '    ...#HHH#...    ',
    '####.#.#####.#.####',
    '####.#.......#.####',
    '####.#.#####.#.####',
    '#........#........#',
    '#.##.###.#.###.##.#',
    '#o.#.....P.....#.o#',
    '##.#.#.#####.#.#.##',
    '#....#...#...#....#',
    '#.######.#.######.#',
    '#.................#',
    '###################'
  ];
  var ROWS = MAZE.length, COLS = MAZE[0].length, TOTAL = (MAZE.join('').match(/[.o]/g) || []).length;
  var DOOR = { x: 9, y: 8 }, EXIT = { x: 9, y: 7 }, HOME = { x: 9, y: 9 };
  var DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  var KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right' };
  /* Abwechselnd verteilen und jagen, in Sekunden */
  var MODES = [7, 20, 7, 20, 5, 1e9];
  var WASPS = [
    { name: 'Rüpel', body: '#FF5A4A', stripe: '#2A0E0A', corner: { x: 17, y: -3 }, start: { x: 9, y: 7 }, out: 0 },
    { name: 'Lauer', hornet: true, corner: { x: 1, y: -3 }, start: { x: 9, y: 9 }, out: 1.5 },
    { name: 'Zick', body: '#FF8A3D', stripe: '#2A1408', corner: { x: 17, y: 23 }, start: { x: 8, y: 9 }, out: 5 },
    { name: 'Zufall', body: '#FFD400', stripe: '#111', corner: { x: 1, y: 23 }, start: { x: 10, y: 9 }, out: 9 }
  ];
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function wrapX(x) { return ((x % COLS) + COLS) % COLS; }

  /* Honigglas: macht die Wespen kurz zur Beute */
  function drawHoney(g, x, y, r, t) {
    var p = 1 + Math.sin(t / 150) * 0.1;
    g.save(); g.translate(x, y); g.scale(p * r / 10, p * r / 10);
    var gl = g.createRadialGradient(0, 0, 2, 0, 0, 22);
    gl.addColorStop(0, 'rgba(253,197,6,0.55)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill();
    g.lineJoin = 'round';
    rr(g, -8, -6, 16, 16, 4); g.fillStyle = '#E9A800'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = '#111'; g.stroke();
    g.fillStyle = '#FFF6D6'; g.fillRect(-5, -1, 10, 6);
    g.fillStyle = '#C98A00'; g.font = '800 5px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MB', 0, 2.2);
    rr(g, -5.5, -4, 2.2, 4, 1); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
    rr(g, -9, -11, 18, 5.5, 1.5); g.fillStyle = '#7A4A1A'; g.fill(); g.stroke();
    g.restore();
  }
  function drawFlower(g, x, y, r, t) {
    g.save(); g.translate(x, y); g.rotate(t / 900);
    g.lineWidth = Math.max(1, r * 0.1); g.strokeStyle = '#111';
    for (var i = 0; i < 6; i++) { g.save(); g.rotate(i / 6 * TAU); g.beginPath(); g.ellipse(r * 0.55, 0, r * 0.45, r * 0.25, 0, 0, TAU); g.fillStyle = i % 2 ? '#FF8AD8' : '#FFC2EC'; g.fill(); g.stroke(); g.restore(); }
    g.beginPath(); g.arc(0, 0, r * 0.32, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); g.stroke();
    g.restore();
  }
  function drawWaspKind(g, w, wing) {
    if (w.hornet) art.hornet(g, wing); else art.wasp(g, wing, w.body, w.stripe);
  }

  MBArcade.register({
    id: 'pfad',
    title: 'Pollenpfad',
    duration: 0,
    startText: 'Sammle alle Pollen im Labyrinth, ohne dass dich eine Wespe erwischt. Mit einem Honigglas drehst du den Spieß um und kannst die Wespen kurz jagen.',
    help: {
      legendTitle: 'Punkte',
      controls: [
        { icons: ['kbd:Pfeiltasten', 'kbd:WASD'], text: 'Fliegen (du kannst schon vor der Abzweigung lenken)', kb: true },
        { icons: ['swipe', 'tap'], text: 'Wischen in die Richtung, oder neben die Biene tippen', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.beginPath(); g.arc(23, 23, 5, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); }, text: 'Pollen', val: '10' },
        { draw: function (g) { drawHoney(g, 23, 24, 13, 0); }, text: 'Honigglas: Jetzt kannst du die Wespen jagen', val: '50' },
        { draw: function (g) { g.translate(25, 24); g.scale(0.55, 0.55); art.wasp(g, 0.4, '#7FA7D9', '#203050'); }, text: 'Verängstigte Wespe fangen, jede weitere zählt doppelt', val: '200–1.600' },
        { draw: function (g) { drawFlower(g, 23, 23, 14, 0); }, text: 'Blume, taucht zweimal pro Level auf', val: '+100 × Level' },
        { draw: function (g) { g.translate(25, 24); g.scale(0.55, 0.55); art.wasp(g, 0.4, '#FF5A4A', '#2A0E0A'); }, text: 'Von einer Wespe erwischt', val: '−1 Leben', minus: true }
      ]
    },
    cta: { path: 'unsere-leistungen/', text: 'Deine Besucher sollen sich auf deiner Website auch so gut zurechtfinden? Sprich uns an.' },
    stats: function (s) {
      var t = 'Level ' + s.level + ' erreicht, ' + s.pollen + ' Pollen gesammelt';
      return t + (s.wasps ? ', ' + s.wasps + (s.wasps === 1 ? ' Wespe gefangen.' : ' Wespen gefangen.') : '.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, T = 20, ox = 0, oy = 0, wallImg = null;
      var raf = 0, idleRaf = 0, ptr = null;
      var st = fresh();

      function fresh() {
        return {
          on: false, paused: false, t: 0, last: 0, score: 0, lives: LIVES, level: 1, pollen: 0, wasps: 0,
          grid: null, left: 0, bee: null, ghosts: [], ready: 0, dying: 0, over: false, levelDone: 0,
          mode: 0, modeT: 0, fright: 0, chain: 0, flower: null, flowersShown: 0,
          parts: [], pops: [], rings: [], shake: 0, shakeMag: 8, flash: 0, flashC: '255,74,61', waka: 0, hint: true,
          freeze: 0, zoom: 0, streak: 0, lastEat: -9999, trail: 0
        };
      }
      function loadGrid() {
        st.grid = MAZE.map(function (row) { return row.split(''); });
        st.left = 0;
        st.grid.forEach(function (row) { row.forEach(function (c) { if (c === '.' || c === 'o') st.left++; }); });
        st.flowersShown = 0;
      }
      function cell(x, y) { if (y < 0 || y >= ROWS) return '#'; return st.grid[y][wrapX(x)]; }
      function wall(x, y) { var c = cell(x, y); return c === '#'; }
      function blockedFor(e, x, y) {
        var c = cell(x, y);
        if (c === '#') return true;
        if (c === '-' || c === 'H') return !(e.ghost && (e.state === 'eyes' || e.state === 'leave'));
        return false;
      }
      function speeds() {
        var lv = Math.min(st.level, 8) - 1;
        return { bee: 6.2 + lv * 0.25, wasp: 5.6 + lv * 0.3, fright: 3.4, tunnel: 3.2, eyes: 13 };
      }

      function resetActors() {
        var p = MAZE.reduce(function (acc, row, y) { var x = row.indexOf('P'); return x >= 0 ? { x: x, y: y } : acc; }, null);
        st.bee = { x: p.x, y: p.y, dx: 0, dy: 0, want: null, face: { x: 1, y: 0 }, mouth: 0 };
        st.ghosts = WASPS.map(function (w, i) {
          return { ghost: true, i: i, w: w, x: w.start.x, y: w.start.y, dx: i ? 0 : -1, dy: 0, state: i ? 'house' : 'chase', outAt: w.out, bob: Math.random() * TAU };
        });
        st.fright = 0; st.chain = 0;
        st.ready = 1600; st.flower = null;
        st.mode = 0; st.modeT = 0; st.play = 0;
      }

      /* Raster an den Bildschirm anpassen */
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        T = Math.floor(Math.min((cssW - 12) / COLS, (cssH - BAR - 10) / ROWS) * 4) / 4;
        ox = (cssW - T * COLS) / 2; oy = 6 + (cssH - BAR - 10 - T * ROWS) / 2;
        paintWalls();
      }
      /* Wände einmal vorzeichnen: dunkle Waben mit gelber Kante zum Gang hin */
      function paintWalls() {
        var c = document.createElement('canvas');
        c.width = Math.ceil(T * COLS * dpr); c.height = Math.ceil(T * ROWS * dpr);
        var x = c.getContext('2d');
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (var yy = 0; yy < ROWS; yy++) for (var xx = 0; xx < COLS; xx++) {
          var ch = MAZE[yy][xx];
          if (ch !== '#') continue;
          var px = xx * T, py = yy * T;
          x.fillStyle = (xx + yy) % 2 ? '#2B2412' : '#2F2814';
          x.fillRect(px, py, T + 0.5, T + 0.5);
          x.fillStyle = 'rgba(253,197,6,0.07)';
          art.hex(x, px + T / 2, py + T / 2, T * 0.36, 'rgba(253,197,6,0.07)', null);
          x.strokeStyle = '#FDC506'; x.lineWidth = Math.max(1.5, T * 0.1); x.lineCap = 'round';
          x.beginPath();
          var inset = x.lineWidth / 2;
          function open(ax, ay) { var k = ay < 0 || ay >= ROWS ? '#' : MAZE[ay][wrapX(ax)]; return k !== '#' && !(ay === 9 && (ax < 0 || ax >= COLS)); }
          if (open(xx, yy - 1)) { x.moveTo(px, py + inset); x.lineTo(px + T, py + inset); }
          if (open(xx, yy + 1)) { x.moveTo(px, py + T - inset); x.lineTo(px + T, py + T - inset); }
          if (open(xx - 1, yy) && xx > 0) { x.moveTo(px + inset, py); x.lineTo(px + inset, py + T); }
          if (open(xx + 1, yy) && xx < COLS - 1) { x.moveTo(px + T - inset, py); x.lineTo(px + T - inset, py + T); }
          x.stroke();
        }
        /* Tür zum Wespennest */
        x.fillStyle = '#FF8AD8'; x.fillRect(DOOR.x * T, DOOR.y * T + T * 0.42, T, T * 0.16);
        wallImg = c;
      }
      function px(x) { return ox + (x + 0.5) * T; }
      function py(y) { return oy + (y + 0.5) * T; }

      /* Bewegung auf dem Raster: an jeder Wabenmitte wird neu entschieden */
      function advance(e, step, choose) {
        var guard = 0;
        while (step > 1e-6 && guard++ < 8) {
          var cx = Math.round(e.x), cy = Math.round(e.y);
          var at = Math.abs(e.x - cx) < 1e-6 && Math.abs(e.y - cy) < 1e-6;
          if (at) {
            cx = wrapX(cx); e.x = cx; e.y = cy;
            choose(e, cx, cy);
            if (!e.dx && !e.dy) return;
            if (blockedFor(e, cx + e.dx, cy + e.dy)) { e.dx = 0; e.dy = 0; return; }
          }
          var tx = at ? e.x + e.dx : (e.dx > 0 ? Math.ceil(e.x) : e.dx < 0 ? Math.floor(e.x) : e.x);
          var ty = at ? e.y + e.dy : (e.dy > 0 ? Math.ceil(e.y) : e.dy < 0 ? Math.floor(e.y) : e.y);
          var d = Math.abs(tx - e.x) + Math.abs(ty - e.y);
          if (d < 1e-6) d = 1;
          var m = Math.min(d, step);
          e.x += e.dx * m; e.y += e.dy * m; step -= m;
          if (Math.abs(e.x - Math.round(e.x)) < 1e-6) e.x = Math.round(e.x);
          if (Math.abs(e.y - Math.round(e.y)) < 1e-6) e.y = Math.round(e.y);
        }
      }
      function chooseBee(e, cx, cy) {
        if (e.want && !blockedFor(e, cx + e.want.x, cy + e.want.y)) { e.dx = e.want.x; e.dy = e.want.y; }
        if (e.dx || e.dy) e.face = { x: e.dx, y: e.dy };
      }
      function ghostTarget(gh) {
        var b = st.bee, w = gh.w;
        if (gh.state === 'eyes') return EXIT;
        if (st.mode % 2 === 0) return w.corner;
        if (gh.i === 0) return { x: Math.round(b.x), y: Math.round(b.y) };
        if (gh.i === 1) return { x: Math.round(b.x) + b.face.x * 4, y: Math.round(b.y) + b.face.y * 4 };
        if (gh.i === 2) return Math.hypot(gh.x - b.x, gh.y - b.y) > 7 ? { x: Math.round(b.x), y: Math.round(b.y) } : w.corner;
        return { x: Math.round(b.x) + Math.round(rnd(-4, 4)), y: Math.round(b.y) + Math.round(rnd(-4, 4)) };
      }
      function chooseGhost(e, cx, cy) {
        if (e.state === 'eyes' && cx === EXIT.x && cy === EXIT.y) { e.state = 'enter'; e.dx = 0; e.dy = 0; return; }
        var opts = [];
        ['up', 'left', 'down', 'right'].forEach(function (k) {
          var d = DIRS[k];
          if (d.x === -e.dx && d.y === -e.dy && (e.dx || e.dy)) return;
          if (blockedFor(e, cx + d.x, cy + d.y)) return;
          if (e.state !== 'eyes' && cell(cx + d.x, cy + d.y) === '-') return;
          opts.push(d);
        });
        if (!opts.length) { e.dx = -e.dx; e.dy = -e.dy; return; }
        var pick;
        if (st.fright > 0 && e.state === 'fright') pick = opts[Math.floor(Math.random() * opts.length)];
        else {
          var tg = ghostTarget(e), best = 1e9;
          opts.forEach(function (d) { var dd = Math.pow(cx + d.x - tg.x, 2) + Math.pow(cy + d.y - tg.y, 2); if (dd < best) { best = dd; pick = d; } });
        }
        e.dx = pick.x; e.dy = pick.y;
      }
      /* Ins Nest hinein und wieder heraus: direkte Bewegung ohne Raster */
      function moveTo(e, tx, ty, speed, dt) {
        var dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
        if (d <= speed * dt) { e.x = tx; e.y = ty; return true; }
        e.x += dx / d * speed * dt; e.y += dy / d * speed * dt;
        return false;
      }

      function pop(x, y, text, color, big) { st.pops.push({ x: x, y: y, text: text, color: color || '#FDC506', t0: st.t, big: !!big }); }
      function puff(x, y, colors, n, speed) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.3 + Math.random() * 0.9);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.3 + Math.random() * 0.4, size: 1 + Math.random() * 2.5, c: colors[i % colors.length] });
        }
      }
      function addScore(n) { st.score += n; ctx.setScore(st.score); }
      /* Juice: Druckwellen, Wackeln, kurzer Freeze und Zoom-Stoß (bei „weniger Bewegung“ aus) */
      function ring(x, y, color, max, life, w) { st.rings.push({ x: x, y: y, c: color, max: max, life: life || 500, w: w || 4, t0: st.t }); }
      function shakeIt(time, mag) { if (ctx.reduce) return; st.shake = Math.max(st.shake, time); st.shakeMag = Math.max(st.shake > 0.05 ? st.shakeMag : 0, mag); }
      function hitstop(ms) { if (!ctx.reduce) st.freeze = Math.max(st.freeze, ms); }
      function punch(v) { if (!ctx.reduce) st.zoom = Math.max(st.zoom, v); }
      function flashIt(v, c) { st.flash = Math.max(st.flash, ctx.reduce ? v * 0.5 : v); st.flashC = c; }
      function sparkle(x, y, colors, n, speed) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.5 + Math.random() * 0.5, size: 2.5 + Math.random() * 3, c: colors[i % colors.length], star: true, spin: Math.random() * TAU });
        }
      }

      function eat(x, y) {
        var c = st.grid[y][x];
        if (c !== '.' && c !== 'o') return;
        st.grid[y][x] = ' ';
        st.left--; st.pollen++;
        if (c === '.') {
          addScore(10);
          st.waka = 1 - st.waka;
          st.streak = st.t - st.lastEat < 400 ? st.streak + 1 : 0;
          st.lastEat = st.t;
          st.bee.chomp = 1;
          var up = Math.min(st.streak, 24) * 9;
          ctx.tone((st.waka ? 520 : 440) + up, (st.waka ? 620 : 380) + up, 0.05, 'triangle', 0.025);
          if (!ctx.reduce && Math.random() < 0.5) puff(px(x), py(y), ['#FDC506', '#FFE680'], 3, 50);
        } else {
          addScore(50);
          st.fright = Math.max(2.5, 7.5 - st.level * 0.6) * 1000;
          st.chain = 0;
          flashIt(1, '253,197,6');
          shakeIt(0.3, 9); hitstop(90); punch(1);
          st.ghosts.forEach(function (gh) {
            gh.jolt = 1;
            if (gh.state === 'chase') { gh.state = 'fright'; gh.dx = -gh.dx; gh.dy = -gh.dy; }
            else if (gh.state === 'house' || gh.state === 'leave') gh.scared = true;
          });
          ring(px(x), py(y), '#FDC506', T * 7, 650, 6);
          ring(px(x), py(y), '#FFF6D6', T * 4, 450, 3);
          puff(px(x), py(y), ['#FDC506', '#FFE680', '#E9A800'], 24, 190);
          sparkle(px(x), py(y), ['#FFFFFF', '#FFE680', '#FDC506'], 14, 160);
          pop(cssW / 2, oy + T * 6, 'HONIG-RAUSCH!', '#FDC506', true);
          ctx.tone(330, 990, 0.3, 'triangle', 0.05); ctx.tone(660, 1320, 0.25, 'square', 0.025, 0.08);
        }
        var eaten = TOTAL - st.left;
        if ((eaten === 60 && st.flowersShown === 0) || (eaten === 130 && st.flowersShown === 1)) {
          st.flowersShown++;
          st.flower = { x: 9, y: 11, until: st.t + 9000, t0: st.t };
          ring(px(9), py(11), '#FF8AD8', T * 4, 600, 5);
          sparkle(px(9), py(11), ['#FF8AD8', '#FFC2EC', '#FFFFFF'], 12, 120);
          pop(px(9), py(11) - T, 'Blume!', '#FF8AD8');
          ctx.tone(990, 1480, 0.12, 'triangle', 0.04); ctx.tone(1320, 1980, 0.12, 'triangle', 0.03, 0.1);
        }
        if (!st.left) {
          st.levelDone = st.t + 1800;
          var bonus = 500 * st.level;
          addScore(bonus);
          pop(cssW / 2, oy + T * 11.5, 'Alles gesammelt! +' + bonus, '#FDC506', true);
          flashIt(0.8, '253,197,6'); shakeIt(0.25, 7); punch(1);
          for (var k = 0; k < 5; k++) {
            var cx = ox + T * COLS * (0.15 + k * 0.175), cy = oy + T * ROWS * (0.3 + (k % 2) * 0.35);
            sparkle(cx, cy, ['#FDC506', '#FF8AD8', '#7FD3FF', '#FFFFFF', '#5CC46A'], 16, 220);
            ring(cx, cy, k % 2 ? '#FF8AD8' : '#FDC506', T * 5, 700, 4);
          }
          ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.12, 'triangle', 0.06, 0.12); ctx.tone(1046, 1568, 0.2, 'triangle', 0.05, 0.24);
        }
      }

      function hitBee() {
        st.dying = st.t;
        shakeIt(0.5, 13); hitstop(260); flashIt(1, '255,74,61');
        ring(px(st.bee.x), py(st.bee.y), '#FF5A4A', T * 6, 600, 6);
        puff(px(st.bee.x), py(st.bee.y), ['#F7B500', '#3A2410', '#FFFFFF'], 28, 170);
        ctx.tone(660, 80, 0.8, 'sawtooth', 0.05);
      }

      function update(dt) {
        st.shake = Math.max(0, st.shake - dt);
        if (st.freeze > 0) { st.freeze -= dt * 1000; return; }
        st.t += dt * 1000;
        var sp = speeds(), b = st.bee;
        st.flash = Math.max(0, st.flash - dt * 2.5);
        st.zoom = Math.max(0, st.zoom - dt * 4);
        if (b) b.chomp = Math.max(0, (b.chomp || 0) - dt * 8);
        st.ghosts.forEach(function (gh) { gh.jolt = Math.max(0, (gh.jolt || 0) - dt * 2); });
        st.rings = st.rings.filter(function (r) { return st.t - r.t0 < r.life; });
        if (st.fright > 0 && b && (b.dx || b.dy) && !ctx.reduce) {
          st.trail -= dt;
          if (st.trail <= 0) { st.trail = 0.045; st.parts.push({ x: px(b.x) - b.dx * T * 0.4 + rnd(-2, 2), y: py(b.y) - b.dy * T * 0.4 + rnd(-2, 2), vx: rnd(-10, 10), vy: rnd(-10, 10), t: 0, life: 0.45, size: rnd(1.5, 3), c: Math.random() < 0.5 ? '#FDC506' : '#FFF6D6', star: Math.random() < 0.4, spin: 0 }); }
        }
        for (var q = st.parts.length - 1; q >= 0; q--) {
          var pt = st.parts[q];
          pt.t += dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vx *= 0.96; pt.vy *= 0.96; if (pt.star) pt.spin += dt * 6;
          if (pt.t > pt.life) st.parts.splice(q, 1);
        }
        st.pops = st.pops.filter(function (p) { return st.t - p.t0 < (p.big ? 1500 : 800); });
        if (st.levelDone) {
          if (st.t >= st.levelDone) { st.levelDone = 0; st.level++; loadGrid(); resetActors(); pop(cssW / 2, oy + T * 11.5, 'Level ' + st.level, '#FFFFFF', true); }
          return;
        }
        if (st.dying) {
          if (st.t - st.dying > 1500) {
            st.dying = 0; st.lives--;
            if (st.lives <= 0) { st.over = true; return; }
            resetActors();
          }
          return;
        }
        if (st.ready > 0) { st.ready -= dt * 1000; return; }
        st.play += dt;

        /* Verteilen und Jagen wechseln sich ab */
        if (st.fright > 0) {
          st.fright -= dt * 1000;
          if (st.fright <= 0) { st.fright = 0; st.ghosts.forEach(function (gh) { if (gh.state === 'fright') gh.state = 'chase'; gh.scared = false; }); }
        } else {
          st.modeT += dt;
          if (st.modeT > MODES[Math.min(st.mode, MODES.length - 1)]) {
            st.modeT = 0; st.mode++;
            st.ghosts.forEach(function (gh) { if (gh.state === 'chase') { gh.dx = -gh.dx; gh.dy = -gh.dy; } });
          }
        }

        /* Biene */
        if (b.want && b.dx === -b.want.x && b.dy === -b.want.y && (b.dx || b.dy)) { b.dx = b.want.x; b.dy = b.want.y; b.face = { x: b.dx, y: b.dy }; }
        if (!b.dx && !b.dy && b.want) { var cx0 = Math.round(b.x), cy0 = Math.round(b.y); if (!blockedFor(b, cx0 + b.want.x, cy0 + b.want.y)) { b.x = cx0; b.y = cy0; } }
        advance(b, sp.bee * dt, chooseBee);
        b.mouth += dt * ((b.dx || b.dy) ? 1 : 0);
        var bx = wrapX(Math.round(b.x)), by = Math.round(b.y);
        if (Math.abs(b.x - Math.round(b.x)) < 0.35 && Math.abs(b.y - by) < 0.35) eat(bx, by);
        if (st.flower && st.t > st.flower.until) st.flower = null;
        if (st.flower && Math.hypot(b.x - st.flower.x, b.y - st.flower.y) < 0.6) {
          var fb = 100 * st.level;
          addScore(fb);
          pop(px(st.flower.x), py(st.flower.y) - T * 0.6, '+' + fb, '#FF8AD8', true);
          puff(px(st.flower.x), py(st.flower.y), ['#FF8AD8', '#FFC2EC', '#FDC506'], 20, 150);
          sparkle(px(st.flower.x), py(st.flower.y), ['#FF8AD8', '#FFC2EC', '#FFFFFF'], 16, 180);
          ring(px(st.flower.x), py(st.flower.y), '#FF8AD8', T * 6, 600, 6);
          flashIt(0.7, '255,138,216'); shakeIt(0.2, 7); hitstop(70); punch(0.7);
          ctx.tone(880, 1760, 0.2, 'triangle', 0.05);
          st.flower = null;
        }

        /* Wespen */
        st.ghosts.forEach(function (gh) {
          if (gh.state === 'house') {
            gh.bob += dt * 6; gh.y = HOME.y + Math.sin(gh.bob) * 0.25;
            if (st.play > gh.outAt) gh.state = 'leave';
            return;
          }
          if (gh.state === 'leave') {
            if (Math.abs(gh.x - HOME.x) > 0.01) moveTo(gh, HOME.x, gh.y, 4, dt);
            else if (moveTo(gh, EXIT.x, EXIT.y, 4, dt)) { gh.state = gh.scared && st.fright > 0 ? 'fright' : 'chase'; gh.scared = false; gh.dx = -1; gh.dy = 0; }
            return;
          }
          if (gh.state === 'enter') {
            if (moveTo(gh, HOME.x, HOME.y, sp.eyes * 0.5, dt)) { gh.state = 'leave'; }
            return;
          }
          var speed = gh.state === 'eyes' ? sp.eyes : gh.state === 'fright' ? sp.fright : sp.wasp;
          if (gh.state !== 'eyes' && Math.round(gh.y) === 9 && (gh.x < 4 || gh.x > 14)) speed = Math.min(speed, sp.tunnel);
          advance(gh, speed * dt, chooseGhost);
          /* Zusammenstoß */
          if (gh.state !== 'eyes' && Math.hypot(gh.x - b.x, gh.y - b.y) < 0.62) {
            if (gh.state === 'fright') {
              st.chain++; st.wasps++;
              var pts = 200 * Math.pow(2, Math.min(3, st.chain - 1));
              addScore(pts);
              gh.state = 'eyes';
              pop(px(gh.x), py(gh.y), '+' + pts + (st.chain > 1 ? ' ×' + st.chain : ''), '#7FD3FF', st.chain >= 2);
              puff(px(gh.x), py(gh.y), ['#7FA7D9', '#FFFFFF', '#203050'], 22, 190);
              sparkle(px(gh.x), py(gh.y), ['#7FD3FF', '#FFFFFF'], 10, 170);
              ring(px(gh.x), py(gh.y), '#7FD3FF', T * (3 + st.chain * 1.2), 500, 5);
              shakeIt(0.18 + st.chain * 0.05, 5 + st.chain * 2); hitstop(110); punch(0.5 + st.chain * 0.15);
              flashIt(0.35, '127,211,255');
              ctx.tone(300, 1200, 0.18, 'square', 0.04);
            } else if (!st.dying) hitBee();
          }
        });
      }

      /* Zeichnen */
      function drawGhost(gh) {
        var x = px(gh.x), y = py(gh.y), s = T * 1.55 / 62;
        if (gh.dx) gh.face = gh.dx;
        var copies = [x];
        if (gh.x < 0.6) copies.push(x + COLS * T); else if (gh.x > COLS - 1.6) copies.push(x - COLS * T);
        copies.forEach(function (cxp) {
          g.save(); g.translate(cxp, y);
          if (gh.state === 'eyes' || gh.state === 'enter') {
            [[-0.17, 0], [0.17, 0]].forEach(function (o) {
              g.beginPath(); g.arc(o[0] * T, o[1] * T, T * 0.15, 0, TAU); g.fillStyle = '#fff'; g.fill();
              g.beginPath(); g.arc(o[0] * T + gh.dx * T * 0.06, gh.dy * T * 0.06, T * 0.07, 0, TAU); g.fillStyle = '#2F6FD0'; g.fill();
            });
            g.restore(); return;
          }
          if (gh.jolt > 0 && !ctx.reduce) g.translate((Math.random() * 2 - 1) * gh.jolt * T * 0.15, -gh.jolt * T * 0.2);
          if (gh.jolt > 0.3) {
            g.font = '900 ' + T * 0.9 + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.lineWidth = 3; g.strokeStyle = '#111'; g.strokeText('!', 0, -T * 0.95); g.fillStyle = '#FFFFFF'; g.fillText('!', 0, -T * 0.95);
          }
          if ((gh.face || -1) < 0) g.scale(-1, 1);
          if (gh.dy) g.rotate(gh.dy * 0.35);
          g.scale(s, s);
          var wing = Math.sin(st.t / 25 + gh.i);
          var scared = gh.state === 'fright' || (gh.scared && st.fright > 0);
          if (scared) {
            var blink = st.fright < 2000 && Math.floor(st.t / 200) % 2;
            art.wasp(g, wing, blink ? '#FFFFFF' : '#7FA7D9', blink ? '#E5322D' : '#203050');
          } else drawWaspKind(g, gh.w, wing);
          g.restore();
        });
      }
      function drawBee() {
        var b = st.bee, x = px(b.x), y = py(b.y), s = T * 1.3 / 52;
        g.save(); g.translate(x, y);
        if (st.dying) {
          var a = (st.t - st.dying) / 1500;
          g.rotate(a * 8); g.scale(Math.max(0.05, 1 - a), Math.max(0.05, 1 - a));
        } else {
          /* Wie beim Vorbild: Der Kopf zeigt immer ganz in Flugrichtung */
          if (b.face.x < 0) g.scale(-1, 1);
          else if (b.face.y) g.rotate(b.face.y * Math.PI / 2);
        }
        var ch = b.chomp || 0;
        g.scale(s * (1 + ch * 0.18), s * (1 - ch * 0.08));
        if (st.fright > 0 && !st.dying) {
          var gl = g.createRadialGradient(0, 0, 4, 0, 0, 48); gl.addColorStop(0, 'rgba(255,246,214,0.5)'); gl.addColorStop(1, 'rgba(255,246,214,0)');
          g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 48, 0, TAU); g.fill();
        }
        art.bee(g, Math.sin(st.t / 1000 * 42));
        /* Mund: geht beim Fliegen auf und zu */
        var moving = (b.dx || b.dy) && !st.dying && !st.ready;
        var open = moving ? 0.5 + 0.5 * Math.sin(b.mouth * 22) : 0.15;
        g.beginPath(); g.ellipse(16, 6.5, 4.6, 0.8 + 4 * open, 0, 0, TAU);
        g.fillStyle = '#F05A6E'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#111'; g.stroke();
        if (open > 0.45) { g.beginPath(); g.ellipse(16, 6.5 + 2 * open, 2.6, 1.2 * open, 0, 0, TAU); g.fillStyle = '#9E1F33'; g.fill(); }
        g.restore();
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = st.shakeMag * Math.min(1, st.shake / 0.2); sx = (Math.random() * 2 - 1) * m * dpr; sy = (Math.random() * 2 - 1) * m * dpr; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#100E09'; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(dpr, 0, 0, dpr, sx, sy);
        if (st.zoom > 0) {
          var zc = 1 + st.zoom * 0.035, zx = cssW / 2, zy = (cssH - BAR) / 2;
          g.translate(zx, zy); g.scale(zc, zc); g.translate(-zx, -zy);
        }
        if (wallImg) {
          var flashWalls = st.levelDone && Math.floor(st.t / 200) % 2;
          if (flashWalls) g.globalAlpha = 0.35;
          g.drawImage(wallImg, ox, oy, T * COLS, T * ROWS);
          g.globalAlpha = 1;
        }
        if (st.grid) {
          for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
            var c = st.grid[y][x];
            if (c === '.') { g.beginPath(); g.arc(px(x), py(y), Math.max(1.6, T * 0.1), 0, TAU); g.fillStyle = '#FDC506'; g.fill(); }
            else if (c === 'o') drawHoney(g, px(x), py(y), T * 0.36, st.t + x * 100);
          }
        }
        if (st.flower) {
          var left = st.flower.until - st.t;
          if (left > 2000 || Math.floor(st.t / 150) % 2) {
            var fx0 = px(st.flower.x), fy0 = py(st.flower.y), pulse = 1 + Math.sin(st.t / 120) * 0.15;
            g.save(); g.translate(fx0, fy0); g.rotate(st.t / 700);
            for (var ry = 0; ry < 8; ry++) {
              g.rotate(TAU / 8);
              var rg = g.createLinearGradient(0, 0, T * 2.4 * pulse, 0);
              rg.addColorStop(0, 'rgba(255,138,216,0.7)'); rg.addColorStop(1, 'rgba(255,138,216,0)');
              g.fillStyle = rg; g.beginPath(); g.moveTo(0, 0); g.lineTo(T * 2.4 * pulse, -T * 0.3); g.lineTo(T * 2.4 * pulse, T * 0.3); g.closePath(); g.fill();
            }
            g.restore();
            var appear = Math.min(1, (st.t - (st.flower.t0 || 0)) / 300);
            drawFlower(g, fx0, fy0, T * 0.45 * (appear < 1 ? 0.3 + appear * 0.9 : pulse * 0.95), st.t);
          }
        }
        g.save(); g.beginPath(); g.rect(ox, oy - T, T * COLS, T * (ROWS + 2)); g.clip();
        if (st.bee) drawBee();
        if (!st.dying || st.t - st.dying < 300) st.ghosts.forEach(drawGhost);
        g.restore();
        st.rings.forEach(function (r) {
          var a = (st.t - r.t0) / r.life, e = 1 - Math.pow(1 - a, 3);
          g.globalAlpha = Math.max(0, 1 - a);
          g.beginPath(); g.arc(r.x, r.y, Math.max(1, r.max * e), 0, TAU);
          g.lineWidth = Math.max(0.5, r.w * (1 - a)); g.strokeStyle = r.c; g.stroke();
        });
        st.parts.forEach(function (p) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life);
          g.fillStyle = p.c;
          if (p.star) {
            var r1 = p.size * 1.6, r2 = p.size * 0.5;
            g.save(); g.translate(p.x, p.y); g.rotate(p.spin); g.beginPath();
            for (var k = 0; k < 8; k++) { var rr2 = k % 2 ? r2 : r1, an = k / 8 * TAU; g.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); }
            g.closePath(); g.fill(); g.restore();
          } else { g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fill(); }
        });
        g.globalAlpha = 1;
        /* Honig-Rausch: goldener Rand, der pulsiert */
        if (st.fright > 0) {
          var vg = g.createRadialGradient(cssW / 2, (cssH - BAR) / 2, Math.min(cssW, cssH) * 0.3, cssW / 2, (cssH - BAR) / 2, Math.max(cssW, cssH) * 0.75);
          var va = (0.16 + Math.sin(st.t / 110) * 0.07) * (st.fright < 2000 ? (Math.floor(st.t / 200) % 2 ? 0.4 : 1) : 1);
          vg.addColorStop(0, 'rgba(253,197,6,0)'); vg.addColorStop(1, 'rgba(253,197,6,' + va + ')');
          g.fillStyle = vg; g.fillRect(0, 0, cssW, cssH - BAR);
        }
        st.pops.forEach(function (p) {
          var life = p.big ? 1500 : 800, age = (st.t - p.t0) / life;
          g.font = '800 ' + (p.big ? Math.min(30, cssW / 14) : Math.max(13, T * 0.75)) + 'px Poppins, sans-serif';
          var half = g.measureText(p.text).width * 0.62 + 6;
          g.save(); g.translate(Math.max(half, Math.min(cssW - half, p.x)), p.y - age * (p.big ? 14 : 26));
          var s = age < 0.15 ? 0.6 + age / 0.15 * 0.6 : 1.2 - Math.min(0.2, age - 0.15);
          g.scale(s, s);
          g.globalAlpha = age > 0.65 ? Math.max(0, 1 - (age - 0.65) / 0.35) : 1;
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
          g.font = '800 ' + (p.big ? Math.min(30, cssW / 14) : Math.max(13, T * 0.75)) + 'px Poppins, sans-serif';
          g.lineWidth = p.big ? 7 : 4; g.strokeStyle = 'rgba(17,17,17,0.9)'; g.strokeText(p.text, 0, 0);
          g.fillStyle = p.color; g.fillText(p.text, 0, 0);
          g.restore();
        });
        if (st.on && st.ready > 0 && !st.dying && !st.paused) {
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
          g.font = '800 ' + Math.max(16, T * 0.95) + 'px Poppins, sans-serif';
          var txt = st.hint ? (ctx.touch() ? 'Wisch in eine Richtung' : 'Pfeiltaste drücken') : 'Los geht’s!';
          var ps = 1 + Math.sin(performance.now() / 180) * 0.06;
          g.save(); g.translate(cssW / 2, py(11)); g.scale(ps, ps);
          g.lineWidth = 6; g.strokeStyle = 'rgba(17,17,17,0.95)'; g.strokeText(txt, 0, 0);
          g.fillStyle = '#FDC506'; g.fillText(txt, 0, 0);
          g.restore();
        }
        /* Leiste unten: Leben, Level (ohne Wackeln und Zoom) */
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        var by = cssH - BAR;
        g.fillStyle = '#151515'; g.fillRect(0, by, cssW, BAR);
        g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '700 14px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.8)';
        g.fillText('Level ' + st.level, 14, by + BAR / 2);
        for (var l = 0; l < LIVES; l++) {
          g.save(); g.translate(cssW - 24 - l * 30, by + BAR / 2); g.scale(0.36, 0.36);
          if (l >= st.lives) g.globalAlpha = 0.2;
          art.bee(g, 0.3); g.restore();
        }
        if (st.fright > 0) {
          var fw = Math.min(120, cssW * 0.25), fx = cssW / 2 - fw / 2, frac = st.fright / (Math.max(2.5, 7.5 - st.level * 0.6) * 1000);
          rr(g, fx, by + BAR / 2 - 4, fw, 8, 4); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fill();
          rr(g, fx, by + BAR / 2 - 4, fw * Math.min(1, frac), 8, 4); g.fillStyle = '#FFF6D6'; g.fill();
        }
        if (st.flash > 0) {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.fillStyle = 'rgba(' + st.flashC + ',' + st.flash * 0.42 + ')'; g.fillRect(0, 0, cv.width, cv.height);
        }
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.033, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.over) { finish(); return; }
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
        cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf);
      }
      function finish() {
        stop(); render();
        ctx.finish(st.score, { level: st.level, pollen: st.pollen, wasps: st.wasps });
      }

      function steer(dir) {
        if (!st.on || st.paused) return;
        st.bee.want = DIRS[dir];
        if (st.hint) { st.hint = false; st.ready = Math.min(st.ready, 500); }
      }

      /* Wischen und Tippen */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e);
        ptr = { id: e.pointerId, x: p.x, y: p.y, moved: false };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id) return;
        var p = local(e), dx = p.x - ptr.x, dy = p.y - ptr.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        ptr.x = p.x; ptr.y = p.y; ptr.moved = true;
      });
      cv.addEventListener('pointerup', function (e) {
        if (ptr && e.pointerId === ptr.id && !ptr.moved && st.bee) {
          var p = local(e), dx = p.x - px(st.bee.x), dy = p.y - py(st.bee.y);
          if (Math.max(Math.abs(dx), Math.abs(dy)) > T * 0.6) steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        }
        ptr = null;
      });
      cv.addEventListener('pointercancel', function () { ptr = null; });

      loadGrid(); resetActors();
      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh();
          loadGrid(); resetActors();
          layout();
          st.ready = 99999;
          st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on; ptr = null;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); st = fresh(); loadGrid(); resetActors(); layout(); render(); },
        unmount: stop,
        resize: function () { layout(); render(); },
        key: function (e) {
          var d = KEYMAP[e.key];
          if (d) { steer(d); return true; }
          return e.key === ' ';
        },
        _debug: function () { return { st: st, px: px, py: py, T: T }; }
      };
    }
  });
})();

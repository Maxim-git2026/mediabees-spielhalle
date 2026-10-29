/* Spiel 4: Bienentanz (Snake-Prinzip) */
(function () {
  'use strict';
  var TAU = Math.PI * 2;
  var art = MBArcade.art;
  var SHORT = 15, MAXLONG = 30;
  var START_MS = 150, MIN_MS = 72, SPEEDUP = 2.2;
  var GOLD_EVERY = 6, GOLD_LIFE = 7000;
  var DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  var KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right'
  };
  var MILESTONES = {
    10: 'Der Bienentanz kommt in Fahrt!',
    20: 'Da geht die Post ab!',
    30: 'Ganz Herne tanzt mit!',
    45: 'Jetzt tanzt auch Wanne-Eickel mit!',
    60: 'Das ist kein Schwarm mehr, das ist ein Umzug!'
  };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function cp(p) { return { x: p.x, y: p.y }; }

  /* Zeichnungen in beliebiger Einheit: x, y = Mitte, r = Radius */
  function drawPollen(g, x, y, r, t) {
    var p = 1 + Math.sin(t / 170) * 0.08;
    r *= p;
    var gl = g.createRadialGradient(x, y, r * 0.3, x, y, r * 2.3);
    gl.addColorStop(0, 'rgba(253,197,6,0.45)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 2.3, 0, TAU); g.fill();
    g.fillStyle = '#E9A800';
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * TAU + t / 900;
      g.beginPath(); g.arc(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.3, 0, TAU); g.fill();
    }
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#FDC506'; g.fill();
    g.lineWidth = r * 0.14; g.strokeStyle = '#111'; g.stroke();
    g.fillStyle = '#C98A00';
    g.beginPath(); g.arc(x - r * 0.3, y + r * 0.25, r * 0.12, 0, TAU); g.arc(x + r * 0.35, y + r * 0.1, r * 0.1, 0, TAU); g.arc(x + r * 0.05, y - r * 0.35, r * 0.1, 0, TAU); g.fill();
    g.beginPath(); g.arc(x - r * 0.35, y - r * 0.38, r * 0.2, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill();
  }
  function drawFlower(g, x, y, r, rot) {
    g.save(); g.translate(x, y); g.rotate(rot);
    var gl = g.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2);
    gl.addColorStop(0, 'rgba(255,230,128,0.55)'); gl.addColorStop(1, 'rgba(255,230,128,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, r * 2, 0, TAU); g.fill();
    g.lineWidth = r * 0.1; g.strokeStyle = '#111';
    for (var i = 0; i < 6; i++) {
      g.save(); g.rotate(i / 6 * TAU);
      g.beginPath(); g.ellipse(r * 0.55, 0, r * 0.48, r * 0.26, 0, 0, TAU);
      g.fillStyle = i % 2 ? '#FFE680' : '#FFF6D6'; g.fill(); g.stroke();
      g.restore();
    }
    g.beginPath(); g.arc(0, 0, r * 0.36, 0, TAU); g.fillStyle = '#E9A800'; g.fill(); g.stroke();
    g.beginPath(); g.arc(-r * 0.1, -r * 0.1, r * 0.1, 0, TAU); g.fillStyle = '#fff'; g.fill();
    g.restore();
  }

  MBArcade.register({
    id: 'polonaise',
    title: 'Bienentanz',
    duration: 0,
    startText: 'Führ den Bienentanz an! Jeder Pollen holt eine Biene dazu, die sich hinten einreiht. Nicht gegen den Rand und nicht in die eigene Schlange fliegen.',
    help: {
      controls: [
        { icons: ['kbd:Pfeiltasten', 'kbd:WASD'], text: 'Lenken', kb: true },
        { icons: ['swipe', 'tap'], text: 'Wischen zum Lenken, oder neben die Königin tippen', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { drawPollen(g, 23, 23, 9, 0); }, text: 'Pollen. Der Schwarm wird eine Biene länger.', val: '+10' },
        { draw: function (g) { drawFlower(g, 23, 23, 13, 0.3); }, text: 'Goldblume, taucht ab und zu auf und welkt schnell', val: '+50' },
        { draw: function (g) { g.translate(24, 26); g.rotate(2.6); g.scale(0.52, -0.52); art.bee(g, 0.2); }, text: 'Gegen den Rand oder in den eigenen Schwarm', val: 'Ende', minus: true }
      ]
    },
    ranks: [
      [1000, 'Schwarmkönigin', 'Die ganze Wiese tanzt mit!'],
      [500, 'Tanzprofi', 'Da ist Stimmung in der Bude.'],
      [200, 'Tanzbiene', 'Schöner Schwarm.'],
      [0, 'Mauerblümchen', 'Allein tanzt es sich schlecht. Nochmal!']
    ],
    cta: { path: 'unsere-leistungen/', text: 'Soll deine Website auch so wachsen? Wir helfen.' },
    stats: function (s) {
      var t = 'Schwarm mit ' + s.len + ' Bienen, ' + s.pollen + ' Pollen';
      return t + (s.gold ? ', ' + s.gold + (s.gold === 1 ? ' Goldblume.' : ' Goldblumen.') : '.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var dpr = 1, cssW = 0, cssH = 0, c = 30, ox = 0, oy = 0, bg = null;
      var cols = 26, rows = 15;
      var st = null, raf = 0, idleRaf = 0, ptr = null;

      function makeGrid() {
        var r = cv.getBoundingClientRect();
        var asp = r.width && r.height ? r.width / r.height : 16 / 9;
        var short = Math.min(r.width || 999, r.height || 999) < 520 ? 12 : SHORT;
        if (asp >= 1) { rows = short; cols = Math.min(MAXLONG, Math.round(short * asp)); }
        else { cols = short; rows = Math.min(MAXLONG, Math.round(short / asp)); }
      }

      function fresh() {
        var y = Math.floor(rows / 2), x = Math.max(3, Math.floor(cols * 0.3));
        var snake = [{ x: x, y: y }, { x: x - 1, y: y }, { x: x - 2, y: y }];
        var s = {
          on: false, paused: false, dead: false, waiting: true, deadT: 0, t: 0, last: 0,
          score: 0, pollen: 0, goldCount: 0, grow: 0, step: START_MS, acc: 0,
          snake: snake, prev: snake.map(cp), dir: DIRS.right, queue: [],
          food: null, gold: null, parts: [], pops: [], fly: [],
          shake: 0, bump: 0, flash: 0, tailT: -9999, said: {}
        };
        st = s;
        s.food = spawn();
        return s;
      }

      function spawn() {
        var used = {}, free = [], near = [];
        st.snake.forEach(function (p) { used[p.x + ',' + p.y] = 1; });
        if (st.food) used[st.food.x + ',' + st.food.y] = 1;
        if (st.gold) used[st.gold.x + ',' + st.gold.y] = 1;
        var h = st.snake[0];
        for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
          if (used[x + ',' + y]) continue;
          if (Math.abs(x - h.x) + Math.abs(y - h.y) < 3) near.push({ x: x, y: y });
          else free.push({ x: x, y: y });
        }
        var pool = free.length ? free : near;
        if (!pool.length) return null;
        return pool[Math.floor(Math.random() * pool.length)];
      }

      /* Hintergrund: dunkle Wiese im Schachbrett, einmal vorgezeichnet */
      function paintBg() {
        bg = document.createElement('canvas');
        bg.width = cv.width; bg.height = cv.height;
        var x = bg.getContext('2d');
        x.fillStyle = '#0F120E'; x.fillRect(0, 0, bg.width, bg.height);
        x.setTransform(dpr * c, 0, 0, dpr * c, dpr * ox, dpr * oy);
        for (var yy = 0; yy < rows; yy++) for (var xx = 0; xx < cols; xx++) {
          x.fillStyle = (xx + yy) % 2 ? '#1A2416' : '#1E2A19';
          x.fillRect(xx, yy, 1.02, 1.02);
        }
        var r = art.rng(cols * 31 + rows);
        for (var i = 0; i < cols * rows * 0.18; i++) {
          var gx = r() * cols, gy = r() * rows, kind = r();
          if (kind < 0.7) {
            x.strokeStyle = 'rgba(120,170,90,0.18)'; x.lineWidth = 0.05; x.lineCap = 'round';
            x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx - 0.08, gy - 0.22); x.moveTo(gx + 0.08, gy); x.lineTo(gx + 0.12, gy - 0.26); x.moveTo(gx + 0.16, gy); x.lineTo(gx + 0.3, gy - 0.18); x.stroke();
          } else {
            x.fillStyle = kind < 0.85 ? 'rgba(255,255,255,0.14)' : 'rgba(253,197,6,0.16)';
            for (var p = 0; p < 4; p++) { x.beginPath(); x.arc(gx + Math.cos(p * 1.57) * 0.07, gy + Math.sin(p * 1.57) * 0.07, 0.06, 0, TAU); x.fill(); }
          }
        }
        x.strokeStyle = 'rgba(253,197,6,0.55)'; x.lineWidth = 0.08;
        x.strokeRect(-0.04, -0.04, cols + 0.08, rows + 0.08);
      }

      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2, 2400 / r.width);
        cssW = r.width; cssH = r.height;
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        if (!st || !st.on) { makeGrid(); fresh(); }
        var pad = 6;
        c = Math.min((cssW - pad * 2) / cols, (cssH - pad * 2) / rows);
        ox = (cssW - cols * c) / 2; oy = (cssH - rows * c) / 2;
        paintBg();
        render();
      }

      /* Effekte */
      function burst(x, y, colors, n, speed) {
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.35 + Math.random() * 0.8);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.35 + Math.random() * 0.45, size: 0.05 + Math.random() * 0.09, c: colors[i % colors.length], star: i % 4 === 0 });
        }
      }
      function pop(x, y, text, big, color) { st.pops.push({ x: x, y: y, text: text, t0: st.t, big: !!big, color: color || '#FDC506' }); }
      function shakeIt(v) { if (!ctx.reduce) st.shake = Math.max(st.shake, v); }

      function turn(name) {
        if (!st.on || st.paused || st.dead) return;
        var d = DIRS[name];
        if (st.waiting) {
          if (d.x === -st.dir.x && d.y === -st.dir.y) { st.snake.reverse(); st.prev = st.snake.map(cp); }
          st.dir = d; st.waiting = false; st.acc = 0;
          ctx.tone(392, 587, 0.12, 'triangle', 0.05);
          return;
        }
        var last = st.queue.length ? st.queue[st.queue.length - 1] : st.dir;
        if ((d.x === last.x && d.y === last.y) || (d.x === -last.x && d.y === -last.y)) return;
        if (st.queue.length < 3) st.queue.push(d);
      }

      function die(x, y) {
        st.dead = true; st.deadT = st.t; st.flash = 1; shakeIt(0.45);
        var hx = st.snake[0].x + 0.5, hy = st.snake[0].y + 0.5;
        burst((hx + x + 0.5) / 2, (hy + y + 0.5) / 2, ['#FF4A3D', '#FFFFFF', '#FDC506'], 26, 7);
        st.fly = st.snake.map(function (p, i) {
          var a = Math.random() * TAU, v = rnd(4, 9);
          return { x: p.x + 0.5, y: p.y + 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, rot: Math.random() * TAU, vr: rnd(-8, 8), head: i === 0 };
        });
        ctx.tone(330, 80, 0.35, 'sawtooth', 0.06);
      }

      function stepOnce() {
        if (st.queue.length) st.dir = st.queue.shift();
        var h = st.snake[0], nx = h.x + st.dir.x, ny = h.y + st.dir.y;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) { die(nx, ny); return; }
        var growing = st.grow > 0, n = st.snake.length - (growing ? 0 : 1);
        for (var i = 0; i < n; i++) if (st.snake[i].x === nx && st.snake[i].y === ny) { die(nx, ny); return; }
        var old = st.snake.map(cp);
        st.snake.unshift({ x: nx, y: ny });
        if (growing) { st.grow--; old.push(cp(old[old.length - 1])); st.tailT = st.t; }
        else st.snake.pop();
        st.prev = old;

        if (st.food && st.food.x === nx && st.food.y === ny) {
          st.score += 10; st.pollen++; st.grow++;
          st.step = Math.max(MIN_MS, START_MS - st.pollen * SPEEDUP);
          burst(nx + 0.5, ny + 0.5, ['#FDC506', '#FFE680', '#FFFFFF'], 12, 4.5);
          pop(nx + 0.5, ny, '+10');
          st.bump = 1;
          ctx.tone(523 + Math.min(20, st.pollen) * 18, 784 + Math.min(20, st.pollen) * 18, 0.08, 'triangle', 0.05);
          st.food = spawn();
          if (!st.gold && st.pollen % GOLD_EVERY === 0) { var gp = spawn(); if (gp) { gp.born = st.t; st.gold = gp; ctx.say('Goldblume! Schnell, bevor sie welkt.'); } }
        } else if (st.gold && st.gold.x === nx && st.gold.y === ny) {
          st.score += 50; st.goldCount++; st.grow++;
          burst(nx + 0.5, ny + 0.5, ['#FFE680', '#FFFFFF', '#FDC506', '#FFF6D6'], 26, 7);
          pop(nx + 0.5, ny, '+50', true, '#FFF1B8');
          st.bump = 1; shakeIt(0.18);
          ctx.tone(659, 1319, 0.18, 'triangle', 0.06); ctx.tone(988, 1568, 0.18, 'triangle', 0.05, 0.08);
          st.gold = null;
        }
        ctx.setScore(st.score);
        var len = st.snake.length + st.grow;
        Object.keys(MILESTONES).forEach(function (k) { if (len >= +k && !st.said[k]) { st.said[k] = 1; ctx.say(MILESTONES[k]); } });
        if (!st.food && !st.gold) { st.score += 500; ctx.setScore(st.score); ctx.say('Die ganze Wiese ist voll. Wahnsinn!'); st.dead = true; st.deadT = st.t - 600; st.fly = []; }
      }

      function update(dt) {
        st.t += dt * 1000;
        st.parts = st.parts.filter(function (p) {
          p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy = p.vy * 0.92 + 3 * dt;
          return p.t < p.life;
        });
        st.pops = st.pops.filter(function (p) { return st.t - p.t0 < 800; });
        st.bump = Math.max(0, st.bump - dt * 5);
        st.shake = Math.max(0, st.shake - dt);
        st.flash = Math.max(0, st.flash - dt * 2.5);
        if (st.dead) {
          st.fly.forEach(function (f) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 6 * dt; f.rot += f.vr * dt; });
          return;
        }
        if (st.gold && st.t - st.gold.born > GOLD_LIFE) {
          burst(st.gold.x + 0.5, st.gold.y + 0.5, ['rgba(255,246,214,0.8)', 'rgba(255,230,128,0.6)'], 10, 2.5);
          st.gold = null;
        }
        if (st.waiting) return;
        st.acc += dt * 1000;
        while (st.acc >= st.step && !st.dead) { st.acc -= st.step; stepOnce(); }
      }

      /* Zeichnen */
      function world(sx, sy) { g.setTransform(dpr * c, 0, 0, dpr * c, dpr * (ox + sx), dpr * (oy + sy)); }
      function screenT(sx, sy) { g.setTransform(dpr, 0, 0, dpr, dpr * sx, dpr * sy); }

      function drawBee(x, y, a, scale, wing, queen) {
        g.save();
        g.translate(x, y); g.rotate(a);
        if (Math.cos(a) < -0.01) g.scale(1, -1);
        g.scale(scale, scale);
        if (queen) art.queen(g, wing); else art.bee(g, wing);
        g.restore();
      }

      function render() {
        if (!st) return;
        var sx = 0, sy = 0;
        if (st.shake > 0) { var m = 9 * Math.min(1, st.shake / 0.2); sx = rnd(-m, m); sy = rnd(-m, m); }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#0F120E'; g.fillRect(0, 0, cv.width, cv.height);
        if (bg) g.drawImage(bg, dpr * sx, dpr * sy);
        world(sx, sy);
        var t = st.t || performance.now();

        if (st.food) drawPollen(g, st.food.x + 0.5, st.food.y + 0.5, 0.32, t);
        if (st.gold) {
          var left = 1 - (st.t - st.gold.born) / GOLD_LIFE;
          var blink = left < 0.3 && Math.floor(st.t / 120) % 2 === 0;
          if (!blink) drawFlower(g, st.gold.x + 0.5, st.gold.y + 0.5, 0.42, st.t / 1200);
          g.beginPath(); g.arc(st.gold.x + 0.5, st.gold.y + 0.5, 0.62, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, left));
          g.strokeStyle = left < 0.3 ? '#FF7A6B' : '#FFE680'; g.lineWidth = 0.08; g.lineCap = 'round'; g.stroke();
        }

        if (st.dead) {
          st.fly.forEach(function (f, i) {
            var age = (st.t - st.deadT) / 1000;
            g.globalAlpha = Math.max(0, 1 - age * 0.9);
            drawBee(f.x, f.y, f.rot, f.head ? 1 / 46 : 1 / 44, Math.sin(st.t / 30 + i), f.head);
          });
          g.globalAlpha = 1;
        } else {
          var al = st.waiting ? 1 : Math.min(1, st.acc / st.step);
          var pos = st.snake.map(function (p, i) {
            var q = st.prev[i] || p;
            return { x: q.x + (p.x - q.x) * al + 0.5, y: q.y + (p.y - q.y) * al + 0.5 };
          });
          /* Polonaise-Band zwischen den Bienen */
          g.beginPath();
          pos.forEach(function (p, i) { if (i) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); });
          g.strokeStyle = 'rgba(253,197,6,0.22)'; g.lineWidth = 0.14; g.lineJoin = 'round'; g.lineCap = 'round'; g.setLineDash([0.12, 0.2]); g.stroke(); g.setLineDash([]);
          for (var i = pos.length - 1; i >= 0; i--) {
            var p = pos[i], a;
            if (i === 0) {
              var q = pos[1] || { x: p.x - st.dir.x, y: p.y - st.dir.y };
              a = st.waiting ? Math.atan2(st.dir.y, st.dir.x) : Math.atan2(p.y - q.y, p.x - q.x);
              var hg = g.createRadialGradient(p.x, p.y, 0.1, p.x, p.y, 0.95);
              hg.addColorStop(0, 'rgba(253,197,6,' + (0.32 + st.bump * 0.3) + ')'); hg.addColorStop(1, 'rgba(253,197,6,0)');
              g.fillStyle = hg; g.beginPath(); g.arc(p.x, p.y, 0.95, 0, TAU); g.fill();
              var hs = (1 + st.bump * 0.28) / 46;
              drawBee(p.x, p.y, a, hs, Math.sin(t / 35), true);
            } else {
              var n = pos[i - 1];
              a = Math.atan2(n.y - p.y, n.x - p.x);
              var s = 1 / 44;
              if (i === pos.length - 1) { var k = Math.min(1, (st.t - st.tailT) / 220); s *= k < 1 ? 0.4 + k * 0.6 + Math.sin(k * Math.PI) * 0.25 : 1; }
              drawBee(p.x, p.y + Math.sin(t / 160 + i * 0.9) * 0.04, a, s, Math.sin(t / 35 + i * 1.3), false);
            }
          }
        }

        st.parts.forEach(function (p) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life);
          g.fillStyle = p.c;
          if (p.star) {
            g.save(); g.translate(p.x, p.y); g.rotate(p.t * 6);
            g.beginPath(); for (var j = 0; j < 4; j++) { g.rotate(Math.PI / 2); g.moveTo(0, 0); g.lineTo(p.size * 0.6, p.size * 0.6); g.lineTo(0, p.size * 2.2); } g.fill();
            g.restore();
          } else { g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fill(); }
        });
        g.globalAlpha = 1;

        /* Texte in Bildschirm-Pixeln */
        screenT(sx, sy);
        g.textAlign = 'center'; g.lineJoin = 'round';
        st.pops.forEach(function (p) {
          var age = (st.t - p.t0) / 800, e = Math.min(1, age * 5);
          var sc = (p.big ? 1.25 : 1) * (e < 1 ? 0.5 + e * 0.7 : 1.2 - Math.min(0.2, (age - 0.2) * 0.4));
          var fs = Math.max(15, c * 0.62);
          g.save();
          g.translate(ox + p.x * c, oy + p.y * c - age * c * 1.2);
          g.scale(sc, sc);
          g.globalAlpha = age > 0.6 ? Math.max(0, 1 - (age - 0.6) / 0.4) : 1;
          g.font = '800 ' + fs + 'px Poppins, sans-serif';
          g.lineWidth = 4; g.strokeStyle = 'rgba(17,17,17,0.85)'; g.strokeText(p.text, 0, 0);
          g.fillStyle = p.color; g.fillText(p.text, 0, 0);
          g.restore();
        });
        g.globalAlpha = 1;

        var len = st.snake.length;
        g.textAlign = 'left';
        g.font = '700 ' + Math.max(12, Math.min(16, c * 0.45)) + 'px Poppins, sans-serif';
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillText('Schwarm: ' + len, ox + 10, oy + Math.max(18, c * 0.6));

        if (st.on && st.waiting && !st.paused) {
          var txt = ctx.touch() ? 'Wisch oder tipp, um loszulegen' : 'Pfeiltaste drücken, um loszulegen';
          var fs2 = Math.max(14, Math.min(20, c * 0.6));
          g.font = '700 ' + fs2 + 'px Poppins, sans-serif';
          var w = g.measureText(txt).width + fs2 * 1.6, h = fs2 * 2.1;
          var cx = ox + cols * c / 2, cy = oy + rows * c * 0.78;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          g.beginPath();
          if (g.roundRect) g.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2); else g.rect(cx - w / 2, cy - h / 2, w, h);
          g.fillStyle = 'rgba(17,17,17,0.85)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(txt, cx, cy + 1);
          g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
        }

        if (st.flash > 0) {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.fillStyle = 'rgba(255,74,61,' + (st.flash * 0.28) + ')';
          g.fillRect(0, 0, cv.width, cv.height);
        }
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.033, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.dead && st.t - st.deadT > 1200) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }

      function idle(now) {
        if (st.on) return;
        st.t = now;
        render();
        idleRaf = requestAnimationFrame(idle);
      }

      function stop() {
        if (st) st.on = false;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(idleRaf);
      }

      function finish() {
        stop();
        render();
        ctx.finish(st.score, { len: st.snake.length + st.grow, pollen: st.pollen, gold: st.goldCount });
      }

      /* Wischen und Tippen */
      function tapAt(clientX, clientY) {
        var r = cv.getBoundingClientRect();
        var gx = (clientX - r.left - ox) / c, gy = (clientY - r.top - oy) / c;
        var h = st.snake[0], hx = h.x + 0.5, hy = h.y + 0.5, dx = gx - hx, dy = gy - hy;
        if (st.waiting) { turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); return; }
        var last = st.queue.length ? st.queue[st.queue.length - 1] : st.dir;
        if (last.x !== 0) turn(dy < 0 ? 'up' : 'down');
        else turn(dx < 0 ? 'left' : 'right');
      }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused || st.dead) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        ptr = { x: e.clientX, y: e.clientY, moved: false };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr) return;
        var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
        turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        ptr.x = e.clientX; ptr.y = e.clientY; ptr.moved = true;
      });
      cv.addEventListener('pointerup', function (e) {
        if (ptr && !ptr.moved && st.on && !st.paused && !st.dead) tapAt(e.clientX, e.clientY);
        ptr = null;
      });
      cv.addEventListener('pointercancel', function () { ptr = null; });

      resize();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf);
          cancelAnimationFrame(raf);
          makeGrid();
          fresh();
          resize();
          st.on = true;
          st.t = 0;
          st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on;
          ptr = null;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); makeGrid(); fresh(); render(); },
        unmount: stop,
        resize: resize,
        key: function (e) {
          var d = KEYMAP[e.key];
          if (d) { turn(d); return true; }
          if ((e.key === ' ' || e.key === 'Enter') && st.waiting) { turn(st.dir === DIRS.right ? 'right' : 'left'); return true; }
          return e.key === ' ';
        },
        _debug: function () { return { st: st, cols: cols, rows: rows, c: c, ox: ox, oy: oy }; }
      };
    }
  });
})();

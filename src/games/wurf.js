/* Spiel 16: Wurfduell (Prinzip rundenbasiertes Wurf-Duell über Halden, Wind, zerstörbares Gelände) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, G = 420, TURN_S = 30, CHAR_R = 15;
  var art = MBArcade.art, rr = art.rrect;
  /* Gegner im Spiel gegen den Computer: Name, Hornisse? */
  var FOES = [['Wespe Walli', 0], ['Wespe Kalle', 0], ['Hornisse Horst', 1], ['Wespe Uschi', 0], ['Hornisse Hilde', 1], ['Wespe Ötte', 0], ['Hornisse Heinz', 1], ['Wespe Mia', 0]];
  /* Wurfgeschosse: Honigtopf platzt beim Aufprall, Pollenbombe hüpft und zündet nach 3 s */
  var WEAPONS = [
    { name: 'Honigtopf', r: 40, dmg: 45, ammo: Infinity },
    { name: 'Pollenbombe', r: 34, dmg: 40, fuse: 3, ammo: 2 },
    { name: 'Wabenmauer', wall: true, ammo: Infinity }
  ];
  var WALL_W = 18, WALL_H = 74, WALL_D = 44;
  function drawWallIcon(g, x, y, s) {
    for (var r = 0; r < 3; r++) for (var c = 0; c < 2; c++) art.hex(g, x + (c - 0.5) * 9 * s + (r % 2 ? 4.5 * s : 0) - 2 * s, y + (r - 1) * 8 * s, 5 * s, '#E9A800', '#7A5410', 1.2);
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function drawPot(g, x, y, s, spin) {
    g.save(); g.translate(x, y); g.rotate(spin || 0); g.scale(s, s);
    rr(g, -7, -6, 14, 14, 4); g.fillStyle = '#E9A800'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = '#111'; g.stroke();
    rr(g, -8, -10, 16, 5, 2); g.fillStyle = '#7A4A1A'; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(-4, -3, 2.5, 7);
    g.restore();
  }
  function drawPollen(g, x, y, s, t, left) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath(); g.arc(0, 0, 7, 0, TAU); g.fillStyle = '#FFD24A'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = '#111'; g.stroke();
    for (var i = 0; i < 6; i++) { var a = i / 6 * TAU + t / 300; g.beginPath(); g.arc(Math.cos(a) * 4, Math.sin(a) * 4, 1.3, 0, TAU); g.fillStyle = '#C98A00'; g.fill(); }
    if (left !== undefined) { g.fillStyle = left < 1 && Math.floor(t / 90) % 2 ? '#E5322D' : '#FFFFFF'; g.font = '900 9px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(Math.ceil(left), 0, -14); }
    g.restore();
  }

  MBArcade.register({
    id: 'wurf',
    title: 'Wurfduell',
    duration: 0,
    startText: 'Biene gegen Wespe auf den Halden! Abwechselnd werfen, Wind beachten, Gelände wegsprengen. Allein gegen immer stärkere Wespen (mit Rangliste) oder zu zweit an einem Gerät.',
    help: {
      legendTitle: 'Punkte und Würfe',
      controls: [
        { icons: ['swipe'], text: 'Zurückziehen und loslassen wie eine Schleuder: Richtung und Kraft', touch: true },
        { icons: ['kbd:←', 'kbd:→'], text: 'Zielen (auch A/D), Maus: ziehen und loslassen', kb: true },
        { icons: ['kbd:↑', 'kbd:↓'], text: 'Wurfkraft (auch W/S)', kb: true },
        { icons: ['kbd:Leertaste'], text: 'Werfen', kb: true },
        { icons: ['kbd:Q'], text: 'Wurfgeschoss wechseln (Knopf unten rechts)' },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { drawPot(g, 23, 25, 1.6, 0.3); }, text: 'Honigtopf: platzt beim Aufprall' },
        { draw: function (g) { drawPollen(g, 23, 23, 1.6, 0); }, text: 'Pollenbombe (2 pro Runde): hüpft und zündet nach 3 Sekunden, gut hinter Hügel' },
        { draw: function (g) { drawWallIcon(g, 23, 23, 1.4); }, text: 'Wabenmauer: Deckung aus Wachs vor dir, hält mehr aus als Erde. Kostet den ganzen Zug, eine neue gibt es erst, wenn deine alte kaputt ist' },
        { draw: function (g) { g.translate(25, 24); g.scale(0.55, 0.55); art.wasp(g, 0.4); }, text: 'Schaden an der Wespe, je Lebenspunkt', val: '5' },
        { draw: function (g) { g.beginPath(); g.arc(23, 23, 12, 0, TAU); g.strokeStyle = '#FDC506'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.arc(23, 23, 3, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); }, text: 'Volltreffer', val: '100' },
        { draw: function (g) { g.fillStyle = '#FDC506'; g.font = '900 22px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('★', 23, 31); }, text: 'Wespe besiegt: Bonus je Runde, du heilst 30 Punkte', val: '300 × Runde' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Treffsicher wie wir bei deinem Online-Marketing? Lass uns reden.' },
    stats: function (s) {
      if (s.duo) return 'Duell gespielt, das zählt nicht für die Rangliste. Revanche?';
      return s.rounds + (s.rounds === 1 ? ' Wespe' : ' Wespen') + ' besiegt, ' + s.hits + (s.hits === 1 ? ' Volltreffer, ' : ' Volltreffer, ') + s.dmg + ' Schaden ausgeteilt.';
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, k = 1, ox = 0, oy = 0, W = 1000, H = 560, WATER = 524, V = 560;
      var bg = null, terr = null, raf = 0, idleRaf = 0, keys = {}, drag = null;
      var st = fresh();

      function fresh() {
        return {
          on: false, paused: false, over: false, t: 0, last: 0, menu: false, duo: false,
          round: 1, players: [], turn: 0, phase: 'idle', shots: [], wind: 0, gnd: null, timer: TURN_S,
          score: 0, dmg: 0, hits: 0, won: 0, wins: [0, 0], parts: [], phaseT: 0, plan: null, hint: true, starter: 0
        };
      }

      /* Spielfeld: quer breit, hochkant schmaler, damit die Figuren groß genug bleiben */
      function sizeMap() {
        var r = cv.getBoundingClientRect();
        var portrait = r.height > r.width * 1.05;
        W = portrait ? 520 : 1000; H = portrait ? 700 : 560; WATER = H - 36; V = portrait ? 470 : 560;
      }
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        k = Math.min(cssW / W, cssH / H);
        ox = (cssW - W * k) / 2; oy = (cssH - H * k) / 2;
        bg = null; terr = null;
      }
      function SX(x) { return ox + x * k; }
      function SY(y) { return oy + y * k; }

      /* Gelände als Höhenlinie: gnd[x] = Oberkante */
      function genTerrain() {
        var gnd = new Float32Array(W);
        var p1 = rnd(0, TAU), p2 = rnd(0, TAU), p3 = rnd(0, TAU), a1 = rnd(20, 45), a2 = rnd(10, 28), a3 = rnd(3, 9);
        var hill = Math.random() < 0.8 ? rnd(0.12, 0.3) * H : -rnd(0.05, 0.12) * H;
        for (var x = 0; x < W; x++) {
          var u = x / W;
          var y = H * 0.66 + Math.sin(u * TAU + p1) * a1 + Math.sin(u * TAU * 2.3 + p2) * a2 + Math.sin(u * TAU * 7 + p3) * a3;
          y -= hill * Math.exp(-Math.pow((u - 0.5) / 0.12, 2));
          var edge = Math.min(u, 1 - u);
          if (edge < 0.05) y += (0.05 - edge) / 0.05 * H * 0.45;
          gnd[x] = clamp(y, H * 0.28, H + 60);
        }
        /* Standplätze sicher über dem Wasser */
        [0.15, 0.85].forEach(function (c) {
          var cx = Math.round(W * c);
          for (var x2 = cx - 45; x2 <= cx + 45; x2++) {
            var w = 1 - Math.abs(x2 - cx) / 46;
            if (gnd[x2] > WATER - 90) gnd[x2] = gnd[x2] * (1 - w) + (WATER - 90) * w;
          }
        });
        st.gnd = gnd; st.wax = new Float32Array(W); st.walls = []; terr = null;
      }
      function groundAt(x) { x = Math.floor(x); return x < 0 || x >= W ? H + 200 : st.gnd[x]; }
      function carve(cx, cy, r) {
        for (var x = Math.max(0, Math.floor(cx - r)); x <= Math.min(W - 1, Math.ceil(cx + r)); x++) {
          /* Wachs hält mehr aus: kleinerer Krater in der Wabenmauer */
          var rr2 = st.wax[x] && st.gnd[x] < st.wax[x] ? r * 0.5 : r;
          var dx = x - cx, h = Math.sqrt(Math.max(0, rr2 * rr2 - dx * dx)), bottom = cy + h;
          if (rr2 < r && bottom > st.wax[x]) bottom = st.wax[x];
          if (st.gnd[x] < bottom && st.gnd[x] < H + 60) st.gnd[x] = Math.min(H + 60, bottom);
        }
        terr = null;
      }

      /* Wabenmauer: Wachs-Spalten vor der Figur, verhält sich wie Gelände, hält aber mehr aus */
      function wallX(p) { var dir = Math.cos(p.a) >= 0 ? 1 : -1; return p.x + dir * WALL_D; }
      function placeWall(p) {
        var cx = Math.round(wallX(p)), base = groundAt(cx);
        if (cx - WALL_W / 2 < 2 || cx + WALL_W / 2 > W - 3 || base > WATER - 5) { ctx.fx.text(SX(p.x), SY(p.y - 70), 'Da hält keine Mauer', '#FF7A6B', 16); return false; }
        var top = base - WALL_H;
        for (var x = cx - WALL_W / 2; x <= cx + WALL_W / 2; x++) {
          var b = groundAt(x);
          if (!st.wax[x]) st.wax[x] = b;
          st.gnd[x] = Math.min(st.gnd[x], top + Math.abs(x - cx) * 0.4);
        }
        st.walls.push({ x0: cx - WALL_W / 2, x1: cx + WALL_W / 2, owner: p });
        p.weapon = 0; terr = null;
        /* Mauer bauen kostet den ganzen Zug */
        st.phase = 'settle'; st.phaseT = st.t + 700; drag = null;
        ctx.fx.ring(SX(cx), SY(top + WALL_H / 2), '#FDC506', 50 * k, 4, 400); ctx.fx.sparkle(SX(cx), SY(top), ['#FDC506', '#FFE680', '#FFFFFF'], 16, 200);
        ctx.fx.text(SX(cx), SY(top - 20), 'Wabenmauer!', '#FFE680', 20);
        burst(cx, top, ['#E9A800', '#FDC506'], 10, 160);
        ctx.tone(330, 990, 0.2, 'triangle', 0.05); ctx.tone(660, 1320, 0.12, 'triangle', 0.04, 0.1);
        return true;
      }
      /* Eine eigene Mauer gleichzeitig: neu bauen erst, wenn sie kaputt ist */
      function wallAlive(wl) {
        for (var x = Math.max(0, Math.floor(wl.x0)); x <= Math.min(W - 1, Math.ceil(wl.x1)); x++) if (st.wax[x] && st.wax[x] - st.gnd[x] > 10) return true;
        return false;
      }
      function hasWall(p) { return st.walls.some(function (wl) { return wl.owner === p && !wl.broken; }); }
      function canUse(p, w) { return w === 2 ? !hasWall(p) : p.ammo[w] > 0; }
      function checkWalls() {
        st.walls.forEach(function (wl) {
          if (wl.broken || wallAlive(wl)) return;
          wl.broken = true;
          var cx = (wl.x0 + wl.x1) / 2;
          ctx.fx.text(SX(cx), SY(groundAt(cx) - 30), 'Mauer kaputt!', '#FFE680', 18);
          burst(cx, groundAt(cx) - 10, ['#E9A800', '#FDC506', '#7A5410'], 14, 200);
        });
      }
      function makePlayer(i, cpu, foe) {
        var x = W * (i ? 0.85 : 0.15) + rnd(-12, 12);
        var kind = i === 0 ? 'bee' : cpu ? (foe[1] ? 'hornet' : 'wasp') : 'bumble';
        var hp = cpu ? Math.min(150, 50 + st.round * 15) : 100;
        return {
          i: i, cpu: cpu, kind: kind, name: i === 0 ? (st.duo ? 'Biene' : 'Du') : cpu ? foe[0] : 'Hummel',
          color: i === 0 ? '#FDC506' : cpu ? '#FF7A6B' : '#FF8AD8',
          x: x, y: groundAt(x), vx: 0, vy: 0, hp: hp, maxHp: hp, face: i ? -1 : 1,
          a: i ? -Math.PI * 0.75 : -Math.PI * 0.25, p: 0.65, weapon: 0, hurt: -9999, dead: false,
          ammo: WEAPONS.map(function (w) { return w.ammo; })
        };
      }

      function startGame(duo) {
        st.duo = duo; st.menu = false; st.round = 1; st.wins = [0, 0];
        sizeMap(); layout();
        startRound(true);
      }
      function startRound(first) {
        genTerrain();
        var keepHp = !first && !st.duo && st.players[0] ? st.players[0].hp : null;
        st.players = [makePlayer(0, false), makePlayer(1, !st.duo, FOES[(st.round - 1) % FOES.length])];
        if (keepHp !== null) st.players[0].hp = Math.min(100, keepHp + 30);
        st.shots = []; st.parts = [];
        st.turn = st.duo ? st.starter : 0;
        var p1 = st.players[1];
        ctx.fx.banner(st.duo ? 'Runde ' + (st.wins[0] + st.wins[1] + 1) : 'Runde ' + st.round + ': ' + p1.name, '#FDC506', 32);
        ctx.tone(330, 660, 0.25, 'triangle', 0.05);
        beginTurn(1.6);
      }
      function newWind() {
        var max = st.duo ? 2.5 : Math.min(3, 0.8 + st.round * 0.45);
        var w = Math.round(rnd(-max, max) * 2) / 2;
        st.wind = w;
      }
      function beginTurn(delay) {
        newWind();
        st.phase = 'wait'; st.phaseT = st.t + (delay || 0.5) * 1000;
        st.timer = TURN_S;
        var p = st.players[st.turn];
        if (p.cpu) st.plan = cpuPlan(p, st.players[1 - st.turn]);
      }
      function cur() { return st.players[st.turn]; }

      /* Computer zielt: alle Würfe durchrechnen, den besten nehmen und dann menschlich danebenzielen */
      function simulate(p, a, P) {
        var x = p.x + Math.cos(a) * 18, y = p.y - 18 + Math.sin(a) * 18, vx = Math.cos(a) * V * P, vy = Math.sin(a) * V * P, dt = 1 / 60, wa = st.wind * 70;
        for (var t = 0; t < 8; t += dt) {
          vx += wa * dt; vy += G * dt; x += vx * dt; y += vy * dt;
          for (var i = 0; i < st.players.length; i++) { var q = st.players[i]; if ((q !== p || t > 0.25) && Math.hypot(x - q.x, y - (q.y - CHAR_R)) < CHAR_R + 5) return { x: x, y: y, hit: q }; }
          if (y >= groundAt(x)) return { x: x, y: y };
          if (x < -60 || x > W + 60 || y > WATER) return { x: x, y: y, lost: true };
        }
        return { x: x, y: y, lost: true };
      }
      /* Pollenbombe: hüpft wie im echten Wurf und zündet nach 3 s */
      function simulateBomb(p, a, P) {
        var x = p.x + Math.cos(a) * 18, y = p.y - 18 + Math.sin(a) * 18, vx = Math.cos(a) * V * P, vy = Math.sin(a) * V * P, dt = 1 / 120, wa = st.wind * 70, fuse = WEAPONS[1].fuse;
        for (var t = 0; t < fuse; t += dt) {
          vx += wa * dt; vy += G * dt; x += vx * dt; y += vy * dt;
          for (var i = 0; i < st.players.length; i++) { var q = st.players[i]; if ((q !== p || t > 0.25) && Math.hypot(x - q.x, y - (q.y - CHAR_R)) < CHAR_R + 5) return { x: x, y: y, hit: q }; }
          var gy = groundAt(x);
          if (y >= gy) {
            var dy = (groundAt(x + 2) - groundAt(x - 2)) / 4, nl = Math.hypot(dy, 1), nx = dy / nl, ny = -1 / nl, vn = vx * nx + vy * ny;
            if (vn < 0) { vx -= 1.45 * vn * nx; vy -= 1.45 * vn * ny; vx *= 0.85; vy *= 0.85; }
            y = gy - 0.5;
          }
          if (x < -80 || x > W + 80 || y > WATER + 4) return { x: x, y: y, lost: true };
        }
        return { x: x, y: y };
      }
      function rate(r, p, target, R) {
        var d = r.hit === target ? 0 : Math.hypot(r.x - target.x, r.y - (target.y - CHAR_R));
        var sc = r.hit === target ? -100 : d;
        if (r.hit === p || Math.hypot(r.x - p.x, r.y - (p.y - CHAR_R)) < R + CHAR_R + 10) sc += 500;
        if (r.lost) sc += 300;
        return sc;
      }
      function cpuPlan(p, target) {
        var best = null, bestB = null, useBomb = p.ammo[1] > 0;
        for (var a = -Math.PI + 0.12; a < -0.12; a += 0.05) {
          for (var P = 0.3; P <= 1.001; P += 0.035) {
            var sc = rate(simulate(p, a, P), p, target, WEAPONS[0].r);
            if (!best || sc < best.sc) best = { a: a, P: P, sc: sc, w: 0 };
            if (useBomb) {
              var sb = rate(simulateBomb(p, a, P), p, target, WEAPONS[1].r);
              if (!bestB || sb < bestB.sc) bestB = { a: a, P: P, sc: sb, w: 1 };
            }
          }
        }
        /* Pollenbombe nehmen, wenn der Topf nicht gut durchkommt (Hügel im Weg) oder ab und zu zur Abwechslung */
        var pick = best;
        if (bestB && bestB.sc < 30 && (best.sc > 45 || Math.random() < 0.3)) pick = bestB;
        var lvl = st.round - 1, errA = Math.max(0.012, 0.1 * Math.pow(0.8, lvl)), errP = Math.max(0.012, 0.08 * Math.pow(0.8, lvl));
        if (pick.w) { errA *= 0.6; errP *= 0.6; }
        var wall = !hasWall(p) && p.hp <= p.maxHp * 0.6 && Math.random() < 0.5;
        return { a: pick.a + gauss() * errA, P: clamp(pick.P * (1 + gauss() * errP), 0.2, 1), w: pick.w, wall: wall };
      }

      function throwShot(p) {
        if (!(p.ammo[p.weapon] > 0)) p.weapon = 0;
        if (WEAPONS[p.weapon].wall) { if (hasWall(p)) { p.weapon = 0; return; } placeWall(p); return; }
        var wpn = WEAPONS[p.weapon];
        p.ammo[p.weapon]--;
        st.shots.push({ x: p.x + Math.cos(p.a) * 18, y: p.y - 18 + Math.sin(p.a) * 18, vx: Math.cos(p.a) * V * p.p, vy: Math.sin(p.a) * V * p.p, kind: p.weapon, t: 0, owner: p, spin: 0, w: wpn });
        st.phase = 'fly'; st.hint = false;
        if (!(p.ammo[p.weapon] > 0)) p.weapon = 0;
        p.face = Math.cos(p.a) >= 0 ? 1 : -1;
        p.throwT = st.t;
        ctx.tone(260, 620, 0.12, 'triangle', 0.05);
      }

      function addScore(n) { if (st.duo) return; st.score += n; ctx.setScore(st.score); }
      function burst(x, y, colors, n, speed, grav) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = speed * (0.3 + Math.random() * 0.9); st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.3, t: 0, life: 0.4 + Math.random() * 0.6, size: 1.5 + Math.random() * 3, c: colors[i % colors.length], grav: grav === undefined ? 600 : grav }); }
      }

      function explode(s, direct) {
        var w = s.w, R = w.r;
        carve(s.x, s.y, R); checkWalls();
        ctx.fx.boom(SX(s.x), SY(s.y), s.kind ? '#FFD24A' : '#FFB13B', '255,177,59', 0.9);
        ctx.fx.shake(0.3, 8);
        burst(s.x, s.y, ['#6B4A2A', '#8A6236', '#4A3218'], 22, 260);
        burst(s.x, s.y, s.kind ? ['#FFD24A', '#FFF2B0'] : ['#FDC506', '#FF9F1A', '#FFE680'], 14, 220, 200);
        ctx.tone(140, 40, 0.4, 'sawtooth', 0.06); ctx.tone(90, 30, 0.3, 'square', 0.04, 0.03);
        st.players.forEach(function (p) {
          if (p.dead) return;
          var cx = p.x, cy = p.y - CHAR_R, d = Math.hypot(cx - s.x, cy - s.y), reach = R + CHAR_R;
          if (d >= reach) return;
          var f = 1 - d / reach, dmg = Math.max(1, Math.round(w.dmg * Math.pow(f, 0.8))) + (p === direct ? 10 : 0);
          p.hp = Math.max(0, p.hp - dmg); p.hurt = st.t;
          var nx = d > 1 ? (cx - s.x) / d : (Math.random() < 0.5 ? -1 : 1), ny = d > 1 ? (cy - s.y) / d : -1, sp = 70 + 170 * f;
          p.vx = nx * sp; p.vy = Math.min(-90, ny * sp - 90); p.air = true;
          ctx.fx.text(SX(p.x), SY(p.y - 50), '-' + dmg, '#FF7A6B', p === direct ? 30 : 24);
          if (s.owner && !s.owner.cpu && p !== s.owner && !st.duo) {
            st.dmg += dmg; addScore(dmg * 5);
            if (p === direct) { st.hits++; addScore(100); ctx.fx.text(SX(p.x), SY(p.y - 80), 'Volltreffer! +100', '#FFE680', 22); }
          }
          if (p === direct) { ctx.fx.flash('255,255,255', 0.5); st.slow = st.t + 350; }
          ctx.tone(500, 180, 0.2, 'square', 0.04);
        });
      }

      function updateShots(dt) {
        for (var n = st.shots.length - 1; n >= 0; n--) {
          var s = st.shots[n], gone = false, sub = 4, h = dt / sub;
          for (var i = 0; i < sub && !gone; i++) {
            s.t += h; s.vx += st.wind * 70 * h; s.vy += G * h; s.x += s.vx * h; s.y += s.vy * h; s.spin += h * 10;
            for (var j = 0; j < st.players.length; j++) {
              var q = st.players[j];
              if (!q.dead && (q !== s.owner || s.t > 0.25) && Math.hypot(s.x - q.x, s.y - (q.y - CHAR_R)) < CHAR_R + 5) { explode(s, q); gone = true; break; }
            }
            if (gone) break;
            var gy = groundAt(s.x);
            if (s.y >= gy) {
              if (!s.kind) { explode(s, null); gone = true; break; }
              /* Pollenbombe hüpft vom Hang ab */
              var dy = (groundAt(s.x + 2) - groundAt(s.x - 2)) / 4, nl = Math.hypot(dy, 1), nx = dy / nl, ny = -1 / nl;
              var vn = s.vx * nx + s.vy * ny;
              if (vn < 0) { s.vx -= 1.45 * vn * nx; s.vy -= 1.45 * vn * ny; s.vx *= 0.85; s.vy *= 0.85; if (Math.abs(vn) > 60) ctx.tone(500, 380, 0.04, 'triangle', 0.02); }
              s.y = gy - 0.5;
            }
            if (s.kind && s.t >= s.w.fuse) { explode(s, null); gone = true; break; }
            if (s.x < -80 || s.x > W + 80 || s.t > 12) { gone = true; break; }
            if (s.y > WATER + 4) {
              ctx.fx.ring(SX(s.x), SY(WATER), '#7FD3FF', 30 * k, 3, 400); burst(s.x, WATER, ['#7FD3FF', '#BFEAFF', '#FFFFFF'], 12, 180);
              ctx.tone(300, 120, 0.25, 'sine', 0.04);
              ctx.fx.text(SX(clamp(s.x, 30, W - 30)), SY(WATER - 30), 'Platsch!', '#BFEAFF', 18);
              gone = true; break;
            }
          }
          if (Math.random() < 0.6) st.parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, t: 0, life: 0.35, size: 2, c: s.kind ? 'rgba(255,210,74,0.7)' : 'rgba(253,197,6,0.6)', grav: 0 });
          if (gone) st.shots.splice(n, 1);
        }
      }

      function updatePlayers(dt) {
        st.players.forEach(function (p) {
          if (p.dead) return;
          var gy = groundAt(p.x);
          if (p.air || p.y < gy - 0.5) {
            p.air = true; p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt;
            var g2 = groundAt(p.x);
            if (p.vy > 0 && p.y >= g2) {
              p.y = g2; p.air = false;
              if (p.vy > 260) { burst(p.x, p.y, ['#8A6236', '#6B4A2A'], 6, 120); ctx.tone(160, 90, 0.08, 'triangle', 0.03); }
              p.vy = 0; p.vx *= 0.4;
            }
          } else {
            p.y = gy;
            p.vx *= Math.pow(0.01, dt); if (Math.abs(p.vx) < 4) p.vx = 0;
            if (p.vx) { var nx2 = p.x + p.vx * dt; if (groundAt(nx2) > p.y + 12) p.air = true; else p.y = groundAt(nx2); p.x = nx2; }
          }
          if (p.y > WATER + 6) {
            p.dead = true; p.drowned = true; p.hp = 0;
            ctx.fx.ring(SX(clamp(p.x, 20, W - 20)), SY(WATER), '#7FD3FF', 50 * k, 4, 500); burst(clamp(p.x, 5, W - 5), WATER, ['#7FD3FF', '#FFFFFF'], 20, 240);
            ctx.fx.text(SX(clamp(p.x, 40, W - 40)), SY(WATER - 50), p.name + ' geht baden!', '#BFEAFF', 22);
            ctx.tone(400, 80, 0.5, 'sine', 0.05);
          }
        });
      }
      function moving() { return st.shots.length || st.players.some(function (p) { return !p.dead && (p.air || Math.abs(p.vx) > 4); }); }

      function roundOver() {
        var a = st.players[0], b = st.players[1];
        var aDead = a.dead || a.hp <= 0, bDead = b.dead || b.hp <= 0;
        if (!aDead && !bDead) return false;
        [a, b].forEach(function (p) { if (p.hp <= 0 && !p.dead) { p.dead = true; ctx.fx.boom(SX(p.x), SY(p.y - 15), '#FF7A6B', '255,74,61', 0.8); } });
        st.phase = 'end'; st.phaseT = st.t + 2600;
        if (st.duo) {
          var w = aDead && bDead ? -1 : aDead ? 1 : 0;
          if (w >= 0) { st.wins[w]++; ctx.fx.banner(st.players[w].name + ' gewinnt die Runde!', st.players[w].color, 32); }
          else ctx.fx.banner('Unentschieden!', '#FFFFFF');
          st.starter = 1 - st.starter;
          if (st.wins[0] >= 2 || st.wins[1] >= 2) st.endGame = true;
        } else if (aDead) {
          ctx.fx.banner('Erwischt! ' + b.name + ' gewinnt.', '#FF7A6B', 30); ctx.fx.flash('255,74,61', 0.7);
          ctx.tone(400, 80, 0.7, 'sawtooth', 0.05);
          st.endGame = true;
        } else {
          var bonus = 300 * st.round;
          st.won++; addScore(bonus);
          ctx.fx.banner(b.name + ' besiegt! +' + bonus, '#FDC506', 32); ctx.fx.flash('253,197,6', 0.6);
          ctx.fx.sparkle(cssW / 2, cssH * 0.4, ['#FDC506', '#FFE680', '#FFFFFF', '#FF8AD8'], 40, 360);
          ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.2, 'triangle', 0.06, 0.12);
        }
        return true;
      }

      function update(dt) {
        if (st.slow && st.t < st.slow) dt *= 0.35;
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var pt = st.parts[q]; pt.t += dt; pt.vy += pt.grav * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; if (pt.t > pt.life) st.parts.splice(q, 1); }
        /* Wind zeigt sich in fliegenden Pollen */
        if (Math.random() < 0.25 && st.wind) st.parts.push({ x: st.wind > 0 ? -5 : W + 5, y: rnd(20, H * 0.7), vx: st.wind * 60, vy: rnd(-8, 8), t: 0, life: W / Math.max(30, Math.abs(st.wind * 60)), size: 1.5, c: 'rgba(255,230,128,0.5)', grav: 0 });
        if (st.menu || st.phase === 'idle') return;
        updatePlayers(dt);
        updateShots(dt);
        var p = cur();
        if (st.phase === 'wait' && st.t >= st.phaseT) {
          st.phase = p.cpu ? 'think' : 'aim'; st.phaseT = st.t;
          ctx.fx.text(SX(p.x), SY(p.y - 70), p.cpu ? p.name + ' zielt …' : st.duo ? p.name + ' ist dran!' : 'Du bist dran!', p.color, 20);
          ctx.tone(660, 880, 0.08, 'triangle', 0.03);
        }
        if (st.phase === 'aim') {
          st.timer -= dt;
          var ra = 1.1 * dt, rp = 0.55 * dt;
          if (keys.ArrowLeft || keys.a || keys.A) p.a -= ra;
          if (keys.ArrowRight || keys.d || keys.D) p.a += ra;
          if (keys.ArrowUp || keys.w || keys.W) p.p += rp;
          if (keys.ArrowDown || keys.s || keys.S) p.p -= rp;
          p.a = clamp(p.a, -Math.PI - 0.35, 0.35); p.p = clamp(p.p, 0.12, 1);
          p.face = Math.cos(p.a) >= 0 ? 1 : -1;
          if (st.timer <= 0) { ctx.fx.text(SX(p.x), SY(p.y - 70), 'Zeit um!', '#FF7A6B', 20); drag = null; st.phase = 'settle'; st.phaseT = st.t + 300; }
        }
        if (st.phase === 'think') {
          /* sichtbar zum Ziel drehen */
          var e = Math.min(1, (st.t - st.phaseT) / 1100);
          p.a += (st.plan.a - p.a) * Math.min(1, dt * 5); p.p += (st.plan.P - p.p) * Math.min(1, dt * 5);
          p.face = Math.cos(p.a) >= 0 ? 1 : -1;
          if (e > 0.25 && st.plan.wall && !hasWall(p)) {
            var foe2 = st.players[1 - st.turn];
            p.a = foe2.x > p.x ? -0.3 : -Math.PI + 0.3;
            if (placeWall(p)) return;
            st.plan.wall = false;
          }
          if (e < 0.05 && st.plan.w && p.weapon !== st.plan.w) { p.weapon = st.plan.w; ctx.fx.text(SX(p.x), SY(p.y - 92), WEAPONS[p.weapon].name + '!', '#FFD24A', 18); }
          if (e >= 1) { p.a = st.plan.a; p.p = st.plan.P; p.weapon = st.plan.w || 0; throwShot(p); }
        }
        if (st.phase === 'fly' && !st.shots.length) { st.phase = 'settle'; st.phaseT = st.t + 500; }
        if (st.phase === 'settle' && st.t >= st.phaseT && !moving()) {
          if (!roundOver()) { st.turn = 1 - st.turn; beginTurn(0.3); }
        }
        if (st.phase === 'end' && st.t >= st.phaseT) {
          if (st.endGame) { st.over = true; return; }
          if (!st.duo) st.round++;
          startRound(false);
        }
      }

      /* Zeichnen */
      function paintBg() {
        var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d');
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.fillStyle = '#0E0B07'; x.fillRect(0, 0, cssW, cssH);
        x.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        x.save(); x.beginPath(); x.rect(0, 0, W, H); x.clip();
        var gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1B1838'); gr.addColorStop(0.55, '#5A2E48'); gr.addColorStop(0.85, '#C2603A'); gr.addColorStop(1, '#E99A3A');
        x.fillStyle = gr; x.fillRect(0, 0, W, H);
        x.beginPath(); x.arc(W * 0.72, H * 0.62, H * 0.12, 0, TAU); x.fillStyle = 'rgba(255,214,120,0.55)'; x.fill();
        art.skyline(x, 0, W + 60, H * 0.78, '#2A1F3A', art.rng(7), '#FDC506');
        /* Förderturm */
        x.save(); x.translate(W * 0.32, H * 0.78); x.strokeStyle = '#2A1F3A'; x.lineWidth = 6; x.lineCap = 'round';
        x.beginPath(); x.moveTo(-40, 0); x.lineTo(-6, -H * 0.36); x.moveTo(40, 0); x.lineTo(6, -H * 0.36); x.moveTo(-26, -H * 0.12); x.lineTo(26, -H * 0.12); x.moveTo(-16, -H * 0.24); x.lineTo(16, -H * 0.24); x.moveTo(-6, -H * 0.36); x.lineTo(60, -H * 0.06); x.stroke();
        x.beginPath(); x.arc(0, -H * 0.38, 16, 0, TAU); x.stroke();
        x.restore();
        x.restore();
        bg = c;
      }
      function paintTerrain() {
        var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d');
        x.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        x.beginPath(); x.moveTo(0, H + 80);
        for (var i = 0; i < W; i += 2) x.lineTo(i, st.gnd[i]);
        x.lineTo(W, st.gnd[W - 1]); x.lineTo(W, H + 80); x.closePath();
        var gr = x.createLinearGradient(0, H * 0.3, 0, H); gr.addColorStop(0, '#4A3420'); gr.addColorStop(1, '#22170D');
        x.save(); x.clip();
        x.fillStyle = gr; x.fillRect(0, 0, W, H + 80);
        var r = art.rng(3);
        for (var s = 0; s < W * 0.6; s++) { var sx = r() * W, sy = st.gnd[Math.floor(sx)] + 8 + r() * (H - st.gnd[Math.floor(sx)]); x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.25)' : 'rgba(255,214,150,0.08)'; x.fillRect(sx, sy, 3 + r() * 4, 2 + r() * 3); }
        x.restore();
        /* Grasnarbe oben */
        x.beginPath(); for (var j = 0; j < W; j += 2) { if (j === 0) x.moveTo(j, st.gnd[j]); else x.lineTo(j, st.gnd[j]); }
        x.strokeStyle = '#8DB04A'; x.lineWidth = 4; x.lineJoin = 'round'; x.stroke();
        x.strokeStyle = 'rgba(253,197,6,0.5)'; x.lineWidth = 1.5; x.stroke();
        /* Wabenmauern aus Wachs */
        st.walls.forEach(function (wl) {
          var x0 = Math.max(0, Math.floor(wl.x0)), x1 = Math.min(W - 1, Math.ceil(wl.x1)), any = false;
          x.beginPath(); x.moveTo(x0, st.wax[x0] || st.gnd[x0]);
          for (var xx = x0; xx <= x1; xx++) { var top = st.wax[xx] ? Math.min(st.gnd[xx], st.wax[xx]) : st.gnd[xx]; if (st.wax[xx] && st.gnd[xx] < st.wax[xx] - 1) any = true; x.lineTo(xx, top); }
          for (var xb = x1; xb >= x0; xb--) x.lineTo(xb, st.wax[xb] || st.gnd[xb]);
          x.closePath();
          if (!any) return;
          x.save(); x.fillStyle = '#E9A800'; x.fill(); x.clip();
          for (var hy = 0; hy < H; hy += 8) for (var hx = x0 - 6 + (Math.floor(hy / 8) % 2 ? 4.5 : 0); hx < x1 + 6; hx += 9) art.hex(x, hx, hy, 5, null, 'rgba(122,84,16,0.7)', 1);
          x.restore();
          x.lineWidth = 2; x.strokeStyle = '#7A5410'; x.stroke();
        });
        terr = c;
      }
      function drawChar(p) {
        if (p.dead && (p.drowned || st.t - p.hurt > 900)) return;
        var hurt = st.t - p.hurt < 400;
        g.save(); g.translate(p.x, p.y - CHAR_R + Math.sin(st.t / 220 + p.i) * 1.5);
        if (p.dead) { var d = Math.min(1, (st.t - p.hurt) / 900); g.rotate(d * 6); g.scale(1 - d, 1 - d); }
        if (hurt && Math.floor(st.t / 60) % 2) g.globalAlpha = 0.5;
        if (p.face < 0) g.scale(-1, 1);
        var s = p.kind === 'bee' ? 0.75 : p.kind === 'bumble' ? 0.68 : 0.62;
        g.scale(s, s);
        var wing = Math.sin(st.t / 25);
        if (p.kind === 'bee') art.bee(g, wing); else if (p.kind === 'bumble') art.bumble(g, wing); else if (p.kind === 'hornet') art.hornet(g, wing); else art.wasp(g, wing);
        g.restore(); g.globalAlpha = 1;
        if (p.dead) return;
        /* Lebensbalken und Name */
        var bw = 46, bx = p.x - bw / 2, by = p.y - CHAR_R * 2 - 22;
        g.font = '800 11px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'bottom';
        g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.7)'; g.strokeText(p.name, p.x, by - 2); g.fillStyle = p.color; g.fillText(p.name, p.x, by - 2);
        rr(g, bx, by, bw, 7, 3.5); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fill();
        var f = p.hp / p.maxHp;
        rr(g, bx + 1, by + 1, Math.max(0, (bw - 2) * f), 5, 2.5); g.fillStyle = f > 0.5 ? '#8DD45A' : f > 0.25 ? '#FDC506' : '#FF5A4A'; g.fill();
        if (st.players[st.turn] === p && (st.phase === 'aim' || st.phase === 'think' || st.phase === 'wait')) {
          var ay = by - 22 + Math.sin(st.t / 150) * 3;
          g.beginPath(); g.moveTo(p.x - 6, ay); g.lineTo(p.x + 6, ay); g.lineTo(p.x, ay + 7); g.closePath(); g.fillStyle = p.color; g.fill();
        }
      }
      function drawAim(p) {
        var x0 = p.x + Math.cos(p.a) * 18, y0 = p.y - 18 + Math.sin(p.a) * 18, vx = Math.cos(p.a) * V * p.p, vy = Math.sin(p.a) * V * p.p;
        /* kurze Vorschau ohne Wind, wie ein Fadenkreuz */
        g.fillStyle = 'rgba(255,255,255,0.85)';
        for (var t = 0.04; t < 0.42; t += 0.045) {
          var x = x0 + vx * t, y = y0 + vy * t + G * t * t / 2;
          g.beginPath(); g.arc(x, y, 2.6 - t * 3, 0, TAU); g.fill();
        }
        /* Kraftbalken neben der Figur */
        var bx = p.x + (p.face > 0 ? -30 : 24), by = p.y - 44;
        rr(g, bx, by, 6, 40, 3); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fill();
        var h = 38 * p.p; rr(g, bx + 1, by + 39 - h, 4, h, 2); g.fillStyle = p.p > 0.8 ? '#FF7A1A' : '#FDC506'; g.fill();
      }
      function weaponBtn() { var s = Math.min(64, cssW * 0.16); return { x: cssW - s - 12, y: cssH - s - 12, w: s, h: s }; }
      function render() {
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (!bg) paintBg();
        g.drawImage(bg, 0, 0);
        if (st.gnd) {
          if (!terr) paintTerrain();
          g.drawImage(terr, 0, 0);
        }
        g.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
        /* Emscher */
        var wg = g.createLinearGradient(0, WATER, 0, H); wg.addColorStop(0, 'rgba(70,140,170,0.85)'); wg.addColorStop(1, 'rgba(20,50,70,0.95)');
        g.fillStyle = wg; g.beginPath(); g.moveTo(0, H);
        for (var x = 0; x <= W; x += 10) g.lineTo(x, WATER + Math.sin(x / 30 + st.t / 400) * 3);
        g.lineTo(W, H); g.closePath(); g.fill();
        if (st.gnd) {
          st.players.forEach(drawChar);
          var p = cur();
          if (p && !p.dead && (st.phase === 'aim' || st.phase === 'think')) {
            if (WEAPONS[p.weapon].wall) {
              var wxp = wallX(p), bb = groundAt(wxp);
              g.globalAlpha = 0.45 + Math.sin(st.t / 150) * 0.15; rr(g, wxp - WALL_W / 2, bb - WALL_H, WALL_W, WALL_H, 4); g.fillStyle = '#FDC506'; g.fill(); g.globalAlpha = 1;
              g.setLineDash([4, 4]); g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
            } else drawAim(p);
          }
          st.shots.forEach(function (s) {
            if (s.kind) drawPollen(g, s.x, s.y, 1.1, st.t, s.w.fuse - s.t); else drawPot(g, s.x, s.y, 1.1, s.spin);
          });
        }
        st.parts.forEach(function (pt) { g.globalAlpha = Math.max(0, 1 - pt.t / pt.life); g.fillStyle = pt.c; g.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size); });
        g.globalAlpha = 1;
        g.restore();
        /* Anzeige: Bildschirm-Pixel */
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (st.gnd && !st.menu && st.players.length) {
          g.textBaseline = 'middle';
          /* Wind */
          var wx = cssW / 2, wy = 22;
          rr(g, wx - 62, wy - 14, 124, 28, 14); g.fillStyle = 'rgba(17,17,17,0.75)'; g.fill();
          g.font = '800 12px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFFFFF';
          var wTxt = st.wind ? 'Wind ' + String(Math.abs(st.wind)).replace('.', ',') : 'Windstill';
          g.fillText(wTxt, wx + (st.wind ? (st.wind > 0 ? -12 : 12) : 0), wy);
          if (st.wind) {
            var dir = st.wind > 0 ? 1 : -1, n = Math.ceil(Math.abs(st.wind));
            for (var a = 0; a < n; a++) {
              var ax = wx + dir * (26 + a * 8);
              g.beginPath(); g.moveTo(ax - dir * 4, wy - 6); g.lineTo(ax + dir * 3, wy); g.lineTo(ax - dir * 4, wy + 6); g.strokeStyle = '#7FD3FF'; g.lineWidth = 2.5; g.stroke();
            }
          }
          /* Runde, Zeit */
          g.font = '700 12px Poppins, sans-serif'; g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,0.8)';
          g.fillText(st.duo ? (cssW < 560 ? st.wins[0] + ' : ' + st.wins[1] : 'Biene ' + st.wins[0] + ' : ' + st.wins[1] + ' Hummel') : (cssW < 560 ? 'R' + st.round : 'Runde ' + st.round), 12, wy);
          var cp = cur();
          if (st.phase === 'aim' && cp && !cp.cpu) {
            g.textAlign = 'right'; g.font = '900 16px Poppins, sans-serif';
            g.fillStyle = st.timer < 6 && Math.floor(st.t / 250) % 2 ? '#FF5A4A' : '#FFFFFF';
            g.fillText(Math.ceil(st.timer) + ' s', cssW - 12, wy);
          }
          /* Waffenknopf */
          if (cp && !cp.cpu && (st.phase === 'aim' || st.phase === 'wait')) {
            var b = weaponBtn();
            rr(g, b.x, b.y, b.w, b.h, 14); g.fillStyle = 'rgba(17,17,17,0.85)'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#FDC506'; g.stroke();
            if (cp.weapon === 1) drawPollen(g, b.x + b.w / 2, b.y + b.h * 0.42, b.w / 36, st.t); else if (cp.weapon === 2) drawWallIcon(g, b.x + b.w / 2, b.y + b.h * 0.42, b.w / 48); else drawPot(g, b.x + b.w / 2, b.y + b.h * 0.44, b.w / 34, 0);
            g.font = '700 9px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFFFFF'; g.fillText(WEAPONS[cp.weapon].name, b.x + b.w / 2, b.y + b.h - 9, b.w - 6);
            var left = cp.weapon === 2 ? (hasWall(cp) ? 0 : 1) : cp.ammo[cp.weapon] === Infinity ? '∞' : cp.ammo[cp.weapon];
            g.beginPath(); g.arc(b.x + b.w - 4, b.y + 4, 10, 0, TAU); g.fillStyle = left === '∞' || left > 0 ? '#FFD24A' : '#555'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
            g.fillStyle = '#111'; g.font = '900 11px Poppins, sans-serif'; g.textBaseline = 'middle'; g.fillText(String(left), b.x + b.w - 4, b.y + 5);
          }
          if (st.hint && st.phase === 'aim' && cp && !cp.cpu) {
            var txt = ctx.touch() ? 'Irgendwo zurückziehen und loslassen' : '← → zielen, ↑ ↓ Kraft, Leertaste wirft (oder Maus ziehen)';
            g.font = '700 13px Poppins, sans-serif'; g.textAlign = 'center';
            var tw = Math.min(cssW - 20, g.measureText(txt).width + 26), hx = cssW / 2, hy = 58;
            g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
            rr(g, hx - tw / 2, hy - 15, tw, 30, 15); g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill(); g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
            g.fillStyle = '#FFF'; g.fillText(txt, hx, hy + 1, tw - 14); g.globalAlpha = 1;
          }
          /* Schleuder-Linie beim Ziehen */
          if (drag && drag.on) {
            g.setLineDash([5, 5]); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2;
            g.beginPath(); g.moveTo(drag.x0, drag.y0); g.lineTo(drag.x, drag.y); g.stroke(); g.setLineDash([]);
            g.beginPath(); g.arc(drag.x0, drag.y0, 6, 0, TAU); g.fillStyle = '#FDC506'; g.fill();
          }
        }
        if (st.menu) {
          g.fillStyle = 'rgba(10,10,10,0.82)'; g.fillRect(0, 0, cssW, cssH);
          var bs = menuButtons();
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#FDC506'; g.font = '900 ' + Math.min(30, cssW / 13) + 'px Poppins, sans-serif';
          g.fillText('Wie wollt ihr spielen?', cssW / 2, bs[0].y - 40);
          bs.forEach(function (b) {
            rr(g, b.x, b.y, b.w, b.h, 16); g.fillStyle = b.main ? '#FDC506' : '#262626'; g.fill();
            g.lineWidth = 2; g.strokeStyle = b.main ? '#FDC506' : '#FFFFFF'; g.stroke();
            g.fillStyle = b.main ? '#111' : '#FFF'; g.font = '800 17px Poppins, sans-serif'; g.fillText(b.label, b.x + b.w / 2, b.y + b.h * 0.38, b.w - 16);
            g.font = '600 12px Poppins, sans-serif'; g.fillStyle = b.main ? 'rgba(17,17,17,0.7)' : 'rgba(255,255,255,0.65)'; g.fillText(b.sub, b.x + b.w / 2, b.y + b.h * 0.7, b.w - 16);
          });
        }
      }
      function menuButtons() {
        var list = [
          { k: 1, label: '1 · Gegen Wespen', sub: 'Runde für Runde, mit Rangliste', main: true },
          { k: 2, label: '2 · Zu zweit', sub: 'abwechselnd an einem Gerät' }
        ];
        var cols = cssW < 560 ? 1 : 2, w = Math.min(260, (cssW - 40 - (cols - 1) * 20) / cols), h = 66, gap = 14;
        var rows = Math.ceil(list.length / cols), y0 = cssH * 0.5 - (rows * h + (rows - 1) * gap) / 2 + 20;
        var x0 = cssW / 2 - (cols * w + (cols - 1) * 20) / 2;
        list.forEach(function (b, i) { b.w = w; b.h = h; b.x = x0 + (i % cols) * (w + 20); b.y = y0 + Math.floor(i / cols) * (h + gap); });
        return list;
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
        if (!st.gnd) { sizeMap(); layout(); genTerrain(); st.players = [makePlayer(0, false), makePlayer(1, true, FOES[0])]; }
        st.t = now; render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() { st.on = false; keys = {}; drag = null; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() {
        stop(); render();
        if (st.duo) {
          var w = st.wins[0] === st.wins[1] ? '' : st.wins[0] > st.wins[1] ? 'Die Biene' : 'Die Hummel';
          ctx.finish(0, { duo: true, headline: w ? w + ' gewinnt!' : 'Unentschieden!', line: 'Endstand ' + Math.max(st.wins[0], st.wins[1]) + ':' + Math.min(st.wins[0], st.wins[1]) + '.' });
        } else ctx.finish(st.score, { rounds: st.won, hits: st.hits, dmg: st.dmg });
      }
      function switchWeapon() {
        var p = cur(); if (!p || p.cpu || !(st.phase === 'aim' || st.phase === 'wait')) return;
        var next = p.weapon;
        for (var n = 1; n <= WEAPONS.length; n++) { var c = (p.weapon + n) % WEAPONS.length; if (canUse(p, c)) { next = c; break; } }
        if (next === p.weapon) { ctx.fx.text(SX(p.x), SY(p.y - 70), 'Gerade nur Honigtöpfe', '#FF7A6B', 16); ctx.tone(160, 140, 0.05, 'square', 0.02); return; }
        p.weapon = next;
        ctx.tone(700, 900, 0.05, 'triangle', 0.03);
        ctx.fx.text(SX(p.x), SY(p.y - 70), WEAPONS[p.weapon].name + (p.weapon === 1 ? ' (noch ' + p.ammo[1] + ')' : p.weapon === 2 ? ' (kostet den Zug)' : ''), '#FFE680', 18);
      }

      /* Maus und Finger: wie eine Schleuder zurückziehen und loslassen */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var q = local(e);
        if (st.menu) { menuButtons().forEach(function (b) { if (q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h) startGame(b.k === 2); }); return; }
        var b2 = weaponBtn();
        if (q.x >= b2.x && q.x <= b2.x + b2.w && q.y >= b2.y && q.y <= b2.y + b2.h) { switchWeapon(); return; }
        var p = cur();
        if (!p || p.cpu || st.phase !== 'aim') return;
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        drag = { id: e.pointerId, x0: q.x, y0: q.y, x: q.x, y: q.y, on: false };
      });
      cv.addEventListener('pointermove', function (e) {
        if (!drag || drag.id !== e.pointerId) return;
        var q = local(e), p = cur();
        drag.x = q.x; drag.y = q.y;
        var dx = drag.x0 - q.x, dy = drag.y0 - q.y, len = Math.hypot(dx, dy);
        if (len > 10 && p && st.phase === 'aim') {
          drag.on = true; st.hint = false;
          p.a = clamp(Math.atan2(dy, dx), -Math.PI - 0.35, 0.35);
          if (dy > 0 && Math.abs(Math.atan2(dy, dx)) > Math.PI / 2 + 0.35) p.a = -Math.PI - 0.35;
          p.p = clamp(len / (Math.min(cssW, cssH) * 0.4), 0.12, 1);
          p.face = Math.cos(p.a) >= 0 ? 1 : -1;
        }
      });
      function up(e) {
        if (!drag || drag.id !== e.pointerId) return;
        var d = drag; drag = null;
        var p = cur();
        if (d.on && Math.hypot(d.x0 - d.x, d.y0 - d.y) > 24 && p && !p.cpu && st.phase === 'aim') throwShot(p);
      }
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', function () { drag = null; });
      function onKeyUp(e) { delete keys[e.key]; }
      document.addEventListener('keyup', onKeyUp);

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); keys = {}; drag = null;
          sizeMap(); layout(); genTerrain();
          st.players = [makePlayer(0, false), makePlayer(1, true, FOES[0])];
          st.menu = true; st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; keys = {}; drag = null; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); sizeMap(); layout(); genTerrain(); st.players = [makePlayer(0, false), makePlayer(1, true, FOES[0])]; render(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: function () { layout(); render(); },
        key: function (e) {
          var kk = e.key;
          if (st.menu) { if (kk === '1') { startGame(false); return true; } if (kk === '2') { startGame(true); return true; } return false; }
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'A', 'd', 'D', 'w', 'W', 's', 'S'].indexOf(kk) >= 0) { keys[kk] = true; st.hint = false; return true; }
          if (kk === ' ' || kk === 'Enter') { var p = cur(); if (!e.repeat && p && !p.cpu && st.phase === 'aim') throwShot(p); return true; }
          if (kk === 'q' || kk === 'Q' || kk === 'e' || kk === 'E') { switchWeapon(); return true; }
          return false;
        },
        _debug: function () { return { st: st, W: W, H: H, k: k, ox: ox, oy: oy, startGame: startGame, cpuPlan: cpuPlan, simulate: simulate, simulateBomb: simulateBomb, throwShot: throwShot }; }
      };
    }
  });
})();

/* Spiel 15: Honigflipper (Flipper-Prinzip, eigener Bienenstock-Tisch) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, TW = 400, TH = 700, BR = 9, GRAV = 1150, MAXV = 2100, SUB = 10, BALLS = 3, SAVE_MS = 4000;
  var FL_LEN = 62, FL_R = 8, FL_REST = 0.55, FL_UP = -0.42, FL_SPEED_UP = 26, FL_SPEED_DOWN = 14;
  var LANE_X = 365, LANE_Y = 655;
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function seg(ax, ay, bx, by, e, kind) { return { ax: ax, ay: ay, bx: bx, by: by, e: e === undefined ? 0.55 : e, kind: kind || 'wall' }; }
  var SLINGS = [[76, 462, 76, 528, 116, 552], [296, 462, 296, 528, 256, 552]];

  /* Der Tisch: Wände, Schleudern, Pfosten, Bumper, Ziele */
  function buildTable() {
    var walls = [];
    /* Oberer Bogen (Halbellipse) */
    var pts = [];
    for (var i = 0; i <= 22; i++) { var a = Math.PI + i / 22 * Math.PI; pts.push([200 + Math.cos(a) * 180, 100 + Math.sin(a) * 92]); }
    for (var j = 0; j < pts.length - 1; j++) walls.push(seg(pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], 0.5));
    /* Außenwände, Abschussbahn */
    walls.push(seg(20, 100, 20, 720)); walls.push(seg(380, 100, 380, 720)); walls.push(seg(350, 720, 350, 200, 0.4));
    /* Trennwände: außen die Abflüsse, innen die Rückläufe zu den Flippern */
    walls.push(seg(48, 470, 48, 556)); walls.push(seg(48, 556, 130, 604));
    walls.push(seg(322, 470, 322, 556)); walls.push(seg(322, 556, 270, 604));
    /* Schleudern über den Flippern: die schräge Seite kickt */
    SLINGS.forEach(function (p) {
      walls.push(seg(p[0], p[1], p[2], p[3])); walls.push(seg(p[2], p[3], p[4], p[5]));
      walls.push(seg(p[0], p[1], p[4], p[5], 1.0, 'sling'));
    });
    return {
      walls: walls,
      bumpers: [{ x: 140, y: 232, r: 25, hit: 0 }, { x: 260, y: 232, r: 25, hit: 0 }, { x: 200, y: 304, r: 25, hit: 0 }],
      posts: [{ x: 125, y: 132, r: 5 }, { x: 175, y: 132, r: 5 }, { x: 225, y: 132, r: 5 }, { x: 275, y: 132, r: 5 }],
      lanes: [{ x: 150, lit: false }, { x: 200, lit: false }, { x: 250, lit: false }],
      targets: [0, 1, 2, 3, 4].map(function (i) { return { x: 34, y: 296 + i * 26, h: 20, up: true, hit: 0, letter: 'BIENE'[i] }; }),
      saucer: { x: 300, y: 405, r: 16 },
      wasp: { x: 200, y: 378, r: 15, dir: 1, gone: 0, hit: 0 },
      spinner: { x: 46, y: 236, w: 44, a: 0, v: 0 },
      kick: [{ x: 34, lit: false }, { x: 336, lit: false }],
      inl: [{ x: 62, lit: false }, { x: 309, lit: false }]
    };
  }

  MBArcade.register({
    id: 'flipper',
    title: 'Honigflipper',
    duration: 0,
    multiTouch: true,
    startText: 'Der Bienenstock-Flipper! Halt die Kugel mit den Flippern im Spiel, ballere in die Honigtopf-Bumper, triff die fliegende Wespe und versenk die Kugel dreimal im Honigtopf für Multiball. Du hast drei Kugeln.',
    help: {
      legendTitle: 'Punkte',
      controls: [
        { icons: ['kbd:A', 'kbd:D'], text: 'Linker und rechter Flipper (auch ← → oder Shift)', kb: true },
        { icons: ['kbd:Leertaste'], text: 'Abschuss: gedrückt halten zum Spannen, loslassen schießt', kb: true },
        { icons: ['tap'], text: 'Linke Hälfte = linker Flipper, rechte Hälfte = rechter. Abschuss: halten und loslassen', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.beginPath(); g.arc(23, 23, 15, 0, TAU); g.fillStyle = '#E9A800'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#FDC506'; g.stroke(); }, text: 'Honigtopf-Bumper', val: '100' },
        { draw: function (g) { g.translate(25, 24); g.scale(0.55, 0.55); art.wasp(g, 0.4); }, text: 'Fliegende Wespe treffen, jede dritte erhöht den Multiplikator', val: '750' },
        { draw: function (g) { for (var i = 0; i < 5; i++) { g.fillStyle = '#FDC506'; g.fillRect(6 + i * 7, 12, 5, 22); } }, text: 'Alle fünf BIENE-Ziele: Bonus und höherer Multiplikator', val: '2.500' },
        { draw: function (g) { g.beginPath(); g.arc(23, 23, 13, 0, TAU); g.fillStyle = '#2A1A08'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#FF9F1A'; g.stroke(); }, text: 'Kugel im Honigtopf versenken, beim dritten Mal Multiball (alles doppelt)', val: '500' },
        { draw: function (g) { g.save(); g.translate(23, 23); g.rotate(0.4); g.fillStyle = '#C7CDD9'; g.fillRect(-16, -3, 32, 6); g.restore(); }, text: 'Drehtor links: je Umdrehung', val: '25' },
        { draw: function (g) { g.beginPath(); g.arc(23, 23, 8, 0, TAU); g.fillStyle = '#7FD3FF'; g.fill(); }, text: 'Rücklauf zum Flipper zündet die Rettung im Abfluss daneben', val: '100' },
        { draw: function (g) { ['#FDC506', '#FDC506', '#FDC506'].forEach(function (c, i) { g.beginPath(); g.arc(9 + i * 14, 23, 5, 0, TAU); g.fillStyle = c; g.fill(); }); }, text: 'Alle drei Bahnen oben: Multiplikator +1', val: '×' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Deine Website soll auch so abgehen? Lass uns reden.' },
    stats: function (s) {
      return s.bumps + ' Bumper-Treffer, ' + s.wasps + (s.wasps === 1 ? ' Wespe' : ' Wespen') + ' getroffen, ' + s.biene + '-mal BIENE komplett, höchster Multiplikator ×' + s.mult + '.';
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, k = 1, ox = 0, oy = 0, bg = null;
      var raf = 0, idleRaf = 0, keys = {}, touches = {};
      var st = fresh();

      function fresh() {
        var fl = [
          { side: -1, px: 128, py: 612, a: FL_REST, w: 0, up: false },
          { side: 1, px: 272, py: 612, a: Math.PI - FL_REST, w: 0, up: false }
        ];
        return {
          on: false, paused: false, over: false, t: 0, last: 0,
          table: buildTable(), flippers: fl, list: [], ball: null, balls: BALLS, score: 0, mult: 1, maxMult: 1,
          plunger: 0, charging: false, waiting: true, saveUntil: 0, saveUsed: false, bumps: 0, biene: 0, wasps: 0, parts: [], drained: 0, hint: true,
          sinks: 0, multi: false, ballStats: { bumps: 0, targets: 0, spins: 0, wasps: 0 }
        };
      }
      function newBall() {
        var b = { x: LANE_X, y: LANE_Y, vx: 0, vy: 0, still: 0 };
        st.list = st.list.filter(function (x) { return x !== st.ball; });
        st.list.push(b); st.ball = b; st.waiting = true; st.plunger = 0;
      }

      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        k = Math.min(cssW / TW, cssH / TH);
        ox = (cssW - TW * k) / 2; oy = (cssH - TH * k) / 2;
        bg = null;
      }
      function SX(x) { return ox + x * k; }
      function SY(y) { return oy + y * k; }

      /* Physik */
      function closest(px, py, s) {
        var dx = s.bx - s.ax, dy = s.by - s.ay, l2 = dx * dx + dy * dy;
        var t = l2 ? Math.max(0, Math.min(1, ((px - s.ax) * dx + (py - s.ay) * dy) / l2)) : 0;
        return { x: s.ax + dx * t, y: s.ay + dy * t };
      }
      function collideSeg(b, s, rad) {
        var q = closest(b.x, b.y, s), dx = b.x - q.x, dy = b.y - q.y, d = Math.hypot(dx, dy);
        if (d >= rad || d < 1e-6) return false;
        var nx = dx / d, ny = dy / d;
        b.x = q.x + nx * rad; b.y = q.y + ny * rad;
        var vn = b.vx * nx + b.vy * ny;
        if (vn < 0) {
          b.vx -= (1 + s.e) * vn * nx; b.vy -= (1 + s.e) * vn * ny;
          if (s.kind === 'sling' && vn < -80) {
            b.vx += nx * 620; b.vy += ny * 620;
            addScore(10); st.slingHit = s; st.slingT = st.t;
            ctx.fx.ring(SX(q.x), SY(q.y), '#FFFFFF', 30 * k, 3, 260);
            burst(q.x, q.y, ['#FF8AD8', '#FFFFFF'], 5, 180);
            ctx.tone(700, 400, 0.05, 'square', 0.03);
          }
        }
        return true;
      }
      function collideCircle(b, c, rad, e) {
        var dx = b.x - c.x, dy = b.y - c.y, d = Math.hypot(dx, dy);
        if (d >= rad || d < 1e-6) return false;
        var nx = dx / d, ny = dy / d;
        b.x = c.x + nx * rad; b.y = c.y + ny * rad;
        var vn = b.vx * nx + b.vy * ny;
        if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; }
        return { nx: nx, ny: ny };
      }
      function flipperSeg(f) { return { ax: f.px, ay: f.py, bx: f.px + Math.cos(f.a) * FL_LEN, by: f.py + Math.sin(f.a) * FL_LEN }; }
      function collideFlipper(b, f) {
        var s = flipperSeg(f), q = closest(b.x, b.y, s), dx = b.x - q.x, dy = b.y - q.y, d = Math.hypot(dx, dy), rad = BR + FL_R;
        if (d >= rad || d < 1e-6) return;
        var nx = dx / d, ny = dy / d;
        b.x = q.x + nx * rad; b.y = q.y + ny * rad;
        /* Geschwindigkeit des Flippers an der Kontaktstelle */
        var rx = q.x - f.px, ry = q.y - f.py, cvx = -f.w * ry, cvy = f.w * rx;
        var rvx = b.vx - cvx, rvy = b.vy - cvy, vn = rvx * nx + rvy * ny;
        if (vn < 0) { b.vx -= 1.35 * vn * nx; b.vy -= 1.35 * vn * ny; }
      }

      function addScore(n) { var v = n * st.mult * (st.multi ? 2 : 1); st.score += v; ctx.setScore(st.score); return v; }
      function burst(x, y, colors, n, speed) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8); st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.3 + Math.random() * 0.4, size: 1.5 + Math.random() * 2.5, c: colors[i % colors.length] }); }
      }

      function moveFlippers(dt) {
        st.flippers.forEach(function (f) {
          var target = f.side < 0 ? (f.up ? FL_UP : FL_REST) : (f.up ? Math.PI - FL_UP : Math.PI - FL_REST);
          var speed = f.up ? FL_SPEED_UP : FL_SPEED_DOWN, diff = target - f.a, dir = Math.sign(diff);
          var move = Math.min(Math.abs(diff), speed * dt);
          f.w = diff ? dir * speed : 0;
          if (Math.abs(diff) <= speed * dt) f.w = diff / dt;
          f.a += dir * move;
        });
      }

      function step(dt) {
        moveFlippers(dt);
        st.list.slice().forEach(function (b) { stepBall(b, dt); });
        /* Kugeln stoßen sich gegenseitig ab (Multiball) */
        if (st.list.length > 1) for (var i = 0; i < st.list.length; i++) for (var j = i + 1; j < st.list.length; j++) {
          var a = st.list[i], c = st.list[j];
          if (a.held || c.held || (st.waiting && (a === st.ball || c === st.ball))) continue;
          var dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
          if (d > 0 && d < BR * 2) {
            var nx = dx / d, ny = dy / d, o = (BR * 2 - d) / 2;
            a.x -= nx * o; a.y -= ny * o; c.x += nx * o; c.y += ny * o;
            var rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
            if (rv < 0) { a.vx += rv * nx; a.vy += rv * ny; c.vx -= rv * nx; c.vy -= rv * ny; }
          }
        }
      }

      function stepBall(b, dt) {
        var T = st.table;
        if (b.held) return;
        if (b === st.ball && st.waiting) { b.x = LANE_X; b.y = LANE_Y + st.plunger * 30; b.vx = 0; b.vy = 0; return; }
        var oy0 = b.y;
        b.vy += GRAV * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        T.walls.forEach(function (s) { collideSeg(b, s, BR); });
        T.posts.forEach(function (p) { collideCircle(b, p, BR + p.r, 0.5); });
        T.bumpers.forEach(function (bp) {
          var hit = collideCircle(b, bp, BR + bp.r, 0.6);
          if (hit) {
            b.vx += hit.nx * 700; b.vy += hit.ny * 700;
            bp.hit = 1; st.bumps++; st.ballStats.bumps++;
            addScore(100);
            ctx.fx.ring(SX(bp.x), SY(bp.y), '#FDC506', (bp.r + 26) * k, 5, 360);
            ctx.fx.shake(0.08, 3);
            burst(bp.x, bp.y, ['#FDC506', '#FFE680', '#FFFFFF'], 8, 220);
            ctx.tone(520 + Math.random() * 200, 260, 0.08, 'square', 0.04);
          }
        });
        T.targets.forEach(function (tg) {
          if (!tg.up) return;
          var s = { ax: tg.x, ay: tg.y, bx: tg.x, by: tg.y + tg.h, e: 0.4 };
          if (collideSeg(b, s, BR + 3)) {
            tg.up = false; tg.hit = 1; st.ballStats.targets++;
            addScore(250);
            ctx.fx.ring(SX(tg.x), SY(tg.y + tg.h / 2), '#FFE680', 30 * k, 3, 300);
            ctx.tone(900, 1300, 0.07, 'triangle', 0.04);
            if (T.targets.every(function (x) { return !x.up; })) {
              st.biene++; addScore(2500); raiseMult();
              ctx.fx.banner('BIENE komplett!', '#FDC506'); ctx.fx.flash('253,197,6', 0.7); ctx.fx.shake(0.25, 7);
              ctx.fx.sparkle(SX(60), SY(360), null, 24, 260);
              ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.18, 'triangle', 0.06, 0.12);
              setTimeout(function () { T.targets.forEach(function (x) { x.up = true; }); }, 1500);
            }
          }
        });
        /* Fliegende Wespe */
        var w = T.wasp;
        if (!w.gone) {
          var wh = collideCircle(b, w, BR + w.r, 0.7);
          if (wh) {
            b.vx += wh.nx * 300; b.vy += wh.ny * 300;
            w.gone = st.t; st.wasps++; st.ballStats.wasps++;
            var got = addScore(750);
            ctx.fx.boom(SX(w.x), SY(w.y), '#FFE680', '253,197,6', 0.7);
            ctx.fx.text(SX(w.x), SY(w.y) - 26 * k, 'Wespe! +' + got, '#FFE680', 22);
            burst(w.x, w.y, ['#FDC506', '#111111', '#FFFFFF'], 14, 260);
            ctx.tone(880, 220, 0.25, 'sawtooth', 0.04); ctx.tone(660, 1320, 0.15, 'triangle', 0.05, 0.1);
            if (st.wasps % 3 === 0) raiseMult();
          }
        }
        /* Drehtor links: zählt beim Durchfliegen */
        var sp0 = T.spinner;
        if (b.x > sp0.x - sp0.w / 2 && b.x < sp0.x + sp0.w / 2 && (oy0 - sp0.y) * (b.y - sp0.y) < 0) {
          sp0.v = Math.min(60, Math.abs(b.vy) / 25);
          var spins = Math.max(1, Math.round(Math.abs(b.vy) / 160));
          st.ballStats.spins += spins;
          var gotS = addScore(25 * spins);
          ctx.fx.text(SX(sp0.x), SY(sp0.y) - 18 * k, '+' + gotS, '#C7CDD9', 16);
          for (var q = 0; q < Math.min(spins, 6); q++) ctx.tone(1200 + q * 90, 1100, 0.03, 'square', 0.015, q * 0.04);
        }
        st.flippers.forEach(function (f) { collideFlipper(b, f); });
        /* Bahnen oben */
        if (b.y > 120 && b.y < 145 && b.vy > 0) T.lanes.forEach(function (ln) {
          if (Math.abs(b.x - ln.x) < 16 && !ln.lit) {
            ln.lit = true; addScore(50);
            ctx.fx.ring(SX(ln.x), SY(132), '#FDC506', 22 * k, 3, 300); ctx.tone(1000, 1300, 0.06, 'triangle', 0.03);
            if (T.lanes.every(function (x) { return x.lit; })) {
              raiseMult();
              setTimeout(function () { T.lanes.forEach(function (x) { x.lit = false; }); }, 900);
            }
          }
        });
        /* Rückläufe zu den Flippern: Rettung im Abfluss daneben zünden */
        T.inl.forEach(function (il, i) {
          if (Math.abs(b.x - il.x) < 12 && oy0 < 520 && b.y >= 520 && b.vy > 0) {
            addScore(100); il.lit = true; il.t = st.t;
            if (!T.kick[i].lit) { T.kick[i].lit = true; ctx.fx.text(SX(il.x), SY(500), 'Rettung an!', '#7FD3FF', 15); }
            ctx.fx.ring(SX(il.x), SY(520), '#7FD3FF', 22 * k, 3, 300); ctx.tone(1100, 1500, 0.06, 'triangle', 0.03);
          }
        });
        /* Abfluss außen: brennt die Rettung, kickt sie die Kugel zurück */
        T.kick.forEach(function (kk, i) {
          var inLane = i === 0 ? b.x < 48 : (b.x > 322 && b.x < 350);
          if (inLane && b.y > 600 && b.vy > 0 && kk.lit) {
            kk.lit = false; T.inl[i].lit = false;
            b.vy = -rnd(1350, 1550); b.vx = i === 0 ? rnd(0, 40) : rnd(-40, 0); b.y = 600;
            ctx.fx.ring(SX(kk.x), SY(610), '#7FD3FF', 36 * k, 4, 360); ctx.fx.flash('127,211,255', 0.35);
            ctx.fx.text(SX(kk.x + (i ? -30 : 30)), SY(560), 'Gerettet!', '#7FD3FF', 18);
            ctx.tone(300, 1200, 0.2, 'triangle', 0.05);
          }
        });
        /* Honigtopf-Mulde fängt langsame Kugeln */
        var sc = T.saucer, ds = Math.hypot(b.x - sc.x, b.y - sc.y);
        if (ds < sc.r && Math.hypot(b.vx, b.vy) < 700 && !(b.cool > st.t) && !st.list.some(function (x) { return x.held; })) {
          b.held = st.t + 1100; b.x = sc.x; b.y = sc.y; b.vx = b.vy = 0;
          st.sinks++;
          var gotH = addScore(500);
          ctx.fx.boom(SX(sc.x), SY(sc.y), '#FF9F1A', '255,159,26', 0.8);
          ctx.fx.text(SX(sc.x), SY(sc.y) - 30 * k, 'Honigtopf! +' + gotH, '#FFE680', 20);
          ctx.tone(330, 660, 0.25, 'triangle', 0.05);
          if (!st.multi && st.sinks >= 3) startMulti();
          else if (!st.multi) ctx.fx.text(SX(sc.x), SY(sc.y) + 24 * k, (3 - st.sinks) + '× bis Multiball', '#FF9F1A', 14);
        }
        var sp = Math.hypot(b.vx, b.vy);
        if (sp > MAXV) { b.vx *= MAXV / sp; b.vy *= MAXV / sp; }
        /* Zurück in die Abschussbahn gerollt: neu abschießen, ohne Kugel zu verlieren */
        if (b.x > 352 && b.y > 640 && b.vy > 0) {
          if (st.waiting) { b.vy = -1500; return; }
          st.list = st.list.filter(function (x) { return x !== b; });
          st.ball = null; newBall(); st.hint = true; return;
        }
        /* Hängt die Kugel fest, gibt es einen kleinen Schubs */
        if (sp < 25 && b.y < 590) { b.still += dt; if (b.still > 2.5) { b.vx = rnd(-200, 200); b.vy = -rnd(150, 300); b.still = 0; } } else b.still = 0;
        /* Kugel weg */
        if (b.y > TH + 30) drain(b);
      }
      function startMulti() {
        st.multi = true; st.sinks = 0;
        var b = { x: LANE_X, y: 600, vx: 0, vy: -1650, still: 0 };
        st.list.push(b);
        st.saveUntil = Math.max(st.saveUntil, st.t + 6000);
        ctx.fx.banner('MULTIBALL! Alles doppelt!', '#FF9F1A', 36); ctx.fx.flash('255,159,26', 0.8); ctx.fx.shake(0.35, 9);
        ctx.fx.sparkle(SX(200), SY(300), ['#FDC506', '#FF9F1A', '#FFFFFF', '#FF8AD8'], 40, 360);
        ctx.tone(392, 784, 0.15, 'square', 0.05); ctx.tone(523, 1046, 0.15, 'square', 0.05, 0.12); ctx.tone(784, 1568, 0.3, 'triangle', 0.06, 0.24);
      }
      function raiseMult() {
        if (st.mult >= 5) return;
        st.mult++; st.maxMult = Math.max(st.maxMult, st.mult);
        ctx.fx.banner('Multiplikator ×' + st.mult + '!', '#FF8AD8', 34);
        ctx.tone(660, 1320, 0.25, 'triangle', 0.05);
      }
      function drain(b) {
        st.list = st.list.filter(function (x) { return x !== b; });
        if (st.list.length) {
          /* Im Multiball kostet eine Kugel kein Leben */
          if (st.t < st.saveUntil) { var nb = { x: LANE_X, y: 600, vx: 0, vy: -1600, still: 0 }; st.list.push(nb); ctx.fx.text(SX(200), SY(560), 'Gerettet!', '#7FD3FF', 20); return; }
          if (st.list.length === 1 && st.multi) { st.multi = false; ctx.fx.text(SX(200), SY(520), 'Multiball vorbei', '#FF9F1A', 18); }
          ctx.tone(300, 120, 0.25, 'sawtooth', 0.03);
          return;
        }
        st.multi = false;
        if (st.t < st.saveUntil && !st.saveUsed) {
          st.saveUsed = true;
          ctx.fx.banner('Gerettet! Noch mal.', '#7FD3FF');
          ctx.tone(500, 900, 0.2, 'triangle', 0.05);
          st.ball = null; newBall(); st.saveUntil = 0;
          return;
        }
        st.balls--;
        ctx.fx.flash('255,74,61', 0.8); ctx.fx.shake(0.3, 8);
        ctx.tone(400, 80, 0.6, 'sawtooth', 0.05);
        /* Bonus am Ende jeder Kugel */
        var s = st.ballStats, bonus = (s.bumps * 20 + s.targets * 50 + s.spins * 5 + s.wasps * 100) * st.mult;
        if (bonus) { st.score += bonus; ctx.setScore(st.score); }
        var bonusTxt = bonus ? 'Bonus +' + bonus.toLocaleString('de-DE') + (st.mult > 1 ? ' (×' + st.mult + ')' : '') : '';
        st.ballStats = { bumps: 0, targets: 0, spins: 0, wasps: 0 };
        st.ball = null;
        if (st.balls <= 0) { ctx.fx.banner('Letzte Kugel weg!' + (bonus ? ' ' + bonusTxt : ''), '#FF7A6B'); st.drained = st.t; return; }
        ctx.fx.banner('Kugel weg!' + (bonus ? ' ' + bonusTxt : ' Noch ' + st.balls), '#FF7A6B');
        st.mult = 1; st.saveUsed = false;
        newBall();
      }
      function launch() {
        if (!st.waiting) return;
        var p = st.plunger;
        st.waiting = false; st.charging = false;
        st.ball.vy = -(1050 + p * 1150); st.ball.vx = 0;
        if (!st.saveUsed) st.saveUntil = st.t + SAVE_MS;
        st.hint = false;
        ctx.fx.ring(SX(LANE_X), SY(660), '#FFFFFF', 30 * k, 3, 300);
        ctx.tone(200, 800, 0.15, 'triangle', 0.05);
        st.plunger = 0;
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var pt = st.parts[q]; pt.t += dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 400 * dt; if (pt.t > pt.life) st.parts.splice(q, 1); }
        var T = st.table;
        T.bumpers.forEach(function (bp) { bp.hit = Math.max(0, bp.hit - dt * 5); });
        /* Wespe fliegt hin und her, nach einem Treffer kommt sie wieder */
        var w = T.wasp;
        if (w.gone && st.t - w.gone > 3500) { w.gone = 0; w.x = w.dir > 0 ? 112 : 288; }
        if (!w.gone) { w.x += w.dir * (55 + st.wasps * 6) * dt; if (w.x > 288) { w.x = 288; w.dir = -1; } if (w.x < 112) { w.x = 112; w.dir = 1; } }
        T.spinner.a += T.spinner.v * dt; T.spinner.v *= Math.pow(0.15, dt);
        if (st.drained) { if (st.t - st.drained > 1800) st.over = true; }
        /* Flipper-Eingaben */
        var L = keys.a || keys.A || keys.ArrowLeft || keys.Shift_L || touches.left, R = keys.d || keys.D || keys.ArrowRight || keys.Shift_R || touches.right;
        var inPlay = st.list.some(function (b) { return !(b === st.ball && st.waiting); });
        if (L && !st.flippers[0].up && inPlay) ctx.tone(180, 140, 0.04, 'square', 0.02);
        if (R && !st.flippers[1].up && inPlay) ctx.tone(180, 140, 0.04, 'square', 0.02);
        st.flippers[0].up = !!L && inPlay; st.flippers[1].up = !!R && inPlay;
        if (st.waiting && st.charging) st.plunger = Math.min(1, st.plunger + dt * 1.1);
        st.list.forEach(function (b) {
          if (b.held && st.t >= b.held) {
            b.held = 0; b.cool = st.t + 500;
            b.vx = rnd(-450, -250); b.vy = -rnd(500, 700);
          }
        });
        var h = dt / SUB;
        for (var i = 0; i < SUB; i++) step(h);
      }

      /* Zeichnen */
      function paintBg() {
        var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d');
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.fillStyle = '#0E0B07'; x.fillRect(0, 0, cssW, cssH);
        x.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        /* Tischfläche */
        x.beginPath(); x.moveTo(20, 720); x.lineTo(20, 100); x.ellipse(200, 100, 180, 92, 0, Math.PI, TAU); x.lineTo(380, 720); x.closePath();
        var gr = x.createLinearGradient(0, 0, 0, TH); gr.addColorStop(0, '#3A2608'); gr.addColorStop(1, '#22160A');
        x.fillStyle = gr; x.fill();
        x.save(); x.clip();
        for (var yy = 0; yy < TH + 30; yy += 26) for (var xx = (yy / 26) % 2 ? 15 : 0; xx < TW; xx += 30) art.hex(x, xx, yy, 13, null, 'rgba(253,197,6,0.07)', 1.5);
        /* Beschriftung */
        x.fillStyle = 'rgba(253,197,6,0.12)'; x.font = '900 46px Poppins, sans-serif'; x.textAlign = 'center';
        x.fillText('HONIG', 200, 450); x.fillText('FLIPPER', 200, 496);
        /* Abflüsse dunkler */
        x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(20, 470, 28, 250); x.fillRect(322, 470, 28, 250);
        x.restore();
        /* Abschussbahn */
        x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(350, 200, 30, 520);
        bg = c;
      }
      function line(s, color, w) { g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.bx, s.by); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }
      function lamp(x, y, r, on, color) {
        if (on) { var lg = g.createRadialGradient(x, y, 1, x, y, r * 3); lg.addColorStop(0, color); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = 0.6; g.fillStyle = lg; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); g.globalAlpha = 1; }
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = on ? color : 'rgba(255,255,255,0.12)'; g.fill();
      }
      function render() {
        if (!bg) paintBg();
        g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0);
        g.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        var T = st.table, blink = Math.floor(st.t / 250) % 2;
        if (st.multi) { g.strokeStyle = blink ? 'rgba(255,159,26,0.7)' : 'rgba(253,197,6,0.4)'; g.lineWidth = 6; g.beginPath(); g.moveTo(20, 720); g.lineTo(20, 100); g.ellipse(200, 100, 180, 92, 0, Math.PI, TAU); g.lineTo(380, 720); g.stroke(); }
        T.walls.forEach(function (s) {
          if (s.kind === 'sling') { var lit = st.slingHit === s && st.t - st.slingT < 150; line(s, lit ? '#FFFFFF' : '#FF8AD8', lit ? 7 : 5); }
          else line(s, '#FDC506', 4);
        });
        /* Schleudern ausfüllen */
        SLINGS.forEach(function (p) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[2], p[3]); g.lineTo(p[4], p[5]); g.closePath(); g.fillStyle = 'rgba(255,138,216,0.18)'; g.fill(); });
        /* Rettungslampen und Rücklauf-Lichter */
        T.kick.forEach(function (kk, i) {
          lamp(kk.x, 640, 6, kk.lit, kk.lit && blink ? '#BFEAFF' : '#7FD3FF');
          g.fillStyle = kk.lit ? '#7FD3FF' : 'rgba(127,211,255,0.3)'; g.font = '800 7px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.save(); g.translate(kk.x, 590); g.rotate(-Math.PI / 2); g.fillText('RETTUNG', 0, 0); g.restore();
        });
        T.inl.forEach(function (il) { lamp(il.x, 528, 4, il.lit && st.t - il.t < 600, '#7FD3FF'); });
        T.posts.forEach(function (p) { g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); });
        T.lanes.forEach(function (ln) { lamp(ln.x, 152, 6, ln.lit, '#FDC506'); });
        /* Drehtor */
        var spn = T.spinner, sa = Math.abs(Math.cos(spn.a));
        g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(spn.x - spn.w / 2, spn.y); g.lineTo(spn.x + spn.w / 2, spn.y); g.stroke();
        rr(g, spn.x - spn.w / 2 + 3, spn.y - 1 - 5 * sa, spn.w - 6, 2 + 10 * sa, 2); g.fillStyle = spn.v > 2 ? '#FFFFFF' : '#C7CDD9'; g.fill();
        T.bumpers.forEach(function (bp) {
          var s = 1 + bp.hit * 0.15;
          g.save(); g.translate(bp.x, bp.y); g.scale(s, s);
          var gl = g.createRadialGradient(0, 0, 4, 0, 0, bp.r * 1.8); gl.addColorStop(0, 'rgba(253,197,6,' + (0.25 + bp.hit * 0.6) + ')'); gl.addColorStop(1, 'rgba(253,197,6,0)');
          g.fillStyle = gl; g.beginPath(); g.arc(0, 0, bp.r * 1.8, 0, TAU); g.fill();
          g.beginPath(); g.arc(0, 0, bp.r, 0, TAU); g.fillStyle = bp.hit > 0.3 ? '#FFE680' : '#E9A800'; g.fill();
          g.lineWidth = 4; g.strokeStyle = '#FDC506'; g.stroke();
          g.beginPath(); g.arc(0, 0, bp.r * 0.55, 0, TAU); g.fillStyle = '#7A4A1A'; g.fill();
          g.fillStyle = '#FDC506'; g.font = '900 12px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100', 0, 1);
          g.restore();
        });
        T.targets.forEach(function (tg) {
          if (tg.up) { rr(g, tg.x - 6, tg.y, 9, tg.h, 2); g.fillStyle = '#FDC506'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#111'; g.stroke(); }
          else { rr(g, tg.x - 6, tg.y + tg.h * 0.4, 9, tg.h * 0.6, 2); g.fillStyle = 'rgba(253,197,6,0.25)'; g.fill(); }
          g.fillStyle = tg.up ? 'rgba(255,255,255,0.5)' : '#FDC506'; g.font = '800 11px Poppins, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
          g.fillText(tg.letter, tg.x + 8, tg.y + tg.h / 2);
        });
        var sc = T.saucer, held = st.list.some(function (b) { return b.held; });
        g.beginPath(); g.arc(sc.x, sc.y, sc.r, 0, TAU); g.fillStyle = '#1A0F04'; g.fill(); g.lineWidth = 3; g.strokeStyle = held ? '#FFE680' : '#FF9F1A'; g.stroke();
        for (var si = 0; si < 3; si++) lamp(sc.x - 12 + si * 12, sc.y + sc.r + 9, 3.5, st.multi || si < st.sinks, '#FF9F1A');
        g.fillStyle = 'rgba(255,159,26,0.8)'; g.font = '800 8px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('MULTIBALL', sc.x, sc.y + sc.r + 21);
        /* Wespe */
        var w = T.wasp;
        if (!w.gone || st.t - w.gone < 600) {
          g.save(); g.translate(w.x, w.y + Math.sin(st.t / 180) * 4);
          if (w.gone) { var d = (st.t - w.gone) / 600; g.rotate(d * 9); g.scale(1 - d, 1 - d); g.globalAlpha = 1 - d; }
          if (w.dir < 0) g.scale(-1, 1);
          g.scale(0.95, 0.95); art.wasp(g, Math.sin(st.t / 25));
          g.restore(); g.globalAlpha = 1;
        }
        /* Flipper */
        st.flippers.forEach(function (f) {
          var s = flipperSeg(f);
          g.lineCap = 'round';
          g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.bx, s.by); g.strokeStyle = '#111'; g.lineWidth = FL_R * 2 + 4; g.stroke();
          g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.bx, s.by); g.strokeStyle = f.up ? '#FFE680' : '#FDC506'; g.lineWidth = FL_R * 2; g.stroke();
          g.beginPath(); g.arc(f.px, f.py, 4, 0, TAU); g.fillStyle = '#7A4A1A'; g.fill();
        });
        /* Abschussfeder */
        var py0 = 672 + st.plunger * 30;
        g.fillStyle = '#9AA2B4'; g.fillRect(356, py0, 18, 720 - py0);
        g.strokeStyle = '#59617A'; g.lineWidth = 2; g.beginPath(); for (var yy = py0 + 4; yy < 718; yy += 6) { g.moveTo(356, yy); g.lineTo(374, yy + 3); } g.stroke();
        if (st.waiting && st.charging) { g.fillStyle = 'rgba(253,197,6,0.85)'; g.fillRect(352, 700 - st.plunger * 120, 4, st.plunger * 120); }
        /* Kugeln */
        st.list.forEach(function (b) {
          g.beginPath(); g.arc(b.x + 2, b.y + 3, BR, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
          var bgr = g.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, BR);
          bgr.addColorStop(0, '#FFFFFF'); bgr.addColorStop(0.4, '#D8DCE4'); bgr.addColorStop(1, '#6B7385');
          g.beginPath(); g.arc(b.x, b.y, BR, 0, TAU); g.fillStyle = bgr; g.fill();
          if (st.t < st.saveUntil && !st.waiting) { g.beginPath(); g.arc(b.x, b.y, BR + 4, 0, TAU); g.strokeStyle = 'rgba(127,211,255,0.6)'; g.lineWidth = 2; g.stroke(); }
        });
        st.parts.forEach(function (pt) { g.globalAlpha = Math.max(0, 1 - pt.t / pt.life); g.beginPath(); g.arc(pt.x, pt.y, pt.size, 0, TAU); g.fillStyle = pt.c; g.fill(); });
        g.globalAlpha = 1;
        /* Anzeige oben im Tisch */
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 22px Poppins, sans-serif'; g.lineWidth = 5; g.lineJoin = 'round'; g.strokeStyle = 'rgba(17,17,17,0.85)';
        var sTxt = st.score.toLocaleString('de-DE'); g.strokeText(sTxt, 200, 62); g.fillStyle = '#FFFFFF'; g.fillText(sTxt, 200, 62);
        g.font = '700 11px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.75)';
        g.fillText('Kugel ' + Math.min(BALLS, BALLS - st.balls + 1) + '/' + BALLS + (st.mult > 1 ? '  ·  ×' + st.mult : '') + (st.multi ? '  ·  MULTIBALL' : ''), 200, 86);
        if (st.t < st.saveUntil && !st.waiting && !st.saveUsed) { g.fillStyle = blink ? '#7FD3FF' : 'rgba(127,211,255,0.5)'; g.font = '800 9px Poppins, sans-serif'; g.fillText('RETTUNG AKTIV', 200, 103); }
        if (st.on && st.hint && st.waiting && !st.paused) {
          var txt = ctx.touch() ? 'Halten und loslassen schießt die Kugel ab' : 'Leertaste halten und loslassen';
          g.font = '700 12px Poppins, sans-serif';
          var tw = g.measureText(txt).width + 22;
          rr(g, 200 - tw / 2, 545, tw, 26, 13); g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25; g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#fff'; g.fillText(txt, 200, 558); g.globalAlpha = 1;
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
      function idle(now) { if (st.on) return; st.t = now; render(); idleRaf = requestAnimationFrame(idle); }
      function stop() { st.on = false; keys = {}; touches = {}; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() { stop(); render(); ctx.finish(st.score, { bumps: st.bumps, biene: st.biene, mult: st.maxMult, wasps: st.wasps }); }

      /* Touch: linke/rechte Hälfte = Flipper, beim Abschuss halten und loslassen */
      var pmap = {};
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        var side = local(e).x < cssW / 2 ? 'left' : 'right';
        /* Wartet eine Kugel im Abschuss und ist sonst keine im Spiel: Finger spannt die Feder */
        if (st.waiting && st.list.length === 1) { pmap[e.pointerId] = 'plunge'; st.charging = true; return; }
        pmap[e.pointerId] = side; touches[side] = true;
      });
      function up(e) {
        var what = pmap[e.pointerId];
        delete pmap[e.pointerId];
        if (what === 'plunge') { if (st.charging) launch(); return; }
        if (what) touches[what] = Object.keys(pmap).some(function (id) { return pmap[id] === what; });
      }
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
      function onKeyUp(e) {
        var key = e.key === 'Shift' ? (e.location === 2 ? 'Shift_R' : 'Shift_L') : e.key;
        delete keys[key];
        if ((e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'Enter') && st.charging) launch();
      }
      document.addEventListener('keyup', onKeyUp);

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); keys = {}; touches = {}; pmap = {};
          layout(); newBall();
          st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; keys = {}; touches = {}; pmap = {}; st.charging = false; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); layout(); render(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: function () { layout(); render(); },
        key: function (e) {
          var key = e.key === 'Shift' ? (e.location === 2 ? 'Shift_R' : 'Shift_L') : e.key;
          if (['a', 'A', 'd', 'D', 'ArrowLeft', 'ArrowRight', 'Shift_L', 'Shift_R'].indexOf(key) >= 0) { keys[key] = true; return true; }
          if (key === ' ' || key === 'ArrowDown' || key === 's' || key === 'S' || key === 'Enter') { if (st.waiting) st.charging = true; return true; }
          return false;
        },
        _debug: function () { return { st: st, launch: launch, startMulti: startMulti, k: k, ox: ox, oy: oy }; }
      };
    }
  });
})();

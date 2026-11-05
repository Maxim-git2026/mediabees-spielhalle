/* Spiel 15: Honigflipper (Flipper-Prinzip, eigener Bienenstock-Tisch) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, TW = 400, TH = 700, BR = 9, GRAV = 1150, MAXV = 2100, SUB = 10, BALLS = 3, SAVE_MS = 7000;
  var FL_LEN = 62, FL_R = 8, FL_REST = 0.55, FL_UP = -0.42, FL_SPEED_UP = 26, FL_SPEED_DOWN = 14;
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function seg(ax, ay, bx, by, e, kind) { return { ax: ax, ay: ay, bx: bx, by: by, e: e === undefined ? 0.55 : e, kind: kind || 'wall' }; }

  /* Der Tisch: Wände, Schleudern, Pfosten, Bumper, Ziele */
  function buildTable() {
    var walls = [];
    /* Oberer Bogen (Halbellipse) */
    var pts = [];
    for (var i = 0; i <= 22; i++) { var a = Math.PI + i / 22 * Math.PI; pts.push([200 + Math.cos(a) * 180, 100 + Math.sin(a) * 92]); }
    for (var j = 0; j < pts.length - 1; j++) walls.push(seg(pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], 0.5));
    walls.push(seg(20, 100, 20, 540)); walls.push(seg(20, 540, 130, 604));
    walls.push(seg(380, 100, 380, 720)); walls.push(seg(350, 720, 350, 200, 0.4)); walls.push(seg(350, 540, 269, 603));
    /* Schleudern über den Flippern: die schräge Seite kickt */
    walls.push(seg(66, 462, 66, 538)); walls.push(seg(66, 538, 110, 568));
    walls.push(seg(66, 462, 110, 568, 1.0, 'sling'));
    walls.push(seg(334, 462, 334, 538)); walls.push(seg(334, 538, 290, 568));
    walls.push(seg(334, 462, 290, 568, 1.0, 'sling'));
    return {
      walls: walls,
      bumpers: [{ x: 140, y: 232, r: 25, hit: 0 }, { x: 260, y: 232, r: 25, hit: 0 }, { x: 200, y: 304, r: 25, hit: 0 }],
      posts: [{ x: 125, y: 132, r: 5 }, { x: 175, y: 132, r: 5 }, { x: 225, y: 132, r: 5 }, { x: 275, y: 132, r: 5 }],
      lanes: [{ x: 150, lit: false }, { x: 200, lit: false }, { x: 250, lit: false }],
      targets: [0, 1, 2, 3, 4].map(function (i) { return { x: 34, y: 296 + i * 26, h: 20, up: true, hit: 0, letter: 'BIENE'[i] }; }),
      saucer: { x: 300, y: 405, r: 16 }
    };
  }

  MBArcade.register({
    id: 'flipper',
    title: 'Honigflipper',
    duration: 0,
    multiTouch: true,
    startText: 'Der Bienenstock-Flipper! Halt die Kugel mit den Flippern im Spiel, ballere in die Honigtopf-Bumper und räum die BIENE-Ziele ab. Du hast drei Kugeln.',
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
        { draw: function (g) { for (var i = 0; i < 5; i++) { g.fillStyle = '#FDC506'; g.fillRect(6 + i * 7, 12, 5, 22); } }, text: 'Alle fünf BIENE-Ziele: Bonus und höherer Multiplikator', val: '2.500' },
        { draw: function (g) { g.beginPath(); g.arc(23, 23, 13, 0, TAU); g.fillStyle = '#2A1A08'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#FF9F1A'; g.stroke(); }, text: 'Kugel in den Honigtopf versenken', val: '500' },
        { draw: function (g) { ['#FDC506', '#FDC506', '#FDC506'].forEach(function (c, i) { g.beginPath(); g.arc(9 + i * 14, 23, 5, 0, TAU); g.fillStyle = c; g.fill(); }); }, text: 'Alle drei Bahnen oben: Multiplikator +1', val: '×' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Deine Website soll auch so abgehen? Lass uns reden.' },
    stats: function (s) {
      return s.bumps + ' Bumper-Treffer, ' + s.biene + (s.biene === 1 ? '-mal BIENE komplett' : '-mal BIENE komplett') + ', höchster Multiplikator ×' + s.mult + '.';
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
          table: buildTable(), flippers: fl, ball: null, balls: BALLS, score: 0, mult: 1, maxMult: 1,
          plunger: 0, charging: false, waiting: true, saveUntil: 0, bumps: 0, biene: 0, held: null, parts: [], drained: 0, hint: true
        };
      }
      function newBall() { st.ball = { x: 365, y: 655, vx: 0, vy: 0 }; st.waiting = true; st.plunger = 0; }

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

      function addScore(n) { st.score += n * st.mult; ctx.setScore(st.score); }
      function burst(x, y, colors, n, speed) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8); st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.3 + Math.random() * 0.4, size: 1.5 + Math.random() * 2.5, c: colors[i % colors.length] }); }
      }

      function step(dt) {
        var b = st.ball, T = st.table;
        /* Flipper drehen */
        st.flippers.forEach(function (f) {
          var target = f.side < 0 ? (f.up ? FL_UP : FL_REST) : (f.up ? Math.PI - FL_UP : Math.PI - FL_REST);
          var speed = f.up ? FL_SPEED_UP : FL_SPEED_DOWN, diff = target - f.a, dir = Math.sign(diff);
          var move = Math.min(Math.abs(diff), speed * dt);
          f.w = diff ? dir * speed : 0;
          if (Math.abs(diff) <= speed * dt) f.w = diff / dt;
          f.a += dir * move;
        });
        if (!b || st.held) return;
        if (st.waiting) { b.x = 365; b.y = 655 + st.plunger * 30; b.vx = 0; b.vy = 0; return; }
        b.vy += GRAV * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        T.walls.forEach(function (s) { collideSeg(b, s, BR); });
        T.posts.forEach(function (p) { collideCircle(b, p, BR + p.r, 0.5); });
        T.bumpers.forEach(function (bp) {
          var hit = collideCircle(b, bp, BR + bp.r, 0.6);
          if (hit) {
            b.vx += hit.nx * 700; b.vy += hit.ny * 700;
            bp.hit = 1; st.bumps++;
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
            tg.up = false; tg.hit = 1;
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
        /* Honigtopf-Mulde fängt langsame Kugeln */
        var sc = T.saucer, ds = Math.hypot(b.x - sc.x, b.y - sc.y);
        if (ds < sc.r && Math.hypot(b.vx, b.vy) < 700 && !st.saucerCool) {
          st.held = { until: st.t + 1100 }; b.x = sc.x; b.y = sc.y; b.vx = b.vy = 0;
          addScore(500);
          ctx.fx.boom(SX(sc.x), SY(sc.y), '#FF9F1A', '255,159,26', 0.8);
          ctx.fx.text(SX(sc.x), SY(sc.y) - 30 * k, 'Honigtopf! +' + 500 * st.mult, '#FFE680', 20);
          ctx.tone(330, 660, 0.25, 'triangle', 0.05);
        }
        var sp = Math.hypot(b.vx, b.vy);
        if (sp > MAXV) { b.vx *= MAXV / sp; b.vy *= MAXV / sp; }
        /* Zurück in die Abschussbahn gerollt: neu abschießen, ohne Kugel zu verlieren */
        if (b.x > 352 && b.y > 640 && b.vy > 0) { newBall(); st.hint = true; return; }
        /* Hängt die Kugel fest, gibt es einen kleinen Schubs */
        if (sp < 25 && b.y < 590) { st.still = (st.still || 0) + dt; if (st.still > 2.5) { b.vx = rnd(-200, 200); b.vy = -rnd(150, 300); st.still = 0; } } else st.still = 0;
        /* Kugel weg */
        if (b.y > TH + 30) drain();
      }
      function raiseMult() {
        if (st.mult >= 5) return;
        st.mult++; st.maxMult = Math.max(st.maxMult, st.mult);
        ctx.fx.banner('Multiplikator ×' + st.mult + '!', '#FF8AD8', 34);
        ctx.tone(660, 1320, 0.25, 'triangle', 0.05);
      }
      function drain() {
        if (st.t < st.saveUntil) {
          ctx.fx.banner('Gerettet!', '#7FD3FF');
          ctx.tone(500, 900, 0.2, 'triangle', 0.05);
          newBall(); st.saveUntil = 0;
          return;
        }
        st.balls--;
        ctx.fx.flash('255,74,61', 0.8); ctx.fx.shake(0.3, 8);
        ctx.tone(400, 80, 0.6, 'sawtooth', 0.05);
        if (st.balls <= 0) { ctx.fx.banner('Letzte Kugel weg!', '#FF7A6B'); st.ball = null; st.drained = st.t; return; }
        ctx.fx.banner('Kugel weg! Noch ' + st.balls, '#FF7A6B');
        st.mult = 1;
        newBall();
      }
      function launch() {
        if (!st.waiting) return;
        var p = st.plunger;
        st.waiting = false; st.charging = false;
        st.ball.vy = -(1050 + p * 1150); st.ball.vx = 0;
        st.saveUntil = st.t + SAVE_MS; st.hint = false;
        ctx.fx.ring(SX(365), SY(660), '#FFFFFF', 30 * k, 3, 300);
        ctx.tone(200, 800, 0.15, 'triangle', 0.05);
        st.plunger = 0;
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var pt = st.parts[q]; pt.t += dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 400 * dt; if (pt.t > pt.life) st.parts.splice(q, 1); }
        st.table.bumpers.forEach(function (bp) { bp.hit = Math.max(0, bp.hit - dt * 5); });
        if (st.drained) { if (st.t - st.drained > 1500) st.over = true; }
        /* Flipper-Eingaben */
        var L = keys.a || keys.A || keys.ArrowLeft || keys.Shift_L || touches.left, R = keys.d || keys.D || keys.ArrowRight || keys.Shift_R || touches.right;
        if (L && !st.flippers[0].up) ctx.tone(180, 140, 0.04, 'square', 0.02);
        if (R && !st.flippers[1].up) ctx.tone(180, 140, 0.04, 'square', 0.02);
        st.flippers[0].up = !!L && !st.waiting; st.flippers[1].up = !!R && !st.waiting;
        if (st.waiting && st.charging) st.plunger = Math.min(1, st.plunger + dt * 1.1);
        if (st.held && st.t >= st.held.until) {
          st.held = null; st.saucerCool = true;
          st.ball.vx = rnd(-450, -250); st.ball.vy = -rnd(500, 700);
          setTimeout(function () { st.saucerCool = false; }, 500);
        }
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
        x.fillText('HONIG', 200, 400); x.fillText('FLIPPER', 200, 446);
        x.restore();
        /* Abschussbahn */
        x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(350, 200, 30, 520);
        bg = c;
      }
      function line(s, color, w) { g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.bx, s.by); g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round'; g.stroke(); }
      function render() {
        if (!bg) paintBg();
        g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bg, 0, 0);
        g.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        var T = st.table;
        T.walls.forEach(function (s) {
          if (s.kind === 'sling') { var lit = st.slingHit === s && st.t - st.slingT < 150; line(s, lit ? '#FFFFFF' : '#FF8AD8', lit ? 7 : 5); }
          else line(s, '#FDC506', 4);
        });
        /* Schleudern ausfüllen */
        [[66, 462, 66, 538, 110, 568], [334, 462, 334, 538, 290, 568]].forEach(function (p) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[2], p[3]); g.lineTo(p[4], p[5]); g.closePath(); g.fillStyle = 'rgba(255,138,216,0.18)'; g.fill(); });
        T.posts.forEach(function (p) { g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); });
        T.lanes.forEach(function (ln) {
          g.beginPath(); g.arc(ln.x, 152, 6, 0, TAU); g.fillStyle = ln.lit ? '#FDC506' : 'rgba(253,197,6,0.2)'; g.fill();
          if (ln.lit) { var lg = g.createRadialGradient(ln.x, 152, 2, ln.x, 152, 18); lg.addColorStop(0, 'rgba(253,197,6,0.6)'); lg.addColorStop(1, 'rgba(253,197,6,0)'); g.fillStyle = lg; g.fillRect(ln.x - 18, 134, 36, 36); }
        });
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
        var sc = T.saucer;
        g.beginPath(); g.arc(sc.x, sc.y, sc.r, 0, TAU); g.fillStyle = '#1A0F04'; g.fill(); g.lineWidth = 3; g.strokeStyle = st.held ? '#FFE680' : '#FF9F1A'; g.stroke();
        g.fillStyle = 'rgba(255,159,26,0.8)'; g.font = '800 9px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('HONIG', sc.x, sc.y + sc.r + 10);
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
        /* Kugel */
        if (st.ball) {
          var b = st.ball;
          g.beginPath(); g.arc(b.x + 2, b.y + 3, BR, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
          var bgr = g.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, BR);
          bgr.addColorStop(0, '#FFFFFF'); bgr.addColorStop(0.4, '#D8DCE4'); bgr.addColorStop(1, '#6B7385');
          g.beginPath(); g.arc(b.x, b.y, BR, 0, TAU); g.fillStyle = bgr; g.fill();
          if (st.t < st.saveUntil && !st.waiting) { g.beginPath(); g.arc(b.x, b.y, BR + 4, 0, TAU); g.strokeStyle = 'rgba(127,211,255,0.6)'; g.lineWidth = 2; g.stroke(); }
        }
        st.parts.forEach(function (pt) { g.globalAlpha = Math.max(0, 1 - pt.t / pt.life); g.beginPath(); g.arc(pt.x, pt.y, pt.size, 0, TAU); g.fillStyle = pt.c; g.fill(); });
        g.globalAlpha = 1;
        /* Anzeige oben im Tisch */
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 22px Poppins, sans-serif'; g.lineWidth = 5; g.lineJoin = 'round'; g.strokeStyle = 'rgba(17,17,17,0.85)';
        var sTxt = String(st.score); g.strokeText(sTxt, 200, 62); g.fillStyle = '#FFFFFF'; g.fillText(sTxt, 200, 62);
        g.font = '700 11px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.75)';
        g.fillText('Kugel ' + Math.min(BALLS, BALLS - st.balls + 1) + '/' + BALLS + (st.mult > 1 ? '  ·  ×' + st.mult : ''), 200, 86);
        if (st.on && st.hint && st.waiting && !st.paused) {
          var txt = ctx.touch() ? 'Halten und loslassen schießt die Kugel ab' : 'Leertaste halten und loslassen';
          g.font = '700 12px Poppins, sans-serif';
          var w = g.measureText(txt).width + 22;
          rr(g, 200 - w / 2, 500, w, 26, 13); g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25; g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#fff'; g.fillText(txt, 200, 513); g.globalAlpha = 1;
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
      function finish() { stop(); render(); ctx.finish(st.score, { bumps: st.bumps, biene: st.biene, mult: st.maxMult }); }

      /* Touch: linke/rechte Hälfte = Flipper, beim Abschuss halten und loslassen */
      var pmap = {};
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        if (st.waiting) { pmap[e.pointerId] = 'plunge'; st.charging = true; return; }
        var side = local(e).x < cssW / 2 ? 'left' : 'right';
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
        _debug: function () { return { st: st, launch: launch, k: k, ox: ox, oy: oy }; }
      };
    }
  });
})();

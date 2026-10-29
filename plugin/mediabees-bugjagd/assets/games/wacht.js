/* Spiel 8: Wabenwacht (Space-Invaders-Prinzip) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, H = 600, PY = H - 56, LIVES = 3;
  var SHOT_SPEED = 720, SHOT_CD = 0.26, MAX_SHOTS = 3, DOUBLE_TIME = 9000;
  var art = MBArcade.art, rr = art.rrect;
  var TYPES = {
    hornet: { pts: 30, hp: 2, draw: function (g, w) { art.hornet(g, w); } },
    wasp: { pts: 20, hp: 1, draw: function (g, w) { art.wasp(g, w); } },
    red: { pts: 10, hp: 1, draw: function (g, w) { art.wasp(g, w, '#FF8A3D', '#2A1408'); } }
  };
  var ROWS = ['hornet', 'wasp', 'wasp', 'red', 'red'];
  var UFO_PTS = [100, 150, 200, 300];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function drawSting(g, x, y, up) {
    g.save(); g.translate(x, y); if (!up) g.rotate(Math.PI);
    var gr = g.createLinearGradient(0, -10, 0, 16);
    gr.addColorStop(0, up ? '#FFFFFF' : '#FFB0A0'); gr.addColorStop(1, up ? 'rgba(253,197,6,0)' : 'rgba(229,50,45,0)');
    g.fillStyle = gr; g.fillRect(-2, -2, 4, 18);
    g.beginPath(); g.moveTo(0, -11); g.lineTo(3.2, -1); g.lineTo(-3.2, -1); g.closePath();
    g.fillStyle = up ? '#FDC506' : '#E5322D'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
  function drawPower(g, x, y, t) {
    var p = 1 + Math.sin(t / 140) * 0.08;
    g.save(); g.translate(x, y); g.scale(p, p);
    var gl = g.createRadialGradient(0, 0, 3, 0, 0, 24);
    gl.addColorStop(0, 'rgba(253,197,6,0.6)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.fill();
    art.hex(g, 0, 0, 12, '#FDC506', '#111', 2);
    drawSting(g, -3.5, 2, true); drawSting(g, 3.5, 2, true);
    g.restore();
  }

  MBArcade.register({
    id: 'wacht',
    title: 'Wabenwacht',
    duration: 0,
    startText: 'Die Wespen wollen an unseren Honig! Halt sie mit deinen Stacheln auf, bevor sie unten ankommen. Hinter den Honigwaben kannst du in Deckung gehen.',
    help: {
      legendTitle: 'Gegner und Punkte',
      controls: [
        { icons: ['kbd:← →', 'kbd:A D'], text: 'Fliegen', kb: true },
        { icons: ['kbd:Leertaste'], text: 'Stachel schießen (gedrückt halten = Dauerfeuer)', kb: true },
        { icons: ['mouse-left'], text: 'Oder mit der Maus steuern, gedrückt halten zum Schießen', kb: true },
        { icons: ['swipe'], text: 'Finger auflegen und ziehen, die Biene schießt dabei von allein', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.translate(27, 25); g.scale(0.62, 0.62); art.hornet(g, 0.4); }, text: 'Hornisse, braucht zwei Treffer', val: '30' },
        { draw: function (g) { g.translate(28, 24); g.scale(0.66, 0.66); art.wasp(g, 0.4); }, text: 'Wespe', val: '20' },
        { draw: function (g) { g.translate(28, 24); g.scale(0.66, 0.66); art.wasp(g, 0.4, '#FF8A3D', '#2A1408'); }, text: 'Feuerwespe', val: '10' },
        { draw: function (g) { g.translate(28, 24); g.scale(0.66, 0.66); art.goldwasp(g, 0.4); }, text: 'Goldwespe, fliegt ab und zu oben vorbei', val: '100–300' },
        { draw: function (g) { drawPower(g, 23, 23, 0); }, text: 'Doppelstachel für ein paar Sekunden' }
      ]
    },
    cta: { path: 'webseiten-wartung/', text: 'Spam-Wespen und Hacker? Wir halten deine Website sauber.' },
    stats: function (s) {
      var t = 'Welle ' + s.wave + ' erreicht, ' + s.kills + (s.kills === 1 ? ' Wespe' : ' Wespen') + ' erwischt';
      return t + (s.gold ? ', ' + s.gold + (s.gold === 1 ? ' Goldwespe.' : ' Goldwespen.') : '.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 960, k = 1, dpr = 1, sky = null, raf = 0, idleRaf = 0;
      var keys = { l: false, r: false, fire: false }, ptr = null, mouseX = null;
      var st = fresh();

      function fresh() {
        return {
          on: false, paused: false, dead: false, deadT: 0, t: 0, last: 0,
          score: 0, lives: LIVES, wave: 0, kills: 0, gold: 0,
          px: W / 2, tilt: 0, cd: 0, inv: 0, double: 0,
          enemies: [], f: null, shots: [], bombs: [], bunkers: [], powers: [], parts: [], pops: [],
          bombT: 1.5, ufo: null, ufoT: rnd(14, 20), banner: null, shake: 0, flash: 0, flashC: '255,74,61', hint: true
        };
      }

      function grid() {
        /* Die Formation nimmt höchstens 70 % der Breite ein, damit sie Platz zum Wandern hat */
        var cols = Math.max(6, Math.min(10, Math.floor(W * 0.7 / 58)));
        var spx = Math.min(64, W * 0.7 / cols);
        return { cols: cols, spx: spx, spy: spx * 0.78, sc: spx / 64 };
      }

      function newWave() {
        st.wave++;
        var gr = grid(), list = [];
        ROWS.forEach(function (tp, r) {
          for (var c = 0; c < gr.cols; c++) list.push({ c: c, r: r, type: tp, hp: TYPES[tp].hp + (st.wave >= 4 && tp === 'wasp' ? 1 : 0), alive: true, hit: 0, wob: Math.random() * 10 });
        });
        st.enemies = list;
        var startY = 92 + Math.min(4, st.wave - 1) * 14;
        st.f = { x: (W - gr.cols * gr.spx) / 2 + gr.spx / 2, y: -ROWS.length * gr.spy - 20, ty: startY, dir: 1, g: gr, total: list.length };
        st.bombs = []; st.bombT = 1.6;
        st.banner = { text: 'Welle ' + st.wave, t0: st.t };
        if (st.wave === 1 || st.wave % 3 === 1) makeBunkers();
        ctx.tone(330, 660, 0.25, 'triangle', 0.05);
      }

      /* Honigwaben-Deckung aus kleinen Zellen */
      function makeBunkers() {
        var n = W > 760 ? 4 : W > 560 ? 3 : 2, cell = 9, cw = 7, ch = 4, bw = cw * cell;
        st.bunkers = [];
        for (var i = 0; i < n; i++) {
          var cx = W * (i + 1) / (n + 1), x0 = cx - bw / 2, y0 = PY - 92;
          for (var yy = 0; yy < ch; yy++) for (var xx = 0; xx < cw; xx++) {
            if (yy === 0 && (xx === 0 || xx === cw - 1)) continue;
            if (yy === ch - 1 && xx >= 2 && xx <= cw - 3) continue;
            st.bunkers.push({ x: x0 + xx * cell + (yy % 2 ? cell / 2 : 0), y: y0 + yy * cell, s: cell, hp: 3 });
          }
        }
      }

      function paintSky() {
        var c = document.createElement('canvas');
        c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d');
        x.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        var gr = x.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#07091A'); gr.addColorStop(0.7, '#141A33'); gr.addColorStop(1, '#2A1E33');
        x.fillStyle = gr; x.fillRect(0, 0, W, H);
        var r = art.rng(11);
        for (var i = 0; i < W / 7; i++) { x.globalAlpha = 0.2 + r() * 0.7; x.fillStyle = '#fff'; x.beginPath(); x.arc(r() * W, r() * H * 0.8, 0.5 + r() * 1.2, 0, TAU); x.fill(); }
        x.globalAlpha = 1;
        x.save(); x.globalAlpha = 0.55; art.skyline(x, 0, W, H - 8, '#161A30', art.rng(4), '#FDC506'); x.restore();
        x.fillStyle = '#0D0F1C'; x.fillRect(0, H - 22, W, 22);
        sky = c;
      }

      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
        var oldW = W;
        k = r.height / H; W = r.width / k;
        st.px = Math.max(20, Math.min(W - 20, st.px * W / oldW));
        if (st.f) { var gr = grid(); st.f.x = st.f.x * W / oldW; st.f.g = gr; }
        if (st.bunkers.length) st.bunkers.forEach(function (b) { b.x = b.x * W / oldW; });
        paintSky();
        render();
      }

      function epos(e) { var f = st.f; return { x: f.x + e.c * f.g.spx, y: f.y + e.r * f.g.spy + Math.sin(st.t / 300 + e.wob) * 2 }; }
      function pop(x, y, text, color, big) { st.pops.push({ x: x, y: y, text: text, color: color || '#FDC506', t0: st.t, big: !!big }); }
      function puff(x, y, colors, n, speed, grav) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.3 + Math.random() * 0.9);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.35 + Math.random() * 0.45, size: 1.5 + Math.random() * 3, c: colors[i % colors.length], g: grav || 0 });
        }
      }
      function shakeIt(v) { if (!ctx.reduce) st.shake = Math.max(st.shake, v); }
      function addScore(n) { st.score += n; ctx.setScore(st.score); }

      function fire() {
        if (st.dead || st.cd > 0 || !st.f) return;
        if (st.shots.length >= (st.t < st.double ? MAX_SHOTS * 2 : MAX_SHOTS)) return;
        st.cd = SHOT_CD;
        if (st.t < st.double) { st.shots.push({ x: st.px - 9, y: PY - 20 }); st.shots.push({ x: st.px + 9, y: PY - 20 }); }
        else st.shots.push({ x: st.px, y: PY - 22 });
        ctx.tone(880, 1320, 0.05, 'square', 0.02);
      }

      function hitBunker(x, y, r) {
        for (var i = 0; i < st.bunkers.length; i++) {
          var b = st.bunkers[i];
          if (x > b.x - r && x < b.x + b.s + r && y > b.y - r && y < b.y + b.s + r) {
            b.hp--;
            puff(b.x + b.s / 2, b.y + b.s / 2, ['#FDC506', '#C98A00', '#FFE680'], 4, 90, 300);
            if (b.hp <= 0) st.bunkers.splice(i, 1);
            return true;
          }
        }
        return false;
      }

      function killEnemy(e, p) {
        e.alive = false; st.kills++;
        var pts = TYPES[e.type].pts;
        addScore(pts);
        pop(p.x, p.y - 10, '+' + pts, e.type === 'hornet' ? '#FFE680' : '#FDC506');
        puff(p.x, p.y, e.type === 'red' ? ['#FF8A3D', '#2A1408', '#FFFFFF'] : e.type === 'hornet' ? ['#E8902A', '#2A1A10', '#C9A227'] : ['#FFD400', '#111', '#FFFFFF'], 14, 220, 200);
        shakeIt(0.06);
        ctx.tone(400 + Math.random() * 200, 90, 0.12, 'square', 0.04);
        if (Math.random() < 0.06 && st.t > st.double) st.powers.push({ x: p.x, y: p.y, vy: 120 });
        if (!st.enemies.some(function (x) { return x.alive; })) {
          var bonus = 100 * st.wave;
          addScore(bonus);
          st.flash = 0.5; st.flashC = '253,197,6';
          pop(W / 2, H * 0.42, 'Welle geschafft! +' + bonus, '#FDC506', true);
          ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.18, 'triangle', 0.06, 0.12);
          st.nextWave = st.t + 1400;
        }
      }

      function hurt() {
        if (st.t < st.inv || st.dead) return;
        st.lives--;
        st.inv = st.t + 1600;
        st.flash = 1; st.flashC = '255,74,61';
        shakeIt(0.35);
        puff(st.px, PY, ['#F7B500', '#3A2410', '#FFFFFF'], 24, 260, 200);
        ctx.tone(220, 60, 0.35, 'sawtooth', 0.06);
        if (st.lives <= 0) { st.dead = true; st.deadT = st.t; }
        else pop(st.px, PY - 40, st.lives === 1 ? 'Letzte Biene!' : 'Autsch!', '#FF7A6B');
      }

      function update(dt) {
        st.t += dt * 1000;
        if (st.nextWave && st.t >= st.nextWave) { st.nextWave = 0; newWave(); }
        var f = st.f;
        /* Biene steuern */
        if (!st.dead) {
          var before = st.px;
          if (keys.l) st.px -= 360 * dt;
          if (keys.r) st.px += 360 * dt;
          if (mouseX !== null && !keys.l && !keys.r) st.px += (mouseX - st.px) * Math.min(1, dt * 14);
          st.px = Math.max(22, Math.min(W - 22, st.px));
          st.tilt += ((st.px - before) / Math.max(dt, 0.001) / 900 - st.tilt) * Math.min(1, dt * 10);
          st.cd -= dt;
          if (keys.fire || ptr || (mouseX !== null && st.mouseDown)) fire();
        }
        /* Formation */
        if (f && !st.nextWave) {
          if (f.y < f.ty) f.y = Math.min(f.ty, f.y + 260 * dt);
          else {
            var alive = st.enemies.filter(function (e) { return e.alive; });
            var speed = (34 + st.wave * 6) * (1 + (1 - alive.length / f.total) * 2.6) * (W / 900 + 0.3);
            f.x += f.dir * speed * dt;
            var minX = 1e9, maxX = -1e9, maxY = 0;
            alive.forEach(function (e) { var p = epos(e); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
            var half = 24 * f.g.sc;
            if ((f.dir > 0 && maxX + half > W - 8) || (f.dir < 0 && minX - half < 8)) { f.dir *= -1; f.y += 16; f.ty = f.y; }
            if (maxY > PY - 40 && !st.dead) { st.lives = 1; st.inv = 0; hurt(); }
            /* Wespen schießen zurück */
            st.bombT -= dt;
            if (st.bombT <= 0 && alive.length && !st.dead) {
              st.bombT = Math.max(0.3, 1.15 - st.wave * 0.08) * rnd(0.6, 1.4);
              var cols = {};
              alive.forEach(function (e) { if (!cols[e.c] || cols[e.c].r < e.r) cols[e.c] = e; });
              var shooters = Object.keys(cols).map(function (c) { return cols[c]; });
              var near = shooters.filter(function (e) { return Math.abs(epos(e).x - st.px) < 140; });
              var pool = near.length && Math.random() < 0.45 ? near : shooters;
              var sh = pool[Math.floor(Math.random() * pool.length)];
              var sp = epos(sh);
              st.bombs.push({ x: sp.x, y: sp.y + 14, vy: 240 + st.wave * 18 });
            }
          }
        }
        /* Goldwespe oben */
        st.ufoT -= dt;
        if (!st.ufo && st.ufoT <= 0 && f && !st.dead) {
          var dir = Math.random() < 0.5 ? 1 : -1;
          st.ufo = { x: dir > 0 ? -40 : W + 40, y: 52, dir: dir };
          st.ufoT = rnd(16, 24);
          ctx.tone(1200, 1600, 0.2, 'triangle', 0.03);
        }
        if (st.ufo) { st.ufo.x += st.ufo.dir * 150 * dt; if (st.ufo.x < -60 || st.ufo.x > W + 60) st.ufo = null; }
        /* Stacheln der Biene */
        for (var i = st.shots.length - 1; i >= 0; i--) {
          var s = st.shots[i], gone = false;
          s.y -= SHOT_SPEED * dt;
          if (s.y < -20) gone = true;
          if (!gone && hitBunker(s.x, s.y, 2)) gone = true;
          if (!gone && st.ufo && Math.abs(s.x - st.ufo.x) < 26 && Math.abs(s.y - st.ufo.y) < 18) {
            var up = UFO_PTS[Math.floor(Math.random() * UFO_PTS.length)];
            addScore(up); st.gold++;
            pop(st.ufo.x, st.ufo.y + 20, '+' + up, '#FFE680', false);
            puff(st.ufo.x, st.ufo.y, ['#FFE680', '#FFFFFF', '#A87400'], 26, 260, 120);
            ctx.tone(660, 1320, 0.25, 'triangle', 0.06);
            shakeIt(0.12); st.ufo = null; gone = true;
          }
          if (!gone && f) {
            for (var j = 0; j < st.enemies.length; j++) {
              var e = st.enemies[j];
              if (!e.alive) continue;
              var p = epos(e), hw = 16 * f.g.sc, hh = 23 * f.g.sc;
              if (Math.abs(s.x - p.x) < hw && Math.abs(s.y - p.y) < hh) {
                e.hp--; e.hit = 1; gone = true;
                if (e.hp <= 0) killEnemy(e, p);
                else { puff(p.x, p.y, ['#FFFFFF', '#E8902A'], 5, 120); ctx.tone(300, 200, 0.05, 'square', 0.03); }
                break;
              }
            }
          }
          for (var b2 = st.bombs.length - 1; b2 >= 0 && !gone; b2--) {
            var bm = st.bombs[b2];
            if (Math.abs(bm.x - s.x) < 6 && Math.abs(bm.y - s.y) < 14) { st.bombs.splice(b2, 1); gone = true; puff(s.x, s.y, ['#FFFFFF', '#FDC506'], 6, 120); addScore(5); }
          }
          if (gone) st.shots.splice(i, 1);
        }
        /* Stacheln der Wespen */
        for (var q = st.bombs.length - 1; q >= 0; q--) {
          var bb = st.bombs[q];
          bb.y += bb.vy * dt;
          if (bb.y > H) { st.bombs.splice(q, 1); continue; }
          if (hitBunker(bb.x, bb.y, 2)) { st.bombs.splice(q, 1); continue; }
          if (!st.dead && Math.abs(bb.x - st.px) < 15 && Math.abs(bb.y - PY) < 14) { st.bombs.splice(q, 1); hurt(); }
        }
        /* Doppelstachel */
        for (var w = st.powers.length - 1; w >= 0; w--) {
          var pw = st.powers[w];
          pw.y += pw.vy * dt;
          if (pw.y > H) { st.powers.splice(w, 1); continue; }
          if (!st.dead && Math.abs(pw.x - st.px) < 26 && Math.abs(pw.y - PY) < 24) {
            st.powers.splice(w, 1);
            st.double = st.t + DOUBLE_TIME;
            pop(st.px, PY - 40, 'Doppelstachel!', '#FFE680');
            ctx.tone(520, 1040, 0.2, 'triangle', 0.06);
          }
        }
        st.enemies.forEach(function (e) { e.hit = Math.max(0, e.hit - dt * 6); });
        for (var pp = st.parts.length - 1; pp >= 0; pp--) {
          var pt = st.parts[pp];
          pt.t += dt; pt.vy += pt.g * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt;
          if (pt.t > pt.life) st.parts.splice(pp, 1);
        }
        st.pops = st.pops.filter(function (p) { return st.t - p.t0 < (p.big ? 1300 : 800); });
        st.shake = Math.max(0, st.shake - dt);
        st.flash = Math.max(0, st.flash - dt * 2.4);
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = 9 * Math.min(1, st.shake / 0.2); sx = (Math.random() * 2 - 1) * m * k * dpr; sy = (Math.random() * 2 - 1) * m * k * dpr; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#07091A'; g.fillRect(0, 0, cv.width, cv.height);
        if (sky) g.drawImage(sky, sx, sy);
        g.setTransform(k * dpr, 0, 0, k * dpr, sx, sy);
        /* Waben-Deckung */
        st.bunkers.forEach(function (b) {
          var a = b.hp / 3;
          art.hex(g, b.x + b.s / 2, b.y + b.s / 2, b.s * 0.62, a > 0.7 ? '#F2B705' : a > 0.4 ? '#C98A00' : '#7A5410', 'rgba(17,17,17,0.6)', 1);
        });
        /* Wespen */
        if (st.f) {
          var f = st.f, sc = f.g.sc * 0.7;
          st.enemies.forEach(function (e) {
            if (!e.alive) return;
            var p = epos(e);
            g.save(); g.translate(p.x, p.y); g.rotate(Math.PI / 2); g.scale(sc, sc);
            if (e.hit > 0) g.globalAlpha = 0.6 + 0.4 * Math.sin(e.hit * 20);
            TYPES[e.type].draw(g, Math.sin(st.t / 25 + e.wob));
            g.restore();
            if (e.type === 'hornet' && e.hp === 1) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(p.x - 6, p.y - 20 * f.g.sc, 12, 2); }
          });
        }
        if (st.ufo) {
          g.save(); g.translate(st.ufo.x, st.ufo.y); g.scale(st.ufo.dir * 0.8, 0.8);
          var gl = g.createRadialGradient(-8, 0, 4, -8, 0, 46); gl.addColorStop(0, 'rgba(255,230,128,0.45)'); gl.addColorStop(1, 'rgba(255,230,128,0)');
          g.fillStyle = gl; g.fillRect(-60, -50, 110, 100);
          art.goldwasp(g, Math.sin(st.t / 20));
          g.restore();
        }
        st.powers.forEach(function (p) { drawPower(g, p.x, p.y, st.t); });
        st.shots.forEach(function (s) { drawSting(g, s.x, s.y, true); });
        st.bombs.forEach(function (b) { drawSting(g, b.x, b.y, false); });
        /* Biene */
        if (!(st.dead && st.t - st.deadT > 200) && !(st.t < st.inv && Math.floor(st.t / 90) % 2)) {
          g.save(); g.translate(st.px, PY); g.rotate(-Math.PI / 2 + st.tilt * 0.5); g.scale(0.7, 0.7);
          art.bee(g, Math.sin(st.t / 1000 * 40));
          g.restore();
          if (st.t < st.double) {
            g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(st.t / 80);
            art.hex(g, st.px, PY, 30, 'rgba(253,197,6,0.12)', '#FDC506', 2); g.restore();
          }
        }
        st.parts.forEach(function (p) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life);
          g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fillStyle = p.c; g.fill();
        });
        g.globalAlpha = 1;
        st.pops.forEach(function (p) {
          var life = p.big ? 1300 : 800, age = (st.t - p.t0) / life;
          g.save(); g.translate(p.x, p.y - age * (p.big ? 24 : 36));
          var s = age < 0.15 ? 0.6 + age / 0.15 * 0.6 : 1.2 - Math.min(0.2, age - 0.15);
          g.scale(s, s);
          g.globalAlpha = age > 0.65 ? Math.max(0, 1 - (age - 0.65) / 0.35) : 1;
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
          g.font = '800 ' + (p.big ? Math.min(34, W / 13) : 18) + 'px Poppins, sans-serif';
          g.lineWidth = p.big ? 7 : 4; g.strokeStyle = 'rgba(17,17,17,0.9)'; g.strokeText(p.text, 0, 0);
          g.fillStyle = p.color; g.fillText(p.text, 0, 0);
          g.restore();
        });
        /* Leben und Welle, klein oben */
        if (st.on || st.score) {
          g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '700 14px Poppins, sans-serif';
          g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillText('Welle ' + Math.max(1, st.wave), 12, 20);
          for (var l = 0; l < LIVES; l++) {
            g.save(); g.translate(W - 22 - l * 30, 20); g.scale(0.38, 0.38);
            if (l >= st.lives) g.globalAlpha = 0.2;
            art.bee(g, 0.3);
            g.restore();
          }
          if (st.t < st.double) {
            var left = (st.double - st.t) / DOUBLE_TIME;
            rr(g, 12, 32, 70, 5, 2.5); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fill();
            rr(g, 12, 32, 70 * left, 5, 2.5); g.fillStyle = '#FDC506'; g.fill();
          }
        }
        if (st.banner) {
          var age = (st.t - st.banner.t0) / 1000;
          if (age > 1.6) st.banner = null;
          else {
            var e = age < 0.3 ? age / 0.3 : age > 1.2 ? 1 - (age - 1.2) / 0.4 : 1;
            g.save(); g.globalAlpha = Math.max(0, e);
            g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 40px Poppins, sans-serif'; g.lineJoin = 'round';
            g.lineWidth = 8; g.strokeStyle = 'rgba(17,17,17,0.9)'; g.strokeText(st.banner.text, W / 2, H * 0.45);
            g.fillStyle = '#FDC506'; g.fillText(st.banner.text, W / 2, H * 0.45);
            g.restore();
          }
        }
        if (st.on && st.hint && !st.paused && st.t < 7000) {
          var txt = ctx.touch() ? 'Finger auflegen und ziehen' : '← → fliegen, Leertaste schießen';
          g.font = '700 15px Poppins, sans-serif';
          var w = Math.min(W - 20, g.measureText(txt).width + 28), h = 32, cx = W / 2, cy = PY - 130;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, cx - w / 2, cy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.88)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cx, cy + 1, w - 14);
          g.globalAlpha = 1;
        }
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
        if (st.dead && st.t - st.deadT > 1400) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }
      function idle(now) {
        if (st.on) return;
        st.t = now;
        st.px = W / 2 + Math.sin(now / 900) * W * 0.25;
        render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() {
        st.on = false; ptr = null; mouseX = null; st.mouseDown = false;
        keys.l = keys.r = keys.fire = false;
        cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf);
      }
      function finish() {
        stop(); render();
        ctx.finish(st.score, { wave: st.wave, kills: st.kills, gold: st.gold });
      }

      /* Eingabe: Maus folgt direkt, Finger zieht die Biene relativ und schießt dabei */
      function lx(e) { var r = cv.getBoundingClientRect(); return (e.clientX - r.left) / k; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        e.preventDefault();
        st.hint = false;
        if (e.pointerType === 'mouse') { if (e.button !== 0) return; mouseX = lx(e); st.mouseDown = true; return; }
        ptr = { id: e.pointerId, x: lx(e), px: st.px };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse') { mouseX = lx(e); return; }
        if (!ptr || e.pointerId !== ptr.id) return;
        st.px = Math.max(22, Math.min(W - 22, ptr.px + (lx(e) - ptr.x) * 1.3));
      });
      cv.addEventListener('pointerup', function (e) { if (e.pointerType === 'mouse') st.mouseDown = false; else ptr = null; });
      cv.addEventListener('pointercancel', function () { ptr = null; st.mouseDown = false; });
      cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mouseX = null; st.mouseDown = false; } });
      function onKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.l = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = false;
        if (e.key === ' ') keys.fire = false;
      }
      document.addEventListener('keyup', onKeyUp);

      resize();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh();
          st.px = W / 2;
          st.on = true; st.last = performance.now();
          newWave();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on; ptr = null; st.mouseDown = false;
          keys.l = keys.r = keys.fire = false;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); st = fresh(); resize(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: resize,
        key: function (e) {
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keys.l = true; mouseX = null; st.hint = false; return true; }
          if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keys.r = true; mouseX = null; st.hint = false; return true; }
          if (e.key === ' ') { keys.fire = true; st.hint = false; return true; }
          return e.key === 'ArrowUp' || e.key === 'ArrowDown';
        },
        _debug: function () { return { st: st, W: W, epos: epos }; }
      };
    }
  });
})();

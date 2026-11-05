/* Spiel 14: Honigknaller (Bomberman-Prinzip) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, TOP = 40, FUSE = 2.2, FLAME = 0.5, LIVES = 3;
  var DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var P1KEYS = { w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right' };
  var P2KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function drawBomb(g, x, y, r, t, fuse) {
    var p = 1 + Math.sin(t / (fuse < 0.8 ? 40 : 110)) * 0.08;
    g.save(); g.translate(x, y); g.scale(p, p);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(r * 0.1, r * 0.8, r * 0.8, r * 0.25, 0, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, r * 0.1, r * 0.75, 0, TAU);
    g.fillStyle = fuse < 0.8 && Math.floor(t / 80) % 2 ? '#E5322D' : '#2A2018'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.1); g.strokeStyle = '#111'; g.stroke();
    g.fillStyle = '#FDC506'; g.fillRect(-r * 0.75, -r * 0.05, r * 1.5, r * 0.22);
    g.beginPath(); g.arc(-r * 0.28, -r * 0.2, r * 0.18, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fill();
    g.strokeStyle = '#7A4A1A'; g.lineWidth = Math.max(1.5, r * 0.12); g.beginPath(); g.moveTo(r * 0.3, -r * 0.55); g.quadraticCurveTo(r * 0.6, -r * 0.95, r * 0.85, -r * 0.8); g.stroke();
    var sp = r * (0.18 + Math.random() * 0.12);
    g.fillStyle = '#FFE680'; g.beginPath(); g.arc(r * 0.85, -r * 0.8, sp, 0, TAU); g.fill();
    g.fillStyle = '#FF7A1A'; g.beginPath(); g.arc(r * 0.85, -r * 0.8, sp * 0.5, 0, TAU); g.fill();
    g.restore();
  }
  function drawPower(g, k, x, y, r, t) {
    g.save(); g.translate(x, y + Math.sin(t / 200) * r * 0.08);
    rr(g, -r * 0.8, -r * 0.8, r * 1.6, r * 1.6, r * 0.3); g.fillStyle = k === 'bomb' ? '#2F6FD0' : k === 'fire' ? '#E5322D' : '#5CC46A'; g.fill();
    g.lineWidth = Math.max(1.5, r * 0.1); g.strokeStyle = '#FDC506'; g.stroke();
    if (k === 'bomb') drawBomb(g, 0, 0, r * 0.55, 0, 2);
    else if (k === 'fire') { g.beginPath(); g.moveTo(0, -r * 0.55); g.quadraticCurveTo(r * 0.55, 0, 0, r * 0.55); g.quadraticCurveTo(-r * 0.55, 0, 0, -r * 0.55); g.fillStyle = '#FFD24A'; g.fill(); }
    else { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(-r * 0.2, -r * 0.05, r * 0.42, r * 0.22, -0.5, 0, TAU); g.fill(); g.beginPath(); g.ellipse(r * 0.2, -r * 0.05, r * 0.42, r * 0.22, 0.5, 0, TAU); g.fill(); }
    g.restore();
  }

  MBArcade.register({
    id: 'knaller',
    title: 'Honigknaller',
    duration: 0,
    multiTouch: true,
    startText: 'Sprengt euch durch den Stock! Allein räumst du Level für Level die Wespen ab. Am PC könnt ihr auch zu zweit gegeneinander antreten (ohne Rangliste).',
    help: {
      legendTitle: 'Punkte und Extras',
      controls: [
        { icons: ['kbd:WASD', 'kbd:Pfeile'], text: 'Laufen (allein geht beides)', kb: true },
        { icons: ['kbd:Leertaste', 'kbd:Enter'], text: 'Honigbombe legen', kb: true },
        { icons: ['kbd:1', 'kbd:2'], text: 'Am Start: 1 = allein, 2 = zu zweit (Biene: WASD + Leertaste, Hummel: Pfeile + Enter)', kb: true },
        { icons: ['tap'], text: 'Steuerkreuz unten links, Bombenknopf unten rechts', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.translate(26, 24); g.scale(0.6, 0.6); art.wasp(g, 0.4); }, text: 'Wespe erwischt (mehrere auf einmal zählen doppelt)', val: '100' },
        { draw: function (g) { g.translate(26, 24); g.scale(0.55, 0.55); art.hornet(g, 0.4); }, text: 'Hornisse, schneller und schlauer', val: '200' },
        { draw: function (g) { drawPower(g, 'bomb', 23, 23, 15, 0); }, text: 'Extra: eine Bombe mehr' },
        { draw: function (g) { drawPower(g, 'fire', 23, 23, 15, 0); }, text: 'Extra: größere Reichweite' },
        { draw: function (g) { drawPower(g, 'speed', 23, 23, 15, 0); }, text: 'Extra: schneller laufen' }
      ]
    },
    cta: { path: 'unsere-leistungen/', text: 'Wir räumen auch auf deiner Website mit alten Baustellen auf. Sprich uns an.' },
    stats: function (s) {
      if (s.duo) return 'Zu zweit gespielt, das zählt nicht für die Rangliste. Revanche?';
      return 'Level ' + s.level + ' erreicht, ' + s.kills + (s.kills === 1 ? ' Wespe' : ' Wespen') + ' erwischt, ' + s.blocks + ' Wachsblöcke gesprengt.';
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var cssW = 0, cssH = 0, dpr = 1, C = 32, ox = 0, oy = 0, CTRL = 0, COLS = 15, ROWS = 11;
      var raf = 0, idleRaf = 0, held = {}, pads = {};
      var st = fresh(false);

      function fresh(duo) {
        return {
          on: false, paused: false, over: false, t: 0, last: 0, duo: duo, menu: false,
          level: 1, score: 0, kills: 0, blocksN: 0, lives: LIVES,
          grid: [], bombs: [], flames: [], powers: [], enemies: [], players: [], parts: [],
          wins: [0, 0], roundEnd: 0, levelEnd: 0, hint: true, chain: 0
        };
      }
      function shape() {
        var r = cv.getBoundingClientRect();
        var portrait = r.height > r.width * 1.05;
        COLS = portrait ? 11 : 15; ROWS = portrait ? 13 : 11;
      }
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        CTRL = ctx.touch() ? Math.min(170, cssH * 0.27) : 0;
        C = Math.floor(Math.min((cssW - 12) / COLS, (cssH - TOP - CTRL - 10) / ROWS) * 4) / 4;
        ox = (cssW - C * COLS) / 2; oy = TOP + (cssH - TOP - CTRL - C * ROWS) / 2;
        var pr = Math.min(CTRL * 0.42, cssW * 0.2);
        pads = { dx: 16 + pr, dy: cssH - CTRL / 2, dr: pr, bx: cssW - 16 - pr * 0.8, by: cssH - CTRL / 2, br: pr * 0.8 };
      }
      function px(x) { return ox + (x + 0.5) * C; }
      function py(y) { return oy + (y + 0.5) * C; }

      /* Spielfeld: Rand und Säulen fest, Wachsblöcke zufällig, Startecken frei */
      function buildLevel() {
        st.grid = []; st.bombs = []; st.flames = []; st.powers = []; st.enemies = [];
        var dens = Math.min(0.72, 0.5 + st.level * 0.03);
        var safe = function (x, y) { return (x + y <= 3 && x <= 2 && y <= 2) || (st.duo && x >= COLS - 3 && y >= ROWS - 3 && (COLS - 1 - x) + (ROWS - 1 - y) <= 3); };
        for (var y = 0; y < ROWS; y++) {
          var row = [];
          for (var x = 0; x < COLS; x++) {
            if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1 || (x % 2 === 0 && y % 2 === 0)) row.push(2);
            else if (!safe(x, y) && Math.random() < dens) row.push(1);
            else row.push(0);
          }
          st.grid.push(row);
        }
        if (!st.duo) {
          var nW = 2 + st.level, nH = Math.floor(st.level / 2), free = [];
          for (var yy = 1; yy < ROWS - 1; yy++) for (var xx = 1; xx < COLS - 1; xx++) if (!st.grid[yy][xx] && xx + yy > 6) free.push([xx, yy]);
          free.sort(function () { return Math.random() - 0.5; });
          for (var i = 0; i < nW + nH && free.length; i++) {
            var f = free.pop();
            st.enemies.push({ x: f[0], y: f[1], tx: f[0], ty: f[1], hornet: i >= nW, dir: [0, 0], dead: 0, bob: rnd(0, 6) });
          }
        }
      }
      function newPlayer(n) {
        var x = n ? COLS - 2 : 1, y = n ? ROWS - 2 : 1;
        return { n: n, x: x, y: y, tx: x, ty: y, sx: x, sy: y, dir: [0, 0], face: n ? -1 : 1, bombs: 1, range: 2, speed: 3.6, inv: st.t + 1500, dead: 0 };
      }
      function cell(x, y) { return y < 0 || y >= ROWS || x < 0 || x >= COLS ? 2 : st.grid[y][x]; }
      function bombAt(x, y) { for (var i = 0; i < st.bombs.length; i++) if (st.bombs[i].x === x && st.bombs[i].y === y) return st.bombs[i]; return null; }
      function free(x, y) { return cell(x, y) === 0 && !bombAt(x, y); }

      function startGame(duo) {
        st.duo = duo; st.menu = false;
        shape(); layout();
        st.players = duo ? [newPlayer(0), newPlayer(1)] : [newPlayer(0)];
        buildLevel();
        st.levelStart = st.t;
        ctx.fx.banner(duo ? 'Biene gegen Hummel!' : 'Level 1', '#FDC506', 34);
        ctx.tone(330, 660, 0.25, 'triangle', 0.05);
      }

      /* Bewegung von Zelle zu Zelle */
      function stepEntity(e, speed, dt, choose) {
        var at = e.x === e.tx && e.y === e.ty;
        if (at) { choose(e); if (e.x === e.tx && e.y === e.ty) return; }
        var dx = e.tx - e.x, dy = e.ty - e.y, d = Math.abs(dx) + Math.abs(dy), m = Math.min(d, speed * dt);
        e.x += Math.sign(dx) * m; e.y += Math.sign(dy) * m;
        if (Math.abs(e.tx - e.x) < 1e-6) e.x = e.tx;
        if (Math.abs(e.ty - e.y) < 1e-6) e.y = e.ty;
      }
      function wanted(p) {
        if (st.duo) {
          var map = p.n ? P2KEYS : P1KEYS, k;
          for (k in map) if (held[k]) return DIRS[map[k]];
          return null;
        }
        if (held.pad) return DIRS[held.pad];
        var all = Object.assign({}, P1KEYS, P2KEYS);
        for (var k2 in all) if (held[k2]) return DIRS[all[k2]];
        return null;
      }
      function choosePlayer(p) {
        var w = wanted(p);
        if (!w) return;
        if (w[0]) p.face = w[0];
        if (free(p.x + w[0], p.y + w[1])) { p.tx = p.x + w[0]; p.ty = p.y + w[1]; }
      }
      function chooseEnemy(e) {
        var opts = [];
        ['up', 'down', 'left', 'right'].forEach(function (k) { var d = DIRS[k]; if (free(e.x + d[0], e.y + d[1])) opts.push(d); });
        if (!opts.length) return;
        var p = st.players[0], pick = null;
        var smart = e.hornet ? 0.7 : 0.2 + st.level * 0.03;
        if (p && !p.dead && Math.abs(p.x - e.x) + Math.abs(p.y - e.y) < 8 && Math.random() < smart) {
          var best = 1e9;
          opts.forEach(function (d) { var dd = Math.abs(p.x - e.x - d[0]) + Math.abs(p.y - e.y - d[1]); if (dd < best) { best = dd; pick = d; } });
        }
        if (!pick) {
          var straight = opts.filter(function (d) { return d[0] === e.dir[0] && d[1] === e.dir[1]; });
          var noBack = opts.filter(function (d) { return !(d[0] === -e.dir[0] && d[1] === -e.dir[1]); });
          pick = straight.length && Math.random() < 0.7 ? straight[0] : (noBack.length ? noBack : opts)[Math.floor(Math.random() * (noBack.length || opts.length))];
        }
        e.dir = pick; e.tx = e.x + pick[0]; e.ty = e.y + pick[1];
        if (pick[0]) e.face = pick[0];
      }

      function placeBomb(p) {
        if (!p || p.dead || st.menu || st.roundEnd || st.levelEnd) return;
        var x = Math.round(p.x), y = Math.round(p.y);
        var mine = st.bombs.filter(function (b) { return b.owner === p; }).length;
        if (mine >= p.bombs || bombAt(x, y)) { ctx.tone(160, 140, 0.05, 'square', 0.02); return; }
        st.bombs.push({ x: x, y: y, t: 0, owner: p, range: p.range });
        st.hint = false;
        ctx.tone(300, 200, 0.06, 'square', 0.03);
      }
      function explode(b) {
        st.bombs.splice(st.bombs.indexOf(b), 1);
        var cells = [[b.x, b.y]];
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          for (var i = 1; i <= b.range; i++) {
            var x = b.x + d[0] * i, y = b.y + d[1] * i, c = cell(x, y);
            if (c === 2) break;
            cells.push([x, y]);
            if (c === 1) { st.grid[y][x] = 0; crumble(x, y); break; }
            var other = bombAt(x, y); if (other) { other.t = FUSE - 0.05; break; }
          }
        });
        cells.forEach(function (c) { st.flames.push({ x: c[0], y: c[1], t: 0, cx: b.x, cy: b.y }); st.powers = st.powers.filter(function (pw) { return pw.protect || !(pw.x === c[0] && pw.y === c[1]); }); });
        ctx.fx.ring(px(b.x), py(b.y), '#FF9F1A', C * (b.range + 1), 6, 450);
        ctx.fx.shake(0.18, 4 + b.range);
        ctx.fx.flash('255,159,26', 0.25);
        ctx.tone(140, 40, 0.35, 'sawtooth', 0.06); ctx.tone(90, 30, 0.3, 'square', 0.04, 0.03);
        for (var k = 0; k < (ctx.reduce ? 6 : 14); k++) st.parts.push({ x: px(b.x), y: py(b.y), vx: rnd(-240, 240), vy: rnd(-240, 240), t: 0, life: rnd(0.3, 0.6), size: rnd(2, 5), c: k % 2 ? '#FFD24A' : '#FF7A1A' });
      }
      function crumble(x, y) {
        st.blocksN++;
        if (!st.duo) { st.score += 10; ctx.setScore(st.score); }
        for (var k = 0; k < (ctx.reduce ? 4 : 8); k++) st.parts.push({ x: px(x), y: py(y), vx: rnd(-150, 150), vy: rnd(-200, 50), t: 0, life: rnd(0.4, 0.7), size: rnd(2, 4), c: k % 2 ? '#E9A800' : '#C98A00', grav: 500 });
        if (Math.random() < 0.28) {
          var r = Math.random();
          st.powers.push({ x: x, y: y, k: r < 0.4 ? 'bomb' : r < 0.8 ? 'fire' : 'speed', protect: true });
        }
      }
      function inFlame(x, y) { for (var i = 0; i < st.flames.length; i++) if (st.flames[i].x === x && st.flames[i].y === y) return true; return false; }

      function hurtPlayer(p) {
        if (p.dead || st.t < p.inv) return;
        p.dead = st.t;
        ctx.fx.boom(px(p.x), py(p.y), '#FF5A4A', '255,74,61', 1);
        ctx.fx.text(px(p.x), py(p.y) - C, st.duo ? (p.n ? 'Hummel erwischt!' : 'Biene erwischt!') : 'Autsch!', '#FF7A6B', 24);
        ctx.tone(440, 60, 0.6, 'sawtooth', 0.06);
        if (st.duo) {
          setTimeout(function () {
            if (!st.on || st.roundEnd) return;
            var alive = st.players.filter(function (q) { return !q.dead; });
            st.roundEnd = st.t + 1600;
            if (alive.length === 1) { st.wins[alive[0].n]++; ctx.fx.banner((alive[0].n ? 'Hummel' : 'Biene') + ' gewinnt die Runde!', alive[0].n ? '#FF8AD8' : '#FDC506'); }
            else ctx.fx.banner('Unentschieden!', '#FFFFFF');
          }, 400);
        } else {
          st.lives--;
          st.respawn = st.t + 1400;
        }
      }
      function killEnemy(e) {
        e.dead = st.t;
        st.kills++;
        var pts = e.hornet ? 200 : 100;
        st.chain = (st.t - (st.lastKill || -9999) < 120) ? st.chain + 1 : 1;
        st.lastKill = st.t;
        pts *= st.chain;
        st.score += pts; ctx.setScore(st.score);
        ctx.fx.ring(px(e.x), py(e.y), e.hornet ? '#FFE680' : '#FFFFFF', C * 1.6, 5, 420);
        ctx.fx.text(px(e.x), py(e.y) - C * 0.6, '+' + pts + (st.chain > 1 ? ' ×' + st.chain : ''), st.chain > 1 ? '#FFE680' : '#FDC506', st.chain > 1 ? 26 : 20);
        if (st.chain >= 2) { ctx.fx.flash('253,197,6', 0.4); ctx.fx.sparkle(px(e.x), py(e.y), null, 14, 220); }
        ctx.tone(500, 1000, 0.12, 'triangle', 0.05);
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var pt = st.parts[q]; pt.t += dt; pt.vy += (pt.grav || 0) * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vx *= 0.95; pt.vy *= 0.95; if (pt.t > pt.life) st.parts.splice(q, 1); }
        if (st.menu) return;
        /* Runden- und Levelwechsel */
        if (st.roundEnd && st.t >= st.roundEnd) {
          st.roundEnd = 0;
          if (st.wins[0] >= 2 || st.wins[1] >= 2) { st.over = true; return; }
          st.players = [newPlayer(0), newPlayer(1)]; buildLevel();
          ctx.fx.banner('Runde ' + (st.wins[0] + st.wins[1] + 1), '#FFFFFF');
        }
        if (st.levelEnd && st.t >= st.levelEnd) {
          st.levelEnd = 0; st.level++;
          var keep = st.players[0];
          st.players = [newPlayer(0)]; st.players[0].bombs = keep.bombs; st.players[0].range = keep.range; st.players[0].speed = keep.speed;
          buildLevel();
          ctx.fx.banner('Level ' + st.level, '#FDC506', 36); ctx.fx.flash('255,255,255', 0.5);
        }
        if (st.respawn && st.t >= st.respawn) {
          st.respawn = 0;
          if (st.lives <= 0) { st.over = true; return; }
          var old = st.players[0], np = newPlayer(0);
          np.bombs = old.bombs; np.range = Math.max(2, old.range - 1); np.speed = old.speed; np.inv = st.t + 2500;
          st.players[0] = np;
          [[1, 1], [2, 1], [1, 2]].forEach(function (c) { if (st.grid[c[1]][c[0]] === 1) st.grid[c[1]][c[0]] = 0; });
          st.enemies.forEach(function (e) { if (!e.dead && Math.abs(e.x - 1) + Math.abs(e.y - 1) < 4) { st.grid[ROWS - 2][COLS - 2] = 0; e.x = e.tx = COLS - 2; e.y = e.ty = ROWS - 2; } });
        }
        /* Spieler */
        st.players.forEach(function (p) {
          if (p.dead) return;
          stepEntity(p, p.speed, dt, choosePlayer);
          var cx = Math.round(p.x), cy = Math.round(p.y);
          for (var i = st.powers.length - 1; i >= 0; i--) {
            var pw = st.powers[i];
            if (pw.x === cx && pw.y === cy && !pw.protect) {
              st.powers.splice(i, 1);
              if (pw.k === 'bomb') p.bombs = Math.min(6, p.bombs + 1);
              else if (pw.k === 'fire') p.range = Math.min(8, p.range + 1);
              else p.speed = Math.min(6, p.speed + 0.5);
              if (!st.duo) { st.score += 50; ctx.setScore(st.score); }
              ctx.fx.ring(px(cx), py(cy), '#FDC506', C * 1.4, 4, 380); ctx.fx.sparkle(px(cx), py(cy), null, 10, 160);
              ctx.fx.text(px(cx), py(cy) - C * 0.7, pw.k === 'bomb' ? '+1 Bombe' : pw.k === 'fire' ? 'Mehr Wumms!' : 'Schneller!', '#FFE680', 18);
              ctx.tone(660, 1320, 0.15, 'triangle', 0.05);
            }
          }
          if (inFlame(cx, cy)) hurtPlayer(p);
        });
        /* Wespen */
        st.enemies.forEach(function (e) {
          if (e.dead) return;
          stepEntity(e, e.hornet ? 3 + st.level * 0.1 : 2 + st.level * 0.08, dt, chooseEnemy);
          var ex = Math.round(e.x), ey = Math.round(e.y);
          if (inFlame(ex, ey)) { killEnemy(e); return; }
          st.players.forEach(function (p) { if (!p.dead && Math.abs(p.x - e.x) + Math.abs(p.y - e.y) < 0.7) hurtPlayer(p); });
        });
        st.enemies = st.enemies.filter(function (e) { return !e.dead || st.t - e.dead < 500; });
        if (!st.duo && !st.levelEnd && !st.respawn && st.enemies.length && st.enemies.every(function (e) { return e.dead; })) {
          var bonus = 500 * st.level;
          st.score += bonus; ctx.setScore(st.score);
          st.levelEnd = st.t + 1800;
          ctx.fx.banner('Stock gesäubert! +' + bonus, '#FDC506', 32); ctx.fx.flash('253,197,6', 0.8); ctx.fx.shake(0.3, 8);
          ctx.fx.sparkle(cssW / 2, cssH * 0.4, ['#FDC506', '#FFE680', '#FFFFFF', '#FF8AD8'], 36, 340);
          ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.18, 'triangle', 0.06, 0.12);
        }
        /* Bomben und Flammen */
        st.bombs.slice().forEach(function (b) { b.t += dt; if (b.t >= FUSE) explode(b); });
        st.flames = st.flames.filter(function (f) { f.t += dt; return f.t < FLAME; });
        if (!st.flames.length) st.powers.forEach(function (pw) { pw.protect = false; });
      }

      /* Zeichnen */
      function render() {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.fillStyle = '#14100A'; g.fillRect(0, 0, cssW, cssH);
        if (st.grid.length) {
          for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
            var c = st.grid[y][x], X = ox + x * C, Y = oy + y * C;
            if (c === 2) {
              g.fillStyle = '#3A3226'; g.fillRect(X, Y, C + 0.5, C + 0.5);
              art.hex(g, X + C / 2, Y + C / 2, C * 0.42, '#4A4030', 'rgba(0,0,0,0.35)', 1.5);
              g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(X, Y, C, C * 0.12);
            } else {
              g.fillStyle = (x + y) % 2 ? '#2A2312' : '#2E2614'; g.fillRect(X, Y, C + 0.5, C + 0.5);
              if (c === 1) {
                rr(g, X + C * 0.06, Y + C * 0.06, C * 0.88, C * 0.88, C * 0.12); g.fillStyle = '#E9A800'; g.fill();
                g.lineWidth = Math.max(1, C * 0.05); g.strokeStyle = '#7A5410'; g.stroke();
                art.hex(g, X + C * 0.35, Y + C * 0.38, C * 0.16, '#FDC506', 'rgba(122,84,16,0.6)', 1);
                art.hex(g, X + C * 0.65, Y + C * 0.38, C * 0.16, '#FDC506', 'rgba(122,84,16,0.6)', 1);
                art.hex(g, X + C * 0.5, Y + C * 0.66, C * 0.16, '#FDC506', 'rgba(122,84,16,0.6)', 1);
              }
            }
          }
          st.powers.forEach(function (pw) { if (!pw.protect) drawPower(g, pw.k, px(pw.x), py(pw.y), C * 0.42, st.t); });
          st.bombs.forEach(function (b) { drawBomb(g, px(b.x), py(b.y), C * 0.42, st.t, FUSE - b.t); });
          st.flames.forEach(function (f) {
            var a = 1 - f.t / FLAME, X = px(f.x), Y = py(f.y), s = C * (0.45 + 0.1 * Math.sin(st.t / 30 + f.x));
            var gr = g.createRadialGradient(X, Y, 2, X, Y, s * 1.3);
            gr.addColorStop(0, 'rgba(255,246,214,' + a + ')'); gr.addColorStop(0.45, 'rgba(255,210,74,' + a + ')'); gr.addColorStop(1, 'rgba(255,90,26,0)');
            g.fillStyle = gr; g.fillRect(X - s * 1.3, Y - s * 1.3, s * 2.6, s * 2.6);
          });
          st.enemies.forEach(function (e) {
            g.save(); g.translate(px(e.x), py(e.y) + Math.sin(st.t / 150 + e.bob) * C * 0.05);
            if (e.dead) { var d = (st.t - e.dead) / 500; g.rotate(d * 6); g.scale(1 - d, 1 - d); }
            if ((e.face || 1) < 0) g.scale(-1, 1);
            g.scale(C / 50, C / 50);
            if (e.hornet) art.hornet(g, Math.sin(st.t / 25)); else art.wasp(g, Math.sin(st.t / 25));
            g.restore();
          });
          st.players.forEach(function (p) {
            if (p.dead && st.t - p.dead > 900) return;
            g.save(); g.translate(px(p.x), py(p.y));
            if (p.dead) { var d2 = (st.t - p.dead) / 900; g.rotate(d2 * 8); g.scale(1 - d2, 1 - d2); }
            else if (st.t < p.inv && Math.floor(st.t / 100) % 2) g.globalAlpha = 0.4;
            if (p.face < 0) g.scale(-1, 1);
            g.scale(C / 44, C / 44);
            if (p.n) art.bumble(g, Math.sin(st.t / 25)); else art.bee(g, Math.sin(st.t / 25));
            g.restore();
          });
        }
        st.parts.forEach(function (pt) { g.globalAlpha = Math.max(0, 1 - pt.t / pt.life); g.beginPath(); g.arc(pt.x, pt.y, pt.size, 0, TAU); g.fillStyle = pt.c; g.fill(); });
        g.globalAlpha = 1;
        /* Leiste oben */
        g.fillStyle = '#151515'; g.fillRect(0, 0, cssW, TOP);
        g.textBaseline = 'middle'; g.font = '700 14px Poppins, sans-serif';
        if (st.duo) {
          g.textAlign = 'left'; g.fillStyle = '#FDC506'; g.fillText('Biene ' + st.wins[0], 14, TOP / 2);
          g.textAlign = 'right'; g.fillStyle = '#FF8AD8'; g.fillText(st.wins[1] + ' Hummel', cssW - 14, TOP / 2);
          g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillText('Wer zuerst 2 Runden gewinnt', cssW / 2, TOP / 2, cssW * 0.5);
        } else {
          g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText('Level ' + st.level, 14, TOP / 2);
          var p0 = st.players[0];
          if (p0) {
            g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = '600 12px Poppins, sans-serif';
            g.fillText('Bomben ' + p0.bombs + ' · Reichweite ' + p0.range, 90, TOP / 2, cssW - 200);
          }
          for (var l = 0; l < LIVES; l++) {
            g.save(); g.translate(cssW - 22 - l * 28, TOP / 2); g.scale(0.34, 0.34);
            if (l >= st.lives) g.globalAlpha = 0.2;
            art.bee(g, 0.3); g.restore();
          }
        }
        /* Steuerkreuz und Bombenknopf auf dem Handy */
        if (CTRL && st.on && !st.duo) {
          g.fillStyle = '#101010'; g.fillRect(0, cssH - CTRL, cssW, CTRL);
          g.beginPath(); g.arc(pads.dx, pads.dy, pads.dr, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fill();
          g.lineWidth = 2; g.strokeStyle = 'rgba(253,197,6,0.5)'; g.stroke();
          ['up', 'down', 'left', 'right'].forEach(function (k) {
            var d = DIRS[k], ax = pads.dx + d[0] * pads.dr * 0.6, ay = pads.dy + d[1] * pads.dr * 0.6, on = held.pad === k;
            g.save(); g.translate(ax, ay); g.rotate(Math.atan2(d[1], d[0]));
            g.beginPath(); g.moveTo(pads.dr * 0.22, 0); g.lineTo(-pads.dr * 0.12, -pads.dr * 0.2); g.lineTo(-pads.dr * 0.12, pads.dr * 0.2); g.closePath();
            g.fillStyle = on ? '#FDC506' : 'rgba(255,255,255,0.6)'; g.fill(); g.restore();
          });
          g.beginPath(); g.arc(pads.bx, pads.by, pads.br, 0, TAU); g.fillStyle = held.bombBtn ? '#FFE680' : '#FDC506'; g.fill();
          g.lineWidth = 3; g.strokeStyle = '#111'; g.stroke();
          drawBomb(g, pads.bx, pads.by + pads.br * 0.05, pads.br * 0.45, st.t, 2);
        }
        /* Auswahl allein / zu zweit (nur am PC) */
        if (st.menu) {
          g.fillStyle = 'rgba(10,10,10,0.85)'; g.fillRect(0, 0, cssW, cssH);
          g.textAlign = 'center'; g.fillStyle = '#FDC506'; g.font = '900 ' + Math.min(30, cssW / 14) + 'px Poppins, sans-serif';
          g.fillText('Wie wollt ihr spielen?', cssW / 2, cssH * 0.3);
          menuButtons().forEach(function (b) {
            rr(g, b.x, b.y, b.w, b.h, 16); g.fillStyle = b.main ? '#FDC506' : '#262626'; g.fill();
            g.lineWidth = 2; g.strokeStyle = b.main ? '#FDC506' : '#FFFFFF'; g.stroke();
            g.fillStyle = b.main ? '#111' : '#FFF'; g.font = '800 17px Poppins, sans-serif'; g.fillText(b.label, b.x + b.w / 2, b.y + b.h * 0.38, b.w - 16);
            g.font = '600 12px Poppins, sans-serif'; g.fillStyle = b.main ? 'rgba(17,17,17,0.7)' : 'rgba(255,255,255,0.65)'; g.fillText(b.sub, b.x + b.w / 2, b.y + b.h * 0.7, b.w - 16);
          });
        } else if (st.on && st.hint && !st.paused && !st.duo && st.grid.length) {
          var txt = ctx.touch() ? 'Steuerkreuz laufen, Knopf legt Bombe' : 'WASD laufen, Leertaste legt Bombe';
          g.font = '700 14px Poppins, sans-serif'; g.textAlign = 'center';
          var w = Math.min(cssW - 20, g.measureText(txt).width + 26), h = 30, hx = cssW / 2, hy = oy + C * ROWS - 24;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, hx - w / 2, hy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.9)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.fillText(txt, hx, hy + 1, w - 14);
          g.globalAlpha = 1;
        }
      }
      function menuButtons() {
        var w = Math.min(260, cssW * 0.4), h = 76, y = cssH * 0.42;
        return [
          { k: 1, label: '1 · Allein', sub: 'gegen Wespen, mit Rangliste', x: cssW / 2 - w - 10, y: y, w: w, h: h, main: true },
          { k: 2, label: '2 · Zu zweit', sub: 'Biene gegen Hummel, ohne Rangliste', x: cssW / 2 + 10, y: y, w: w, h: h }
        ];
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
        if (!st.grid.length) { shape(); layout(); st.players = [newPlayer(0)]; buildLevel(); }
        render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() { st.on = false; held = {}; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() {
        stop(); render();
        if (st.duo) {
          var res = Math.max(st.wins[0], st.wins[1]) + ':' + Math.min(st.wins[0], st.wins[1]);
          var winner = st.wins[0] === st.wins[1] ? '' : st.wins[0] > st.wins[1] ? 'Die Biene' : 'Die Hummel';
          ctx.finish(0, { duo: true, winner: winner, res: res, headline: winner ? winner + ' gewinnt!' : 'Unentschieden!', line: 'Endstand ' + res + '.' });
        } else ctx.finish(st.score, { level: st.level, kills: st.kills, blocks: st.blocksN });
      }

      /* Touch: Steuerkreuz und Bombenknopf, auch gleichzeitig */
      var touches = {};
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function padDir(p) {
        var dx = p.x - pads.dx, dy = p.y - pads.dy;
        if (Math.hypot(dx, dy) < pads.dr * 0.18) return null;
        return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        e.preventDefault();
        var p = local(e);
        if (st.menu) {
          menuButtons().forEach(function (b) { if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) startGame(b.k === 2); });
          return;
        }
        if (CTRL && p.y > cssH - CTRL) {
          try { cv.setPointerCapture(e.pointerId); } catch (err) {}
          if (Math.hypot(p.x - pads.bx, p.y - pads.by) < pads.br * 1.4 || p.x > cssW * 0.6) { touches[e.pointerId] = 'bomb'; held.bombBtn = true; placeBomb(st.players[0]); }
          else { touches[e.pointerId] = 'pad'; held.pad = padDir(p); st.hint = false; }
        } else if (!CTRL && e.pointerType === 'mouse') { /* Maus: nichts, nur Tastatur */ }
      });
      cv.addEventListener('pointermove', function (e) {
        if (touches[e.pointerId] === 'pad') held.pad = padDir(local(e));
      });
      function up(e) {
        if (touches[e.pointerId] === 'pad') held.pad = null;
        if (touches[e.pointerId] === 'bomb') held.bombBtn = false;
        delete touches[e.pointerId];
      }
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
      function onKeyUp(e) { delete held[e.key]; }
      document.addEventListener('keyup', onKeyUp);

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(false); held = {}; touches = {};
          shape(); layout();
          st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          /* Auf dem Handy direkt allein, am PC Auswahl */
          if (ctx.touch()) startGame(false);
          else { st.menu = true; st.players = [newPlayer(0)]; buildLevel(); }
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; held = {}; touches = {}; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(false); shape(); layout(); st.players = [newPlayer(0)]; buildLevel(); render(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: function () { layout(); render(); },
        key: function (e) {
          var k = e.key;
          if (st.menu) { if (k === '1') { startGame(false); return true; } if (k === '2') { startGame(true); return true; } return false; }
          if (P1KEYS[k] || P2KEYS[k]) { held[k] = true; st.hint = false; return true; }
          if (k === ' ') { if (!e.repeat) placeBomb(st.players[0]); return true; }
          if (k === 'Enter') { if (!e.repeat) placeBomb(st.duo ? st.players[1] : st.players[0]); return true; }
          return false;
        },
        _debug: function () { return { st: st, px: px, py: py, C: C, COLS: COLS, ROWS: ROWS, startGame: startGame, explode: explode }; }
      };
    }
  });
})();

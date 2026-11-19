/* Spiel 17: Bienen-Blitz (Minispiel-Sammlung: viele kurze Aufgaben hintereinander, immer schneller) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, LIVES = 3, PER_SPEED = 5;
  var art = MBArcade.art, rr = art.rrect;
  var BG = ['#2A1F3A', '#1F2E3A', '#3A2A12', '#2E1A1A', '#1C2A22', '#2A2A2A'];
  var WIRES = [['ROTE', '#E5322D'], ['BLAUE', '#2F6FD0'], ['GELBE', '#FDC506'], ['WEISSE', '#F2F2F2']];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function drawButton(g, x, y, r, down, label) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.ellipse(0, r * 0.32, r * 1.12, r * 0.5, 0, 0, TAU); g.fillStyle = '#222'; g.fill();
    g.beginPath(); g.ellipse(0, r * 0.22, r * 1.05, r * 0.45, 0, 0, TAU); g.fillStyle = '#5A5A5A'; g.fill();
    var h = down ? r * 0.08 : r * 0.28;
    g.fillStyle = '#9E1B17'; g.beginPath(); g.ellipse(0, 0, r * 0.82, r * 0.38, 0, 0, Math.PI); g.lineTo(-r * 0.82, -h); g.ellipse(0, -h, r * 0.82, r * 0.38, 0, Math.PI, 0, true); g.closePath(); g.fill();
    var gr = g.createRadialGradient(-r * 0.25, -h - r * 0.12, 2, 0, -h, r * 0.85); gr.addColorStop(0, '#FF7A6B'); gr.addColorStop(1, '#E5322D');
    g.beginPath(); g.ellipse(0, -h, r * 0.82, r * 0.38, 0, 0, TAU); g.fillStyle = gr; g.fill();
    if (label) { g.fillStyle = '#FFFFFF'; g.font = '900 ' + Math.round(r * 0.2) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, -h, r * 1.4); }
    g.restore();
  }
  function drawFlower(g, x, y, r, t) {
    g.save(); g.translate(x, y); g.rotate(Math.sin(t / 400) * 0.15);
    for (var i = 0; i < 6; i++) { g.save(); g.rotate(i / 6 * TAU); g.beginPath(); g.ellipse(r * 0.55, 0, r * 0.45, r * 0.25, 0, 0, TAU); g.fillStyle = i % 2 ? '#FF8AD8' : '#FFC2EC'; g.fill(); g.restore(); }
    g.beginPath(); g.arc(0, 0, r * 0.32, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#7A4A1A'; g.stroke();
    g.restore();
  }
  function drawJar(g, x, y, s, fill) {
    g.save(); g.translate(x, y); g.scale(s, s);
    rr(g, -22, -24, 44, 48, 9); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#111'; g.stroke();
    var f = fill === undefined ? 1 : fill;
    if (f > 0) { g.save(); rr(g, -22, -24, 44, 48, 9); g.clip(); g.fillStyle = '#E9A800'; g.fillRect(-22, 24 - 48 * f, 44, 48 * f); g.restore(); }
    rr(g, -24, -32, 48, 10, 3); g.fillStyle = '#7A4A1A'; g.fill(); g.stroke();
    g.restore();
  }

  /* Die Minispiele. Jedes bekommt eine eigene Mini-Welt m, gewinnt mit m.win = true, verliert mit m.fail = true.
     timeout: Was passiert, wenn die Zeit abläuft (true = geschafft) */
  var GAMES = [
    {
      id: 'nopush', text: function (m) { return m.trap ? 'JETZT DRÜCKEN!' : 'NICHT DRÜCKEN!'; }, timeout: true, trapSelf: true, trapFail: 'Zu zaghaft!',
      init: function (m, W, H, u) { m.r = 95 * u; m.x = W / 2; m.y = H * 0.56; m.lines = ['Nicht drücken!', 'Wirklich nicht!', 'Drück mich doch!', 'Nur ganz kurz?', 'Keiner guckt!']; },
      tap: function (m, x, y) { if (Math.hypot(x - m.x, y - m.y) < m.r * 1.1) { m.pressed = true; if (m.trap) m.win = true; else { m.fail = 'KABOOM!'; m.boom = true; } } },
      key: function (m, k) { if (k === ' ' || k === 'Enter') { m.pressed = true; if (m.trap) m.win = true; else { m.fail = 'KABOOM!'; m.boom = true; } } },
      draw: function (m, g, t, u) {
        drawButton(g, m.x, m.y, m.r, m.pressed, '');
        if (m.trap) m.lines = ['Na los!', 'Drück schon!', 'Worauf wartest du?'];
        g.fillStyle = '#FFFFFF'; g.font = '800 ' + Math.round(18 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center';
        g.fillText(m.lines[Math.floor(t / 700) % m.lines.length], m.x, m.y + m.r * 0.95);
      }
    },
    {
      id: 'wasp', text: function (m) { return m.trap ? 'WESPE NICHT ANFASSEN!' : 'WESPE ERWISCHEN!'; }, timeout: false, failText: 'Gestochen!', trappable: true,
      init: function (m, W, H, u, lvl) { var a = rnd(0, TAU), sp = (220 + lvl * 50) * u; m.x = rnd(W * 0.2, W * 0.8); m.y = rnd(H * 0.3, H * 0.75); m.vx = Math.cos(a) * sp; m.vy = Math.sin(a) * sp; m.r = 42 * u; m.W = W; m.H = H; },
      update: function (m, dt) {
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < m.r || m.x > m.W - m.r) { m.vx *= -1; m.x = Math.max(m.r, Math.min(m.W - m.r, m.x)); }
        if (m.y < m.H * 0.2 || m.y > m.H * 0.88) { m.vy *= -1; m.y = Math.max(m.H * 0.2, Math.min(m.H * 0.88, m.y)); }
      },
      tap: function (m, x, y) { if (Math.hypot(x - m.x, y - m.y) < m.r * 1.25) m.win = true; else if (!m.trap) m.fail = 'Daneben!'; },
      draw: function (m, g, t, u) { g.save(); g.translate(m.x, m.y); if (m.vx < 0) g.scale(-1, 1); g.scale(u * 1.3, u * 1.3); art.wasp(g, Math.sin(t / 20)); g.restore(); }
    },
    {
      id: 'catch', text: function (m) { return m.trap ? 'HONIG NICHT FANGEN!' : 'HONIG AUFFANGEN!'; }, timeout: false, failText: 'Daneben gekleckert!', trappable: true, trapFailIsWin: true,
      init: function (m, W, H, u, lvl, T) { m.x = rnd(W * 0.15, W * 0.85); m.y = H * 0.18; m.jy = H * 0.84; m.vy = (m.jy - m.y) / (T * 0.82); m.jx = W / 2; m.jw = 60 * u; m.W = W; m.sway = rnd(-1, 1) * W * 0.12; m.x0 = m.x; m.t = 0; m.T = T; },
      update: function (m, dt, keys, u) {
        m.t += dt; m.y += m.vy * dt; m.x = m.x0 + Math.sin(m.t / m.T * Math.PI) * m.sway;
        var sp = 520 * u; if (keys.left) m.jx -= sp * dt; if (keys.right) m.jx += sp * dt; m.jx = Math.max(m.jw, Math.min(m.W - m.jw, m.jx));
        if (m.y >= m.jy - 20 * u) { if (Math.abs(m.x - m.jx) < m.jw * 0.75) m.win = true; else m.fail = 'Daneben gekleckert!'; }
      },
      move: function (m, x) { m.jx = Math.max(m.jw, Math.min(m.W - m.jw, x)); },
      draw: function (m, g, t, u) {
        g.beginPath(); g.moveTo(m.x, m.y - 18 * u); g.quadraticCurveTo(m.x + 12 * u, m.y + 4 * u, m.x, m.y + 10 * u); g.quadraticCurveTo(m.x - 12 * u, m.y + 4 * u, m.x, m.y - 18 * u); g.fillStyle = '#FDC506'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#7A4A1A'; g.stroke();
        drawJar(g, m.jx, m.jy, u * 1.4, 0.3);
      }
    },
    {
      id: 'flowers', text: function (m) { return m.trap ? 'KEINE BLUME ANTIPPEN!' : 'ALLE BLUMEN ANTIPPEN!'; }, timeout: false, failText: 'Zu langsam!', trappable: true,
      init: function (m, W, H, u, lvl) {
        var n = 3 + Math.min(3, lvl); m.f = []; m.r = 34 * u;
        for (var i = 0; i < n * 30 && m.f.length < n; i++) {
          var p = { x: rnd(W * 0.12, W * 0.88), y: rnd(H * 0.3, H * 0.85) };
          if (m.f.every(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) > m.r * 2.6; })) m.f.push(p);
        }
      },
      tap: function (m, x, y) { if (m.trap) { if (m.f.some(function (q) { return Math.hypot(x - q.x, y - q.y) < m.r * 1.3; })) m.fail = 'Reingefallen!'; return; } var hitF = false; for (var i = 0; i < m.f.length; i++) if (!m.f[i].done && Math.hypot(x - m.f[i].x, y - m.f[i].y) < m.r * 1.3) { m.f[i].done = true; m.pop = m.f[i]; hitF = true; break; } if (!hitF && !m.f.some(function (q) { return q.done && Math.hypot(x - q.x, y - q.y) < m.r * 1.3; })) { m.fail = 'Daneben!'; return; } if (m.f.every(function (q) { return q.done; })) m.win = true; },
      draw: function (m, g, t, u) { m.f.forEach(function (p) { if (!p.done) drawFlower(g, p.x, p.y, m.r, t + p.x); }); }
    },
    {
      id: 'pump', text: function (m) { return m.trap ? 'NICHT PUMPEN!' : 'HONIG PUMPEN!'; }, timeout: false, failText: 'Zu wenig Honig!', trappable: true,
      init: function (m, W, H, u, lvl) { m.need = 8 + lvl * 2; m.n = 0; m.x = W / 2; m.y = H * 0.6; m.kick = 0; },
      tap: function (m) { if (m.trap) { m.n++; m.fail = 'Reingefallen!'; return; } m.n++; m.kick = 1; if (m.n >= m.need) m.win = true; },
      key: function (m, k) { if (k === ' ' || k === 'Enter') GAMES[4].tap(m); },
      update: function (m, dt) { m.kick = Math.max(0, m.kick - dt * 6); },
      draw: function (m, g, t, u) {
        drawJar(g, m.x, m.y, u * 3 * (1 + m.kick * 0.06), m.n / m.need);
        g.fillStyle = '#FFFFFF'; g.font = '900 ' + Math.round(22 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText(m.n + ' / ' + m.need, m.x, m.y + 110 * u);
      }
    },
    {
      id: 'wire', text: function (m) { return m.trap ? 'SCHNEIDE KEIN KABEL!' : 'SCHNEIDE DAS ' + m.want[0] + ' KABEL!'; }, timeout: false, failText: 'Falsches Kabel!', trappable: true,
      time: function (l) { return Math.max(3, 5 - l * 0.5); }, timeoutBoom: 'Zu spät! Die Bombe ist hoch.',
      cutAt: function (m, i) { m.cut = i; if (m.trap) { m.fail = 'Reingefallen!'; m.boom = true; } else if (m.wires[i] === m.want) m.win = true; else { m.fail = 'Falsches Kabel!'; m.boom = true; } },
      init: function (m, W, H, u) {
        m.wires = WIRES.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
        m.want = pick(m.wires); m.W = W; m.H = H; m.u = u;
      },
      wx: function (m, i) { return m.W * (0.3 + i * 0.2); },
      tap: function (m, x, y) {
        for (var i = 0; i < 3; i++) if (Math.abs(x - GAMES[5].wx(m, i)) < m.W * 0.08 && y > m.H * 0.28) { GAMES[5].cutAt(m, i); return; }
        if (!m.trap) m.fail = 'Daneben!';
      },
      key: function (m, k) { var i = '123'.indexOf(k); if (i >= 0) GAMES[5].cutAt(m, i); },
      draw: function (m, g, t, u) {
        rr(g, m.W * 0.2, m.H * 0.3, m.W * 0.6, m.H * 0.12, 10 * u); g.fillStyle = '#3A3A3A'; g.fill();
        g.fillStyle = '#E5322D'; g.font = '900 ' + Math.round(20 * u) + 'px "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
        var left = Math.max(0, m.left === undefined ? 5 : m.left);
        if (left < 1.5 && Math.floor(t / 120) % 2) g.fillStyle = '#FFE680';
        g.fillText('00:0' + left.toFixed(1).replace('.', ','), m.W / 2, m.H * 0.36);
        for (var i = 0; i < 3; i++) {
          var x = GAMES[5].wx(m, i), c = m.wires[i][1];
          g.lineCap = 'round'; g.lineWidth = 12 * u; g.strokeStyle = '#111';
          g.beginPath(); g.moveTo(x, m.H * 0.42); g.bezierCurveTo(x - 30 * u, m.H * 0.6, x + 30 * u, m.H * 0.7, x, m.H * 0.88); g.stroke();
          g.lineWidth = 8 * u; g.strokeStyle = c;
          if (m.cut === i) { g.beginPath(); g.moveTo(x, m.H * 0.42); g.lineTo(x - 6 * u, m.H * 0.6); g.stroke(); g.beginPath(); g.moveTo(x + 6 * u, m.H * 0.68); g.lineTo(x, m.H * 0.88); g.stroke(); }
          else { g.beginPath(); g.moveTo(x, m.H * 0.42); g.bezierCurveTo(x - 30 * u, m.H * 0.6, x + 30 * u, m.H * 0.7, x, m.H * 0.88); g.stroke(); }
          g.fillStyle = 'rgba(255,255,255,0.6)'; g.font = '800 ' + Math.round(13 * u) + 'px Poppins, sans-serif'; g.fillText(String(i + 1), x, m.H * 0.94);
        }
      }
    },
    {
      id: 'dodge', text: function () { return 'AUSWEICHEN!'; }, timeout: true,
      init: function (m, W, H, u, lvl) { m.bx = W / 2; m.by = H * 0.84; m.rocks = []; m.next = 0; m.W = W; m.H = H; m.sp = (320 + lvl * 40) * u; m.every = Math.max(0.16, 0.34 - lvl * 0.03); m.u = u; },
      update: function (m, dt, keys, u) {
        var sp = 560 * u; if (keys.left) m.bx -= sp * dt; if (keys.right) m.bx += sp * dt; m.bx = Math.max(30 * u, Math.min(m.W - 30 * u, m.bx));
        m.next -= dt;
        if (m.next <= 0) { m.next = m.every; var tx = Math.random() < 0.35 ? m.bx + rnd(-40, 40) * u : rnd(20 * u, m.W - 20 * u); m.rocks.push({ x: tx, y: m.H * 0.16, r: rnd(13, 20) * u, rot: rnd(0, 6) }); }
        m.rocks.forEach(function (r) { r.y += m.sp * dt; r.rot += dt * 4; if (Math.hypot(r.x - m.bx, r.y - m.by) < r.r + 18 * u) m.fail = 'Kohle auf die Mütze!'; });
        m.rocks = m.rocks.filter(function (r) { return r.y < m.H + 30; });
      },
      move: function (m, x) { m.bx = Math.max(30 * m.u, Math.min(m.W - 30 * m.u, x)); },
      draw: function (m, g, t, u) {
        m.rocks.forEach(function (r) { g.save(); g.translate(r.x, r.y); g.rotate(r.rot); g.beginPath(); for (var i = 0; i < 7; i++) { var a = i / 7 * TAU, rr2 = r.r * (0.8 + ((i * 37) % 5) / 12); g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.closePath(); g.fillStyle = '#2A2A2A'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#555'; g.stroke(); g.restore(); });
        g.save(); g.translate(m.bx, m.by); g.scale(u * 0.9, u * 0.9); art.bee(g, Math.sin(t / 20)); g.restore();
      }
    },
    {
      id: 'count', text: function (m) { return m.ask ? 'WIE VIELE BIENEN?' : 'BIENEN ZÄHLEN!'; }, timeout: false, failText: 'Verzählt!',
      init: function (m, W, H, u, lvl, T) {
        m.n = 3 + Math.floor(Math.random() * (3 + Math.min(3, lvl))); m.b = []; m.W = W; m.H = H; m.T = T; m.t = 0;
        for (var i = 0; i < 200 && m.b.length < m.n; i++) { var p = { x: rnd(W * 0.12, W * 0.88), y: rnd(H * 0.28, H * 0.72) }; if (m.b.every(function (q) { return Math.hypot(q.x - p.x, q.y - p.y) > 60 * u; })) m.b.push(p); }
        m.n = m.b.length;
        var opts = [m.n, m.n + (Math.random() < 0.5 ? 1 : -1), m.n + (Math.random() < 0.5 ? 2 : -2)].map(function (v) { return Math.max(1, v); });
        if (opts[1] === opts[0]) opts[1] = m.n + 1; if (opts[2] === opts[0] || opts[2] === opts[1]) opts[2] = m.n + 3;
        m.opts = opts.sort(function () { return Math.random() - 0.5; });
      },
      update: function (m, dt) { m.t += dt; m.ask = m.t > m.T * 0.4; },
      btn: function (m, i) { var w = m.W * 0.22; return { x: m.W / 2 + (i - 1) * (w + 14) - w / 2, y: m.H * 0.8, w: w, h: m.H * 0.11 }; },
      choose: function (m, i) { if (!m.ask) return; if (m.opts[i] === m.n) m.win = true; else m.fail = 'Es waren ' + m.n + '!'; },
      tap: function (m, x, y) { if (!m.ask) return; for (var i = 0; i < 3; i++) { var b = GAMES[7].btn(m, i); if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { GAMES[7].choose(m, i); return; } } m.fail = 'Daneben!'; },
      key: function (m, k) { var i = '123'.indexOf(k); if (i >= 0) GAMES[7].choose(m, i); },
      draw: function (m, g, t, u) {
        if (!m.ask) m.b.forEach(function (p, i) { g.save(); g.translate(p.x, p.y + Math.sin(t / 200 + i) * 4); g.scale(u * 0.8, u * 0.8); art.bee(g, Math.sin(t / 20 + i)); g.restore(); });
        else {
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.font = '900 ' + Math.round(80 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', m.W / 2, m.H * 0.52);
          for (var i = 0; i < 3; i++) { var b = GAMES[7].btn(m, i); rr(g, b.x, b.y, b.w, b.h, 14); g.fillStyle = '#FDC506'; g.fill(); g.fillStyle = '#111'; g.font = '900 ' + Math.round(b.h * 0.5) + 'px Poppins, sans-serif'; g.fillText(String(m.opts[i]), b.x + b.w / 2, b.y + b.h / 2 + 1); }
        }
      }
    },
    {
      id: 'findbee', text: function (m) { return m.trap ? 'NICHTS ANTIPPEN!' : 'FINDE DIE BIENE!'; }, timeout: false, failText: 'Die war gut versteckt!', trappable: true,
      init: function (m, W, H, u, lvl) {
        m.list = []; m.W = W; m.H = H; m.u = u; var n = 5 + Math.min(5, lvl * 2), sp = (60 + lvl * 25) * u;
        for (var i = 0; i < n; i++) { var a = rnd(0, TAU); m.list.push({ x: rnd(W * 0.12, W * 0.88), y: rnd(H * 0.26, H * 0.86), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, bee: i === 0 }); }
      },
      update: function (m, dt) { m.list.forEach(function (o) { o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < m.W * 0.08 || o.x > m.W * 0.92) o.vx *= -1; if (o.y < m.H * 0.24 || o.y > m.H * 0.9) o.vy *= -1; }); },
      tap: function (m, x, y) {
        var best = null, bd = 40 * m.u;
        m.list.forEach(function (o) { var d = Math.hypot(x - o.x, y - o.y); if (d < bd) { bd = d; best = o; } });
        if (!best) { if (!m.trap) m.fail = 'Daneben!'; return; }
        if (m.trap) { m.fail = 'Reingefallen!'; return; }
        if (best.bee) m.win = true; else m.fail = 'Das war eine Wespe!';
      },
      draw: function (m, g, t, u) { m.list.forEach(function (o, i) { g.save(); g.translate(o.x, o.y); if (o.vx < 0) g.scale(-1, 1); g.scale(u * 0.75, u * 0.75); if (o.bee) art.bee(g, Math.sin(t / 20 + i)); else art.wasp(g, Math.sin(t / 20 + i)); g.restore(); }); }
    },
    {
      id: 'stop', text: function (m) { return m.trap ? 'NICHT STOPPEN!' : 'IM GELBEN STOPPEN!'; }, timeout: false, failText: 'Zu spät!', trappable: true,
      init: function (m, W, H, u, lvl) { m.W = W; m.H = H; m.p = 0; m.dir = 1; m.sp = 0.9 + lvl * 0.25; m.zone = Math.max(0.1, 0.2 - lvl * 0.015); m.z0 = rnd(0.2, 0.8 - m.zone); m.u = u; },
      update: function (m, dt) { if (m.stopped) return; m.p += m.dir * m.sp * dt; if (m.p > 1) { m.p = 1; m.dir = -1; } if (m.p < 0) { m.p = 0; m.dir = 1; } },
      hit: function (m) { if (m.stopped) return; m.stopped = true; if (m.trap) { m.fail = 'Reingefallen!'; return; } if (m.p >= m.z0 && m.p <= m.z0 + m.zone) m.win = true; else m.fail = 'Knapp daneben!'; },
      tap: function (m) { GAMES[9].hit(m); },
      key: function (m, k) { if (k === ' ' || k === 'Enter') GAMES[9].hit(m); },
      draw: function (m, g, t, u) {
        var bx = m.W * 0.1, bw = m.W * 0.8, by = m.H * 0.55, bh = 34 * u;
        rr(g, bx, by, bw, bh, bh / 2); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
        rr(g, bx + bw * m.z0, by, bw * m.zone, bh, 6); g.fillStyle = '#FDC506'; g.fill();
        var px = bx + bw * m.p;
        g.save(); g.translate(px, by + bh / 2); g.scale(u * 0.7, u * 0.7); art.bee(g, Math.sin(t / 20)); g.restore();
        g.fillStyle = 'rgba(255,255,255,0.7)'; g.font = '700 ' + Math.round(15 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('Tippen oder Leertaste', m.W / 2, by + bh + 34 * u);
      }
    }
  ];

  MBArcade.register({
    id: 'blitz',
    title: 'Bienen-Blitz',
    duration: 0,
    startText: 'Lauter kleine Aufgaben, jede nur ein paar Sekunden lang: Knopf nicht drücken, Wespe erwischen, Honig auffangen und mehr. Alle 5 geschafften Aufgaben wird es schneller. Drei Fehler und es ist vorbei.',
    help: {
      legendTitle: 'Punkte',
      controls: [
        { icons: ['tap'], text: 'Tippen, antippen und ziehen, je nach Aufgabe. Die Aufgabe steht nur kurz am Anfang da. Wer etwas antippen soll und danebentippt, verliert ein Leben', touch: true },
        { icons: ['mouse-left'], text: 'Klicken und mit der Maus fahren, je nach Aufgabe', kb: true },
        { icons: ['kbd:←', 'kbd:→'], text: 'Bewegen beim Auffangen und Ausweichen', kb: true },
        { icons: ['kbd:Leertaste'], text: 'Pumpen (und lieber nicht beim roten Knopf)', kb: true },
        { icons: ['kbd:1–3'], text: 'Kabel oder Antwort auswählen', kb: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { drawButton(g, 23, 28, 16, false, ''); }, text: 'Aufgabe geschafft: 100 × Tempo-Stufe', val: '100+' },
        { draw: function (g) { g.translate(23, 24); g.scale(0.45, 0.45); art.bee(g, 0.3); }, text: 'Drei Leben. Jeder Fehler kostet eins' },
        { draw: function (g) { g.fillStyle = '#FDC506'; g.font = '900 20px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('»»', 23, 30); }, text: 'Alle 5 geschafften Aufgaben: schneller und Bonus', val: '+250 × Stufe' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Auch bei uns geht es schnell. Und den roten Knopf drücken wir nie. Lass uns reden.' },
    stats: function (s) { return s.wins + (s.wins === 1 ? ' Aufgabe' : ' Aufgaben') + ' geschafft, Tempo-Stufe ' + s.speed + ' erreicht.'; },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 0, H = 0, dpr = 1, u = 1, raf = 0, idleRaf = 0, keys = {};
      var st = fresh();

      function fresh() { return { on: false, paused: false, over: false, t: 0, last: 0, lives: LIVES, wins: 0, speed: 1, score: 0, phase: 'idle', pt: 0, m: null, gm: null, bag: [], parts: [], prev: null }; }
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        u = Math.max(0.6, Math.min(W, H * 1.2) / 640);
      }
      function lvl() { return st.speed - 1; }
      /* Spielzeit: allgemein 4,4 s bis 2,1 s, einzelne Aufgaben haben eine eigene (Bombe: 5 s bis 3 s) */
      function playTime(gm) { gm = gm || st.gm; if (gm && gm.time) return gm.time(lvl()); return Math.max(2.1, 4.4 - lvl() * 0.32); }
      function cardTime() { return (st.cardSpeed ? 1.6 : Math.max(0.8, 1.25 - lvl() * 0.08)); }
      function introTime() { return Math.max(0.6, 1.1 - lvl() * 0.07); }

      /* Nächste Aufgabe: aus einem gemischten Beutel, damit alles regelmäßig drankommt */
      function next() {
        if (!st.bag.length) { st.bag = GAMES.slice().sort(function () { return Math.random() - 0.5; }); if (st.prev && st.bag[0] === st.prev) st.bag.push(st.bag.shift()); }
        var gm = st.bag.shift(); st.prev = gm;
        var m = { bg: pick(BG) };
        /* Gemeine Falle: umgedrehte Aufgabe, ab der vierten Aufgabe ab und zu */
        /* Selten und nie zweimal hintereinander, damit es wirklich überrascht */
        m.trap = (gm.trappable || gm.trapSelf) && st.wins >= 3 && !st.lastTrap && Math.random() < Math.min(0.2, 0.1 + lvl() * 0.02);
        st.lastTrap = m.trap;
        gm.init(m, W, H, u, lvl(), playTime(gm));
        st.gm = gm; st.m = m; st.phase = 'intro'; st.pt = st.t;
        ctx.tone(520, 780, 0.08, 'triangle', 0.04);
      }
      function burst(x, y, colors, n, sp) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = sp * rnd(0.3, 1.1); st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rnd(0.4, 0.9), s: rnd(2, 6), c: pick(colors) }); }
      }
      function resolve(win, why) {
        st.phase = 'result'; st.pt = st.t; st.m.res = win; st.m.why = why;
        if (win) {
          st.wins++;
          var pts = 100 * st.speed; st.score += pts; ctx.setScore(st.score);
          ctx.fx.flash('141,212,90', 0.35); ctx.fx.text(W / 2, H * 0.3, 'GESCHAFFT! +' + pts, '#8DD45A', 30);
          ctx.fx.sparkle(W / 2, H * 0.45, ['#8DD45A', '#FDC506', '#FFFFFF'], 18, 260);
          ctx.tone(660, 990, 0.1, 'triangle', 0.06); ctx.tone(990, 1320, 0.12, 'triangle', 0.05, 0.08);
          if (st.wins % PER_SPEED === 0) {
            var bonus = 250 * st.speed; st.score += bonus; ctx.setScore(st.score);
            st.speed++;
            st.speedUp = true;
          }
        } else {
          st.lives--;
          var boom = st.m.boom;
          ctx.fx.shake(boom ? 0.5 : 0.25, boom ? 14 : 7); ctx.fx.flash('255,74,61', boom ? 1 : 0.6);
          if (boom && st.gm.id === 'nopush') {
            /* Der rote Knopf: richtig große Explosion mit Pilzwolke */
            st.nuke = st.t;
            ctx.fx.shake(1.3, 24);
            ctx.tone(90, 20, 1.6, 'sawtooth', 0.09); ctx.tone(55, 18, 1.8, 'square', 0.07, 0.05); ctx.tone(180, 40, 0.8, 'sawtooth', 0.05, 0.1);
            burst(W / 2, H * 0.62, ['#FFFFFF', '#FFE680', '#FF9F1A', '#E5322D', '#333'], 70, 700);
          } else if (boom) { ctx.fx.boom(W / 2, H * 0.55, '#FF9F1A', '255,159,26', 1.2); burst(W / 2, H * 0.55, ['#FF9F1A', '#FDC506', '#E5322D', '#FFFFFF', '#333'], 40, 520); ctx.tone(120, 30, 0.6, 'sawtooth', 0.08); ctx.tone(70, 25, 0.5, 'square', 0.06, 0.05); }
          else ctx.tone(330, 110, 0.35, 'sawtooth', 0.05);
          if (!st.nuke) ctx.fx.text(W / 2, H * 0.3, why || 'Daneben!', '#FF7A6B', 32);
        }
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var p = st.parts[q]; p.t += dt; p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > p.life) st.parts.splice(q, 1); }
        if (!st.m) return;
        var age = (st.t - st.pt) / 1000;
        if (st.phase === 'intro' && age >= introTime()) { st.phase = 'play'; st.pt = st.t; }
        else if (st.phase === 'play') {
          var m = st.m, gm = st.gm;
          var lastLeft = m.left; m.left = playTime() - age;
          if (gm.id === 'wire' && lastLeft !== undefined && Math.ceil(lastLeft) !== Math.ceil(m.left) && m.left > 0) ctx.tone(m.left < 1.5 ? 1500 : 1100, 900, 0.05, 'square', 0.03);
          if (gm.update) gm.update(m, dt, { left: keys.ArrowLeft || keys.a || keys.A, right: keys.ArrowRight || keys.d || keys.D }, u);
          if (m.pop) { burst(m.pop.x, m.pop.y, ['#FF8AD8', '#FDC506', '#FFFFFF'], 10, 200); ctx.tone(880, 1320, 0.06, 'triangle', 0.04); m.pop = null; }
          if (m.trap && !gm.trapSelf) {
            /* Falle: Wer die normale Aufgabe erfüllt, ist reingefallen. Nichts tun = geschafft */
            if (m.win) resolve(false, 'Reingefallen!');
            else if (m.fail) { if (gm.trapFailIsWin) resolve(true); else resolve(false, m.fail); }
            else if (age >= playTime()) resolve(true);
            if (st.phase === 'result' && st.m.res) ctx.fx.text(W / 2, H * 0.38, 'Nicht reingefallen!', '#FFE680', 22);
          } else if (m.win) resolve(true);
          else if (m.fail) resolve(false, m.fail);
          else if (age >= playTime()) { if (gm.timeoutBoom && !m.trap) m.boom = true; resolve(m.trap ? false : !!gm.timeout, m.trap ? gm.trapFail : gm.timeoutBoom || (gm.timeout ? null : gm.failText)); }
          if (st.phase === 'result' && st.m.res && gm.id === 'nopush' && !m.trap) ctx.fx.text(W / 2, H * 0.38, 'Stark geblieben!', '#FFE680', 20);
        } else if (st.phase === 'result' && age >= (st.nuke && st.t - st.nuke < 3000 ? 2.2 : 0.8)) {
          st.nuke = 0;
          if (st.lives <= 0) {
            st.phase = 'dead'; st.pt = st.t;
            ctx.tone(392, 370, 0.35, 'triangle', 0.05); ctx.tone(370, 349, 0.35, 'triangle', 0.05, 0.38); ctx.tone(349, 330, 0.35, 'triangle', 0.05, 0.76); ctx.tone(330, 220, 0.9, 'triangle', 0.05, 1.14);
            return;
          }
          st.phase = 'card'; st.pt = st.t; st.cardSpeed = st.speedUp; st.speedUp = false;
          if (st.cardSpeed) { ctx.tone(392, 784, 0.15, 'square', 0.05); ctx.tone(523, 1046, 0.2, 'square', 0.05, 0.12); }
          else if (st.m.res) { ctx.tone(523, 659, 0.08, 'triangle', 0.035); ctx.tone(659, 784, 0.08, 'triangle', 0.035, 0.1); }
        } else if (st.phase === 'card' && age >= cardTime()) next();
        else if (st.phase === 'dead' && age >= 2.8) st.over = true;
      }

      /* Zwischenbild: Biene tanzt, darunter die Leben */
      function drawCard(age) {
        var lastOk = st.m && st.m.res, cx = W / 2, cy = H * 0.42;
        g.fillStyle = st.cardSpeed ? '#3A2A08' : lastOk ? '#1C2A22' : '#2E1A1A'; g.fillRect(0, 0, W, H);
        /* Lichtstrahlen */
        g.save(); g.translate(cx, cy); g.rotate(st.t / 2000); g.globalAlpha = 0.12;
        for (var i = 0; i < 12; i++) { g.rotate(TAU / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(W, -60 * u); g.lineTo(W, 60 * u); g.closePath(); g.fillStyle = '#FDC506'; g.fill(); }
        g.restore();
        var hop = Math.abs(Math.sin(st.t / 160)) * 26 * u, tilt = Math.sin(st.t / 160) * 0.35;
        g.beginPath(); g.ellipse(cx, cy + 62 * u, 46 * u * (1 - hop / (60 * u)), 9 * u, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fill();
        g.save(); g.translate(cx, cy - hop); g.rotate(tilt); g.scale(u * 2.2, u * 2.2); art.bee(g, Math.sin(st.t / 18)); g.restore();
        /* Noten */
        for (var n = 0; n < 4; n++) {
          var nt = ((st.t / 900) + n * 0.25) % 1, nx = cx + Math.sin(n * 2.1 + st.t / 500) * 110 * u + (n % 2 ? 1 : -1) * 70 * u, ny = cy + 40 * u - nt * 150 * u;
          g.globalAlpha = 1 - nt; g.fillStyle = '#FDC506'; g.font = '900 ' + Math.round(28 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n % 2 ? '♪' : '♫', nx, ny);
        }
        g.globalAlpha = 1;
        var title = st.cardSpeed ? 'SCHNELLER! Stufe ' + st.speed : lastOk ? 'Weiter geht’s!' : 'Autsch!';
        g.font = '900 ' + Math.round(34 * u) + 'px Poppins, sans-serif'; g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = '#111';
        g.strokeText(title, cx, H * 0.14, W - 20); g.fillStyle = st.cardSpeed ? '#FDC506' : lastOk ? '#8DD45A' : '#FF7A6B'; g.fillText(title, cx, H * 0.14, W - 20);
        /* Leben */
        var lw = 70 * u, lx0 = cx - lw * (LIVES - 1) / 2, ly = H * 0.74;
        for (var l = 0; l < LIVES; l++) {
          var alive = l < st.lives, justLost = !alive && l === st.lives && !lastOk && age < 0.6;
          g.save(); g.translate(lx0 + l * lw, ly + (alive ? Math.sin(st.t / 200 + l) * 4 * u : 0));
          if (justLost) { var jl = age / 0.6; g.rotate(jl * 2); g.scale(1 + jl * 0.6, 1 + jl * 0.6); g.globalAlpha = 1 - jl * 0.8; }
          else if (!alive) g.globalAlpha = 0.18;
          g.scale(u * 0.95, u * 0.95); art.bee(g, alive ? Math.sin(st.t / 20 + l) : 0);
          g.restore();
        }
        g.globalAlpha = 1;
        g.font = '800 ' + Math.round(18 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#FFFFFF';
        g.fillText(st.lives === 1 ? 'Noch 1 Leben!' : 'Noch ' + st.lives + ' Leben', cx, ly + 52 * u);
        g.font = '700 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.7)';
        g.fillText(st.score.toLocaleString('de-DE') + ' Punkte  ·  ' + st.wins + ' geschafft', cx, ly + 80 * u);
      }
      /* Ende: Biene liegt auf dem Rücken, Kreuzaugen, verlegenes „Oh nein“-Lächeln */
      function drawDead(age) {
        var cx = W / 2, cy = H * 0.5;
        g.fillStyle = '#1A1A1A'; g.fillRect(0, 0, W, H);
        var fall = Math.min(1, age / 0.6), bounce = fall < 1 ? 0 : Math.abs(Math.sin((age - 0.6) * 9)) * Math.max(0, 1 - (age - 0.6) * 2) * 12 * u;
        var y = cy - (1 - fall) * H * 0.4 - bounce;
        g.beginPath(); g.ellipse(cx, cy + 34 * u, 70 * u, 12 * u, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
        g.save(); g.translate(cx, y); g.scale(u * 2.6, u * 2.6); g.rotate(fall * Math.PI * 0.08);
        g.scale(1, -1);
        /* Beinchen zappeln nach oben */
        art.bee(g, Math.sin(st.t / 300) * 0.2);
        g.strokeStyle = '#111'; g.lineWidth = 2.8; g.lineCap = 'round'; g.lineJoin = 'round';
        [-20, -11, -2].forEach(function (lx, i) { var wig = Math.sin(st.t / 60 + i * 1.7) * 4; g.beginPath(); g.moveTo(lx, 13); g.lineTo(lx + wig, 27); g.lineTo(lx + 5 + wig, 31); g.stroke(); });
        /* Kopf neu: Kreuzaugen und verlegenes Lächeln */
        g.beginPath(); g.arc(11, 2, 10, 0, TAU); g.fillStyle = '#3A2410'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#111'; g.stroke();
        g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.8;
        [[8, -1], [16, -1]].forEach(function (e) { g.beginPath(); g.moveTo(e[0] - 2.4, e[1] - 2.4); g.lineTo(e[0] + 2.4, e[1] + 2.4); g.moveTo(e[0] + 2.4, e[1] - 2.4); g.lineTo(e[0] - 2.4, e[1] + 2.4); g.stroke(); });
        g.strokeStyle = '#F7B500'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(7, 7); g.quadraticCurveTo(9, 5, 11, 7); g.quadraticCurveTo(13, 9, 15, 7); g.quadraticCurveTo(16.5, 5.5, 18, 6.5); g.stroke();
        g.restore();
        /* Sternchen über dem Kopf */
        for (var i = 0; i < 3; i++) {
          var a = st.t / 300 + i * TAU / 3;
          g.fillStyle = '#FDC506'; g.font = '900 ' + Math.round(18 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText('★', cx + 30 * u + Math.cos(a) * 34 * u, y + 30 * u + Math.sin(a) * 10 * u);
        }
        if (age > 0.5) {
          g.globalAlpha = Math.min(1, (age - 0.5) * 3);
          g.font = '900 ' + Math.round(44 * u) + 'px Poppins, sans-serif'; g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = '#111';
          g.strokeText('Oh nein!', cx, H * 0.2); g.fillStyle = '#FF7A6B'; g.fillText('Oh nein!', cx, H * 0.2);
          g.font = '700 ' + Math.round(16 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.8)';
          g.fillText('Alle Leben aufgebraucht. ' + st.wins + ' Aufgaben geschafft.', cx, H * 0.8, W - 20);
          g.globalAlpha = 1;
        }
      }
      /* Atompilz nach dem roten Knopf */
      function drawNuke(k) {
        var gx = W / 2, gy = H * 0.9, top = H * 0.62 - Math.min(1, k / 1.2) * H * 0.34, grow = Math.min(1, k * 1.6);
        g.save();
        g.globalAlpha = Math.min(0.75, k * 2) * Math.max(0, 1 - (k - 1.6) * 2); g.fillStyle = '#5A1A08'; g.fillRect(0, 0, W, H);
        g.globalAlpha = 1;
        /* Druckwelle am Boden */
        g.beginPath(); g.ellipse(gx, gy, k * W * 0.9, k * 40 * u, 0, 0, TAU); g.strokeStyle = 'rgba(255,230,180,' + Math.max(0, 0.8 - k * 0.5) + ')'; g.lineWidth = 6 * u; g.stroke();
        /* Stamm */
        var sw = 34 * u * grow + 10 * u;
        var sg = g.createLinearGradient(0, top, 0, gy); sg.addColorStop(0, '#FFB13B'); sg.addColorStop(0.5, '#C8501A'); sg.addColorStop(1, '#4A2A1A');
        g.beginPath(); g.moveTo(gx - sw, gy); g.quadraticCurveTo(gx - sw * 0.5, (gy + top) / 2, gx - sw * 0.7, top + 20 * u); g.lineTo(gx + sw * 0.7, top + 20 * u); g.quadraticCurveTo(gx + sw * 0.5, (gy + top) / 2, gx + sw, gy); g.closePath(); g.fillStyle = sg; g.fill();
        /* Pilzhut aus mehreren Wolkenkugeln */
        var cr = H * 0.17 * grow + 10 * u, glow = Math.max(0, 1 - k * 0.6);
        for (var i = 0; i < 9; i++) {
          var a = i / 9 * TAU + k * 0.8, rx = gx + Math.cos(a) * cr * 0.9, ry = top + Math.sin(a) * cr * 0.4, r = cr * (0.55 + (i % 3) * 0.08);
          var cg = g.createRadialGradient(rx, ry - r * 0.3, 2, rx, ry, r);
          cg.addColorStop(0, 'rgba(255,' + Math.round(230 * glow + 120 * (1 - glow)) + ',' + Math.round(150 * glow + 60) + ',1)'); cg.addColorStop(0.6, glow > 0.3 ? '#FF6A1A' : '#8A4A2A'); cg.addColorStop(1, 'rgba(60,30,20,0)');
          g.beginPath(); g.arc(rx, ry, r, 0, TAU); g.fillStyle = cg; g.fill();
        }
        var core = g.createRadialGradient(gx, top, 2, gx, top, cr * 0.8); core.addColorStop(0, 'rgba(255,255,230,' + glow + ')'); core.addColorStop(1, 'rgba(255,180,60,0)');
        g.beginPath(); g.arc(gx, top, cr * 0.8, 0, TAU); g.fillStyle = core; g.fill();
        /* Grelles Weiß am Anfang */
        var fl = Math.max(0, 1 - k * 2.2) * (ctx.reduce ? 0.4 : 1);
        if (fl > 0) { g.globalAlpha = fl; g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
        if (k > 0.35) {
          g.font = '900 ' + Math.round(64 * u) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          var zs = 1 + Math.max(0, 0.5 - (k - 0.35)) * 0.8;
          g.translate(W / 2, H * 0.22); g.scale(zs, zs); g.lineWidth = 9; g.lineJoin = 'round'; g.strokeStyle = '#111'; g.strokeText('KABOOOM!', 0, 0, W - 20); g.fillStyle = '#FDC506'; g.fillText('KABOOOM!', 0, 0, W - 20);
        }
        g.restore();
      }
      function render() {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        var m = st.m;
        if (st.phase === 'card' || st.phase === 'dead') {
          var ag = (st.t - st.pt) / 1000;
          if (st.phase === 'card') drawCard(ag); else drawDead(ag);
          st.parts.forEach(function (p) { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillStyle = p.c; g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); });
          g.globalAlpha = 1;
          return;
        }
        g.fillStyle = m ? m.bg : '#1A1A1A'; g.fillRect(0, 0, W, H);
        /* Waben im Hintergrund */
        g.save(); g.globalAlpha = 0.06;
        for (var yy = 0; yy < H + 40; yy += 40 * u) for (var xx = (Math.round(yy / (40 * u)) % 2) * 23 * u; xx < W + 46; xx += 46 * u) art.hex(g, xx, yy, 20 * u, null, '#FDC506', 2);
        g.restore();
        var age = st.m ? (st.t - st.pt) / 1000 : 0;
        if (m && (st.phase === 'play' || st.phase === 'result' || st.phase === 'intro')) {
          if (st.phase === 'intro') g.globalAlpha = 0.35;
          st.gm.draw(m, g, st.t, u);
          g.globalAlpha = 1;
        }
        st.parts.forEach(function (p) { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillStyle = p.c; g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); });
        g.globalAlpha = 1;
        if (st.nuke) { drawNuke((st.t - st.nuke) / 1000); return; }
        /* Aufgabe nur ganz kurz am Anfang groß in der Mitte, danach steht nichts mehr da */
        if (m && st.phase === 'intro') {
          var txt = st.gm.text(m), intro = st.phase === 'intro';
          var sz = Math.min(W / Math.max(8, txt.length * 0.62), (intro ? 54 : 30) * u);
          var y = intro ? H * 0.45 : 40 * u + 20;
          var pop = intro ? Math.min(1, age / 0.18) : 1;
          g.save(); g.translate(W / 2, y); g.scale(0.6 + pop * 0.4, 0.6 + pop * 0.4); g.rotate(intro ? Math.sin(st.t / 90) * 0.02 : 0);
          g.font = '900 ' + Math.round(sz) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.lineWidth = Math.max(4, sz * 0.16); g.lineJoin = 'round'; g.strokeStyle = '#111'; g.strokeText(txt, 0, 0, W - 20);
          g.fillStyle = '#FDC506'; g.fillText(txt, 0, 0, W - 20);
          g.restore();
        }
        /* Zeitleiste als Zündschnur */
        if (st.phase === 'play') {
          var f = Math.max(0, 1 - age / playTime()), bw = W - 40, by = H - 18;
          rr(g, 20, by - 5, bw, 10, 5); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fill();
          rr(g, 20, by - 5, bw * f, 10, 5); g.fillStyle = f > 0.35 ? '#FDC506' : '#FF5A4A'; g.fill();
          var sx = 20 + bw * f;
          g.beginPath(); g.arc(sx, by, 6 + Math.random() * 3, 0, TAU); g.fillStyle = '#FFE680'; g.fill();
          if (Math.random() < 0.5) st.parts.push({ x: sx, y: by, vx: rnd(-60, 60), vy: rnd(-120, -40), t: 0, life: 0.3, s: 2.5, c: '#FFD24A' });
        }
        /* Leben und Stufe */
        for (var l = 0; l < LIVES; l++) { g.save(); g.translate(W - 22 - l * 30, 22); g.scale(0.36, 0.36); if (l >= st.lives) g.globalAlpha = 0.18; art.bee(g, 0.3); g.restore(); }
        g.globalAlpha = 1;
        g.font = '800 13px Poppins, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,0.75)';
        g.fillText('Stufe ' + st.speed + '  ·  ' + st.wins + ' geschafft', 12, 22);
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
      function stop() { st.on = false; keys = {}; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() { stop(); render(); ctx.finish(st.score, { wins: st.wins, speed: st.speed }); }

      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused || st.phase !== 'play') return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e);
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        if (st.gm.tap) st.gm.tap(st.m, p.x, p.y);
        if (st.gm.move) st.gm.move(st.m, p.x);
      });
      cv.addEventListener('pointermove', function (e) {
        if (!st.on || st.paused || st.phase !== 'play' || !st.gm.move) return;
        if (e.pointerType !== 'mouse' && !e.buttons) return;
        st.gm.move(st.m, local(e).x);
      });
      function onKeyUp(e) { delete keys[e.key]; }
      document.addEventListener('keyup', onKeyUp);

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); keys = {}; layout();
          st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          next();
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; keys = {}; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); layout(); render(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: function () { layout(); render(); },
        key: function (e) {
          var k = e.key;
          if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].indexOf(k) >= 0) { keys[k] = true; return true; }
          if (k === ' ' || k === 'Enter' || '123'.indexOf(k) >= 0 && k.length === 1) {
            if (!e.repeat && st.phase === 'play' && st.gm.key) st.gm.key(st.m, k);
            return true;
          }
          return false;
        },
        _debug: function () { return { st: st, GAMES: GAMES, next: next, resolve: resolve }; }
      };
    }
  });
})();

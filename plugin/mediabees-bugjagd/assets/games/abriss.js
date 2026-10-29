/* Spiel 6: Website-Abriss (PC-zerstören-Prinzip) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, H = 600, DURATION = 45000, BAR = 70, CHROME = 50;
  var BEE_COOLDOWN = 4500, BEE_LIFE = 4.5, FLAME_TICK = 0.07, FLAME_R = 30;
  var art = MBArcade.art, rr = art.rrect;
  var RETRO = '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive';
  var SERIF = '"Times New Roman", Times, serif';
  var SITES = [
    { name: 'Kalles Trinkhalle', url: 'http://www.kalles-bude.de/home.htm', bg: '#C9C9C9', title: 'Willkommen bei Kalle!!!',
      news: '+++ NEU: Currywurst jetzt auch mit Pommes +++ Montag Ruhetag +++ Bitte ins Gästebuch eintragen +++',
      text: 'Hallo und herzlich willkommen auf der Homepage von Kalles Trinkhalle in Herne! Hier gibt es Bier, Bütterkes und die beste Currywurst im ganzen Pott. Schau dich ruhig um.',
      photo: 'Die Bude im Sommer 1998', links: ['Startseite', 'Preise', 'Anfahrt', 'Fotos', 'Gästebuch', 'Links'] },
    { name: 'Kaninchenzüchter Wanne-Eickel', url: 'http://www.kaninchen-wanne.de/index.html', bg: '#E6D7AE', title: 'Kaninchenzuchtverein 1958 e.V.',
      news: '+++ Vereinsfest am Samstag +++ Neue Fotos von Hoppel +++ Mitgliedsbeitrag bitte überweisen +++',
      text: 'Wir sind der Kaninchenzuchtverein aus Wanne-Eickel. Seit 1958 züchten wir mit viel Liebe Widder, Rexe und Zwerge. Gäste sind jederzeit willkommen!',
      photo: 'Hoppel, Sieger 1997', links: ['Verein', 'Termine', 'Rassen', 'Bilder', 'Gästebuch', 'Impressum'] },
    { name: 'Brieftauben Gut Flug', url: 'http://members.pott-net.de/gutflug/', bg: '#C5DCEF', title: 'Brieftauben „Gut Flug“ Herne',
      news: '+++ Saisonstart im April +++ Unsere Tauben fliegen bis Belgien +++ Jetzt mit Webring +++',
      text: 'Willkommen beim Brieftaubenverein Gut Flug. Unsere Schläge stehen in Herne-Sodingen. Hier findest du Ergebnisse, Termine und viele Bilder von unseren Tauben.',
      photo: 'Unser Schlag', links: ['Start', 'Ergebnisse', 'Termine', 'Tauben', 'Gästebuch', 'Webring'] },
    { name: 'Horsts Modellbahn-Ecke', url: 'http://www.horst-modellbahn.de/start.htm', bg: '#D3E6C3', title: 'Horsts Modellbahn-Ecke',
      news: '+++ Jetzt mit drei Zügen +++ Neue Weiche eingebaut +++ Besucher Nummer 500 bekommt einen Gruß +++',
      text: 'Hier zeige ich meine Modellbahn im Keller. Spur H0, Epoche III, mit Zeche, Bahnhof und Kirmes. Die Seite wird ständig erweitert, also bald wiederkommen!',
      photo: 'Mein Bahnhof', links: ['Startseite', 'Anlage', 'Loks', 'Basteltipps', 'Gästebuch', 'Links'] }
  ];
  var WIDE = [
    [['title', 5, 62], ['neu', 1, 62]],
    [['marquee', 1, 28]],
    [['nav', 1.1, 150], ['text', 2.4, 150], ['photo', 1.6, 150]],
    [['bau', 2.2, 70], ['globe', 0.8, 70], ['counter', 1.4, 70]],
    [['button', 1, 40, 'Gästebuch'], ['mail', 1, 40], ['button', 1, 40, 'Webring']],
    [['footer', 1, 22]]
  ];
  var NARROW = [
    [['title', 3.2, 66], ['neu', 1, 66]],
    [['marquee', 1, 26]],
    [['text', 1.6, 120], ['photo', 1, 120]],
    [['nav', 1, 84]],
    [['bau', 1, 54]],
    [['globe', 0.7, 64], ['counter', 1.3, 64]],
    [['button', 1, 38, 'Gästebuch'], ['mail', 1, 38]],
    [['footer', 1, 20]]
  ];
  var TOOLS = [
    { id: 'hammer', name: 'Hammer', key: '1' },
    { id: 'flame', name: 'Flammen', key: '2' },
    { id: 'bees', name: 'Bienen', key: '3' }
  ];
  var COLORS = { title: ['#E5322D', '#FDC506', '#2F6FD0'], neu: ['#E5322D', '#FFE600'], marquee: ['#FFFF00', '#E5322D'], nav: ['#FFFFFF', '#0000EE'], text: ['#FFFFFF', '#111111'], photo: ['#7EC0EE', '#3C8D3C', '#C0C0C0'], bau: ['#FDC506', '#111111'], globe: ['#1E5CC8', '#2E9E4A'], counter: ['#111111', '#33FF66'], button: ['#C0C0C0', '#808080', '#FFFFFF'], mail: ['#FFFFFF', '#0000EE', '#E5322D'], footer: ['#808080', '#C0C0C0'] };
  var SOLID = { marquee: 1, nav: 1, text: 1, photo: 1, bau: 1, counter: 1, button: 1 };
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Werkzeug-Icons, Mitte = 0,0, Größe etwa 40 */
  function drawHammer(g) {
    g.save(); g.rotate(-0.6);
    rr(g, -3.5, -6, 7, 30, 3); g.fillStyle = '#9A6332'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    rr(g, -13, -16, 26, 12, 3); g.fillStyle = '#A3ABBF'; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-11, -14, 22, 3);
    g.restore();
  }
  function drawFlame(g, t) {
    var f = 1 + Math.sin((t || 0) / 60) * 0.08;
    g.save(); g.rotate(0.5);
    rr(g, -5, 2, 10, 20, 3); g.fillStyle = '#59617A'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#3F4655'; g.fillRect(-3, -2, 6, 5);
    g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(10 * f, -12, 0, -24 * f); g.quadraticCurveTo(-10 * f, -12, 0, -4);
    g.fillStyle = '#FF7A1A'; g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(5, -11, 0, -17 * f); g.quadraticCurveTo(-5, -11, 0, -6); g.fillStyle = '#FFE680'; g.fill();
    g.restore();
  }
  function drawBees(g, t) {
    [[-8, 4, 0.3], [8, -2, 0.36], [-2, -12, 0.28]].forEach(function (b, i) {
      g.save(); g.translate(b[0], b[1]); g.scale(b[2], b[2]); art.bee(g, Math.sin((t || 0) / 30 + i)); g.restore();
    });
  }
  function drawTool(g, id, t) { if (id === 'hammer') drawHammer(g); else if (id === 'flame') drawFlame(g, t); else drawBees(g, t); }

  MBArcade.register({
    id: 'abriss',
    title: 'Website-Abriss',
    duration: DURATION,
    startText: 'Diese Homepages sind von 1999 und müssen weg! Zerleg in 45 Sekunden so viel wie möglich. Ist eine Seite komplett platt, kommt die nächste.',
    help: {
      legendTitle: 'Dein Werkzeug',
      controls: [
        { icons: ['mouse-left', 'tap'], text: 'Draufhauen, beim Flammenwerfer gedrückt halten und ziehen' },
        { icons: ['kbd:1', 'kbd:2', 'kbd:3'], text: 'Werkzeug wechseln (oder unten antippen)', kb: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.translate(23, 25); drawHammer(g); }, text: 'Hammer: ein Schlag, ein Riss' },
        { draw: function (g) { g.translate(23, 28); drawFlame(g, 0); }, text: 'Flammenwerfer: halten und drüberziehen' },
        { draw: function (g) { g.translate(23, 25); drawBees(g, 0); }, text: 'Bienenschwarm: sticht von allein, braucht dann eine Pause' },
        { draw: function (g) { g.translate(23, 23); g.rotate(0.3); rr(g, -16, -10, 32, 20, 2); g.fillStyle = '#C0C0C0'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#111'; g.font = '700 8px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('NEU!', 0, 3); }, text: 'Jeder Treffer zählt, ganz kaputt gibt es Bonus. Schnell hintereinander = Kombo', val: '+' }
      ]
    },
    ranks: [
      [2000, 'Abriss-Legende', 'Von den alten Seiten ist nichts übrig.'],
      [1000, 'Abrissbiene', 'Ordentlich Kleinholz gemacht.'],
      [400, 'Heimwerkerbiene', 'Da wackelt schon einiges.'],
      [0, 'Staubwedel', 'Die alte Seite steht noch. Nochmal!']
    ],
    cta: { path: 'unsere-leistungen/', text: 'Deine Website ist auch von gestern? Wir bauen dir eine neue.' },
    stats: function (s) {
      var t = s.parts + (s.parts === 1 ? ' Teil' : ' Teile') + ' zerlegt';
      t += s.pages ? ', ' + s.pages + (s.pages === 1 ? ' Seite komplett platt' : ' Seiten komplett platt') : '';
      return t + (s.combo >= 3 ? ', ' + s.combo + ' Teile am Stück zerlegt.' : '.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas is-aim';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 960, k = 1, dpr = 1, raf = 0, idleRaf = 0;
      var hover = !(window.matchMedia && window.matchMedia('(hover: none)').matches);
      var st = fresh(0);

      function fresh(level) {
        return {
          on: false, paused: false, t: 0, last: 0, score: 0, level: level, site: SITES[level % SITES.length],
          els: [], chunks: [], parts: [], pops: [], cracks: [], scorch: [], bees: [],
          tool: 'hammer', mx: -99, my: -99, inside: false, firing: false, fireAcc: 0, lastScorch: null, flameSnd: 0,
          swing: 0, beeReady: 0, combo: 0, comboT: -9999, bestCombo: 0, destroyed: 0, pages: 0,
          clearAt: 0, slide: 0, shake: 0, flash: 0
        };
      }

      /* Seitenaufbau als Zeilen, Höhen passen sich dem Bildschirm an */
      function pageBox() { return { x: 12, y: CHROME + 10, w: W - 24, h: H - BAR - CHROME - 22 }; }
      function layout() {
        var pb = pageBox(), rows = pb.w >= 640 ? WIDE : NARROW, gap = 8, pad = 10;
        var total = rows.reduce(function (s, r) { return s + r[0][2]; }, 0) + gap * (rows.length - 1);
        var f = Math.min(1.35, (pb.h - pad * 2) / total), y = pb.y + pad, lvl = 1 + st.level * 0.2;
        var els = [];
        g.save();
        rows.forEach(function (r) {
          var h = r[0][2] * f, sum = r.reduce(function (s, c) { return s + c[1]; }, 0);
          var x = pb.x + pad, free = pb.w - pad * 2 - gap * (r.length - 1);
          r.forEach(function (c) {
            var w = free * c[1] / sum;
            var hp = Math.round(Math.max(3, Math.min(26, w * h / 1400)) * lvl);
            var e = { kind: c[0], x: x, y: y, w: w, h: h, hp: hp, max: hp, label: c[3] || '', jit: 0, dead: false, seed: Math.random() * 1000 };
            if (e.kind === 'text') e.lines = wrap(st.site.text, w - 16, Math.max(11, Math.min(16, h / 7)));
            els.push(e);
            x += w + gap;
          });
          y += h + gap;
        });
        g.restore();
        st.els = els;
      }
      function wrap(text, maxW, fs) {
        g.font = fs + 'px ' + SERIF;
        var words = text.split(' '), lines = [], line = '';
        words.forEach(function (wd) {
          var test = line ? line + ' ' + wd : wd;
          if (g.measureText(test).width > maxW && line) { lines.push(line); line = wd; } else line = test;
        });
        if (line) lines.push(line);
        return { fs: fs, list: lines };
      }

      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(r.width * dpr);
        cv.height = Math.round(r.height * dpr);
        k = r.height / H;
        W = r.width / k;
        if (!st.on || st.els.every(function (e) { return !e.dead && e.hp === e.max; })) layout();
        else relayout();
        render();
      }
      /* Bei Größenänderung mitten in der Runde: Schaden behalten, Positionen neu */
      function relayout() {
        var old = st.els;
        layout();
        st.els.forEach(function (e, i) { if (old[i]) { e.dead = old[i].dead; e.hp = Math.min(e.max, old[i].hp); } });
      }

      function pop(x, y, text, color, big) { st.pops.push({ x: x, y: y, text: text, color: color || '#FDC506', t0: st.t, big: !!big }); }
      function shakeIt(v) { if (!ctx.reduce) st.shake = Math.max(st.shake, v); }
      function debris(x, y, colors, n, speed) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.4, t: 0, life: 0.5 + Math.random() * 0.5, size: 2 + Math.random() * 4, c: colors[i % colors.length], g: 900, sq: true });
        }
      }

      function alive() { return st.els.filter(function (e) { return !e.dead; }); }
      function hitsCircle(e, x, y, r) {
        var nx = Math.max(e.x, Math.min(x, e.x + e.w)), ny = Math.max(e.y, Math.min(y, e.y + e.h));
        return (x - nx) * (x - nx) + (y - ny) * (y - ny) <= r * r;
      }

      function damage(e, n, x, y) {
        if (e.dead || st.slide > 0.05) return;
        n = Math.min(n, e.hp);
        e.hp -= n; e.jit = 1;
        st.score += n; ctx.setScore(st.score);
        debris(x, y, COLORS[e.kind], 3, 160);
        if (e.hp <= 0) destroy(e);
      }

      function destroy(e) {
        e.dead = true;
        st.destroyed++;
        st.combo = st.t - st.comboT < 1600 ? st.combo + 1 : 1;
        st.comboT = st.t;
        st.bestCombo = Math.max(st.bestCombo, st.combo);
        var mult = Math.min(5, st.combo), bonus = (5 + Math.round(e.max / 2)) * mult;
        st.score += bonus; ctx.setScore(st.score);
        pop(e.x + e.w / 2, e.y + e.h / 2, '+' + bonus + (mult > 1 ? ' ×' + mult : ''), mult > 1 ? '#FFE680' : '#FDC506');
        /* Trümmerteile fallen runter */
        var cols = e.w > e.h * 2 ? 3 : 2, rows = e.h > 50 ? 2 : 1;
        for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
          var sw = e.w / cols, sh = e.h / rows, sx = e.x + i * sw, sy = e.y + j * sh;
          st.chunks.push({ e: e, sx: sx, sy: sy, sw: sw, sh: sh, x: sx + sw / 2, y: sy + sh / 2, vx: (i - (cols - 1) / 2) * rnd(60, 140) + rnd(-40, 40), vy: rnd(-260, -80), rot: 0, vr: rnd(-4, 4) });
        }
        debris(e.x + e.w / 2, e.y + e.h / 2, COLORS[e.kind], 16, 300);
        shakeIt(0.18);
        ctx.tone(180, 60, 0.22, 'square', 0.05);
        ctx.tone(400, 120, 0.15, 'sawtooth', 0.03, 0.04);
        if (!alive().length) {
          st.clearAt = st.t + 700;
          st.pages++;
          var b = 100 * (st.level + 1);
          st.score += b; ctx.setScore(st.score);
          pop(W / 2, H * 0.4, 'Seite platt! +' + b, '#FDC506', true);
          st.flash = 0.6;
          ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.18, 'triangle', 0.06, 0.12);
        }
      }

      function crackAt(x, y) {
        var lines = [], n = 6 + Math.floor(Math.random() * 4);
        for (var i = 0; i < n; i++) {
          var a = i / n * TAU + rnd(-0.3, 0.3), px = x, py = y, len = rnd(18, 48);
          var pts = [[px, py]];
          for (var s = 0; s < 3; s++) { a += rnd(-0.4, 0.4); px += Math.cos(a) * len / 3; py += Math.sin(a) * len / 3; pts.push([px, py]); }
          lines.push(pts);
        }
        st.cracks.push({ x: x, y: y, lines: lines, r: rnd(8, 14) });
        if (st.cracks.length > 70) st.cracks.shift();
      }

      function inBar(y) { return y > H - BAR; }
      function barTool(x) {
        var bw = Math.min(170, (W - 40) / 3), x0 = W / 2 - bw * 1.5;
        var i = Math.floor((x - x0) / bw);
        return i >= 0 && i < 3 ? TOOLS[i].id : null;
      }
      function setTool(id) {
        if (st.tool === id) return;
        st.tool = id; st.firing = false;
        ctx.tone(660, 880, 0.05, 'triangle', 0.03);
      }

      function act(x, y) {
        if (st.slide > 0.05) return;
        if (st.tool === 'hammer') {
          st.swing = 1;
          crackAt(x, y);
          var hit = false;
          alive().forEach(function (e) { if (hitsCircle(e, x, y, 10)) { damage(e, 2, x, y); hit = true; } });
          shakeIt(hit ? 0.1 : 0.06);
          ctx.tone(hit ? 140 : 220, 60, 0.1, 'square', 0.05);
          ctx.tone(1800, 900, 0.05, 'triangle', 0.02);
        } else if (st.tool === 'flame') {
          st.firing = true; st.fireAcc = FLAME_TICK;
        } else {
          if (st.t < st.beeReady) { ctx.tone(150, 120, 0.08, 'square', 0.03); pop(x, y - 20, 'Bienen ruhen noch', '#FFFFFF'); return; }
          st.beeReady = st.t + BEE_COOLDOWN;
          for (var i = 0; i < 5; i++) st.bees.push({ x: x + rnd(-10, 10), y: y + rnd(-10, 10), vx: rnd(-120, 120), vy: rnd(-200, -60), t: 0, sting: 0, target: null, tx: 0, ty: 0, dir: 1 });
          ctx.tone(400, 700, 0.15, 'triangle', 0.04); ctx.tone(500, 900, 0.15, 'triangle', 0.03, 0.08);
        }
      }

      function update(dt) {
        st.t += dt * 1000;
        if (st.clearAt && st.t >= st.clearAt) {
          st.clearAt = 0;
          st.level++;
          st.site = SITES[st.level % SITES.length];
          st.cracks = []; st.scorch = [];
          layout();
          st.slide = 1;
          ctx.tone(300, 600, 0.2, 'triangle', 0.04);
        }
        if (st.slide > 0) st.slide = Math.max(0, st.slide - dt * 3);
        /* Flammenwerfer */
        if (st.firing && st.tool === 'flame') {
          st.fireAcc += dt;
          while (st.fireAcc >= FLAME_TICK) {
            st.fireAcc -= FLAME_TICK;
            alive().forEach(function (e) { if (hitsCircle(e, st.mx, st.my, FLAME_R)) damage(e, 1, st.mx + rnd(-10, 10), st.my + rnd(-10, 10)); });
          }
          var n = ctx.reduce ? 1 : 3;
          for (var f = 0; f < n; f++) st.parts.push({ x: st.mx + rnd(-8, 8), y: st.my + rnd(-8, 8), vx: rnd(-40, 40), vy: rnd(-160, -60), t: 0, life: rnd(0.3, 0.6), size: rnd(5, 11), c: Math.random() < 0.5 ? '#FF7A1A' : '#FFD24A', g: -60, fire: true });
          if (!st.lastScorch || Math.hypot(st.mx - st.lastScorch.x, st.my - st.lastScorch.y) > 14) {
            st.lastScorch = { x: st.mx, y: st.my };
            st.scorch.push({ x: st.mx + rnd(-4, 4), y: st.my + rnd(-4, 4), r: rnd(18, 30) });
            if (st.scorch.length > 140) st.scorch.shift();
          }
          st.flameSnd -= dt;
          if (st.flameSnd <= 0) { st.flameSnd = 0.12; ctx.tone(rnd(70, 110), 50, 0.12, 'sawtooth', 0.018); }
        }
        /* Bienen suchen sich Ziele und stechen */
        var targets = alive();
        for (var b = st.bees.length - 1; b >= 0; b--) {
          var bee = st.bees[b];
          bee.t += dt;
          var leaving = bee.t > BEE_LIFE || !targets.length;
          if (!leaving && (!bee.target || bee.target.dead)) {
            var best = null, bd = 1e9;
            targets.forEach(function (e) { var d = Math.hypot(e.x + e.w / 2 - bee.x, e.y + e.h / 2 - bee.y) + Math.random() * 120; if (d < bd) { bd = d; best = e; } });
            bee.target = best;
            if (best) { bee.tx = rnd(best.x + 6, best.x + best.w - 6); bee.ty = rnd(best.y + 6, best.y + best.h - 6); }
          }
          var gx = leaving ? bee.x + bee.dir * 40 : bee.tx, gy = leaving ? -80 : bee.ty;
          var dx = gx - bee.x, dy = gy - bee.y, dist = Math.hypot(dx, dy) || 1;
          bee.vx += (dx / dist * 900 - bee.vx * 2.2) * dt;
          bee.vy += (dy / dist * 900 - bee.vy * 2.2) * dt;
          bee.x += bee.vx * dt + Math.sin(st.t / 70 + b) * 0.8; bee.y += bee.vy * dt;
          if (Math.abs(bee.vx) > 30) bee.dir = bee.vx > 0 ? 1 : -1;
          if (!leaving && bee.target && dist < 14) {
            bee.sting -= dt;
            if (bee.sting <= 0) {
              bee.sting = 0.3;
              damage(bee.target, 1, bee.x, bee.y);
              ctx.tone(900, 600, 0.03, 'square', 0.015);
              bee.tx = rnd(bee.target.x + 6, bee.target.x + bee.target.w - 6); bee.ty = rnd(bee.target.y + 6, bee.target.y + bee.target.h - 6);
            }
          }
          if (leaving && bee.y < -60) st.bees.splice(b, 1);
        }
        st.els.forEach(function (e) { e.jit = Math.max(0, e.jit - dt * 6); });
        for (var c = st.chunks.length - 1; c >= 0; c--) {
          var ch = st.chunks[c];
          ch.vy += 1300 * dt; ch.x += ch.vx * dt; ch.y += ch.vy * dt; ch.rot += ch.vr * dt;
          if (ch.y > H + 300) st.chunks.splice(c, 1);
        }
        for (var q = st.parts.length - 1; q >= 0; q--) {
          var p = st.parts[q];
          p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.t > p.life) st.parts.splice(q, 1);
        }
        st.pops = st.pops.filter(function (pp) { return st.t - pp.t0 < (pp.big ? 1300 : 800); });
        st.swing = Math.max(0, st.swing - dt * 7);
        st.shake = Math.max(0, st.shake - dt);
        st.flash = Math.max(0, st.flash - dt * 2.5);
        ctx.setTime(DURATION - st.t, DURATION);
      }

      /* Zeichnen der alten Seite */
      function bevel(x, y, w, h, inset) {
        g.fillStyle = inset ? '#808080' : '#FFFFFF'; g.fillRect(x, y, w, 2); g.fillRect(x, y, 2, h);
        g.fillStyle = inset ? '#FFFFFF' : '#404040'; g.fillRect(x, y + h - 2, w, 2); g.fillRect(x + w - 2, y, 2, h);
      }
      function fitFont(text, maxW, size, family, weight) {
        g.font = (weight || '') + ' ' + size + 'px ' + family;
        var w = g.measureText(text).width;
        if (w > maxW) { size = Math.max(9, size * maxW / w); g.font = (weight || '') + ' ' + size + 'px ' + family; }
        return size;
      }

      function drawEl(e) {
        var x = e.x, y = e.y, w = e.w, h = e.h, t = st.t, s = st.site;
        g.save();
        if (e.kind === 'title') {
          var gr = g.createLinearGradient(x, 0, x + w, 0);
          ['#E5322D', '#FF8C1A', '#FDC506', '#2E9E4A', '#2F6FD0', '#8A3FD1'].forEach(function (c, i) { gr.addColorStop(i / 5, c); });
          var fs = fitFont(s.title, w - 16, h * 0.55, RETRO, '700');
          g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillText(s.title, x + w / 2 + 3, y + h / 2 + 3);
          g.fillStyle = gr; g.fillText(s.title, x + w / 2, y + h / 2);
          g.lineWidth = Math.max(1, fs / 18); g.strokeStyle = '#111'; g.strokeText(s.title, x + w / 2, y + h / 2);
        } else if (e.kind === 'neu') {
          var cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) / 2 - 2, bl = Math.floor(t / 400) % 2;
          g.translate(cx, cy); g.rotate(Math.sin(t / 300) * 0.15);
          g.beginPath();
          for (var i = 0; i < 24; i++) { var a = i / 24 * TAU, rad = i % 2 ? R * 0.72 : R; g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
          g.closePath(); g.fillStyle = bl ? '#E5322D' : '#FFE600'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
          g.fillStyle = bl ? '#FFE600' : '#E5322D'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = '700 ' + R * 0.55 + 'px ' + RETRO; g.fillText('NEU!', 0, 1);
        } else if (e.kind === 'marquee') {
          g.fillStyle = '#FFFF00'; g.fillRect(x, y, w, h); bevel(x, y, w, h, true);
          g.beginPath(); g.rect(x + 2, y + 2, w - 4, h - 4); g.clip();
          g.font = '700 ' + h * 0.55 + 'px ' + SERIF; g.fillStyle = '#E5322D'; g.textBaseline = 'middle';
          var tw = g.measureText(s.news).width;
          g.fillText(s.news, x + w - ((t * 0.09) % (tw + w)), y + h / 2 + 1);
        } else if (e.kind === 'nav') {
          g.fillStyle = '#FFFFFF'; g.fillRect(x, y, w, h); bevel(x, y, w, h, true);
          var two = w > h * 1.8, per = two ? 3 : 6, lh = Math.min(22, (h - 26) / per), fsz = Math.max(10, Math.min(15, lh * 0.75));
          g.fillStyle = '#000080'; g.fillRect(x + 2, y + 2, w - 4, 18);
          g.fillStyle = '#FFF'; g.font = '700 12px ' + SERIF; g.textBaseline = 'middle'; g.fillText('Navigation', x + 8, y + 11);
          g.font = fsz + 'px ' + SERIF;
          s.links.forEach(function (l, i) {
            var col = two ? Math.floor(i / per) : 0, row = i % per;
            var lx = x + 10 + col * w / 2, ly = y + 30 + row * lh + lh / 2 - 4;
            g.fillStyle = (Math.floor(t / 500) + i) % 6 === 0 ? '#FF0000' : '#FDC506';
            g.beginPath(); g.arc(lx + 3, ly, 3, 0, TAU); g.fill();
            g.fillStyle = '#0000EE'; g.fillText(l, lx + 11, ly);
            var lw = g.measureText(l).width; g.fillRect(lx + 11, ly + fsz * 0.45, lw, 1);
          });
        } else if (e.kind === 'text') {
          g.fillStyle = '#FFFFFF'; g.fillRect(x, y, w, h); bevel(x, y, w, h, true);
          g.beginPath(); g.rect(x + 2, y + 2, w - 4, h - 4); g.clip();
          var L = e.lines; g.font = L.fs + 'px ' + SERIF; g.fillStyle = '#111'; g.textBaseline = 'top';
          L.list.forEach(function (ln, i) { g.fillText(ln, x + 8, y + 8 + i * L.fs * 1.25); });
        } else if (e.kind === 'photo') {
          g.fillStyle = '#C0C0C0'; g.fillRect(x, y, w, h); bevel(x, y, w, h, false);
          var px = x + 6, py = y + 6, pw = w - 12, ph = h - 26;
          var sky = g.createLinearGradient(0, py, 0, py + ph); sky.addColorStop(0, '#5FA8E8'); sky.addColorStop(1, '#BFE0F7');
          g.fillStyle = sky; g.fillRect(px, py, pw, ph);
          g.beginPath(); g.arc(px + pw * 0.78, py + ph * 0.28, Math.min(pw, ph) * 0.12, 0, TAU); g.fillStyle = '#FFE680'; g.fill();
          g.fillStyle = '#3C8D3C'; g.beginPath(); g.moveTo(px, py + ph); g.quadraticCurveTo(px + pw * 0.3, py + ph * 0.45, px + pw * 0.6, py + ph * 0.75); g.quadraticCurveTo(px + pw * 0.8, py + ph * 0.6, px + pw, py + ph * 0.7); g.lineTo(px + pw, py + ph); g.closePath(); g.fill();
          g.fillStyle = '#5A3F2A'; g.fillRect(px + pw * 0.2, py + ph * 0.55, pw * 0.22, ph * 0.3);
          g.fillStyle = '#8C2F25'; g.beginPath(); g.moveTo(px + pw * 0.17, py + ph * 0.56); g.lineTo(px + pw * 0.31, py + ph * 0.38); g.lineTo(px + pw * 0.45, py + ph * 0.56); g.closePath(); g.fill();
          g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
          fitFont(s.photo, pw, 11, SERIF, 'italic'); g.fillText(s.photo, x + w / 2, y + h - 10);
        } else if (e.kind === 'bau') {
          g.fillStyle = '#FDC506'; g.fillRect(x, y, w, h);
          g.save(); g.beginPath(); g.rect(x, y, w, 10); g.rect(x, y + h - 10, w, 10); g.clip();
          g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath();
          for (var sx = x - 20; sx < x + w + 20; sx += 16) { g.moveTo(sx, y + h); g.lineTo(sx + 20, y); }
          g.stroke(); g.restore();
          g.strokeStyle = '#111'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
          var cx2 = x + 22, cb = y + h - 13;
          g.fillStyle = '#FF7A1A'; g.beginPath(); g.moveTo(cx2 - 9, cb); g.lineTo(cx2, cb - Math.min(26, h - 26)); g.lineTo(cx2 + 9, cb); g.closePath(); g.fill(); g.stroke();
          g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
          fitFont('Baustelle! Hier entsteht was Neues.', w - 60, Math.min(16, h * 0.28), RETRO, '700');
          g.fillText('Baustelle! Hier entsteht was Neues.', x + w / 2 + 16, y + h / 2);
        } else if (e.kind === 'globe') {
          var gx = x + w / 2, gy = y + h / 2, gr2 = Math.min(w, h) / 2 - 4;
          g.beginPath(); g.arc(gx, gy, gr2, 0, TAU);
          var sea = g.createRadialGradient(gx - gr2 * 0.3, gy - gr2 * 0.3, 2, gx, gy, gr2); sea.addColorStop(0, '#5FA8E8'); sea.addColorStop(1, '#1E4FA0');
          g.fillStyle = sea; g.fill(); g.save(); g.clip();
          var off = (t * 0.03) % (gr2 * 4);
          g.fillStyle = '#2E9E4A';
          [[0, -0.3, 0.5, 0.35], [1.2, 0.2, 0.4, 0.5], [2.3, -0.1, 0.6, 0.3], [3.1, 0.45, 0.3, 0.25]].forEach(function (c) {
            for (var rep = -1; rep <= 0; rep++) { g.beginPath(); g.ellipse(gx - gr2 * 2 + c[0] * gr2 + off + rep * gr2 * 4, gy + c[1] * gr2, c[2] * gr2, c[3] * gr2, 0, 0, TAU); g.fill(); }
          });
          g.restore();
          g.beginPath(); g.arc(gx, gy, gr2, 0, TAU); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
        } else if (e.kind === 'counter') {
          g.fillStyle = '#C0C0C0'; g.fillRect(x, y, w, h); bevel(x, y, w, h, false);
          g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.font = '12px ' + SERIF; g.fillText('Sie sind Besucher Nr.', x + w / 2, y + 13);
          var digits = String(417 + st.level * 83 + Math.floor(st.score / 50)).padStart(6, '0');
          var dw = Math.min(22, (w - 16) / 6), dh = Math.min(h - 30, dw * 1.5), dx0 = x + w / 2 - dw * 3;
          for (var di = 0; di < 6; di++) {
            g.fillStyle = '#111'; g.fillRect(dx0 + di * dw + 1, y + 24, dw - 2, dh);
            g.fillStyle = '#33FF66'; g.font = '700 ' + dh * 0.8 + 'px "Courier New", monospace';
            g.fillText(digits[di], dx0 + di * dw + dw / 2, y + 24 + dh / 2 + 1);
          }
        } else if (e.kind === 'button') {
          var pressed = e.jit > 0.5;
          g.fillStyle = '#C0C0C0'; g.fillRect(x, y, w, h); bevel(x, y, w, h, pressed);
          g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
          fitFont(e.label, w - 12, Math.min(16, h * 0.42), SERIF, '700');
          g.fillText(e.label, x + w / 2 + (pressed ? 1 : 0), y + h / 2 + (pressed ? 1 : 0));
        } else if (e.kind === 'mail') {
          var ew = Math.min(36, h * 0.9), eh = ew * 0.65, ex = x + 8, ey = y + h / 2 - eh / 2 + Math.sin(t / 200) * 2;
          g.fillStyle = '#FFFFFF'; g.fillRect(ex, ey, ew, eh); g.strokeStyle = '#111'; g.lineWidth = 1.5; g.strokeRect(ex, ey, ew, eh);
          g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + ew / 2, ey + eh * 0.6); g.lineTo(ex + ew, ey); g.stroke();
          g.fillStyle = '#E5322D'; g.fillRect(ex + ew - 8, ey + 3, 5, 5);
          g.fillStyle = '#0000EE'; g.textAlign = 'left'; g.textBaseline = 'middle';
          var ms = fitFont('Schreib mir!', w - ew - 22, Math.min(16, h * 0.42), SERIF, '700');
          g.fillText('Schreib mir!', ex + ew + 8, y + h / 2); g.fillRect(ex + ew + 8, y + h / 2 + ms * 0.5, g.measureText('Schreib mir!').width, 1);
        } else {
          g.fillStyle = '#404040'; g.textAlign = 'center'; g.textBaseline = 'middle';
          var ft = 'Optimiert für 800 × 600 · Netzkieker 4.0 · Letzte Änderung: 12.03.1999';
          fitFont(ft, w - 10, Math.min(12, h * 0.6), SERIF); g.fillText(ft, x + w / 2, y + h / 2);
        }
        g.restore();
        /* Schaden: dunkler werden */
        var dmg = 1 - e.hp / e.max;
        if (dmg > 0 && SOLID[e.kind]) { g.fillStyle = 'rgba(40,20,0,' + dmg * 0.4 + ')'; g.fillRect(x, y, w, h); }
      }

      function drawElAt(e) {
        var dmg = 1 - e.hp / e.max, jx = e.jit * (Math.random() * 2 - 1) * 3, jy = e.jit * (Math.random() * 2 - 1) * 3;
        var rot = dmg * 0.05 * (e.seed % 2 > 1 ? 1 : -1);
        g.save();
        g.translate(e.x + e.w / 2 + jx, e.y + e.h / 2 + jy + dmg * dmg * 4); g.rotate(rot); g.translate(-e.x - e.w / 2, -e.y - e.h / 2);
        drawEl(e);
        g.restore();
      }

      function drawChrome() {
        var x = 6, y = 6, w = W - 12, h = H - BAR - 12;
        g.fillStyle = '#C0C0C0'; g.fillRect(x, y, w, h); bevel(x, y, w, h, false);
        var tb = g.createLinearGradient(x, 0, x + w, 0); tb.addColorStop(0, '#000080'); tb.addColorStop(1, '#1084D0');
        g.fillStyle = tb; g.fillRect(x + 4, y + 4, w - 8, 20);
        g.fillStyle = '#FFF'; g.textAlign = 'left'; g.textBaseline = 'middle';
        fitFont(st.site.name + ' – Netzkieker', w - 90, 12, 'Tahoma, Verdana, sans-serif', '700');
        g.fillText(st.site.name + ' – Netzkieker', x + 10, y + 14);
        for (var i = 0; i < 3; i++) {
          var bx = x + w - 22 - i * 18;
          g.fillStyle = '#C0C0C0'; g.fillRect(bx, y + 7, 15, 13); bevel(bx, y + 7, 15, 13, false);
          g.fillStyle = '#111'; g.font = '700 10px Tahoma, sans-serif'; g.textAlign = 'center'; g.fillText(['×', '□', '_'][i], bx + 7.5, y + 13.5);
        }
        g.textAlign = 'left'; g.font = '11px Tahoma, Verdana, sans-serif'; g.fillStyle = '#111';
        g.fillText('Adresse', x + 8, y + 37);
        g.fillStyle = '#FFF'; g.fillRect(x + 58, y + 28, w - 70, 18); bevel(x + 58, y + 28, w - 70, 18, true);
        g.fillStyle = '#111'; fitFont(st.site.url, w - 84, 11, 'Tahoma, Verdana, sans-serif'); g.fillText(st.site.url, x + 64, y + 37.5);
        var pb = pageBox();
        g.fillStyle = st.site.bg; g.fillRect(pb.x, pb.y, pb.w, pb.h);
        g.fillStyle = 'rgba(0,0,0,0.05)';
        for (var py = pb.y; py < pb.y + pb.h; py += 12) for (var px = pb.x + ((py / 12) % 2) * 6; px < pb.x + pb.w; px += 12) g.fillRect(px, py, 2, 2);
        bevel(pb.x, pb.y, pb.w, pb.h, true);
      }

      function drawDecals() {
        var x = 6, y = 6, w = W - 12, h = H - BAR - 12;
        g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
        st.scorch.forEach(function (s) {
          var gr = g.createRadialGradient(s.x, s.y, 2, s.x, s.y, s.r);
          gr.addColorStop(0, 'rgba(25,12,4,0.55)'); gr.addColorStop(0.6, 'rgba(60,30,10,0.25)'); gr.addColorStop(1, 'rgba(60,30,10,0)');
          g.fillStyle = gr; g.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
        });
        st.cracks.forEach(function (c) {
          g.lineCap = 'round'; g.lineJoin = 'round';
          [['rgba(255,255,255,0.75)', 2.2, 0.8], ['rgba(17,17,17,0.8)', 1.1, 0]].forEach(function (pen) {
            g.strokeStyle = pen[0]; g.lineWidth = pen[1]; g.beginPath();
            c.lines.forEach(function (ln) { ln.forEach(function (p, i) { g[i ? 'lineTo' : 'moveTo'](p[0] + pen[2], p[1] + pen[2]); }); });
            g.moveTo(c.x + c.r, c.y); g.arc(c.x, c.y, c.r, 0, TAU);
            g.stroke();
          });
          g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(c.x, c.y, 4, 0, TAU); g.fill();
        });
        g.restore();
      }

      function drawBar() {
        g.fillStyle = '#151515'; g.fillRect(0, H - BAR, W, BAR);
        var bw = Math.min(170, (W - 40) / 3), x0 = W / 2 - bw * 1.5;
        TOOLS.forEach(function (tl, i) {
          var bx = x0 + i * bw + 4, by = H - BAR + 9, w = bw - 8, h = BAR - 18, on = st.tool === tl.id;
          rr(g, bx, by, w, h, 12); g.fillStyle = on ? '#FDC506' : '#262626'; g.fill();
          g.lineWidth = 2; g.strokeStyle = on ? '#FDC506' : '#3A3A3A'; g.stroke();
          if (tl.id === 'bees' && st.t < st.beeReady) {
            var p = (st.beeReady - st.t) / BEE_COOLDOWN;
            g.save(); rr(g, bx, by, w, h, 12); g.clip();
            g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(bx, by, w * p, h); g.restore();
          }
          g.save(); g.translate(bx + 26, by + h / 2 + 2); g.scale(0.62, 0.62); drawTool(g, tl.id, st.t); g.restore();
          g.fillStyle = on ? '#111' : '#FFFFFF'; g.textAlign = 'left'; g.textBaseline = 'middle';
          fitFont(tl.name, w - 56, 15, 'Poppins, sans-serif', '700'); g.fillText(tl.name, bx + 48, by + h / 2);
          if (hover && w > 120) { g.font = '600 11px Poppins, sans-serif'; g.fillStyle = on ? 'rgba(17,17,17,0.6)' : 'rgba(255,255,255,0.4)'; g.textAlign = 'right'; g.fillText(tl.key, bx + w - 10, by + h / 2); }
        });
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = 9 * Math.min(1, st.shake / 0.15); sx = (Math.random() * 2 - 1) * m * k * dpr; sy = (Math.random() * 2 - 1) * m * k * dpr; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#0E0E10'; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(k * dpr, 0, 0, k * dpr, sx, sy);
        var so = st.slide > 0 ? st.slide * st.slide * W : 0;
        g.save(); g.translate(so, 0);
        drawChrome();
        st.els.forEach(function (e) { if (!e.dead) drawElAt(e); });
        g.restore();
        st.chunks.forEach(function (c) {
          g.save();
          g.translate(c.x, c.y); g.rotate(c.rot); g.translate(-c.sx - c.sw / 2, -c.sy - c.sh / 2);
          g.beginPath(); g.rect(c.sx, c.sy, c.sw, c.sh); g.clip();
          var hp = c.e.hp; c.e.hp = c.e.max * 0.3; drawEl(c.e); c.e.hp = hp;
          g.restore();
        });
        drawDecals();
        st.parts.forEach(function (p) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life);
          g.fillStyle = p.c;
          if (p.sq) g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          else { g.beginPath(); g.arc(p.x, p.y, p.size * (p.fire ? 1 - p.t / p.life * 0.5 : 1), 0, TAU); g.fill(); }
        });
        g.globalAlpha = 1;
        st.bees.forEach(function (b) {
          g.save(); g.translate(b.x, b.y); g.scale(0.36 * b.dir, 0.36); art.bee(g, Math.sin(st.t / 25 + b.x)); g.restore();
        });
        st.pops.forEach(function (p) {
          var life = p.big ? 1300 : 800, age = (st.t - p.t0) / life;
          g.save(); g.translate(p.x, p.y - age * (p.big ? 30 : 46));
          var s = age < 0.15 ? 0.6 + age / 0.15 * 0.6 : 1.2 - Math.min(0.2, age - 0.15);
          g.scale(s, s);
          g.globalAlpha = age > 0.65 ? Math.max(0, 1 - (age - 0.65) / 0.35) : 1;
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 ' + (p.big ? 38 : 20) + 'px Poppins, sans-serif'; g.lineJoin = 'round';
          g.lineWidth = p.big ? 7 : 4; g.strokeStyle = 'rgba(17,17,17,0.9)'; g.strokeText(p.text, 0, 0);
          g.fillStyle = p.color; g.fillText(p.text, 0, 0);
          g.restore();
        });
        if (st.on && st.combo >= 2 && st.t - st.comboT < 1600) {
          g.textAlign = 'right'; g.textBaseline = 'top'; g.font = '800 22px Poppins, sans-serif'; g.lineJoin = 'round';
          var ct = 'Kombo ×' + Math.min(5, st.combo);
          g.lineWidth = 5; g.strokeStyle = 'rgba(17,17,17,0.9)'; g.strokeText(ct, W - 20, CHROME + 16);
          g.fillStyle = '#FDC506'; g.fillText(ct, W - 20, CHROME + 16);
        }
        drawBar();
        /* Werkzeug am Zeiger */
        var showTool = st.on && !st.paused && !inBar(st.my) && (hover ? st.inside : (st.swing > 0 || st.firing));
        if (showTool) {
          g.save(); g.translate(st.mx, st.my);
          if (st.tool === 'hammer') { g.translate(10, -6); g.rotate(-st.swing * 0.9); g.translate(-10, 6); }
          if (st.tool === 'flame' && st.firing) g.scale(1.15, 1.15);
          drawTool(g, st.tool, st.t);
          g.restore();
        }
        if (st.flash > 0) {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.fillStyle = 'rgba(255,230,128,' + st.flash * 0.3 + ')'; g.fillRect(0, 0, cv.width, cv.height);
        }
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.033, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.t >= DURATION) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }
      function idle(now) {
        if (st.on) return;
        st.t = now;
        render();
        idleRaf = requestAnimationFrame(idle);
      }
      function stop() {
        st.on = false; st.firing = false;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(idleRaf);
      }
      function finish() {
        stop();
        render();
        ctx.finish(st.score, { parts: st.destroyed, pages: st.pages, combo: st.bestCombo });
      }

      function pos(e) {
        var r = cv.getBoundingClientRect();
        st.mx = (e.clientX - r.left) / k; st.my = (e.clientY - r.top) / k;
      }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        pos(e); st.inside = true;
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        if (inBar(st.my)) { var tl = barTool(st.mx); if (tl) setTool(tl); return; }
        act(st.mx, st.my);
      });
      cv.addEventListener('pointermove', function (e) { pos(e); st.inside = true; });
      cv.addEventListener('pointerup', function () { st.firing = false; st.lastScorch = null; });
      cv.addEventListener('pointercancel', function () { st.firing = false; st.lastScorch = null; });
      cv.addEventListener('pointerleave', function () { st.inside = false; });

      resize();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf);
          cancelAnimationFrame(raf);
          st = fresh(0);
          layout();
          st.on = true;
          st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on; st.firing = false;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); st = fresh(0); resize(); },
        unmount: stop,
        resize: resize,
        key: function (e) {
          var i = ['1', '2', '3'].indexOf(e.key);
          if (i >= 0) { setTool(TOOLS[i].id); return true; }
          return e.key === ' ';
        },
        _debug: function () { return { st: st, W: W, act: act, setTool: setTool }; }
      };
    }
  });
})();

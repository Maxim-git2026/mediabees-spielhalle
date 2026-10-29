/* Spiel 5: A40-Flitzer (Ausweich-Racer) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, H = 600, LANES = 4, BASE_LANE = 84, PY = H - 118, TILE = 480;
  var START_SPEED = 360, MAX_GAIN = 540, RAMP = 80, TRAFFIC = 150;
  var PX_PER_POINT = 40, KM = 3000, HONEY = 50, CLOSE = 10;
  var CAR_W = 40, CAR_L = 74;
  var art = MBArcade.art, rr = art.rrect;
  var EXITS = [
    'Dortmund-Lütgendortmund', 'Bochum-Werne', 'Bochum-Zentrum', 'Bochum-Stahlhausen', 'Wattenscheid',
    'Gelsenkirchen', 'Essen-Kray', 'Essen-Zentrum', 'Essen-Frohnhausen', 'Mülheim-Heißen', 'Mülheim-Winkhausen',
    'Kreuz Kaiserberg', 'Duisburg-Homberg', 'Moers', 'Neukirchen-Vluyn', 'Kamp-Lintfort', 'Grenze Venlo'
  ];
  var KINDS = [
    { k: 'car', w: 40, l: 72, p: 0.5 },
    { k: 'bulli', w: 44, l: 86, p: 0.2 },
    { k: 'truck', w: 46, l: 150, p: 0.2 },
    { k: 'taxi', w: 40, l: 72, p: 0.1 }
  ];
  var CAR_COLORS = [['#C8CDD6', '#E3E6EC'], ['#2F6FD0', '#4C86E0'], ['#D3272F', '#E04A50'], ['#2E8B57', '#45A06C'], ['#F2F2F2', '#FFFFFF'], ['#4A4F5C', '#5E6472'], ['#E8902A', '#F0A64C']];
  var LABELS = ['Kumpel-Logistik', 'Halden-Express', 'Pott-Spedition', 'Pommes & Mayo', 'Stahl & Söhne'];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function exitFor(km) {
    if (km <= EXITS.length) return EXITS[km - 1];
    var n = km - EXITS.length;
    return n % 5 === 0 ? 'Ehrenrunde ' + n / 5 : null;
  }
  function fmtKm(km) { return km.toFixed(1).replace('.', ','); }

  /* Zeichnungen, Mitte = 0,0, Bug nach oben */
  function bulli(g, c) {
    g.lineJoin = 'round';
    rr(g, -22, -43, 44, 86, 9); g.fillStyle = c; g.fill();
    g.save(); g.clip(); g.fillStyle = '#F4F1E8'; g.fillRect(-22, -26, 44, 62); g.restore();
    rr(g, -22, -43, 44, 86, 9); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 1.5; g.beginPath();
    for (var y = -16; y < 34; y += 10) { g.moveTo(-17, y); g.lineTo(17, y); }
    g.stroke();
    rr(g, -17, -39, 34, 10, 3); g.fillStyle = '#1B2230'; g.fill();
    g.fillStyle = '#FFF6D6'; g.fillRect(-18, -42, 7, 3); g.fillRect(11, -42, 7, 3);
    g.fillStyle = '#E5322D'; g.fillRect(-19, 39, 7, 3); g.fillRect(12, 39, 7, 3);
  }
  function truck(g, cab, label) {
    g.lineJoin = 'round';
    g.fillStyle = '#222'; g.fillRect(-6, -44, 12, 10);
    rr(g, -21, -75, 42, 33, 7); g.fillStyle = cab; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = '#1B2230'; g.fillRect(-16, -70, 32, 8);
    g.fillStyle = '#FFF6D6'; g.fillRect(-18, -75, 7, 3); g.fillRect(11, -75, 7, 3);
    rr(g, -23, -36, 46, 111, 4); g.fillStyle = '#E8E6E0'; g.fill(); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,0.1)'; g.lineWidth = 1.5; g.beginPath();
    for (var y = -26; y < 72; y += 12) { g.moveTo(-21, y); g.lineTo(21, y); }
    g.stroke();
    g.save(); g.rotate(-Math.PI / 2);
    g.font = '800 13px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#111'; g.fillText(label, -19.5, 1, 100);
    g.restore();
    g.fillStyle = '#E5322D'; g.fillRect(-20, 72, 8, 3); g.fillRect(12, 72, 8, 3);
  }
  function taxi(g) {
    art.car(g, '#EDE3C8', '#F6EFDC');
    rr(g, -8, 1, 16, 7, 2); g.fillStyle = '#FDC506'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#111'; g.font = '800 5px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('TAXI', 0, 6.5);
  }
  function drawVehicle(g, o) {
    if (o.k === 'truck') truck(g, o.c[0], o.label);
    else if (o.k === 'bulli') bulli(g, o.c[0]);
    else if (o.k === 'taxi') taxi(g);
    else art.car(g, o.c[0], o.c[1]);
  }
  function drawHoney(g, x, y, s, t) {
    var f = 0.45 + 0.55 * Math.abs(Math.sin(t / 1000 * 30));
    g.save(); g.translate(x, y); g.scale(s, s);
    var gl = g.createRadialGradient(0, 0, 4, 0, 0, 30);
    gl.addColorStop(0, 'rgba(253,197,6,0.5)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.strokeStyle = 'rgba(17,17,17,0.55)'; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(-14, -9, 10, 4 * f + 1.5, -0.5, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(14, -9, 10, 4 * f + 1.5, 0.5, 0, TAU); g.fill(); g.stroke();
    rr(g, -11, -10, 22, 24, 6); g.fillStyle = '#E9A800'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#FFF6D6'; g.fillRect(-7, 0, 14, 8);
    g.fillStyle = '#C98A00'; g.font = '800 8px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('MB', 0, 7);
    rr(g, -7, -7, 3, 6, 1.5); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill();
    rr(g, -12, -16, 24, 7, 2); g.fillStyle = '#7A4A1A'; g.fill(); g.stroke();
    g.restore();
  }
  function drawShield(g, x, y, s, t) {
    var p = 1 + Math.sin(t / 160) * 0.06;
    g.save(); g.translate(x, y); g.scale(s * p, s * p);
    var gl = g.createRadialGradient(0, 0, 4, 0, 0, 30);
    gl.addColorStop(0, 'rgba(255,230,128,0.55)'); gl.addColorStop(1, 'rgba(255,230,128,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
    art.hex(g, 0, 0, 16, 'rgba(253,197,6,0.3)', '#FDC506', 3.5);
    art.hex(g, 0, 0, 8, '#FDC506', '#111', 2);
    g.restore();
  }

  MBArcade.register({
    id: 'flitzer',
    title: 'A40-Flitzer',
    duration: 0,
    startText: 'Ab auf den Ruhrschnellweg! Fahr den Bienenflitzer von Dortmund Richtung Venlo, schlängle dich durch den Feierabendverkehr und sammle Honig. Es wird immer schneller.',
    help: {
      legendTitle: 'So läuft die Fahrt',
      controls: [
        { icons: ['kbd:← →', 'kbd:A D'], text: 'Spur wechseln', kb: true },
        { icons: ['mouse-left'], text: 'Links oder rechts neben den Flitzer klicken' },
        { icons: ['swipe'], text: 'Nach links oder rechts wischen', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { drawHoney(g, 23, 25, 0.85, 0); }, text: 'Honigglas einsammeln', val: '+' + HONEY },
        { draw: function (g) { g.translate(23, 23); g.scale(0.5, 0.5); art.car(g, '#2F6FD0', '#4C86E0'); g.translate(-30, 18); art.flitzer(g, 0.5); }, text: 'In letzter Sekunde knapp vorbei', val: '+' + CLOSE },
        { draw: function (g) { drawShield(g, 23, 23, 0.9, 0); }, text: 'Wabenschild: Ein Rempler ist frei' },
        { draw: function (g) { g.translate(23, 25); g.rotate(0.5); g.scale(0.5, 0.5); art.flitzer(g, 0.2); }, text: 'Auffahren oder seitlich rammen', val: 'Ende', minus: true }
      ]
    },
    ranks: [
      [5000, 'Autobahn-Legende', 'Einmal Venlo und zurück!'],
      [2500, 'Ruhrschnellweg-Profi', 'Der Feierabendverkehr hat keine Chance.'],
      [1000, 'Pendler-Biene', 'Schöne Fahrt.'],
      [0, 'Blechschaden', 'Anschnallen und nochmal.']
    ],
    cta: { path: 'kontakt/', text: 'Deine Website soll auch Gas geben? Lass uns reden.' },
    stats: function (s) {
      var t = fmtKm(s.km) + ' km gefahren, ' + (s.exit ? 'zuletzt an der Ausfahrt ' + s.exit + ' vorbei.' : 'die erste Ausfahrt war noch nicht in Sicht.');
      return t + ' ' + s.honey + (s.honey === 1 ? ' Honigglas, ' : ' Honiggläser, ') + s.close + (s.close === 1 ? ' knappes Manöver.' : ' knappe Manöver.');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 960, k = 1, dpr = 1, laneW = BASE_LANE, sc = 1, roadL = 0, roadR = 0, grass = null;
      var lines = [], st = fresh(), raf = 0, idleRaf = 0, idleLast = 0;
      for (var li = 0; li < 14; li++) lines.push({ side: li % 2, f: Math.random(), y: Math.random(), l: rnd(40, 90) });

      function fresh() {
        return {
          on: false, paused: false, dead: false, deadT: 0, t: 0, last: 0,
          score: 0, bonus: 0, dist: 0, speed: START_SPEED, km: 0, exit: '',
          lane: 1, px: null, lastMove: -9999, moved: false, nudge: 0, spin: 0, spinV: 0,
          traffic: [], items: [], deco: [], parts: [], pops: [],
          gap: 420, safe: 1, decoIn: 0, shield: false, inv: 0,
          honey: 0, close: 0, passed: 0, sign: null, flash: 0, shake: 0, bump: 0
        };
      }
      function laneX(i) { return roadL + (i + 0.5) * laneW; }

      /* Wiese als Kachel, läuft nahtlos nach unten durch */
      function paintGrass() {
        var c = document.createElement('canvas');
        c.width = Math.ceil(W * k * dpr); c.height = Math.ceil(TILE * k * dpr);
        var x = c.getContext('2d');
        x.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        x.fillStyle = '#132219'; x.fillRect(0, 0, W, TILE);
        var r = art.rng(7);
        for (var i = 0; i < W * TILE / 900; i++) {
          var bx = r() * W, by = r() * TILE, br = 6 + r() * 26;
          x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(80,130,70,0.08)';
          for (var o = -1; o <= 1; o++) { x.beginPath(); x.ellipse(bx, by + o * TILE, br, br * 0.7, 0, 0, TAU); x.fill(); }
        }
        grass = c;
      }

      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(r.width * dpr);
        cv.height = Math.round(r.height * dpr);
        k = r.height / H;
        W = r.width / k;
        laneW = Math.min(BASE_LANE, (W - 44) / LANES);
        sc = laneW / BASE_LANE;
        roadL = W / 2 - laneW * LANES / 2;
        roadR = roadL + laneW * LANES;
        if (st.px === null || !st.on) st.px = laneX(st.lane);
        paintGrass();
        if (!st.deco.length) for (var y = -60; y < H + 40; y += rnd(40, 90)) addDeco(y);
        render();
      }

      function addDeco(y) {
        var side = Math.random() < 0.5 ? 0 : 1;
        var a = side ? roadR + 34 : 0, b = side ? W : roadL - 34;
        if (b - a < 6) return;
        var x = b - a < 24 ? (side ? rnd(a + 8, W + 6) : rnd(-6, b - 8)) : rnd(a + 10, b - 10);
        var far = side ? x - a : b - x;
        if (far > 70 && Math.random() < 0.3) st.deco.push({ k: 'house', x: x, y: y, w: rnd(44, 70), h: rnd(34, 50), c: pick(['#5A2E25', '#3F4655', '#6E4A2A']) });
        else st.deco.push({ k: 'tree', x: x, y: y, r: rnd(12, 24) * Math.max(0.7, sc) });
      }

      /* Eine Reihe Verkehr. Es bleibt immer eine erreichbare Lücke frei. */
      function spawnRow(over) {
        var ts = st.t / 1000, vr = st.speed - TRAFFIC;
        var a = st.safe, b = Math.max(0, Math.min(LANES - 1, a + Math.floor(Math.random() * 3) - 1));
        st.safe = b;
        var n = 1;
        if (Math.random() < Math.min(0.85, 0.3 + ts / 50)) n = 2;
        if (ts > 20 && Math.random() < Math.min(0.55, (ts - 20) / 90)) n = 3;
        var base = -10 - over, extent = 40;
        var breather = ts > 6 && Math.random() < 0.1;
        var lanes = [];
        for (var i = 0; i < LANES; i++) if (i !== b) lanes.push(i);
        lanes.sort(function () { return Math.random() - 0.5; });
        var blocked = breather ? [] : lanes.slice(0, n);
        blocked.forEach(function (ln) {
          var kd = KINDS[0], r = Math.random();
          for (var j = 0; j < KINDS.length; j++) { if (r < KINDS[j].p) { kd = KINDS[j]; break; } r -= KINDS[j].p; }
          var off = rnd(0, 40) * sc, len = kd.l * sc;
          st.traffic.push({ k: kd.k, lane: ln, w: kd.w * sc, len: len, y: base - off - len, c: pick(CAR_COLORS), label: pick(LABELS), passed: false });
          extent = Math.max(extent, off + len);
        });
        var free = [];
        for (var f = 0; f < LANES; f++) if (blocked.indexOf(f) < 0) free.push(f);
        if (breather) {
          var hl = pick(free);
          for (var h = 0; h < 3; h++) st.items.push({ k: 'honey', lane: hl, y: base - 30 - h * 70 * sc });
          extent = 40 + 140 * sc;
        } else if (!st.shield && ts > 12 && Math.random() < 0.06 && !st.items.some(function (it) { return it.k === 'shield'; })) {
          st.items.push({ k: 'shield', lane: pick(free), y: base - 30 });
        } else if (Math.random() < 0.35) {
          st.items.push({ k: 'honey', lane: Math.random() < 0.5 ? b : pick(free), y: base - 30 });
        }
        var react = Math.max(0.24, 0.5 - ts / 300);
        st.gap += extent + CAR_L * sc + vr * react + rnd(0, vr * 0.35) + 30;
      }

      function puff(x, y, colors, n, speed, grav, life) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: (life || 0.5) * (0.6 + Math.random() * 0.8), size: 1.5 + Math.random() * 3, c: colors[i % colors.length], g: grav || 0 });
        }
      }
      function pop(x, y, text, color) { st.pops.push({ x: x, y: y, text: text, color: color || '#FDC506', t0: st.t }); }
      function shakeIt(v) { if (!ctx.reduce) st.shake = Math.max(st.shake, v); }

      function move(d) {
        if (!st.on || st.paused || st.dead) return;
        st.moved = true;
        var nl = Math.max(0, Math.min(LANES - 1, st.lane + d));
        if (nl === st.lane) {
          st.nudge = d;
          ctx.tone(120, 80, 0.08, 'square', 0.03);
          return;
        }
        st.lane = nl;
        st.lastMove = st.t;
        ctx.tone(300, 520, 0.06, 'triangle', 0.03);
        puff(st.px - d * 12 * sc, PY + CAR_L * sc / 2, ['rgba(220,220,230,0.5)', 'rgba(180,180,190,0.4)'], 5, 50, 0, 0.45);
      }

      function crash(o) {
        var ox = laneX(o.lane), oy = o.y + o.len / 2;
        if (st.shield) {
          st.shield = false; st.inv = st.t + 1100;
          st.traffic.splice(st.traffic.indexOf(o), 1);
          puff(ox, oy, ['#FDC506', '#FFE680', '#FFFFFF', o.c[0]], 26, 300, 0, 0.6);
          shakeIt(0.25); st.flash = 0.6;
          pop(st.px, PY - 50 * sc, 'Schild weg!', '#FFE680');
          ctx.tone(700, 200, 0.25, 'square', 0.05);
          return;
        }
        st.dead = true; st.deadT = st.t; st.flash = 1;
        shakeIt(0.45);
        st.spinV = (st.px < ox ? -1 : 1) * rnd(6, 9);
        o.hit = true;
        var cx = (st.px + ox) / 2, cy = Math.max(o.y + o.len - 4, PY - CAR_L * sc / 2);
        puff(cx, cy, ['#FFE680', '#FDC506', '#FFFFFF', '#E8902A'], 30, 360, 300, 0.6);
        puff(cx, cy, ['rgba(60,60,70,0.6)', 'rgba(90,90,100,0.5)'], 10, 80, -40, 1);
        ctx.tone(200, 50, 0.4, 'sawtooth', 0.07);
        ctx.tone(90, 40, 0.3, 'square', 0.04, 0.05);
      }

      function hitBox(cx, cy, w, l, x, y, ow, ol) {
        return Math.abs(cx - x) < (w + ow) / 2 && Math.abs(cy - y) < (l + ol) / 2;
      }

      function update(dt) {
        st.t += dt * 1000;
        var ts = st.t / 1000;
        if (!st.dead) st.speed = START_SPEED + MAX_GAIN * (1 - Math.exp(-ts / RAMP));
        else st.speed = Math.max(0, st.speed - 1100 * dt);
        var vr = st.speed - TRAFFIC;
        st.dist += st.speed * dt;
        st.px += (laneX(st.lane) - st.px) * Math.min(1, dt * 16);
        st.nudge *= Math.max(0, 1 - dt * 10);
        if (st.dead) { st.spin += st.spinV * dt; st.spinV *= Math.max(0, 1 - dt * 3); }

        if (!st.dead) {
          var pts = Math.floor(st.dist / PX_PER_POINT) + st.bonus;
          if (pts !== st.score) { st.score = pts; ctx.setScore(pts); }
          var km = Math.floor(st.dist / KM);
          if (km > st.km) {
            st.km = km;
            var ex = exitFor(km);
            if (ex) {
              st.exit = ex;
              st.sign = { name: ex, km: km, t0: st.t };
              st.deco.push({ k: 'sign', x: roadR + 26, y: -70 });
              ctx.tone(660, 990, 0.12, 'triangle', 0.06); ctx.tone(990, 1320, 0.12, 'triangle', 0.05, 0.1);
            }
          }
          st.gap -= vr * dt;
          if (st.gap <= 0) spawnRow(st.gap);
        }

        var pw = CAR_W * sc * 0.88, pl = CAR_L * sc * 0.88;
        for (var i = st.traffic.length - 1; i >= 0; i--) {
          var o = st.traffic[i];
          o.y += vr * dt;
          if (o.y > H + 40 || o.y < -900) { st.traffic.splice(i, 1); continue; }
          if (st.dead) continue;
          var ox = laneX(o.lane);
          if (st.t > st.inv && hitBox(st.px, PY, pw, pl, ox, o.y + o.len / 2, o.w * 0.9, o.len * 0.94)) { crash(o); continue; }
          if (!o.passed && o.y > PY + CAR_L * sc / 2) {
            o.passed = true; st.passed++;
            var lat = Math.abs(ox - st.px);
            if (lat < laneW * 1.25 && st.t - st.lastMove < 700) {
              st.close++; st.bonus += CLOSE; st.bump = 1;
              pop((ox + st.px) / 2, PY - 10 * sc, 'Knapp! +' + CLOSE, '#FFFFFF');
              ctx.tone(1100, 1500, 0.07, 'triangle', 0.04);
            }
          }
        }
        for (var j = st.items.length - 1; j >= 0; j--) {
          var it = st.items[j];
          it.y += vr * dt;
          if (it.y > H + 40 || it.y < -900) { st.items.splice(j, 1); continue; }
          if (st.dead) continue;
          var ix = laneX(it.lane);
          if (hitBox(st.px, PY, pw, pl, ix, it.y, 30 * sc, 30 * sc)) {
            st.items.splice(j, 1);
            if (it.k === 'honey') {
              st.honey++; st.bonus += HONEY; st.bump = 1;
              pop(ix, it.y - 20 * sc, '+' + HONEY);
              puff(ix, it.y, ['#FDC506', '#FFE680', '#FFFFFF'], 14, 200, 0, 0.5);
              ctx.tone(880, 1320, 0.08, 'triangle', 0.05); ctx.tone(1320, 1760, 0.1, 'triangle', 0.04, 0.07);
            } else {
              st.shield = true;
              pop(ix, it.y - 20 * sc, 'Wabenschild!', '#FFE680');
              puff(ix, it.y, ['#FDC506', '#FFFFFF'], 18, 220, 0, 0.6);
              ctx.tone(520, 1040, 0.2, 'triangle', 0.06);
            }
          }
        }
        st.decoIn -= st.speed * dt;
        while (st.decoIn <= 0) { addDeco(-60); st.decoIn += rnd(40, 110); }
        for (var d = st.deco.length - 1; d >= 0; d--) {
          st.deco[d].y += st.speed * dt;
          if (st.deco[d].y > H + 80) st.deco.splice(d, 1);
        }
        for (var q = st.parts.length - 1; q >= 0; q--) {
          var p = st.parts[q];
          p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt + vr * dt * 0.3;
          if (p.t > p.life) st.parts.splice(q, 1);
        }
        st.pops = st.pops.filter(function (pp) { return st.t - pp.t0 < 900; });
        if (st.flash > 0) st.flash = Math.max(0, st.flash - dt * 2.5);
        st.bump = Math.max(0, st.bump - dt * 4);
        st.shake = Math.max(0, st.shake - dt);
      }

      /* Zeichnen */
      function drawRoad() {
        if (grass) {
          var gy = st.dist % TILE;
          g.drawImage(grass, 0, gy - TILE, W, TILE); g.drawImage(grass, 0, gy, W, TILE);
          if (gy + TILE < H) g.drawImage(grass, 0, gy + TILE, W, TILE);
        }
        g.fillStyle = '#23262E'; g.fillRect(roadL - 12, 0, roadR - roadL + 24, H);
        g.fillStyle = '#2A2D35'; g.fillRect(roadL, 0, roadR - roadL, H);
        /* Leitplanken mit Pfosten */
        var po = st.dist % 40;
        [roadL - 16, roadR + 16].forEach(function (x) {
          g.fillStyle = '#6B7385';
          for (var y = po - 40; y < H; y += 40) g.fillRect(x - 2, y, 4, 4);
          g.fillStyle = '#9AA2B4'; g.fillRect(x - 1.5, 0, 3, H);
        });
        /* Laternen-Licht */
        var lo = st.dist % 260;
        for (var ly = lo - 260; ly < H + 100; ly += 260) {
          [[roadL + 18, ly], [roadR - 18, ly + 130]].forEach(function (l) {
            var gl = g.createRadialGradient(l[0], l[1], 4, l[0], l[1], 90);
            gl.addColorStop(0, 'rgba(255,214,120,0.2)'); gl.addColorStop(1, 'rgba(255,214,120,0)');
            g.fillStyle = gl; g.fillRect(l[0] - 90, l[1] - 90, 180, 180);
          });
        }
        g.fillStyle = 'rgba(255,255,255,0.85)';
        g.fillRect(roadL + 2, 0, 3, H); g.fillRect(roadR - 5, 0, 3, H);
        var dofs = st.dist % 70;
        g.fillStyle = 'rgba(255,255,255,0.6)';
        for (var b = 1; b < LANES; b++) {
          var bx = roadL + b * laneW;
          for (var dy = dofs - 70; dy < H; dy += 70) g.fillRect(bx - 1.5, dy, 3, 32);
        }
      }

      function drawLamps() {
        var lo = st.dist % 260;
        for (var ly = lo - 260; ly < H + 100; ly += 260) {
          [[roadL - 24, roadL + 18, ly], [roadR + 24, roadR - 18, ly + 130]].forEach(function (l) {
            g.strokeStyle = '#3F4655'; g.lineWidth = 3;
            g.beginPath(); g.moveTo(l[0], l[2]); g.lineTo(l[1], l[2]); g.stroke();
            g.beginPath(); g.arc(l[1], l[2], 4, 0, TAU); g.fillStyle = '#FFE9A8'; g.fill();
          });
        }
      }

      function drawDeco(d) {
        if (d.k === 'tree') {
          g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.arc(d.x + 4, d.y + 6, d.r, 0, TAU); g.fill();
          g.fillStyle = '#1C3A25'; g.beginPath(); g.arc(d.x, d.y, d.r, 0, TAU); g.fill();
          g.fillStyle = '#28502F'; g.beginPath(); g.arc(d.x - d.r * 0.25, d.y - d.r * 0.25, d.r * 0.55, 0, TAU); g.fill();
        } else if (d.k === 'house') {
          var x = d.x - d.w / 2, y = d.y - d.h / 2;
          g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 5, y + 6, d.w, d.h);
          g.fillStyle = d.c; g.fillRect(x, y, d.w / 2, d.h);
          g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + d.w / 2, y, d.w / 2, d.h);
          g.fillStyle = d.c; g.globalAlpha = 0.75; g.fillRect(x + d.w / 2, y, d.w / 2, d.h); g.globalAlpha = 1;
          g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x + d.w / 2 - 1, y, 2, d.h);
          g.fillStyle = '#2A1A14'; g.fillRect(x + d.w * 0.7, y + d.h * 0.2, 7, 7);
        } else {
          g.fillStyle = '#9AA2B4'; g.fillRect(d.x - 1.5, d.y, 3, 26);
          rr(g, d.x - 4, d.y - 26, 52, 28, 3); g.fillStyle = '#1E4FA0'; g.fill();
          g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke();
          g.fillStyle = '#fff'; g.fillRect(d.x + 2, d.y - 19, 30, 3); g.fillRect(d.x + 2, d.y - 12, 22, 3);
          g.beginPath(); g.moveTo(d.x + 36, d.y - 6); g.lineTo(d.x + 44, d.y - 14); g.lineTo(d.x + 44, d.y - 6); g.closePath(); g.fill();
        }
      }

      function drawPlayer() {
        var len = CAR_L * sc, top = PY - len / 2;
        /* Scheinwerfer */
        if (!st.dead) {
          var cone = g.createLinearGradient(0, top, 0, top - 190 * sc);
          cone.addColorStop(0, 'rgba(255,240,190,0.32)'); cone.addColorStop(1, 'rgba(255,240,190,0)');
          g.fillStyle = cone; g.beginPath();
          g.moveTo(st.px - 16 * sc, top); g.lineTo(st.px + 16 * sc, top);
          g.lineTo(st.px + 46 * sc, top - 190 * sc); g.lineTo(st.px - 46 * sc, top - 190 * sc); g.closePath(); g.fill();
        }
        if (st.t < st.inv && Math.floor(st.t / 90) % 2) return;
        g.save();
        g.translate(st.px + st.nudge * 6 * sc, PY);
        var tilt = (laneX(st.lane) - st.px) / laneW * 0.32;
        g.rotate(st.dead ? st.spin : tilt);
        g.scale(sc, sc);
        g.fillStyle = 'rgba(0,0,0,0.35)'; rr(g, -19, -33, 42, 74, 12); g.fill();
        art.flitzer(g, st.dead ? 0.2 : Math.sin(st.t / 1000 * 40));
        g.restore();
        if (st.shield) {
          var p = 1 + Math.sin(st.t / 140) * 0.05;
          g.save(); g.globalAlpha = 0.85;
          art.hex(g, st.px, PY, 50 * sc * p, 'rgba(253,197,6,0.12)', '#FDC506', 2.5);
          g.restore();
        }
      }

      function drawTraffic(o) {
        var x = laneX(o.lane), cy = o.y + o.len / 2;
        g.save(); g.translate(x, cy);
        if (o.hit) g.rotate(-st.spin * 0.25);
        g.scale(o.len / (o.k === 'truck' ? 150 : o.k === 'bulli' ? 86 : 72), o.len / (o.k === 'truck' ? 150 : o.k === 'bulli' ? 86 : 72));
        var hl = o.k === 'truck' ? 75 : o.k === 'bulli' ? 43 : 36;
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-18, -hl + 5, 40, hl * 2);
        drawVehicle(g, o);
        var gl = g.createRadialGradient(0, hl, 2, 0, hl, 26);
        gl.addColorStop(0, 'rgba(255,60,50,0.4)'); gl.addColorStop(1, 'rgba(255,60,50,0)');
        g.fillStyle = gl; g.fillRect(-30, hl - 12, 60, 38);
        g.restore();
      }

      /* Anzeige oben links: in der Wiese, wenn Platz ist, sonst klein in der Ecke */
      function hudScale() { return Math.max(0.62, Math.min(1, (roadL - 30) / 180)); }

      function drawSign(s, hs) {
        var age = (st.t - s.t0) / 1000;
        if (age > 2.6) { st.sign = null; return; }
        var e = age < 0.35 ? age / 0.35 : age > 2.2 ? 1 - (age - 2.2) / 0.4 : 1;
        g.font = '700 17px Poppins, sans-serif';
        var w = Math.min(Math.max(150, W * 0.55 / hs), Math.max(g.measureText(s.name).width, 110) + 30), h = 50;
        var x = -(age < 0.35 ? (1 - e) * 40 : 0), y = 66;
        g.save();
        g.globalAlpha = Math.max(0, Math.min(1, e * 1.4)) * (hs < 1 ? 0.9 : 1);
        rr(g, x, y, w, h, 6); g.fillStyle = '#1E4FA0'; g.fill();
        g.lineWidth = 2.5; g.strokeStyle = '#111'; g.stroke();
        rr(g, x + 4, y + 4, w - 8, h - 8, 3); g.lineWidth = 1.5; g.strokeStyle = '#fff'; g.stroke();
        g.fillStyle = '#fff'; g.textAlign = 'left';
        g.font = '600 10px Poppins, sans-serif'; g.fillText(s.top || 'Ausfahrt · km ' + s.km, x + 12, y + 19);
        g.font = '700 17px Poppins, sans-serif'; g.fillText(s.name, x + 12, y + 38, w - 24);
        g.restore();
      }

      function drawHint() {
        var txt = ctx.touch() ? 'Nach links oder rechts wischen' : '← → oder A D: Spur wechseln';
        var fs = 15;
        g.font = '700 ' + fs + 'px Poppins, sans-serif';
        var w = Math.min(W - 20, g.measureText(txt).width + fs * 1.6), h = fs * 2.1;
        var cx = W / 2, cy = PY - 120;
        g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
        rr(g, cx - w / 2, cy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.85)'; g.fill();
        g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(txt, cx, cy + 1, w - 16);
        g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = 10 * Math.min(1, st.shake / 0.2); sx = (Math.random() * 2 - 1) * m * k * dpr; sy = (Math.random() * 2 - 1) * m * k * dpr; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#132219'; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(k * dpr, 0, 0, k * dpr, sx, sy);
        drawRoad();
        st.deco.forEach(function (d) { if (d.k !== 'sign') drawDeco(d); });
        st.items.forEach(function (it) {
          if (it.k === 'honey') drawHoney(g, laneX(it.lane), it.y, sc, st.t + it.y * 3);
          else drawShield(g, laneX(it.lane), it.y, sc, st.t);
        });
        drawPlayer();
        st.traffic.forEach(drawTraffic);
        st.parts.forEach(function (p) {
          g.globalAlpha = Math.max(0, 1 - p.t / p.life);
          g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fillStyle = p.c; g.fill();
        });
        g.globalAlpha = 1;
        drawLamps();
        st.deco.forEach(function (d) { if (d.k === 'sign') drawDeco(d); });
        /* Fahrtwind ab Tempo */
        if (!ctx.reduce && st.speed > 520 && !st.dead) {
          g.fillStyle = 'rgba(255,255,255,' + Math.min(0.3, (st.speed - 520) / 1200) + ')';
          lines.forEach(function (l) {
            var x = l.side ? roadR - 8 - l.f * laneW * 1.2 : roadL + 8 + l.f * laneW * 1.2;
            var y = (l.y * (H + 200) + st.dist * 1.4) % (H + 200) - 100;
            g.fillRect(x, y, 2, l.l);
          });
        }
        st.pops.forEach(function (p) {
          var age = (st.t - p.t0) / 900;
          g.save(); g.translate(p.x, p.y - age * 40);
          var s = age < 0.15 ? 0.6 + age / 0.15 * 0.6 : 1.2 - Math.min(0.2, (age - 0.15));
          g.scale(s, s);
          g.globalAlpha = age > 0.6 ? Math.max(0, 1 - (age - 0.6) / 0.4) : 1;
          g.textAlign = 'center'; g.font = '800 20px Poppins, sans-serif'; g.lineJoin = 'round';
          g.lineWidth = 4; g.strokeStyle = 'rgba(17,17,17,0.85)'; g.strokeText(p.text, 0, 0);
          g.fillStyle = p.color; g.fillText(p.text, 0, 0);
          g.restore();
        });
        if (st.on || st.score) {
          var hs = hudScale();
          g.save(); g.translate(12, 10); g.scale(hs, hs);
          g.textAlign = 'left'; g.lineJoin = 'round';
          g.font = '800 34px Poppins, sans-serif';
          var txtW = g.measureText(String(st.score)).width;
          var bs = 1 + st.bump * 0.25;
          g.save(); g.translate(0, 32); g.scale(bs, bs);
          g.lineWidth = 6; g.strokeStyle = 'rgba(17,17,17,0.8)'; g.strokeText(String(st.score), 0, 0);
          g.fillStyle = st.bump > 0.5 ? '#FDC506' : '#FFFFFF'; g.fillText(String(st.score), 0, 0);
          g.restore();
          if (st.shield) art.hex(g, txtW + 22, 20, 11, 'rgba(253,197,6,0.35)', '#FDC506', 2.5);
          g.font = '700 13px Poppins, sans-serif';
          g.lineWidth = 4; g.strokeStyle = 'rgba(17,17,17,0.8)';
          var info = 'km ' + fmtKm(st.dist / KM) + ' · ' + Math.round(st.speed / 4) + ' km/h';
          g.strokeText(info, 0, 52); g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText(info, 0, 52);
          if (st.sign) drawSign(st.sign, hs);
          g.restore();
        }
        if (st.on && !st.moved && !st.paused && st.t < 6000) drawHint();
        if (st.flash > 0) {
          g.setTransform(1, 0, 0, 1, 0, 0);
          g.fillStyle = st.dead ? 'rgba(255,74,61,' + (st.flash * 0.3) + ')' : 'rgba(255,230,128,' + (st.flash * 0.3) + ')';
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

      /* Vor dem Start: der Flitzer rollt gemütlich */
      function idle(now) {
        if (st.on) return;
        var dt = idleLast ? Math.min(0.05, (now - idleLast) / 1000) : 0;
        idleLast = now;
        st.t += dt * 1000;
        st.dist += 90 * dt;
        st.decoIn -= 90 * dt;
        while (st.decoIn <= 0) { addDeco(-60); st.decoIn += rnd(40, 110); }
        for (var d = st.deco.length - 1; d >= 0; d--) { st.deco[d].y += 90 * dt; if (st.deco[d].y > H + 80) st.deco.splice(d, 1); }
        render();
        idleRaf = requestAnimationFrame(idle);
      }

      function stop() {
        st.on = false;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(idleRaf);
      }

      function finish() {
        stop();
        render();
        ctx.finish(st.score, { km: st.dist / KM, exit: st.exit, honey: st.honey, close: st.close });
      }

      /* Maus: neben den Flitzer klicken. Handy: wischen, auch mehrere Spuren in einem Zug. */
      var swipe = null;
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse') {
          if (e.button !== 0) return;
          e.preventDefault();
          var r = cv.getBoundingClientRect();
          move((e.clientX - r.left) / k < st.px ? -1 : 1);
          return;
        }
        e.preventDefault();
        swipe = { id: e.pointerId, x: e.clientX, y: e.clientY };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      });
      cv.addEventListener('pointermove', function (e) {
        if (!swipe || e.pointerId !== swipe.id) return;
        var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
        if (Math.abs(dx) < 24 || Math.abs(dx) < Math.abs(dy)) return;
        move(dx > 0 ? 1 : -1);
        swipe.x = e.clientX; swipe.y = e.clientY;
      });
      cv.addEventListener('pointerup', function () { swipe = null; });
      cv.addEventListener('pointercancel', function () { swipe = null; });

      resize();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf);
          cancelAnimationFrame(raf);
          var deco = st.deco;
          st = fresh();
          st.deco = deco;
          st.px = laneX(st.lane);
          st.on = true;
          st.last = performance.now();
          st.sign = { top: 'Auffahrt A40', name: 'Dortmund', km: 0, t0: 0 };
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          ctx.tone(220, 440, 0.25, 'sawtooth', 0.035);
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on;
          swipe = null;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); st = fresh(); resize(); },
        unmount: stop,
        resize: resize,
        key: function (e) {
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { if (!e.repeat) move(-1); return true; }
          if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { if (!e.repeat) move(1); return true; }
          return e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown';
        },
        _debug: function () { return { st: st, W: W, laneW: laneW, sc: sc, laneX: laneX }; }
      };
    }
  });
})();

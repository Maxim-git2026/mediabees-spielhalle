/* Spiel 18: Wimmelpott (Wimmelbild: in einer zufälligen Szene drei Dinge finden, gegen die Uhr) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, LEVEL_S = 45, WRONG_S = 3, HINT_S = 5, TOP = 34;
  var art = MBArcade.art, rr = art.rrect;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }

  var COL = { rot: '#E5322D', blau: '#2F6FD0', lila: '#9B59D0', weiss: '#F2F2F2', pink: '#FF8AD8', orange: '#FF9F1A', gelb: '#FDC506' };
  /* Adjektive für die Ansage (männlich / weiblich / sächlich, Nominativ) */
  function adj(c, gen) { var base = { rot: 'rot', blau: 'blau', lila: 'lila', weiss: 'weiß', pink: 'pink', orange: 'orange', gelb: 'gelb' }[c]; if (base === 'lila' || base === 'pink' || base === 'orange') return base.charAt(0).toUpperCase() + base.slice(1) + 'farben' + (gen === 'm' ? 'er' : gen === 'f' ? 'e' : 'es'); return base.charAt(0).toUpperCase() + base.slice(1) + (gen === 'm' ? 'er' : gen === 'f' ? 'e' : 'es'); }
  function dat(c) { return { rot: 'rotem', blau: 'blauem', lila: 'lilafarbenem', weiss: 'weißem', pink: 'pinkem', orange: 'orangem', gelb: 'gelbem' }[c]; }

  /* Bienen-Zubehör, Koordinaten passend zu art.bee (Kopf bei 11,2) bzw. art.wasp (Kopf bei 13.5,2) */
  function hat(g, x, y, c) { g.fillStyle = c; g.strokeStyle = '#111'; g.lineWidth = 1.5; g.fillRect(x - 6, y - 13, 12, 11); g.strokeRect(x - 6, y - 13, 12, 11); g.fillRect(x - 9, y - 3, 18, 3); g.strokeRect(x - 9, y - 3, 18, 3); g.fillStyle = '#FDC506'; g.fillRect(x - 6, y - 6, 12, 2.5); }
  function shades(g, x, y) { g.fillStyle = '#111'; rr(g, x - 7, y - 3, 6.5, 5, 1.5); g.fill(); rr(g, x + 0.5, y - 3, 6.5, 5, 1.5); g.fill(); g.fillRect(x - 1, y - 2, 2, 1.2); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x - 5.5, y - 2, 2, 1.2); }
  function scarf(g, x, y, c) { g.fillStyle = c; g.strokeStyle = '#111'; g.lineWidth = 1.3; rr(g, x - 3, y - 9, 6, 18, 2.5); g.fill(); g.stroke(); rr(g, x - 1, y + 4, 4, 11, 2); g.fill(); g.stroke(); }
  function crown(g, x, y) { g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x - 7, y - 7); g.lineTo(x - 3.5, y - 3); g.lineTo(x, y - 9); g.lineTo(x + 3.5, y - 3); g.lineTo(x + 7, y - 7); g.lineTo(x + 7, y); g.closePath(); g.fillStyle = '#FDC506'; g.fill(); g.strokeStyle = '#7A4A1A'; g.lineWidth = 1.3; g.stroke(); }

  /* Wimmel-Teile: Varianten mit Ansage-Text und Zeichnung (Mitte 0,0, etwa 60 breit) */
  var TYPES = [
    { id: 'bee', vars: [['plain', 'Biene'], ['brille', 'Biene mit Sonnenbrille'], ['hut', 'Biene mit Zylinder'], ['krone', 'Biene mit Krone'], ['schal', 'Biene mit rotem Schal']],
      draw: function (g, v, w) { g.scale(0.95, 0.95); art.bee(g, w); if (v === 'brille') shades(g, 13, 0); if (v === 'hut') hat(g, 11, -6, '#222'); if (v === 'krone') crown(g, 11, -7); if (v === 'schal') scarf(g, 1, 3, COL.rot); } },
    { id: 'wasp', vars: [['plain', 'Wespe'], ['brille', 'Wespe mit Sonnenbrille'], ['hut', 'Wespe mit Zylinder']],
      draw: function (g, v, w) { art.wasp(g, w); if (v === 'brille') shades(g, 14, 1); if (v === 'hut') hat(g, 13, -4, '#222'); } },
    { id: 'jar', vars: [['rot', 'Honigglas mit rotem Deckel'], ['blau', 'Honigglas mit blauem Deckel'], ['lila', 'Honigglas mit lilafarbenem Deckel'], ['weiss', 'Honigglas mit weißem Deckel']],
      draw: function (g, v) { rr(g, -15, -14, 30, 34, 7); g.fillStyle = '#E9A800'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = '#111'; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(-10, -8, 4, 20); rr(g, -17, -22, 34, 9, 3); g.fillStyle = COL[v]; g.fill(); g.stroke(); rr(g, -8, 0, 16, 10, 2); g.fillStyle = '#FFF6D6'; g.fill(); } },
    { id: 'balloon', vars: ['rot', 'blau', 'gelb', 'lila'].map(function (c) { return [c, adj(c, 'm') + ' Ballon']; }),
      draw: function (g, v) { g.strokeStyle = '#555'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(0, 12); g.quadraticCurveTo(5, 22, -2, 32); g.stroke(); g.beginPath(); g.ellipse(0, -6, 14, 18, 0, 0, TAU); g.fillStyle = COL[v]; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke(); g.beginPath(); g.ellipse(-5, -12, 3.5, 6, -0.4, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fill(); g.beginPath(); g.moveTo(-3, 12); g.lineTo(3, 12); g.lineTo(0, 15); g.closePath(); g.fillStyle = COL[v]; g.fill(); } },
    { id: 'car', vars: ['rot', 'blau', 'weiss', 'gelb'].map(function (c) { return [c, adj(c, 'n') + ' Auto']; }),
      draw: function (g, v) { g.lineWidth = 2; g.strokeStyle = '#111'; g.beginPath(); g.moveTo(-26, 8); g.lineTo(-26, -2); g.lineTo(-16, -4); g.lineTo(-9, -15); g.lineTo(10, -15); g.lineTo(17, -4); g.lineTo(26, -2); g.lineTo(26, 8); g.closePath(); g.fillStyle = COL[v]; g.fill(); g.stroke(); g.fillStyle = '#BFE3FF'; g.beginPath(); g.moveTo(-7, -12); g.lineTo(-1, -12); g.lineTo(-1, -5); g.lineTo(-12, -5); g.closePath(); g.fill(); g.beginPath(); g.moveTo(2, -12); g.lineTo(8, -12); g.lineTo(13, -5); g.lineTo(2, -5); g.closePath(); g.fill(); [-15, 15].forEach(function (x) { g.beginPath(); g.arc(x, 9, 6, 0, TAU); g.fillStyle = '#222'; g.fill(); g.beginPath(); g.arc(x, 9, 2.5, 0, TAU); g.fillStyle = '#BBB'; g.fill(); }); } },
    { id: 'flower', vars: ['rot', 'blau', 'weiss', 'lila'].map(function (c) { return [c, adj(c, 'f') + ' Blume']; }),
      draw: function (g, v) { g.strokeStyle = '#3C7A3C'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, 26); g.stroke(); g.beginPath(); g.ellipse(6, 18, 6, 2.5, -0.5, 0, TAU); g.fillStyle = '#3C7A3C'; g.fill(); for (var i = 0; i < 6; i++) { g.save(); g.rotate(i / 6 * TAU); g.beginPath(); g.ellipse(8, 0, 7, 4.5, 0, 0, TAU); g.fillStyle = COL[v]; g.fill(); g.lineWidth = 1.2; g.strokeStyle = '#111'; g.stroke(); g.restore(); } g.beginPath(); g.arc(0, 0, 4.5, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); g.stroke(); } },
    { id: 'umbrella', vars: ['rot', 'blau', 'gelb', 'pink'].map(function (c) { return [c, adj(c, 'm') + ' Schirm']; }),
      draw: function (g, v) { g.strokeStyle = '#333'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 18); g.quadraticCurveTo(0, 24, -6, 22); g.stroke(); g.beginPath(); g.moveTo(-22, -6); g.quadraticCurveTo(-20, -24, 0, -24); g.quadraticCurveTo(20, -24, 22, -6); for (var i = 0; i < 4; i++) { var x0 = 22 - i * 11; g.quadraticCurveTo(x0 - 5.5, -10, x0 - 11, -6); } g.closePath(); g.fillStyle = COL[v]; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke(); } },
    { id: 'fries', vars: [['ketchup', 'Pommes mit Ketchup'], ['mayo', 'Pommes mit Mayo'], ['schranke', 'Pommes Schranke'], ['ohne', 'Pommes ohne alles']],
      draw: function (g, v) {
        g.fillStyle = '#F2C54A'; g.strokeStyle = '#8A6A10'; g.lineWidth = 1;
        for (var i = 0; i < 7; i++) { var x = -12 + i * 4; g.save(); g.translate(x, -6); g.rotate((i - 3) * 0.08); g.fillRect(-1.6, -12, 3.2, 16); g.strokeRect(-1.6, -12, 3.2, 16); g.restore(); }
        if (v === 'ketchup' || v === 'schranke') { g.fillStyle = '#C8231C'; g.beginPath(); g.ellipse(v === 'schranke' ? -5 : 0, -12, v === 'schranke' ? 6 : 10, 4, 0, 0, TAU); g.fill(); }
        if (v === 'mayo' || v === 'schranke') { g.fillStyle = '#FFFDF0'; g.beginPath(); g.ellipse(v === 'schranke' ? 6 : 0, -12, v === 'schranke' ? 6 : 10, 4, 0, 0, TAU); g.fill(); }
        g.beginPath(); g.moveTo(-15, -4); g.lineTo(15, -4); g.lineTo(11, 18); g.lineTo(-11, 18); g.closePath(); g.fillStyle = '#E5322D'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
        g.fillStyle = '#FFFFFF'; g.font = '900 7px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('POMMES', 0, 7);
      } }
  ];
  var THEMES = [
    { name: 'Kirmes', sky: ['#1B1838', '#3A2450'], ground: '#2A2238', line: '#FDC506' },
    { name: 'Wiese', sky: ['#7EC0EE', '#CDEBFF'], ground: '#5E9E3C', line: '#3C7A3C' },
    { name: 'Zeche', sky: ['#3A2450', '#E99A3A'], ground: '#4A3420', line: '#8DB04A' }
  ];

  MBArcade.register({
    id: 'wimmel',
    title: 'Wimmelpott',
    duration: 0,
    startText: 'Im Pott ist was los! Finde die drei gesuchten Dinge im Gewimmel, bevor die Zeit abläuft. Falsch tippen kostet Zeit. Mit jedem Level wird es voller.',
    help: {
      legendTitle: 'Punkte',
      controls: [
        { icons: ['tap'], text: 'Gesuchtes Ding antippen. Unten steht, was gesucht wird', touch: true },
        { icons: ['mouse-left'], text: 'Gesuchtes Ding anklicken. Unten steht, was gesucht wird', kb: true },
        { icons: ['kbd:T'], text: 'Tipp (kostet 5 Sekunden), auch per Knopf unten', kb: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { g.translate(25, 24); g.scale(0.5, 0.5); TYPES[0].draw(g, 'brille', 0.3); }, text: 'Gesuchtes Ding gefunden', val: '100 × Level' },
        { draw: function (g) { g.strokeStyle = '#FF5A4A'; g.lineWidth = 4; g.beginPath(); g.moveTo(12, 12); g.lineTo(34, 34); g.moveTo(34, 12); g.lineTo(12, 34); g.stroke(); }, text: 'Falsches Ding angetippt', val: '−3 s', minus: true },
        { draw: function (g) { g.fillStyle = '#FDC506'; g.font = '900 20px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('⏱', 23, 31); }, text: 'Level geschafft: Restzeit als Bonus', val: '20 je s' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Deine Kunden sollen auf deiner Website alles sofort finden? Lass uns reden.' },
    stats: function (s) { return 'Level ' + s.level + ' erreicht, ' + s.found + (s.found === 1 ? ' Ding' : ' Dinge') + ' gefunden, ' + s.wrong + '-mal danebengetippt.'; },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 0, H = 0, dpr = 1, R = 24, BAR = 74, raf = 0, idleRaf = 0, scene = null;
      var st = fresh();

      function fresh() { return { on: false, paused: false, over: false, t: 0, last: 0, level: 1, score: 0, found: 0, wrong: 0, time: LEVEL_S, objs: [], targets: [], marks: [], parts: [], done: 0, hint: null, theme: THEMES[0] }; }
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        BAR = W < 560 ? Math.max(92, Math.min(110, H * 0.2)) : Math.max(64, Math.min(86, H * 0.16));
        R = Math.max(19, Math.min(30, Math.min(W, H) / 15));
        scene = null;
      }
      function area() { return { x: 6, y: TOP + 4, w: W - 12, h: H - TOP - BAR - 8 }; }

      /* Szene bauen: drei Ziele frei platzieren, dann viele andere Teile (gleiche Sorte, andere Variante = Ablenkung) */
      function build() {
        st.theme = THEMES[(st.level - 1) % THEMES.length];
        var a = area(), sc = R / 28, list = [];
        var types = shuffle(TYPES), targets = [];
        for (var i = 0; i < 3; i++) { var ty = types[i], v = pick(ty.vars.filter(function (x) { return x[0] !== 'plain'; })); targets.push({ type: ty, v: v[0], label: v[1], found: false }); }
        function key(t, v) { return t.id + ':' + v; }
        var tkeys = targets.map(function (t) { return key(t.type, t.v); });
        function free(x, y, r, strict) {
          if (x - r < a.x || x + r > a.x + a.w || y - r < a.y || y + r > a.y + a.h) return false;
          for (var j = 0; j < list.length; j++) { var o = list[j], d = Math.hypot(o.x - x, o.y - y); if (d < (o.r + r) * ((strict || o.target) ? 1.05 : 0.62)) return false; }
          return true;
        }
        targets.forEach(function (t) {
          for (var n = 0; n < 400; n++) { var x = rnd(a.x + R, a.x + a.w - R), y = rnd(a.y + R, a.y + a.h - R); if (free(x, y, R, true)) { list.push({ x: x, y: y, r: R, type: t.type, v: t.v, flip: Math.random() < 0.5, rot: rnd(-0.2, 0.2), target: t }); break; } }
        });
        var want = Math.round(Math.min(130, (a.w * a.h) / (R * R * 4.2) * Math.min(1, 0.55 + st.level * 0.09)));
        var tries = 0;
        while (list.length < want && tries++ < want * 60) {
          /* Ablenkung: oft die gleiche Sorte wie ein Ziel, aber andere Variante */
          var ty2 = Math.random() < 0.55 ? pick(targets).type : pick(TYPES);
          var opts = ty2.vars.filter(function (v) { return tkeys.indexOf(key(ty2, v[0])) < 0; });
          if (!opts.length) continue;
          var x2 = rnd(a.x + R, a.x + a.w - R), y2 = rnd(a.y + R, a.y + a.h - R), r2 = R * rnd(0.85, 1.05);
          if (!free(x2, y2, r2)) continue;
          list.push({ x: x2, y: y2, r: r2, type: ty2, v: pick(opts)[0], flip: Math.random() < 0.5, rot: rnd(-0.25, 0.25) });
        }
        /* Ziele nicht zuletzt zeichnen, damit sie nicht herausstechen */
        st.objs = shuffle(list); st.targets = targets; st.marks = []; st.done = 0; st.hint = null;
        st.time = LEVEL_S; scene = null; st.levelT = st.t;
      }
      function drawObj(x, o) {
        x.save(); x.translate(o.x, o.y); x.rotate(o.rot); var s = o.r / 28; x.scale(o.flip ? -s : s, s);
        o.type.draw(x, o.v, 0.4);
        x.restore();
      }
      function paintScene() {
        var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
        var th = st.theme, a = area();
        var gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, th.sky[0]); gr.addColorStop(0.5, th.sky[1]); gr.addColorStop(0.5, th.ground); gr.addColorStop(1, th.ground);
        x.fillStyle = gr; x.fillRect(0, 0, W, H);
        art.skyline(x, 0, W + 40, H * 0.5, th.name === 'Wiese' ? 'rgba(60,90,60,0.35)' : 'rgba(20,15,30,0.6)', art.rng(st.level), '#FDC506');
        /* Bodenmuster */
        var rg = art.rng(st.level * 7);
        for (var i = 0; i < W * H / 900; i++) { x.fillStyle = 'rgba(0,0,0,' + (0.05 + rg() * 0.08) + ')'; x.beginPath(); x.ellipse(rg() * W, H * 0.5 + rg() * H * 0.5, 4 + rg() * 10, 2 + rg() * 3, 0, 0, TAU); x.fill(); }
        if (th.name === 'Kirmes') for (var l = 0; l < W; l += 26) { x.beginPath(); x.arc(l + 13, 10 + Math.sin(l / 40) * 6, 3, 0, TAU); x.fillStyle = ['#FDC506', '#FF8AD8', '#7FD3FF'][(l / 26) % 3]; x.fill(); }
        st.objs.forEach(function (o) { drawObj(x, o); });
        scene = c;
      }

      function hit(px, py) {
        for (var i = st.objs.length - 1; i >= 0; i--) { var o = st.objs[i]; if (Math.hypot(px - o.x, py - o.y) < o.r * 1.05) return o; }
        return null;
      }
      function burst(x, y, colors, n, sp) { if (ctx.reduce) n = Math.ceil(n / 2); for (var i = 0; i < n; i++) { var a = Math.random() * TAU, v = sp * rnd(0.3, 1); st.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, t: 0, life: rnd(0.4, 0.8), s: rnd(2, 5), c: pick(colors) }); } }
      function tapAt(px, py) {
        if (!st.on || st.paused || st.levelDone) return;
        var b = hintBtn();
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) { useHint(); return; }
        if (py > H - BAR) return;
        var o = hit(px, py);
        if (!o) return;
        if (o.target && !o.target.found) {
          o.target.found = true; st.found++; st.done++;
          var pts = 100 * st.level; st.score += pts; ctx.setScore(st.score);
          st.marks.push({ x: o.x, y: o.y, r: o.r, ok: true, t0: st.t });
          ctx.fx.ring(o.x, o.y, '#8DD45A', o.r * 2.2, 5, 400); ctx.fx.text(o.x, o.y - o.r - 10, 'Gefunden! +' + pts, '#8DD45A', 20);
          burst(o.x, o.y, ['#8DD45A', '#FDC506', '#FFFFFF'], 16, 220);
          ctx.tone(660, 990, 0.1, 'triangle', 0.05); ctx.tone(990, 1320, 0.12, 'triangle', 0.05, 0.08);
          if (st.hint && st.hint.target === o.target) st.hint = null;
          if (st.done >= 3) levelDone();
        } else if (!o.target) {
          st.wrong++; st.time = Math.max(0, st.time - WRONG_S);
          st.marks.push({ x: o.x, y: o.y, r: o.r, ok: false, t0: st.t });
          ctx.fx.shake(0.15, 4); ctx.fx.text(o.x, o.y - o.r - 8, pick(['Nee!', 'Falsch!', 'Das nicht!', 'Leider nein!']) + ' −' + WRONG_S + ' s', '#FF7A6B', 18);
          ctx.tone(220, 140, 0.15, 'square', 0.04);
        }
      }
      function useHint() {
        var left = st.targets.filter(function (t) { return !t.found; });
        if (!left.length || st.time <= HINT_S) return;
        var t = pick(left), o = st.objs.filter(function (x) { return x.target === t; })[0];
        st.time -= HINT_S;
        st.hint = { target: t, x: o.x + rnd(-1, 1) * R * 1.5, y: o.y + rnd(-1, 1) * R * 1.5, t0: st.t };
        ctx.tone(500, 700, 0.1, 'triangle', 0.04);
      }
      function levelDone() {
        st.levelDone = st.t;
        var bonus = Math.ceil(st.time) * 20;
        st.score += bonus; ctx.setScore(st.score);
        ctx.fx.banner('Alles gefunden! +' + bonus, '#FDC506', 34); ctx.fx.flash('253,197,6', 0.5);
        ctx.fx.sparkle(W / 2, H * 0.45, ['#FDC506', '#8DD45A', '#FFFFFF', '#FF8AD8'], 34, 340);
        ctx.tone(523, 784, 0.12, 'triangle', 0.06); ctx.tone(784, 1046, 0.2, 'triangle', 0.06, 0.12);
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var p = st.parts[q]; p.t += dt; p.vy += 400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > p.life) st.parts.splice(q, 1); }
        if (st.levelDone) {
          if (st.t - st.levelDone > 1800) { st.levelDone = 0; st.level++; build(); ctx.fx.banner('Level ' + st.level + ': ' + st.theme.name, '#FFFFFF', 32); }
          return;
        }
        var before = st.time;
        st.time -= dt;
        if (before > 10 && st.time <= 10) ctx.tone(880, 660, 0.1, 'square', 0.03);
        if (st.time <= 10 && Math.floor(before) !== Math.floor(st.time)) ctx.tone(1200, 1100, 0.04, 'square', 0.02);
        if (st.time <= 0) {
          st.time = 0;
          /* Zeit um: zeigen, wo die fehlenden Dinge waren */
          st.objs.forEach(function (o) { if (o.target && !o.target.found) st.marks.push({ x: o.x, y: o.y, r: o.r, miss: true, t0: st.t }); });
          ctx.fx.banner('Zeit um!', '#FF7A6B', 36); ctx.fx.flash('255,74,61', 0.6);
          ctx.tone(400, 100, 0.6, 'sawtooth', 0.05);
          st.endT = st.t; st.levelDone = 0; st.timeUp = true;
        }
      }

      function hintBtn() { var w = Math.min(84, W * 0.2); return { x: W - w - 8, y: H - BAR + 8, w: w, h: BAR - 16 }; }
      function render() {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!st.objs.length) { g.fillStyle = '#1A1A1A'; g.fillRect(0, 0, W, H); return; }
        if (!scene) paintScene();
        g.drawImage(scene, 0, 0, W, H);
        /* Markierungen */
        st.marks.forEach(function (m) {
          var a = Math.min(1, (st.t - m.t0) / 200);
          if (m.ok || m.miss) {
            g.beginPath(); g.arc(m.x, m.y, m.r * (1.15 + (1 - a) * 0.6), 0, TAU); g.lineWidth = 4; g.strokeStyle = m.miss ? (Math.floor(st.t / 250) % 2 ? '#FF5A4A' : '#FFFFFF') : '#8DD45A'; g.stroke();
            if (m.ok) { g.fillStyle = 'rgba(141,212,90,0.25)'; g.fill(); }
          } else if (st.t - m.t0 < 900) {
            g.globalAlpha = 1 - (st.t - m.t0) / 900; g.strokeStyle = '#FF5A4A'; g.lineWidth = 4; g.lineCap = 'round';
            g.beginPath(); g.moveTo(m.x - m.r * 0.6, m.y - m.r * 0.6); g.lineTo(m.x + m.r * 0.6, m.y + m.r * 0.6); g.moveTo(m.x + m.r * 0.6, m.y - m.r * 0.6); g.lineTo(m.x - m.r * 0.6, m.y + m.r * 0.6); g.stroke(); g.globalAlpha = 1;
          }
        });
        if (st.hint) { var hp = 0.5 + 0.5 * Math.sin(st.t / 150); g.beginPath(); g.arc(st.hint.x, st.hint.y, R * 3.2, 0, TAU); g.lineWidth = 3; g.strokeStyle = 'rgba(253,197,6,' + (0.4 + hp * 0.5) + ')'; g.setLineDash([8, 6]); g.stroke(); g.setLineDash([]); }
        st.parts.forEach(function (p) { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillStyle = p.c; g.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); });
        g.globalAlpha = 1;
        /* Leiste oben: Level und Zeit */
        g.fillStyle = 'rgba(17,17,17,0.85)'; g.fillRect(0, 0, W, TOP);
        g.font = '800 13px Poppins, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#FFFFFF';
        g.fillText('Level ' + st.level + ' · ' + st.theme.name, 10, TOP / 2);
        var tw = Math.min(220, W * 0.4), tx = W - tw - 54, f = st.time / LEVEL_S;
        rr(g, tx, TOP / 2 - 5, tw, 10, 5); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fill();
        rr(g, tx, TOP / 2 - 5, tw * Math.max(0, f), 10, 5); g.fillStyle = st.time > 10 ? '#FDC506' : (Math.floor(st.t / 250) % 2 ? '#FF5A4A' : '#FF9F1A'); g.fill();
        g.textAlign = 'right'; g.font = '900 15px Poppins, sans-serif'; g.fillStyle = st.time > 10 ? '#FFFFFF' : '#FF7A6B'; g.fillText(Math.ceil(st.time) + ' s', W - 10, TOP / 2);
        /* Leiste unten: Was wird gesucht? */
        g.fillStyle = '#111'; g.fillRect(0, H - BAR, W, BAR); g.fillStyle = '#FDC506'; g.fillRect(0, H - BAR, W, 3);
        var hb = hintBtn(), cw = (hb.x - 12) / 3;
        st.targets.forEach(function (t, i) {
          var cx = 8 + i * cw, cy = H - BAR + 8, ch = BAR - 16;
          rr(g, cx, cy, cw - 6, ch, 10); g.fillStyle = t.found ? 'rgba(141,212,90,0.25)' : '#262626'; g.fill(); g.lineWidth = 2; g.strokeStyle = t.found ? '#8DD45A' : '#FDC506'; g.stroke();
          /* Schmal (Handy): Symbol oben, Text darunter. Breit: Symbol links, Text rechts */
          var narrow = cw < 170, icon = narrow ? Math.min(ch * 0.2, 16) : Math.min(ch * 0.42, 22);
          g.save(); if (narrow) g.translate(cx + (cw - 6) / 2, cy + icon + 6); else g.translate(cx + icon + 8, cy + ch / 2); var s = icon / 28; g.scale(s, s); t.type.draw(g, t.v, 0.4); g.restore();
          g.fillStyle = t.found ? '#8DD45A' : '#FFFFFF'; g.textAlign = narrow ? 'center' : 'left'; g.textBaseline = 'middle';
          var fs = narrow ? Math.max(9, Math.min(11, cw / 10)) : Math.max(9, Math.min(13, cw / 11)); g.font = '700 ' + fs + 'px Poppins, sans-serif';
          var words = t.label.split(' '), lines = [], cur = '', maxW = narrow ? cw - 14 : cw - icon * 2 - 22;
          words.forEach(function (w) { var test = cur ? cur + ' ' + w : w; if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; });
          lines.push(cur); lines = lines.slice(0, 3);
          var tx0 = narrow ? cx + (cw - 6) / 2 : cx + icon * 2 + 14, ty0 = narrow ? cy + icon * 2 + 10 + (ch - icon * 2 - 14) / 2 : cy + ch / 2;
          lines.forEach(function (ln, li) { g.fillText(ln, tx0, ty0 + (li - (lines.length - 1) / 2) * fs * 1.15, maxW); });
          if (t.found) { g.strokeStyle = '#8DD45A'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + cw - 26, cy + 10); g.lineTo(cx + cw - 20, cy + 16); g.lineTo(cx + cw - 12, cy + 6); g.stroke(); }
        });
        rr(g, hb.x, hb.y, hb.w, hb.h, 10); g.fillStyle = st.time > HINT_S ? '#262626' : '#1A1A1A'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.4)'; g.stroke();
        g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.font = '800 13px Poppins, sans-serif'; g.fillText('Tipp', hb.x + hb.w / 2, hb.y + hb.h / 2 - 7);
        g.font = '600 10px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillText('−' + HINT_S + ' s', hb.x + hb.w / 2, hb.y + hb.h / 2 + 9);
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.033, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused && !st.timeUp) update(dt);
        else if (st.timeUp) { st.t += dt * 1000; for (var q = st.parts.length - 1; q >= 0; q--) { var p = st.parts[q]; p.t += dt; if (p.t > p.life) st.parts.splice(q, 1); } }
        render();
        if (st.timeUp && st.t - st.endT > 2600) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }
      function idle(now) { if (st.on) return; st.t = now; if (!st.objs.length && W) build(); render(); idleRaf = requestAnimationFrame(idle); }
      function stop() { st.on = false; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() { stop(); render(); ctx.finish(st.score, { level: st.level, found: st.found, wrong: st.wrong }); }

      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused || st.timeUp) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e); tapAt(p.x, p.y);
      });

      layout();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); layout(); build();
          st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          ctx.fx.banner('Level 1: ' + st.theme.name, '#FFFFFF', 32);
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); layout(); build(); render(); },
        unmount: function () { stop(); },
        resize: function () {
          var oldW = W, oldH = H, oldR = R; layout();
          /* Teile mitskalieren, damit nichts aus dem Bild rutscht */
          if (oldW && oldH && st.objs.length) { var sx = W / oldW, sy = (H - BAR) / (oldH - BAR); st.objs.forEach(function (o) { o.x *= sx; o.y = TOP + (o.y - TOP) * sy; o.r = o.r * R / (oldR || R); }); st.marks = []; st.hint = null; }
          render();
        },
        key: function (e) { if (e.key === 't' || e.key === 'T') { if (st.on && !st.paused && !st.timeUp) useHint(); return true; } return false; },
        _debug: function () { return { st: st, tapAt: tapAt, R: R }; }
      };
    }
  });
})();

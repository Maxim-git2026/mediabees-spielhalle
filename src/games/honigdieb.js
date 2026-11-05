/* Spiel 13: Honigdieb (Flucht-Runner / Endlos-Läufer) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, H = 600, GROUND = 500, PX = 230;
  var GRAV = 2700, JUMP = -940, HOLD_GRAV = 1500;
  var STAND_H = 46, DUCK_H = 22, HANG_BOTTOM = GROUND - 34;
  var M_PER_PX = 1 / 40, HONEY = 10;
  var art = MBArcade.art, rr = art.rrect;
  var CITIES = ['Herne', 'Wanne-Eickel', 'Gelsenkirchen', 'Bochum', 'Essen', 'Mülheim', 'Oberhausen', 'Duisburg', 'Dortmund', 'Recklinghausen'];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* Der Kammerjäger mit Sprühflasche (eigene Figur) */
  function drawHunter(g, t, run) {
    var leg = Math.sin(t / 70) * (run ? 0.6 : 0.1);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#1E2A3A'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(0, -40); g.lineTo(Math.sin(leg) * 22, -2); g.moveTo(0, -40); g.lineTo(-Math.sin(leg) * 22, -2); g.stroke();
    g.fillStyle = '#111'; g.fillRect(Math.sin(leg) * 22 - 6, -6, 14, 6); g.fillRect(-Math.sin(leg) * 22 - 6, -6, 14, 6);
    rr(g, -14, -88, 28, 52, 9); g.fillStyle = '#3F6E9E'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
    rr(g, -24, -84, 12, 34, 5); g.fillStyle = '#FDC506'; g.fill(); g.stroke();
    g.fillStyle = '#E5322D'; g.fillRect(-23, -78, 10, 5);
    g.beginPath(); g.arc(0, -100, 13, 0, TAU); g.fillStyle = '#F1C9A5'; g.fill(); g.stroke();
    rr(g, -2, -106, 16, 12, 4); g.fillStyle = '#DDE3EA'; g.fill(); g.stroke();
    g.beginPath(); g.arc(8, -100, 3.4, 0, TAU); g.fillStyle = '#7A8899'; g.fill();
    g.beginPath(); g.moveTo(-14, -113); g.lineTo(14, -113); g.lineTo(12, -120); g.lineTo(-12, -120); g.closePath(); g.fillStyle = '#E5322D'; g.fill(); g.stroke();
    var arm = Math.sin(t / 70 + 1) * 0.3;
    g.strokeStyle = '#3F6E9E'; g.lineWidth = 8; g.beginPath(); g.moveTo(6, -80); g.lineTo(26, -70 + arm * 10); g.stroke();
    rr(g, 22, -82 + arm * 10, 18, 9, 3); g.fillStyle = '#59617A'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(-18, -66); g.quadraticCurveTo(10, -50, 24, -76 + arm * 10); g.stroke();
  }
  function drawJar(g, x, y, s, t) {
    g.save(); g.translate(x, y + Math.sin(t / 200) * 3); g.scale(s, s);
    var gl = g.createRadialGradient(0, 0, 2, 0, 0, 18); gl.addColorStop(0, 'rgba(253,197,6,0.55)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(0, -9); g.bezierCurveTo(8, -1, 7, 8, 0, 8); g.bezierCurveTo(-7, 8, -8, -1, 0, -9);
    g.fillStyle = '#FDC506'; g.fill(); g.lineWidth = 1.8; g.strokeStyle = '#111'; g.stroke();
    g.beginPath(); g.arc(-2.5, 1, 2, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fill();
    g.restore();
  }

  MBArcade.register({
    id: 'honigdieb',
    title: 'Honigdieb',
    duration: 0,
    startText: 'Die Biene hat ein Glas Honig stibitzt und der Kammerjäger ist ihr auf den Fersen! Spring über Hindernisse, duck dich unter Spinnweben durch und lauf so weit du kannst.',
    help: {
      legendTitle: 'So läuft die Flucht',
      controls: [
        { icons: ['kbd:W', 'kbd:↑', 'kbd:Leertaste'], text: 'Springen (länger drücken = höher)', kb: true },
        { icons: ['kbd:S', 'kbd:↓'], text: 'Ducken', kb: true },
        { icons: ['tap'], text: 'Tippen springt, länger halten springt höher', touch: true },
        { icons: ['swipe'], text: 'Nach unten wischen duckt dich', touch: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { drawJar(g, 23, 24, 1.3, 0); }, text: 'Honigtropfen einsammeln', val: '+' + HONEY },
        { draw: function (g) { rr(g, 12, 14, 22, 28, 3); g.fillStyle = '#3F4655'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#2B303B'; g.fillRect(10, 10, 26, 6); }, text: 'Mülltonnen und Zäune überspringen' },
        { draw: function (g) { g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.2; for (var i = 0; i < 6; i++) { g.beginPath(); g.moveTo(23, 4); g.lineTo(23 + Math.cos(i) * 18, 22 + Math.sin(i) * 14); g.stroke(); } g.beginPath(); g.arc(23, 24, 10, 0, TAU); g.stroke(); }, text: 'Unter Spinnweben und Bannern durchducken' },
        { draw: function (g) { g.translate(26, 44); g.scale(0.36, 0.36); drawHunter(g, 0, true); }, text: 'Zweimal kurz hintereinander gestolpert: geschnappt', val: 'Ende', minus: true }
      ]
    },
    cta: { path: 'kontakt/', text: 'Wir sind auch schnell, wenn deine Website mal wegläuft. Ruf an.' },
    stats: function (s) {
      return s.meters + ' Meter weit geflohen, bis nach ' + s.city + '.' + (s.honey ? ' ' + s.honey + (s.honey === 1 ? ' Honigtropfen.' : ' Honigtropfen.') : '');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 960, k = 1, dpr = 1, sky = null, far = null, raf = 0, idleRaf = 0, ptr = null;
      var st = fresh();

      function fresh() {
        return {
          on: false, paused: false, over: false, t: 0, last: 0, started: false,
          dist: 0, speed: 380, score: 0, honey: 0, city: 0,
          y: GROUND, vy: 0, ground: true, duck: 0, hold: false, jumps: 0,
          obs: [], drops: [], nextObs: 700, parts: [],
          gap: 1, inv: 0, hitT: -9999, caught: 0, squash: 0, sign: null, hint: true
        };
      }

      function paint() {
        var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
        var x = c.getContext('2d'); x.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        var gr = x.createLinearGradient(0, 0, 0, GROUND);
        gr.addColorStop(0, '#0B0E1F'); gr.addColorStop(0.65, '#1F2142'); gr.addColorStop(1, '#4A2E45');
        x.fillStyle = gr; x.fillRect(0, 0, W, H);
        var r = art.rng(8);
        for (var i = 0; i < W / 9; i++) { x.globalAlpha = 0.2 + r() * 0.7; x.fillStyle = '#fff'; x.beginPath(); x.arc(r() * W, r() * GROUND * 0.6, 0.5 + r(), 0, TAU); x.fill(); }
        x.globalAlpha = 1;
        x.beginPath(); x.arc(W * 0.78, 90, 30, 0, TAU); x.fillStyle = '#F4EBC9'; x.fill();
        sky = c;
        var f = document.createElement('canvas'); f.width = Math.ceil(1400 * k * dpr); f.height = cv.height;
        var fx = f.getContext('2d'); fx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        art.skyline(fx, 0, 1400, GROUND - 40, '#1C2140', art.rng(31), '#FDC506');
        far = f;
      }
      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
        k = r.height / H; W = r.width / k;
        paint(); render();
      }

      /* Hindernisse: am Boden (springen), hängend (ducken), Gully (springen) */
      function spawn() {
        var d = Math.min(1, st.dist / 60000), x = W + 60, roll = Math.random();
        var kind;
        if (st.dist < 1500) kind = 'tonne';
        else if (roll < 0.28) kind = 'tonne';
        else if (roll < 0.45) kind = 'zaun';
        else if (roll < 0.58) kind = 'hydrant';
        else if (roll < 0.72 + d * 0.06) kind = 'netz';
        else if (roll < 0.86) kind = 'banner';
        else kind = 'gully';
        var o = { k: kind, x: x, passed: false };
        if (kind === 'tonne') { o.w = 34; o.h = 46; }
        else if (kind === 'zaun') { o.w = 70 + d * 30; o.h = 40; }
        else if (kind === 'hydrant') { o.w = 24; o.h = 34; }
        else if (kind === 'gully') { o.w = 60 + d * 30; o.h = 0; o.hole = true; }
        else { o.w = kind === 'netz' ? 60 : 90; o.hang = true; }
        st.obs.push(o);
        /* Manchmal ein Bogen aus Honigtropfen über dem Hindernis */
        if (Math.random() < 0.4) {
          var n = 5, cx = x + o.w / 2;
          for (var i = 0; i < n; i++) {
            var a = i / (n - 1);
            st.drops.push({ x: cx - 90 + a * 180, y: o.hang ? GROUND - 18 : GROUND - 70 - Math.sin(a * Math.PI) * 90 });
          }
        }
        var react = Math.max(0.5, 0.95 - d * 0.4);
        st.nextObs = st.speed * react + o.w + rnd(140, 420 - d * 180);
      }

      function rect() {
        var h = st.duck > 0 && st.ground ? DUCK_H : STAND_H;
        return { x: PX - 18, y: st.y - h, w: 36, h: h };
      }
      function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
      function obsRect(o) {
        if (o.hang) return { x: o.x + 6, y: 0, w: o.w - 12, h: HANG_BOTTOM };
        if (o.hole) return null;
        return { x: o.x + 4, y: GROUND - o.h, w: o.w - 8, h: o.h };
      }
      function puff(x, y, colors, n, speed, grav) {
        if (ctx.reduce) n = Math.ceil(n / 2);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.3 + Math.random() * 0.9);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v - st.speed * 0.3, vy: Math.sin(a) * v - speed * 0.3, t: 0, life: 0.3 + Math.random() * 0.4, size: 1.5 + Math.random() * 3, c: colors[i % colors.length], g: grav || 0 });
        }
      }

      function jump() {
        if (!st.on || st.paused || st.caught) return;
        st.hint = false; st.started = true;
        if (st.ground) {
          st.vy = JUMP; st.ground = false; st.duck = 0; st.hold = true; st.jumps++;
          puff(PX - 10, GROUND, ['#9AA2B4', '#C8CCD6'], 6, 90, 200);
          ctx.tone(420, 760, 0.08, 'triangle', 0.03);
        }
      }
      function duck() {
        if (!st.on || st.paused || st.caught) return;
        st.hint = false; st.started = true;
        st.duck = 0.55;
        if (!st.ground) st.vy = Math.max(st.vy, 900);
        ctx.tone(300, 200, 0.06, 'triangle', 0.025);
      }
      function stumble(o) {
        st.inv = st.t + 1100; st.squash = 1;
        var close = st.t - st.hitT < 9000 || st.gap < 0.6;
        st.hitT = st.t;
        st.gap -= 0.55;
        puff(PX, st.y - 20, ['#F7B500', '#3A2410', '#FFFFFF'], 16, 220, 400);
        ctx.fx.shake(0.3, 9);
        if (st.gap <= 0 || (close && st.gap < 0.2)) {
          st.caught = st.t; st.gap = 0;
          ctx.fx.flash('255,74,61', 1); ctx.fx.shake(0.5, 13);
          ctx.fx.banner('Geschnappt!', '#FF7A6B');
          ctx.tone(220, 50, 0.6, 'sawtooth', 0.07);
        } else {
          ctx.fx.flash('255,74,61', 0.6); ctx.fx.ring(PX * k, (st.y - 20) * k, '#FF5A4A', 70 * k, 5, 450);
          ctx.fx.text(PX * k, (st.y - 70) * k, 'Gestolpert!', '#FF7A6B', 24);
          ctx.tone(260, 120, 0.25, 'sawtooth', 0.05);
        }
      }

      function update(dt) {
        st.t += dt * 1000;
        for (var q = st.parts.length - 1; q >= 0; q--) { var p = st.parts[q]; p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.t > p.life) st.parts.splice(q, 1); }
        st.squash = Math.max(0, st.squash - dt * 4);
        if (st.caught) { st.speed = Math.max(0, st.speed - 900 * dt); st.gap = Math.max(0, st.gap); if (st.t - st.caught > 1500) st.over = true; }
        else if (st.started) {
          st.speed = Math.min(960, 380 + st.dist / 90);
          if (st.t > st.inv) st.gap = Math.min(1, st.gap + dt * 0.06);
        }
        var dx = st.speed * dt;
        if (st.started) st.dist += dx;
        /* Springen und Ducken */
        if (!st.ground) {
          st.vy += (st.hold && st.vy < 0 ? HOLD_GRAV : GRAV) * dt;
          st.y += st.vy * dt;
          if (st.y >= GROUND) {
            st.y = GROUND; st.vy = 0; st.ground = true; st.squash = 0.6;
            puff(PX, GROUND, ['#9AA2B4', '#C8CCD6'], 5, 80, 200);
          }
        }
        st.duck = Math.max(0, st.duck - dt);
        /* Hindernisse */
        if (st.started && !st.caught) { st.nextObs -= dx; if (st.nextObs <= 0) spawn(); }
        var me = rect();
        for (var i = st.obs.length - 1; i >= 0; i--) {
          var o = st.obs[i];
          o.x -= dx;
          if (o.x + o.w < -60) { st.obs.splice(i, 1); continue; }
          if (st.caught || st.t < st.inv) continue;
          if (o.hole) {
            if (st.ground && PX > o.x + 8 && PX < o.x + o.w - 8) { stumble(o); st.vy = -500; st.ground = false; }
          } else if (overlap(me, obsRect(o))) { stumble(o); continue; }
          if (!o.passed && o.x + o.w < PX - 18) {
            o.passed = true;
            var near = o.hang ? (st.duck > 0) : (!st.ground && st.y > GROUND - (o.h || 0) - 30);
            if (near && !ctx.reduce) { ctx.fx.text(PX * k, (st.y - 80) * k, 'Knapp!', '#FFFFFF', 18); }
          }
        }
        /* Honigtropfen */
        for (var j = st.drops.length - 1; j >= 0; j--) {
          var d0 = st.drops[j];
          d0.x -= dx;
          if (d0.x < -30) { st.drops.splice(j, 1); continue; }
          if (Math.abs(d0.x - PX) < 26 && d0.y > me.y - 16 && d0.y < me.y + me.h + 16) {
            st.drops.splice(j, 1); st.honey++;
            ctx.fx.ring(d0.x * k, d0.y * k, '#FDC506', 34 * k, 3, 300);
            puff(d0.x, d0.y, ['#FDC506', '#FFE680', '#FFFFFF'], 6, 120, 0);
            ctx.tone(880 + (st.honey % 5) * 90, 1320, 0.06, 'triangle', 0.035);
          }
        }
        /* Punkte und Städte */
        var meters = Math.floor(st.dist * M_PER_PX), pts = meters + st.honey * HONEY;
        if (pts !== st.score) { st.score = pts; ctx.setScore(pts); }
        var c = Math.min(CITIES.length - 1, Math.floor(meters / 250));
        if (c > st.city) {
          st.city = c;
          st.sign = { name: CITIES[c], t0: st.t };
          ctx.fx.flash('253,197,6', 0.45); ctx.fx.sparkle(PX * k, (st.y - 40) * k, null, 18, 240);
          ctx.tone(660, 990, 0.12, 'triangle', 0.05); ctx.tone(990, 1320, 0.12, 'triangle', 0.05, 0.1);
        }
      }

      /* Zeichnen */
      function drawObs(o) {
        var x = o.x;
        if (o.k === 'tonne') {
          rr(g, x, GROUND - o.h, o.w, o.h, 4); g.fillStyle = '#3F4655'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2.5; g.stroke();
          g.fillStyle = '#2B303B'; g.fillRect(x - 3, GROUND - o.h - 6, o.w + 6, 8);
          g.fillStyle = '#FDC506'; g.fillRect(x + 4, GROUND - o.h + 14, o.w - 8, 4);
        } else if (o.k === 'zaun') {
          g.fillStyle = '#E5322D'; g.fillRect(x, GROUND - o.h, o.w, 10);
          g.fillStyle = '#FFFFFF'; for (var s = x; s < x + o.w; s += 16) g.fillRect(s, GROUND - o.h, 8, 10);
          g.fillStyle = '#9AA2B4'; g.fillRect(x + 4, GROUND - o.h + 10, 5, o.h - 10); g.fillRect(x + o.w - 9, GROUND - o.h + 10, 5, o.h - 10);
          g.strokeStyle = 'rgba(200,205,215,0.6)'; g.lineWidth = 1; g.beginPath();
          for (var m = x + 10; m < x + o.w - 10; m += 8) { g.moveTo(m, GROUND - o.h + 10); g.lineTo(m, GROUND); }
          g.stroke();
        } else if (o.k === 'hydrant') {
          rr(g, x + 3, GROUND - o.h, o.w - 6, o.h, 6); g.fillStyle = '#D3272F'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
          g.fillRect(x, GROUND - o.h + 12, o.w, 6); g.strokeRect(x, GROUND - o.h + 12, o.w, 6);
        } else if (o.k === 'gully') {
          g.fillStyle = '#05060A'; rr(g, x, GROUND - 4, o.w, 14, 4); g.fill();
          g.fillStyle = '#59617A'; g.save(); g.translate(x - 8, GROUND - 6); g.rotate(-0.5); g.fillRect(-14, -3, 28, 6); g.restore();
        } else if (o.k === 'netz') {
          var cx = x + o.w / 2;
          g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, HANG_BOTTOM - 40); g.stroke();
          for (var i = 0; i < 8; i++) { var a = i / 8 * TAU; g.beginPath(); g.moveTo(cx, HANG_BOTTOM - 40); g.lineTo(cx + Math.cos(a) * o.w / 2, HANG_BOTTOM - 40 + Math.sin(a) * 40); g.stroke(); }
          for (var ring = 1; ring <= 3; ring++) { g.beginPath(); g.ellipse(cx, HANG_BOTTOM - 40, o.w / 2 * ring / 3, 40 * ring / 3, 0, 0, TAU); g.stroke(); }
          g.beginPath(); g.arc(cx + 6, HANG_BOTTOM - 46, 6, 0, TAU); g.fillStyle = '#111'; g.fill();
        } else {
          g.strokeStyle = '#9AA2B4'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 6, 0); g.lineTo(x + 6, HANG_BOTTOM - 40); g.moveTo(x + o.w - 6, 0); g.lineTo(x + o.w - 6, HANG_BOTTOM - 40); g.stroke();
          rr(g, x, HANG_BOTTOM - 44, o.w, 44, 4); g.fillStyle = '#FDC506'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#111'; g.font = '800 13px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KIRMES', x + o.w / 2, HANG_BOTTOM - 22, o.w - 10);
        }
      }
      function drawBee() {
        var ducking = st.duck > 0 && st.ground;
        g.save(); g.translate(PX, st.y - (ducking ? 14 : 26) - (st.ground && !st.caught ? Math.abs(Math.sin(st.t / 90)) * 4 : 0));
        if (st.t < st.inv && Math.floor(st.t / 90) % 2) g.globalAlpha = 0.45;
        var rot = st.ground ? 0 : Math.max(-0.5, Math.min(0.6, st.vy / 1500));
        g.rotate(rot);
        var sq = st.squash;
        g.scale((ducking ? 1.25 : 1) * (1 + sq * 0.15), (ducking ? 0.6 : 1) * (1 - sq * 0.15));
        g.scale(0.8, 0.8);
        art.bee(g, Math.sin(st.t / 25));
        /* das geklaute Honigglas */
        g.save(); g.translate(-4, 18); g.rotate(-0.2);
        rr(g, -9, -8, 18, 18, 4); g.fillStyle = '#E9A800'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
        rr(g, -10, -13, 20, 6, 2); g.fillStyle = '#7A4A1A'; g.fill(); g.stroke();
        g.restore();
        g.restore();
      }
      function render() {
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (sky) g.drawImage(sky, 0, 0);
        if (far) { var fo = -((st.dist * 0.2) % 1400) * k * dpr; g.drawImage(far, fo, 0); g.drawImage(far, fo + far.width, 0); }
        g.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        /* Straße */
        g.fillStyle = '#16171F'; g.fillRect(0, GROUND, W, H - GROUND);
        g.fillStyle = '#2A2D3A'; g.fillRect(0, GROUND, W, 6);
        g.fillStyle = '#3A3D4A'; var off = st.dist % 60; for (var x = -off; x < W; x += 60) g.fillRect(x, GROUND + 6, 2, 30);
        g.fillStyle = 'rgba(255,255,255,0.35)'; var off2 = st.dist % 120; for (var x2 = -off2; x2 < W; x2 += 120) g.fillRect(x2, GROUND + 60, 60, 4);
        /* Laternen */
        var lo = (st.dist * 1) % 380;
        for (var lx = -lo; lx < W + 380; lx += 380) {
          g.fillStyle = '#2B2F3A'; g.fillRect(lx, GROUND - 210, 6, 210); g.fillRect(lx, GROUND - 210, 34, 5);
          var lg = g.createRadialGradient(lx + 32, GROUND - 200, 2, lx + 32, GROUND - 120, 140); lg.addColorStop(0, 'rgba(255,214,120,0.35)'); lg.addColorStop(1, 'rgba(255,214,120,0)');
          g.fillStyle = lg; g.fillRect(lx - 110, GROUND - 210, 290, 210);
          g.beginPath(); g.arc(lx + 32, GROUND - 202, 5, 0, TAU); g.fillStyle = '#FFE9A8'; g.fill();
        }
        st.obs.forEach(drawObs);
        st.drops.forEach(function (d) { drawJar(g, d.x, d.y, 1, st.t + d.x); });
        /* Kammerjäger: je kleiner der Abstand, desto näher */
        var hx = PX - 62 - st.gap * 125;
        g.save(); g.translate(hx, GROUND); g.scale(1.1, 1.1); drawHunter(g, st.t, st.speed > 30); g.restore();
        if (st.gap < 0.95 && !st.caught) {
          for (var sp = 0; sp < 3; sp++) {
            var px0 = hx + 40 + sp * 14 + (st.t / 6 % 14), py0 = GROUND - 78 + Math.sin(st.t / 60 + sp) * 5;
            g.globalAlpha = 0.35 - sp * 0.1; g.beginPath(); g.arc(px0, py0, 8 + sp * 4, 0, TAU); g.fillStyle = '#C8E0C8'; g.fill();
          }
          g.globalAlpha = 1;
        }
        drawBee();
        st.parts.forEach(function (p) { g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.beginPath(); g.arc(p.x, p.y, p.size, 0, TAU); g.fillStyle = p.c; g.fill(); });
        g.globalAlpha = 1;
        /* Gefahr: roter Rand links, wenn der Kammerjäger nah ist */
        if (st.gap < 0.6 && !st.caught) {
          var va = (0.6 - st.gap) * 0.7 * (0.7 + 0.3 * Math.sin(st.t / 120));
          var vg = g.createLinearGradient(0, 0, W * 0.35, 0); vg.addColorStop(0, 'rgba(255,74,61,' + va + ')'); vg.addColorStop(1, 'rgba(255,74,61,0)');
          g.fillStyle = vg; g.fillRect(0, 0, W * 0.35, H);
        }
        /* Anzeige: Meter oben links, Stadt-Schild */
        g.textAlign = 'left'; g.textBaseline = 'top'; g.lineJoin = 'round';
        g.font = '900 34px Poppins, sans-serif'; g.lineWidth = 6; g.strokeStyle = 'rgba(17,17,17,0.8)';
        var mt = Math.floor(st.dist * M_PER_PX) + ' m';
        g.strokeText(mt, 14, 12); g.fillStyle = '#FFFFFF'; g.fillText(mt, 14, 12);
        g.font = '700 13px Poppins, sans-serif'; g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillText('Honig: ' + st.honey, 16, 52);
        if (st.sign) {
          var age = (st.t - st.sign.t0) / 1000;
          if (age > 2.6) st.sign = null;
          else {
            var e = age < 0.3 ? age / 0.3 : age > 2.2 ? 1 - (age - 2.2) / 0.4 : 1;
            g.save(); g.globalAlpha = Math.max(0, e);
            var sw = 190, sx0 = W - sw - 16, sy0 = 14 - (1 - e) * 20;
            rr(g, sx0, sy0, sw, 58, 6); g.fillStyle = '#FDC506'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 3; g.stroke();
            g.lineWidth = 1.5; g.strokeRect(sx0 + 5, sy0 + 5, sw - 10, 48);
            g.fillStyle = '#111'; g.textAlign = 'center'; g.font = '600 11px Poppins, sans-serif'; g.fillText('Auf der Flucht durch', sx0 + sw / 2, sy0 + 10);
            g.font = '800 20px Poppins, sans-serif'; g.fillText(st.sign.name, sx0 + sw / 2, sy0 + 25, sw - 20);
            g.restore();
          }
        }
        if (st.on && st.hint && !st.paused) {
          var txt = ctx.touch() ? 'Tippen springt, nach unten wischen duckt' : 'W oder Leertaste springt, S duckt';
          g.font = '700 15px Poppins, sans-serif';
          var w = Math.min(W - 20, g.measureText(txt).width + 28), h = 32, hx2 = W / 2, hy = GROUND - 220;
          g.globalAlpha = 0.75 + Math.sin(performance.now() / 260) * 0.25;
          rr(g, hx2 - w / 2, hy - h / 2, w, h, h / 2); g.fillStyle = 'rgba(17,17,17,0.88)'; g.fill();
          g.strokeStyle = '#FDC506'; g.lineWidth = 2; g.stroke();
          g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, hx2, hy + 1, w - 14);
          g.globalAlpha = 1;
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
      function stop() { st.on = false; ptr = null; cancelAnimationFrame(raf); cancelAnimationFrame(idleRaf); }
      function finish() { stop(); render(); ctx.finish(st.score, { meters: Math.floor(st.dist * M_PER_PX), honey: st.honey, city: CITIES[st.city] }); }

      /* Tippen = springen (halten = höher), nach unten wischen = ducken */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        var p = local(e);
        ptr = { id: e.pointerId, x: p.x, y: p.y, ducked: false };
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        jump();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!ptr || e.pointerId !== ptr.id || ptr.ducked) return;
        var p = local(e);
        if (p.y - ptr.y > 26) { ptr.ducked = true; st.hold = false; duck(); }
      });
      cv.addEventListener('pointerup', function (e) { if (ptr && e.pointerId === ptr.id) { st.hold = false; ptr = null; } });
      cv.addEventListener('pointercancel', function () { st.hold = false; ptr = null; });
      function onKeyUp(e) { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') st.hold = false; }
      document.addEventListener('keyup', onKeyUp);

      resize();
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf); cancelAnimationFrame(raf);
          st = fresh(); st.on = true; st.last = performance.now();
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) { st.paused = on; st.hold = false; ptr = null; if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); } },
        abort: function () { stop(); st = fresh(); resize(); },
        unmount: function () { stop(); document.removeEventListener('keyup', onKeyUp); },
        resize: resize,
        key: function (e) {
          var k2 = e.key;
          if (k2 === ' ' || k2 === 'ArrowUp' || k2 === 'w' || k2 === 'W') { if (!e.repeat) jump(); return true; }
          if (k2 === 'ArrowDown' || k2 === 's' || k2 === 'S') { duck(); return true; }
          return false;
        },
        _debug: function () { return { st: st, W: W, rect: rect, obsRect: obsRect }; }
      };
    }
  });
})();

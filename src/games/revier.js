/* Spiel 3: Revierflug */
(function () {
  'use strict';
  var TAU = Math.PI * 2, H = 600, GROUND = H - 70, SPACING = 330, OW = 76, R = 12;
  var GRAVITY = 1500, FLAP = -460, MAXFALL = 720;
  var FAR_W = 1400, MID_W = 1100;
  var art = MBArcade.art;
  var STOPS = {
    10: ['Willkommen in', 'Bochum'],
    20: ['Willkommen in', 'Gelsenkirchen'],
    30: ['Willkommen in', 'Essen'],
    40: ['Willkommen in', 'Mülheim an der Ruhr'],
    50: ['Willkommen in', 'Oberhausen'],
    60: ['Willkommen in', 'Duisburg'],
    75: ['Abkürzung über die A40', 'Dortmund'],
    90: ['Willkommen in', 'Unna'],
    100: ['Einmal ums Revier', 'Zurück in Herne']
  };
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function stopFor(score) {
    if (STOPS[score]) return STOPS[score];
    if (score > 100 && score % 50 === 0) return ['Ehrenrunde', 'Runde ' + (score / 50 - 1)];
    return null;
  }
  function cityFor(score) {
    var city = 'Herne';
    Object.keys(STOPS).forEach(function (k) { if (score >= +k) city = STOPS[k][1]; });
    return city;
  }

  function miniTower(g) {
    g.strokeStyle = '#59617A'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(10, 44); g.lineTo(20, 16); g.moveTo(36, 44); g.lineTo(26, 16);
    g.moveTo(13, 36); g.lineTo(33, 26); g.moveTo(33, 36); g.lineTo(13, 26); g.stroke();
    g.strokeStyle = '#A3ABBF'; g.lineWidth = 2.5; g.beginPath(); g.arc(23, 11, 8, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(15, 11); g.lineTo(31, 11); g.moveTo(23, 3); g.lineTo(23, 19); g.lineWidth = 1.5; g.stroke();
  }
  function miniSign(g) {
    g.fillStyle = '#FDC506'; g.fillRect(2, 11, 42, 24);
    g.strokeStyle = '#111'; g.lineWidth = 2; g.strokeRect(2, 11, 42, 24); g.lineWidth = 1; g.strokeRect(5, 14, 36, 18);
    g.fillStyle = '#111'; g.font = '700 10px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('Essen', 23, 27);
    g.fillStyle = '#3A3F4B'; g.fillRect(21, 35, 4, 10);
  }

  MBArcade.register({
    id: 'revier',
    title: 'Revierflug',
    duration: 0,
    startText: 'Flieg unsere Biene von Herne einmal quer durchs Revier. Ein Rempler und die Tour ist vorbei.',
    help: {
      legendTitle: 'So läuft die Tour',
      controls: [
        { icons: ['mouse-left', 'kbd:Leertaste', 'tap'], text: 'Flattern: Die Biene steigt kurz nach oben' },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { draw: function (g) { miniTower(g); }, text: 'Durch jede Lücke fliegen', val: '+1' },
        { draw: function (g) { g.translate(25, 22); g.rotate(1.2); g.scale(0.55, 0.55); art.bee(g, 0.2); }, text: 'Anecken oder den Boden berühren', val: 'Ende', minus: true },
        { draw: function (g) { miniSign(g); }, text: 'Alle 10 Punkte geht es in die nächste Stadt' }
      ]
    },
    ranks: [
      [60, 'Revier-Legende', 'Einmal quer durchs Revier!'],
      [30, 'Pendler-Biene', 'Die A40 ist nix dagegen.'],
      [10, 'Ausflugs-Biene', 'Schöne Tour.'],
      [0, 'Bruchpilot', 'Anschnallen und nochmal.']
    ],
    cta: { path: 'kontakt/', text: 'Deine Website soll auch abheben? Lass uns reden.' },
    stats: function (s) {
      return s.score < 10 ? 'Aus Herne bist du diesmal nicht rausgekommen.' : 'Du bist bis ' + s.city + ' gekommen.';
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var W = 960, k = 1, dpr = 1, beeX = 240, sky = null, far = null, mid = null;
      var st = fresh(), raf = 0, idleRaf = 0;

      function fresh() {
        return { on: false, paused: false, dead: false, deadT: 0, t: 0, last: 0, score: 0, y: H * 0.42, vy: 0, scroll: 0, speed: 180, obs: [], sign: null, flash: 0, parts: [], bump: 0, shake: 0 };
      }

      function off(w, paint) {
        var c = document.createElement('canvas');
        c.width = Math.ceil(w * k * dpr); c.height = cv.height;
        var x = c.getContext('2d');
        x.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
        paint(x, w);
        return c;
      }

      function paintSky(x, w) {
        var gr = x.createLinearGradient(0, 0, 0, GROUND);
        gr.addColorStop(0, '#0B0E1F'); gr.addColorStop(0.6, '#1B1F3A'); gr.addColorStop(1, '#3A2A3F');
        x.fillStyle = gr; x.fillRect(0, 0, w, H);
        var r = art.rng(3);
        for (var i = 0; i < w / 12; i++) {
          x.globalAlpha = 0.25 + r() * 0.65; x.fillStyle = '#fff';
          x.beginPath(); x.arc(r() * w, r() * GROUND * 0.7, 0.6 + r() * 1.3, 0, TAU); x.fill();
        }
        x.globalAlpha = 1;
        var mx = w * 0.82, my = 92;
        var glow = x.createRadialGradient(mx, my, 10, mx, my, 110);
        glow.addColorStop(0, 'rgba(244,235,201,0.35)'); glow.addColorStop(1, 'rgba(244,235,201,0)');
        x.fillStyle = glow; x.fillRect(0, 0, w, H);
        x.beginPath(); x.arc(mx, my, 26, 0, TAU); x.fillStyle = '#F4EBC9'; x.fill();
        x.beginPath(); x.arc(mx - 8, my - 5, 5, 0, TAU); x.arc(mx + 7, my + 8, 3.5, 0, TAU); x.fillStyle = 'rgba(0,0,0,0.08)'; x.fill();
      }
      function paintFar(x, w) { art.skyline(x, 0, w, GROUND - 6, '#1E2340', art.rng(21), '#FDC506'); }
      function paintMid(x, w) {
        art.halde(x, w * 0.22, GROUND + 4, 440, 120, '#13162A');
        art.halde(x, w * 0.75, GROUND + 4, 380, 85, '#13162A');
      }

      function resize() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(r.width * dpr);
        cv.height = Math.round(r.height * dpr);
        k = r.height / H;
        W = r.width / k;
        beeX = Math.min(W * 0.3, 240);
        sky = off(W, paintSky);
        far = off(FAR_W, paintFar);
        mid = off(MID_W, paintMid);
        render();
      }

      function addObs(x) {
        var gap = Math.max(140, 178 - st.score * 0.9);
        var prev = st.obs.length ? st.obs[st.obs.length - 1].cy : H * 0.45;
        var minC = 60 + gap / 2, maxC = GROUND - 50 - gap / 2;
        var cy = Math.min(maxC, Math.max(minC, prev + rnd(-170, 170)));
        var types = ['schacht', 'schlot', 'gaso'];
        st.obs.push({ x: x, cy: cy, gap: gap, bot: types[Math.floor(Math.random() * 3)], top: Math.random() < 0.5 ? 'traeger' : 'rohr', passed: false });
      }

      function boxes(o) {
        var top = o.cy - o.gap / 2, bot = o.cy + o.gap / 2;
        var bx = o.x, bw = OW;
        if (o.bot === 'schlot') { bx = o.x + OW * 0.16; bw = OW * 0.68; }
        else if (o.bot === 'schacht') { bx = o.x + OW * 0.18; bw = OW * 0.64; }
        else { bx = o.x + 3; bw = OW - 6; }
        return [
          { x: o.x + 6, y: 0, w: OW - 12, h: top },
          { x: bx, y: bot, w: bw, h: GROUND - bot }
        ];
      }

      function hits(cx, cy, b) {
        var nx = Math.max(b.x, Math.min(cx, b.x + b.w)), ny = Math.max(b.y, Math.min(cy, b.y + b.h));
        var dx = cx - nx, dy = cy - ny;
        return dx * dx + dy * dy < R * R;
      }

      function puff(x, y, colors, n, speed, up) {
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, v = speed * (0.4 + Math.random() * 0.8);
          st.parts.push({ x: x, y: y, vx: Math.cos(a) * v - (up ? 60 : 0), vy: Math.sin(a) * v + (up ? 40 : -speed * 0.3), t: 0, life: 0.35 + Math.random() * 0.45, size: 1.5 + Math.random() * 3, c: colors[i % colors.length], g: up ? 0 : 600 });
        }
      }
      function die() {
        if (st.dead) return;
        st.dead = true; st.deadT = st.t; st.flash = 1;
        st.shake = 0.35;
        puff(beeX, st.y, ['#F7B500', '#3A2410', '#FFFFFF'], 22, 280, false);
        ctx.tone(220, 70, 0.3, 'sawtooth', 0.06);
      }

      function update(dt) {
        st.t += dt * 1000;
        if (!st.dead) {
          st.speed = Math.min(250, 180 + st.score * 1.6);
          var dx = st.speed * dt;
          st.scroll += dx;
          for (var i = st.obs.length - 1; i >= 0; i--) {
            var o = st.obs[i];
            o.x -= dx;
            if (o.x < -OW - 20) st.obs.splice(i, 1);
          }
          var last = st.obs[st.obs.length - 1];
          if (!last) addObs(W + 120);
          while (st.obs[st.obs.length - 1].x < W + SPACING) addObs(st.obs[st.obs.length - 1].x + SPACING);
        }
        st.vy = Math.min(MAXFALL, st.vy + GRAVITY * dt);
        st.y += st.vy * dt;
        if (st.y < 14) { st.y = 14; st.vy = Math.max(0, st.vy); }
        if (st.y + R >= GROUND) { st.y = GROUND - R; st.vy = 0; die(); }
        if (!st.dead) {
          var bcx = beeX - 3, bcy = st.y + 2;
          for (var j = 0; j < st.obs.length; j++) {
            var ob = st.obs[j], bx = boxes(ob);
            if (hits(bcx, bcy, bx[0]) || hits(bcx, bcy, bx[1])) { die(); break; }
            if (!ob.passed && ob.x + OW < beeX - R) {
              ob.passed = true;
              st.score++;
              ctx.setScore(st.score);
              ctx.tone(880, 1320, 0.07, 'triangle', 0.05);
              st.bump = 1;
              puff(beeX + 6, st.y, ['#FDC506', '#FFE680', '#FFFFFF'], 7, 160, false);
              var stop = stopFor(st.score);
              if (stop) {
                st.sign = { top: stop[0], name: stop[1], t0: st.t };
                ctx.say(st.score === 100 ? 'Einmal ums ganze Revier. Respekt!' : stop[0] + ' ' + stop[1] + '!');
                ctx.tone(660, 990, 0.12, 'triangle', 0.06, 0.08);
              }
            }
          }
        }
        if (st.flash > 0) st.flash = Math.max(0, st.flash - dt * 3);
        st.bump = Math.max(0, st.bump - dt * 4);
        st.shake = Math.max(0, st.shake - dt);
        for (var q = st.parts.length - 1; q >= 0; q--) {
          var pt = st.parts[q];
          pt.t += dt; pt.vy += pt.g * dt; pt.x += pt.vx * dt - (st.dead ? 0 : st.speed * dt * 0.6); pt.y += pt.vy * dt;
          if (pt.t > pt.life) st.parts.splice(q, 1);
        }
      }

      /* Zeichnen */
      function hazard(x, y, w, h) {
        g.save();
        g.beginPath(); g.rect(x, y, w, h); g.clip();
        g.fillStyle = '#FDC506'; g.fillRect(x, y, w, h);
        g.strokeStyle = '#111'; g.lineWidth = 6;
        g.beginPath();
        for (var i = -h; i < w + h; i += 16) { g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); }
        g.stroke();
        g.restore();
      }

      function drawTop(o) {
        var x = o.x, yb = o.cy - o.gap / 2;
        if (o.top === 'traeger') {
          g.fillStyle = '#2B303B'; g.fillRect(x + 6, 0, OW - 12, yb - 14);
          g.save(); g.beginPath(); g.rect(x + 6, 0, OW - 12, yb - 14); g.clip();
          g.strokeStyle = '#4A5161'; g.lineWidth = 3; g.beginPath();
          for (var yy = (yb - 14) % 44 - 44; yy < yb; yy += 44) {
            g.moveTo(x + 6, yy); g.lineTo(x + OW - 6, yy + 44);
            g.moveTo(x + OW - 6, yy); g.lineTo(x + 6, yy + 44);
          }
          g.stroke(); g.restore();
          g.strokeStyle = '#59617A'; g.lineWidth = 3; g.strokeRect(x + 7.5, -4, OW - 15, yb - 12.5);
          hazard(x + 2, yb - 14, OW - 4, 14);
        } else {
          var gr = g.createLinearGradient(x + 10, 0, x + OW - 10, 0);
          gr.addColorStop(0, '#363C48'); gr.addColorStop(0.5, '#6B7385'); gr.addColorStop(1, '#363C48');
          g.fillStyle = gr; g.fillRect(x + 12, 0, OW - 24, yb - 10);
          g.fillStyle = '#59617A';
          for (var fy = yb - 100; fy > 0; fy -= 110) g.fillRect(x + 7, fy, OW - 14, 10);
          g.fillStyle = '#8A93A8'; g.fillRect(x + 4, yb - 12, OW - 8, 12);
          g.fillStyle = '#FDC506'; g.fillRect(x + 4, yb - 4, OW - 8, 4);
        }
      }

      function drawBottom(o) {
        var x = o.x, yt = o.cy + o.gap / 2, h = GROUND - yt;
        if (o.bot === 'schacht') {
          var cx = x + OW / 2, wr = OW * 0.26, wy = yt + wr + 1;
          g.strokeStyle = '#3F4655'; g.lineWidth = 7; g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x + 8, GROUND); g.lineTo(cx - 10, yt + 26);
          g.moveTo(x + OW - 8, GROUND); g.lineTo(cx + 10, yt + 26);
          g.stroke();
          g.strokeStyle = '#4A5161'; g.lineWidth = 3; g.beginPath();
          var steps = Math.max(2, Math.floor((GROUND - yt - 30) / 40));
          for (var i = 0; i < steps; i++) {
            var y1 = yt + 30 + i * (GROUND - yt - 30) / steps, y2 = yt + 30 + (i + 1) * (GROUND - yt - 30) / steps;
            var s1 = (y1 - yt - 26) / (GROUND - yt - 26), s2 = (y2 - yt - 26) / (GROUND - yt - 26);
            var l1 = cx - 10 - s1 * (OW / 2 - 18), r1 = cx + 10 + s1 * (OW / 2 - 18);
            var l2 = cx - 10 - s2 * (OW / 2 - 18), r2 = cx + 10 + s2 * (OW / 2 - 18);
            g.moveTo(l1, y1); g.lineTo(r2, y2); g.moveTo(r1, y1); g.lineTo(l2, y2);
          }
          g.stroke();
          g.fillStyle = '#3F4655'; g.fillRect(x + OW * 0.2, yt + 22, OW * 0.6, 9);
          g.strokeStyle = '#A3ABBF'; g.lineWidth = 4;
          g.beginPath(); g.arc(cx, wy, wr, 0, TAU); g.stroke();
          g.lineWidth = 2; g.beginPath();
          var a0 = (st.scroll / 30) % TAU;
          for (var sp = 0; sp < 6; sp++) { var a = a0 + sp * TAU / 6; g.moveTo(cx, wy); g.lineTo(cx + Math.cos(a) * wr, wy + Math.sin(a) * wr); }
          g.stroke();
          g.beginPath(); g.arc(cx, wy, 3.5, 0, TAU); g.fillStyle = '#A3ABBF'; g.fill();
          g.lineCap = 'butt';
        } else if (o.bot === 'schlot') {
          var sx = x + OW * 0.22, sw = OW * 0.56;
          g.fillStyle = '#6E3326'; g.fillRect(sx, yt + 10, sw, h - 10);
          g.strokeStyle = '#4E2219'; g.lineWidth = 1.5; g.beginPath();
          for (var by = yt + 22, row = 0; by < GROUND; by += 12, row++) {
            g.moveTo(sx, by); g.lineTo(sx + sw, by);
            for (var bxx = sx + (row % 2 ? 8 : 0); bxx < sx + sw; bxx += 16) { g.moveTo(bxx, by - 12); g.lineTo(bxx, by); }
          }
          g.stroke();
          g.fillStyle = '#8C4A3A'; g.fillRect(sx, yt + 40, sw, 8); g.fillRect(sx, yt + 90, sw, 8);
          g.fillStyle = '#5A2A20'; g.fillRect(x + OW * 0.16, yt, OW * 0.68, 12);
          if (Math.floor(st.t / 600) % 2 === 0) { g.beginPath(); g.arc(x + OW / 2, yt - 4, 4, 0, TAU); g.fillStyle = '#FF5A4A'; g.fill(); }
        } else {
          var gr = g.createLinearGradient(x, 0, x + OW, 0);
          gr.addColorStop(0, '#363C48'); gr.addColorStop(0.5, '#5B6274'); gr.addColorStop(1, '#363C48');
          g.fillStyle = gr; g.fillRect(x + 2, yt + 12, OW - 4, h - 12);
          g.beginPath(); g.ellipse(x + OW / 2, yt + 12, OW / 2 - 2, 12, 0, Math.PI, TAU); g.fillStyle = '#4A5060'; g.fill();
          g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.beginPath();
          for (var rx = x + 12; rx < x + OW - 6; rx += 12) { g.moveTo(rx, yt + 14); g.lineTo(rx, GROUND); }
          g.stroke();
          g.fillStyle = '#FDC506'; g.fillRect(x + 2, yt + 30, OW - 4, 5);
        }
      }

      function drawGround() {
        g.fillStyle = '#0F1016'; g.fillRect(0, GROUND, W, H - GROUND);
        g.fillStyle = '#2A2D3A'; g.fillRect(0, GROUND, W, 4);
        g.fillStyle = 'rgba(255,255,255,0.45)';
        var off = st.scroll % 80;
        for (var x = -off; x < W; x += 80) g.fillRect(x, GROUND + 34, 40, 4);
      }

      function drawSign(s) {
        var age = (st.t - s.t0) / 1000;
        if (age > 2.6) { st.sign = null; return; }
        var e = age < 0.35 ? age / 0.35 : age > 2.2 ? 1 - (age - 2.2) / 0.4 : 1;
        g.font = '700 26px Poppins, sans-serif';
        var w = Math.max(g.measureText(s.name).width, 130) + 48, h = 64;
        var cx = W / 2, y = 84 - (age < 0.35 ? (1 - e) * 26 : 0);
        g.save();
        g.globalAlpha = Math.max(0, Math.min(1, e * 1.4));
        g.beginPath();
        if (g.roundRect) g.roundRect(cx - w / 2, y, w, h, 7); else g.rect(cx - w / 2, y, w, h);
        g.fillStyle = '#FDC506'; g.fill();
        g.lineWidth = 3; g.strokeStyle = '#111'; g.stroke();
        g.lineWidth = 1.5; g.strokeRect(cx - w / 2 + 6, y + 6, w - 12, h - 12);
        g.fillStyle = '#111'; g.textAlign = 'center';
        g.font = '600 12px Poppins, sans-serif'; g.fillText(s.top, cx, y + 22);
        g.font = '700 24px Poppins, sans-serif'; g.fillText(s.name, cx, y + 49);
        g.restore();
      }

      function drawBee() {
        g.save();
        g.translate(beeX, st.y);
        var ang = Math.max(-0.45, Math.min(1.3, st.vy / 700));
        if (st.dead) ang = 1.3;
        g.rotate(ang);
        g.scale(0.62, 0.62);
        art.bee(g, st.dead ? 0.2 : Math.sin(st.t / 1000 * 42));
        g.restore();
      }

      function render() {
        var sx = 0, sy = 0;
        if (st.shake > 0 && !ctx.reduce) { var m = 10 * Math.min(1, st.shake / 0.2); sx = (Math.random() * 2 - 1) * m * k * dpr; sy = (Math.random() * 2 - 1) * m * k * dpr; }
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.fillStyle = '#0B0E1F'; g.fillRect(0, 0, cv.width, cv.height);
        g.setTransform(1, 0, 0, 1, sx, sy);
        if (sky) g.drawImage(sky, 0, 0);
        if (far) {
          var fo = -((st.scroll * 0.15) % FAR_W) * k * dpr, fw = far.width;
          g.drawImage(far, fo, 0); g.drawImage(far, fo + fw, 0);
        }
        if (mid) {
          var mo = -((st.scroll * 0.4) % MID_W) * k * dpr, mw = mid.width;
          g.drawImage(mid, mo, 0); g.drawImage(mid, mo + mw, 0);
        }
        g.setTransform(k * dpr, 0, 0, k * dpr, sx, sy);
        st.obs.forEach(function (o) { drawTop(o); drawBottom(o); });
        drawGround();
        st.parts.forEach(function (pt) {
          g.globalAlpha = Math.max(0, 1 - pt.t / pt.life);
          g.beginPath(); g.arc(pt.x, pt.y, pt.size, 0, TAU); g.fillStyle = pt.c; g.fill();
        });
        g.globalAlpha = 1;
        drawBee();
        if (st.on || st.score) {
          var sc = 1 + st.bump * 0.35;
          g.save(); g.translate(W / 2, 46); g.scale(sc, sc);
          g.textAlign = 'center'; g.lineJoin = 'round';
          g.font = '800 46px Poppins, sans-serif';
          g.lineWidth = 7; g.strokeStyle = 'rgba(17,17,17,0.8)'; g.strokeText(String(st.score), 0, 16);
          g.fillStyle = st.bump > 0.5 ? '#FDC506' : '#FFFFFF'; g.fillText(String(st.score), 0, 16);
          g.restore();
        }
        if (st.sign) drawSign(st.sign);
        if (st.flash > 0) { g.fillStyle = 'rgba(255,255,255,' + (st.flash * 0.5) + ')'; g.fillRect(0, 0, W, H); }
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.033, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        render();
        if (st.dead && st.t - st.deadT > 900) { finish(); return; }
        raf = requestAnimationFrame(frame);
      }

      /* Vor dem Start: Biene schwebt auf der Stelle */
      function idle(now) {
        if (st.on) return;
        st.t = now;
        st.y = H * 0.42 + Math.sin(now / 300) * 8;
        render();
        idleRaf = requestAnimationFrame(idle);
      }

      function flap() {
        if (!st.on || st.paused || st.dead) return;
        st.vy = FLAP;
        ctx.tone(520, 780, 0.06, 'triangle', 0.03);
        puff(beeX - 12, st.y + 6, ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.5)'], 4, 70, true);
      }

      function stop() {
        st.on = false;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(idleRaf);
      }

      function finish() {
        stop();
        render();
        ctx.finish(st.score, { score: st.score, city: cityFor(st.score) });
      }

      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        flap();
      });

      resize();
      st.sign = null;
      idleRaf = requestAnimationFrame(idle);

      return {
        start: function () {
          cancelAnimationFrame(idleRaf);
          cancelAnimationFrame(raf);
          st = fresh();
          st.on = true;
          st.last = performance.now();
          st.sign = { top: 'Start in', name: 'Herne', t0: 0 };
          addObs(W + 120);
          ctx.setScore(0);
          ctx.stage.focus({ preventScroll: true });
          st.vy = FLAP;
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on;
          if (!on) { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); }
        },
        abort: function () { stop(); st = fresh(); render(); },
        unmount: stop,
        resize: resize,
        key: function (e) {
          if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'Enter') {
            if (!e.repeat) flap();
            return true;
          }
          return false;
        },
        _debug: function () { return { st: st, beeX: beeX, W: W, boxes: boxes }; }
      };
    }
  });
})();

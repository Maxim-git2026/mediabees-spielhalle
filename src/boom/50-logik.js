
  /* ------------------------------------------------------------------ Das Spiel */
  function legendWasp(t) { return function (g, s) { g.scale(s / 64, s / 64); drawWasp(g, t, { wing: 1, blink: true }); }; }
  MBArcade.register({
    id: 'boom',
    title: 'BOOM 2026',
    duration: 0,
    multiTouch: true,
    ownPause: true,
    startText: 'Die Wespen haben die alte Zeche übernommen. Du fährst als Kumpel mit Grubenhelm ein, mit Faust und Stachler. Die Pollenflinte musst du dir erst holen. Am PC mit Maus und WASD, am Handy quer halten. Ton an für die volle Dröhnung!',
    help: {
      legendTitle: 'Gegner',
      controls: [
        { icons: ['kbd:WASD'], text: 'Laufen und seitlich gehen (Shift = langsam)', kb: true },
        { icons: ['kbd:Maus'], text: 'Umsehen und zielen (ins Bild klicken fängt die Maus). Ohne Maus: Pfeiltasten', kb: true },
        { icons: ['kbd:Klick', 'kbd:Strg'], text: 'Schießen', kb: true },
        { icons: ['kbd:E', 'kbd:Leertaste'], text: 'Benutzen: Türen, Schalter, verdächtige Wände', kb: true },
        { icons: ['kbd:1', 'kbd:3'], text: 'Waffe wählen (auch Mausrad oder Q)', kb: true },
        { icons: ['tap'], text: 'Handy quer halten. Links Daumen-Stick zum Laufen, rechts wischen zum Umsehen, roter Knopf schießt, Hand-Knopf benutzt', touch: true },
        { icons: ['kbd:+', 'kbd:−'], text: 'Maus zu schnell oder zu langsam? Im Spiel einfach anpassen', kb: true },
        { icons: ['kbd:Esc'], text: 'Pausenmenü mit Maus- und Ton-Einstellungen', kb: true }
      ],
      legend: [
        { draw: legendWasp('wespe'), text: 'Wespe: schnell, sticht zu', val: '100' },
        { draw: legendWasp('wach'), text: 'Wach-Wespe: schießt, lässt Stachler fallen', val: '150' },
        { draw: legendWasp('flinte'), text: 'Flinten-Wespe: lässt die Pollenflinte fallen', val: '250' },
        { draw: legendWasp('feuer'), text: 'Feuerwespe: wirft Feuerbälle', val: '300' },
        { draw: legendWasp('kami'), text: 'Kamikaze-Wespe: piept und explodiert', val: '200' },
        { draw: function (g, s) { g.scale(s / 64, s / 64); drawMite(g, { wing: 1 }); }, text: 'Varroa-Milbe: krabbelt im Schwarm', val: '50' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Auch eure Website braucht mal ordentlich Wumms? Sprich uns an.' },
    stats: function (s) {
      if (s.headline) return s.line || '';
      var tm = Math.floor(s.time / 60) + ':' + ('0' + Math.floor(s.time % 60)).slice(-2);
      return (s.won ? 'Sohle 1 geschafft' : 'Unter Tage geblieben') + ' auf „' + DIFFS[s.diff].name + '“ in ' + tm + '. Wespen ' + s.kills + '/' + s.killsTotal + ', Geheimnisse ' + s.secrets + '/' + s.secretsTotal + '.' + (s.code ? ' Dein Code für Sohle 2: ' + s.code : '');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      cv.style.touchAction = 'none';
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var lc = document.createElement('canvas'), lg = lc.getContext('2d');
      var TX = null, SP = null;
      var set = { sens: 1, invert: false, music: 0.6, sfx: 0.9, joyLeft: true, skin: 'braun' };
      var au = makeAudio(ctx, set);
      var cssW = 0, cssH = 0, dpr = 1, W = 320, Hv = 180, hudH = 60, img = null, buf = null, zbuf = null, proj = 1;
      var raf = 0, held = {}, selfUnlock = false, locked = false, touchMode = false;
      var unlocked = { malocher: false };
      var st = fresh();
      var L = null; /* aktuelles Level */
      var P = null; /* Spielfigur */

      function fresh() {
        return { phase: 'title', menu: 'main', sel: 0, t: 0, last: 0, on: false, paused: false, msg: [], fire: { t: 0 }, codeMsg: '', titleT: 0 };
      }
      function ensureArt() { if (!TX) { TX = makeTextures(); SP = makeSprites(); } }

      /* ---------------------------------------------------------------- Level laden */
      function loadLevel(n) {
        ensureArt();
        var lv = LEVELS[n], MW = lv.map[0].length, MH = lv.map.length, N = MW * MH;
        L = {
          n: n, lv: lv, MW: MW, MH: MH, solid: new Uint8Array(N), tex: new Array(N), door: new Array(N), zone: new Array(N),
          ftex: new Array(N), ctex: new Array(N), lampL: new Float32Array(N), cellR: new Float32Array(N), cellG: new Float32Array(N), cellB: new Float32Array(N),
          vR: new Float32Array((MW + 1) * (MH + 1)), vG: new Float32Array((MW + 1) * (MH + 1)), vB: new Float32Array((MW + 1) * (MH + 1)),
          ents: [], foes: [], items: [], decor: [], fx: [], balls: [], flow: new Int16Array(N), flowT: 0,
          kills: 0, killsTotal: 0, itemsGot: 0, itemsTotal: 0, secrets: 0, secretsTotal: 0, time: 0, exitOn: false, alarmT: 0
        };
        var posters = 0, lamps = [];
        for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) {
          var i = y * MW + x, c = lv.map[y][x], z = ZONES[lv.zone[y][x]] || ZONES.r;
          L.zone[i] = z; L.ftex[i] = TX.flats[z.floor]; L.ctex[i] = TX.flats[z.ceil];
          if ('#TLWBMKPX'.indexOf(c) >= 0) {
            L.solid[i] = 1;
            L.tex[i] = c === 'P' ? TX.posters[posters++ % TX.posters.length] : TX[c];
            if (c === 'X') L.exitCell = i;
          } else if (c === 'D' || c === 'R' || c === 'S') {
            var hz = '#TLWBMKPX'.indexOf(lv.map[y][x - 1]) >= 0 && '#TLWBMKPX'.indexOf(lv.map[y][x + 1]) >= 0;
            var side = hz ? lv.map[y][x - 1] : lv.map[y - 1][x];
            var d = { x: x, y: y, i: i, kind: c, hz: hz, open: 0, state: 0, timer: 0, tex: c === 'S' ? (TX.secret[side] || TX.secret.B) : TX[c], jamb: c === 'S' ? (TX[side] || TX.B) : TX.J, found: false };
            L.door[i] = d;
            if (c === 'S') L.secretsTotal++;
          } else {
            var ch = c;
            if (ch === 'p') { P = newPlayer(x + 0.5, y + 0.5); }
            else if (FOES[ch]) { L.foes.push(newFoe(+ch, x + 0.5, y + 0.5)); L.killsTotal++; }
            else if (ITEMS[ch]) { L.items.push({ k: ch, x: x + 0.5, y: y + 0.5, t: Math.random() * 6 }); L.itemsTotal++; }
            else if (DECOR[ch]) {
              var dd = DECOR[ch];
              L.decor.push({ k: ch, x: x + 0.5, y: y + 0.5, d: dd, hp: dd.barrel ? 20 : 0, boom: -1 });
              if (dd.light) lamps.push([x, y]);
            }
          }
        }
        lamps.forEach(function (l) { addLamp(l[0], l[1]); });
        L.lightT = 0;
        computeFlow();
      }
      function addLamp(lx, ly) {
        for (var y = Math.max(0, ly - 5); y <= Math.min(L.MH - 1, ly + 5); y++) for (var x = Math.max(0, lx - 5); x <= Math.min(L.MW - 1, lx + 5); x++) {
          var d = Math.hypot(x - lx, y - ly);
          if (d < 4.5 && los(lx + 0.5, ly + 0.5, x + 0.5, y + 0.5, true)) L.lampL[y * L.MW + x] += 0.85 * Math.pow(1 - d / 4.5, 1.4);
        }
      }
      function newPlayer(x, y) {
        return { x: x, y: y, a: -PI / 2, pitch: 0, hp: 100, ar: 0, ammo: { sta: 50, pol: 0 }, has: [true, true, false], wp: 1, want: 1, lower: 0,
          anim: 0, cool: 0, flash: 0, bob: 0, bobAmt: 0, keys: {}, lamp: false, berserk: 0, hurtT: 0, hurtDir: 0, grin: 0, pickT: 0, dead: false, deadT: 0,
          vx: 0, vy: 0, kick: 0, spreadT: 0, painFace: 0, ouch: false, holdT: 0, smirk: 0, shots: 0, hits: 0, dmgTaken: 0, look: 0, lookT: 0, heartT: 0, reload: 0, rageT: 0 };
      }
      function newFoe(type, x, y) {
        var d = FOES[type];
        return { type: type, d: d, key: d.key, x: x, y: y, hp: d.hp * (st.diff >= 2 ? 1.1 : 1), state: 'idle', t: 0, cool: rnd(0.5, 1.5), atkT: 0, painT: 0, dieT: 0,
          z: d.z, phase: Math.random() * TAU, sightT: Math.random() * 0.3, vx: 0, vy: 0, beepT: 0, dead: false, screamed: false, strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rnd(1, 2.5), wake: 0 };
      }

      /* ---------------------------------------------------------------- Welt-Abfragen */
      function cellSolid(x, y, forFoe) {
        if (x < 0 || y < 0 || x >= L.MW || y >= L.MH) return true;
        var i = y * L.MW + x;
        if (L.solid[i]) return true;
        var d = L.door[i];
        if (d) return d.open < 0.92;
        return false;
      }
      /* Sichtlinie (Wände und geschlossene Türteile blockieren) */
      function los(x0, y0, x1, y1, ignoreDoors) {
        var dx = x1 - x0, dy = y1 - y0, dist = Math.hypot(dx, dy);
        if (dist < 0.01) return true;
        var h = ray(x0, y0, dx / dist, dy / dist, ignoreDoors);
        return h.dist >= dist - 0.05;
      }
      /* Einfacher Strahl für Treffer und Sicht: liefert Abstand bis zur Wand */
      var RH = { dist: 0, x: 0, y: 0, door: null };
      function ray(px, py, rdx, rdy, ignoreDoors) {
        var mx = Math.floor(px), my = Math.floor(py);
        var ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
        var sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
        var sdx = rdx < 0 ? (px - mx) * ddx : (mx + 1 - px) * ddx, sdy = rdy < 0 ? (py - my) * ddy : (my + 1 - py) * ddy;
        var side = 0, guard = 0;
        RH.door = null;
        while (guard++ < 200) {
          if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
          if (mx < 0 || my < 0 || mx >= L.MW || my >= L.MH) break;
          var i = my * L.MW + mx;
          if (L.solid[i]) { var dist = side === 0 ? sdx - ddx : sdy - ddy; RH.dist = dist; RH.x = px + rdx * dist; RH.y = py + rdy * dist; return RH; }
          var d = L.door[i];
          if (d && !ignoreDoors) {
            var t, hx;
            if (d.hz) { t = (my + 0.5 - py) / (rdy || 1e-9); hx = px + rdx * t; if (t > 0 && Math.floor(hx) === mx && hx - mx >= d.open) { RH.dist = t; RH.x = hx; RH.y = my + 0.5; RH.door = d; return RH; } }
            else { t = (mx + 0.5 - px) / (rdx || 1e-9); hx = py + rdy * t; if (t > 0 && Math.floor(hx) === my && hx - my >= d.open) { RH.dist = t; RH.x = mx + 0.5; RH.y = hx; RH.door = d; return RH; } }
          }
        }
        RH.dist = 99; RH.x = px + rdx * 99; RH.y = py + rdy * 99;
        return RH;
      }
      /* Kreis gegen Raster bewegen, an Wänden entlanggleiten */
      function blockedAt(x, y, r, self) {
        var x0 = Math.floor(x - r), x1 = Math.floor(x + r), y0 = Math.floor(y - r), y1 = Math.floor(y + r);
        for (var cy = y0; cy <= y1; cy++) for (var cx = x0; cx <= x1; cx++) if (cellSolid(cx, cy)) {
          var nx = clamp(x, cx, cx + 1), ny = clamp(y, cy, cy + 1);
          if ((x - nx) * (x - nx) + (y - ny) * (y - ny) < r * r) return true;
        }
        for (var k = 0; k < L.decor.length; k++) { var o = L.decor[k]; if (o.d.block && !o.gone && (x - o.x) * (x - o.x) + (y - o.y) * (y - o.y) < (r + o.d.r) * (r + o.d.r)) return true; }
        if (self !== P && !P.dead && (x - P.x) * (x - P.x) + (y - P.y) * (y - P.y) < (r + 0.28) * (r + 0.28)) return true;
        for (var j = 0; j < L.foes.length; j++) { var f = L.foes[j]; if (f === self || f.dead || f.state === 'dying') continue; var rr = r + f.d.r * 0.8; if ((x - f.x) * (x - f.x) + (y - f.y) * (y - f.y) < rr * rr) return true; }
        return false;
      }
      function move(e, dx, dy, r) {
        var moved = false;
        if (!blockedAt(e.x + dx, e.y, r, e)) { e.x += dx; moved = true; }
        if (!blockedAt(e.x, e.y + dy, r, e)) { e.y += dy; moved = true; }
        return moved;
      }
      /* Wegekarte: Breitensuche vom Spieler aus (Türen zählen als begehbar, rote/geheime nur offen) */
      function computeFlow() {
        var N = L.MW * L.MH, q = new Int32Array(N), h = 0, t = 0;
        L.flow.fill(-1);
        var s = Math.floor(P.y) * L.MW + Math.floor(P.x);
        L.flow[s] = 0; q[t++] = s;
        while (h < t) {
          var i = q[h++], x = i % L.MW, y = (i - x) / L.MW, nd = L.flow[i] + 1;
          if (nd > 60) continue;
          for (var k = 0; k < 4; k++) {
            var nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
            if (nx < 0 || ny < 0 || nx >= L.MW || ny >= L.MH) continue;
            var j = ny * L.MW + nx;
            if (L.flow[j] >= 0 || L.solid[j]) continue;
            var d = L.door[j];
            if (d && d.kind !== 'D' && d.open < 0.9) continue;
            L.flow[j] = nd; q[t++] = j;
          }
        }
      }

      /* ---------------------------------------------------------------- Meldungen und Juice */
      function msg(text, color) { st.msg.unshift({ text: text, t: 0, c: color || '#F2E9D0' }); if (st.msg.length > 4) st.msg.length = 4; }
      function quip(text, color) { ctx.fx.text(cssW / 2, (cssH - hudH) * 0.32, text, color || '#FDC506', Math.min(30, cssW / 18)); }
      function spatial(x, y) {
        var dx = x - P.x, dy = y - P.y, d = Math.hypot(dx, dy);
        var rel = angNorm(Math.atan2(dy, dx) - P.a);
        return { pan: Math.sin(rel) * 0.8, vol: clamp(1.15 - d / 16, 0.05, 1), d: d };
      }

      /* ---------------------------------------------------------------- Türen, Schalter, Geheimnisse */
      function openDoor(d, byFoe) {
        if (d.state === 1 || d.open > 0.95) { d.timer = 4; return true; }
        if (d.kind === 'R' && !P.keys.red) { if (!byFoe) { if (st.lockMsgT <= 0) { msg('Du brauchst die rote Grubenmarke.', '#FF7A6B'); au.locked(); st.lockMsgT = 1.2; } } return false; }
        if (d.kind === 'S' && byFoe) return false;
        d.state = 1; d.timer = 4;
        var sp = spatial(d.x + 0.5, d.y + 0.5); au.door(sp.pan, sp.vol);
        if (d.kind === 'S' && !d.found) { d.found = true; L.secrets++; addScore(1000); msg('Geheimnis entdeckt!', '#7CFF8A'); au.secret(); quip('Da war was!', '#7CFF8A'); }
        return true;
      }
      function useAction() {
        var ux = P.x + Math.cos(P.a) * 1.0, uy = P.y + Math.sin(P.a) * 1.0;
        var h = ray(P.x, P.y, Math.cos(P.a), Math.sin(P.a), true);
        var hitI = -1;
        if (h.dist < 1.6) { var bx = Math.floor(h.x + Math.cos(P.a) * 0.01), by = Math.floor(h.y + Math.sin(P.a) * 0.01); hitI = by * L.MW + bx; }
        /* Tür direkt vor dir (auch offene Türen zählen nicht) */
        var cx = Math.floor(ux), cy = Math.floor(uy), ci = cy * L.MW + cx;
        if (L.door[ci]) { openDoor(L.door[ci]); return; }
        var ci2 = Math.floor(P.y + Math.sin(P.a) * 0.6) * L.MW + Math.floor(P.x + Math.cos(P.a) * 0.6);
        if (L.door[ci2]) { openDoor(L.door[ci2]); return; }
        if (hitI >= 0 && hitI === L.exitCell) { exitLevel(); return; }
        if (hitI >= 0) { au.empty(); }
      }
      function exitLevel() {
        if (L.exitOn) return;
        L.exitOn = true; L.tex[L.exitCell] = TX.X2; au.lever();
        msg('Förderkorb fährt hoch …', '#FDC506');
        st.exitT = 1.4;
      }

      /* ---------------------------------------------------------------- Punkte */
      function addScore(n) { st.score += n; ctx.setScore(Math.round(st.score * DIFFS[st.diff].mult)); }

      /* ---------------------------------------------------------------- Spieler */
      function damagePlayer(n, fromX, fromY) {
        if (P.dead || st.phase !== 'play') return;
        n = Math.round(n * DIFFS[st.diff].dmg);
        if (n <= 0) return;
        var save = P.ar > 0 ? Math.min(P.ar, Math.floor(n / 3)) : 0;
        P.ar -= save; n -= save;
        P.hp -= n; P.dmgTaken += n;
        P.hurtT = Math.min(1, 0.35 + n / 30);
        P.painFace = 0.5; P.ouch = n >= 20;
        if (fromX !== undefined) { var rel = angNorm(Math.atan2(fromY - P.y, fromX - P.x) - P.a); P.hurtDir = rel; P.look = clamp(rel * 1.5, -1, 1); P.lookT = 1; }
        au.hurt();
        if (n >= 15 && !ctx.reduce) ctx.fx.shake(0.18, 5);
        if (P.hp <= 0) { P.hp = 0; die(); }
        else if (n >= 25 && Math.random() < 0.4) quip(pick(QUIPS_HURT), '#FF7A6B');
      }
      function die() {
        P.dead = true; P.deadT = 0; st.phase = 'dead';
        au.die(); au.music('off');
        releaseMouse();
        st.deadLine = pick(QUIPS_DEAD);
        if (!ctx.reduce) { ctx.fx.flash('229,50,45', 0.7); ctx.fx.shake(0.4, 8); }
      }
      function giveItem(it) {
        var k = ITEMS[it.k], used = false;
        if (k.hp) { var lim = k.hp[1]; if (P.hp < lim) { P.hp = Math.min(lim, P.hp + k.hp[0]); used = true; } }
        if (k.ar) { var lim2 = k.ar[1]; if (P.ar < lim2) { P.ar = Math.min(lim2, P.ar + k.ar[0]); used = true; } }
        if (k.ammo) { var t = k.ammo[0], amt = k.ammo[1] * DIFFS[st.diff].ammo; if (P.ammo[t] < MAXAMMO[t]) { P.ammo[t] = Math.min(MAXAMMO[t], P.ammo[t] + amt); used = true; } }
        if (k.weapon !== undefined && !P.has[k.weapon]) {
          P.has[k.weapon] = true; used = true; P.grin = 1.6; P.want = k.weapon; au.weapon();
          if (!ctx.reduce) ctx.fx.flash('253,197,6', 0.35);
          quip(k.weapon === 2 ? 'POLLENFLINTE!' : 'STACHLER!', '#FDC506');
        } else if (k.weapon !== undefined && used) { /* nur Munition */ }
        if (k.berserk) { P.berserk = 1; P.rageT = 20; used = true; P.want = 0; if (!ctx.reduce) ctx.fx.flash('229,50,45', 0.6); quip('BERSERKER!', '#FF5A4C'); }
        if (k.lamp) { P.lamp = true; used = true; }
        if (k.key) { P.keys[k.key] = true; used = true; au.keyGet(); }
        if (k.pts) addScore(k.pts);
        if (!used) return false;
        msg(k.msg);
        if (k.weapon === undefined && !k.key) { if (k.ar) au.armor(); else au.pickup(); }
        P.pickT = 0.25;
        if (!it.dropped) L.itemsGot++;
        return true;
      }

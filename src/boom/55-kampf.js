
      /* ---------------------------------------------------------------- Waffen */
      function aimSlope() { return touchMode ? null : P.pitch / proj; }
      /* Treffer entlang eines Strahls: nächster Gegner oder Fass vor der Wand */
      function hitscan(ang, slope, maxD) {
        var dx = Math.cos(ang), dy = Math.sin(ang);
        var w = ray(P.x, P.y, dx, dy);
        var wallD = Math.min(w.dist, maxD || 99), best = null, bestT = wallD;
        function test(o, r, z0, h) {
          var ox = o.x - P.x, oy = o.y - P.y, t = ox * dx + oy * dy;
          if (t <= 0.05 || t >= bestT) return;
          var off = Math.abs(ox * dy - oy * dx);
          if (off > r) return;
          if (slope !== null) {
            var zs = 0.5 + slope * t, tol = 0.1 + 0.04 * t;
            if (zs < z0 - tol || zs > z0 + h + tol) return;
          }
          best = o; bestT = t;
        }
        for (var i = 0; i < L.foes.length; i++) { var f = L.foes[i]; if (f.dead || f.state === 'dying') continue; test(f, f.d.r + 0.06, f.z, f.d.h); }
        for (var k = 0; k < L.decor.length; k++) { var o = L.decor[k]; if (o.d.barrel && !o.gone && o.boom < 0) test(o, 0.3, 0, 0.5); }
        return { obj: best, t: bestT, wall: !best && wallD < (maxD || 99), wx: P.x + dx * (bestT - 0.05), wy: P.y + dy * (bestT - 0.05), z: slope === null ? 0.5 : clamp(0.5 + slope * bestT, 0.05, 0.95) };
      }
      function hurt(o, n, src) {
        if (o.d && o.d.barrel !== undefined && o.boom !== undefined && !o.type) { if (o.gone) return; o.hp -= n; if (o.hp <= 0 && o.boom < 0) o.boom = 0.12; return; }
        hurtFoe(o, n, src);
      }
      function fire() {
        var wp = P.wp, W0 = WEAPONS[wp];
        if (P.cool > 0 || P.lower > 0.05) return;
        if (W0.ammo) {
          var need = 1;
          if (P.ammo[W0.ammo] < need) { au.empty(); P.cool = 0.25; autoSwitch(); return; }
          P.ammo[W0.ammo] -= need;
        }
        P.cool = W0.rate; P.anim = 0.0001; P.shots++;
        if (wp === 0) { au.fist(); P.punchAt = 0.12; return; }
        P.flash = 0.07; st.lightFlash = 0.12;
        if (wp === 1) au.pistol(); else { au.shotgun(); P.reload = 0; P.reloadAt = 0.35; if (!ctx.reduce) ctx.fx.shake(0.12, 4); }
        P.kick = wp === 2 ? 1 : 0.4;
        noiseAlert(wp === 2 ? 14 : 11);
        var slope = aimSlope(), sp = W0.spread * (wp === 1 && P.spreadT > 0 ? 1.8 : (wp === 1 ? 0.3 : 1));
        var any = false;
        for (var k = 0; k < W0.pellets; k++) {
          var a = P.a + (W0.pellets > 1 ? rnd(-sp, sp) : rnd(-sp, sp));
          var sl = slope === null ? null : slope + rnd(-0.02, 0.02) * (wp === 2 ? 1.5 : 0.5);
          var h = hitscan(a, sl);
          if (h.obj) { hurt(h.obj, irnd(W0.dmin, W0.dmax), P); addFx('spritz', h.wx, h.wy, h.z, 0.24); any = true; }
          else if (h.t < 40) addFx('puff', h.wx, h.wy, h.z, 0.3);
        }
        if (any) P.hits++;
        P.spreadT = 0.5;
        if (wp === 2) { /* nachladen sichtbar */ }
      }
      function punch() {
        var best = null, bd = 99, dmg = irnd(2, 20) * (P.berserk ? 10 : 1);
        L.foes.forEach(function (f) {
          if (f.dead || f.state === 'dying') return;
          var dx = f.x - P.x, dy = f.y - P.y, d = Math.hypot(dx, dy);
          var rel = Math.abs(angNorm(Math.atan2(dy, dx) - P.a));
          if (d < WEAPONS[0].range + f.d.r && rel < 0.5 && d < bd && los(P.x, P.y, f.x, f.y)) { best = f; bd = d; }
        });
        L.decor.forEach(function (o) { if (o.d.barrel && !o.gone && o.boom < 0) { var d = Math.hypot(o.x - P.x, o.y - P.y), rel = Math.abs(angNorm(Math.atan2(o.y - P.y, o.x - P.x) - P.a)); if (d < 1.3 && rel < 0.5 && d < bd) { best = o; bd = d; } } });
        if (best) {
          au.punchHit(); hurt(best, dmg, P);
          addFx('spritz', best.x - Math.cos(P.a) * 0.2, best.y - Math.sin(P.a) * 0.2, 0.45, 0.24);
          if (!ctx.reduce) ctx.fx.shake(P.berserk ? 0.15 : 0.08, P.berserk ? 6 : 3);
          if (best.type) { var push = P.berserk ? 0.5 : 0.15; move(best, Math.cos(P.a) * push, Math.sin(P.a) * push, best.d.r); }
        }
      }
      function autoSwitch() {
        if (P.has[2] && P.ammo.pol > 0) P.want = 2;
        else if (P.ammo.sta > 0) P.want = 1;
        else P.want = 0;
      }
      function selectWeapon(n) {
        if (n < 0 || n > 2 || !P.has[n] || P.dead) return;
        if (n === P.wp && P.lower === 0) return;
        P.want = n; au.menu();
      }
      function cycleWeapon(dir) {
        for (var k = 1; k <= 3; k++) { var n = (P.want + dir * k + 3) % 3; if (P.has[n] && (n === 0 || P.ammo[WEAPONS[n].ammo] > 0)) { selectWeapon(n); return; } }
      }
      /* Lärm weckt Gegner in der Nähe (über die Wegekarte, also nicht durch Wände) */
      function noiseAlert(range) {
        for (var i = 0; i < L.foes.length; i++) {
          var f = L.foes[i];
          if (f.dead || f.state !== 'idle') continue;
          var c = L.flow[Math.floor(f.y) * L.MW + Math.floor(f.x)];
          if (c >= 0 && c <= range) wake(f, rnd(0.05, 0.4));
        }
      }
      function wake(f, delay) {
        if (f.state !== 'idle') return;
        f.state = 'chase'; f.wake = delay || 0; f.cool = rnd(0.6, 1.4) * DIFFS[st.diff].cool;
        var sp = spatial(f.x, f.y); au.buzz(f.key, sp.pan, sp.vol);
        if (f.key === 'kami' && !f.screamed) { f.screamed = true; au.scream(sp.pan, sp.vol); }
      }

      /* ---------------------------------------------------------------- Effekte in der Welt */
      function addFx(kind, x, y, z, life) { L.fx.push({ kind: kind, x: x, y: y, z: z, t: 0, life: life }); }
      function explode(x, y, power, src) {
        addFx('boom', x, y, 0.15, 0.5);
        st.lightFlash = 0.35;
        var sp = spatial(x, y); au.boom(sp.pan, sp.vol);
        if (!ctx.reduce) ctx.fx.shake(clamp(0.5 - sp.d * 0.04, 0.1, 0.45), clamp(14 - sp.d, 3, 12));
        var R = 2.6;
        if (!P.dead) { var dp = Math.hypot(P.x - x, P.y - y); if (dp < R && los(x, y, P.x, P.y)) damagePlayer(power * (1 - dp / R) + 4, x, y); }
        L.foes.forEach(function (f) { if (f.dead || f.state === 'dying') return; var d = Math.hypot(f.x - x, f.y - y); if (d < R && los(x, y, f.x, f.y)) hurtFoe(f, power * 1.4 * (1 - d / R) + 6, src || 'boom'); });
        L.decor.forEach(function (o) { if (o.d.barrel && !o.gone && o.boom < 0) { var d = Math.hypot(o.x - x, o.y - y); if (d < R && d > 0.05) o.boom = 0.18 + d * 0.06; } });
        noiseAlert(16);
      }

      /* ---------------------------------------------------------------- Gegner */
      function hurtFoe(f, n, src) {
        if (f.dead || f.state === 'dying') return;
        f.hp -= n; f.flashT = 0.08;
        if (f.state === 'idle') wake(f, 0);
        if (f.hp <= 0) { killFoe(f, src); return; }
        var painChance = { wespe: 0.45, wach: 0.7, flinte: 0.6, feuer: 0.3, kami: 0.15, milbe: 0.5 }[f.key];
        if (Math.random() < painChance) { f.painT = 0.22; f.atkT = 0; var sp = spatial(f.x, f.y); au.pain(sp.pan, sp.vol); }
      }
      function killFoe(f, src) {
        f.state = 'dying'; f.dieT = 0;
        var sp = spatial(f.x, f.y); au.splat(sp.pan, sp.vol); au.gibs(sp.pan, sp.vol * 0.6);
        L.kills++;
        if (src !== 'self') addScore(f.d.pts);
        if (f.d.drop === 'sta') L.items.push({ k: 'G', x: f.x, y: f.y, t: 0, dropped: true });
        if (f.d.drop === 'pol') L.items.push({ k: P.has[2] ? 'c' : 'F', x: f.x, y: f.y, t: 0, dropped: true });
        if (f.key === 'kami') explode(f.x, f.y, f.d.boom, f);
        /* Sprüche: Mehrfach-Treffer, sonst ab und zu */
        st.killWin = (st.killWinT > 0 ? st.killWin : 0) + 1; st.killWinT = 0.7;
        if (st.killWin === 2) quip(pick(QUIPS_MULTI));
        else if (st.killWin === 4) quip(pick(QUIPS_MASS), '#FF9F1A');
        else if (st.killWin === 1 && Math.random() < 0.18) quip(pick(QUIPS_KILL));
      }
      function foeShoot(f) {
        var d = Math.hypot(P.x - f.x, P.y - f.y), sp = spatial(f.x, f.y);
        f.atkT = 0.35;
        if (f.key === 'feuer') {
          var a = Math.atan2(P.y - f.y, P.x - f.x);
          L.balls.push({ x: f.x + Math.cos(a) * 0.4, y: f.y + Math.sin(a) * 0.4, z: f.z + 0.15, vx: Math.cos(a) * 5.2, vy: Math.sin(a) * 5.2, t: 0, src: f });
          au.fireball(sp.pan, sp.vol);
          return;
        }
        au.enemyShot(f.key, sp.pan, sp.vol);
        var moving = Math.hypot(P.vx, P.vy) > 1 ? 0.15 : 0;
        for (var k = 0; k < f.d.pellets; k++) {
          var chance = clamp(0.82 - d * 0.045 - moving, 0.12, 0.9);
          if (Math.random() < chance) damagePlayer(irnd(f.d.shot[0], f.d.shot[1]), f.x, f.y);
        }
      }
      function updateFoe(f, dt) {
        f.t += dt;
        if (f.flashT > 0) f.flashT -= dt;
        if (f.state === 'dying') { f.dieT += dt; if (f.dieT > 0.5) { f.state = 'dead'; f.dead = true; } return; }
        if (f.dead) return;
        var dx = P.x - f.x, dy = P.y - f.y, dist = Math.hypot(dx, dy);
        f.z = f.d.z + (f.d.fly ? Math.sin(f.t * 3 + f.phase) * 0.05 : 0);
        if (f.state === 'idle') {
          f.sightT -= dt;
          if (f.sightT <= 0) { f.sightT = 0.25; if (dist < 17 && !P.dead && los(f.x, f.y, P.x, P.y)) wake(f, rnd(0.1, 0.5)); }
          return;
        }
        if (f.wake > 0) { f.wake -= dt; return; }
        if (P.dead) { f.state = 'idle'; return; }
        if (f.painT > 0) { f.painT -= dt; return; }
        if (f.atkT > 0) { f.atkT -= dt; return; }
        var D = DIFFS[st.diff], spd = f.d.speed * D.speed;
        f.cool -= dt;
        f.sightT -= dt;
        if (f.sightT <= 0) { f.sightT = 0.2; f.see = los(f.x, f.y, P.x, P.y); }
        /* Angriffe */
        if (f.d.melee && dist < f.d.r + 0.28 + 0.35) {
          if (f.cool <= 0) { f.cool = (f.key === 'milbe' ? 0.6 : 0.85) * D.cool; f.atkT = 0.2; damagePlayer(irnd(f.d.melee[0], f.d.melee[1]), f.x, f.y); var sp0 = spatial(f.x, f.y); if (f.key === 'milbe') au.bite(sp0.pan, sp0.vol); else au.pain(sp0.pan, sp0.vol * 0.5); }
          return;
        }
        if (f.key === 'kami') {
          f.beepT -= dt;
          if (f.beepT <= 0) { f.beepT = clamp(dist * 0.08, 0.08, 0.6); var sp1 = spatial(f.x, f.y); au.beep(sp1.pan, sp1.vol); }
          if (dist < f.d.r + 0.28 + 0.25) { killFoe(f, 'self'); return; }
        }
        if ((f.d.shot || f.d.ball) && f.see && dist < 18 && f.cool <= 0) {
          f.cool = rnd(1.3, 2.4) * D.cool * (f.key === 'feuer' ? 1.2 : 1);
          foeShoot(f); return;
        }
        /* Bewegung: direkt auf dich zu, sonst der Wegekarte nach */
        var tx = P.x, ty = P.y;
        if (!f.see) {
          var cx = Math.floor(f.x), cy = Math.floor(f.y), here = L.flow[cy * L.MW + cx], best = here, bx = cx, by = cy;
          for (var k = 0; k < 4; k++) {
            var nx = cx + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = cy + (k === 2 ? 1 : k === 3 ? -1 : 0);
            var v = L.flow[ny * L.MW + nx];
            if (v >= 0 && (best < 0 || v < best)) { best = v; bx = nx; by = ny; }
          }
          tx = bx + 0.5; ty = by + 0.5;
        }
        var mdx = tx - f.x, mdy = ty - f.y, md = Math.hypot(mdx, mdy) || 1;
        var keep = (f.d.shot || f.d.ball) && f.see ? 3.2 : 0;
        var dirx = mdx / md, diry = mdy / md;
        if (keep && dist < keep) { dirx = -dirx * 0.5; diry = -diry * 0.5; }
        /* seitlich ausweichen, damit sie nicht wie Zinnsoldaten ankommen */
        f.strafeT -= dt;
        if (f.strafeT <= 0) { f.strafe = -f.strafe; f.strafeT = rnd(0.8, 2.2); }
        var sw = f.see && f.key !== 'kami' && f.key !== 'milbe' ? 0.45 : f.key === 'milbe' ? 0.25 : 0;
        var vx = (dirx - diry * f.strafe * sw) * spd, vy = (diry + dirx * f.strafe * sw) * spd;
        var moved = move(f, vx * dt, vy * dt, f.d.r);
        /* Türen öffnen, wenn sie davor stehen */
        var fi = Math.floor(f.y + diry * 0.6) * L.MW + Math.floor(f.x + dirx * 0.6);
        if (L.door[fi] && L.door[fi].kind === 'D') openDoor(L.door[fi], true);
        if (!moved) f.strafe = -f.strafe;
      }

      /* ---------------------------------------------------------------- Ablauf im Spiel */
      function updatePlay(dt) {
        L.time += dt;
        st.t += dt;
        if (st.lockMsgT > 0) st.lockMsgT -= dt;
        if (st.killWinT > 0) st.killWinT -= dt;
        if (st.lightFlash > 0) st.lightFlash -= dt;
        /* Spieler bewegen */
        var fwd = 0, side = 0, turn = 0;
        if (held.KeyW || held.ArrowUp) fwd += 1;
        if (held.KeyS || held.ArrowDown) fwd -= 1;
        if (held.KeyA) side -= 1;
        if (held.KeyD) side += 1;
        if (held.ArrowLeft) turn -= 1;
        if (held.ArrowRight) turn += 1;
        if (joy) { fwd += clamp(-joy.dy, -1, 1); side += clamp(joy.dx, -1, 1); }
        var spd = (held.ShiftLeft || held.ShiftRight ? 2.1 : 3.9);
        var len = Math.hypot(fwd, side); if (len > 1) { fwd /= len; side /= len; }
        P.a += turn * 2.6 * dt * set.sens;
        var ca = Math.cos(P.a), sa = Math.sin(P.a);
        var tvx = (ca * fwd - sa * side) * spd, tvy = (sa * fwd + ca * side) * spd;
        P.vx += (tvx - P.vx) * Math.min(1, dt * 12); P.vy += (tvy - P.vy) * Math.min(1, dt * 12);
        if (!P.dead) {
          move(P, P.vx * dt, P.vy * dt, 0.27);
          /* gegen eine Tür laufen öffnet sie (praktisch am Handy) */
          if (len > 0.3) { var di = Math.floor(P.y + sa * 0.55 * Math.sign(fwd || 1)) * L.MW + Math.floor(P.x + ca * 0.55 * Math.sign(fwd || 1)); var dd = L.door[di]; if (dd && dd.kind !== 'S' && dd.state === 0) openDoor(dd); }
        }
        var sp = Math.hypot(P.vx, P.vy);
        P.bobAmt += ((sp > 0.5 ? 1 : 0) - P.bobAmt) * Math.min(1, dt * 6);
        P.bob += dt * sp * 2.2;
        /* Waffe wechseln (runter, wechseln, hoch) */
        if (P.want !== P.wp) { P.lower = Math.min(1, P.lower + dt * 5); if (P.lower >= 1) { P.wp = P.want; } }
        else if (P.lower > 0) P.lower = Math.max(0, P.lower - dt * 5);
        if (P.cool > 0) P.cool -= dt;
        if (P.anim > 0) { P.anim += dt / WEAPONS[P.wp].rate; if (P.anim >= 1) P.anim = 0; }
        if (P.punchAt > 0) { P.punchAt -= dt; if (P.punchAt <= 0) punch(); }
        if (P.reloadAt > 0) { P.reloadAt -= dt; if (P.reloadAt <= 0) P.reloadT = 0.5; }
        if (P.reloadT > 0) { P.reloadT -= dt; P.reload = Math.sin((1 - P.reloadT / 0.5) * PI); if (P.reloadT <= 0) P.reload = 0; }
        if (P.flash > 0) P.flash -= dt;
        if (P.kick > 0) P.kick = Math.max(0, P.kick - dt * 5);
        if (P.spreadT > 0) P.spreadT -= dt;
        if (P.hurtT > 0) P.hurtT -= dt * 1.4;
        if (P.painFace > 0) P.painFace -= dt;
        if (P.grin > 0) P.grin -= dt;
        if (P.pickT > 0) P.pickT -= dt;
        if (P.rageT > 0) P.rageT -= dt;
        /* Feuern (Maus, Strg oder Touch-Knopf gedrückt halten) */
        if ((held.mouse || held.ControlLeft || held.ControlRight || held.KeyF || held.touchFire) && !P.dead) fire();
        /* Gesicht schaut ab und zu herum */
        P.lookT -= dt;
        if (P.lookT <= 0) { P.lookT = rnd(0.8, 2.2); P.look = pick([-1, 0, 0, 1]); }
        /* Herzklopfen bei wenig Leben */
        if (P.hp < 25 && !P.dead) { P.heartT -= dt; if (P.heartT <= 0) { P.heartT = 1.1; au.heart(); } }
        /* Gegenstände */
        for (var i = L.items.length - 1; i >= 0; i--) {
          var it = L.items[i]; it.t += dt;
          if (!P.dead && (it.x - P.x) * (it.x - P.x) + (it.y - P.y) * (it.y - P.y) < 0.45 && giveItem(it)) L.items.splice(i, 1);
        }
        /* Türen */
        for (var k in L.door) {
          var d = L.door[k]; if (!d) continue;
          if (d.state === 1) { d.open = Math.min(1, d.open + dt * 1.6); if (d.open >= 1 && d.kind !== 'S') { d.timer -= dt; if (d.timer <= 0 && !occupied(d)) { d.state = 0; var s2 = spatial(d.x + 0.5, d.y + 0.5); au.door(s2.pan, s2.vol * 0.7); } } }
          else if (d.open > 0) { d.open = Math.max(0, d.open - dt * 1.6); if (occupied(d)) d.state = 1; }
        }
        /* Gegner, Feuerbälle, Fässer, Effekte */
        L.flowT -= dt; if (L.flowT <= 0) { L.flowT = 0.35; computeFlow(); }
        var alerted = 0;
        for (var j = 0; j < L.foes.length; j++) { var f = L.foes[j]; updateFoe(f, dt); if (!f.dead && f.state !== 'idle' && f.state !== 'dying' && Math.hypot(f.x - P.x, f.y - P.y) < 16) alerted++; }
        au.setIntensity(alerted > 0 ? 1 : 0);
        for (var b = L.balls.length - 1; b >= 0; b--) {
          var bl = L.balls[b]; bl.t += dt;
          bl.x += bl.vx * dt; bl.y += bl.vy * dt;
          var hitP = !P.dead && Math.hypot(bl.x - P.x, bl.y - P.y) < 0.38;
          if (hitP || cellSolid(Math.floor(bl.x), Math.floor(bl.y)) || bl.t > 6) {
            if (hitP) damagePlayer(irnd(8, 20), bl.x - bl.vx, bl.y - bl.vy);
            addFx('boomS', bl.x - bl.vx * 0.02, bl.y - bl.vy * 0.02, bl.z - 0.1, 0.3);
            var s3 = spatial(bl.x, bl.y); au.splat(s3.pan, s3.vol * 0.5);
            L.balls.splice(b, 1);
          }
        }
        L.decor.forEach(function (o) { if (o.boom > 0) { o.boom -= dt; if (o.boom <= 0) { o.boom = -2; o.gone = true; explode(o.x, o.y, 80, 'boom'); } } });
        for (var e = L.fx.length - 1; e >= 0; e--) { L.fx[e].t += dt; if (L.fx[e].t >= L.fx[e].life) L.fx.splice(e, 1); }
        for (var m = st.msg.length - 1; m >= 0; m--) { st.msg[m].t += dt; if (st.msg[m].t > 3) st.msg.splice(m, 1); }
        if (st.exitT > 0) { st.exitT -= dt; if (st.exitT <= 0) finishLevel(); }
      }
      function occupied(d) {
        var cx = d.x + 0.5, cy = d.y + 0.5;
        if (Math.abs(P.x - cx) < 0.8 && Math.abs(P.y - cy) < 0.8) return true;
        return L.foes.some(function (f) { return !f.dead && f.state !== 'dying' && Math.abs(f.x - cx) < 0.8 && Math.abs(f.y - cy) < 0.8; });
      }


      /* ---------------------------------------------------------------- Größe */
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        hudH = Math.round(clamp(cssH * 0.13, 44, 84));
        var vh = cssH - hudH;
        W = Math.round(clamp(cssW / (cssW > 900 ? 3 : 2.6), 200, 440));
        Hv = Math.max(100, Math.round(W * vh / cssW));
        lc.width = W; lc.height = Hv;
        img = lg.createImageData(W, Hv); buf = new Uint32Array(img.data.buffer); zbuf = new Float32Array(W);
        proj = (W / 2) / 0.66;
        coneX = new Float32Array(W);
        for (var x = 0; x < W; x++) { var cx = (x - W / 2) / (W * 0.42); coneX[x] = cx * cx; }
      }
      var coneX = null;

      /* ---------------------------------------------------------------- Licht je Feld (jedes Bild neu: Flackern, Alarm, Mündungsfeuer) */
      function updateLight() {
        var MW = L.MW, MH = L.MH, t = st.t, fl = st.lightFlash > 0 ? st.lightFlash * 3 : 0;
        var flick = Math.sin(t * 31) > 0.93 || Math.sin(t * 7.3) > 0.985 ? 0.45 : 1;
        var alarm = 0.55 + 0.45 * Math.max(0, Math.sin(t * 3.6));
        for (var i = 0; i < MW * MH; i++) {
          if (L.solid[i]) { L.cellR[i] = L.cellG[i] = L.cellB[i] = -1; continue; }
          var z = L.zone[i], m = z.flicker ? flick : z.alarm ? alarm : 1, b = z.light * m, lp = L.lampL[i];
          var x = i % MW, y = (i - x) / MW, add = 0;
          if (fl) { var d = Math.hypot(x + 0.5 - P.x, y + 0.5 - P.y); if (d < 6) add = fl * (1 - d / 6); }
          L.cellR[i] = b * z.tint[0] + lp * 1.1 + add; L.cellG[i] = b * z.tint[1] + lp * 0.92 + add * 0.85; L.cellB[i] = b * z.tint[2] + lp * 0.65 + add * 0.5;
        }
        var VW = MW + 1;
        for (var vy = 0; vy <= MH; vy++) for (var vx = 0; vx <= MW; vx++) {
          var sr = 0, sg = 0, sb = 0, n = 0;
          for (var k = 0; k < 4; k++) {
            var cx = vx - 1 + (k & 1), cy = vy - 1 + (k >> 1);
            if (cx < 0 || cy < 0 || cx >= MW || cy >= MH) continue;
            var j = cy * MW + cx; if (L.cellR[j] < 0) continue;
            sr += L.cellR[j]; sg += L.cellG[j]; sb += L.cellB[j]; n++;
          }
          var vi = vy * VW + vx;
          if (n) { L.vR[vi] = sr / n; L.vG[vi] = sg / n; L.vB[vi] = sb / n; } else { L.vR[vi] = L.vG[vi] = L.vB[vi] = 0; }
        }
      }
      var LT = [0, 0, 0];
      function lightAt(x, y) {
        var VW = L.MW + 1, ix = Math.floor(x), iy = Math.floor(y);
        if (ix < 0 || iy < 0 || ix >= L.MW || iy >= L.MH) { LT[0] = LT[1] = LT[2] = 0; return LT; }
        var fx = x - ix, fy = y - iy, i0 = iy * VW + ix, i1 = i0 + 1, i2 = i0 + VW, i3 = i2 + 1;
        var a = (1 - fx) * (1 - fy), b = fx * (1 - fy), c = (1 - fx) * fy, d = fx * fy;
        LT[0] = L.vR[i0] * a + L.vR[i1] * b + L.vR[i2] * c + L.vR[i3] * d;
        LT[1] = L.vG[i0] * a + L.vG[i1] * b + L.vG[i2] * c + L.vG[i3] * d;
        LT[2] = L.vB[i0] * a + L.vB[i1] * b + L.vB[i2] * c + L.vB[i3] * d;
        return LT;
      }
      /* Helmlampe: Lichtkegel in der Bildmitte, nimmt mit der Entfernung ab */
      function lampDist(d) { return P.lamp ? 1.15 * Math.pow(clamp(1 - d / 10, 0, 1), 1.25) : 0.35 * clamp(1 - d / 3, 0, 1); }
      function shade(c, r, g2, b) {
        var R = (c & 255) * r, G = ((c >> 8) & 255) * g2, B = ((c >> 16) & 255) * b;
        return 0xff000000 | ((B > 255 ? 255 : B) << 16) | ((G > 255 ? 255 : G) << 8) | (R > 255 ? 255 : R);
      }

      /* ---------------------------------------------------------------- 3D-Bild */
      function render3D() {
        var dirX = Math.cos(P.a), dirY = Math.sin(P.a), K = 0.66, plX = -dirY * K, plY = dirX * K;
        var bobY = ctx.reduce ? 0 : Math.sin(P.bob * 2) * 1.3 * P.bobAmt * (W / 320);
        var dead = P.dead ? Math.min(1, P.deadT / 0.8) : 0;
        var hor = Hv / 2 + P.pitch + bobY + dead * Hv * 0.22;
        st.hor = hor;
        var MW = L.MW, MH = L.MH, VW = MW + 1, vR = L.vR, vG = L.vG, vB = L.vB, fallback = TX.flats.fels;
        var rx0 = dirX - plX, ry0 = dirY - plY, rx1 = dirX + plX, ry1 = dirY + plY;
        var coneYk = Hv * 0.55;
        /* Boden und Decke */
        for (var y = 0; y < Hv; y++) {
          var p = y + 0.5 - hor, row = y * W;
          if (Math.abs(p) < 0.6) { for (var xx = 0; xx < W; xx++) buf[row + xx] = 0xff000000; continue; }
          var isF = p > 0, rd = (0.5 * proj) / Math.abs(p);
          var stx = rd * (rx1 - rx0) / W, sty = rd * (ry1 - ry0) / W, fx = P.x + rd * rx0, fy = P.y + rd * ry0;
          var fog = 1 / (1 + rd * 0.06), ld = lampDist(rd) * (isF ? 1 : 0.8);
          var cy2 = (y - hor) / coneYk, cyy = cy2 * cy2;
          for (var x = 0; x < W; x++, fx += stx, fy += sty) {
            var ix = fx | 0, iy = fy | 0;
            if (fx < 0 || fy < 0 || ix >= MW || iy >= MH) { buf[row + x] = 0xff000000; continue; }
            var i = iy * MW + ix, tex = (isF ? L.ftex[i] : L.ctex[i]) || fallback;
            var c = tex[(((fy - iy) * 64) | 0) * 64 + (((fx - ix) * 64) | 0)];
            var ffx = fx - ix, ffy = fy - iy, v0 = iy * VW + ix, a = (1 - ffx) * (1 - ffy), b = ffx * (1 - ffy), cc = (1 - ffx) * ffy, d = ffx * ffy;
            var lr = vR[v0] * a + vR[v0 + 1] * b + vR[v0 + VW] * cc + vR[v0 + VW + 1] * d;
            var lgg = vG[v0] * a + vG[v0 + 1] * b + vG[v0 + VW] * cc + vG[v0 + VW + 1] * d;
            var lb = vB[v0] * a + vB[v0 + 1] * b + vB[v0 + VW] * cc + vB[v0 + VW + 1] * d;
            var cone = 1.25 - Math.sqrt(coneX[x] + cyy); cone = cone < 0 ? 0 : cone > 1 ? 1 : cone;
            var lamp = cone * ld;
            buf[row + x] = shade(c, lr * fog + lamp, lgg * fog + lamp * 0.95, lb * fog + lamp * 0.82);
          }
        }
        /* Wände */
        for (var x2 = 0; x2 < W; x2++) {
          var cam = 2 * x2 / W - 1, rdx = dirX + plX * cam, rdy = dirY + plY * cam;
          var mx = Math.floor(P.x), my = Math.floor(P.y);
          var ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
          var sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
          var sdx = rdx < 0 ? (P.x - mx) * ddx : (mx + 1 - P.x) * ddx, sdy = rdy < 0 ? (P.y - my) * ddy : (my + 1 - P.y) * ddy;
          var side = 0, hit = false, dist = 30, tex2 = null, u = 0, prevDoor = null, guard = 0, hx = 0, hy = 0;
          while (guard++ < 128) {
            if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
            if (mx < 0 || my < 0 || mx >= MW || my >= MH) break;
            var ci = my * MW + mx;
            if (L.solid[ci]) {
              dist = side === 0 ? sdx - ddx : sdy - ddy;
              var wx = side === 0 ? P.y + dist * rdy : P.x + dist * rdx; wx -= Math.floor(wx);
              u = wx; if ((side === 0 && rdx < 0) || (side === 1 && rdy > 0)) u = 1 - u;
              tex2 = prevDoor ? prevDoor.jamb : L.tex[ci];
              hx = P.x + rdx * (dist - 0.02); hy = P.y + rdy * (dist - 0.02);
              hit = true; break;
            }
            var dr = L.door[ci];
            if (dr) {
              var t, hh;
              if (dr.hz) { t = (my + 0.5 - P.y) / rdy; hh = P.x + rdx * t; if (t > 0 && Math.floor(hh) === mx && hh - mx >= dr.open) { dist = t; u = hh - mx - dr.open; tex2 = dr.tex; hx = hh; hy = my + 0.5 - sy * 0.02; hit = true; side = 1; break; } }
              else { t = (mx + 0.5 - P.x) / rdx; hh = P.y + rdy * t; if (t > 0 && Math.floor(hh) === my && hh - my >= dr.open) { dist = t; u = hh - my - dr.open; tex2 = dr.tex; hx = mx + 0.5 - sx * 0.02; hy = hh; hit = true; side = 0; break; } }
              prevDoor = dr;
            } else prevDoor = null;
          }
          zbuf[x2] = hit ? dist : 99;
          if (!hit) continue;
          var lh = proj / dist, top = hor - lh * 0.5, bot = hor + lh * 0.5;
          var y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(Hv, Math.ceil(bot));
          var tu = clamp((u * 64) | 0, 0, 63), Lw = lightAt(hx, hy), sd = side ? 0.82 : 1, fog2 = 1 / (1 + dist * 0.06), ld2 = lampDist(dist);
          var lr2 = Lw[0] * fog2 * sd, lg2 = Lw[1] * fog2 * sd, lb2 = Lw[2] * fog2 * sd, vstep = 64 / lh;
          for (var y2 = y0; y2 < y1; y2++) {
            var tv = ((y2 + 0.5 - top) * vstep) | 0; if (tv > 63) tv = 63; else if (tv < 0) tv = 0;
            var cyw = (y2 - hor) / coneYk, cone2 = 1.25 - Math.sqrt(coneX[x2] + cyw * cyw); cone2 = cone2 < 0 ? 0 : cone2 > 1 ? 1 : cone2;
            var lamp2 = cone2 * ld2 * sd;
            buf[y2 * W + x2] = shade(tex2[tv * 64 + tu], lr2 + lamp2, lg2 + lamp2 * 0.95, lb2 + lamp2 * 0.82);
          }
        }
        renderSprites(dirX, dirY, plX, plY, hor);
      }

      /* ---------------------------------------------------------------- Sprites */
      var drawList = [];
      function pushSpr(img2, x, y, z, h, full, flash) { drawList.push({ img: img2, x: x, y: y, z: z, h: h, full: full, flash: flash, d: 0 }); }
      function collectSprites() {
        drawList.length = 0;
        var t = st.t;
        L.decor.forEach(function (o) {
          if (o.gone) return;
          var s = SP[o.d.spr];
          if (o.k === 'i') pushSpr(s, o.x, o.y, 0, 1, false);
          else if (o.k === 'n') pushSpr(s, o.x, o.y, 0, 0.56, false);
          else if (o.k === 'o') pushSpr(s, o.x, o.y, 0, 0.6, false, o.boom > 0);
          else if (o.k === 'l') pushSpr(s, o.x, o.y, 0.5, 0.5, true);
        });
        L.items.forEach(function (it) { var s = SP[ITEMS[it.k].spr]; pushSpr(s, it.x, it.y, 0, 0.5, it.k === 'y' || it.k === 'z', false); });
        L.foes.forEach(function (f) {
          var S = SP[f.key], img2, h = f.key === 'milbe' ? 0.36 : 0.66, z = f.key === 'milbe' ? 0 : f.z - 0.1, full = false;
          if (f.dead) { img2 = S.die[2]; z = 0; h = 0.55; }
          else if (f.state === 'dying') { img2 = S.die[Math.min(1, Math.floor(f.dieT / 0.2))]; }
          else if (f.atkT > 0) { img2 = S.atk; full = f.key === 'feuer' || f.key === 'wach' || f.key === 'flinte'; }
          else img2 = S.fly[Math.floor(t * (f.key === 'milbe' ? 10 : 16) + f.phase) % 2];
          pushSpr(img2, f.x, f.y, z, h, full, f.flashT > 0 || f.painT > 0);
        });
        L.balls.forEach(function (b) { pushSpr(SP.ball[Math.floor(b.t * 12) % 2], b.x, b.y, b.z - 0.14, 0.28, true); });
        L.fx.forEach(function (e) {
          var k = e.t / e.life;
          if (e.kind === 'puff') pushSpr(SP.puff[Math.min(2, Math.floor(k * 3))], e.x, e.y, e.z - 0.06, 0.12, false);
          else if (e.kind === 'spritz') pushSpr(SP.spritz[Math.min(2, Math.floor(k * 3))], e.x, e.y, e.z - 0.08, 0.16, true);
          else if (e.kind === 'boom') pushSpr(SP.fassBoom[Math.min(2, Math.floor(k * 3))], e.x, e.y, 0, 1.2, true);
          else if (e.kind === 'boomS') pushSpr(SP.fassBoom[Math.min(2, Math.floor(k * 3))], e.x, e.y, e.z - 0.15, 0.45, true);
        });
      }
      function renderSprites(dirX, dirY, plX, plY, hor) {
        collectSprites();
        var inv = 1 / (plX * dirY - dirX * plY);
        for (var i = 0; i < drawList.length; i++) {
          var s = drawList[i], dx = s.x - P.x, dy = s.y - P.y;
          s.d = inv * (-plY * dx + plX * dy); s.tx = inv * (dirY * dx - dirX * dy);
        }
        drawList.sort(function (a, b) { return b.d - a.d; });
        for (var k = 0; k < drawList.length; k++) {
          var sp = drawList[k];
          if (sp.d < 0.12) continue;
          var im = sp.img, hpx = sp.h * proj / sp.d, wpx = hpx * im.w / im.h;
          var scx = (W / 2) * (1 + sp.tx / sp.d);
          var x0 = scx - wpx / 2, top = hor - (sp.z + sp.h - 0.5) * proj / sp.d;
          var xs = Math.max(0, Math.ceil(x0)), xe = Math.min(W, Math.ceil(x0 + wpx));
          if (xs >= xe) continue;
          var ys = Math.max(0, Math.ceil(top)), ye = Math.min(Hv, Math.ceil(top + hpx));
          if (ys >= ye) continue;
          var Ls = sp.full ? [1.15, 1.1, 1.05] : lightAt(sp.x, sp.y).slice(), fog = sp.full ? 1 : 1 / (1 + sp.d * 0.06);
          var cxn = (scx - W / 2) / (W * 0.42), cyn = (top + hpx / 2 - hor) / (Hv * 0.55), cone = clamp(1.25 - Math.sqrt(cxn * cxn + cyn * cyn), 0, 1);
          var lamp = sp.full ? 0 : cone * lampDist(sp.d), fla = sp.flash ? 0.9 : 0;
          var lr = Ls[0] * fog + lamp + fla, lgg = Ls[1] * fog + lamp * 0.95 + fla, lb = Ls[2] * fog + lamp * 0.82 + fla;
          var us = im.w / wpx, vs = im.h / hpx;
          for (var x = xs; x < xe; x++) {
            if (sp.d >= zbuf[x]) continue;
            var u = ((x + 0.5 - x0) * us) | 0; if (u >= im.w) u = im.w - 1;
            for (var y = ys; y < ye; y++) {
              var v = ((y + 0.5 - top) * vs) | 0; if (v >= im.h) v = im.h - 1;
              var c = im.px[v * im.w + u];
              if ((c >>> 24) < 128) continue;
              buf[y * W + x] = shade(c, lr, lgg, lb);
            }
          }
        }
      }

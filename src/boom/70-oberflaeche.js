
      /* ---------------------------------------------------------------- Bild zusammensetzen */
      function drawPlay() {
        updateLight();
        render3D();
        lg.putImageData(img, 0, 0);
        /* Fadenkreuz und Waffe auf den kleinen Puffer (Pixel-Look) */
        if (!P.dead) {
          var bx = ctx.reduce ? 0 : Math.cos(P.bob) * 6 * P.bobAmt, by = ctx.reduce ? 0 : Math.abs(Math.sin(P.bob)) * 5 * P.bobAmt + P.kick * 6;
          drawWeapon(lg, W, Hv, P.wp, { anim: P.anim, flash: P.flash > 0, bobX: bx, bobY: by, lower: P.lower, rage: P.rageT > 0, reload: P.reload || 0 });
          lg.fillStyle = 'rgba(255,255,255,0.75)';
          var cx = Math.round(W / 2), cy = Math.round(Hv / 2);
          lg.fillRect(cx - 3, cy, 2, 1); lg.fillRect(cx + 2, cy, 2, 1); lg.fillRect(cx, cy - 3, 1, 2); lg.fillRect(cx, cy + 2, 1, 2);
        }
        var vh = cssH - hudH;
        g.imageSmoothingEnabled = false;
        g.drawImage(lc, 0, 0, cssW, vh);
        /* Farbschleier: Schaden rot, Aufheben gelb, Berserker rot, Tod */
        if (P.hurtT > 0) { g.fillStyle = 'rgba(200,20,10,' + Math.min(0.55, P.hurtT * 0.5) + ')'; g.fillRect(0, 0, cssW, vh); }
        if (P.pickT > 0) { g.fillStyle = 'rgba(253,197,6,' + P.pickT * 0.6 + ')'; g.fillRect(0, 0, cssW, vh); }
        if (P.rageT > 0) { g.fillStyle = 'rgba(229,50,45,' + Math.min(0.22, P.rageT * 0.03) + ')'; g.fillRect(0, 0, cssW, vh); }
        if (P.hp < 25 && !P.dead) { var pulse = 0.18 + Math.sin(st.t * 6) * 0.08; var vg = g.createRadialGradient(cssW / 2, vh / 2, vh * 0.3, cssW / 2, vh / 2, cssW * 0.7); vg.addColorStop(0, 'rgba(120,0,0,0)'); vg.addColorStop(1, 'rgba(160,0,0,' + pulse + ')'); g.fillStyle = vg; g.fillRect(0, 0, cssW, vh); }
        if (P.dead) { g.fillStyle = 'rgba(120,0,0,' + Math.min(0.6, P.deadT * 0.4) + ')'; g.fillRect(0, 0, cssW, vh); }
        drawHud();
        /* Meldungen oben links (Pixel-Schrift wie früher) */
        var s = Math.max(2, Math.round(cssW / 400));
        var maxC = Math.max(12, Math.floor((cssW - 20) / (4 * s))), line = 0;
        st.msg.forEach(function (m) {
          g.globalAlpha = clamp(3 - m.t, 0, 1);
          var words = String(m.text).split(' '), rows = [], cur = '';
          words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (t.length > maxC && cur) { rows.push(cur); cur = w; } else cur = t; });
          rows.push(cur);
          rows.forEach(function (r) { pixText(g, r, 10 + s, 10 + line * 8 * s + s, s, 'rgba(0,0,0,0.7)'); pixText(g, r, 10, 10 + line * 8 * s, s, m.c); line++; });
        });
        g.globalAlpha = 1;
        if (touchMode && cssH > cssW && st.t < 7 && !P.dead) {
          g.font = '800 14px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = 'rgba(0,0,0,0.6)'; art.rrect(g, cssW / 2 - 120, vh * 0.16, 240, 30, 15); g.fill();
          g.fillStyle = '#FDC506'; g.fillText('Tipp: Handy quer halten! ↻', cssW / 2, vh * 0.16 + 15);
        }
        if (touchMode && !P.dead) drawTouch();
        else if (!locked && !P.dead && st.phase === 'play' && st.t < 600) {
          var hint = 'Klick ins Bild: Maus fangen';
          g.font = '700 ' + Math.round(clamp(cssW / 50, 11, 15)) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          var tw = g.measureText(hint).width + 24;
          g.fillStyle = 'rgba(0,0,0,0.6)'; art.rrect(g, cssW / 2 - tw / 2, vh - 44, tw, 28, 14); g.fill();
          g.fillStyle = '#FDC506'; g.fillText(hint, cssW / 2, vh - 30);
        }
        if (P.dead) drawDeadText();
      }

      /* ---------------------------------------------------------------- Statusleiste */
      function panel(x, y, w, h) {
        var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#3A3F46'); gr.addColorStop(1, '#22262B');
        g.fillStyle = gr; g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x, y, w, 1); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x + w - 1, y, 1, h);
      }
      function drawHud() {
        var y = cssH - hudH, h = hudH;
        g.fillStyle = '#141619'; g.fillRect(0, y, cssW, h);
        g.fillStyle = '#FDC506'; g.fillRect(0, y, cssW, 2);
        var narrow = cssW < 560;
        var cols = narrow ? [['muni', 0.22], ['leben', 0.24], ['face', 0.2], ['panzer', 0.22], ['marken', 0.12]] : [['muni', 0.15], ['leben', 0.15], ['waffen', 0.12], ['face', 0.12], ['panzer', 0.15], ['marken', 0.08], ['vorrat', 0.23]];
        var x = 0, big = Math.max(2, Math.floor(h * 0.48 / 5)), sm = Math.max(1, Math.floor(h * 0.16 / 5));
        st.hudWeapons = null;
        cols.forEach(function (c) {
          var w = cssW * c[1], cx = x + w / 2, k = c[0];
          panel(x + 2, y + 4, w - 4, h - 7);
          var labY = y + h - 6 - 5 * sm, numY = y + 8 + (h - 18 - 5 * sm - 5 * big) / 2;
          if (k === 'muni') {
            var am = WEAPONS[P.wp].ammo ? P.ammo[WEAPONS[P.wp].ammo] : '∞';
            if (am === '∞') pixText(g, '--', cx, numY, big, '#E5322D', 'center'); else pixText(g, am, cx, numY, big, '#E5322D', 'center');
            pixText(g, 'MUNI', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'leben') {
            pixText(g, Math.max(0, Math.ceil(P.hp)) + '%', cx, numY, big, P.hp < 25 && Math.floor(st.t * 4) % 2 ? '#FFFFFF' : '#E5322D', 'center');
            pixText(g, 'LEBEN', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'panzer') {
            pixText(g, Math.ceil(P.ar) + '%', cx, numY, big, '#E5322D', 'center');
            pixText(g, 'PANZER', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'waffen') {
            var s2 = Math.max(2, Math.floor(h * 0.26 / 5));
            [1, 2, 3].forEach(function (n, i) { pixText(g, n, x + w * (0.25 + i * 0.25), numY + 2, s2, P.has[n - 1] ? (P.wp === n - 1 ? '#FDC506' : '#F2F2F2') : '#4A4E54', 'center'); });
            pixText(g, 'WAFFEN', cx, labY, sm, '#C9CED6', 'center');
            st.hudWeapons = { x: x, y: y, w: w, h: h };
          } else if (k === 'face') {
            g.fillStyle = '#0D0E10'; g.fillRect(x + 6, y + 7, w - 12, h - 13);
            var hurt = P.hp > 80 ? 0 : P.hp > 60 ? 1 : P.hp > 40 ? 2 : P.hp > 20 ? 3 : 4;
            drawFace(g, cx, y + h * 0.56, Math.min((w - 14) / 42, (h - 10) / 46), { look: P.painFace > 0 ? clamp(P.hurtDir * 1.5, -1, 1) : P.look, hurt: hurt, pain: P.painFace > 0, ouch: P.ouch, grin: P.grin > 0, rage: P.rageT > 0 && P.painFace <= 0 && P.grin <= 0, dead: P.dead, smirk: P.smirk > 0 });
            if (narrow) st.hudWeapons = { x: x, y: y, w: w, h: h };
          } else if (k === 'marken') {
            var r = Math.min(w * 0.22, h * 0.17);
            g.beginPath(); g.arc(cx, y + h * 0.42, r, 0, TAU); g.fillStyle = P.keys.red ? '#E5322D' : '#2A2E33'; g.fill(); g.lineWidth = 2; g.strokeStyle = P.keys.red ? '#FFD7D2' : '#4A4E54'; g.stroke();
            pixText(g, 'MARKE', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'vorrat') {
            var s3 = Math.max(1, Math.floor(h * 0.15 / 5)), ly = y + 12;
            [['STACHEL', 'sta'], ['POLLEN', 'pol']].forEach(function (row, i) {
              var yy = ly + i * (h * 0.3);
              pixText(g, row[0], x + 10, yy, s3, '#C9CED6');
              pixText(g, P.ammo[row[1]] + '/' + MAXAMMO[row[1]], x + w - 10, yy, s3, '#FDC506', 'right');
            });
          }
          x += w;
        });
      }

      /* ---------------------------------------------------------------- Touch-Steuerung */
      var joy = null, look = null, btn = { fire: null, use: null, swap: null };
      function touchLayout() {
        var vh = cssH - hudH, r = clamp(Math.min(cssW, vh) * 0.11, 30, 56);
        var right = set.joyLeft;
        btn.fire = { x: right ? cssW - r * 1.5 : r * 1.5, y: vh - r * 1.4, r: r };
        btn.use = { x: right ? cssW - r * 3.4 : r * 3.4, y: vh - r * 0.9, r: r * 0.62 };
        btn.swap = { x: right ? cssW - r * 1.5 : r * 1.5, y: vh - r * 3.6, r: r * 0.55 };
      }
      function drawTouch() {
        touchLayout();
        [['fire', '#E5322D'], ['use', '#3A3F46'], ['swap', '#3A3F46']].forEach(function (b) {
          var o = btn[b[0]];
          g.globalAlpha = held.touchFire && b[0] === 'fire' ? 0.9 : 0.55;
          g.beginPath(); g.arc(o.x, o.y, o.r, 0, TAU); g.fillStyle = b[1]; g.fill(); g.lineWidth = 3; g.strokeStyle = '#FDC506'; g.stroke();
          g.globalAlpha = 1;
          g.fillStyle = '#FFF'; g.font = '800 ' + Math.round(o.r * (b[0] === 'fire' ? 0.42 : 0.5)) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(b[0] === 'fire' ? 'FEUER' : b[0] === 'use' ? '✋' : '⇄', o.x, o.y + 1);
        });
        if (joy) {
          g.globalAlpha = 0.5; g.beginPath(); g.arc(joy.cx, joy.cy, joy.r, 0, TAU); g.lineWidth = 3; g.strokeStyle = '#FDC506'; g.stroke();
          g.beginPath(); g.arc(joy.cx + joy.dx * joy.r, joy.cy + joy.dy * joy.r, joy.r * 0.45, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); g.globalAlpha = 1;
        } else if (st.t < 8) {
          var vh = cssH - hudH; g.globalAlpha = 0.6; g.fillStyle = '#FFF'; g.font = '700 13px Poppins, sans-serif'; g.textAlign = 'center';
          g.fillText('Daumen hier: laufen', set.joyLeft ? cssW * 0.22 : cssW * 0.78, vh * 0.72); g.fillText('Wischen: umsehen', cssW * 0.5, vh * 0.3); g.globalAlpha = 1;
        }
      }

      /* ---------------------------------------------------------------- Titel, Menüs, Auswertung (gestochen scharf auf der großen Leinwand) */
      var FW = 120, FH = 70, fireBuf = new Uint8Array(FW * FH), fc = document.createElement('canvas'), fg = fc.getContext('2d'), fimg = null, PAL = [];
      fc.width = FW; fc.height = FH;
      (function () { for (var i = 0; i < 37; i++) { var t = i / 36; PAL.push(rgb(Math.round(clamp(t * 3, 0, 1) * 255), Math.round(clamp(t * 3 - 1, 0, 1) * 220), Math.round(clamp(t * 3 - 2, 0, 1) * 160))); } PAL[0] = rgb(8, 6, 6); })();
      function fireStep() {
        if (!fimg) fimg = fg.createImageData(FW, FH);
        for (var x = 0; x < FW; x++) fireBuf[(FH - 1) * FW + x] = 36;
        for (var x2 = 0; x2 < FW; x2++) for (var y = 1; y < FH; y++) {
          var src = y * FW + x2, p = fireBuf[src];
          if (!p) { fireBuf[src - FW] = 0; continue; }
          var r = (Math.random() * 3.3) | 0, dst = src - r + 1;
          fireBuf[Math.max(0, dst - FW)] = Math.max(0, p - (r & 1) - (Math.random() < 0.38 ? 1 : 0));
        }
        var b32 = new Uint32Array(fimg.data.buffer);
        for (var i = 0; i < FW * FH; i++) b32[i] = PAL[fireBuf[i]];
        fg.putImageData(fimg, 0, 0);
      }
      function logo(cx, cy, size) {
        g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(size) + 'px Poppins, sans-serif';
        g.lineJoin = 'round';
        var gr = g.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
        gr.addColorStop(0, '#FFF3A0'); gr.addColorStop(0.35, '#FDC506'); gr.addColorStop(0.7, '#FF7A1A'); gr.addColorStop(1, '#B3261E');
        g.save(); g.translate(cx, cy); g.scale(1.12, 1); g.transform(1, 0, -0.12, 1, 0, 0);
        g.lineWidth = size * 0.16; g.strokeStyle = '#120806'; g.strokeText('BOOM', 0, 0);
        g.lineWidth = size * 0.06; g.strokeStyle = '#5A1A08'; g.strokeText('BOOM', 0, 0);
        g.fillStyle = gr; g.fillText('BOOM', 0, 0);
        g.globalAlpha = 0.45; g.fillStyle = '#FFFFFF'; g.fillRect(-size * 1.4, -size * 0.36, size * 2.8, size * 0.05); g.globalAlpha = 1;
        g.restore();
        g.font = '900 ' + Math.round(size * 0.34) + 'px Poppins, sans-serif';
        g.lineWidth = size * 0.06; g.strokeStyle = '#120806'; g.strokeText('2026', cx + size * 1.2, cy + size * 0.5);
        g.fillStyle = '#E5322D'; g.fillText('2026', cx + size * 1.2, cy + size * 0.5);
        g.restore();
      }
      function menuItems() {
        var m = st.menu;
        if (m === 'main') return [{ t: 'Neues Spiel', go: function () { st.menu = 'diff'; st.sel = 1; } }, { t: 'Level-Code eingeben', go: function () { st.menu = 'code'; st.sel = 0; st.codeMsg = ''; showCodeInput(true); } }, { t: 'Steuerung', go: function () { st.menu = 'controls'; st.sel = 0; } }, { t: 'Einstellungen', go: function () { st.menu = 'settings'; st.sel = 0; } }, { t: 'Mitwirkende', go: function () { st.menu = 'credits'; st.sel = 0; } }];
        if (m === 'diff') {
          var l = DIFFS.map(function (d, i) { return { t: d.name, sub: d.sub, go: function () { startGame(i); } }; });
          if (!unlocked.malocher) l.pop();
          l.push({ t: 'Zurück', go: back });
          return l;
        }
        if (m === 'settings') return [
          { t: 'Maus-Empfindlichkeit: ' + set.sens.toFixed(1).replace('.', ','), adj: function (d) { set.sens = clamp(Math.round((set.sens + d * 0.1) * 10) / 10, 0.3, 3); } },
          { t: 'Maus umkehren: ' + (set.invert ? 'An' : 'Aus'), go: function () { set.invert = !set.invert; }, adj: function () { set.invert = !set.invert; } },
          { t: 'Musik: ' + bar(set.music), adj: function (d) { set.music = clamp(Math.round((set.music + d * 0.1) * 10) / 10, 0, 1); au.settings(); } },
          { t: 'Effekte: ' + bar(set.sfx), adj: function (d) { set.sfx = clamp(Math.round((set.sfx + d * 0.1) * 10) / 10, 0, 1); au.settings(); } },
          { t: 'Handy-Knöpfe: ' + (set.joyLeft ? 'Stick links' : 'Stick rechts'), go: function () { set.joyLeft = !set.joyLeft; }, adj: function () { set.joyLeft = !set.joyLeft; } },
          { t: 'Zurück', go: back }
        ];
        if (m === 'code') return [{ t: 'Code prüfen', go: checkCode }, { t: 'Zurück', go: function () { showCodeInput(false); back(); } }];
        return [{ t: 'Zurück', go: back }];
      }
      function bar(v) { var n = Math.round(v * 10), s = ''; for (var i = 0; i < 10; i++) s += i < n ? '▮' : '▯'; return s; }
      function back() { showCodeInput(false); st.menu = 'main'; st.sel = 0; au.menu(); }
      var PAGES = {
        controls: [['PC', 'W A S D laufen · Maus umsehen und zielen (ins Bild klicken)', 'Klick oder Strg schießen · E oder Leertaste benutzen', '1 2 3, Q oder Mausrad: Waffe wechseln · Shift: langsam', 'Ohne Maus: Pfeiltasten drehen · Esc: Pause'], ['Handy (quer halten!)', 'Linker Daumen: Stick zum Laufen', 'Rechts wischen: umsehen (nach oben/unten zielt das Spiel selbst)', 'FEUER halten: schießen · ✋ benutzen · ⇄ Waffe wechseln'], ['Tipp', 'Verdächtige Wände mit Riss? Benutzen! Dahinter liegen Geheimnisse.']],
        credits: [['BOOM 2026', 'Eine MediaBees-Produktion. Glück auf!'], ['Crew', 'Sprücheklopfer · Die Maschine · Allesmacher', 'und der Rest vom Bienenstock'], ['Sound', 'Alle Riffs selbst gebaut, live im Browser erzeugt'], ['Danke', 'an alle Kumpel, die sich in die Zeche trauen']]
      };
      function drawMenu() {
        fireStep();
        g.fillStyle = '#080606'; g.fillRect(0, 0, cssW, cssH);
        g.imageSmoothingEnabled = false;
        g.globalAlpha = 0.85; g.drawImage(fc, 0, cssH * 0.45, cssW, cssH * 0.55); g.globalAlpha = 1;
        var vg = g.createLinearGradient(0, 0, 0, cssH); vg.addColorStop(0, 'rgba(8,6,6,1)'); vg.addColorStop(0.45, 'rgba(8,6,6,0.6)'); vg.addColorStop(1, 'rgba(8,6,6,0)'); g.fillStyle = vg; g.fillRect(0, 0, cssW, cssH);
        var small = cssH < 420, ls = Math.min(cssW / 6.2, cssH * (small ? 0.16 : 0.2));
        logo(cssW / 2 - ls * 0.15, cssH * (small ? 0.14 : 0.17), ls);
        var m = st.menu, items = menuItems(), u = clamp(cssH / 560, 0.62, 1.15), y0 = cssH * (small ? 0.31 : 0.36);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        if (PAGES[m]) {
          var y = y0;
          PAGES[m].forEach(function (sec) {
            g.font = '900 ' + Math.round(16 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#FDC506'; g.fillText(sec[0].toUpperCase(), cssW / 2, y); y += 22 * u;
            g.font = '600 ' + Math.round(13.5 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0';
            sec.slice(1).forEach(function (line) { g.fillText(line, cssW / 2, y, cssW - 30); y += 19 * u; });
            y += 10 * u;
          });
          y0 = Math.max(y, cssH * 0.82);
        }
        if (m === 'code') {
          g.font = '700 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0';
          g.fillText('Code von der Auswertung eintippen, z. B. KOHLE-ABCDE-FGHJK', cssW / 2, y0, cssW - 30);
          if (st.codeMsg) { g.fillStyle = st.codeOk ? '#7CFF8A' : '#FF7A6B'; g.font = '800 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; wrap(st.codeMsg, cssW / 2, y0 + 92 * u, cssW - 40, 19 * u); }
          y0 += 130 * u;
        }
        st.hits = [];
        var ih = 40 * u;
        var yy = y0;
        items.forEach(function (it, i) {
          var y = yy, on = i === st.sel;
          yy += it.sub ? ih * 1.25 : ih;
          g.font = (on ? '900 ' : '800 ') + Math.round((m === 'main' || m === 'diff' ? 22 : 17) * u) + 'px Poppins, sans-serif';
          var tw = g.measureText(it.t).width;
          if (on) {
            g.fillStyle = 'rgba(253,197,6,0.14)'; art.rrect(g, cssW / 2 - tw / 2 - 40, y - ih * 0.42, tw + 80, ih * (it.sub ? 1.1 : 0.84), 10); g.fill();
            drawFace(g, cssW / 2 - tw / 2 - 22, y + 1, 0.42 * u, { look: Math.sin(st.titleT * 2), hurt: 0, smirk: true });
          }
          g.lineWidth = 5; g.strokeStyle = '#120806'; g.strokeText(it.t, cssW / 2, y);
          g.fillStyle = on ? '#FDC506' : '#E9DFC8'; g.fillText(it.t, cssW / 2, y);
          if (it.sub) { g.font = '600 ' + Math.round(12 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(242,233,208,0.7)'; g.fillText(it.sub, cssW / 2, y + 18 * u); }
          if (it.adj && on) { g.fillStyle = '#FDC506'; g.font = '900 ' + Math.round(18 * u) + 'px Poppins, sans-serif'; g.fillText('◀', cssW / 2 - tw / 2 - 26, y); g.fillText('▶', cssW / 2 + tw / 2 + 26, y); }
          st.hits.push({ x: cssW / 2 - Math.max(tw, 160) / 2 - 40, y: y - ih * 0.45, w: Math.max(tw, 160) + 80, h: ih * (it.sub ? 1.15 : 0.9), i: i, tw: tw, cy: y });
        });
        if (m === 'main') { g.font = '600 ' + Math.round(11.5 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(242,233,208,0.55)'; g.fillText(ctx.touch() ? 'Antippen zum Auswählen · Handy quer halten' : 'Pfeiltasten + Enter oder Maus · Ton an für die volle Dröhnung', cssW / 2, cssH - 16); }
      }
      function wrap(text, x, y, maxW, lh) {
        var words = text.split(' '), line = '', lines = [];
        words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
        lines.push(line);
        lines.forEach(function (l, i) { g.fillText(l, x, y + i * lh); });
      }

      /* ---------------------------------------------------------------- Code-Eingabe (echtes Eingabefeld, damit das Handy eine Tastatur zeigt) */
      var codeInput = document.createElement('input');
      codeInput.type = 'text'; codeInput.maxLength = 24; codeInput.autocomplete = 'off'; codeInput.spellcheck = false;
      codeInput.setAttribute('aria-label', 'Level-Code');
      codeInput.placeholder = 'KOHLE-ABCDE-FGHJK';
      codeInput.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);width:min(340px,80%);padding:10px 14px;border-radius:10px;border:3px solid #FDC506;background:#120806;color:#FDC506;font:800 18px Poppins,monospace;text-align:center;letter-spacing:2px;text-transform:uppercase;z-index:5;display:none';
      ctx.stage.appendChild(codeInput);
      codeInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkCode(); } else if (e.key === 'Escape') { showCodeInput(false); back(); } e.stopPropagation(); });
      function showCodeInput(on) {
        codeInput.style.display = on ? 'block' : 'none';
        if (on) { var u = clamp(cssH / 560, 0.62, 1.15); codeInput.style.top = Math.round(cssH * (cssH < 420 ? 0.31 : 0.36) + 22 * u) + 'px'; codeInput.value = ''; setTimeout(function () { try { codeInput.focus({ preventScroll: true }); } catch (e) {} }, 30); }
      }
      function checkCode() {
        var d = readCode(codeInput.value);
        if (!d) { st.codeOk = false; st.codeMsg = 'Der Code stimmt nicht. Genau abschreiben: Die Buchstaben I und O und die Ziffern 0 und 1 kommen darin nicht vor.'; au.locked(); return; }
        st.codeOk = true;
        if (d.unlock && !unlocked.malocher) { unlocked.malocher = true; st.codeMsg = 'Code gilt! „Malocher!“ ist freigeschaltet (Neues Spiel). '; }
        else st.codeMsg = 'Code gilt! ';
        if (d.level > LEVELS.length) st.codeMsg += 'Sohle ' + d.level + ' wird gerade noch gegraben, kommt bald. Heb dir den Code auf!';
        au.select();
      }

      /* ---------------------------------------------------------------- Auswertung */
      function finishLevel() {
        st.phase = 'tally'; st.tallyT = 0;
        releaseMouse();
        var t = L.time, par = L.lv.par;
        var bonus = { level: 3000, time: Math.max(0, Math.round((par - t) * 10)), kills: L.kills >= L.killsTotal ? 2000 : 0, secrets: L.secrets >= L.secretsTotal ? 2000 : 0, nodmg: P.dmgTaken === 0 ? 3000 : 0 };
        st.bonus = bonus;
        addScore(bonus.level + bonus.time + bonus.kills + bonus.secrets + bonus.nodmg);
        st.code = makeCode({ level: L.n + 2, diff: st.diff, weapons: 1 | (P.has[2] ? 2 : 0), hp: Math.max(1, Math.round(P.hp)), ar: Math.round(P.ar), sta: P.ammo.sta, pol: P.ammo.pol, unlock: st.diff >= 2 });
        au.music('win');
        quip('SOHLE GESCHAFFT!', '#FDC506');
      }
      function drawTally() {
        fireStep();
        g.fillStyle = '#0A0808'; g.fillRect(0, 0, cssW, cssH);
        g.imageSmoothingEnabled = false; g.globalAlpha = 0.5; g.drawImage(fc, 0, cssH * 0.6, cssW, cssH * 0.4); g.globalAlpha = 1;
        var u = clamp(cssH / 560, 0.62, 1.15), t = st.tallyT, y = cssH * 0.1;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(30 * u) + 'px Poppins, sans-serif'; g.lineWidth = 6; g.strokeStyle = '#120806'; g.strokeText(L.lv.name.toUpperCase(), cssW / 2, y, cssW - 20); g.fillStyle = '#FDC506'; g.fillText(L.lv.name.toUpperCase(), cssW / 2, y, cssW - 20);
        g.font = '700 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0'; g.fillText('Geschafft auf „' + DIFFS[st.diff].name + '“', cssW / 2, y + 30 * u);
        var pct = function (a, b) { return b ? Math.round(a / b * 100) : 100; };
        var rows = [['Wespen', pct(L.kills, L.killsTotal) + '%'], ['Gegenstände', pct(L.itemsGot, L.itemsTotal) + '%'], ['Geheimnisse', pct(L.secrets, L.secretsTotal) + '%'], ['Zeit', fmtT(L.time)], ['Vorgabe', fmtT(L.lv.par)]];
        var s = Math.max(2, Math.round(3 * u)), ry = y + 64 * u;
        rows.forEach(function (r, i) {
          if (t < 0.4 + i * 0.35) return;
          pixText(g, r[0], cssW / 2 - 12, ry + i * 9 * s, s, '#E9DFC8', 'right');
          pixText(g, r[1], cssW / 2 + 12, ry + i * 9 * s, s, '#E5322D');
        });
        var by = ry + rows.length * 9 * s + 14 * u;
        if (t > 2.3) {
          var b = st.bonus, parts = [];
          if (b.time) parts.push('Tempo +' + b.time); if (b.kills) parts.push('Alle Wespen +2000'); if (b.secrets) parts.push('Alle Geheimnisse +2000'); if (b.nodmg) parts.push('Ohne Kratzer +3000');
          g.font = '700 ' + Math.round(13 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#7CFF8A'; g.fillText(parts.join(' · ') || 'Sohle geschafft +3000', cssW / 2, by, cssW - 20);
          g.font = '900 ' + Math.round(26 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#FDC506'; g.fillText(Math.round(st.score * DIFFS[st.diff].mult).toLocaleString('de-DE') + ' Punkte', cssW / 2, by + 34 * u);
        }
        if (t > 2.9) {
          g.font = '700 ' + Math.round(12.5 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0'; g.fillText('Dein Code für Sohle 2 (kommt bald):', cssW / 2, by + 70 * u);
          g.font = '900 ' + Math.round(22 * u) + 'px Poppins, monospace'; g.fillStyle = '#FFFFFF'; g.fillText(st.code, cssW / 2, by + 96 * u);
          g.font = '800 ' + Math.round(15 * u) + 'px Poppins, sans-serif'; g.fillStyle = Math.floor(st.t * 3) % 2 ? '#FDC506' : '#E9DFC8';
          g.fillText(ctx.touch() ? 'Antippen: weiter zur Rangliste' : 'Enter oder Klick: weiter zur Rangliste', cssW / 2, cssH - 24 * u);
        }
      }
      function fmtT(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
      function drawDeadText() {
        var vh = cssH - hudH, u = clamp(cssH / 560, 0.62, 1.15);
        if (P.deadT < 0.6) return;
        g.globalAlpha = Math.min(1, (P.deadT - 0.6) * 2);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(40 * u) + 'px Poppins, sans-serif'; g.lineWidth = 8; g.strokeStyle = '#120806';
        g.strokeText(st.deadLine, cssW / 2, vh * 0.4, cssW - 30); g.fillStyle = '#FDC506'; g.fillText(st.deadLine, cssW / 2, vh * 0.4, cssW - 30);
        g.font = '700 ' + Math.round(15 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0';
        g.fillText('Die Wespen feiern. Noch eine Schicht?', cssW / 2, vh * 0.4 + 40 * u, cssW - 30);
        g.globalAlpha = 1;
      }

      function endRound() {
        if (st.ended) return;
        st.ended = true;
        var won = st.phase === 'tally';
        stopLoop();
        ctx.finish(Math.round(st.score * DIFFS[st.diff].mult), { won: won, diff: st.diff, kills: L.kills, killsTotal: L.killsTotal, secrets: L.secrets, secretsTotal: L.secretsTotal, time: L.time, code: won ? st.code : '' });
      }

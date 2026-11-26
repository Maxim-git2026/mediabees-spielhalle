
      /* ---------------------------------------------------------------- Spiel starten: erst das Intro, dann die Sohle */
      function startGame(diff) {
        st.diff = diff; st.phase = 'intro'; st.introT = 0; st.introDone = -1;
        showCodeInput(false);
        au.select(); au.music('level'); au.setIntensity(0);
      }
      function introTotal() { return STORY.reduce(function (a, p) { return a + p.t.length + INTRO_PAUSE; }, 0); }
      var INTRO_RATE = 38, INTRO_PAUSE = 26;
      function introSkipOrGo() {
        if (st.introT * INTRO_RATE < introTotal()) { st.introT = introTotal() / INTRO_RATE + 0.01; au.menu(); }
        else beginLevel(st.diff);
      }
      function beginLevel(diff) {
        st.diff = diff; st.score = 0; st.ended = false; st.msg = []; st.t = 0; st.lockMsgT = 0; st.killWin = 0; st.killWinT = 0; st.lightFlash = 0; st.exitT = 0;
        ctx.setScore(0);
        loadLevel(0);
        showCodeInput(false);
        st.phase = 'play';
        au.select(); au.music('level');
        ctx.fx.banner(LEVELS[0].name.toUpperCase(), '#FDC506');
        msg('Glück auf, Kumpel! Finde den Förderkorb nach oben.', '#FDC506');
        lockMouse();
      }
      function lockMouse() {
        if (touchMode || !cv.requestPointerLock || locked) return;
        try { var pr = cv.requestPointerLock(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
      }
      function releaseMouse() {
        held.mouse = false;
        if (document.pointerLockElement === cv) { selfUnlock = true; try { document.exitPointerLock(); } catch (e) {} }
      }
      function onLockChange() {
        locked = document.pointerLockElement === cv;
        if (!locked) {
          held.mouse = false;
          /* Esc gibt die Maus frei (der Browser schluckt dabei die Taste) → eigenes Pausenmenü */
          if (!selfUnlock && st.on && !st.paused && st.phase === 'play') openPause();
          selfUnlock = false;
        }
      }
      document.addEventListener('pointerlockchange', onLockChange);

      /* ---------------------------------------------------------------- Schleife */
      function update(dt) {
        st.titleT += dt;
        au.update();
        if (st.phase === 'play' && !st.menuOpen) updatePlay(dt);
        else if (st.phase === 'dead') { P.deadT += dt; updatePlay(dt); if (P.deadT > 3.4) endRound(); }
        else if (st.phase === 'tally') { st.tallyT += dt; st.t += dt; }
        else if (st.phase === 'intro') {
          var before = Math.floor(st.introT * INTRO_RATE);
          st.introT += dt; st.t += dt;
          var now = Math.floor(st.introT * INTRO_RATE);
          if (now > before && now < introTotal() && now % 2 === 0) au.type();
          /* Geräusche, wenn ein Absatz fertig erscheint */
          var acc = 0;
          for (var i = 0; i < STORY.length; i++) {
            acc += STORY[i].t.length;
            if (before < acc && now >= acc && STORY[i].sfx) { if (STORY[i].sfx === 'buzz') au.buzz('wespe', 0, 1); else au.weapon(); }
            acc += INTRO_PAUSE;
          }
        }
      }
      function draw() {
        if (!cssW) return;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (st.phase === 'play' || st.phase === 'dead') { drawPlay(); if (st.menuOpen) drawPauseOverlay(); }
        else if (st.phase === 'tally') drawTally();
        else if (st.phase === 'intro') drawIntro();
        else drawMenu();
      }
      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.05, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        draw();
        raf = requestAnimationFrame(frame);
      }
      function stopLoop() { st.on = false; cancelAnimationFrame(raf); held = {}; joy = null; look = null; releaseMouse(); au.stop(); }

      /* ---------------------------------------------------------------- Eingabe */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function activate(i, dir) {
        var items = menuItems(), it = items[i];
        if (!it) return;
        st.sel = i;
        if (it.adj && dir) { it.adj(dir); au.menu(); return; }
        if (it.go) { au.select(); it.go(); }
        else if (it.adj) { it.adj(1); au.menu(); }
      }
      var touches = {};
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        e.preventDefault();
        if (e.pointerType === 'touch' || e.pointerType === 'pen') touchMode = true; else if (e.pointerType === 'mouse' && !ctx.touch()) touchMode = false;
        var p = local(e);
        if (st.phase === 'title' || st.menuOpen) {
          var hit = (st.hits || []).filter(function (h) { return p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h; })[0];
          if (hit) { var items = menuItems(), it = items[hit.i]; activate(hit.i, it && it.adj ? (p.x < hit.x + hit.w / 2 ? -1 : 1) : 0); }
          return;
        }
        if (st.phase === 'intro') { introSkipOrGo(); return; }
        if (st.phase === 'tally') { if (st.tallyT > 2.9) endRound(); else st.tallyT = 3; return; }
        if (st.phase === 'dead') { if (P.deadT > 1.2) endRound(); return; }
        if (touchMode) {
          touchLayout();
          try { cv.setPointerCapture(e.pointerId); } catch (err) {}
          var vh = cssH - hudH;
          if (Math.hypot(p.x - btn.pause.x, p.y - btn.pause.y) < btn.pause.r * 1.5) { touches[e.pointerId] = 'tap'; openPause(); return; }
          if (Math.hypot(p.x - btn.fire.x, p.y - btn.fire.y) < btn.fire.r * 1.3) { touches[e.pointerId] = 'fire'; held.touchFire = true; return; }
          if (Math.hypot(p.x - btn.use.x, p.y - btn.use.y) < btn.use.r * 1.35) { touches[e.pointerId] = 'tap'; useAction(); return; }
          if (Math.hypot(p.x - btn.swap.x, p.y - btn.swap.y) < btn.swap.r * 1.35) { touches[e.pointerId] = 'tap'; cycleWeapon(1); return; }
          if (p.y > vh) { touches[e.pointerId] = 'tap'; var hw = st.hudWeapons; if (hw && p.x >= hw.x && p.x <= hw.x + hw.w) cycleWeapon(1); return; }
          var joySide = set.joyLeft ? p.x < cssW * 0.45 : p.x > cssW * 0.55;
          if (joySide && !joy) { var r = clamp(Math.min(cssW, vh) * 0.13, 36, 70); joy = { id: e.pointerId, cx: p.x, cy: p.y, r: r, dx: 0, dy: 0 }; touches[e.pointerId] = 'joy'; return; }
          look = { id: e.pointerId, x: p.x, y: p.y }; touches[e.pointerId] = 'look';
          return;
        }
        if (!locked) { lockMouse(); return; }
        if (e.button === 0) held.mouse = true;
        else if (e.button === 2) useAction();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!st.on) return;
        if ((st.phase === 'title' || st.menuOpen) && e.pointerType === 'mouse') {
          var p0 = local(e), h = (st.hits || []).filter(function (h2) { return p0.x >= h2.x && p0.x <= h2.x + h2.w && p0.y >= h2.y && p0.y <= h2.y + h2.h; })[0];
          if (h && h.i !== st.sel) { st.sel = h.i; au.menu(); }
          cv.style.cursor = h ? 'pointer' : 'default';
          return;
        }
        if (st.paused || st.phase !== 'play') return;
        if (locked && e.pointerType === 'mouse') {
          P.a += (e.movementX || 0) * 0.0012 * set.sens;
          P.pitch = clamp(P.pitch - (e.movementY || 0) * 0.18 * set.sens * (set.invert ? -1 : 1) * (Hv / 200), -Hv * 0.42, Hv * 0.42);
          return;
        }
        var kind = touches[e.pointerId], p = local(e);
        if (kind === 'joy' && joy) {
          var dx = (p.x - joy.cx) / joy.r, dy = (p.y - joy.cy) / joy.r, l = Math.hypot(dx, dy);
          if (l > 1) { dx /= l; dy /= l; }
          joy.dx = Math.abs(dx) < 0.12 ? 0 : dx; joy.dy = Math.abs(dy) < 0.12 ? 0 : dy;
        } else if (kind === 'look' && look) {
          P.a += (p.x - look.x) * 0.0065 * set.sens; look.x = p.x;
        }
      });
      function pUp(e) {
        var kind = touches[e.pointerId];
        if (kind === 'fire') held.touchFire = false;
        if (kind === 'joy') joy = null;
        if (kind === 'look') look = null;
        delete touches[e.pointerId];
        if (e.pointerType === 'mouse' && e.button === 0) held.mouse = false;
      }
      cv.addEventListener('pointerup', pUp);
      cv.addEventListener('pointercancel', pUp);
      cv.addEventListener('wheel', function (e) { if (st.on && !st.paused && st.phase === 'play') { e.preventDefault(); cycleWeapon(e.deltaY > 0 ? 1 : -1); } }, { passive: false });
      /* Strg kommt beim Kern nicht an, also selbst lauschen. Losgelassene Tasten ebenso */
      function onKeyDown(e) { if ((e.code === 'ControlLeft' || e.code === 'ControlRight') && st.on && !st.paused && st.phase === 'play') { held[e.code] = true; e.preventDefault(); } }
      function onKeyUp(e) { delete held[e.code]; if (e.key === 'Control') { delete held.ControlLeft; delete held.ControlRight; } }
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);

      function key(e) {
        var c = e.code, k = e.key;
        if (st.menuOpen && (k === 'Escape' || k === 'Backspace')) { resume(); return true; }
        if (st.phase === 'title' || st.menuOpen) {
          var n = menuItems().length;
          if (c === 'ArrowUp' || c === 'KeyW') { st.sel = (st.sel - 1 + n) % n; au.menu(); return true; }
          if (c === 'ArrowDown' || c === 'KeyS') { st.sel = (st.sel + 1) % n; au.menu(); return true; }
          if (c === 'ArrowLeft' || c === 'KeyA') { activate(st.sel, -1); return true; }
          if (c === 'ArrowRight' || c === 'KeyD') { activate(st.sel, 1); return true; }
          if (k === 'Enter' || c === 'Space') { if (!e.repeat) activate(st.sel, 0); return true; }
          if (k === 'Backspace') { back(); return true; }
          return false;
        }
        if (st.phase === 'intro') { if ((k === 'Enter' || c === 'Space' || k === 'Escape') && !e.repeat) introSkipOrGo(); return true; }
        if (st.phase === 'tally') { if ((k === 'Enter' || c === 'Space') && !e.repeat) { if (st.tallyT > 2.9) endRound(); else st.tallyT = 3; } return true; }
        if (st.phase === 'dead') { if ((k === 'Enter' || c === 'Space') && P.deadT > 1.2) endRound(); return true; }
        if (st.phase !== 'play') return false;
        if (k === 'Escape') { openPause(); return true; }
        if (/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|ShiftLeft|ShiftRight)$/.test(c)) { held[c] = true; return true; }
        if (c === 'Digit1' || c === 'Numpad1') { selectWeapon(0); return true; }
        if (c === 'Digit2' || c === 'Numpad2') { selectWeapon(1); return true; }
        if (c === 'Digit3' || c === 'Numpad3') { selectWeapon(2); return true; }
        if (c === 'KeyQ') { cycleWeapon(1); return true; }
        if ((c === 'KeyE' || c === 'Space') && !e.repeat) { useAction(); return true; }
        if (c === 'KeyF') { held.KeyF = true; return true; }
        /* Maus-Tempo direkt im Spiel: + schneller, − langsamer */
        if (c === 'Equal' || c === 'NumpadAdd' || c === 'BracketRight' || k === '+') { set.sens = clamp(Math.round((set.sens + 0.1) * 10) / 10, 0.2, 3); msg('Maus-Tempo: ' + set.sens.toFixed(1).replace('.', ',')); return true; }
        if (c === 'Minus' || c === 'NumpadSubtract' || c === 'Slash' || k === '-') { set.sens = clamp(Math.round((set.sens - 0.1) * 10) / 10, 0.2, 3); msg('Maus-Tempo: ' + set.sens.toFixed(1).replace('.', ',')); return true; }
        return false;
      }

      layout();
      draw();

      return {
        start: function () {
          cancelAnimationFrame(raf);
          st = fresh(); st.on = true; st.last = performance.now();
          held = {}; touches = {}; joy = null; look = null; touchMode = ctx.touch();
          layout(); ensureArt();
          ctx.setScore(0);
          au.music('title');
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on; held = {}; touches = {}; joy = null; look = null;
          if (on) releaseMouse();
          else { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); if (st.phase === 'play' && !st.menuOpen) lockMouse(); }
        },
        abort: function () { stopLoop(); showCodeInput(false); st = fresh(); L = null; draw(); },
        unmount: function () {
          stopLoop(); showCodeInput(false);
          document.removeEventListener('pointerlockchange', onLockChange);
          document.removeEventListener('keydown', onKeyDown);
          document.removeEventListener('keyup', onKeyUp);
          if (codeInput.parentNode) codeInput.parentNode.removeChild(codeInput);
        },
        resize: function () { layout(); if (st.phase === 'title' && st.menu === 'code') showCodeInput(true); draw(); },
        key: key,
        _debug: function () {
          return {
            st: st, P: function () { return P; }, L: function () { return L; }, startGame: beginLevel, intro: startGame, fire: fire, useAction: useAction, finishLevel: finishLevel, set: set, unlocked: unlocked,
            tp: function (x, y, a) { P.x = x; P.y = y; if (a !== undefined) P.a = a; }, hold: held,
            give: function () { P.has = [true, true, true]; P.ammo.sta = 200; P.ammo.pol = 50; P.keys.red = true; P.lamp = true; },
            god: function () { P.hp = 999999; }, drawFace: drawFace
          };
        }
      };
    }
  });

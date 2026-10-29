/* Spiel 1: Käfer-Jagd */
(function () {
  'use strict';
  var KEYS = [7, 8, 9, 4, 5, 6, 1, 2, 3];
  var DURATION = 30000;
  var SVG = {
    bug: '<svg viewBox="0 0 60 70"><g stroke="#111" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M18 34l-10-6M17 45H5M19 56l-9 8M42 34l10-6M43 45h12M41 56l9 8M25 13l-6-9M35 13l6-9"/></g><circle cx="30" cy="18" r="8" fill="#111"/><ellipse cx="30" cy="44" rx="16" ry="20" fill="#D3272F" stroke="#111" stroke-width="3"/><path d="M30 25v38" stroke="#111" stroke-width="2.5"/><circle cx="23" cy="38" r="3" fill="#111"/><circle cx="37" cy="38" r="3" fill="#111"/><circle cx="23" cy="51" r="2.5" fill="#111"/><circle cx="37" cy="51" r="2.5" fill="#111"/></svg>',
    gold: '<svg viewBox="0 0 60 70"><g stroke="#111" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M18 34l-10-6M17 45H5M19 56l-9 8M42 34l10-6M43 45h12M41 56l9 8M25 13l-6-9M35 13l6-9"/></g><circle cx="30" cy="18" r="8" fill="#111"/><ellipse cx="30" cy="44" rx="16" ry="20" fill="#FDC506" stroke="#111" stroke-width="3"/><path d="M30 25v38" stroke="#C79A00" stroke-width="2.5"/><path d="M21 33q3-5 7-5" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M50 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/></svg>',
    bee: '<svg viewBox="0 0 60 70"><ellipse cx="17" cy="30" rx="11" ry="8" fill="#fff" opacity=".75" transform="rotate(-25 17 30)"/><ellipse cx="43" cy="30" rx="11" ry="8" fill="#fff" opacity=".75" transform="rotate(25 43 30)"/><circle cx="30" cy="18" r="8" fill="#111"/><path d="M26 11l-4-7M34 11l4-7" stroke="#111" stroke-width="3" stroke-linecap="round"/><ellipse cx="30" cy="44" rx="13" ry="19" fill="#FDC506" stroke="#111" stroke-width="3"/><path d="M18 38h24M17.5 47h25M20 56h20" stroke="#111" stroke-width="5"/><path d="M30 63v5" stroke="#111" stroke-width="3" stroke-linecap="round"/></svg>'
  };
  var NAMES = { bug: 'Käfer', gold: 'goldener Käfer', bee: 'Biene, nicht klicken' };
  var BEE_LINES = [
    'Autsch! Das war Die Maschine.',
    'Ey, ich bin Kollegin!',
    'Finger weg, ich bau hier Websites.',
    'Das war der Sprücheklopfer. Der hat jetzt was zu erzählen.',
    'Bienen sind die Guten!',
    'Der Allesmacher macht jetzt erstmal Pause.'
  ];
  var GOLD_LINES = ['Goldkäfer! Dreifach.', 'Glänzt wie ein Award.', 'Der war was wert.'];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  MBArcade.register({
    id: 'bugjagd',
    title: 'Käfer-Jagd',
    duration: DURATION,
    startText: '30 Sekunden. Erwisch so viele Bugs wie möglich, bevor sie abhauen.',
    help: {
      controls: [
        { icons: ['mouse-left', 'tap'], text: 'Käfer anklicken oder antippen' },
        { icons: ['kbd:1–9'], text: 'Wabe über den Nummernblock treffen', kb: true },
        { icons: ['kbd:Esc'], text: 'Pause und Menü', kb: true }
      ],
      legend: [
        { svg: SVG.bug, text: 'Käfer', val: '+1' },
        { svg: SVG.gold, text: 'Goldkäfer, selten und schnell wieder weg', val: '+3' },
        { svg: SVG.bee, text: 'Biene, unsere Kollegin. Nicht klicken!', val: '−2', minus: true },
        { svg: '<svg viewBox="0 0 60 70"><polygon points="30,8 54,22 54,48 30,62 6,48 6,22" fill="#1A1A1A" stroke="#E5322D" stroke-width="3.5"/><path d="M22 27l16 16M38 27L22 43" stroke="#E5322D" stroke-width="4" stroke-linecap="round"/></svg>', text: 'Leere Wabe angeklickt. Dauerklicken lohnt sich nicht.', val: '−1', minus: true }
      ]
    },
    ranks: [
      [40, 'Chef-Biene', 'Das ist ja großartig!'],
      [25, 'Programmier-Biene', 'Sauberer Code, saubere Waben.'],
      [12, 'Webdesign-Biene', 'Ordentlich gejagt.'],
      [0, 'Praktikanten-Biene', 'Da geht noch was.']
    ],
    cta: { path: 'webseiten-wartung/', text: 'Echte Bugs auf deiner Website? Die fixen wir.' },
    stats: function (s) {
      var t = s.caught + ' Käfer erwischt, ' + s.escaped + ' entkommen';
      t += s.misses ? ', ' + s.misses + (s.misses === 1 ? ' Fehlklick.' : ' Fehlklicks.') : '.';
      return t + (s.combo >= 3 ? ' Beste Kombo: ' + s.combo + '.' : '');
    },

    mount: function (ctx) {
      var board = document.createElement('div');
      board.className = 'mb4-board';
      ctx.screen.appendChild(board);

      var cells = [];
      KEYS.forEach(function (k, i) {
        var r = Math.floor(i / 3), c = i % 3;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'mb4-cell';
        b.style.left = (0.79 + c * 28.57 + (r === 1 ? 14.29 : 0)) + '%';
        b.style.top = (r * 30.67) + '%';
        b.tabIndex = -1;
        b.setAttribute('aria-label', 'Wabe ' + k + ', leer');
        b.innerHTML = '<span class="mb4-rim"></span><span class="mb4-in"></span><span class="mb4-critter"></span><span class="mb4-key" aria-hidden="true">' + k + '</span><span class="mb4-pop" aria-hidden="true"></span>';
        board.appendChild(b);
        var cell = { el: b, k: k, critter: b.querySelector('.mb4-critter'), pop: b.querySelector('.mb4-pop'), type: null, until: 0, busy: 0 };
        b.addEventListener('pointerdown', function (e) { if (e.button === 0 || e.pointerType !== 'mouse') { e.preventDefault(); hit(cell); } });
        b.addEventListener('click', function (e) { if (e.detail === 0) hit(cell); });
        cells.push(cell);
      });

      var combo = document.createElement('div');
      combo.className = 'mb4-combo';
      combo.setAttribute('aria-hidden', 'true');
      board.appendChild(combo);
      var st = { on: false, paused: false, t: 0, last: 0, next: 0, score: 0, caught: 0, escaped: 0, misses: 0, combo: 0, bestCombo: 0 };
      var SPARK = { bug: ['#D3272F', '#111', '#FF6B5E'], gold: ['#FDC506', '#FFFFFF', '#FFE680'], bee: ['#FDC506', '#111', '#FF7A6B'] };

      function sparks(cell, type) {
        if (ctx.reduce) return;
        for (var i = 0; i < 9; i++) {
          var sp = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 45;
          sp.className = 'mb4-spark';
          sp.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px');
          sp.style.setProperty('--dy', Math.round(Math.sin(a) * d) + 'px');
          sp.style.setProperty('--c', SPARK[type][i % 3]);
          if (type === 'gold' && i % 2) sp.classList.add('is-star');
          cell.el.appendChild(sp);
          setTimeout(function (n) { return function () { n.remove(); }; }(sp), 650);
        }
      }
      function showCombo(n) {
        combo.textContent = 'Kombo ×' + n;
        combo.classList.remove('is-on'); void combo.offsetWidth; combo.classList.add('is-on');
      }
      function shake() {
        if (ctx.reduce) return;
        board.classList.remove('is-shake'); void board.offsetWidth; board.classList.add('is-shake');
      }
      var raf = 0;

      function popText(cell, text, minus) {
        var p = cell.pop;
        p.textContent = text;
        p.classList.toggle('is-minus', !!minus);
        p.classList.remove('is-on'); void p.offsetWidth; p.classList.add('is-on');
        clearTimeout(p._t);
        p._t = setTimeout(function () { p.classList.remove('is-on'); }, 620);
      }

      function hide(cell) {
        cell.type = null;
        cell.el.classList.remove('is-up');
        cell.el.setAttribute('aria-label', 'Wabe ' + cell.k + ', leer');
      }

      function spawn() {
        var p = st.t / DURATION;
        var active = 0, free = [];
        cells.forEach(function (c) { if (c.type) active++; else if (st.t >= c.busy) free.push(c); });
        if (!free.length || active >= 2 + Math.floor(p * 2.5)) return;
        var c = free[Math.floor(Math.random() * free.length)];
        var roll = Math.random();
        var type = roll < 0.15 ? 'bee' : roll < 0.23 ? 'gold' : 'bug';
        var life = 1250 - 500 * p;
        c.type = type;
        c.until = st.t + life * (type === 'bee' ? 1.4 : type === 'gold' ? 0.8 : 1);
        c.critter.innerHTML = SVG[type];
        c.el.classList.remove('is-hit', 'is-bee-hit');
        c.el.classList.add('is-up');
        c.el.setAttribute('aria-label', 'Wabe ' + c.k + ': ' + NAMES[type]);
      }

      /* Fehlklick: kostet einen Punkt und die Kombo, damit sich Dauerklicken nicht lohnt */
      function miss(cell) {
        if (st.t < cell.busy) return;
        st.misses++;
        st.score = Math.max(0, st.score - 1);
        if (st.combo >= 3) ctx.say('Daneben! Kombo weg.');
        st.combo = 0;
        cell.busy = st.t + 120;
        cell.el.classList.add('is-bee-hit');
        setTimeout(function () { cell.el.classList.remove('is-bee-hit'); }, 200);
        popText(cell, '−1', true);
        ctx.tone(200, 150, 0.08, 'sawtooth', 0.03);
        ctx.setScore(st.score);
      }

      function hit(cell) {
        if (!st.on || st.paused) return;
        if (!cell.type) { miss(cell); return; }
        var type = cell.type;
        var pts = type === 'gold' ? 3 : type === 'bee' ? -2 : 1;
        st.score = Math.max(0, st.score + pts);
        if (type !== 'bee') st.caught++;
        hide(cell);
        cell.busy = st.t + 300;
        cell.el.classList.add(type === 'bee' ? 'is-bee-hit' : 'is-hit');
        setTimeout(function () { cell.el.classList.remove('is-hit', 'is-bee-hit'); }, 260);
        popText(cell, pts > 0 ? '+' + pts : '−' + Math.abs(pts), pts < 0);
        sparks(cell, type);
        if (type === 'bee') { st.combo = 0; shake(); }
        else {
          st.combo++;
          st.bestCombo = Math.max(st.bestCombo, st.combo);
          if (st.combo >= 3) showCombo(st.combo);
          if (st.combo === 10 || st.combo === 20) ctx.say(st.combo + ' Käfer ohne Fehler!');
        }
        if (type === 'bee') { ctx.say(pick(BEE_LINES)); ctx.tone(170, 120, 0.28, 'sawtooth', 0.05); }
        else if (type === 'gold') { ctx.say(pick(GOLD_LINES)); ctx.tone(660, 990, 0.1, 'triangle', 0.08); ctx.tone(990, 1320, 0.12, 'triangle', 0.07, 0.09); }
        else ctx.tone(560, 160, 0.09, 'square', 0.05);
        ctx.setScore(st.score);
      }

      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(100, now - st.last);
        st.last = now;
        if (!st.paused) {
          st.t += dt;
          cells.forEach(function (c) {
            if (c.type && st.t >= c.until) { if (c.type !== 'bee') { st.escaped++; st.combo = 0; } hide(c); c.busy = st.t + 200; }
          });
          if (st.t >= st.next) {
            spawn();
            st.next = st.t + (850 - 450 * (st.t / DURATION)) * (0.7 + Math.random() * 0.6);
          }
          if (st.t >= DURATION) { stop(); ctx.finish(st.score, { caught: st.caught, escaped: st.escaped, misses: st.misses, combo: st.bestCombo }); return; }
          ctx.setTime(DURATION - st.t, DURATION);
        }
        raf = requestAnimationFrame(frame);
      }

      function setActive(on) { cells.forEach(function (c) { c.el.tabIndex = on ? 0 : -1; }); }

      function stop() {
        st.on = false;
        cancelAnimationFrame(raf);
        cells.forEach(hide);
        board.classList.remove('is-running');
        setActive(false);
      }

      return {
        start: function () {
          st = { on: true, paused: false, t: 0, last: performance.now(), next: 500, score: 0, caught: 0, escaped: 0, misses: 0, combo: 0, bestCombo: 0 };
          cells.forEach(function (c) { hide(c); c.busy = 0; });
          board.classList.add('is-running');
          setActive(true);
          cells[4].el.focus({ preventScroll: true });
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on;
          if (!on) { st.last = performance.now(); cells[4].el.focus({ preventScroll: true }); }
        },
        abort: stop,
        unmount: stop,
        key: function (e) {
          var n = parseInt(e.key, 10);
          if (n >= 1 && n <= 9) {
            var cell = cells[KEYS.indexOf(n)];
            cell.el.focus({ preventScroll: true });
            hit(cell);
            return true;
          }
          return false;
        }
      };
    }
  });
})();

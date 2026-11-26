
  /* ------------------------------------------------------------------ Sound und Musik (alles im Browser erzeugt, eigene Riffs) */
  function makeAudio(ctx, set) {
    var A = { ac: null, intensity: 0, target: 0, mode: 'off', next: 0, step: 0, bar: 0 };
    function get() {
      var ac = ctx.audio();
      if (!ac) return null;
      if (A.ac !== ac) init(ac);
      return A;
    }
    function init(ac) {
      A.ac = ac;
      A.master = ac.createGain(); A.master.gain.value = 0.9; A.master.connect(ac.destination);
      A.sfx = ac.createGain(); A.sfx.connect(A.master);
      A.mus = ac.createGain(); A.mus.connect(A.master);
      A.amb = ac.createGain(); A.amb.gain.value = 0; A.amb.connect(A.mus);
      A.metal = ac.createGain(); A.metal.gain.value = 0; A.metal.connect(A.mus);
      /* Echo für die ruhige Gitarre */
      A.echo = ac.createDelay(1); A.echo.delayTime.value = 0.3;
      var fb = ac.createGain(); fb.gain.value = 0.38; var ef = ac.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 1800;
      A.echo.connect(ef); ef.connect(fb); fb.connect(A.echo); ef.connect(A.amb);
      /* Rauschen */
      var len = ac.sampleRate * 1.5, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      A.noise = buf;
      /* Verzerrer für die Gitarre */
      var n = 1024, curve = new Float32Array(n);
      for (var k = 0; k < n; k++) { var x = k * 2 / n - 1; curve[k] = Math.tanh(x * 6) * 0.9; }
      A.curve = curve;
      A.next = ac.currentTime + 0.1; A.step = 0; A.bar = 0;
      vols();
    }
    function vols() { if (!A.ac) return; A.sfx.gain.value = set.sfx; A.mus.gain.value = set.music * 0.8; }
    function out(pan) {
      if (pan && A.ac.createStereoPanner) { var p = A.ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(A.sfx); return p; }
      return A.sfx;
    }
    function env(gn, t, vol, att, dur) {
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + att);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    function tone(type, f1, f2, dur, vol, delay, pan, dest) {
      var a = get(); if (!a) return;
      var ac = a.ac, t = ac.currentTime + (delay || 0), o = ac.createOscillator(), gn = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      env(gn, t, vol, 0.005, dur); o.connect(gn); gn.connect(dest || out(pan)); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(dur, ftype, f1, f2, vol, delay, pan, q, dest) {
      var a = get(); if (!a) return;
      var ac = a.ac, t = ac.currentTime + (delay || 0), s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
      s.buffer = a.noise; s.loop = true;
      f.type = ftype; f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur); f.Q.value = q || 0.8;
      env(gn, t, vol, 0.004, dur); s.connect(f); f.connect(gn); gn.connect(dest || out(pan));
      s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    /* Verzerrte Gitarre: Powerchord aus Grundton, Quinte, Oktave */
    function guitar(t, f, dur, vol, mute, dest) {
      var ac = A.ac, sh = ac.createWaveShaper(), lp = ac.createBiquadFilter(), gn = ac.createGain();
      sh.curve = A.curve; lp.type = 'lowpass'; lp.frequency.value = mute ? 1100 : 2600;
      [1, 1.4983, 2].forEach(function (m, i) {
        [-6, 6].forEach(function (det) {
          var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * m; o.detune.value = det;
          var og = ac.createGain(); og.gain.value = i === 2 ? 0.18 : 0.28; o.connect(og); og.connect(sh);
          o.start(t); o.stop(t + dur + 0.05);
        });
      });
      gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      sh.connect(lp); lp.connect(gn); gn.connect(dest);
    }
    function kick(t, vol, dest) { var ac = A.ac, o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(gn, t, vol, 0.002, 0.16); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + 0.2); }
    function snare(t, vol, dest) { noiseAt(t, 'bandpass', 1800, 900, vol, 0.14, dest, 0.7); var ac = A.ac, o = ac.createOscillator(), gn = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08); env(gn, t, vol * 0.6, 0.002, 0.09); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + 0.12); }
    function hatAmb(t) { noiseAt(t, 'highpass', 6000, 5000, 0.03, 0.08, A.amb, 0.5); }
    function hat(t, vol, dest) { noiseAt(t, 'highpass', 8000, 7000, vol, 0.04, dest, 0.5); }
    function noiseAt(t, ftype, f1, f2, vol, dur, dest, q) {
      var ac = A.ac, s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
      s.buffer = A.noise; f.type = ftype; f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur); f.Q.value = q || 0.8;
      env(gn, t, vol, 0.002, dur); s.connect(f); f.connect(gn); gn.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    /* Ruhige Ebene: cleane Zupfgitarre mit Echo und warme Fläche */
    function pluck(t, f, vol) {
      var ac = A.ac, o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), gn = ac.createGain();
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.5);
      var g2 = ac.createGain(); g2.gain.value = 0.3; o2.connect(g2); g2.connect(lp);
      o.connect(lp); lp.connect(gn); env(gn, t, vol, 0.004, 0.9);
      gn.connect(A.amb); gn.connect(A.echo);
      o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + 1);
    }
    function pad(t, freqs, dur, vol) {
      var ac = A.ac, lp = ac.createBiquadFilter(), gn = ac.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 650;
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      freqs.forEach(function (f) { [-8, 8].forEach(function (d) { var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.05); }); });
      lp.connect(gn); gn.connect(A.amb);
    }
    function bass(t, f, dur, vol, dest) { var ac = A.ac, o = ac.createOscillator(), lp = ac.createBiquadFilter(), gn = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f / 2; lp.type = 'lowpass'; lp.frequency.value = 380; gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(lp); lp.connect(gn); gn.connect(dest); o.start(t); o.stop(t + dur + 0.05); }

    /* Eigene Riffs (Tiefe E-Stimmung). e = gedämpftes E, Großbuchstaben = Powerchords */
    var NOTE = { e: 82.41, E: 82.41, F: 87.31, f: 92.5, G: 98, g: 103.83, A: 110, B: 116.54, C: 130.81, D: 73.42 };
    var RIFF = [
      'eeE-eeG-eeE-A-G-', 'eeE-eeG-eeB-A-F-',
      'eeE-eeG-eeE-A-G-', 'EEEEGGGGAAAABBBB',
      'e-e-E-e-e-G-e-f-', 'e-e-E-e-e-C-B-A-',
      'eeeeE---eeeeG---', 'eeF-eeE-eeD-E---'
    ];
    var KICK = ['x...x...x.x.x...', 'xxxxxxxxxxxxxxxx'], SNARE = '....x.......x...', HAT = 'x.x.x.x.x.x.x.x.';
    /* Ruhige Akkorde (Grundton, Terz, Quinte) – 8 Takte, eigene Folge */
    var CALM = [[164.81, 196, 246.94], [164.81, 196, 246.94], [130.81, 164.81, 196], [146.83, 185, 220], [164.81, 196, 246.94], [164.81, 196, 246.94], [123.47, 146.83, 185], [130.81, 164.81, 196]];
    var ARP = [0, 1, 2, 3, 2, 1, 2, 1];
    var TITLE = ['E-------E---F---', 'E-------D---C---', 'E-------E---F---', 'G-------F---E---'];

    function schedule() {
      if (!A.ac || A.mode === 'off') return;
      var ac = A.ac, ahead = ac.currentTime + 0.25;
      /* Lautstärke zwischen ruhig und Metal überblenden */
      A.intensity += (A.target - A.intensity) * 0.04;
      if (A.mode === 'level') { A.metal.gain.value = A.intensity; A.amb.gain.value = 0.85 - A.intensity * 0.55; }
      else { A.metal.gain.value = 1; A.amb.gain.value = 0; }
      if (A.next < ac.currentTime - 0.3) A.next = ac.currentTime + 0.05;
      while (A.next < ahead) {
        var t = A.next, s = A.step % 16;
        if (A.mode === 'title') {
          var tn = TITLE[A.bar % 4][s];
          if (tn !== '-') { guitar(t, NOTE[tn], 1.3, 0.22, false, A.metal); bass(t, NOTE[tn], 1.3, 0.3, A.metal); }
          if (s === 0 || s === 8) kick(t, 0.5, A.metal);
          if (s === 12) snare(t, 0.25, A.metal);
          A.next += 0.13;
        } else if (A.mode === 'level' || A.mode === 'win') {
          var row = A.mode === 'win' ? 'EEGGAABB' + 'E-------' : RIFF[A.bar % RIFF.length], n = row[s];
          if (n && n !== '-') { var m = n === 'e'; guitar(t, NOTE[n], m ? 0.11 : 0.22, m ? 0.2 : 0.26, m, A.metal); bass(t, NOTE[n], m ? 0.1 : 0.2, 0.32, A.metal); }
          var kp = KICK[A.intensity > 0.8 && A.bar % 4 === 3 ? 1 : 0];
          if (kp[s] === 'x') kick(t, 0.55, A.metal);
          if (SNARE[s] === 'x') snare(t, 0.3, A.metal);
          if (HAT[s] === 'x') hat(t, 0.08, A.metal);
          /* Ruhige Ebene (läuft immer): Zupfgitarre, Fläche, Brummen, Tropfen, fernes Hämmern */
          if (A.mode === 'level') {
            var ch = CALM[A.bar % CALM.length];
            if (s % 2 === 0) { var ti = ARP[(s / 2) % 8], fq = ti === 3 ? ch[0] * 2 : ch[ti]; pluck(t, fq, s === 0 ? 0.16 : 0.11); }
            if (s === 0) {
              pad(t, [ch[0] / 2, ch[1] / 2, ch[2] / 2], 1.7, 0.05);
              var o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine'; o.frequency.value = ch[0] / 4; env(gn, t, 0.16, 0.3, 1.7); o.connect(gn); gn.connect(A.amb); o.start(t); o.stop(t + 1.8);
            }
            if (s === 8 && A.bar % 2) hatAmb(t);
          }
          if (A.mode === 'level' && Math.random() < 0.06) { var o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'sine'; o2.frequency.setValueAtTime(1500 + Math.random() * 900, t); o2.frequency.exponentialRampToValueAtTime(500, t + 0.09); env(g2, t, 0.05, 0.003, 0.1); o2.connect(g2); g2.connect(A.amb); o2.start(t); o2.stop(t + 0.12); }
          if (A.mode === 'level' && s === 6 && A.bar % 3 === 1) noiseAt(t, 'lowpass', 500, 200, 0.06, 0.12, A.amb, 1);
          A.next += 0.1;
          if (A.mode === 'win' && A.step >= 15) { A.mode = 'off'; }
        } else break;
        A.step++;
        if (A.step % 16 === 0) A.bar++;
      }
    }

    return {
      settings: vols,
      update: function () { if (get()) schedule(); },
      music: function (mode) { var a = get(); A.mode = mode; A.step = 0; A.bar = 0; A.intensity = mode === 'level' ? 0 : 1; if (a) A.next = a.ac.currentTime + 0.08; },
      setIntensity: function (v) { A.target = v; },
      stop: function () { A.mode = 'off'; if (A.ac) { try { A.master.gain.setTargetAtTime(0, A.ac.currentTime, 0.05); } catch (e) {} A.ac = null; } },
      /* Effekte */
      fist: function () { tone('sine', 140, 50, 0.12, 0.25); noise(0.06, 'lowpass', 500, 200, 0.25); },
      punchHit: function () { tone('square', 90, 40, 0.1, 0.25); noise(0.08, 'lowpass', 900, 200, 0.35); },
      pistol: function () { noise(0.09, 'highpass', 2200, 700, 0.45); tone('square', 260, 60, 0.09, 0.22); },
      shotgun: function () { noise(0.4, 'lowpass', 4000, 300, 0.75); tone('sine', 110, 35, 0.3, 0.5); noise(0.03, 'highpass', 3000, 2500, 0.25, 0.48); noise(0.03, 'highpass', 2500, 2000, 0.25, 0.62); },
      empty: function () { tone('square', 1800, 1700, 0.025, 0.12); },
      pickup: function () { tone('triangle', 660, 990, 0.07, 0.18); tone('triangle', 990, 1320, 0.08, 0.16, 0.07); },
      armor: function () { tone('square', 330, 660, 0.12, 0.12); tone('square', 495, 990, 0.12, 0.1, 0.06); },
      weapon: function () { var a = get(); if (!a) return; var t = a.ac.currentTime; guitar(t, 82.41, 0.9, 0.35, false, out(0)); kick(t, 0.6, out(0)); },
      keyGet: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone('triangle', f, f, 0.12, 0.14, i * 0.06); }); },
      door: function (pan, vol) { noise(0.7, 'lowpass', 380, 120, 0.4 * (vol || 1), 0, pan); tone('sawtooth', 55, 48, 0.6, 0.08 * (vol || 1), 0, pan); },
      locked: function () { tone('square', 200, 180, 0.12, 0.15); tone('square', 150, 140, 0.15, 0.15, 0.13); },
      secret: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone('triangle', f, f, 0.16, 0.13, i * 0.08); }); },
      buzz: function (kind, pan, vol) { var f = { wespe: 230, wach: 190, flinte: 160, feuer: 140, kami: 300, milbe: 520 }[kind] || 200; tone('sawtooth', f, f * 1.25, 0.18, 0.12 * vol, 0, pan); tone('sawtooth', f * 1.25, f, 0.2, 0.1 * vol, 0.16, pan); },
      enemyShot: function (kind, pan, vol) { if (kind === 'flinte') { noise(0.3, 'lowpass', 3000, 400, 0.45 * vol, 0, pan); } else { noise(0.08, 'highpass', 1800, 600, 0.35 * vol, 0, pan); tone('square', 220, 70, 0.08, 0.16 * vol, 0, pan); } },
      fireball: function (pan, vol) { noise(0.35, 'bandpass', 600, 1800, 0.3 * vol, 0, pan, 2); },
      pain: function (pan, vol) { tone('square', 700, 320, 0.1, 0.12 * vol, 0, pan); },
      splat: function (pan, vol) { noise(0.3, 'bandpass', 900, 160, 0.4 * vol, 0, pan, 1.2); tone('sine', 300, 60, 0.25, 0.22 * vol, 0, pan); },
      boom: function (pan, vol) { noise(1.0, 'lowpass', 1500, 60, 0.9 * vol, 0, pan); tone('sine', 70, 28, 0.7, 0.6 * vol, 0, pan); },
      beep: function (pan, vol) { tone('square', 1900, 1900, 0.05, 0.12 * vol, 0, pan); },
      scream: function (pan, vol) { tone('sawtooth', 950, 320, 1.1, 0.12 * vol, 0, pan); tone('sawtooth', 960, 330, 1.1, 0.08 * vol, 0.02, pan); },
      hurt: function () { tone('square', 230, 110, 0.16, 0.22); noise(0.08, 'lowpass', 700, 200, 0.18); },
      heart: function () { tone('sine', 62, 40, 0.12, 0.35); tone('sine', 58, 38, 0.12, 0.3, 0.2); },
      die: function () { tone('sawtooth', 320, 40, 1.3, 0.25); noise(0.6, 'lowpass', 900, 100, 0.3); },
      bite: function (pan, vol) { noise(0.05, 'highpass', 4000, 3000, 0.2 * vol, 0, pan); },
      lever: function () { tone('square', 120, 90, 0.15, 0.25); noise(0.2, 'lowpass', 900, 200, 0.3); },
      menu: function () { tone('square', 440, 440, 0.04, 0.08); },
      select: function () { tone('square', 660, 880, 0.08, 0.1); },
      gibs: function (pan, vol) { noise(0.25, 'bandpass', 1400, 300, 0.35 * vol, 0, pan, 1.5); }
    };
  }

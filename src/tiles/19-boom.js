/* Kachel: BOOM 2026 */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'boom',
    title: 'BOOM 2026',
    ranks: [
      [60000, 'Schichtführer der Hölle', 'Die Wespen haben Feierabend. Für immer.'],
      [40000, 'Steiger', 'Unter Tage hast du das Sagen.'],
      [25000, 'Hauer', 'Du haust alles weg, was summt.'],
      [15000, 'Kumpel', 'Auf dich ist da unten Verlass.'],
      [8000, 'Knappe', 'Die Ausbildung läuft.'],
      [4000, 'Lehrling', 'Erste Schicht überlebt. Fast.'],
      [1500, 'Grubenpony', 'Du schleppst dich so durch.'],
      [0, 'Frischling', 'Glück auf! Nochmal einfahren?']
    ],
    thumb: function (g, w, h) {
      /* Feuer-Hintergrund */
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0A0606'); gr.addColorStop(0.5, '#2A0A04'); gr.addColorStop(0.82, '#B3261E'); gr.addColorStop(1, '#FDC506');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var rg = art.rng(26);
      for (var i = 0; i < 40; i++) { var fx = rg() * w, fh = h * (0.15 + rg() * 0.35); g.fillStyle = 'rgba(255,' + Math.floor(90 + rg() * 120) + ',20,' + (0.15 + rg() * 0.25) + ')'; g.beginPath(); g.moveTo(fx - 6, h); g.quadraticCurveTo(fx + (rg() - 0.5) * 14, h - fh * 0.6, fx, h - fh); g.quadraticCurveTo(fx + 4, h - fh * 0.5, fx + 6, h); g.fill(); }
      /* Grimmiger Kumpel mit Grubenhelm */
      var s = h / 64, cx = w / 2, cy = h * 0.58;
      g.save(); g.translate(cx, cy); g.scale(s, s);
      g.strokeStyle = '#111'; g.lineWidth = 2.2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-6, -14); g.quadraticCurveTo(-11, -24, -15, -25); g.moveTo(6, -14); g.quadraticCurveTo(11, -24, 15, -25); g.stroke();
      g.fillStyle = '#111'; g.beginPath(); g.arc(-15, -25, 2.4, 0, TAU); g.arc(15, -25, 2.4, 0, TAU); g.fill();
      g.beginPath(); g.arc(0, 2, 17, 0, TAU); g.fillStyle = '#3A2410'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#111'; g.stroke();
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(0, 12, 11, 6, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(0, -8, 19, 13, 0, Math.PI, TAU); g.fillStyle = '#F2C200'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#C99A00'; g.fillRect(-21, -9, 42, 4); g.strokeRect(-21, -9, 42, 4);
      g.fillStyle = '#5E646C'; g.fillRect(-5, -20, 10, 7);
      var lg = g.createRadialGradient(0, -16.5, 1, 0, -16.5, 14); lg.addColorStop(0, 'rgba(255,246,192,0.9)'); lg.addColorStop(1, 'rgba(255,246,192,0)'); g.fillStyle = lg; g.beginPath(); g.arc(0, -16.5, 14, 0, TAU); g.fill();
      g.fillStyle = '#FFF6C0'; g.beginPath(); g.arc(0, -16.5, 3, 0, TAU); g.fill();
      [-6, 6].forEach(function (ex, k) {
        var sd = k ? -1 : 1;
        g.fillStyle = '#FFF'; g.beginPath(); g.ellipse(ex, 3.4, 4.2, 2.6, 0, 0, TAU); g.fill();
        g.fillStyle = '#E5322D'; g.beginPath(); g.arc(ex, 3.8, 1.8, 0, TAU); g.fill();
        g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(ex - 5 * sd, -4.5); g.lineTo(ex + 4 * sd, 1.6); g.stroke();
      });
      g.fillStyle = '#3A0A08'; g.beginPath(); g.moveTo(-9, 9.5); g.lineTo(9, 9.5); g.lineTo(7, 15.5); g.lineTo(-7, 15.5); g.closePath(); g.fill();
      g.fillStyle = '#FFF'; for (var t = -8; t < 8; t += 2.8) { g.fillRect(t, 9.8, 2, 2.4); g.fillRect(t + 0.6, 13, 2, 2.3); }
      g.restore();
      /* Logo */
      var fs = Math.round(h * 0.27);
      g.font = '900 ' + fs + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      var tg = g.createLinearGradient(0, h * 0.04, 0, h * 0.04 + fs); tg.addColorStop(0, '#FFF3A0'); tg.addColorStop(0.5, '#FDC506'); tg.addColorStop(1, '#FF7A1A');
      g.save(); g.translate(w / 2, h * 0.16); g.transform(1, 0, -0.12, 1, 0, 0);
      g.lineWidth = fs * 0.16; g.strokeStyle = '#120806'; g.strokeText('BOOM', 0, 0); g.fillStyle = tg; g.fillText('BOOM', 0, 0);
      g.restore();
      g.font = '900 ' + Math.round(fs * 0.38) + 'px Poppins, sans-serif'; g.lineWidth = 3; g.strokeStyle = '#120806';
      g.strokeText('2026', w * 0.84, h * 0.86); g.fillStyle = '#E5322D'; g.fillText('2026', w * 0.84, h * 0.86);
    }
  });
})();

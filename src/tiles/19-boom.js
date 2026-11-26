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
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0A0606'); gr.addColorStop(0.55, '#3A0E06'); gr.addColorStop(0.8, '#B3261E'); gr.addColorStop(1, '#FDC506');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      /* Stollen in Fluchtpunkt-Perspektive */
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.beginPath(); g.moveTo(w * 0.36, h * 0.3); g.lineTo(w * 0.64, h * 0.3); g.lineTo(w * 0.64, h * 0.72); g.lineTo(w * 0.36, h * 0.72); g.fill();
      g.strokeStyle = 'rgba(253,197,6,0.35)'; g.lineWidth = 2;
      [[0, 0, 0.36, 0.3], [1, 0, 0.64, 0.3], [0, 1, 0.36, 0.72], [1, 1, 0.64, 0.72]].forEach(function (l) { g.beginPath(); g.moveTo(w * l[0], h * l[1]); g.lineTo(w * l[2], h * l[3]); g.stroke(); });
      g.save(); g.translate(w * 0.5, h * 0.52); g.scale(h / 140, h / 140); art.wasp(g, 0.4); g.restore();
      g.fillStyle = '#E5322D'; g.beginPath(); g.arc(w * 0.47, h * 0.49, 1.6, 0, TAU); g.arc(w * 0.53, h * 0.49, 1.6, 0, TAU); g.fill();
      var s = Math.round(h * 0.3);
      g.font = '900 ' + s + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      var tg = g.createLinearGradient(0, h * 0.06, 0, h * 0.06 + s); tg.addColorStop(0, '#FFF3A0'); tg.addColorStop(0.5, '#FDC506'); tg.addColorStop(1, '#FF7A1A');
      g.lineWidth = s * 0.16; g.strokeStyle = '#120806'; g.strokeText('BOOM', w / 2, h * 0.2);
      g.fillStyle = tg; g.fillText('BOOM', w / 2, h * 0.2);
      g.font = '900 ' + Math.round(s * 0.36) + 'px Poppins, sans-serif'; g.lineWidth = 3; g.strokeText('2026', w * 0.5, h * 0.88); g.fillStyle = '#FFF'; g.fillText('2026', w * 0.5, h * 0.88);
      /* Stachler unten rechts */
      g.fillStyle = '#C98A1A'; g.fillRect(w * 0.66, h * 0.72, w * 0.12, h * 0.1); g.fillStyle = '#7A4A10'; g.fillRect(w * 0.72, h * 0.8, w * 0.04, h * 0.14);
    }
  });
})();

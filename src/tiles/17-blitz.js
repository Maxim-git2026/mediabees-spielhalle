/* Kachel: Bienen-Blitz */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'blitz',
    title: 'Bienen-Blitz',
    ranks: [
      [9000, 'Blitzkönigin', 'Schneller als jede Aufgabe.'],
      [6000, 'Reflex-Rakete', 'Du denkst nicht, du machst.'],
      [4000, 'Turbo-Biene', 'Auch auf Stufe fünf noch locker.'],
      [2500, 'Flinkflügel', 'Die Aufgaben kommen, du lieferst.'],
      [1500, 'Fixe Biene', 'Gute Reflexe.'],
      [800, 'Aufgabensammlerin', 'Die ersten Runden sitzen.'],
      [300, 'Knopfdrückerin', 'Konntest es nicht lassen, oder?'],
      [0, 'Kaboom-Biene', 'Den roten Knopf drückt man nicht. Nochmal!']
    ],
    thumb: function (g, w, h) {
      g.fillStyle = '#2E1A1A'; g.fillRect(0, 0, w, h);
      g.save(); g.globalAlpha = 0.08; for (var y = 0; y < h + 20; y += 18) for (var x = (y / 18) % 2 ? 10 : 0; x < w + 20; x += 20) art.hex(g, x, y, 9, null, '#FDC506', 1); g.restore();
      var bx = w * 0.5, by = h * 0.62, r = h * 0.26;
      g.beginPath(); g.ellipse(bx, by + r * 0.3, r * 1.1, r * 0.48, 0, 0, TAU); g.fillStyle = '#5A5A5A'; g.fill();
      g.fillStyle = '#9E1B17'; g.fillRect(bx - r * 0.8, by - r * 0.25, r * 1.6, r * 0.3);
      var gr = g.createRadialGradient(bx - r * 0.25, by - r * 0.35, 2, bx, by - r * 0.25, r * 0.85); gr.addColorStop(0, '#FF7A6B'); gr.addColorStop(1, '#E5322D');
      g.beginPath(); g.ellipse(bx, by - r * 0.25, r * 0.8, r * 0.36, 0, 0, TAU); g.fillStyle = gr; g.fill();
      g.font = '900 ' + Math.round(h * 0.13) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 4; g.strokeStyle = '#111'; g.strokeText('NICHT DRÜCKEN!', w / 2, h * 0.2); g.fillStyle = '#FDC506'; g.fillText('NICHT DRÜCKEN!', w / 2, h * 0.2);
      g.save(); g.translate(w * 0.82, h * 0.42); g.scale(0.45, 0.45); g.rotate(-0.3); art.bee(g, 0.4); g.restore();
    }
  });
})();

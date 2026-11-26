/* Kachel: Wurfduell */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art, rr = art.rrect;
  MBArcade.tile({
    id: 'wurf',
    title: 'Haldenduell',
    ranks: [
      [12000, 'Haldenkönig', 'Keine Wespe traut sich mehr auf den Berg.'],
      [8000, 'Windflüsterer', 'Du liest den Wind wie die Zeitung.'],
      [5000, 'Augenwerfer', 'Ein Blick geworfen, Wespe getroffen.'],
      [3000, 'Honigkanone', 'Die Wespen ducken sich schon.'],
      [1800, 'Parabel-Profi', 'Dein Mathelehrer wäre stolz.'],
      [900, 'Kamelle-Werfer', 'Wie beim Rosenmontagszug.'],
      [300, 'Dosenwerfer', 'Dose auf Dose klappert.'],
      [0, 'Handtuchwerfer', 'Nicht gleich das Handtuch werfen. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1B1838'); gr.addColorStop(0.6, '#5A2E48'); gr.addColorStop(1, '#C2603A');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(70,140,170,0.9)'; g.fillRect(0, h * 0.88, w, h * 0.12);
      g.beginPath(); g.moveTo(0, h);
      for (var x = 0; x <= w; x += 4) { var u = x / w; g.lineTo(x, h * 0.66 - Math.exp(-Math.pow((u - 0.5) / 0.14, 2)) * h * 0.22 + Math.sin(u * 9) * 4 + (u < 0.05 || u > 0.95 ? h * 0.3 : 0)); }
      g.lineTo(w, h); g.closePath(); g.fillStyle = '#4A3420'; g.fill(); g.strokeStyle = '#8DB04A'; g.lineWidth = 3; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.85)';
      for (var t = 0; t <= 1; t += 0.08) { var px = w * 0.2 + t * w * 0.6, py = h * 0.5 - Math.sin(t * Math.PI) * h * 0.38; g.beginPath(); g.arc(px, py, 1.8, 0, TAU); g.fill(); }
      g.save(); g.translate(w * 0.62, h * 0.18); g.rotate(0.5); rr(g, -6, -5, 12, 12, 3); g.fillStyle = '#E9A800'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.5; g.stroke(); g.restore();
      g.save(); g.translate(w * 0.16, h * 0.5); g.scale(0.55, 0.55); art.bee(g, 0.4); g.restore();
      g.save(); g.translate(w * 0.84, h * 0.5); g.scale(-0.5, 0.5); art.wasp(g, 0.4); g.restore();
    }
  });
})();

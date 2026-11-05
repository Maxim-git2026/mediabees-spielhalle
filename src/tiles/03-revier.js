/* Kachel: Revierflug */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'revier',
    title: 'Revierflug',
    ranks: [
      [60, 'Revier-Legende', 'Einmal quer durchs Revier!'],
      [30, 'Pendler-Biene', 'Die A40 ist nix dagegen.'],
      [10, 'Ausflugs-Biene', 'Schöne Tour.'],
      [0, 'Bruchpilot', 'Anschnallen und nochmal.']
    ],
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#0B0E1F'); gr.addColorStop(0.7, '#1B1F3A'); gr.addColorStop(1, '#3A2A3F');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var r = art.rng(5);
      g.fillStyle = '#fff';
      for (var i = 0; i < 30; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillRect(r() * w, r() * h * 0.6, 1.5, 1.5); }
      g.globalAlpha = 1;
      g.beginPath(); g.arc(w * 0.85, h * 0.2, h * 0.09, 0, TAU); g.fillStyle = '#F4EBC9'; g.fill();
      g.save(); g.scale(h / 600, h / 600);
      art.skyline(g, 0, w * 600 / h, 540, '#1E2340', art.rng(21), '#FDC506');
      g.restore();
      g.fillStyle = '#0F1016'; g.fillRect(0, h * 0.9, w, h * 0.1);
      function tower(x, top) {
        g.strokeStyle = '#4A5161'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(x - 14, h * 0.9); g.lineTo(x - 4, top + 10); g.moveTo(x + 14, h * 0.9); g.lineTo(x + 4, top + 10); g.stroke();
        g.strokeStyle = '#A3ABBF'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, top + 6, 8, 0, TAU); g.stroke();
      }
      tower(w * 0.55, h * 0.55); tower(w * 0.82, h * 0.45);
      g.fillStyle = '#2B303B'; g.fillRect(w * 0.55 - 14, 0, 28, h * 0.22); g.fillStyle = '#FDC506'; g.fillRect(w * 0.55 - 16, h * 0.22, 32, 5);
      g.save(); g.translate(w * 0.3, h * 0.42); g.rotate(-0.25); g.scale(h / 90, h / 90); art.bee(g, 0.6); g.restore();
    }
  });
})();

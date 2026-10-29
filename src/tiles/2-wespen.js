/* Kachel: Bienenstich */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'wespen',
    title: 'Bienenstich',
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#1E1630'); gr.addColorStop(0.5, '#6E2E3A'); gr.addColorStop(0.85, '#D9731F'); gr.addColorStop(1, '#FDC506');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.beginPath(); g.arc(w * 0.72, h * 0.78, h * 0.16, 0, TAU); g.fillStyle = '#FFF1B8'; g.fill();
      g.save(); g.scale(h / 600, h / 600);
      art.halde(g, 0.22 * w * 600 / h, 600, 420, 190, '#2B1622');
      g.restore();
      g.fillStyle = '#151515'; g.fillRect(0, h * 0.9, w, h * 0.1);
      g.save(); g.translate(w * 0.42, h * 0.42); g.scale(h / 75, h / 75); art.wasp(g, 0.7); g.restore();
      g.save(); g.translate(w * 0.8, h * 0.28); g.scale(-h / 160, h / 160); art.bee(g, 0.5); g.restore();
      var cx = w * 0.42 - h * 0.08, cy = h * 0.43, r = h * 0.14;
      g.strokeStyle = '#fff'; g.lineWidth = 2;
      g.beginPath(); g.arc(cx, cy, r, 0, TAU);
      g.moveTo(cx - r - 6, cy); g.lineTo(cx - 4, cy); g.moveTo(cx + 4, cy); g.lineTo(cx + r + 6, cy);
      g.moveTo(cx, cy - r - 6); g.lineTo(cx, cy - 4); g.moveTo(cx, cy + 4); g.lineTo(cx, cy + r + 6); g.stroke();
    }
  });
})();

/* Kachel: Honigflipper */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'flipper',
    title: 'Honigflipper',
    ranks: [
      [150000, 'Flipperkönigin', 'Der Tisch gehört dir. Tilt? Nie gehört.'],
      [80000, 'Bumperbaronin', 'Die Honigtöpfe glühen noch.'],
      [40000, 'Kugelflüsterin', 'Die Kugel macht, was du willst.'],
      [20000, 'Multiplikatorin', 'Da klingelt die Kasse.'],
      [10000, 'Bahnenbiene', 'Die Bahnen oben kennst du.'],
      [5000, 'Flipperbiene', 'Die ersten Kombos sitzen.'],
      [1500, 'Kugelschubserin', 'Ein paar Bumper getroffen.'],
      [0, 'Abflussbiene', 'Die Kugel war schneller. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3A2608'); gr.addColorStop(1, '#22160A');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var y = 0; y < h + 20; y += 18) for (var x = (y / 18) % 2 ? 10 : 0; x < w + 20; x += 20) art.hex(g, x, y, 9, null, 'rgba(253,197,6,0.08)', 1);
      var u = h / 10;
      [[w * 0.32, u * 3.2], [w * 0.68, u * 3.2], [w * 0.5, u * 5.4]].forEach(function (p, i) {
        var gl = g.createRadialGradient(p[0], p[1], 2, p[0], p[1], u * 2.2);
        gl.addColorStop(0, i === 2 ? 'rgba(255,230,128,0.7)' : 'rgba(253,197,6,0.35)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
        g.fillStyle = gl; g.fillRect(p[0] - u * 2.2, p[1] - u * 2.2, u * 4.4, u * 4.4);
        g.beginPath(); g.arc(p[0], p[1], u * 1.1, 0, TAU); g.fillStyle = i === 2 ? '#FFE680' : '#E9A800'; g.fill();
        g.lineWidth = 3; g.strokeStyle = '#FDC506'; g.stroke();
        g.beginPath(); g.arc(p[0], p[1], u * 0.55, 0, TAU); g.fillStyle = '#7A4A1A'; g.fill();
      });
      g.lineCap = 'round';
      [[w * 0.5 - u * 3.4, u * 8.6, 0.45], [w * 0.5 + u * 3.4, u * 8.6, Math.PI + 0.1]].forEach(function (f) {
        var ex = f[0] + Math.cos(f[2]) * u * 2.8, ey = f[1] + Math.sin(f[2]) * u * 2.8;
        g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(ex, ey); g.strokeStyle = '#111'; g.lineWidth = u * 0.9; g.stroke();
        g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(ex, ey); g.strokeStyle = '#FDC506'; g.lineWidth = u * 0.65; g.stroke();
      });
      var bx = w * 0.58, by = u * 7.2, bgr = g.createRadialGradient(bx - 2, by - 2, 1, bx, by, u * 0.5);
      bgr.addColorStop(0, '#FFFFFF'); bgr.addColorStop(0.4, '#D8DCE4'); bgr.addColorStop(1, '#6B7385');
      g.beginPath(); g.arc(bx, by, u * 0.5, 0, TAU); g.fillStyle = bgr; g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(bx - u * 0.9, by + u * 0.9); g.lineTo(bx - u * 1.8, by + u * 1.8); g.stroke();
    }
  });
})();

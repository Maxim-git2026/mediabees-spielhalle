/* Kachel: Käfer-Jagd */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'bugjagd',
    title: 'Käfer-Jagd',
    thumb: function (g, w, h) {
      var art = MBArcade.art, TAU = Math.PI * 2;
      g.fillStyle = '#111'; g.fillRect(0, 0, w, h);
      var r = h * 0.2, dx = r * Math.sqrt(3), cx0 = w / 2 - dx, cy0 = h / 2 - r * 1.5;
      for (var row = 0; row < 3; row++) for (var col = -1; col < 4; col++) {
        art.hex(g, cx0 + col * dx + (row % 2 ? dx / 2 : 0), cy0 + row * r * 1.5, r - 3, '#1A1A1A', '#363636', 3);
      }
      function bug(x, y, s, body) {
        g.save(); g.translate(x, y); g.scale(s, s);
        g.strokeStyle = '#111'; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(-10, -4); g.lineTo(-18, -9); g.moveTo(-10, 5); g.lineTo(-19, 5); g.moveTo(-9, 13); g.lineTo(-16, 19);
        g.moveTo(10, -4); g.lineTo(18, -9); g.moveTo(10, 5); g.lineTo(19, 5); g.moveTo(9, 13); g.lineTo(16, 19); g.stroke();
        g.beginPath(); g.arc(0, -14, 7, 0, TAU); g.fillStyle = '#111'; g.fill();
        g.beginPath(); g.ellipse(0, 4, 13, 16, 0, 0, TAU); g.fillStyle = body; g.fill(); g.lineWidth = 2.5; g.stroke();
        g.beginPath(); g.moveTo(0, -11); g.lineTo(0, 20); g.stroke();
        g.restore();
      }
      art.hex(g, cx0 + dx, cy0 + r * 1.5 + 0, r - 3, '#1A1A1A', '#FDC506', 3);
      bug(cx0 + dx, cy0 + r * 1.5, h / 110, '#D3272F');
      bug(cx0 + 2 * dx + dx / 2 + dx / 2, cy0, h / 150, '#FDC506');
    }
  });
})();

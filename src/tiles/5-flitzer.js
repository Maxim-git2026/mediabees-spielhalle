/* Kachel: A40-Flitzer */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'flitzer',
    title: 'A40-Flitzer',
    ranks: [
      [5000, 'Autobahn-Legende', 'Einmal Venlo und zurück!'],
      [2500, 'Ruhrschnellweg-Profi', 'Der Feierabendverkehr hat keine Chance.'],
      [1000, 'Pendler-Biene', 'Schöne Fahrt.'],
      [0, 'Blechschaden', 'Anschnallen und nochmal.']
    ],
    thumb: function (g, w, h) {
      g.fillStyle = '#132219'; g.fillRect(0, 0, w, h);
      var r = art.rng(9);
      for (var i = 0; i < 14; i++) {
        var tx = r() < 0.5 ? r() * w * 0.16 : w - r() * w * 0.16, ty = r() * h, tr = h * (0.05 + r() * 0.05);
        g.fillStyle = '#1C3A25'; g.beginPath(); g.arc(tx, ty, tr, 0, TAU); g.fill();
        g.fillStyle = '#28502F'; g.beginPath(); g.arc(tx - tr * 0.25, ty - tr * 0.25, tr * 0.55, 0, TAU); g.fill();
      }
      var lw = Math.min(w * 0.17, h * 0.3), L = w / 2 - lw * 2, R = w / 2 + lw * 2, s = lw / 84;
      g.fillStyle = '#2A2D35'; g.fillRect(L - 6, 0, R - L + 12, h);
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(L, 0, 2, h); g.fillRect(R - 2, 0, 2, h);
      g.fillStyle = 'rgba(255,255,255,0.6)';
      for (var b = 1; b < 4; b++) for (var y = -10; y < h; y += h * 0.22) g.fillRect(L + b * lw - 1, y, 2, h * 0.11);
      function lane(i) { return L + (i + 0.5) * lw; }
      function car(i, y, body, roof) { g.save(); g.translate(lane(i), y); g.scale(s, s); art.car(g, body, roof); g.restore(); }
      car(0, h * 0.25, '#2F6FD0', '#4C86E0');
      car(2, h * 0.12, '#D3272F', '#E04A50');
      car(3, h * 0.48, '#C8CDD6', '#E3E6EC');
      var px = lane(1) + lw * 0.3, py = h * 0.74;
      var cone = g.createLinearGradient(0, py - 37 * s, 0, py - 200 * s);
      cone.addColorStop(0, 'rgba(255,240,190,0.35)'); cone.addColorStop(1, 'rgba(255,240,190,0)');
      g.fillStyle = cone; g.beginPath();
      g.moveTo(px - 16 * s, py - 37 * s); g.lineTo(px + 16 * s, py - 37 * s); g.lineTo(px + 50 * s, py - 200 * s); g.lineTo(px - 50 * s, py - 200 * s); g.closePath(); g.fill();
      g.save(); g.translate(px, py); g.rotate(0.2); g.scale(s, s); art.flitzer(g, 0.7); g.restore();
      g.fillStyle = 'rgba(255,255,255,0.3)';
      for (var k = 0; k < 5; k++) g.fillRect(L + 6 + k * 9, (k * 37) % h, 2, h * 0.18);
    }
  });
})();

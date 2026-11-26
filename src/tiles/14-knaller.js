/* Kachel: Honigknaller */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art, rr = art.rrect;
  MBArcade.tile({
    id: 'knaller',
    title: 'Bienenboom',
    ranks: [
      [12000, 'Bombenerfolg', 'Der Stock gehört dir.'],
      [8000, 'Granate', 'Du bist echt \'ne Granate.'],
      [5000, 'Bombig', 'Läuft bei dir.'],
      [3000, 'Kawumm-Biene', 'Da wackeln die Waben.'],
      [1500, 'Zündstoff', 'Langsam wird\'s explosiv.'],
      [800, 'Knallkopf', 'Erst zünden, dann denken.'],
      [300, 'Rohrkrepierer', 'Selbst hochgegangen? Passiert.'],
      [0, 'Blindgänger', 'Ist nicht hochgegangen. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var c = h / 5, cols = Math.ceil(w / c);
      for (var y = 0; y < 5; y++) for (var x = 0; x < cols; x++) {
        var X = x * c, Y = y * c, hard = y === 0 || y === 4 || (x % 2 === 0 && y % 2 === 0), soft = !hard && (x * 7 + y * 3) % 5 === 0 && x > 2;
        g.fillStyle = hard ? '#3A3226' : (x + y) % 2 ? '#2A2312' : '#2E2614'; g.fillRect(X, Y, c + 0.5, c + 0.5);
        if (hard) art.hex(g, X + c / 2, Y + c / 2, c * 0.4, '#4A4030', null);
        if (soft) { rr(g, X + 2, Y + 2, c - 4, c - 4, 4); g.fillStyle = '#E9A800'; g.fill(); }
      }
      var fx = c * 4.5, fy = c * 2.5;
      [[0, 0], [1, 0], [2, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var X = fx + d[0] * c, Y = fy + d[1] * c, gr = g.createRadialGradient(X, Y, 1, X, Y, c * 0.65);
        gr.addColorStop(0, 'rgba(255,246,214,1)'); gr.addColorStop(0.5, 'rgba(255,210,74,0.95)'); gr.addColorStop(1, 'rgba(255,90,26,0)');
        g.fillStyle = gr; g.fillRect(X - c, Y - c, c * 2, c * 2);
      });
      g.save(); g.translate(c * 1.5, c * 1.5); g.scale(c / 55, c / 55); art.bee(g, 0.5); g.restore();
      g.save(); g.translate(c * 6.5, c * 1.5); g.scale(-c / 70, c / 70); art.wasp(g, 0.5); g.restore();
      g.beginPath(); g.arc(c * 2.5, c * 3.55, c * 0.32, 0, TAU); g.fillStyle = '#2A2018'; g.fill(); g.fillStyle = '#FDC506'; g.fillRect(c * 2.18, c * 3.5, c * 0.64, c * 0.1);
    }
  });
})();

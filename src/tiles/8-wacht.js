/* Kachel: Wabenwacht */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'wacht',
    title: 'Wabenwacht',
    ranks: [
      [6000, 'Königinnen-Garde', 'Der Stock ist sicher!'],
      [3000, 'Wächterbiene', 'Keine Wespe kommt durch.'],
      [1000, 'Stachel-Azubi', 'Gut gezielt.'],
      [0, 'Wespenfutter', 'Die Wespen feiern. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#07091A'); gr.addColorStop(1, '#2A1E33');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      var r = art.rng(3);
      g.fillStyle = '#fff';
      for (var i = 0; i < 30; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillRect(r() * w, r() * h * 0.8, 1.5, 1.5); }
      g.globalAlpha = 1;
      var s = h / 150, cols = Math.max(4, Math.floor(w / (h * 0.24)));
      for (var row = 0; row < 3; row++) for (var c = 0; c < cols; c++) {
        var x = w * (c + 0.5) / cols + (row % 2 ? 4 : -4), y = h * (0.14 + row * 0.15);
        g.save(); g.translate(x, y); g.rotate(Math.PI / 2); g.scale(s, s);
        if (row === 0) art.hornet(g, 0.5); else art.wasp(g, (c % 2) ? 0.2 : 0.8, row === 2 ? '#FF8A3D' : undefined, row === 2 ? '#2A1408' : undefined);
        g.restore();
      }
      [0.25, 0.5, 0.75].forEach(function (fx) {
        for (var k = 0; k < 5; k++) art.hex(g, w * fx - 12 + k * 6, h * 0.72 + (k % 2) * 4, 4, '#F2B705', 'rgba(0,0,0,0.5)', 1);
      });
      var bx = w * 0.42, by = h * 0.88;
      g.fillStyle = '#FDC506';
      [[bx, by - h * 0.2], [bx, by - h * 0.42]].forEach(function (p) { g.beginPath(); g.moveTo(p[0], p[1] - 6); g.lineTo(p[0] + 2.5, p[1] + 2); g.lineTo(p[0] - 2.5, p[1] + 2); g.closePath(); g.fill(); });
      g.save(); g.translate(bx, by); g.rotate(-Math.PI / 2); g.scale(h / 140, h / 140); art.bee(g, 0.6); g.restore();
    }
  });
})();

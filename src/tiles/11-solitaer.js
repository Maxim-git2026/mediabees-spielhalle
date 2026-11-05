/* Kachel: Bienen-Solitär */
(function () {
  'use strict';
  var art = MBArcade.art, rr = art.rrect;
  MBArcade.tile({
    id: 'solitaer',
    title: 'Bienen-Solitär',
    ranks: [
      [3000, 'Kartenkönigin', 'Schneller sortiert als gemischt.'],
      [2500, 'Solitär-Ass', 'Blitzsauber sortiert!'],
      [2000, 'Stapelprofi', 'Alles an seinem Platz.'],
      [1500, 'Sortiertalent', 'Fast alles im Griff.'],
      [900, 'Kartenbiene', 'Gut gemischt.'],
      [500, 'Stapelbiene', 'Die ersten Reihen liegen.'],
      [200, 'Kartenzähler', 'Ein paar Karten sitzen.'],
      [0, 'Mischmasch', 'Die Karten waren gemein. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var bg = g.createRadialGradient(w / 2, h * 0.4, 5, w / 2, h * 0.4, w * 0.7);
      bg.addColorStop(0, '#1F4A2C'); bg.addColorStop(1, '#0F2617');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      var cw = h * 0.42, ch = cw * 1.4;
      function face(x, y, rank, red, rot) {
        g.save(); g.translate(x, y); g.rotate(rot);
        rr(g, -cw / 2, -ch / 2, cw, ch, cw * 0.1); g.fillStyle = '#FFF8E6'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#111'; g.stroke();
        g.font = '800 ' + cw * 0.32 + 'px Poppins, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = red ? '#C0262F' : '#1A1A1A';
        g.fillText(rank, -cw / 2 + cw * 0.08, -ch / 2 + cw * 0.05);
        if (rank === 'K') { g.translate(0, ch * 0.1); g.scale(cw / 80, cw / 80); art.queen(g, 0.5); }
        else if (red) art.hex(g, 0, ch * 0.08, cw * 0.22, '#E8702A', null);
        else { g.beginPath(); g.ellipse(0, ch * 0.1, cw * 0.15, cw * 0.19, 0, 0, Math.PI * 2); g.fillStyle = '#1E1E1E'; g.fill(); }
        g.restore();
      }
      function back(x, y, rot) {
        g.save(); g.translate(x, y); g.rotate(rot);
        rr(g, -cw / 2, -ch / 2, cw, ch, cw * 0.1); g.fillStyle = '#A8650F'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#111'; g.stroke();
        rr(g, -cw / 2 + 3, -ch / 2 + 3, cw - 6, ch - 6, cw * 0.07); g.strokeStyle = '#FDC506'; g.stroke();
        g.font = '900 ' + cw * 0.28 + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#FDC506'; g.fillText('MB', 0, 0);
        g.restore();
      }
      back(w * 0.2, h * 0.52, -0.2);
      face(w * 0.38, h * 0.48, '7', true, -0.08);
      face(w * 0.56, h * 0.5, 'A', false, 0.06);
      face(w * 0.76, h * 0.47, 'K', true, 0.18);
    }
  });
})();

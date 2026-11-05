/* Kachel: Hummelhopser */
(function () {
  'use strict';
  var art = MBArcade.art, rr = art.rrect;
  MBArcade.tile({
    id: 'hopser',
    title: 'Hummelhopser',
    ranks: [
      [200, 'Unplattbar', 'Kein Auto kriegt dich.'],
      [140, 'Ruhrpott-Hopserin', 'Quer durchs halbe Revier.'],
      [100, 'Rush-Hour-Hummel', 'Feierabendverkehr? Kein Problem.'],
      [70, 'Emscher-Springerin', 'Trockene Füße bewahrt.'],
      [45, 'Ampelflitzerin', 'Flink über die Kreuzung.'],
      [25, 'Zebrastreifen-Profi', 'Die ersten Straßen geschafft.'],
      [10, 'Bordsteinhummel', 'Ein paar Hopser sitzen.'],
      [0, 'Plattgefahren', 'Erst links, dann rechts schauen. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var t = h / 5;
      var rows = ['#67B954', '#3A3D46', '#3A3D46', '#3B7FB8', '#5DAE4B'];
      rows.forEach(function (c, i) { g.fillStyle = c; g.fillRect(0, i * t, w, t + 1); });
      g.fillStyle = 'rgba(255,255,255,0.5)'; for (var x = 0; x < w; x += t) g.fillRect(x + t * 0.15, 2 * t - 1, t * 0.5, 2);
      function car(x, y, c1, c2, dir) { g.save(); g.translate(x, y); g.rotate(dir * Math.PI / 2); g.scale(t / 84, t / 84); art.car(g, c1, c2); g.restore(); }
      car(w * 0.25, t * 1.5, '#D3272F', '#E04A50', 1); car(w * 0.8, t * 1.5, '#2F6FD0', '#4C86E0', 1); car(w * 0.55, t * 2.5, '#F2F2F2', '#FFFFFF', -1);
      rr(g, w * 0.1, t * 3.2, w * 0.3, t * 0.6, t * 0.25); g.fillStyle = '#7A5532'; g.fill(); g.strokeStyle = '#3A2814'; g.lineWidth = 2; g.stroke();
      rr(g, w * 0.6, t * 3.2, w * 0.35, t * 0.6, t * 0.25); g.fillStyle = '#7A5532'; g.fill(); g.stroke();
      [[0.15, 0.5], [0.85, 0.5], [0.9, 4.5]].forEach(function (p) { g.fillStyle = '#2E6B33'; g.beginPath(); g.arc(w * p[0], t * p[1], t * 0.38, 0, Math.PI * 2); g.fill(); });
      g.save(); g.translate(w * 0.5, t * 4.4); g.scale(t / 52, t / 52); art.bumble(g, 0.6); g.restore();
    }
  });
})();

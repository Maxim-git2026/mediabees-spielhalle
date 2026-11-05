/* Kachel: Bienentanz */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'polonaise',
    title: 'Bienentanz',
    ranks: [
      [1000, 'Schwarmkönigin', 'Die ganze Wiese tanzt mit!'],
      [500, 'Tanzprofi', 'Da ist Stimmung in der Bude.'],
      [200, 'Tanzbiene', 'Schöner Schwarm.'],
      [0, 'Mauerblümchen', 'Allein tanzt es sich schlecht. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var c = h / 3.6, ox = (w - Math.ceil(w / c) * c) / 2;
      g.fillStyle = '#0F120E'; g.fillRect(0, 0, w, h);
      for (var y = 0; y * c < h; y++) for (var x = 0; x * c < w + c; x++) {
        g.fillStyle = (x + y) % 2 ? '#1A2416' : '#1E2A19';
        g.fillRect(ox + x * c, y * c, c + 1, c + 1);
      }
      function at(cx, cy) { return [ox + (cx + 0.5) * c, (cy + 0.5) * c]; }
      var f = at(Math.floor(w / c) - 0.6, 0.75);
      var gl = g.createRadialGradient(f[0], f[1], 2, f[0], f[1], c * 0.8);
      gl.addColorStop(0, 'rgba(253,197,6,0.6)'); gl.addColorStop(1, 'rgba(253,197,6,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(f[0], f[1], c * 0.8, 0, TAU); g.fill();
      g.beginPath(); g.arc(f[0], f[1], c * 0.24, 0, TAU); g.fillStyle = '#FDC506'; g.fill();
      g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
      /* Kopf rechts oben, Schlange knickt nach unten links ab */
      var pts = [[2.9, 0.75, 0], [1.9, 0.75, 0], [0.9, 0.75, 0], [0.9, 1.75, -1.57], [0.9, 2.75, -1.57], [-0.1, 2.75, 0]];
      var shift = Math.max(0, Math.floor(w / c / 2) - 2);
      for (var i = pts.length - 1; i >= 0; i--) {
        var q = at(pts[i][0] + shift, pts[i][1]);
        g.save(); g.translate(q[0], q[1]);
        if (i === 0) {
          var hg = g.createRadialGradient(0, 0, 2, 0, 0, c * 0.7);
          hg.addColorStop(0, 'rgba(253,197,6,0.4)'); hg.addColorStop(1, 'rgba(253,197,6,0)');
          g.fillStyle = hg; g.beginPath(); g.arc(0, 0, c * 0.7, 0, TAU); g.fill();
        }
        g.rotate(pts[i][2]);
        if (pts[i][2] < -1) g.scale(1, -1);
        var s = c / (i === 0 ? 46 : 46);
        g.scale(s, s);
        if (i === 0) art.queen(g, 0.6); else art.bee(g, (i % 2) ? 0.2 : 0.8);
        g.restore();
      }
    }
  });
})();

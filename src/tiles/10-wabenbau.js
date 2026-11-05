/* Kachel: Wabenbau */
(function () {
  'use strict';
  var SQ3 = Math.sqrt(3);
  MBArcade.tile({
    id: 'wabenbau',
    title: 'Wabenbau',
    ranks: [
      [40000, 'Wabenwunder', 'Ein Bau für die Ewigkeit.'],
      [15000, 'Baubiene', 'Saubere Reihen.'],
      [4000, 'Wachs-Azubi', 'Der Stock wächst.'],
      [0, 'Wachsklumpen', 'Das wird noch. Nochmal!']
    ],
    thumb: function (g, w, h) {
      g.fillStyle = '#14100A'; g.fillRect(0, 0, w, h);
      var r = h / 9.5, cols = Math.ceil(w / (1.5 * r)) + 1;
      function hex(x, y, rr) { g.beginPath(); for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
      var fill = { '0,4': '#FDC506', '1,4': '#FF9F1A', '2,4': '#FDC506', '3,4': '#5CC46A', '4,4': '#7FD3FF', '5,4': '#FDC506', '6,4': '#FF8AD8', '7,4': '#E9A800', '8,4': '#FDC506', '9,4': '#FF9F1A',
        '0,3': '#E9A800', '1,3': '#5CC46A', '3,3': '#FF8AD8', '4,3': '#FDC506', '6,3': '#7FD3FF', '7,3': '#FDC506', '9,3': '#5CC46A', '2,3': '#FF9F1A',
        '4,1': '#FF8AD8', '4,0': '#FF8AD8', '5,1': '#FF8AD8', '5,0': '#FF8AD8' };
      for (var c = 0; c < cols; c++) for (var rw = 0; rw < 5; rw++) {
        var x = r + c * 1.5 * r - r * 0.5, y = SQ3 * r * (rw + 0.5) + (c & 1 ? SQ3 * r / 2 : 0) - r * 0.2, f = fill[c + ',' + rw];
        hex(x, y, r * 0.93);
        g.fillStyle = f || '#221C0E'; g.fill();
        g.lineWidth = f ? 1.6 : 1; g.strokeStyle = f ? '#111' : 'rgba(253,197,6,0.15)'; g.stroke();
        if (f) { g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.4, r * 0.2, r * 0.1, -0.4, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill(); }
      }
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, SQ3 * r * 4.5 + r * 0.6); g.lineTo(w, SQ3 * r * 4.5 + r * 0.6); g.stroke();
    }
  });
})();

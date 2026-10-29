/* Kachel: Wespennest */
(function () {
  'use strict';
  var TAU = Math.PI * 2, SQ3 = Math.sqrt(3), art = MBArcade.art;
  MBArcade.tile({
    id: 'nester',
    title: 'Wespennest',
    ranks: [
      [2500, 'Spürbiene', 'Kein Nest bleibt unentdeckt.'],
      [1000, 'Späherbiene', 'Gute Nase für Wespen.'],
      [300, 'Sammelbiene', 'Ordentlich aufgedeckt.'],
      [0, 'Gestochen', 'Autsch. Nochmal!']
    ],
    thumb: function (g, w, h) {
      g.fillStyle = '#14120E'; g.fillRect(0, 0, w, h);
      var r = h / 6.2, nums = { '2,1': 1, '3,1': 2, '1,2': 1, '4,2': 3, '2,3': 2, '3,3': 1 };
      function hex(x, y, rr) { g.beginPath(); for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
      var cols = Math.ceil(w / (SQ3 * r)) + 1;
      for (var y = 0; y < 5; y++) for (var x = 0; x < cols; x++) {
        var cx = SQ3 * r * (x + (y % 2 ? 0.5 : 0)) - r * 0.4, cy = r * 0.7 + 1.5 * r * y, key = x + ',' + y;
        var open = (x >= 1 && x <= 4 && y >= 1 && y <= 3);
        hex(cx, cy, r * 0.93);
        g.fillStyle = open ? '#6A5012' : '#2C2822'; g.fill();
        g.lineWidth = 2; g.strokeStyle = open ? '#4A380C' : '#6B5A2A'; g.stroke();
        if (nums[key]) {
          g.fillStyle = ['', '#5FA8E8', '#5CC46A', '#FF7A6B'][nums[key]]; g.font = '800 ' + r * 0.9 + 'px Poppins, sans-serif';
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(nums[key]), cx, cy + 1);
        }
        if (key === '5,2') {
          g.fillStyle = '#E5322D'; g.beginPath(); g.moveTo(cx - r * 0.2, cy - r * 0.45); g.lineTo(cx + r * 0.4, cy - r * 0.25); g.lineTo(cx - r * 0.2, cy - r * 0.05); g.fill();
          g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - r * 0.2, cy - r * 0.5); g.lineTo(cx - r * 0.2, cy + r * 0.45); g.stroke();
        }
      }
      var nx = w * 0.8, ny = h * 0.55;
      g.beginPath(); g.ellipse(nx, ny, r * 0.75, r * 0.9, 0, 0, TAU); g.fillStyle = '#B8AE9C'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#111'; g.stroke();
      g.fillStyle = '#111'; g.beginPath(); g.ellipse(nx, ny + r * 0.55, r * 0.2, r * 0.14, 0, 0, TAU); g.fill();
      g.save(); g.translate(w * 0.86, h * 0.22); g.scale(-h / 150, h / 150); art.wasp(g, 0.6); g.restore();
      g.save(); g.translate(w * 0.66, h * 0.86); g.scale(h / 190, h / 190); art.wasp(g, 0.2); g.restore();
    }
  });
})();

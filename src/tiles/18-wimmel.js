/* Kachel: Wimmelpott */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'wimmel',
    title: 'Wimmelpott',
    ranks: [
      [18000, 'Adlerauge', 'Dir entgeht nichts im ganzen Pott.'],
      [12000, 'Spürnase', 'Gefunden, bevor es gesucht wurde.'],
      [8000, 'Detektiv', 'Kombiniert wie im Krimi.'],
      [5000, 'Scharfer Blick', 'Gut hingeschaut.'],
      [3000, 'Heuhaufen-Sucher', 'Die Nadel ist irgendwo hier.'],
      [1500, 'Kühlschrank-Blick', 'Die Butter steht direkt vor dir.'],
      [500, 'Brille vergessen', 'Mit Brille ginge noch mehr.'],
      [0, 'Blindschleiche', 'Tomaten auf den Augen? Nochmal!']
    ],
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1B1838'); gr.addColorStop(0.5, '#3A2450'); gr.addColorStop(0.5, '#2A2238'); gr.addColorStop(1, '#2A2238');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var l = 0; l < w; l += 18) { g.beginPath(); g.arc(l + 9, 7 + Math.sin(l / 30) * 4, 2.2, 0, TAU); g.fillStyle = ['#FDC506', '#FF8AD8', '#7FD3FF'][(l / 18) % 3]; g.fill(); }
      var cols = ['#E5322D', '#2F6FD0', '#FDC506', '#9B59D0', '#FF8AD8'], rg = art.rng(5);
      for (var i = 0; i < 26; i++) {
        var x = rg() * w, y = h * 0.2 + rg() * h * 0.75, k = i % 3;
        g.save(); g.translate(x, y); g.scale(0.32, 0.32);
        if (k === 0) art.bee(g, 0.4); else if (k === 1) art.wasp(g, 0.4); else { g.beginPath(); g.ellipse(0, -6, 14, 18, 0, 0, TAU); g.fillStyle = cols[i % 5]; g.fill(); g.lineWidth = 3; g.strokeStyle = '#111'; g.stroke(); }
        g.restore();
      }
      /* Lupe */
      var lx = w * 0.62, ly = h * 0.52, lr = h * 0.2;
      g.beginPath(); g.arc(lx, ly, lr, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#FDC506'; g.stroke();
      g.lineCap = 'round'; g.lineWidth = 7; g.beginPath(); g.moveTo(lx + lr * 0.72, ly + lr * 0.72); g.lineTo(lx + lr * 1.5, ly + lr * 1.5); g.stroke();
      g.save(); g.translate(lx, ly); g.scale(0.6, 0.6); art.bee(g, 0.4); g.fillStyle = '#111'; g.fillRect(6, -3, 6.5, 5); g.fillRect(13.5, -3, 6.5, 5); g.restore();
    }
  });
})();

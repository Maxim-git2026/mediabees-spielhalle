/* Kachel: Website-Abriss */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'abriss',
    title: 'Website-Abriss',
    ranks: [
      [2000, 'Abriss-Legende', 'Von den alten Seiten ist nichts übrig.'],
      [1000, 'Abrissbiene', 'Ordentlich Kleinholz gemacht.'],
      [400, 'Heimwerkerbiene', 'Da wackelt schon einiges.'],
      [0, 'Staubwedel', 'Die alte Seite steht noch. Nochmal!']
    ],
    thumb: function (g, w, h) {
      g.fillStyle = '#0E0E10'; g.fillRect(0, 0, w, h);
      var x = w * 0.06, y = h * 0.08, ww = w * 0.88, hh = h * 0.84;
      g.fillStyle = '#C0C0C0'; g.fillRect(x, y, ww, hh);
      var tb = g.createLinearGradient(x, 0, x + ww, 0); tb.addColorStop(0, '#000080'); tb.addColorStop(1, '#1084D0');
      g.fillStyle = tb; g.fillRect(x + 3, y + 3, ww - 6, h * 0.08);
      g.fillStyle = '#D3E6C3'; g.fillRect(x + 6, y + h * 0.14, ww - 12, hh - h * 0.17);
      var gr = g.createLinearGradient(x, 0, x + ww, 0);
      ['#E5322D', '#FF8C1A', '#FDC506', '#2E9E4A', '#2F6FD0'].forEach(function (c, i) { gr.addColorStop(i / 4, c); });
      g.font = '700 ' + h * 0.12 + 'px "Comic Sans MS", cursive'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = gr; g.fillText('Willkommen!!!', w * 0.47, y + h * 0.26);
      g.fillStyle = '#FFFF00'; g.fillRect(x + 10, y + h * 0.36, ww - 20, h * 0.08);
      g.fillStyle = '#FFFFFF'; g.fillRect(x + 10, y + h * 0.48, ww * 0.28, h * 0.36);
      g.fillStyle = '#0000EE'; for (var i = 0; i < 4; i++) g.fillRect(x + 16, y + h * (0.53 + i * 0.075), ww * 0.18, 2);
      g.fillStyle = '#FDC506'; g.fillRect(x + ww * 0.34, y + h * 0.48, ww * 0.6, h * 0.16);
      g.save(); g.translate(x + ww * 0.34, y + h * 0.48); g.rotate(0.12); g.fillStyle = '#C0C0C0'; g.fillRect(10, h * 0.22, ww * 0.25, h * 0.12); g.restore();
      g.save(); g.translate(x + ww * 0.78, y + h * 0.78); g.rotate(-0.4); g.fillStyle = '#111'; g.fillRect(-ww * 0.12, -h * 0.06, ww * 0.22, h * 0.12); g.restore();
      function crack(cx, cy, s) {
        g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.5; g.beginPath();
        for (var a = 0; a < TAU; a += 0.8) { g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a + 0.3) * s); g.lineTo(cx + Math.cos(a + 0.2) * s * 1.7, cy + Math.sin(a) * s * 1.7); }
        g.stroke();
      }
      crack(w * 0.62, h * 0.32, h * 0.11); crack(w * 0.3, h * 0.66, h * 0.08);
      var sc = h / 120;
      g.save(); g.translate(w * 0.66, h * 0.32); g.scale(sc, sc); g.rotate(-1.1);
      g.fillStyle = '#9A6332'; g.fillRect(-4, -6, 8, 34); g.strokeStyle = '#111'; g.lineWidth = 2; g.strokeRect(-4, -6, 8, 34);
      g.fillStyle = '#A3ABBF'; g.fillRect(-15, -18, 30, 13); g.strokeRect(-15, -18, 30, 13);
      g.restore();
      for (var p = 0; p < 10; p++) { g.fillStyle = ['#E5322D', '#FDC506', '#C0C0C0'][p % 3]; g.fillRect(w * 0.55 + Math.cos(p) * h * 0.18, h * 0.3 + Math.sin(p * 1.7) * h * 0.12, 4, 4); }
      g.save(); g.translate(w * 0.2, h * 0.3); g.scale(h / 260, h / 260); art.bee(g, 0.6); g.restore();
    }
  });
})();

/* Kachel: Honigdieb */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art, rr = art.rrect;
  MBArcade.tile({
    id: 'honigdieb',
    title: 'Honigdieb',
    ranks: [
      [2200, 'Unfassbar', 'Der Kammerjäger gibt auf.'],
      [1600, 'Meisterdiebin', 'Quer durchs ganze Revier.'],
      [1150, 'Phantom der Halde', 'Nur noch ein Summen in der Nacht.'],
      [800, 'Fluchtkünstlerin', 'Elegant entwischt.'],
      [520, 'Hakenschlägerin', 'Dem Spray immer einen Schritt voraus.'],
      [300, 'Flinkflügel', 'Ganz schön flott.'],
      [120, 'Langfinger', 'Ein paar Straßen weit gekommen.'],
      [0, 'Ertappt', 'Auf frischer Tat. Nochmal!']
    ],
    thumb: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0B0E1F'); gr.addColorStop(1, '#4A2E45');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.save(); g.scale(h / 600, h / 600); art.skyline(g, 0, w * 600 / h, 470, '#1C2140', art.rng(31), '#FDC506'); g.restore();
      g.fillStyle = '#16171F'; g.fillRect(0, h * 0.82, w, h * 0.18);
      g.beginPath(); g.arc(w * 0.82, h * 0.18, h * 0.08, 0, TAU); g.fillStyle = '#F4EBC9'; g.fill();
      rr(g, w * 0.78, h * 0.66, h * 0.1, h * 0.16, 3); g.fillStyle = '#3F4655'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.5; g.stroke();
      g.save(); g.translate(w * 0.5, h * 0.58); g.rotate(-0.3); g.scale(h / 120, h / 120); art.bee(g, 0.6);
      rr(g, -12, 10, 18, 18, 4); g.fillStyle = '#E9A800'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke(); g.restore();
      g.save(); g.translate(w * 0.16, h * 0.82); g.scale(h / 260, h / 260);
      g.strokeStyle = '#1E2A3A'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -40); g.lineTo(14, -2); g.moveTo(0, -40); g.lineTo(-14, -2); g.stroke();
      rr(g, -14, -88, 28, 52, 9); g.fillStyle = '#3F6E9E'; g.fill(); g.beginPath(); g.arc(0, -100, 13, 0, TAU); g.fillStyle = '#F1C9A5'; g.fill();
      rr(g, -24, -84, 12, 34, 5); g.fillStyle = '#FDC506'; g.fill(); g.restore();
    }
  });
})();

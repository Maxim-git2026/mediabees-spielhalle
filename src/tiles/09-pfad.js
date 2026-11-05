/* Kachel: Pollenpfad */
(function () {
  'use strict';
  var TAU = Math.PI * 2, art = MBArcade.art;
  MBArcade.tile({
    id: 'pfad',
    title: 'Pollenpfad',
    ranks: [
      [40000, 'Labyrinth-Legende', 'Du kennst jeden Gang.'],
      [30000, 'Pollen-Legende', 'Kein Pollen bleibt liegen.'],
      [20000, 'Wespen-Fängerin', 'Die Wespen laufen vor dir weg.'],
      [12000, 'Sammelprofi', 'Die Wespen schauen dumm aus der Wäsche.'],
      [7000, 'Labyrinth-Läuferin', 'Zwei Labyrinthe gemeistert.'],
      [4000, 'Flinke Biene', 'Gut gesammelt.'],
      [1500, 'Pollen-Naschkatze', 'Ein paar Pollen geschnappt.'],
      [0, 'Wespenfang', 'Erwischt! Nochmal.']
    ],
    thumb: function (g, w, h) {
      g.fillStyle = '#100E09'; g.fillRect(0, 0, w, h);
      var t = h / 6, cols = Math.ceil(w / t);
      var M = ['#########################', '#.......#.......#.......#', '#.##.##.#.##.##...##.##.#', '#.......o.......#.......#', '#.##.#####.###.##.###.#.#', '#########################'];
      for (var y = 0; y < 6; y++) for (var x = 0; x < cols; x++) {
        var c = M[y][x % 24];
        if (c === '#') {
          g.fillStyle = '#2B2412'; g.fillRect(x * t, y * t, t + 0.5, t + 0.5);
          g.strokeStyle = '#FDC506'; g.lineWidth = 1.6;
          if (y < 5 && M[y + 1][x % 24] !== '#') { g.beginPath(); g.moveTo(x * t, y * t + t - 1); g.lineTo(x * t + t, y * t + t - 1); g.stroke(); }
          if (y > 0 && M[y - 1][x % 24] !== '#') { g.beginPath(); g.moveTo(x * t, y * t + 1); g.lineTo(x * t + t, y * t + 1); g.stroke(); }
        } else if (c === '.' && !(y === 3 && x < 4)) { g.beginPath(); g.arc(x * t + t / 2, y * t + t / 2, t * 0.1, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); }
        else if (c === 'o') {
          var jx = x * t + t / 2, jy = y * t + t / 2, j = t * 0.32;
          g.fillStyle = '#E9A800'; g.strokeStyle = '#111'; g.lineWidth = 1.2;
          g.fillRect(jx - j * 0.8, jy - j * 0.5, j * 1.6, j * 1.4); g.strokeRect(jx - j * 0.8, jy - j * 0.5, j * 1.6, j * 1.4);
          g.fillStyle = '#7A4A1A'; g.fillRect(jx - j * 0.9, jy - j * 0.95, j * 1.8, j * 0.5);
        }
      }
      g.save(); g.translate(t * 3.5, t * 3.5); g.scale(t / 40, t / 40); art.bee(g, 0.6); g.restore();
      g.save(); g.translate(t * 11.5, t * 3.5); g.scale(-t / 52, t / 52); art.wasp(g, 0.5, '#FF5A4A', '#2A0E0A'); g.restore();
      g.save(); g.translate(t * 14.5, t * 1.5); g.scale(-t / 52, t / 52); art.wasp(g, 0.2, '#7FA7D9', '#203050'); g.restore();
    }
  });
})();

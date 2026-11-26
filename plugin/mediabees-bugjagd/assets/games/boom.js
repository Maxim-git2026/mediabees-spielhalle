/* Spiel 19: BOOM 2026 – Ich-Shooter unter Tage (Raycaster-Prinzip der 90er, eigene Figuren, Grafik und Musik)
   Quelle liegt in src/boom/*.js und wird von build.sh zu assets/games/boom.js zusammengefügt. */
(function () {
  'use strict';
  var TAU = Math.PI * 2, PI = Math.PI;
  var art = MBArcade.art;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function irnd(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function angNorm(a) { while (a > PI) a -= TAU; while (a < -PI) a += TAU; return a; }
  /* Farbe im Puffer: 0xAABBGGRR (Little Endian ImageData) */
  function rgb(r, g, b) { return (255 << 24) | (b << 16) | (g << 8) | r; }

  /* Schwierigkeitsgrade */
  var DIFFS = [
    { name: 'Praktikant', sub: 'Halber Schaden, doppelte Munition', dmg: 0.5, speed: 0.85, cool: 1.35, ammo: 2, mult: 0.5 },
    { name: 'Kumpel', sub: 'So ist es gedacht', dmg: 1, speed: 1, cool: 1, ammo: 1, mult: 1 },
    { name: 'Steiger', sub: 'Für Leute mit Grubenerfahrung', dmg: 1.3, speed: 1.12, cool: 0.8, ammo: 1, mult: 1.5 },
    { name: 'Malocher!', sub: 'Albtraum. Wespen auf Koffein', dmg: 1.7, speed: 1.4, cool: 0.55, ammo: 1, mult: 2.2 }
  ];

  /* Waffen: 0 Faust, 1 Stachler, 2 Pollenflinte */
  var WEAPONS = [
    { name: 'Faust', ammo: null, rate: 0.52, range: 1.15 },
    { name: 'Stachler', ammo: 'sta', rate: 0.36, spread: 0.018, pellets: 1, dmin: 5, dmax: 15 },
    { name: 'Pollenflinte', ammo: 'pol', rate: 0.95, spread: 0.1, pellets: 7, dmin: 5, dmax: 15 }
  ];
  var MAXAMMO = { sta: 200, pol: 50 };

  /* Gegner: hp, Tempo (Felder/s), Größe, Flughöhe (Unterkante, Augenhöhe 0,5), Punkte */
  var FOES = {
    1: { key: 'wespe', name: 'Wespe', hp: 30, speed: 2.5, r: 0.28, h: 0.42, z: 0.32, melee: [5, 12], pts: 100, fly: true },
    2: { key: 'wach', name: 'Wach-Wespe', hp: 20, speed: 1.45, r: 0.3, h: 0.5, z: 0.22, shot: [3, 12], pellets: 1, pts: 150, fly: true, drop: 'sta' },
    3: { key: 'flinte', name: 'Flinten-Wespe', hp: 32, speed: 1.4, r: 0.3, h: 0.52, z: 0.2, shot: [3, 9], pellets: 3, pts: 250, fly: true, drop: 'pol' },
    4: { key: 'feuer', name: 'Feuerwespe', hp: 60, speed: 1.6, r: 0.3, h: 0.5, z: 0.28, ball: [8, 20], pts: 300, fly: true },
    5: { key: 'kami', name: 'Kamikaze-Wespe', hp: 14, speed: 3.6, r: 0.27, h: 0.44, z: 0.3, boom: 60, pts: 200, fly: true },
    6: { key: 'milbe', name: 'Varroa-Milbe', hp: 7, speed: 3.1, r: 0.2, h: 0.2, z: 0, melee: [2, 5], pts: 50, fly: false }
  };

  /* Gegenstände: was sie geben */
  var ITEMS = {
    a: { spr: 'sta10', msg: 'Stachel-Bündel', ammo: ['sta', 10] },
    A: { spr: 'sta50', msg: 'Stachel-Kiste', ammo: ['sta', 50] },
    c: { spr: 'pol4', msg: 'Pollenladungen', ammo: ['pol', 4] },
    C: { spr: 'pol20', msg: 'Schachtel Pollenladungen', ammo: ['pol', 20] },
    F: { spr: 'flinteItem', msg: 'Die Pollenflinte! Jetzt wird’s laut.', weapon: 2, ammo: ['pol', 8] },
    G: { spr: 'stachler', msg: 'Stachler aufgehoben', weapon: 1, ammo: ['sta', 5] },
    h: { spr: 'tropfen', msg: 'Honigtropfen', hp: [1, 200], bonus: true },
    j: { spr: 'glas', msg: 'Honigglas', hp: [10, 100] },
    J: { spr: 'topf', msg: 'Honigtopf', hp: [25, 100] },
    u: { spr: 'plaett', msg: 'Wachsplättchen', ar: [1, 200], bonus: true },
    U: { spr: 'panzer', msg: 'Wachs-Panzer!', ar: [100, 100] },
    z: { spr: 'berserk', msg: 'BERSERKER-HONIG! Fäuste raus!', berserk: true, hp: [100, 100] },
    y: { spr: 'lampe', msg: 'Helmlampe! Jetzt siehst du was.', lamp: true },
    r: { spr: 'marke', msg: 'Rote Grubenmarke', key: 'red' },
    q: { spr: 'curry', msg: 'Currywurst Pommes Schranke! Sauber.', hp: [50, 200], pts: 500 }
  };
  /* Feste Dinge: blockieren den Weg oder leuchten */
  var DECOR = { i: { spr: 'stempel', block: true, r: 0.22 }, n: { spr: 'lore', block: true, r: 0.42 }, o: { spr: 'fass', block: true, r: 0.3, barrel: true }, l: { spr: 'licht', block: false, light: true, hang: true } };

  /* Zonen: Grundlicht, Farbton, Boden, Decke */
  var ZONES = {
    c: { light: 0.42, tint: [1, 1, 1], floor: 'gitter', ceil: 'gitter' },
    k: { light: 0.7, tint: [0.92, 1, 1.05], floor: 'fliese', ceil: 'beton', flicker: true },
    s: { light: 0.4, tint: [1.1, 0.95, 0.8], floor: 'dielen', ceil: 'balken' },
    t: { light: 0.12, tint: [1.05, 0.95, 0.85], floor: 'erde', ceil: 'fels' },
    v: { light: 0.04, tint: [1, 0.9, 0.85], floor: 'erde', ceil: 'fels' },
    m: { light: 0.3, tint: [1.15, 0.9, 0.7], floor: 'beton', ceil: 'beton' },
    x: { light: 0.36, tint: [1, 1, 1], floor: 'streifen', ceil: 'beton' },
    a: { light: 0.26, tint: [1.25, 0.7, 0.65], floor: 'platte', ceil: 'traeger', alarm: true },
    g: { light: 0.3, tint: [1.1, 0.95, 0.8], floor: 'beton', ceil: 'fels' },
    r: { light: 0.1, tint: [1, 1, 1], floor: 'erde', ceil: 'fels' }
  };
  /* Level 1 „Einfahrt“: Wände # Fels, T Fliesen, L Spinde, W Holz, B Backstein, M Metall, K Förderkorb, P Poster, X Ausgangsschalter, D Tür, R rote Tür, S Geheimwand
     Gegner 1 Wespe, 2 Wach-Wespe, 3 Flinten-Wespe, 4 Feuerwespe, 5 Kamikaze-Wespe, 6 Varroa-Milbe
     Dinge a Stachel 10, A Stachel 50, c Pollen 4, C Pollen 20, F Pollenflinte, h Honigtropfen, j Honigglas, J Honigtopf, u Wachsplättchen, U Wachs-Panzer,
     z Berserker-Honig, y Helmlampe, r rote Grubenmarke, q Currywurst, o Grubengas-Fass, i Holzstempel, n Lore, l Lampe, p Start */
  var LEVEL1 = {
    name: 'Sohle 1: Einfahrt', par: 240,
    map: [
      '##BBBPBBB#####################BBBBBBBBBB',
      '##B.....B#####################Bc.......B',
      '##B...z.B#######BBBPBBB#######B......r.B',
      '##B.U...B#######B.....B##..1..D....l...B',
      '##B.....B#######B.CJ..B##.####B..4.....B',
      'WWWWWSWWWWW#####B.....B##.####B........B',
      'W.........W########S#####.####B....oo..B',
      'W.......a.W..i......i..2...###B........B',
      'W....l....D.l.hh.1l..1..l..###B........B',
      'W.........W.....i.....i....###B.....4..B',
      'W..2..y.2.W###D#########...###B.2.o....B',
      'Wuu.......W#66...6######...###B.......jB',
      'WWWWWW.WWWW#......######..n###BBBBBBBBBB',
      '######2#####...F..######1..##MMMMMMMMMMM',
      '######l#####......######.l.##M......5..M',
      '######.#####6.c.66######...##M.5..4..5.M',
      '######.#################.3.##M........5M',
      'TTTTTTDTTTTTTTT#########..o##M...i..i..M',
      'T.............T#########i..##M..o......M',
      'T..1.......2..T##MMMMMMM...MMM....l.o..M',
      'T.............T##M...........M...1....5M',
      'T..LLL..LLL...T##M...........M.........M',
      'T......h....a.T##M.2...i.....M...i..i5.M',
      'T....l.h......P##M...l....l..M.........M',
      'T..LLL..LLL...T##P...........R....l1...M',
      'T......h......T##M....1i.....M..o......M',
      'T.j........1..T##M..na.....3.M.......3.M',
      'T.............T##MA..........M.C......JM',
      'TTTKKDKKTTTTTTT##MMMMMMMMMMMMMMSMMDMMMMM',
      '###K...K#####################Bq.K...K###',
      '###K.p.K#####################B.jK...K###',
      '###KKKKK#####################BBBKKXKK###'
    ],
    /* Zonen: c Förderkorb, k Waschkaue, s Lampenstube, t Stollen, v Varroa-Kammer, m Markenraum, x Kreuzung, a Arena, g Geheimraum, r Fels */
    zone: [
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'rrrgggggrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmr',
      'rrrgggggrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmr',
      'rrrgggggrrrrrrrrrgggggrrrtttttrmmmmmmmmr',
      'rrrgggggrrrrrrrrrgggggrrrtrrrrrmmmmmmmmr',
      'rrrrrrrrrrrrrrrrrgggggrrrtrrrrrmmmmmmmmr',
      'rsssssssssrrrrrrrrrrrrrrrtrrrrrmmmmmmmmr',
      'rsssssssssrttttttttttttttttrrrrmmmmmmmmr',
      'rsssssssssrttttttttttttttttrrrrmmmmmmmmr',
      'rsssssssssrttttttttttttttttrrrrmmmmmmmmr',
      'rsssssssssrrrrrrrrrrrrrrtttrrrrmmmmmmmmr',
      'rsssssssssrrvvvvvvrrrrrrtttrrrrmmmmmmmmr',
      'rrrrrrtrrrrrvvvvvvrrrrrrtttrrrrrrrrrrrrr',
      'rrrrrrtrrrrrvvvvvvrrrrrrtttrrrrrrrrrrrrr',
      'rrrrrrtrrrrrvvvvvvrrrrrrtttrrraaaaaaaaar',
      'rrrrrrtrrrrrvvvvvvrrrrrrtttrrraaaaaaaaar',
      'rrrrrrtrrrrrrrrrrrrrrrrrtttrrraaaaaaaaar',
      'rrrrrrrrrrrrrrrrrrrrrrrrtttrrraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrrrrrrrtttrrraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrrrrrrrtttrrraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rkkkkkkkkkkkkkrrrrxxxxxxxxxxxraaaaaaaaar',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'rrrrcccrrrrrrrrrrrrrrrrrrrrrrrggrcccrrrr',
      'rrrrcccrrrrrrrrrrrrrrrrrrrrrrrggrcccrrrr',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'
    ]
  };
  var LEVELS = [LEVEL1];

  /* Pixel-Schrift 3×5 für die Statusleiste (wie früher) */
  var FONT = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
    ',': '000000000010100', '’': '010010100000000', "'": '010010000000000', '„': '000000000101101', '“': '101101000000000', '(': '010100100100010', ')': '010001001001010', '+': '000010111010000', '×': '000101010101000', '#': '101111101111101',
    '%': '101001010100101', '/': '001001010100100', ':': '000010000010000', '.': '000000000000010', '-': '000000111000000', '!': '010010010000010', ' ': '000000000000000',
    'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110', 'E': '111100110100111', 'F': '111100110100100',
    'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'J': '001001001101010', 'K': '101101110101101', 'L': '100100100100111',
    'M': '101111101101101', 'N': '110101101101101', 'O': '010101101101010', 'P': '110101110100100', 'Q': '010101101110011', 'R': '110101110101101',
    'S': '011100010001110', 'T': '111010010010010', 'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101',
    'Y': '101101010010010', 'Z': '111001010100111', 'Ä': '101010101111101', 'Ö': '101010101101010', 'Ü': '101000101101111', '?': '111001010000010'
  };
  /* Text in Pixel-Schrift auf einen 2D-Kontext (Kleinbuchstaben werden groß) */
  function pixText(g, text, x, y, s, color, align) {
    text = String(text).toUpperCase();
    var w = text.length * 4 * s - s;
    if (align === 'center') x -= w / 2; else if (align === 'right') x -= w;
    g.fillStyle = color;
    for (var i = 0; i < text.length; i++) {
      var gl = FONT[text[i]] || FONT['?'];
      for (var k = 0; k < 15; k++) if (gl[k] === '1') g.fillRect(Math.round(x + (i * 4 + k % 3) * s), Math.round(y + Math.floor(k / 3) * s), s, s);
    }
    return w;
  }

  /* Level-Codes wie früher: nichts wird auf dem Gerät gespeichert */
  var CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var CODE_WORDS = ['KOHLE', 'WABE', 'STOLLEN', 'HONIG', 'KUMPEL', 'STEIGER', 'GLUECK', 'SCHACHT'];
  var CODE_KEY = [19, 7, 28, 3, 11, 25, 14, 30, 5, 22];
  function codeBits(fields) {
    var bits = [];
    fields.forEach(function (f) { for (var i = f[1] - 1; i >= 0; i--) bits.push((f[0] >> i) & 1); });
    return bits;
  }
  function codeSum(bits) { var s = 0; bits.forEach(function (b, i) { if (b) s = (s + i * 7 + 3) % 512; }); return s; }
  function makeCode(d) {
    var bits = codeBits([[d.level, 3], [d.diff, 2], [d.weapons, 3], [clamp(d.hp, 1, 200), 8], [clamp(d.ar, 0, 200), 8], [clamp(d.sta, 0, 200), 8], [clamp(d.pol, 0, 50), 6], [d.unlock ? 1 : 0, 1]]);
    var sum = codeSum(bits);
    bits = bits.concat(codeBits([[sum, 9]]));
    while (bits.length % 5) bits.push(0);
    var out = '';
    for (var i = 0; i < bits.length; i += 5) {
      var v = 0; for (var k = 0; k < 5; k++) v = v * 2 + bits[i + k];
      out += CODE_ABC[(v ^ CODE_KEY[(i / 5) % CODE_KEY.length]) & 31];
    }
    return CODE_WORDS[sum % 8] + '-' + out.slice(0, 5) + '-' + out.slice(5);
  }
  function readCode(str) {
    var parts = String(str || '').toUpperCase().replace(/Ü/g, 'UE').replace(/[^A-Z0-9-]/g, '').split('-').filter(Boolean);
    if (parts.length < 2) return null;
    var word = parts[0], body = parts.slice(1).join('');
    if (body.length !== 10) return null;
    var bits = [];
    for (var i = 0; i < body.length; i++) {
      var v = CODE_ABC.indexOf(body[i]); if (v < 0) return null;
      v = (v ^ CODE_KEY[i % CODE_KEY.length]) & 31;
      for (var k = 4; k >= 0; k--) bits.push((v >> k) & 1);
    }
    var pos = 0;
    function take(n) { var v = 0; for (var j = 0; j < n; j++) v = v * 2 + bits[pos++]; return v; }
    var d = { level: take(3), diff: take(2), weapons: take(3), hp: take(8), ar: take(8), sta: take(8), pol: take(6), unlock: !!take(1) };
    var sum = take(9);
    if (codeSum(bits.slice(0, 39)) !== sum || CODE_WORDS[sum % 8] !== word) return null;
    if (d.hp < 1 || d.hp > 200 || d.ar > 200 || d.sta > 200) return null;
    return d;
  }

  /* ------------------------------------------------------------------ Texturen (64 × 64, im Code gezeichnet) */
  var TS = 64;
  function texCanvas(draw) {
    var c = document.createElement('canvas'); c.width = TS; c.height = TS;
    var g = c.getContext('2d');
    draw(g, art.rng(Math.floor(Math.random() * 1e6)));
    return new Uint32Array(g.getImageData(0, 0, TS, TS).data.buffer);
  }
  function noise(g, rg, n, cols, a) {
    for (var i = 0; i < n; i++) { g.globalAlpha = (a || 0.25) * rg(); g.fillStyle = cols[Math.floor(rg() * cols.length)]; g.fillRect(Math.floor(rg() * TS), Math.floor(rg() * TS), 1 + Math.floor(rg() * 2), 1 + Math.floor(rg() * 2)); }
    g.globalAlpha = 1;
  }
  function rivet(g, x, y) { g.fillStyle = '#2A2A2A'; g.fillRect(x, y, 3, 3); g.fillStyle = '#B8BCC4'; g.fillRect(x, y, 2, 2); }

  function makeTextures() {
    var T = {};
    /* Fels mit Kohleflöz und Holzverbau */
    T['#'] = texCanvas(function (g, rg) {
      g.fillStyle = '#4A4038'; g.fillRect(0, 0, TS, TS);
      noise(g, rg, 900, ['#2E2722', '#5C5046', '#6B5E52', '#3A322C'], 0.8);
      g.fillStyle = '#16120F'; g.fillRect(0, 26, TS, 7); noise(g, rg, 60, ['#000', '#2B2B33', '#55555F'], 0.9);
      g.fillStyle = 'rgba(120,120,140,0.35)'; for (var i = 0; i < 8; i++) g.fillRect(Math.floor(rg() * TS), 27 + Math.floor(rg() * 5), 2, 1);
      /* Stempel links und rechts, Kappe oben */
      g.fillStyle = '#6B4A26'; g.fillRect(0, 0, 7, TS); g.fillRect(57, 0, 7, TS); g.fillRect(0, 0, TS, 6);
      g.fillStyle = '#4A3218'; g.fillRect(6, 0, 1, TS); g.fillRect(57, 0, 1, TS); g.fillRect(0, 6, TS, 1);
      g.fillStyle = '#8A6232'; g.fillRect(1, 0, 1, TS); g.fillRect(59, 0, 1, TS); g.fillRect(0, 1, TS, 1);
    });
    /* Fliesen der Waschkaue */
    T.T = texCanvas(function (g, rg) {
      g.fillStyle = '#7C8A86'; g.fillRect(0, 0, TS, TS);
      for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
        var low = y >= 5, base = low ? [74, 110, 98] : [206, 214, 206], d = Math.floor(rg() * 18) - 9;
        g.fillStyle = 'rgb(' + (base[0] + d) + ',' + (base[1] + d) + ',' + (base[2] + d) + ')';
        g.fillRect(x * 8 + 1, y * 8 + 1, 7, 7);
        if (rg() < 0.06) { g.fillStyle = '#5A625E'; g.fillRect(x * 8 + 2, y * 8 + 3, 5, 1); g.fillRect(x * 8 + 4, y * 8 + 1, 1, 6); }
      }
      g.fillStyle = 'rgba(70,50,20,0.35)'; for (var i = 0; i < 6; i++) g.fillRect(Math.floor(rg() * TS), 40 + Math.floor(rg() * 8), 1, 8 + Math.floor(rg() * 16));
    });
    /* Spinde */
    T.L = texCanvas(function (g, rg) {
      for (var i = 0; i < 2; i++) {
        var x = i * 32;
        g.fillStyle = i ? '#5B7186' : '#4F6578'; g.fillRect(x, 0, 32, TS);
        g.fillStyle = '#2B3846'; g.fillRect(x, 0, 1, TS); g.fillRect(x + 31, 0, 1, TS); g.fillRect(x, 0, 32, 2); g.fillRect(x, 62, 32, 2);
        g.fillStyle = '#7F95A8'; g.fillRect(x + 1, 2, 1, 60);
        for (var k = 0; k < 4; k++) { g.fillStyle = '#26323E'; g.fillRect(x + 8, 6 + k * 3, 16, 1); }
        g.fillStyle = '#D9DDE2'; g.fillRect(x + 11, 22, 10, 5); g.fillStyle = '#333'; g.fillRect(x + 13, 24, 6, 1);
        g.fillStyle = '#C9CED6'; g.fillRect(x + 25, 30, 2, 8); g.fillStyle = '#2B3846'; g.fillRect(x + 27, 30, 1, 8);
        if (rg() < 0.7) { g.fillStyle = 'rgba(60,40,20,0.5)'; g.fillRect(x + 4 + Math.floor(rg() * 20), 44 + Math.floor(rg() * 10), 4, 3); }
      }
      noise(g, rg, 200, ['#1E2830', '#8FA3B3'], 0.3);
    });
    /* Holzverschalung */
    T.W = texCanvas(function (g, rg) {
      for (var i = 0; i < 4; i++) {
        var d = Math.floor(rg() * 24) - 12;
        g.fillStyle = 'rgb(' + (118 + d) + ',' + (80 + d) + ',' + (44 + d) + ')'; g.fillRect(i * 16, 0, 16, TS);
        g.fillStyle = '#3E2810'; g.fillRect(i * 16, 0, 1, TS);
        for (var k = 0; k < 7; k++) { g.fillStyle = 'rgba(70,44,18,0.6)'; g.fillRect(i * 16 + 2 + Math.floor(rg() * 12), Math.floor(rg() * TS), 1, 6 + Math.floor(rg() * 14)); }
        g.fillStyle = '#9DA3AA'; g.fillRect(i * 16 + 3, 4, 1, 1); g.fillRect(i * 16 + 12, 4, 1, 1); g.fillRect(i * 16 + 3, 58, 1, 1); g.fillRect(i * 16 + 12, 58, 1, 1);
      }
      g.fillStyle = '#4A3016'; g.fillRect(0, 30, TS, 4); g.fillStyle = '#6E4A22'; g.fillRect(0, 30, TS, 1);
    });
    /* Backstein */
    T.B = texCanvas(function (g, rg) {
      g.fillStyle = '#5A4A40'; g.fillRect(0, 0, TS, TS);
      for (var y = 0; y < 8; y++) for (var x = -1; x < 4; x++) {
        var off = y % 2 ? 8 : 0, d = Math.floor(rg() * 30) - 15;
        g.fillStyle = 'rgb(' + (150 + d) + ',' + (62 + d / 2) + ',' + (44 + d / 3) + ')';
        g.fillRect(x * 16 + off + 1, y * 8 + 1, 15, 7);
        g.fillStyle = 'rgba(255,200,170,0.15)'; g.fillRect(x * 16 + off + 1, y * 8 + 1, 15, 1);
      }
      noise(g, rg, 400, ['#2A1A14', '#B0705A'], 0.35);
    });
    /* Metallplatten mit Nieten und Warnstreifen */
    T.M = texCanvas(function (g, rg) {
      g.fillStyle = '#5E646C'; g.fillRect(0, 0, TS, TS);
      g.fillStyle = '#6C737C'; g.fillRect(1, 1, 30, 46); g.fillRect(33, 1, 30, 46);
      g.fillStyle = '#3C4148'; g.fillRect(31, 0, 2, 48); g.fillRect(0, 47, TS, 2);
      [[3, 3], [26, 3], [3, 41], [26, 41], [35, 3], [58, 3], [35, 41], [58, 41]].forEach(function (p) { rivet(g, p[0], p[1]); });
      for (var x = -16; x < TS; x += 10) { g.fillStyle = '#FDC506'; g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 5, 64); g.lineTo(x + 20, 49); g.lineTo(x + 15, 49); g.fill(); }
      g.fillStyle = '#1A1A1A'; g.fillRect(0, 49, TS, 1);
      noise(g, rg, 250, ['#3A2A1A', '#8A5A30', '#2A2E33'], 0.45);
    });
    /* Förderkorb-Gitter */
    T.K = texCanvas(function (g) {
      g.fillStyle = '#0D0D10'; g.fillRect(0, 0, TS, TS);
      g.fillStyle = '#3A3F46'; for (var x = 2; x < TS; x += 8) g.fillRect(x, 0, 2, TS);
      for (var y = 4; y < TS; y += 12) g.fillRect(0, y, TS, 2);
      g.fillStyle = '#E9A800'; g.fillRect(0, 0, TS, 4); g.fillRect(0, 60, TS, 4); g.fillRect(0, 0, 3, TS); g.fillRect(61, 0, 3, TS);
      g.fillStyle = '#7A5800'; g.fillRect(0, 3, TS, 1); g.fillRect(0, 60, TS, 1);
    });
    /* Tür mit Warnstreifen und Sichtfenster */
    function door(red) {
      return texCanvas(function (g, rg) {
        g.fillStyle = '#4E545C'; g.fillRect(0, 0, TS, TS);
        g.fillStyle = '#5E656E'; g.fillRect(3, 3, 58, 58);
        g.fillStyle = '#23272C'; g.fillRect(22, 10, 20, 12); g.fillStyle = red ? '#5A1410' : '#14202A'; g.fillRect(24, 12, 16, 8);
        g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(25, 13, 6, 2);
        for (var x = -16; x < TS; x += 12) { g.fillStyle = red ? '#E5322D' : '#FDC506'; g.beginPath(); g.moveTo(x, 54); g.lineTo(x + 6, 54); g.lineTo(x + 14, 44); g.lineTo(x + 8, 44); g.fill(); }
        g.fillStyle = '#1A1A1A'; g.fillRect(3, 43, 58, 1); g.fillRect(3, 54, 58, 1);
        if (red) { g.beginPath(); g.arc(32, 32, 6, 0, TAU); g.fillStyle = '#E5322D'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#3A0A08'; g.stroke(); g.fillStyle = '#FFD7D2'; g.fillRect(30, 30, 2, 2); }
        else { g.fillStyle = '#2A2E33'; g.fillRect(48, 28, 6, 10); g.fillStyle = '#C9CED6'; g.fillRect(49, 29, 4, 3); }
        [[5, 5], [56, 5], [5, 56], [56, 56]].forEach(function (p) { rivet(g, p[0], p[1]); });
        noise(g, rg, 180, ['#2A2E33', '#7A5030'], 0.4);
      });
    }
    T.D = door(false); T.R = door(true);
    /* Türrahmen (Seitenwand neben Türen) */
    T.J = texCanvas(function (g, rg) {
      g.fillStyle = '#3C4148'; g.fillRect(0, 0, TS, TS);
      g.fillStyle = '#545B63'; g.fillRect(8, 0, 48, TS);
      for (var y = 4; y < TS; y += 14) rivet(g, 30, y);
      noise(g, rg, 120, ['#22262B', '#6E757E'], 0.4);
    });
    /* Ausgangsschalter: aus / an */
    function lever(on) {
      return texCanvas(function (g) {
        g.drawImage(texToCanvas(T.K), 0, 0);
        g.fillStyle = '#3C4148'; g.fillRect(14, 10, 36, 44); g.fillStyle = '#5E656E'; g.fillRect(16, 12, 32, 40);
        g.fillStyle = on ? '#3BE06A' : '#E5322D'; g.beginPath(); g.arc(32, 18, 4, 0, TAU); g.fill();
        g.fillStyle = '#1A1A1A'; g.fillRect(29, 26, 6, 22);
        g.save(); g.translate(32, 44); g.rotate(on ? 0.7 : -0.7); g.fillStyle = '#C9CED6'; g.fillRect(-2, -18, 4, 18); g.fillStyle = '#E5322D'; g.beginPath(); g.arc(0, -19, 4, 0, TAU); g.fill(); g.restore();
        pixText(g, on ? 'AUF' : 'AB', 32, 55, 1, '#FDC506', 'center');
      });
    }
    T.X = lever(false); T.X2 = lever(true);
    /* Poster (Insider) auf Backstein */
    var POSTERS = [
      function (g) { g.fillStyle = '#F1E9D2'; g.fillRect(10, 6, 44, 50); pixText(g, 'MITARB.', 32, 9, 1, '#222', 'center'); pixText(g, 'D.MONATS', 32, 15, 1, '#222', 'center'); g.fillStyle = '#FDC506'; g.beginPath(); g.arc(32, 32, 9, 0, TAU); g.fill(); g.fillStyle = '#3A2410'; g.fillRect(28, 30, 2, 2); g.fillRect(34, 30, 2, 2); g.fillRect(29, 35, 6, 1); pixText(g, 'SPRÜCHE-', 32, 44, 1, '#B3261E', 'center'); pixText(g, 'KLOPFER', 32, 50, 1, '#B3261E', 'center'); },
      function (g) { g.fillStyle = '#1A1A1A'; g.fillRect(8, 10, 48, 40); g.fillStyle = '#FDC506'; g.fillRect(10, 12, 44, 36); pixText(g, 'GLÜCK', 32, 18, 2, '#1A1A1A', 'center'); pixText(g, 'AUF!', 32, 32, 2, '#1A1A1A', 'center'); },
      function (g) { pixText(g, 'DIE', 32, 14, 2, '#F2F2F2', 'center'); pixText(g, 'MASCHINE', 32, 27, 1, '#3BE06A', 'center'); pixText(g, 'WAR HIER', 32, 36, 1, '#F2F2F2', 'center'); g.strokeStyle = '#FF8AD8'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 48); g.lineTo(54, 44); g.stroke(); },
      function (g) { g.fillStyle = '#F1E9D2'; g.fillRect(9, 8, 46, 48); g.fillStyle = '#E5322D'; g.fillRect(9, 8, 46, 10); pixText(g, 'ACHTUNG', 32, 11, 1, '#FFF', 'center'); art.wasp && (function () { g.save(); g.translate(32, 33); g.scale(0.35, 0.35); art.wasp(g, 0.3); g.restore(); })(); pixText(g, 'HELM AUF!', 32, 47, 1, '#222', 'center'); },
      function (g) { g.fillStyle = '#F1E9D2'; g.fillRect(10, 6, 44, 50); pixText(g, 'GESUCHT', 32, 9, 1, '#222', 'center'); g.fillStyle = '#FDC506'; g.beginPath(); g.arc(32, 28, 9, 0, TAU); g.fill(); g.fillStyle = '#111'; g.fillRect(25, 26, 14, 3); pixText(g, 'ALLES-', 32, 42, 1, '#222', 'center'); pixText(g, 'MACHER', 32, 48, 1, '#222', 'center'); }
    ];
    T.posters = POSTERS.map(function (draw) { return texCanvas(function (g) { g.drawImage(texToCanvas(T.B), 0, 0); draw(g); }); });
    /* Geheimwände: gleiche Wand, aber mit feinem Riss */
    T.secret = {};
    ['W', 'B', 'M', '#', 'T'].forEach(function (k) {
      T.secret[k] = texCanvas(function (g) {
        g.drawImage(texToCanvas(T[k]), 0, 0);
        g.strokeStyle = 'rgba(10,8,6,0.75)'; g.lineWidth = 1; g.beginPath(); g.moveTo(30, 6); g.lineTo(33, 18); g.lineTo(29, 30); g.lineTo(34, 41); g.lineTo(31, 56); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(31, 6); g.lineTo(34, 18); g.lineTo(30, 30); g.stroke();
      });
    });

    /* Böden und Decken */
    var F = {};
    F.erde = texCanvas(function (g, rg) { g.fillStyle = '#3A3028'; g.fillRect(0, 0, TS, TS); noise(g, rg, 1100, ['#241D18', '#4E4236', '#1A1612', '#5A4C3E'], 0.8); });
    F.fels = texCanvas(function (g, rg) { g.fillStyle = '#2C2622'; g.fillRect(0, 0, TS, TS); noise(g, rg, 900, ['#1A1613', '#3A322C', '#45392F'], 0.8); g.fillStyle = '#4A3218'; g.fillRect(0, 28, TS, 8); g.fillStyle = '#6B4A26'; g.fillRect(0, 29, TS, 2); });
    F.fliese = texCanvas(function (g, rg) { g.fillStyle = '#5E6A66'; g.fillRect(0, 0, TS, TS); for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) { var d = Math.floor(rg() * 14); g.fillStyle = (x + y) % 2 ? 'rgb(' + (150 + d) + ',' + (160 + d) + ',' + (154 + d) + ')' : 'rgb(' + (120 + d) + ',' + (130 + d) + ',' + (126 + d) + ')'; g.fillRect(x * 4, y * 4, 3, 3); } noise(g, rg, 120, ['#3A3020'], 0.4); });
    F.beton = texCanvas(function (g, rg) { g.fillStyle = '#5A5856'; g.fillRect(0, 0, TS, TS); noise(g, rg, 1200, ['#4A4846', '#6A6866', '#3E3C3A'], 0.6); g.fillStyle = '#44423F'; g.fillRect(0, 0, TS, 1); g.fillRect(0, 0, 1, TS); });
    F.dielen = texCanvas(function (g, rg) { for (var i = 0; i < 8; i++) { var d = Math.floor(rg() * 20) - 10; g.fillStyle = 'rgb(' + (96 + d) + ',' + (64 + d) + ',' + (36 + d) + ')'; g.fillRect(0, i * 8, TS, 8); g.fillStyle = '#2E1C0A'; g.fillRect(0, i * 8, TS, 1); g.fillRect(Math.floor(rg() * 60), i * 8, 1, 8); } });
    F.balken = texCanvas(function (g, rg) { g.fillStyle = '#2A1E12'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#6B4A26'; g.fillRect(0, 0, 14, TS); g.fillRect(32, 0, 14, TS); g.fillStyle = '#4A3218'; g.fillRect(13, 0, 1, TS); g.fillRect(45, 0, 1, TS); noise(g, rg, 200, ['#1A1208'], 0.5); });
    F.gitter = texCanvas(function (g) { g.fillStyle = '#16181B'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#4A5058'; for (var i = 0; i < TS; i += 8) { g.fillRect(i, 0, 2, TS); g.fillRect(0, i, TS, 2); } });
    F.streifen = texCanvas(function (g, rg) { g.drawImage(texToCanvas(F.beton), 0, 0); g.fillStyle = '#C9A100'; g.fillRect(28, 0, 8, TS); noise(g, rg, 80, ['#3A3020'], 0.6); });
    F.platte = texCanvas(function (g, rg) { g.fillStyle = '#4A4E54'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#565B62'; g.fillRect(1, 1, 30, 30); g.fillRect(33, 33, 30, 30); g.fillStyle = '#3E4247'; g.fillRect(33, 1, 30, 30); g.fillRect(1, 33, 30, 30); for (var i = 0; i < 30; i++) { g.fillStyle = '#6A7078'; g.fillRect(4 + (i % 6) * 4, 4 + Math.floor(i / 6) * 5, 2, 1); } noise(g, rg, 200, ['#2A2E33', '#7A5030'], 0.4); });
    F.traeger = texCanvas(function (g) { g.fillStyle = '#141619'; g.fillRect(0, 0, TS, TS); g.fillStyle = '#3C4148'; g.fillRect(0, 26, TS, 12); g.fillStyle = '#2A2E33'; g.fillRect(0, 31, TS, 2); g.fillStyle = '#E9A800'; g.fillRect(26, 0, 12, TS); g.fillStyle = '#7A5800'; g.fillRect(31, 0, 2, TS); });
    T.flats = F;
    return T;
  }
  /* Textur zurück in eine Leinwand (zum Weiterzeichnen) */
  function texToCanvas(tex) {
    var c = document.createElement('canvas'); c.width = TS; c.height = TS;
    var g = c.getContext('2d'), id = g.createImageData(TS, TS);
    new Uint32Array(id.data.buffer).set(tex);
    g.putImageData(id, 0, 0);
    return c;
  }

  /* ------------------------------------------------------------------ Sprites (flache Bilder, die sich immer zu dir drehen) */
  function spr(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d');
    draw(g, w, h);
    return { w: w, h: h, px: new Uint32Array(g.getImageData(0, 0, w, h).data.buffer) };
  }
  function ell(g, x, y, rx, ry, fill, stroke, lw) {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.lineWidth = lw || 1.5; g.strokeStyle = stroke; g.stroke(); }
  }

  /* Wespe von vorn. o: wing 0..1, atk (Angriff), type */
  function drawWasp(g, type, o) {
    var body = type === 'feuer' ? '#FF7A1A' : '#FDC506', dark = '#141414';
    var sc = o.big ? 1.12 : 1;
    g.save(); g.translate(32, 34); g.scale(sc, sc); g.translate(-32, -34);
    if (type === 'feuer') { /* Flammen-Aura */
      for (var i = 0; i < 9; i++) { var a = i / 9 * TAU + o.wing; ell(g, 32 + Math.cos(a) * 18, 34 + Math.sin(a) * 18, 7, 9, 'rgba(255,' + (90 + i * 12) + ',20,0.45)'); }
    }
    /* Flügel */
    var wf = 0.35 + 0.65 * o.wing;
    g.save(); g.globalAlpha = 0.75;
    [[-1, 13], [1, 51]].forEach(function (s) {
      g.save(); g.translate(s[1], 20); g.rotate(s[0] * -0.5); g.scale(1, wf);
      ell(g, 0, 0, 11, 15, 'rgba(210,235,255,0.7)', '#2A2A2A', 1.2); g.restore();
    });
    g.restore();
    /* Hinterleib mit Streifen und Stachel */
    ell(g, 32, 49, 11, 12, body, dark, 2);
    g.save(); g.beginPath(); g.ellipse(32, 49, 11, 12, 0, 0, TAU); g.clip();
    g.fillStyle = dark; g.fillRect(18, 44, 30, 3); g.fillRect(18, 51, 30, 3); g.restore();
    g.fillStyle = dark; g.beginPath(); g.moveTo(29, 59); g.lineTo(35, 59); g.lineTo(32, 64); g.fill();
    /* Brust und Beinchen */
    ell(g, 32, 35, 9, 7, '#2A2018', dark, 1.5);
    g.strokeStyle = dark; g.lineWidth = 1.5;
    [[-1], [1]].forEach(function (s) { for (var k = 0; k < 2; k++) { g.beginPath(); g.moveTo(32 + s[0] * 7, 37 + k * 3); g.lineTo(32 + s[0] * 14, 42 + k * 4); g.stroke(); } });
    /* Kopf */
    ell(g, 32, 21, 12, 11, body, dark, 2);
    /* Fühler */
    g.strokeStyle = dark; g.lineWidth = 1.6; g.beginPath(); g.moveTo(27, 12); g.quadraticCurveTo(22, 4, 17, 3); g.moveTo(37, 12); g.quadraticCurveTo(42, 4, 47, 3); g.stroke();
    /* Böse Augen */
    var eye = type === 'feuer' ? '#FFE680' : '#E5322D';
    ell(g, 26, 20, 5, 6, dark); ell(g, 38, 20, 5, 6, dark);
    ell(g, 27, 21, 2, 2.4, eye); ell(g, 37, 21, 2, 2.4, eye);
    g.strokeStyle = dark; g.lineWidth = 2.4; g.beginPath(); g.moveTo(20, 13); g.lineTo(30, 17); g.moveTo(44, 13); g.lineTo(34, 17); g.stroke();
    /* Mundwerkzeuge */
    if (o.atk || type === 'kami') { ell(g, 32, 29, 4.5, 3.5, '#5A0A08', dark, 1.2); g.fillStyle = '#FFF'; g.fillRect(29, 26, 2, 2); g.fillRect(33, 26, 2, 2); }
    else { g.strokeStyle = dark; g.lineWidth = 1.8; g.beginPath(); g.moveTo(28, 28); g.lineTo(31, 31); g.moveTo(36, 28); g.lineTo(33, 31); g.stroke(); }
    /* Ausrüstung */
    if (type === 'wach') {
      g.fillStyle = '#26406B'; g.beginPath(); g.ellipse(32, 11, 12, 5, 0, PI, TAU); g.fill(); g.fillRect(20, 10, 24, 3); g.fillStyle = '#1A2A48'; g.fillRect(30, 11, 14, 2);
      g.fillStyle = '#FDC506'; g.fillRect(30, 7, 4, 3);
      /* Stachler zeigt auf dich */
      g.fillStyle = '#C98A1A'; g.fillRect(40, 38, 10, 8); g.fillStyle = '#7A4A10'; g.fillRect(42, 44, 4, 6);
      ell(g, 45, 41, 3, 3, '#111');
    } else if (type === 'flinte') {
      g.fillStyle = '#B3261E'; g.fillRect(20, 13, 24, 3); g.fillRect(43, 13, 5, 2); g.fillRect(45, 15, 3, 5);
      g.fillStyle = '#6B4A26'; g.fillRect(36, 40, 18, 7); g.fillStyle = '#3A3F46'; g.fillRect(36, 37, 18, 5);
      ell(g, 41, 39, 3, 3, '#0A0A0A', '#5E656E', 1); ell(g, 49, 39, 3, 3, '#0A0A0A', '#5E656E', 1);
    } else if (type === 'kami') {
      g.fillStyle = '#5E656E'; g.beginPath(); g.ellipse(32, 12, 12, 6, 0, PI, TAU); g.fill();
      ell(g, 32, 6, 3.2, 3.2, o.blink ? '#FF3B2F' : '#5A1410', o.blink ? '#FFD0C8' : '#111', 1);
      for (var d = 0; d < 3; d++) { g.fillStyle = '#C0281E'; g.fillRect(24 + d * 6, 31, 5, 10); g.fillStyle = '#F2D7A0'; g.fillRect(24 + d * 6, 31, 5, 2); }
      g.strokeStyle = '#E9E2D0'; g.lineWidth = 1; g.beginPath(); g.moveTo(26, 31); g.quadraticCurveTo(30, 26, 36, 29); g.stroke();
    }
    /* Mündungsfeuer */
    if (o.atk && (type === 'wach' || type === 'flinte')) {
      var mx = type === 'wach' ? 45 : 45, my = type === 'wach' ? 41 : 39, rr2 = type === 'flinte' ? 11 : 8;
      ell(g, mx, my, rr2, rr2, 'rgba(255,230,120,0.95)'); ell(g, mx, my, rr2 * 0.5, rr2 * 0.5, '#FFFFFF');
    }
    if (o.atk && type === 'feuer') { ell(g, 32, 30, 8, 8, 'rgba(255,200,60,0.9)'); ell(g, 32, 30, 4, 4, '#FFF6C0'); }
    g.restore();
  }
  /* Zerplatzen in Wachssplitter und Honig */
  function drawSplat(g, k, type) {
    var body = type === 'feuer' ? '#FF7A1A' : '#FDC506', rg = art.rng(7 + k);
    if (k < 2) {
      var s = k === 0 ? 1 : 1.6;
      ell(g, 32, 40, 14 * s, 11 * s, 'rgba(240,170,20,0.9)');
      for (var i = 0; i < 14; i++) { var a = rg() * TAU, d = (6 + rg() * 16) * s; g.fillStyle = i % 3 ? body : '#141414'; g.fillRect(32 + Math.cos(a) * d, 40 + Math.sin(a) * d * 0.8, 3 + rg() * 3, 2 + rg() * 3); }
      ell(g, 32, 40, 6 * s, 5 * s, '#FFF2B0');
    } else {
      ell(g, 32, 58, 18, 5, 'rgba(220,150,20,0.95)', '#8A5A00', 1);
      g.fillStyle = '#141414'; g.fillRect(24, 56, 4, 2); g.fillRect(37, 57, 5, 2);
      g.fillStyle = 'rgba(210,235,255,0.8)'; g.beginPath(); g.ellipse(40, 55, 5, 2, 0.3, 0, TAU); g.fill();
      g.fillStyle = body; g.fillRect(29, 55, 4, 3);
    }
  }
  function drawMite(g, o) {
    var leg = o.wing > 0.5 ? 2 : -2;
    g.strokeStyle = '#2A0E08'; g.lineWidth = 2;
    for (var i = 0; i < 4; i++) { var y = 50 + i * 3; g.beginPath(); g.moveTo(22, y); g.lineTo(10, y + 4 + (i % 2 ? leg : -leg)); g.moveTo(42, y); g.lineTo(54, y + 4 + (i % 2 ? -leg : leg)); g.stroke(); }
    ell(g, 32, 52, o.atk ? 15 : 14, o.atk ? 11 : 9, '#8A2E18', '#2A0E08', 2);
    ell(g, 28, 48, 6, 3, 'rgba(255,170,130,0.45)');
    ell(g, 32, 60, 6, 3, '#5A1A0C', '#2A0E08', 1);
    ell(g, 29, 60, 1.4, 1.4, '#FF5A3A'); ell(g, 35, 60, 1.4, 1.4, '#FF5A3A');
  }

  function makeSprites() {
    var S = {};
    ['wespe', 'wach', 'flinte', 'feuer', 'kami'].forEach(function (t) {
      S[t] = {
        fly: [spr(64, 64, function (g) { drawWasp(g, t, { wing: 1 }); }), spr(64, 64, function (g) { drawWasp(g, t, { wing: 0, blink: true }); })],
        atk: spr(64, 64, function (g) { drawWasp(g, t, { wing: 0.6, atk: true, big: t === 'wespe' || t === 'kami', blink: true }); }),
        die: [0, 1, 2].map(function (k) { return spr(64, 64, function (g) { drawSplat(g, k, t); }); })
      };
    });
    S.milbe = {
      fly: [spr(64, 64, function (g) { drawMite(g, { wing: 1 }); }), spr(64, 64, function (g) { drawMite(g, { wing: 0 }); })],
      atk: spr(64, 64, function (g) { drawMite(g, { wing: 1, atk: true }); }),
      die: [0, 1, 2].map(function (k) { return spr(64, 64, function (g) { if (k < 2) { ell(g, 32, 52, 16 + k * 5, 8, 'rgba(120,30,10,0.9)'); } ell(g, 32, 60, 14, 4, '#5A1A0C'); }); })
    };
    /* Gegenstände (unten im Bild) */
    function item(draw) { return spr(64, 64, draw); }
    S.sta10 = item(function (g) { for (var i = 0; i < 6; i++) { g.save(); g.translate(26 + i * 3, 58); g.rotate(-0.15 + i * 0.06); g.fillStyle = '#C98A1A'; g.fillRect(-1.5, -20, 3, 20); g.fillStyle = '#1A1A1A'; g.beginPath(); g.moveTo(-1.5, -20); g.lineTo(1.5, -20); g.lineTo(0, -26); g.fill(); g.restore(); } g.fillStyle = '#B3261E'; g.fillRect(24, 48, 18, 4); });
    S.sta50 = item(function (g) { g.fillStyle = '#6B4A26'; g.fillRect(14, 40, 36, 22); g.fillStyle = '#8A6232'; g.fillRect(14, 40, 36, 4); g.strokeStyle = '#3E2810'; g.lineWidth = 2; g.strokeRect(14, 40, 36, 22); pixText(g, 'STACHEL', 32, 50, 1, '#FDC506', 'center'); });
    S.pol4 = item(function (g) { for (var i = 0; i < 4; i++) { ell(g, 22 + i * 7, 56, 4, 4, '#FDC506', '#8A5A00', 1); ell(g, 21 + i * 7, 55, 1.4, 1.4, '#FFF6C0'); } });
    S.pol20 = item(function (g) { g.fillStyle = '#B3261E'; g.fillRect(16, 42, 32, 20); g.fillStyle = '#E5322D'; g.fillRect(16, 42, 32, 4); for (var i = 0; i < 4; i++) ell(g, 22 + i * 7, 52, 3, 3, '#FDC506', '#8A5A00', 1); pixText(g, 'POLLEN', 32, 56, 1, '#FFF', 'center'); });
    function gunFlinte(g) { g.fillStyle = '#3A3F46'; g.fillRect(8, 50, 40, 4); g.fillRect(8, 55, 40, 3); g.fillStyle = '#6B4A26'; g.beginPath(); g.moveTo(46, 49); g.lineTo(60, 50); g.lineTo(60, 60); g.lineTo(46, 58); g.fill(); g.fillStyle = '#FDC506'; g.fillRect(30, 49, 4, 10); }
    S.flinteItem = item(gunFlinte);
    S.stachler = item(function (g) { g.fillStyle = '#C98A1A'; g.fillRect(18, 48, 26, 8); g.fillStyle = '#7A4A10'; g.fillRect(34, 54, 8, 9); g.fillStyle = '#1A1A1A'; g.fillRect(16, 50, 3, 4); art.hex(g, 26, 52, 2.5, '#FDC506', null, 1); });
    S.tropfen = item(function (g) { g.fillStyle = '#F2A900'; g.beginPath(); g.moveTo(32, 40); g.quadraticCurveTo(42, 54, 32, 60); g.quadraticCurveTo(22, 54, 32, 40); g.fill(); ell(g, 29, 53, 2, 3, 'rgba(255,255,255,0.6)'); });
    S.glas = item(function (g) { g.fillStyle = '#E9A800'; g.fillRect(22, 42, 20, 20); g.fillStyle = '#C9A100'; g.fillRect(22, 52, 20, 10); g.fillStyle = '#B3261E'; g.fillRect(20, 38, 24, 5); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(25, 44, 3, 14); });
    S.topf = item(function (g) { ell(g, 32, 50, 16, 13, '#C47A1A', '#5A3008', 2); g.fillStyle = '#FDC506'; g.beginPath(); g.ellipse(32, 40, 14, 4, 0, 0, TAU); g.fill(); g.fillStyle = '#FDC506'; g.fillRect(24, 40, 4, 10); pixText(g, 'HONIG', 32, 50, 1, '#3A2008', 'center'); });
    S.plaett = item(function (g) { art.hex(g, 32, 54, 7, '#F2D27A', '#8A6A1A', 1.5); art.hex(g, 32, 54, 3, '#FFF0B8'); });
    S.panzer = item(function (g) { g.fillStyle = '#E9C25A'; g.beginPath(); g.moveTo(18, 36); g.lineTo(46, 36); g.lineTo(50, 46); g.lineTo(44, 62); g.lineTo(20, 62); g.lineTo(14, 46); g.fill(); g.strokeStyle = '#7A5A10'; g.lineWidth = 2; g.stroke(); for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) art.hex(g, 24 + x * 8 + (y % 2) * 4, 44 + y * 6, 3.5, null, '#9A7A20', 1); });
    S.berserk = item(function (g) { g.fillStyle = '#B3261E'; g.fillRect(20, 40, 24, 22); g.fillStyle = '#E5322D'; g.fillRect(18, 36, 28, 5); pixText(g, '!', 32, 46, 2, '#FFF', 'center'); });
    S.lampe = item(function (g) { ell(g, 32, 52, 15, 9, '#FDC506', '#7A5800', 2); g.fillStyle = '#FDC506'; g.fillRect(17, 52, 30, 6); ell(g, 32, 50, 5, 4, '#FFF6C0', '#555', 1.5); g.fillStyle = 'rgba(255,246,192,0.35)'; g.beginPath(); g.moveTo(32, 50); g.lineTo(10, 30); g.lineTo(54, 30); g.fill(); });
    S.marke = item(function (g) { ell(g, 32, 50, 10, 10, '#C99A3A', '#5A3A08', 2); ell(g, 32, 50, 6, 6, '#E5322D'); g.fillStyle = '#111'; g.fillRect(31, 40, 2, 3); pixText(g, '1', 32, 48, 1, '#FFF', 'center'); });
    S.curry = item(function (g) { g.fillStyle = '#F2F2F2'; g.beginPath(); g.moveTo(14, 52); g.lineTo(50, 52); g.lineTo(46, 62); g.lineTo(18, 62); g.fill(); ell(g, 26, 52, 10, 3.5, '#8A3A10'); g.fillStyle = '#B3261E'; g.fillRect(17, 50, 18, 2); for (var i = 0; i < 6; i++) { g.fillStyle = '#F2C94C'; g.fillRect(38 + (i % 3) * 3, 42 + Math.floor(i / 3) * 3, 2, 10); } g.fillStyle = '#FFF'; g.fillRect(36, 50, 10, 2); });
    /* Deko */
    S.stempel = spr(32, 64, function (g) { g.fillStyle = '#6B4A26'; g.fillRect(11, 0, 10, 64); g.fillStyle = '#8A6232'; g.fillRect(12, 0, 2, 64); g.fillStyle = '#4A3218'; g.fillRect(19, 0, 2, 64); g.fillStyle = '#5A3E1E'; g.fillRect(2, 0, 28, 6); g.fillStyle = '#3E2810'; g.fillRect(2, 6, 28, 1); for (var y = 10; y < 64; y += 12) { g.fillStyle = '#3E2810'; g.fillRect(13, y, 6, 1); } });
    S.lore = spr(64, 48, function (g) { g.fillStyle = '#16120F'; ell(g, 32, 14, 26, 6, '#16120F'); for (var i = 0; i < 9; i++) ell(g, 12 + i * 5, 12 + (i % 3), 4, 3, '#26262C'); g.fillStyle = '#5E646C'; g.beginPath(); g.moveTo(4, 14); g.lineTo(60, 14); g.lineTo(54, 40); g.lineTo(10, 40); g.fill(); g.fillStyle = '#7A5030'; g.fillRect(6, 18, 52, 3); g.fillRect(8, 30, 48, 3); g.fillStyle = '#3C4148'; g.fillRect(4, 14, 56, 2); ell(g, 16, 42, 5, 5, '#222', '#555', 1.5); ell(g, 48, 42, 5, 5, '#222', '#555', 1.5); pixText(g, 'GLÜCK AUF', 32, 23, 1, '#FDC506', 'center'); });
    S.fass = spr(48, 64, function (g) { g.fillStyle = '#C9A100'; g.fillRect(8, 14, 32, 48); for (var y = 18; y < 60; y += 10) { g.fillStyle = '#1A1A1A'; g.fillRect(8, y, 32, 4); } g.fillStyle = '#E9C200'; g.fillRect(10, 14, 4, 48); g.fillStyle = '#5A4800'; g.fillRect(36, 14, 4, 48); ell(g, 24, 14, 16, 4, '#8A7000', '#3A3000', 1); g.fillStyle = '#F2F2F2'; g.fillRect(14, 34, 20, 9); pixText(g, 'CH4', 24, 36, 1, '#B3261E', 'center'); });
    S.fassBoom = [0, 1, 2].map(function (k) { return spr(64, 64, function (g) { var r = 12 + k * 9; ell(g, 32, 34, r + 6, r + 4, 'rgba(255,80,20,' + (0.8 - k * 0.2) + ')'); ell(g, 32, 34, r, r * 0.8, 'rgba(255,200,60,' + (0.95 - k * 0.25) + ')'); ell(g, 32, 34, r * 0.45, r * 0.4, 'rgba(255,255,220,' + (1 - k * 0.3) + ')'); }); });
    S.licht = spr(32, 64, function (g) { g.strokeStyle = '#222'; g.lineWidth = 1; g.beginPath(); g.moveTo(16, 0); g.lineTo(16, 18); g.stroke(); g.fillStyle = '#3A3F46'; g.beginPath(); g.moveTo(8, 22); g.lineTo(24, 22); g.lineTo(20, 18); g.lineTo(12, 18); g.fill(); ell(g, 16, 25, 5, 4, '#FFF6C0'); g.strokeStyle = '#3A3F46'; g.beginPath(); g.moveTo(11, 23); g.lineTo(13, 29); g.moveTo(21, 23); g.lineTo(19, 29); g.moveTo(16, 23); g.lineTo(16, 30); g.stroke(); });
    /* Feuerball, Treffer, Explosion */
    S.ball = [0, 1].map(function (k) { return spr(32, 32, function (g) { ell(g, 16, 16, 12 - k, 12 - k, 'rgba(255,90,20,0.85)'); ell(g, 16 + k, 16, 7, 7, '#FFC23A'); ell(g, 15, 15, 3, 3, '#FFF6C0'); }); });
    S.puff = [0, 1, 2].map(function (k) { return spr(16, 16, function (g) { ell(g, 8, 8, 2 + k * 2, 2 + k * 2, 'rgba(200,190,170,' + (0.9 - k * 0.25) + ')'); if (!k) ell(g, 8, 8, 2, 2, '#FFE680'); }); });
    S.spritz = [0, 1, 2].map(function (k) { return spr(16, 16, function (g) { for (var i = 0; i < 5; i++) { var a = i / 5 * TAU; g.fillStyle = '#F2A900'; g.fillRect(8 + Math.cos(a) * (2 + k * 2.5), 8 + Math.sin(a) * (2 + k * 2.5), 2, 2); } }); });
    return S;
  }

  /* ------------------------------------------------------------------ Sound und Musik (alles im Browser erzeugt, eigene Riffs) */
  function makeAudio(ctx, set) {
    var A = { ac: null, intensity: 0, target: 0, mode: 'off', next: 0, step: 0, bar: 0 };
    function get() {
      var ac = ctx.audio();
      if (!ac) return null;
      if (A.ac !== ac) init(ac);
      return A;
    }
    function init(ac) {
      A.ac = ac;
      A.master = ac.createGain(); A.master.gain.value = 0.9; A.master.connect(ac.destination);
      A.sfx = ac.createGain(); A.sfx.connect(A.master);
      A.mus = ac.createGain(); A.mus.connect(A.master);
      A.amb = ac.createGain(); A.amb.gain.value = 0; A.amb.connect(A.mus);
      A.metal = ac.createGain(); A.metal.gain.value = 0; A.metal.connect(A.mus);
      /* Echo für die ruhige Gitarre */
      A.echo = ac.createDelay(1); A.echo.delayTime.value = 0.3;
      var fb = ac.createGain(); fb.gain.value = 0.38; var ef = ac.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 1800;
      A.echo.connect(ef); ef.connect(fb); fb.connect(A.echo); ef.connect(A.amb);
      /* Rauschen */
      var len = ac.sampleRate * 1.5, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      A.noise = buf;
      /* Verzerrer für die Gitarre */
      var n = 1024, curve = new Float32Array(n);
      for (var k = 0; k < n; k++) { var x = k * 2 / n - 1; curve[k] = Math.tanh(x * 6) * 0.9; }
      A.curve = curve;
      A.next = ac.currentTime + 0.1; A.step = 0; A.bar = 0;
      vols();
    }
    function vols() { if (!A.ac) return; A.sfx.gain.value = set.sfx; A.mus.gain.value = set.music * 0.8; }
    function out(pan) {
      if (pan && A.ac.createStereoPanner) { var p = A.ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(A.sfx); return p; }
      return A.sfx;
    }
    function env(gn, t, vol, att, dur) {
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + att);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    function tone(type, f1, f2, dur, vol, delay, pan, dest) {
      var a = get(); if (!a) return;
      var ac = a.ac, t = ac.currentTime + (delay || 0), o = ac.createOscillator(), gn = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
      env(gn, t, vol, 0.005, dur); o.connect(gn); gn.connect(dest || out(pan)); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(dur, ftype, f1, f2, vol, delay, pan, q, dest) {
      var a = get(); if (!a) return;
      var ac = a.ac, t = ac.currentTime + (delay || 0), s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
      s.buffer = a.noise; s.loop = true;
      f.type = ftype; f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur); f.Q.value = q || 0.8;
      env(gn, t, vol, 0.004, dur); s.connect(f); f.connect(gn); gn.connect(dest || out(pan));
      s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    /* Verzerrte Gitarre: Powerchord aus Grundton, Quinte, Oktave */
    function guitar(t, f, dur, vol, mute, dest) {
      var ac = A.ac, sh = ac.createWaveShaper(), lp = ac.createBiquadFilter(), gn = ac.createGain();
      sh.curve = A.curve; lp.type = 'lowpass'; lp.frequency.value = mute ? 1100 : 2600;
      [1, 1.4983, 2].forEach(function (m, i) {
        [-6, 6].forEach(function (det) {
          var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * m; o.detune.value = det;
          var og = ac.createGain(); og.gain.value = i === 2 ? 0.18 : 0.28; o.connect(og); og.connect(sh);
          o.start(t); o.stop(t + dur + 0.05);
        });
      });
      gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      sh.connect(lp); lp.connect(gn); gn.connect(dest);
    }
    function kick(t, vol, dest) { var ac = A.ac, o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(gn, t, vol, 0.002, 0.16); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + 0.2); }
    function snare(t, vol, dest) { noiseAt(t, 'bandpass', 1800, 900, vol, 0.14, dest, 0.7); var ac = A.ac, o = ac.createOscillator(), gn = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08); env(gn, t, vol * 0.6, 0.002, 0.09); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + 0.12); }
    function hatAmb(t) { noiseAt(t, 'highpass', 6000, 5000, 0.03, 0.08, A.amb, 0.5); }
    function hat(t, vol, dest) { noiseAt(t, 'highpass', 8000, 7000, vol, 0.04, dest, 0.5); }
    function noiseAt(t, ftype, f1, f2, vol, dur, dest, q) {
      var ac = A.ac, s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
      s.buffer = A.noise; f.type = ftype; f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur); f.Q.value = q || 0.8;
      env(gn, t, vol, 0.002, dur); s.connect(f); f.connect(gn); gn.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    /* Ruhige Ebene: cleane Zupfgitarre mit Echo und warme Fläche */
    function pluck(t, f, vol) {
      var ac = A.ac, o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), gn = ac.createGain();
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.5);
      var g2 = ac.createGain(); g2.gain.value = 0.3; o2.connect(g2); g2.connect(lp);
      o.connect(lp); lp.connect(gn); env(gn, t, vol, 0.004, 0.9);
      gn.connect(A.amb); gn.connect(A.echo);
      o.start(t); o2.start(t); o.stop(t + 1); o2.stop(t + 1);
    }
    function pad(t, freqs, dur, vol) {
      var ac = A.ac, lp = ac.createBiquadFilter(), gn = ac.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 650;
      gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      freqs.forEach(function (f) { [-8, 8].forEach(function (d) { var o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.05); }); });
      lp.connect(gn); gn.connect(A.amb);
    }
    function bass(t, f, dur, vol, dest) { var ac = A.ac, o = ac.createOscillator(), lp = ac.createBiquadFilter(), gn = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f / 2; lp.type = 'lowpass'; lp.frequency.value = 380; gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(lp); lp.connect(gn); gn.connect(dest); o.start(t); o.stop(t + dur + 0.05); }

    /* Eigene Riffs (Tiefe E-Stimmung). e = gedämpftes E, Großbuchstaben = Powerchords */
    var NOTE = { e: 82.41, E: 82.41, F: 87.31, f: 92.5, G: 98, g: 103.83, A: 110, B: 116.54, C: 130.81, D: 73.42 };
    var RIFF = [
      'eeE-eeG-eeE-A-G-', 'eeE-eeG-eeB-A-F-',
      'eeE-eeG-eeE-A-G-', 'EEEEGGGGAAAABBBB',
      'e-e-E-e-e-G-e-f-', 'e-e-E-e-e-C-B-A-',
      'eeeeE---eeeeG---', 'eeF-eeE-eeD-E---'
    ];
    var KICK = ['x...x...x.x.x...', 'xxxxxxxxxxxxxxxx'], SNARE = '....x.......x...', HAT = 'x.x.x.x.x.x.x.x.';
    /* Ruhige Akkorde (Grundton, Terz, Quinte) – 8 Takte, eigene Folge */
    var CALM = [[164.81, 196, 246.94], [164.81, 196, 246.94], [130.81, 164.81, 196], [146.83, 185, 220], [164.81, 196, 246.94], [164.81, 196, 246.94], [123.47, 146.83, 185], [130.81, 164.81, 196]];
    var ARP = [0, 1, 2, 3, 2, 1, 2, 1];
    var TITLE = ['E-------E---F---', 'E-------D---C---', 'E-------E---F---', 'G-------F---E---'];

    function schedule() {
      if (!A.ac || A.mode === 'off') return;
      var ac = A.ac, ahead = ac.currentTime + 0.25;
      /* Lautstärke zwischen ruhig und Metal überblenden */
      A.intensity += (A.target - A.intensity) * 0.04;
      if (A.mode === 'level') { A.metal.gain.value = A.intensity; A.amb.gain.value = 0.85 - A.intensity * 0.55; }
      else { A.metal.gain.value = 1; A.amb.gain.value = 0; }
      if (A.next < ac.currentTime - 0.3) A.next = ac.currentTime + 0.05;
      while (A.next < ahead) {
        var t = A.next, s = A.step % 16;
        if (A.mode === 'title') {
          var tn = TITLE[A.bar % 4][s];
          if (tn !== '-') { guitar(t, NOTE[tn], 1.3, 0.22, false, A.metal); bass(t, NOTE[tn], 1.3, 0.3, A.metal); }
          if (s === 0 || s === 8) kick(t, 0.5, A.metal);
          if (s === 12) snare(t, 0.25, A.metal);
          A.next += 0.13;
        } else if (A.mode === 'level' || A.mode === 'win') {
          var row = A.mode === 'win' ? 'EEGGAABB' + 'E-------' : RIFF[A.bar % RIFF.length], n = row[s];
          if (n && n !== '-') { var m = n === 'e'; guitar(t, NOTE[n], m ? 0.11 : 0.22, m ? 0.2 : 0.26, m, A.metal); bass(t, NOTE[n], m ? 0.1 : 0.2, 0.32, A.metal); }
          var kp = KICK[A.intensity > 0.8 && A.bar % 4 === 3 ? 1 : 0];
          if (kp[s] === 'x') kick(t, 0.55, A.metal);
          if (SNARE[s] === 'x') snare(t, 0.3, A.metal);
          if (HAT[s] === 'x') hat(t, 0.08, A.metal);
          /* Ruhige Ebene (läuft immer): Zupfgitarre, Fläche, Brummen, Tropfen, fernes Hämmern */
          if (A.mode === 'level') {
            var ch = CALM[A.bar % CALM.length];
            if (s % 2 === 0) { var ti = ARP[(s / 2) % 8], fq = ti === 3 ? ch[0] * 2 : ch[ti]; pluck(t, fq, s === 0 ? 0.16 : 0.11); }
            if (s === 0) {
              pad(t, [ch[0] / 2, ch[1] / 2, ch[2] / 2], 1.7, 0.05);
              var o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine'; o.frequency.value = ch[0] / 4; env(gn, t, 0.16, 0.3, 1.7); o.connect(gn); gn.connect(A.amb); o.start(t); o.stop(t + 1.8);
            }
            if (s === 8 && A.bar % 2) hatAmb(t);
          }
          if (A.mode === 'level' && Math.random() < 0.06) { var o2 = ac.createOscillator(), g2 = ac.createGain(); o2.type = 'sine'; o2.frequency.setValueAtTime(1500 + Math.random() * 900, t); o2.frequency.exponentialRampToValueAtTime(500, t + 0.09); env(g2, t, 0.05, 0.003, 0.1); o2.connect(g2); g2.connect(A.amb); o2.start(t); o2.stop(t + 0.12); }
          if (A.mode === 'level' && s === 6 && A.bar % 3 === 1) noiseAt(t, 'lowpass', 500, 200, 0.06, 0.12, A.amb, 1);
          A.next += 0.1;
          if (A.mode === 'win' && A.step >= 15) { A.mode = 'off'; }
        } else break;
        A.step++;
        if (A.step % 16 === 0) A.bar++;
      }
    }

    return {
      settings: vols,
      update: function () { if (get()) schedule(); },
      music: function (mode) { var a = get(); A.mode = mode; A.step = 0; A.bar = 0; A.intensity = mode === 'level' ? 0 : 1; if (a) A.next = a.ac.currentTime + 0.08; },
      setIntensity: function (v) { A.target = v; },
      stop: function () { A.mode = 'off'; if (A.ac) { try { A.master.gain.setTargetAtTime(0, A.ac.currentTime, 0.05); } catch (e) {} A.ac = null; } },
      /* Effekte */
      fist: function () { tone('sine', 140, 50, 0.12, 0.25); noise(0.06, 'lowpass', 500, 200, 0.25); },
      punchHit: function () { tone('square', 90, 40, 0.1, 0.25); noise(0.08, 'lowpass', 900, 200, 0.35); },
      pistol: function () { noise(0.09, 'highpass', 2200, 700, 0.45); tone('square', 260, 60, 0.09, 0.22); },
      shotgun: function () { noise(0.4, 'lowpass', 4000, 300, 0.75); tone('sine', 110, 35, 0.3, 0.5); noise(0.03, 'highpass', 3000, 2500, 0.25, 0.48); noise(0.03, 'highpass', 2500, 2000, 0.25, 0.62); },
      empty: function () { tone('square', 1800, 1700, 0.025, 0.12); },
      pickup: function () { tone('triangle', 660, 990, 0.07, 0.18); tone('triangle', 990, 1320, 0.08, 0.16, 0.07); },
      armor: function () { tone('square', 330, 660, 0.12, 0.12); tone('square', 495, 990, 0.12, 0.1, 0.06); },
      weapon: function () { var a = get(); if (!a) return; var t = a.ac.currentTime; guitar(t, 82.41, 0.9, 0.35, false, out(0)); kick(t, 0.6, out(0)); },
      keyGet: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone('triangle', f, f, 0.12, 0.14, i * 0.06); }); },
      door: function (pan, vol) { noise(0.7, 'lowpass', 380, 120, 0.4 * (vol || 1), 0, pan); tone('sawtooth', 55, 48, 0.6, 0.08 * (vol || 1), 0, pan); },
      locked: function () { tone('square', 200, 180, 0.12, 0.15); tone('square', 150, 140, 0.15, 0.15, 0.13); },
      secret: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone('triangle', f, f, 0.16, 0.13, i * 0.08); }); },
      buzz: function (kind, pan, vol) { var f = { wespe: 230, wach: 190, flinte: 160, feuer: 140, kami: 300, milbe: 520 }[kind] || 200; tone('sawtooth', f, f * 1.25, 0.18, 0.12 * vol, 0, pan); tone('sawtooth', f * 1.25, f, 0.2, 0.1 * vol, 0.16, pan); },
      enemyShot: function (kind, pan, vol) { if (kind === 'flinte') { noise(0.3, 'lowpass', 3000, 400, 0.45 * vol, 0, pan); } else { noise(0.08, 'highpass', 1800, 600, 0.35 * vol, 0, pan); tone('square', 220, 70, 0.08, 0.16 * vol, 0, pan); } },
      fireball: function (pan, vol) { noise(0.35, 'bandpass', 600, 1800, 0.3 * vol, 0, pan, 2); },
      pain: function (pan, vol) { tone('square', 700, 320, 0.1, 0.12 * vol, 0, pan); },
      splat: function (pan, vol) { noise(0.3, 'bandpass', 900, 160, 0.4 * vol, 0, pan, 1.2); tone('sine', 300, 60, 0.25, 0.22 * vol, 0, pan); },
      boom: function (pan, vol) { noise(1.0, 'lowpass', 1500, 60, 0.9 * vol, 0, pan); tone('sine', 70, 28, 0.7, 0.6 * vol, 0, pan); },
      beep: function (pan, vol) { tone('square', 1900, 1900, 0.05, 0.12 * vol, 0, pan); },
      scream: function (pan, vol) { tone('sawtooth', 950, 320, 1.1, 0.12 * vol, 0, pan); tone('sawtooth', 960, 330, 1.1, 0.08 * vol, 0.02, pan); },
      hurt: function () { tone('square', 230, 110, 0.16, 0.22); noise(0.08, 'lowpass', 700, 200, 0.18); },
      heart: function () { tone('sine', 62, 40, 0.12, 0.35); tone('sine', 58, 38, 0.12, 0.3, 0.2); },
      die: function () { tone('sawtooth', 320, 40, 1.3, 0.25); noise(0.6, 'lowpass', 900, 100, 0.3); },
      bite: function (pan, vol) { noise(0.05, 'highpass', 4000, 3000, 0.2 * vol, 0, pan); },
      lever: function () { tone('square', 120, 90, 0.15, 0.25); noise(0.2, 'lowpass', 900, 200, 0.3); },
      menu: function () { tone('square', 440, 440, 0.04, 0.08); },
      select: function () { tone('square', 660, 880, 0.08, 0.1); },
      gibs: function (pan, vol) { noise(0.25, 'bandpass', 1400, 300, 0.35 * vol, 0, pan, 1.5); }
    };
  }

  /* ------------------------------------------------------------------ Gesicht in der Statusleiste */
  /* Hautfarben zur Auswahl (Kopf der Biene). Standard steht in FACE_SKIN */
  var SKINS = { braun: ['#3A2410', '#2A1C10', '#F7B500'], honig: ['#E9A23B', '#B87A20', '#5A2A08'], hell: ['#F2C9A0', '#D9A980', '#7A3A1A'] };
  var FACE_SKIN = 'braun';
  /* f: { look -1..1, hurt 0..4, pain, grin, rage, dead, ouch, smirk, skin } – Grundausdruck grimmig wie die Helden der 90er */
  function drawFace(g, cx, cy, s, f) {
    var sk = SKINS[f.skin || FACE_SKIN] || SKINS.braun, line = sk[2];
    g.save(); g.translate(cx, cy); g.scale(s, s);
    if (f.dead) g.rotate(0.25);
    /* Fühler */
    g.strokeStyle = '#111'; g.lineWidth = 2.2; g.lineCap = 'round';
    var bent = f.hurt >= 3;
    g.beginPath(); g.moveTo(-6, -14); g.quadraticCurveTo(-11, -24, -15, -25); g.moveTo(6, -14); g.quadraticCurveTo(bent ? 14 : 11, bent ? -18 : -24, bent ? 19 : 15, bent ? -17 : -25); g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.arc(-15, -25, 2.4, 0, TAU); g.arc(bent ? 19 : 15, bent ? -17 : -25, 2.4, 0, TAU); g.fill();
    /* Kopf */
    g.beginPath(); g.arc(0, 2, 17, 0, TAU);
    g.fillStyle = f.rage ? '#9A2A18' : f.dead ? sk[1] : sk[0]; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#111'; g.stroke();
    /* Bartstoppeln / Schatten unten (hart wie ein Kumpel) */
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(0, 12, 11, 6, 0, 0, TAU); g.fill();
    /* Grubenhelm mit Lampe */
    g.save(); if (f.dead) g.rotate(-0.4);
    g.beginPath(); g.ellipse(0, -8, 19, 13, 0, PI, TAU); g.fillStyle = '#F2C200'; g.fill(); g.strokeStyle = '#111'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#C99A00'; g.fillRect(-21, -9, 42, 4); g.strokeRect(-21, -9, 42, 4);
    g.fillStyle = '#5E646C'; g.fillRect(-5, -20, 10, 7); g.fillStyle = f.dead ? '#555' : '#FFF6C0'; g.beginPath(); g.arc(0, -16.5, 3, 0, TAU); g.fill();
    if (f.hurt >= 2) { g.strokeStyle = '#7A5A00'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(9, -16); g.lineTo(12, -11); g.lineTo(10, -8); g.stroke(); }
    g.restore();
    var lx = clamp(f.look, -1, 1) * 2.4;
    if (f.dead) {
      g.strokeStyle = '#FFF'; g.lineWidth = 2;
      [[-6, 3], [6, 3]].forEach(function (e) { g.beginPath(); g.moveTo(e[0] - 3, e[1] - 3); g.lineTo(e[0] + 3, e[1] + 3); g.moveTo(e[0] + 3, e[1] - 3); g.lineTo(e[0] - 3, e[1] + 3); g.stroke(); });
      g.fillStyle = '#E86A8A'; g.beginPath(); g.ellipse(3, 13, 3, 4, 0.3, 0, TAU); g.fill();
      g.strokeStyle = line; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, 11); g.lineTo(6, 11); g.stroke();
    } else if (f.pain) {
      g.strokeStyle = '#FFF'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-9, 1); g.lineTo(-4, 3); g.lineTo(-9, 5); g.moveTo(9, 1); g.lineTo(4, 3); g.lineTo(9, 5); g.stroke();
      g.fillStyle = '#5A0A08'; g.beginPath(); g.ellipse(0, 12, f.ouch ? 4 : 5, f.ouch ? 4.5 : 2.5, 0, 0, TAU); g.fill();
      if (!f.ouch) { g.fillStyle = '#FFF'; g.fillRect(-4, 11, 8, 1.4); }
    } else {
      /* Augen: leicht zusammengekniffen, entschlossen */
      var half = f.hurt >= 4 ? 0.45 : f.rampage ? 0.55 : f.grin ? 0.85 : 0.72;
      [-6, 6].forEach(function (ex, i) {
        var sd = i ? -1 : 1;
        g.fillStyle = '#FFF'; g.beginPath(); g.ellipse(ex, 3.4, 4.2, 4.6 * half, 0, 0, TAU); g.fill();
        g.fillStyle = '#111'; g.beginPath(); g.arc(ex + lx, 3.8, 2, 0, TAU); g.fill();
        /* Augenbrauen: immer schräg nach innen (grimmig), beim fiesen Grinsen noch steiler */
        var hard = f.grin || f.rage || f.rampage;
        g.strokeStyle = '#111'; g.lineWidth = f.rampage ? 3 : hard ? 2.6 : 2.2;
        g.beginPath(); g.moveTo(ex - 5 * sd, f.rampage ? -4.5 : hard ? -3.5 : -2); g.lineTo(ex + 4 * sd, f.rampage ? 1.6 : hard ? 0.5 : -0.2); g.stroke();
      });
      if (f.hurt >= 3) { g.fillStyle = 'rgba(120,60,140,0.8)'; g.beginPath(); g.ellipse(6, 3.4, 6, 6, 0, 0, TAU); g.fill(); g.fillStyle = '#FFF'; g.beginPath(); g.ellipse(6, 3.4, 3.5, 2.2, 0, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(6 + lx, 3.6, 1.6, 0, TAU); g.fill(); }
      /* Mund */
      if (f.rampage) {
        /* Dauerfeuer: gefletschte Zähne, wütend verzogen */
        g.fillStyle = '#3A0A08'; g.beginPath(); g.moveTo(-9, 9.5); g.lineTo(9, 9.5); g.lineTo(7, 15.5); g.lineTo(-7, 15.5); g.closePath(); g.fill();
        g.fillStyle = '#FFF'; for (var t3 = -8; t3 < 8; t3 += 2.8) { g.fillRect(t3, 9.8, 2, 2.4); g.fillRect(t3 + 0.6, 13, 2, 2.3); }
        g.strokeStyle = '#111'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-11, 8); g.lineTo(-8, 10); g.moveTo(11, 8); g.lineTo(8, 10); g.stroke();
      } else if (f.grin) {
        g.fillStyle = '#111'; g.beginPath(); g.moveTo(-9, 9); g.quadraticCurveTo(0, 19, 9, 9); g.closePath(); g.fill();
        g.fillStyle = '#FFF'; for (var t = -7; t < 7; t += 3.4) g.fillRect(t, 9.6, 2.4, 2.6);
      } else if (f.rage || f.hurt >= 2) {
        /* zusammengebissene Zähne */
        g.fillStyle = '#111'; g.fillRect(-7, 10, 14, 4.4); g.fillStyle = '#FFF'; for (var t2 = -6; t2 < 6; t2 += 3) g.fillRect(t2, 10.6, 2, 3.2);
      } else if (f.smirk) {
        g.strokeStyle = line; g.lineWidth = 1.9; g.beginPath(); g.moveTo(-5, 11.5); g.lineTo(2, 11.5); g.quadraticCurveTo(5, 11.2, 6.5, 9); g.stroke();
      } else {
        g.strokeStyle = line; g.lineWidth = 1.9; g.beginPath(); g.moveTo(-5.5, 12.2); g.quadraticCurveTo(0, 10.6, 5.5, 12.2); g.stroke();
      }
    }
    /* Pflaster und Kratzer */
    if (f.hurt >= 1 && !f.dead) { g.save(); g.translate(-11, -2); g.rotate(-0.6); g.fillStyle = '#F2D7B0'; g.fillRect(-5, -2, 10, 4); g.fillStyle = '#C9A880'; g.fillRect(-1, -2, 2, 4); g.restore(); }
    if (f.hurt >= 2 && !f.dead) { g.strokeStyle = '#B3261E'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(10, 9); g.lineTo(14, 13); g.stroke(); }
    g.restore();
  }

  /* ------------------------------------------------------------------ Waffen in der Hand (auf den kleinen Puffer gezeichnet = Pixel-Look) */
  function glove(g, x, y, r, a) { g.save(); g.translate(x, y); g.rotate(a || 0); g.fillStyle = '#8A5A2A'; g.beginPath(); g.ellipse(0, 0, r, r * 0.85, 0, 0, TAU); g.fill(); g.strokeStyle = '#3A2410'; g.lineWidth = Math.max(1, r * 0.12); g.stroke(); g.fillStyle = '#A8763E'; for (var i = 0; i < 3; i++) g.fillRect(-r * 0.6 + i * r * 0.42, -r * 0.7, r * 0.3, r * 0.5); g.restore(); }
  function sleeve(g, x0, y0, x1, y1, w) {
    g.save(); g.lineCap = 'butt';
    var n = 6;
    for (var i = 0; i < n; i++) { var t0 = i / n, t1 = (i + 1) / n; g.strokeStyle = i % 2 ? '#141414' : '#FDC506'; g.lineWidth = w; g.beginPath(); g.moveTo(x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0); g.lineTo(x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1); g.stroke(); }
    g.restore();
  }
  function drawWeapon(g, W, H, wp, o) {
    var u = Math.min(W / 320, H / 170), bx = o.bobX * u, by = o.bobY * u + o.lower * 70 * u;
    g.save(); g.translate(bx, by);
    if (wp === 0) {
      var p = o.anim; /* 0..1 Schlag */
      var k = p > 0 ? Math.sin(Math.min(1, p / 0.6) * PI) : 0;
      var fx = W * 0.66 - k * W * 0.16, fy = H - 22 * u - k * 34 * u, fr = (17 + k * 7) * u;
      sleeve(g, W * 0.95, H + 10 * u, fx + 10 * u, fy + 12 * u, 20 * u);
      glove(g, fx, fy, fr, -0.3 - k * 0.2);
      if (o.rage) { g.globalAlpha = 0.35; g.fillStyle = '#E5322D'; g.beginPath(); g.arc(fx, fy, fr * 1.2, 0, TAU); g.fill(); g.globalAlpha = 1; }
      /* zweite Faust links, ruhend */
      sleeve(g, W * 0.05, H + 10 * u, W * 0.22, H - 8 * u, 18 * u); glove(g, W * 0.24, H - 10 * u, 14 * u, 0.4);
    } else if (wp === 1) {
      var r1 = o.anim > 0 ? Math.max(0, 1 - o.anim * 2.5) : 0, cx = W * 0.56, cy = H - 30 * u + r1 * 10 * u;
      if (o.flash) { g.fillStyle = 'rgba(255,230,120,0.95)'; g.beginPath(); g.arc(cx, cy - 34 * u, 13 * u, 0, TAU); g.fill(); g.fillStyle = '#FFF'; g.beginPath(); g.arc(cx, cy - 34 * u, 6 * u, 0, TAU); g.fill(); }
      sleeve(g, W * 0.78, H + 12 * u, cx + 8 * u, cy + 18 * u, 18 * u);
      g.fillStyle = '#C98A1A'; g.beginPath(); g.moveTo(cx - 9 * u, cy - 26 * u); g.lineTo(cx + 9 * u, cy - 26 * u); g.lineTo(cx + 13 * u, cy + 6 * u); g.lineTo(cx - 13 * u, cy + 6 * u); g.fill();
      g.strokeStyle = '#5A3008'; g.lineWidth = Math.max(1, 1.4 * u); g.stroke();
      g.fillStyle = '#E9A800'; g.fillRect(cx - 7 * u, cy - 24 * u, 3 * u, 26 * u);
      art.hex(g, cx + 2 * u, cy - 10 * u, 4 * u, '#FDC506', '#7A4A10', Math.max(1, u));
      g.fillStyle = '#1A1A1A'; g.fillRect(cx - 2 * u, cy - 30 * u, 4 * u, 5 * u);
      glove(g, cx + 2 * u, cy + 10 * u, 13 * u, 0.1);
    } else {
      var r2 = o.anim > 0 ? Math.max(0, 1 - o.anim * 3) : 0, rl = o.reload, cy2 = H - 18 * u + r2 * 14 * u + rl * 30 * u, cx2 = W * 0.5;
      g.save(); g.translate(cx2, cy2); g.rotate(rl * 0.35);
      if (o.flash) { g.fillStyle = 'rgba(255,220,110,0.95)'; g.beginPath(); g.ellipse(0, -66 * u, 30 * u, 20 * u, 0, 0, TAU); g.fill(); g.fillStyle = '#FFF6C0'; g.beginPath(); g.ellipse(0, -64 * u, 14 * u, 10 * u, 0, 0, TAU); g.fill(); }
      /* zwei Läufe in Perspektive */
      g.fillStyle = '#2E3238'; g.beginPath(); g.moveTo(-15 * u, 8 * u); g.lineTo(15 * u, 8 * u); g.lineTo(7 * u, -58 * u); g.lineTo(-7 * u, -58 * u); g.fill();
      g.fillStyle = '#4A5058'; g.beginPath(); g.moveTo(-13 * u, 8 * u); g.lineTo(-1 * u, 8 * u); g.lineTo(-1 * u, -58 * u); g.lineTo(-6 * u, -58 * u); g.fill();
      g.fillStyle = '#0A0A0A'; g.beginPath(); g.arc(-3.5 * u, -58 * u, 3 * u, 0, TAU); g.arc(3.5 * u, -58 * u, 3 * u, 0, TAU); g.fill();
      g.fillStyle = '#FDC506'; g.fillRect(-1 * u, -40 * u, 2 * u, 34 * u);
      /* Vorderschaft aus Holz */
      g.fillStyle = '#7A5030'; g.beginPath(); g.moveTo(-20 * u, -6 * u); g.lineTo(20 * u, -6 * u); g.lineTo(16 * u, -28 * u); g.lineTo(-16 * u, -28 * u); g.fill();
      g.fillStyle = '#5A3818'; for (var i2 = 0; i2 < 4; i2++) g.fillRect(-14 * u, (-24 + i2 * 5) * u, 28 * u, Math.max(1, u));
      glove(g, -22 * u, -16 * u, 13 * u, 0.5);
      g.restore();
      sleeve(g, W * 0.88, H + 14 * u, cx2 + 18 * u, cy2 + 8 * u, 20 * u);
      glove(g, cx2 + 16 * u, cy2 + 6 * u, 14 * u, -0.2);
    }
    g.restore();
  }

  /* ------------------------------------------------------------------ Sprüche */
  var QUIPS_KILL = ['Sauber, Kumpel!', 'Glück auf!', 'Ab in die Grube!', 'Schicht im Schacht!', 'Das war’s mit Summen.', 'Platz da, Kumpel kommt!', 'Wachs on, Wachs off.', 'Feierabend für dich!', 'Sprücheklopfer wär stolz!', 'Die Maschine nickt anerkennend.'];
  var QUIPS_MULTI = ['Doppelstich!', 'Zwei auf einen Streich!', 'Gemischtes Doppel!'];
  var QUIPS_MASS = ['Wespen-Grillfest!', 'Massenkarambolage!', 'Großreinemachen!'];
  var QUIPS_HURT = ['Aua!', 'Das gibt ’nen Stich.', 'Nicht ins Gesicht!'];
  var QUIPS_DEAD = ['SCHICHT IM SCHACHT!', 'Kumpel, das war nix.', 'Ab in die Waschkaue.'];

  /* ------------------------------------------------------------------ Das Spiel */
  function legendWasp(t) { return function (g, s) { g.scale(s / 64, s / 64); drawWasp(g, t, { wing: 1, blink: true }); }; }
  MBArcade.register({
    id: 'boom',
    title: 'BOOM 2026',
    duration: 0,
    multiTouch: true,
    ownPause: true,
    startText: 'Die Wespen haben die alte Zeche übernommen. Du fährst als Kumpel mit Grubenhelm ein, mit Faust und Stachler. Die Pollenflinte musst du dir erst holen. Am PC mit Maus und WASD, am Handy quer halten. Ton an für die volle Dröhnung!',
    help: {
      legendTitle: 'Gegner',
      controls: [
        { icons: ['kbd:WASD'], text: 'Laufen und seitlich gehen (Shift = langsam)', kb: true },
        { icons: ['kbd:Maus'], text: 'Umsehen und zielen (ins Bild klicken fängt die Maus). Ohne Maus: Pfeiltasten', kb: true },
        { icons: ['kbd:Klick', 'kbd:Strg'], text: 'Schießen', kb: true },
        { icons: ['kbd:E', 'kbd:Leertaste'], text: 'Benutzen: Türen, Schalter, verdächtige Wände', kb: true },
        { icons: ['kbd:1', 'kbd:3'], text: 'Waffe wählen (auch Mausrad oder Q)', kb: true },
        { icons: ['tap'], text: 'Handy quer halten. Links Daumen-Stick zum Laufen, rechts wischen zum Umsehen, roter Knopf schießt, Hand-Knopf benutzt', touch: true },
        { icons: ['kbd:+', 'kbd:−'], text: 'Maus zu schnell oder zu langsam? Im Spiel einfach anpassen', kb: true },
        { icons: ['kbd:Esc'], text: 'Pausenmenü mit Maus- und Ton-Einstellungen', kb: true }
      ],
      legend: [
        { draw: legendWasp('wespe'), text: 'Wespe: schnell, sticht zu', val: '100' },
        { draw: legendWasp('wach'), text: 'Wach-Wespe: schießt, lässt Stachler fallen', val: '150' },
        { draw: legendWasp('flinte'), text: 'Flinten-Wespe: lässt die Pollenflinte fallen', val: '250' },
        { draw: legendWasp('feuer'), text: 'Feuerwespe: wirft Feuerbälle', val: '300' },
        { draw: legendWasp('kami'), text: 'Kamikaze-Wespe: piept und explodiert', val: '200' },
        { draw: function (g, s) { g.scale(s / 64, s / 64); drawMite(g, { wing: 1 }); }, text: 'Varroa-Milbe: krabbelt im Schwarm', val: '50' }
      ]
    },
    cta: { path: 'kontakt/', text: 'Auch eure Website braucht mal ordentlich Wumms? Sprich uns an.' },
    stats: function (s) {
      if (s.headline) return s.line || '';
      var tm = Math.floor(s.time / 60) + ':' + ('0' + Math.floor(s.time % 60)).slice(-2);
      return (s.won ? 'Sohle 1 geschafft' : 'Unter Tage geblieben') + ' auf „' + DIFFS[s.diff].name + '“ in ' + tm + '. Wespen ' + s.kills + '/' + s.killsTotal + ', Geheimnisse ' + s.secrets + '/' + s.secretsTotal + '.' + (s.code ? ' Dein Code für Sohle 2: ' + s.code : '');
    },

    mount: function (ctx) {
      var cv = document.createElement('canvas');
      cv.className = 'mb4-canvas';
      cv.setAttribute('aria-hidden', 'true');
      cv.style.touchAction = 'none';
      ctx.screen.appendChild(cv);
      var g = cv.getContext('2d');
      var lc = document.createElement('canvas'), lg = lc.getContext('2d');
      var TX = null, SP = null;
      var set = { sens: 1, invert: false, music: 0.6, sfx: 0.9, joyLeft: true, skin: 'braun' };
      var au = makeAudio(ctx, set);
      var cssW = 0, cssH = 0, dpr = 1, W = 320, Hv = 180, hudH = 60, img = null, buf = null, zbuf = null, proj = 1;
      var raf = 0, held = {}, selfUnlock = false, locked = false, touchMode = false;
      var unlocked = { malocher: false };
      var st = fresh();
      var L = null; /* aktuelles Level */
      var P = null; /* Spielfigur */

      function fresh() {
        return { phase: 'title', menu: 'main', sel: 0, t: 0, last: 0, on: false, paused: false, msg: [], fire: { t: 0 }, codeMsg: '', titleT: 0 };
      }
      function ensureArt() { if (!TX) { TX = makeTextures(); SP = makeSprites(); } }

      /* ---------------------------------------------------------------- Level laden */
      function loadLevel(n) {
        ensureArt();
        var lv = LEVELS[n], MW = lv.map[0].length, MH = lv.map.length, N = MW * MH;
        L = {
          n: n, lv: lv, MW: MW, MH: MH, solid: new Uint8Array(N), tex: new Array(N), door: new Array(N), zone: new Array(N),
          ftex: new Array(N), ctex: new Array(N), lampL: new Float32Array(N), cellR: new Float32Array(N), cellG: new Float32Array(N), cellB: new Float32Array(N),
          vR: new Float32Array((MW + 1) * (MH + 1)), vG: new Float32Array((MW + 1) * (MH + 1)), vB: new Float32Array((MW + 1) * (MH + 1)),
          ents: [], foes: [], items: [], decor: [], fx: [], balls: [], flow: new Int16Array(N), flowT: 0,
          kills: 0, killsTotal: 0, itemsGot: 0, itemsTotal: 0, secrets: 0, secretsTotal: 0, time: 0, exitOn: false, alarmT: 0
        };
        var posters = 0, lamps = [];
        for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) {
          var i = y * MW + x, c = lv.map[y][x], z = ZONES[lv.zone[y][x]] || ZONES.r;
          L.zone[i] = z; L.ftex[i] = TX.flats[z.floor]; L.ctex[i] = TX.flats[z.ceil];
          if ('#TLWBMKPX'.indexOf(c) >= 0) {
            L.solid[i] = 1;
            L.tex[i] = c === 'P' ? TX.posters[posters++ % TX.posters.length] : TX[c];
            if (c === 'X') L.exitCell = i;
          } else if (c === 'D' || c === 'R' || c === 'S') {
            var hz = '#TLWBMKPX'.indexOf(lv.map[y][x - 1]) >= 0 && '#TLWBMKPX'.indexOf(lv.map[y][x + 1]) >= 0;
            var side = hz ? lv.map[y][x - 1] : lv.map[y - 1][x];
            var d = { x: x, y: y, i: i, kind: c, hz: hz, open: 0, state: 0, timer: 0, tex: c === 'S' ? (TX.secret[side] || TX.secret.B) : TX[c], jamb: c === 'S' ? (TX[side] || TX.B) : TX.J, found: false };
            L.door[i] = d;
            if (c === 'S') L.secretsTotal++;
          } else {
            var ch = c;
            if (ch === 'p') { P = newPlayer(x + 0.5, y + 0.5); }
            else if (FOES[ch]) { L.foes.push(newFoe(+ch, x + 0.5, y + 0.5)); L.killsTotal++; }
            else if (ITEMS[ch]) { L.items.push({ k: ch, x: x + 0.5, y: y + 0.5, t: Math.random() * 6 }); L.itemsTotal++; }
            else if (DECOR[ch]) {
              var dd = DECOR[ch];
              L.decor.push({ k: ch, x: x + 0.5, y: y + 0.5, d: dd, hp: dd.barrel ? 20 : 0, boom: -1 });
              if (dd.light) lamps.push([x, y]);
            }
          }
        }
        lamps.forEach(function (l) { addLamp(l[0], l[1]); });
        L.lightT = 0;
        computeFlow();
      }
      function addLamp(lx, ly) {
        for (var y = Math.max(0, ly - 5); y <= Math.min(L.MH - 1, ly + 5); y++) for (var x = Math.max(0, lx - 5); x <= Math.min(L.MW - 1, lx + 5); x++) {
          var d = Math.hypot(x - lx, y - ly);
          if (d < 4.5 && los(lx + 0.5, ly + 0.5, x + 0.5, y + 0.5, true)) L.lampL[y * L.MW + x] += 0.85 * Math.pow(1 - d / 4.5, 1.4);
        }
      }
      function newPlayer(x, y) {
        return { x: x, y: y, a: -PI / 2, pitch: 0, hp: 100, ar: 0, ammo: { sta: 50, pol: 0 }, has: [true, true, false], wp: 1, want: 1, lower: 0,
          anim: 0, cool: 0, flash: 0, bob: 0, bobAmt: 0, keys: {}, lamp: false, berserk: 0, hurtT: 0, hurtDir: 0, grin: 0, pickT: 0, dead: false, deadT: 0,
          vx: 0, vy: 0, kick: 0, spreadT: 0, painFace: 0, ouch: false, holdT: 0, smirk: 0, shots: 0, hits: 0, dmgTaken: 0, look: 0, lookT: 0, heartT: 0, reload: 0, rageT: 0 };
      }
      function newFoe(type, x, y) {
        var d = FOES[type];
        return { type: type, d: d, key: d.key, x: x, y: y, hp: d.hp * (st.diff >= 2 ? 1.1 : 1), state: 'idle', t: 0, cool: rnd(0.5, 1.5), atkT: 0, painT: 0, dieT: 0,
          z: d.z, phase: Math.random() * TAU, sightT: Math.random() * 0.3, vx: 0, vy: 0, beepT: 0, dead: false, screamed: false, strafe: Math.random() < 0.5 ? 1 : -1, strafeT: rnd(1, 2.5), wake: 0 };
      }

      /* ---------------------------------------------------------------- Welt-Abfragen */
      function cellSolid(x, y, forFoe) {
        if (x < 0 || y < 0 || x >= L.MW || y >= L.MH) return true;
        var i = y * L.MW + x;
        if (L.solid[i]) return true;
        var d = L.door[i];
        if (d) return d.open < 0.92;
        return false;
      }
      /* Sichtlinie (Wände und geschlossene Türteile blockieren) */
      function los(x0, y0, x1, y1, ignoreDoors) {
        var dx = x1 - x0, dy = y1 - y0, dist = Math.hypot(dx, dy);
        if (dist < 0.01) return true;
        var h = ray(x0, y0, dx / dist, dy / dist, ignoreDoors);
        return h.dist >= dist - 0.05;
      }
      /* Einfacher Strahl für Treffer und Sicht: liefert Abstand bis zur Wand */
      var RH = { dist: 0, x: 0, y: 0, door: null };
      function ray(px, py, rdx, rdy, ignoreDoors) {
        var mx = Math.floor(px), my = Math.floor(py);
        var ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
        var sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
        var sdx = rdx < 0 ? (px - mx) * ddx : (mx + 1 - px) * ddx, sdy = rdy < 0 ? (py - my) * ddy : (my + 1 - py) * ddy;
        var side = 0, guard = 0;
        RH.door = null;
        while (guard++ < 200) {
          if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
          if (mx < 0 || my < 0 || mx >= L.MW || my >= L.MH) break;
          var i = my * L.MW + mx;
          if (L.solid[i]) { var dist = side === 0 ? sdx - ddx : sdy - ddy; RH.dist = dist; RH.x = px + rdx * dist; RH.y = py + rdy * dist; return RH; }
          var d = L.door[i];
          if (d && !ignoreDoors) {
            var t, hx;
            if (d.hz) { t = (my + 0.5 - py) / (rdy || 1e-9); hx = px + rdx * t; if (t > 0 && Math.floor(hx) === mx && hx - mx >= d.open) { RH.dist = t; RH.x = hx; RH.y = my + 0.5; RH.door = d; return RH; } }
            else { t = (mx + 0.5 - px) / (rdx || 1e-9); hx = py + rdy * t; if (t > 0 && Math.floor(hx) === my && hx - my >= d.open) { RH.dist = t; RH.x = mx + 0.5; RH.y = hx; RH.door = d; return RH; } }
          }
        }
        RH.dist = 99; RH.x = px + rdx * 99; RH.y = py + rdy * 99;
        return RH;
      }
      /* Kreis gegen Raster bewegen, an Wänden entlanggleiten */
      function blockedAt(x, y, r, self) {
        var x0 = Math.floor(x - r), x1 = Math.floor(x + r), y0 = Math.floor(y - r), y1 = Math.floor(y + r);
        for (var cy = y0; cy <= y1; cy++) for (var cx = x0; cx <= x1; cx++) if (cellSolid(cx, cy)) {
          var nx = clamp(x, cx, cx + 1), ny = clamp(y, cy, cy + 1);
          if ((x - nx) * (x - nx) + (y - ny) * (y - ny) < r * r) return true;
        }
        for (var k = 0; k < L.decor.length; k++) { var o = L.decor[k]; if (o.d.block && !o.gone && (x - o.x) * (x - o.x) + (y - o.y) * (y - o.y) < (r + o.d.r) * (r + o.d.r)) return true; }
        if (self !== P && !P.dead && (x - P.x) * (x - P.x) + (y - P.y) * (y - P.y) < (r + 0.28) * (r + 0.28)) return true;
        for (var j = 0; j < L.foes.length; j++) { var f = L.foes[j]; if (f === self || f.dead || f.state === 'dying') continue; var rr = r + f.d.r * 0.8; if ((x - f.x) * (x - f.x) + (y - f.y) * (y - f.y) < rr * rr) return true; }
        return false;
      }
      function move(e, dx, dy, r) {
        var moved = false;
        if (!blockedAt(e.x + dx, e.y, r, e)) { e.x += dx; moved = true; }
        if (!blockedAt(e.x, e.y + dy, r, e)) { e.y += dy; moved = true; }
        return moved;
      }
      /* Wegekarte: Breitensuche vom Spieler aus (Türen zählen als begehbar, rote/geheime nur offen) */
      function computeFlow() {
        var N = L.MW * L.MH, q = new Int32Array(N), h = 0, t = 0;
        L.flow.fill(-1);
        var s = Math.floor(P.y) * L.MW + Math.floor(P.x);
        L.flow[s] = 0; q[t++] = s;
        while (h < t) {
          var i = q[h++], x = i % L.MW, y = (i - x) / L.MW, nd = L.flow[i] + 1;
          if (nd > 60) continue;
          for (var k = 0; k < 4; k++) {
            var nx = x + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = y + (k === 2 ? 1 : k === 3 ? -1 : 0);
            if (nx < 0 || ny < 0 || nx >= L.MW || ny >= L.MH) continue;
            var j = ny * L.MW + nx;
            if (L.flow[j] >= 0 || L.solid[j]) continue;
            var d = L.door[j];
            if (d && d.kind !== 'D' && d.open < 0.9) continue;
            L.flow[j] = nd; q[t++] = j;
          }
        }
      }

      /* ---------------------------------------------------------------- Meldungen und Juice */
      function msg(text, color) { st.msg.unshift({ text: text, t: 0, c: color || '#F2E9D0' }); if (st.msg.length > 4) st.msg.length = 4; }
      function quip(text, color) { ctx.fx.text(cssW / 2, (cssH - hudH) * 0.32, text, color || '#FDC506', Math.min(30, cssW / 18)); }
      function spatial(x, y) {
        var dx = x - P.x, dy = y - P.y, d = Math.hypot(dx, dy);
        var rel = angNorm(Math.atan2(dy, dx) - P.a);
        return { pan: Math.sin(rel) * 0.8, vol: clamp(1.15 - d / 16, 0.05, 1), d: d };
      }

      /* ---------------------------------------------------------------- Türen, Schalter, Geheimnisse */
      function openDoor(d, byFoe) {
        if (d.state === 1 || d.open > 0.95) { d.timer = 4; return true; }
        if (d.kind === 'R' && !P.keys.red) { if (!byFoe) { if (st.lockMsgT <= 0) { msg('Du brauchst die rote Grubenmarke.', '#FF7A6B'); au.locked(); st.lockMsgT = 1.2; } } return false; }
        if (d.kind === 'S' && byFoe) return false;
        d.state = 1; d.timer = 4;
        var sp = spatial(d.x + 0.5, d.y + 0.5); au.door(sp.pan, sp.vol);
        if (d.kind === 'S' && !d.found) { d.found = true; L.secrets++; addScore(1000); msg('Geheimnis entdeckt!', '#7CFF8A'); au.secret(); quip('Da war was!', '#7CFF8A'); }
        return true;
      }
      function useAction() {
        var ux = P.x + Math.cos(P.a) * 1.0, uy = P.y + Math.sin(P.a) * 1.0;
        var h = ray(P.x, P.y, Math.cos(P.a), Math.sin(P.a), true);
        var hitI = -1;
        if (h.dist < 1.6) { var bx = Math.floor(h.x + Math.cos(P.a) * 0.01), by = Math.floor(h.y + Math.sin(P.a) * 0.01); hitI = by * L.MW + bx; }
        /* Tür direkt vor dir (auch offene Türen zählen nicht) */
        var cx = Math.floor(ux), cy = Math.floor(uy), ci = cy * L.MW + cx;
        if (L.door[ci]) { openDoor(L.door[ci]); return; }
        var ci2 = Math.floor(P.y + Math.sin(P.a) * 0.6) * L.MW + Math.floor(P.x + Math.cos(P.a) * 0.6);
        if (L.door[ci2]) { openDoor(L.door[ci2]); return; }
        if (hitI >= 0 && hitI === L.exitCell) { exitLevel(); return; }
        if (hitI >= 0) { au.empty(); }
      }
      function exitLevel() {
        if (L.exitOn) return;
        L.exitOn = true; L.tex[L.exitCell] = TX.X2; au.lever();
        msg('Förderkorb fährt hoch …', '#FDC506');
        st.exitT = 1.4;
      }

      /* ---------------------------------------------------------------- Punkte */
      function addScore(n) { st.score += n; ctx.setScore(Math.round(st.score * DIFFS[st.diff].mult)); }

      /* ---------------------------------------------------------------- Spieler */
      function damagePlayer(n, fromX, fromY) {
        if (P.dead || st.phase !== 'play') return;
        n = Math.round(n * DIFFS[st.diff].dmg);
        if (n <= 0) return;
        var save = P.ar > 0 ? Math.min(P.ar, Math.floor(n / 3)) : 0;
        P.ar -= save; n -= save;
        P.hp -= n; P.dmgTaken += n;
        P.hurtT = Math.min(1, 0.35 + n / 30);
        P.painFace = 0.5; P.ouch = n >= 20;
        if (fromX !== undefined) { var rel = angNorm(Math.atan2(fromY - P.y, fromX - P.x) - P.a); P.hurtDir = rel; P.look = clamp(rel * 1.5, -1, 1); P.lookT = 1; }
        au.hurt();
        if (n >= 15 && !ctx.reduce) ctx.fx.shake(0.18, 5);
        if (P.hp <= 0) { P.hp = 0; die(); }
        else if (n >= 25 && Math.random() < 0.4) quip(pick(QUIPS_HURT), '#FF7A6B');
      }
      function die() {
        P.dead = true; P.deadT = 0; st.phase = 'dead';
        au.die(); au.music('off');
        releaseMouse();
        st.deadLine = pick(QUIPS_DEAD);
        if (!ctx.reduce) { ctx.fx.flash('229,50,45', 0.7); ctx.fx.shake(0.4, 8); }
      }
      function giveItem(it) {
        var k = ITEMS[it.k], used = false;
        if (k.hp) { var lim = k.hp[1]; if (P.hp < lim) { P.hp = Math.min(lim, P.hp + k.hp[0]); used = true; } }
        if (k.ar) { var lim2 = k.ar[1]; if (P.ar < lim2) { P.ar = Math.min(lim2, P.ar + k.ar[0]); used = true; } }
        if (k.ammo) { var t = k.ammo[0], amt = k.ammo[1] * DIFFS[st.diff].ammo; if (P.ammo[t] < MAXAMMO[t]) { P.ammo[t] = Math.min(MAXAMMO[t], P.ammo[t] + amt); used = true; } }
        if (k.weapon !== undefined && !P.has[k.weapon]) {
          P.has[k.weapon] = true; used = true; P.grin = 1.6; P.want = k.weapon; au.weapon();
          if (!ctx.reduce) ctx.fx.flash('253,197,6', 0.35);
          quip(k.weapon === 2 ? 'POLLENFLINTE!' : 'STACHLER!', '#FDC506');
        } else if (k.weapon !== undefined && used) { /* nur Munition */ }
        if (k.berserk) { P.berserk = 1; P.rageT = 20; used = true; P.want = 0; if (!ctx.reduce) ctx.fx.flash('229,50,45', 0.6); quip('BERSERKER!', '#FF5A4C'); }
        if (k.lamp) { P.lamp = true; used = true; }
        if (k.key) { P.keys[k.key] = true; used = true; au.keyGet(); }
        if (k.pts) addScore(k.pts);
        if (!used) return false;
        msg(k.msg);
        if (k.weapon === undefined && !k.key) { if (k.ar) au.armor(); else au.pickup(); }
        P.pickT = 0.25;
        if (!it.dropped) L.itemsGot++;
        return true;
      }

      /* ---------------------------------------------------------------- Waffen */
      function aimSlope() { return touchMode ? null : P.pitch / proj; }
      /* Treffer entlang eines Strahls: nächster Gegner oder Fass vor der Wand */
      function hitscan(ang, slope, maxD) {
        var dx = Math.cos(ang), dy = Math.sin(ang);
        var w = ray(P.x, P.y, dx, dy);
        var wallD = Math.min(w.dist, maxD || 99), best = null, bestT = wallD;
        function test(o, r, z0, h) {
          var ox = o.x - P.x, oy = o.y - P.y, t = ox * dx + oy * dy;
          if (t <= 0.05 || t >= bestT) return;
          var off = Math.abs(ox * dy - oy * dx);
          if (off > r) return;
          if (slope !== null) {
            var zs = 0.5 + slope * t, tol = 0.1 + 0.04 * t;
            if (zs < z0 - tol || zs > z0 + h + tol) return;
          }
          best = o; bestT = t;
        }
        for (var i = 0; i < L.foes.length; i++) { var f = L.foes[i]; if (f.dead || f.state === 'dying') continue; test(f, f.d.r + 0.06, f.z, f.d.h); }
        for (var k = 0; k < L.decor.length; k++) { var o = L.decor[k]; if (o.d.barrel && !o.gone && o.boom < 0) test(o, 0.3, 0, 0.5); }
        return { obj: best, t: bestT, wall: !best && wallD < (maxD || 99), wx: P.x + dx * (bestT - 0.05), wy: P.y + dy * (bestT - 0.05), z: slope === null ? 0.5 : clamp(0.5 + slope * bestT, 0.05, 0.95) };
      }
      function hurt(o, n, src) {
        if (o.d && o.d.barrel !== undefined && o.boom !== undefined && !o.type) { if (o.gone) return; o.hp -= n; if (o.hp <= 0 && o.boom < 0) o.boom = 0.12; return; }
        hurtFoe(o, n, src);
      }
      function fire() {
        var wp = P.wp, W0 = WEAPONS[wp];
        if (P.cool > 0 || P.lower > 0.05) return;
        if (W0.ammo) {
          var need = 1;
          if (P.ammo[W0.ammo] < need) { au.empty(); P.cool = 0.25; autoSwitch(); return; }
          P.ammo[W0.ammo] -= need;
        }
        P.cool = W0.rate; P.anim = 0.0001; P.shots++;
        if (wp === 0) { au.fist(); P.punchAt = 0.12; return; }
        P.flash = 0.07; st.lightFlash = 0.12;
        if (wp === 1) au.pistol(); else { au.shotgun(); P.reload = 0; P.reloadAt = 0.35; if (!ctx.reduce) ctx.fx.shake(0.12, 4); }
        P.kick = wp === 2 ? 1 : 0.4;
        noiseAlert(wp === 2 ? 14 : 11);
        var slope = aimSlope(), sp = W0.spread * (wp === 1 && P.spreadT > 0 ? 1.8 : (wp === 1 ? 0.3 : 1));
        var any = false;
        for (var k = 0; k < W0.pellets; k++) {
          var a = P.a + (W0.pellets > 1 ? rnd(-sp, sp) : rnd(-sp, sp));
          var sl = slope === null ? null : slope + rnd(-0.02, 0.02) * (wp === 2 ? 1.5 : 0.5);
          var h = hitscan(a, sl);
          if (h.obj) { hurt(h.obj, irnd(W0.dmin, W0.dmax), P); addFx('spritz', h.wx, h.wy, h.z, 0.24); any = true; }
          else if (h.t < 40) addFx('puff', h.wx, h.wy, h.z, 0.3);
        }
        if (any) P.hits++;
        P.spreadT = 0.5;
        if (wp === 2) { /* nachladen sichtbar */ }
      }
      function punch() {
        var best = null, bd = 99, dmg = irnd(2, 20) * (P.berserk ? 10 : 1);
        L.foes.forEach(function (f) {
          if (f.dead || f.state === 'dying') return;
          var dx = f.x - P.x, dy = f.y - P.y, d = Math.hypot(dx, dy);
          var rel = Math.abs(angNorm(Math.atan2(dy, dx) - P.a));
          if (d < WEAPONS[0].range + f.d.r && rel < 0.5 && d < bd && los(P.x, P.y, f.x, f.y)) { best = f; bd = d; }
        });
        L.decor.forEach(function (o) { if (o.d.barrel && !o.gone && o.boom < 0) { var d = Math.hypot(o.x - P.x, o.y - P.y), rel = Math.abs(angNorm(Math.atan2(o.y - P.y, o.x - P.x) - P.a)); if (d < 1.3 && rel < 0.5 && d < bd) { best = o; bd = d; } } });
        if (best) {
          au.punchHit(); hurt(best, dmg, P);
          addFx('spritz', best.x - Math.cos(P.a) * 0.2, best.y - Math.sin(P.a) * 0.2, 0.45, 0.24);
          if (!ctx.reduce) ctx.fx.shake(P.berserk ? 0.15 : 0.08, P.berserk ? 6 : 3);
          if (best.type) { var push = P.berserk ? 0.5 : 0.15; move(best, Math.cos(P.a) * push, Math.sin(P.a) * push, best.d.r); }
        }
      }
      function autoSwitch() {
        if (P.has[2] && P.ammo.pol > 0) P.want = 2;
        else if (P.ammo.sta > 0) P.want = 1;
        else P.want = 0;
      }
      function selectWeapon(n) {
        if (n < 0 || n > 2 || !P.has[n] || P.dead) return;
        if (n === P.wp && P.lower === 0) return;
        P.want = n; au.menu();
      }
      function cycleWeapon(dir) {
        for (var k = 1; k <= 3; k++) { var n = (P.want + dir * k + 3) % 3; if (P.has[n] && (n === 0 || P.ammo[WEAPONS[n].ammo] > 0)) { selectWeapon(n); return; } }
      }
      /* Lärm weckt Gegner in der Nähe (über die Wegekarte, also nicht durch Wände) */
      function noiseAlert(range) {
        for (var i = 0; i < L.foes.length; i++) {
          var f = L.foes[i];
          if (f.dead || f.state !== 'idle') continue;
          var c = L.flow[Math.floor(f.y) * L.MW + Math.floor(f.x)];
          if (c >= 0 && c <= range) wake(f, rnd(0.05, 0.4));
        }
      }
      function wake(f, delay) {
        if (f.state !== 'idle') return;
        f.state = 'chase'; f.wake = delay || 0; f.cool = rnd(0.6, 1.4) * DIFFS[st.diff].cool;
        var sp = spatial(f.x, f.y); au.buzz(f.key, sp.pan, sp.vol);
        if (f.key === 'kami' && !f.screamed) { f.screamed = true; au.scream(sp.pan, sp.vol); }
      }

      /* ---------------------------------------------------------------- Effekte in der Welt */
      function addFx(kind, x, y, z, life) { L.fx.push({ kind: kind, x: x, y: y, z: z, t: 0, life: life }); }
      function explode(x, y, power, src) {
        addFx('boom', x, y, 0.15, 0.5);
        st.lightFlash = 0.35;
        var sp = spatial(x, y); au.boom(sp.pan, sp.vol);
        if (!ctx.reduce) ctx.fx.shake(clamp(0.5 - sp.d * 0.04, 0.1, 0.45), clamp(14 - sp.d, 3, 12));
        var R = 2.6;
        if (!P.dead) { var dp = Math.hypot(P.x - x, P.y - y); if (dp < R && los(x, y, P.x, P.y)) damagePlayer(power * (1 - dp / R) + 4, x, y); }
        L.foes.forEach(function (f) { if (f.dead || f.state === 'dying') return; var d = Math.hypot(f.x - x, f.y - y); if (d < R && los(x, y, f.x, f.y)) hurtFoe(f, power * 1.4 * (1 - d / R) + 6, src || 'boom'); });
        L.decor.forEach(function (o) { if (o.d.barrel && !o.gone && o.boom < 0) { var d = Math.hypot(o.x - x, o.y - y); if (d < R && d > 0.05) o.boom = 0.18 + d * 0.06; } });
        noiseAlert(16);
      }

      /* ---------------------------------------------------------------- Gegner */
      function hurtFoe(f, n, src) {
        if (f.dead || f.state === 'dying') return;
        f.hp -= n; f.flashT = 0.08;
        if (f.state === 'idle') wake(f, 0);
        if (f.hp <= 0) { killFoe(f, src); return; }
        var painChance = { wespe: 0.45, wach: 0.7, flinte: 0.6, feuer: 0.3, kami: 0.15, milbe: 0.5 }[f.key];
        if (Math.random() < painChance) { f.painT = 0.22; f.atkT = 0; var sp = spatial(f.x, f.y); au.pain(sp.pan, sp.vol); }
      }
      function killFoe(f, src) {
        f.state = 'dying'; f.dieT = 0;
        var sp = spatial(f.x, f.y); au.splat(sp.pan, sp.vol); au.gibs(sp.pan, sp.vol * 0.6);
        L.kills++;
        if (src !== 'self') addScore(f.d.pts);
        if (f.d.drop === 'sta') L.items.push({ k: 'G', x: f.x, y: f.y, t: 0, dropped: true });
        if (f.d.drop === 'pol') L.items.push({ k: P.has[2] ? 'c' : 'F', x: f.x, y: f.y, t: 0, dropped: true });
        if (f.key === 'kami') explode(f.x, f.y, f.d.boom, f);
        /* Sprüche: Mehrfach-Treffer, sonst ab und zu */
        st.killWin = (st.killWinT > 0 ? st.killWin : 0) + 1; st.killWinT = 0.7;
        if (st.killWin === 2) quip(pick(QUIPS_MULTI));
        else if (st.killWin === 4) quip(pick(QUIPS_MASS), '#FF9F1A');
        else if (st.killWin === 1 && Math.random() < 0.18) quip(pick(QUIPS_KILL));
      }
      function foeShoot(f) {
        var d = Math.hypot(P.x - f.x, P.y - f.y), sp = spatial(f.x, f.y);
        f.atkT = 0.35;
        if (f.key === 'feuer') {
          var a = Math.atan2(P.y - f.y, P.x - f.x);
          L.balls.push({ x: f.x + Math.cos(a) * 0.4, y: f.y + Math.sin(a) * 0.4, z: f.z + 0.15, vx: Math.cos(a) * 5.2, vy: Math.sin(a) * 5.2, t: 0, src: f });
          au.fireball(sp.pan, sp.vol);
          return;
        }
        au.enemyShot(f.key, sp.pan, sp.vol);
        var moving = Math.hypot(P.vx, P.vy) > 1 ? 0.15 : 0;
        for (var k = 0; k < f.d.pellets; k++) {
          var chance = clamp(0.82 - d * 0.045 - moving, 0.12, 0.9);
          if (Math.random() < chance) damagePlayer(irnd(f.d.shot[0], f.d.shot[1]), f.x, f.y);
        }
      }
      function updateFoe(f, dt) {
        f.t += dt;
        if (f.flashT > 0) f.flashT -= dt;
        if (f.state === 'dying') { f.dieT += dt; if (f.dieT > 0.5) { f.state = 'dead'; f.dead = true; } return; }
        if (f.dead) return;
        var dx = P.x - f.x, dy = P.y - f.y, dist = Math.hypot(dx, dy);
        f.z = f.d.z + (f.d.fly ? Math.sin(f.t * 3 + f.phase) * 0.05 : 0);
        if (f.state === 'idle') {
          f.sightT -= dt;
          if (f.sightT <= 0) { f.sightT = 0.25; if (dist < 17 && !P.dead && los(f.x, f.y, P.x, P.y)) wake(f, rnd(0.1, 0.5)); }
          return;
        }
        if (f.wake > 0) { f.wake -= dt; return; }
        if (P.dead) { f.state = 'idle'; return; }
        if (f.painT > 0) { f.painT -= dt; return; }
        if (f.atkT > 0) { f.atkT -= dt; return; }
        var D = DIFFS[st.diff], spd = f.d.speed * D.speed;
        f.cool -= dt;
        f.sightT -= dt;
        if (f.sightT <= 0) { f.sightT = 0.2; f.see = los(f.x, f.y, P.x, P.y); }
        /* Angriffe */
        if (f.d.melee && dist < f.d.r + 0.28 + 0.35) {
          if (f.cool <= 0) { f.cool = (f.key === 'milbe' ? 0.6 : 0.85) * D.cool; f.atkT = 0.2; damagePlayer(irnd(f.d.melee[0], f.d.melee[1]), f.x, f.y); var sp0 = spatial(f.x, f.y); if (f.key === 'milbe') au.bite(sp0.pan, sp0.vol); else au.pain(sp0.pan, sp0.vol * 0.5); }
          return;
        }
        if (f.key === 'kami') {
          f.beepT -= dt;
          if (f.beepT <= 0) { f.beepT = clamp(dist * 0.08, 0.08, 0.6); var sp1 = spatial(f.x, f.y); au.beep(sp1.pan, sp1.vol); }
          if (dist < f.d.r + 0.28 + 0.25) { killFoe(f, 'self'); return; }
        }
        if ((f.d.shot || f.d.ball) && f.see && dist < 18 && f.cool <= 0) {
          f.cool = rnd(1.3, 2.4) * D.cool * (f.key === 'feuer' ? 1.2 : 1);
          foeShoot(f); return;
        }
        /* Bewegung: direkt auf dich zu, sonst der Wegekarte nach */
        var tx = P.x, ty = P.y;
        if (!f.see) {
          var cx = Math.floor(f.x), cy = Math.floor(f.y), here = L.flow[cy * L.MW + cx], best = here, bx = cx, by = cy;
          for (var k = 0; k < 4; k++) {
            var nx = cx + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = cy + (k === 2 ? 1 : k === 3 ? -1 : 0);
            var v = L.flow[ny * L.MW + nx];
            if (v >= 0 && (best < 0 || v < best)) { best = v; bx = nx; by = ny; }
          }
          tx = bx + 0.5; ty = by + 0.5;
        }
        var mdx = tx - f.x, mdy = ty - f.y, md = Math.hypot(mdx, mdy) || 1;
        var keep = (f.d.shot || f.d.ball) && f.see ? 3.2 : 0;
        var dirx = mdx / md, diry = mdy / md;
        if (keep && dist < keep) { dirx = -dirx * 0.5; diry = -diry * 0.5; }
        /* seitlich ausweichen, damit sie nicht wie Zinnsoldaten ankommen */
        f.strafeT -= dt;
        if (f.strafeT <= 0) { f.strafe = -f.strafe; f.strafeT = rnd(0.8, 2.2); }
        var sw = f.see && f.key !== 'kami' && f.key !== 'milbe' ? 0.45 : f.key === 'milbe' ? 0.25 : 0;
        var vx = (dirx - diry * f.strafe * sw) * spd, vy = (diry + dirx * f.strafe * sw) * spd;
        var moved = move(f, vx * dt, vy * dt, f.d.r);
        /* Türen öffnen, wenn sie davor stehen */
        var fi = Math.floor(f.y + diry * 0.6) * L.MW + Math.floor(f.x + dirx * 0.6);
        if (L.door[fi] && L.door[fi].kind === 'D') openDoor(L.door[fi], true);
        if (!moved) f.strafe = -f.strafe;
      }

      /* ---------------------------------------------------------------- Ablauf im Spiel */
      function updatePlay(dt) {
        L.time += dt;
        st.t += dt;
        if (st.lockMsgT > 0) st.lockMsgT -= dt;
        if (st.killWinT > 0) st.killWinT -= dt;
        if (st.lightFlash > 0) st.lightFlash -= dt;
        /* Spieler bewegen */
        var fwd = 0, side = 0, turn = 0;
        if (held.KeyW || held.ArrowUp) fwd += 1;
        if (held.KeyS || held.ArrowDown) fwd -= 1;
        if (held.KeyA) side -= 1;
        if (held.KeyD) side += 1;
        if (held.ArrowLeft) turn -= 1;
        if (held.ArrowRight) turn += 1;
        if (joy) { fwd += clamp(-joy.dy, -1, 1); side += clamp(joy.dx, -1, 1); }
        var spd = (held.ShiftLeft || held.ShiftRight ? 2.1 : 3.9);
        var len = Math.hypot(fwd, side); if (len > 1) { fwd /= len; side /= len; }
        P.a += turn * 2.6 * dt * set.sens;
        var ca = Math.cos(P.a), sa = Math.sin(P.a);
        var tvx = (ca * fwd - sa * side) * spd, tvy = (sa * fwd + ca * side) * spd;
        P.vx += (tvx - P.vx) * Math.min(1, dt * 12); P.vy += (tvy - P.vy) * Math.min(1, dt * 12);
        if (!P.dead) {
          move(P, P.vx * dt, P.vy * dt, 0.27);
          /* gegen eine Tür laufen öffnet sie (praktisch am Handy) */
          if (len > 0.3) { var di = Math.floor(P.y + sa * 0.55 * Math.sign(fwd || 1)) * L.MW + Math.floor(P.x + ca * 0.55 * Math.sign(fwd || 1)); var dd = L.door[di]; if (dd && dd.kind !== 'S' && dd.state === 0) openDoor(dd); }
        }
        var sp = Math.hypot(P.vx, P.vy);
        P.bobAmt += ((sp > 0.5 ? 1 : 0) - P.bobAmt) * Math.min(1, dt * 6);
        P.bob += dt * sp * 2.2;
        /* Waffe wechseln (runter, wechseln, hoch) */
        if (P.want !== P.wp) { P.lower = Math.min(1, P.lower + dt * 5); if (P.lower >= 1) { P.wp = P.want; } }
        else if (P.lower > 0) P.lower = Math.max(0, P.lower - dt * 5);
        if (P.cool > 0) P.cool -= dt;
        if (P.anim > 0) { P.anim += dt / WEAPONS[P.wp].rate; if (P.anim >= 1) P.anim = 0; }
        if (P.punchAt > 0) { P.punchAt -= dt; if (P.punchAt <= 0) punch(); }
        if (P.reloadAt > 0) { P.reloadAt -= dt; if (P.reloadAt <= 0) P.reloadT = 0.5; }
        if (P.reloadT > 0) { P.reloadT -= dt; P.reload = Math.sin((1 - P.reloadT / 0.5) * PI); if (P.reloadT <= 0) P.reload = 0; }
        if (P.flash > 0) P.flash -= dt;
        if (P.kick > 0) P.kick = Math.max(0, P.kick - dt * 5);
        if (P.spreadT > 0) P.spreadT -= dt;
        if (P.hurtT > 0) P.hurtT -= dt * 1.4;
        if (P.painFace > 0) P.painFace -= dt;
        if (P.grin > 0) P.grin -= dt;
        if (P.pickT > 0) P.pickT -= dt;
        if (P.rageT > 0) P.rageT -= dt;
        /* Feuern (Maus, Strg oder Touch-Knopf gedrückt halten) */
        if ((held.mouse || held.ControlLeft || held.ControlRight || held.KeyF || held.touchFire) && !P.dead) { fire(); P.holdT = (P.holdT || 0) + dt; }
        else P.holdT = 0;
        /* Gesicht schaut ab und zu herum */
        P.lookT -= dt;
        if (P.lookT <= 0) { P.lookT = rnd(0.8, 2.2); P.look = pick([-1, 0, 0, 1]); if (Math.random() < 0.12) P.smirk = 1.2; }
        if (P.smirk > 0) P.smirk -= dt;
        /* Herzklopfen bei wenig Leben */
        if (P.hp < 25 && !P.dead) { P.heartT -= dt; if (P.heartT <= 0) { P.heartT = 1.1; au.heart(); } }
        /* Gegenstände */
        for (var i = L.items.length - 1; i >= 0; i--) {
          var it = L.items[i]; it.t += dt;
          if (!P.dead && (it.x - P.x) * (it.x - P.x) + (it.y - P.y) * (it.y - P.y) < 0.45 && giveItem(it)) L.items.splice(i, 1);
        }
        /* Türen */
        for (var k in L.door) {
          var d = L.door[k]; if (!d) continue;
          if (d.state === 1) { d.open = Math.min(1, d.open + dt * 1.6); if (d.open >= 1 && d.kind !== 'S') { d.timer -= dt; if (d.timer <= 0 && !occupied(d)) { d.state = 0; var s2 = spatial(d.x + 0.5, d.y + 0.5); au.door(s2.pan, s2.vol * 0.7); } } }
          else if (d.open > 0) { d.open = Math.max(0, d.open - dt * 1.6); if (occupied(d)) d.state = 1; }
        }
        /* Gegner, Feuerbälle, Fässer, Effekte */
        L.flowT -= dt; if (L.flowT <= 0) { L.flowT = 0.35; computeFlow(); }
        var alerted = 0;
        for (var j = 0; j < L.foes.length; j++) { var f = L.foes[j]; updateFoe(f, dt); if (!f.dead && f.state !== 'idle' && f.state !== 'dying' && Math.hypot(f.x - P.x, f.y - P.y) < 16) alerted++; }
        au.setIntensity(alerted > 0 ? 1 : 0);
        for (var b = L.balls.length - 1; b >= 0; b--) {
          var bl = L.balls[b]; bl.t += dt;
          bl.x += bl.vx * dt; bl.y += bl.vy * dt;
          var hitP = !P.dead && Math.hypot(bl.x - P.x, bl.y - P.y) < 0.38;
          if (hitP || cellSolid(Math.floor(bl.x), Math.floor(bl.y)) || bl.t > 6) {
            if (hitP) damagePlayer(irnd(8, 20), bl.x - bl.vx, bl.y - bl.vy);
            addFx('boomS', bl.x - bl.vx * 0.02, bl.y - bl.vy * 0.02, bl.z - 0.1, 0.3);
            var s3 = spatial(bl.x, bl.y); au.splat(s3.pan, s3.vol * 0.5);
            L.balls.splice(b, 1);
          }
        }
        L.decor.forEach(function (o) { if (o.boom > 0) { o.boom -= dt; if (o.boom <= 0) { o.boom = -2; o.gone = true; explode(o.x, o.y, 80, 'boom'); } } });
        for (var e = L.fx.length - 1; e >= 0; e--) { L.fx[e].t += dt; if (L.fx[e].t >= L.fx[e].life) L.fx.splice(e, 1); }
        for (var m = st.msg.length - 1; m >= 0; m--) { st.msg[m].t += dt; if (st.msg[m].t > 3) st.msg.splice(m, 1); }
        if (st.exitT > 0) { st.exitT -= dt; if (st.exitT <= 0) finishLevel(); }
      }
      function occupied(d) {
        var cx = d.x + 0.5, cy = d.y + 0.5;
        if (Math.abs(P.x - cx) < 0.8 && Math.abs(P.y - cy) < 0.8) return true;
        return L.foes.some(function (f) { return !f.dead && f.state !== 'dying' && Math.abs(f.x - cx) < 0.8 && Math.abs(f.y - cy) < 0.8; });
      }

      /* ---------------------------------------------------------------- Größe */
      function layout() {
        var r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        cssW = r.width; cssH = r.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
        hudH = Math.round(clamp(cssH * 0.13, 44, 84));
        var vh = cssH - hudH;
        W = Math.round(clamp(cssW / (cssW > 900 ? 3 : 2.6), 200, 440));
        Hv = Math.max(100, Math.round(W * vh / cssW));
        lc.width = W; lc.height = Hv;
        img = lg.createImageData(W, Hv); buf = new Uint32Array(img.data.buffer); zbuf = new Float32Array(W);
        proj = (W / 2) / 0.66;
        coneX = new Float32Array(W);
        for (var x = 0; x < W; x++) { var cx = (x - W / 2) / (W * 0.42); coneX[x] = cx * cx; }
      }
      var coneX = null;

      /* ---------------------------------------------------------------- Licht je Feld (jedes Bild neu: Flackern, Alarm, Mündungsfeuer) */
      function updateLight() {
        var MW = L.MW, MH = L.MH, t = st.t, fl = st.lightFlash > 0 ? st.lightFlash * 3 : 0;
        var flick = Math.sin(t * 31) > 0.93 || Math.sin(t * 7.3) > 0.985 ? 0.45 : 1;
        var alarm = 0.55 + 0.45 * Math.max(0, Math.sin(t * 3.6));
        for (var i = 0; i < MW * MH; i++) {
          if (L.solid[i]) { L.cellR[i] = L.cellG[i] = L.cellB[i] = -1; continue; }
          var z = L.zone[i], m = z.flicker ? flick : z.alarm ? alarm : 1, b = z.light * m, lp = L.lampL[i];
          var x = i % MW, y = (i - x) / MW, add = 0;
          if (fl) { var d = Math.hypot(x + 0.5 - P.x, y + 0.5 - P.y); if (d < 6) add = fl * (1 - d / 6); }
          L.cellR[i] = b * z.tint[0] + lp * 1.1 + add; L.cellG[i] = b * z.tint[1] + lp * 0.92 + add * 0.85; L.cellB[i] = b * z.tint[2] + lp * 0.65 + add * 0.5;
        }
        var VW = MW + 1;
        for (var vy = 0; vy <= MH; vy++) for (var vx = 0; vx <= MW; vx++) {
          var sr = 0, sg = 0, sb = 0, n = 0;
          for (var k = 0; k < 4; k++) {
            var cx = vx - 1 + (k & 1), cy = vy - 1 + (k >> 1);
            if (cx < 0 || cy < 0 || cx >= MW || cy >= MH) continue;
            var j = cy * MW + cx; if (L.cellR[j] < 0) continue;
            sr += L.cellR[j]; sg += L.cellG[j]; sb += L.cellB[j]; n++;
          }
          var vi = vy * VW + vx;
          if (n) { L.vR[vi] = sr / n; L.vG[vi] = sg / n; L.vB[vi] = sb / n; } else { L.vR[vi] = L.vG[vi] = L.vB[vi] = 0; }
        }
      }
      var LT = [0, 0, 0];
      function lightAt(x, y) {
        var VW = L.MW + 1, ix = Math.floor(x), iy = Math.floor(y);
        if (ix < 0 || iy < 0 || ix >= L.MW || iy >= L.MH) { LT[0] = LT[1] = LT[2] = 0; return LT; }
        var fx = x - ix, fy = y - iy, i0 = iy * VW + ix, i1 = i0 + 1, i2 = i0 + VW, i3 = i2 + 1;
        var a = (1 - fx) * (1 - fy), b = fx * (1 - fy), c = (1 - fx) * fy, d = fx * fy;
        LT[0] = L.vR[i0] * a + L.vR[i1] * b + L.vR[i2] * c + L.vR[i3] * d;
        LT[1] = L.vG[i0] * a + L.vG[i1] * b + L.vG[i2] * c + L.vG[i3] * d;
        LT[2] = L.vB[i0] * a + L.vB[i1] * b + L.vB[i2] * c + L.vB[i3] * d;
        return LT;
      }
      /* Helmlampe: Lichtkegel in der Bildmitte, nimmt mit der Entfernung ab */
      function lampDist(d) { return P.lamp ? 1.15 * Math.pow(clamp(1 - d / 10, 0, 1), 1.25) : 0.35 * clamp(1 - d / 3, 0, 1); }
      function shade(c, r, g2, b) {
        var R = (c & 255) * r, G = ((c >> 8) & 255) * g2, B = ((c >> 16) & 255) * b;
        return 0xff000000 | ((B > 255 ? 255 : B) << 16) | ((G > 255 ? 255 : G) << 8) | (R > 255 ? 255 : R);
      }

      /* ---------------------------------------------------------------- 3D-Bild */
      function render3D() {
        var dirX = Math.cos(P.a), dirY = Math.sin(P.a), K = 0.66, plX = -dirY * K, plY = dirX * K;
        var bobY = ctx.reduce ? 0 : Math.sin(P.bob * 2) * 1.3 * P.bobAmt * (W / 320);
        var dead = P.dead ? Math.min(1, P.deadT / 0.8) : 0;
        var hor = Hv / 2 + P.pitch + bobY + dead * Hv * 0.22;
        st.hor = hor;
        var MW = L.MW, MH = L.MH, VW = MW + 1, vR = L.vR, vG = L.vG, vB = L.vB, fallback = TX.flats.fels;
        var rx0 = dirX - plX, ry0 = dirY - plY, rx1 = dirX + plX, ry1 = dirY + plY;
        var coneYk = Hv * 0.55;
        /* Boden und Decke */
        for (var y = 0; y < Hv; y++) {
          var p = y + 0.5 - hor, row = y * W;
          if (Math.abs(p) < 0.6) { for (var xx = 0; xx < W; xx++) buf[row + xx] = 0xff000000; continue; }
          var isF = p > 0, rd = (0.5 * proj) / Math.abs(p);
          var stx = rd * (rx1 - rx0) / W, sty = rd * (ry1 - ry0) / W, fx = P.x + rd * rx0, fy = P.y + rd * ry0;
          var fog = 1 / (1 + rd * 0.06), ld = lampDist(rd) * (isF ? 1 : 0.8);
          var cy2 = (y - hor) / coneYk, cyy = cy2 * cy2;
          for (var x = 0; x < W; x++, fx += stx, fy += sty) {
            var ix = fx | 0, iy = fy | 0;
            if (fx < 0 || fy < 0 || ix >= MW || iy >= MH) { buf[row + x] = 0xff000000; continue; }
            var i = iy * MW + ix, tex = (isF ? L.ftex[i] : L.ctex[i]) || fallback;
            var c = tex[(((fy - iy) * 64) | 0) * 64 + (((fx - ix) * 64) | 0)];
            var ffx = fx - ix, ffy = fy - iy, v0 = iy * VW + ix, a = (1 - ffx) * (1 - ffy), b = ffx * (1 - ffy), cc = (1 - ffx) * ffy, d = ffx * ffy;
            var lr = vR[v0] * a + vR[v0 + 1] * b + vR[v0 + VW] * cc + vR[v0 + VW + 1] * d;
            var lgg = vG[v0] * a + vG[v0 + 1] * b + vG[v0 + VW] * cc + vG[v0 + VW + 1] * d;
            var lb = vB[v0] * a + vB[v0 + 1] * b + vB[v0 + VW] * cc + vB[v0 + VW + 1] * d;
            var cone = 1.25 - Math.sqrt(coneX[x] + cyy); cone = cone < 0 ? 0 : cone > 1 ? 1 : cone;
            var lamp = cone * ld;
            buf[row + x] = shade(c, lr * fog + lamp, lgg * fog + lamp * 0.95, lb * fog + lamp * 0.82);
          }
        }
        /* Wände */
        for (var x2 = 0; x2 < W; x2++) {
          var cam = 2 * x2 / W - 1, rdx = dirX + plX * cam, rdy = dirY + plY * cam;
          var mx = Math.floor(P.x), my = Math.floor(P.y);
          var ddx = Math.abs(1 / (rdx || 1e-9)), ddy = Math.abs(1 / (rdy || 1e-9));
          var sx = rdx < 0 ? -1 : 1, sy = rdy < 0 ? -1 : 1;
          var sdx = rdx < 0 ? (P.x - mx) * ddx : (mx + 1 - P.x) * ddx, sdy = rdy < 0 ? (P.y - my) * ddy : (my + 1 - P.y) * ddy;
          var side = 0, hit = false, dist = 30, tex2 = null, u = 0, prevDoor = null, guard = 0, hx = 0, hy = 0;
          while (guard++ < 128) {
            if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; }
            if (mx < 0 || my < 0 || mx >= MW || my >= MH) break;
            var ci = my * MW + mx;
            if (L.solid[ci]) {
              dist = side === 0 ? sdx - ddx : sdy - ddy;
              var wx = side === 0 ? P.y + dist * rdy : P.x + dist * rdx; wx -= Math.floor(wx);
              u = wx; if ((side === 0 && rdx < 0) || (side === 1 && rdy > 0)) u = 1 - u;
              tex2 = prevDoor ? prevDoor.jamb : L.tex[ci];
              hx = P.x + rdx * (dist - 0.02); hy = P.y + rdy * (dist - 0.02);
              hit = true; break;
            }
            var dr = L.door[ci];
            if (dr) {
              var t, hh;
              if (dr.hz) { t = (my + 0.5 - P.y) / rdy; hh = P.x + rdx * t; if (t > 0 && Math.floor(hh) === mx && hh - mx >= dr.open) { dist = t; u = hh - mx - dr.open; tex2 = dr.tex; hx = hh; hy = my + 0.5 - sy * 0.02; hit = true; side = 1; break; } }
              else { t = (mx + 0.5 - P.x) / rdx; hh = P.y + rdy * t; if (t > 0 && Math.floor(hh) === my && hh - my >= dr.open) { dist = t; u = hh - my - dr.open; tex2 = dr.tex; hx = mx + 0.5 - sx * 0.02; hy = hh; hit = true; side = 0; break; } }
              prevDoor = dr;
            } else prevDoor = null;
          }
          zbuf[x2] = hit ? dist : 99;
          if (!hit) continue;
          var lh = proj / dist, top = hor - lh * 0.5, bot = hor + lh * 0.5;
          var y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(Hv, Math.ceil(bot));
          var tu = clamp((u * 64) | 0, 0, 63), Lw = lightAt(hx, hy), sd = side ? 0.82 : 1, fog2 = 1 / (1 + dist * 0.06), ld2 = lampDist(dist);
          var lr2 = Lw[0] * fog2 * sd, lg2 = Lw[1] * fog2 * sd, lb2 = Lw[2] * fog2 * sd, vstep = 64 / lh;
          for (var y2 = y0; y2 < y1; y2++) {
            var tv = ((y2 + 0.5 - top) * vstep) | 0; if (tv > 63) tv = 63; else if (tv < 0) tv = 0;
            var cyw = (y2 - hor) / coneYk, cone2 = 1.25 - Math.sqrt(coneX[x2] + cyw * cyw); cone2 = cone2 < 0 ? 0 : cone2 > 1 ? 1 : cone2;
            var lamp2 = cone2 * ld2 * sd;
            buf[y2 * W + x2] = shade(tex2[tv * 64 + tu], lr2 + lamp2, lg2 + lamp2 * 0.95, lb2 + lamp2 * 0.82);
          }
        }
        renderSprites(dirX, dirY, plX, plY, hor);
      }

      /* ---------------------------------------------------------------- Sprites */
      var drawList = [];
      function pushSpr(img2, x, y, z, h, full, flash) { drawList.push({ img: img2, x: x, y: y, z: z, h: h, full: full, flash: flash, d: 0 }); }
      function collectSprites() {
        drawList.length = 0;
        var t = st.t;
        L.decor.forEach(function (o) {
          if (o.gone) return;
          var s = SP[o.d.spr];
          if (o.k === 'i') pushSpr(s, o.x, o.y, 0, 1, false);
          else if (o.k === 'n') pushSpr(s, o.x, o.y, 0, 0.56, false);
          else if (o.k === 'o') pushSpr(s, o.x, o.y, 0, 0.6, false, o.boom > 0);
          else if (o.k === 'l') pushSpr(s, o.x, o.y, 0.5, 0.5, true);
        });
        L.items.forEach(function (it) { var s = SP[ITEMS[it.k].spr]; pushSpr(s, it.x, it.y, 0, 0.5, it.k === 'y' || it.k === 'z', false); });
        L.foes.forEach(function (f) {
          var S = SP[f.key], img2, h = f.key === 'milbe' ? 0.36 : 0.66, z = f.key === 'milbe' ? 0 : f.z - 0.1, full = false;
          if (f.dead) { img2 = S.die[2]; z = 0; h = 0.55; }
          else if (f.state === 'dying') { img2 = S.die[Math.min(1, Math.floor(f.dieT / 0.2))]; }
          else if (f.atkT > 0) { img2 = S.atk; full = f.key === 'feuer' || f.key === 'wach' || f.key === 'flinte'; }
          else img2 = S.fly[Math.floor(t * (f.key === 'milbe' ? 10 : 16) + f.phase) % 2];
          pushSpr(img2, f.x, f.y, z, h, full, f.flashT > 0 || f.painT > 0);
        });
        L.balls.forEach(function (b) { pushSpr(SP.ball[Math.floor(b.t * 12) % 2], b.x, b.y, b.z - 0.14, 0.28, true); });
        L.fx.forEach(function (e) {
          var k = e.t / e.life;
          if (e.kind === 'puff') pushSpr(SP.puff[Math.min(2, Math.floor(k * 3))], e.x, e.y, e.z - 0.06, 0.12, false);
          else if (e.kind === 'spritz') pushSpr(SP.spritz[Math.min(2, Math.floor(k * 3))], e.x, e.y, e.z - 0.08, 0.16, true);
          else if (e.kind === 'boom') pushSpr(SP.fassBoom[Math.min(2, Math.floor(k * 3))], e.x, e.y, 0, 1.2, true);
          else if (e.kind === 'boomS') pushSpr(SP.fassBoom[Math.min(2, Math.floor(k * 3))], e.x, e.y, e.z - 0.15, 0.45, true);
        });
      }
      function renderSprites(dirX, dirY, plX, plY, hor) {
        collectSprites();
        var inv = 1 / (plX * dirY - dirX * plY);
        for (var i = 0; i < drawList.length; i++) {
          var s = drawList[i], dx = s.x - P.x, dy = s.y - P.y;
          s.d = inv * (-plY * dx + plX * dy); s.tx = inv * (dirY * dx - dirX * dy);
        }
        drawList.sort(function (a, b) { return b.d - a.d; });
        for (var k = 0; k < drawList.length; k++) {
          var sp = drawList[k];
          if (sp.d < 0.12) continue;
          var im = sp.img, hpx = sp.h * proj / sp.d, wpx = hpx * im.w / im.h;
          var scx = (W / 2) * (1 + sp.tx / sp.d);
          var x0 = scx - wpx / 2, top = hor - (sp.z + sp.h - 0.5) * proj / sp.d;
          var xs = Math.max(0, Math.ceil(x0)), xe = Math.min(W, Math.ceil(x0 + wpx));
          if (xs >= xe) continue;
          var ys = Math.max(0, Math.ceil(top)), ye = Math.min(Hv, Math.ceil(top + hpx));
          if (ys >= ye) continue;
          var Ls = sp.full ? [1.15, 1.1, 1.05] : lightAt(sp.x, sp.y).slice(), fog = sp.full ? 1 : 1 / (1 + sp.d * 0.06);
          var cxn = (scx - W / 2) / (W * 0.42), cyn = (top + hpx / 2 - hor) / (Hv * 0.55), cone = clamp(1.25 - Math.sqrt(cxn * cxn + cyn * cyn), 0, 1);
          var lamp = sp.full ? 0 : cone * lampDist(sp.d), fla = sp.flash ? 0.9 : 0;
          var lr = Ls[0] * fog + lamp + fla, lgg = Ls[1] * fog + lamp * 0.95 + fla, lb = Ls[2] * fog + lamp * 0.82 + fla;
          var us = im.w / wpx, vs = im.h / hpx;
          for (var x = xs; x < xe; x++) {
            if (sp.d >= zbuf[x]) continue;
            var u = ((x + 0.5 - x0) * us) | 0; if (u >= im.w) u = im.w - 1;
            for (var y = ys; y < ye; y++) {
              var v = ((y + 0.5 - top) * vs) | 0; if (v >= im.h) v = im.h - 1;
              var c = im.px[v * im.w + u];
              if ((c >>> 24) < 128) continue;
              buf[y * W + x] = shade(c, lr, lgg, lb);
            }
          }
        }
      }

      /* ---------------------------------------------------------------- Bild zusammensetzen */
      function drawPlay() {
        updateLight();
        render3D();
        lg.putImageData(img, 0, 0);
        /* Fadenkreuz und Waffe auf den kleinen Puffer (Pixel-Look) */
        if (!P.dead) {
          var bx = ctx.reduce ? 0 : Math.cos(P.bob) * 6 * P.bobAmt, by = ctx.reduce ? 0 : Math.abs(Math.sin(P.bob)) * 5 * P.bobAmt + P.kick * 6;
          drawWeapon(lg, W, Hv, P.wp, { anim: P.anim, flash: P.flash > 0, bobX: bx, bobY: by, lower: P.lower, rage: P.rageT > 0, reload: P.reload || 0 });
          lg.fillStyle = 'rgba(255,255,255,0.75)';
          var cx = Math.round(W / 2), cy = Math.round(Hv / 2);
          lg.fillRect(cx - 3, cy, 2, 1); lg.fillRect(cx + 2, cy, 2, 1); lg.fillRect(cx, cy - 3, 1, 2); lg.fillRect(cx, cy + 2, 1, 2);
        }
        var vh = cssH - hudH;
        g.imageSmoothingEnabled = false;
        g.drawImage(lc, 0, 0, cssW, vh);
        /* Farbschleier: Schaden rot, Aufheben gelb, Berserker rot, Tod */
        if (P.hurtT > 0) { g.fillStyle = 'rgba(200,20,10,' + Math.min(0.55, P.hurtT * 0.5) + ')'; g.fillRect(0, 0, cssW, vh); }
        if (P.pickT > 0) { g.fillStyle = 'rgba(253,197,6,' + P.pickT * 0.6 + ')'; g.fillRect(0, 0, cssW, vh); }
        if (P.rageT > 0) { g.fillStyle = 'rgba(229,50,45,' + Math.min(0.22, P.rageT * 0.03) + ')'; g.fillRect(0, 0, cssW, vh); }
        if (P.hp < 25 && !P.dead) { var pulse = 0.18 + Math.sin(st.t * 6) * 0.08; var vg = g.createRadialGradient(cssW / 2, vh / 2, vh * 0.3, cssW / 2, vh / 2, cssW * 0.7); vg.addColorStop(0, 'rgba(120,0,0,0)'); vg.addColorStop(1, 'rgba(160,0,0,' + pulse + ')'); g.fillStyle = vg; g.fillRect(0, 0, cssW, vh); }
        if (P.dead) { g.fillStyle = 'rgba(120,0,0,' + Math.min(0.6, P.deadT * 0.4) + ')'; g.fillRect(0, 0, cssW, vh); }
        drawHud();
        /* Meldungen oben links (Pixel-Schrift wie früher) */
        var s = Math.max(2, Math.round(cssW / 400));
        var maxC = Math.max(12, Math.floor((cssW - 20) / (4 * s))), line = 0;
        st.msg.forEach(function (m) {
          g.globalAlpha = clamp(3 - m.t, 0, 1);
          var words = String(m.text).split(' '), rows = [], cur = '';
          words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (t.length > maxC && cur) { rows.push(cur); cur = w; } else cur = t; });
          rows.push(cur);
          rows.forEach(function (r) { pixText(g, r, 10 + s, 10 + line * 8 * s + s, s, 'rgba(0,0,0,0.7)'); pixText(g, r, 10, 10 + line * 8 * s, s, m.c); line++; });
        });
        g.globalAlpha = 1;
        if (touchMode && cssH > cssW && st.t < 7 && !P.dead) {
          g.font = '800 14px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillStyle = 'rgba(0,0,0,0.6)'; art.rrect(g, cssW / 2 - 120, vh * 0.16, 240, 30, 15); g.fill();
          g.fillStyle = '#FDC506'; g.fillText('Tipp: Handy quer halten! ↻', cssW / 2, vh * 0.16 + 15);
        }
        if (touchMode && !P.dead) drawTouch();
        else if (!locked && !P.dead && st.phase === 'play' && st.t < 600) {
          var hint = 'Klick ins Bild: Maus fangen';
          g.font = '700 ' + Math.round(clamp(cssW / 50, 11, 15)) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          var tw = g.measureText(hint).width + 24;
          g.fillStyle = 'rgba(0,0,0,0.6)'; art.rrect(g, cssW / 2 - tw / 2, vh - 44, tw, 28, 14); g.fill();
          g.fillStyle = '#FDC506'; g.fillText(hint, cssW / 2, vh - 30);
        }
        if (P.dead) drawDeadText();
      }

      /* ---------------------------------------------------------------- Statusleiste */
      function panel(x, y, w, h) {
        var gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#3A3F46'); gr.addColorStop(1, '#22262B');
        g.fillStyle = gr; g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x, y, w, 1); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x, y + h - 1, w, 1); g.fillRect(x + w - 1, y, 1, h);
      }
      function drawHud() {
        var y = cssH - hudH, h = hudH;
        g.fillStyle = '#141619'; g.fillRect(0, y, cssW, h);
        g.fillStyle = '#FDC506'; g.fillRect(0, y, cssW, 2);
        var narrow = cssW < 560;
        var cols = narrow ? [['muni', 0.22], ['leben', 0.24], ['face', 0.2], ['panzer', 0.22], ['marken', 0.12]] : [['muni', 0.15], ['leben', 0.15], ['waffen', 0.12], ['face', 0.12], ['panzer', 0.15], ['marken', 0.08], ['vorrat', 0.23]];
        var x = 0, big = Math.max(2, Math.floor(h * 0.48 / 5)), sm = Math.max(1, Math.floor(h * 0.16 / 5));
        st.hudWeapons = null;
        cols.forEach(function (c) {
          var w = cssW * c[1], cx = x + w / 2, k = c[0];
          panel(x + 2, y + 4, w - 4, h - 7);
          var labY = y + h - 6 - 5 * sm, numY = y + 8 + (h - 18 - 5 * sm - 5 * big) / 2;
          if (k === 'muni') {
            var am = WEAPONS[P.wp].ammo ? P.ammo[WEAPONS[P.wp].ammo] : '∞';
            if (am === '∞') pixText(g, '--', cx, numY, big, '#E5322D', 'center'); else pixText(g, am, cx, numY, big, '#E5322D', 'center');
            pixText(g, 'MUNI', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'leben') {
            pixText(g, Math.max(0, Math.ceil(P.hp)) + '%', cx, numY, big, P.hp < 25 && Math.floor(st.t * 4) % 2 ? '#FFFFFF' : '#E5322D', 'center');
            pixText(g, 'LEBEN', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'panzer') {
            pixText(g, Math.ceil(P.ar) + '%', cx, numY, big, '#E5322D', 'center');
            pixText(g, 'PANZER', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'waffen') {
            var s2 = Math.max(2, Math.floor(h * 0.26 / 5));
            [1, 2, 3].forEach(function (n, i) { pixText(g, n, x + w * (0.25 + i * 0.25), numY + 2, s2, P.has[n - 1] ? (P.wp === n - 1 ? '#FDC506' : '#F2F2F2') : '#4A4E54', 'center'); });
            pixText(g, 'WAFFEN', cx, labY, sm, '#C9CED6', 'center');
            st.hudWeapons = { x: x, y: y, w: w, h: h };
          } else if (k === 'face') {
            g.fillStyle = '#0D0E10'; g.fillRect(x + 6, y + 7, w - 12, h - 13);
            var hurt = P.hp > 80 ? 0 : P.hp > 60 ? 1 : P.hp > 40 ? 2 : P.hp > 20 ? 3 : 4;
            drawFace(g, cx, y + h * 0.56, Math.min((w - 14) / 42, (h - 10) / 46), { look: P.painFace > 0 ? clamp(P.hurtDir * 1.5, -1, 1) : P.look, hurt: hurt, pain: P.painFace > 0, ouch: P.ouch, grin: P.grin > 0, rage: P.rageT > 0 && P.painFace <= 0 && P.grin <= 0, dead: P.dead, smirk: P.smirk > 0, skin: set.skin, rampage: P.holdT > 2 && P.painFace <= 0 && P.grin <= 0 });
            if (narrow) st.hudWeapons = { x: x, y: y, w: w, h: h };
          } else if (k === 'marken') {
            var r = Math.min(w * 0.22, h * 0.17);
            g.beginPath(); g.arc(cx, y + h * 0.42, r, 0, TAU); g.fillStyle = P.keys.red ? '#E5322D' : '#2A2E33'; g.fill(); g.lineWidth = 2; g.strokeStyle = P.keys.red ? '#FFD7D2' : '#4A4E54'; g.stroke();
            pixText(g, 'MARKE', cx, labY, sm, '#C9CED6', 'center');
          } else if (k === 'vorrat') {
            var s3 = Math.max(1, Math.floor(h * 0.15 / 5)), ly = y + 12;
            [['STACHEL', 'sta'], ['POLLEN', 'pol']].forEach(function (row, i) {
              var yy = ly + i * (h * 0.3);
              pixText(g, row[0], x + 10, yy, s3, '#C9CED6');
              pixText(g, P.ammo[row[1]] + '/' + MAXAMMO[row[1]], x + w - 10, yy, s3, '#FDC506', 'right');
            });
          }
          x += w;
        });
      }

      /* ---------------------------------------------------------------- Touch-Steuerung */
      var joy = null, look = null, btn = { fire: null, use: null, swap: null, pause: null };
      function touchLayout() {
        var vh = cssH - hudH, r = clamp(Math.min(cssW, vh) * 0.11, 30, 56);
        var right = set.joyLeft;
        btn.fire = { x: right ? cssW - r * 1.5 : r * 1.5, y: vh - r * 1.4, r: r };
        btn.use = { x: right ? cssW - r * 3.4 : r * 3.4, y: vh - r * 0.9, r: r * 0.62 };
        btn.swap = { x: right ? cssW - r * 1.5 : r * 1.5, y: vh - r * 3.6, r: r * 0.55 };
        btn.pause = { x: cssW - 26, y: Math.max(26, vh * 0.12), r: 18 };
      }
      function drawTouch() {
        touchLayout();
        var pb = btn.pause; g.globalAlpha = 0.6; g.beginPath(); g.arc(pb.x, pb.y, pb.r, 0, TAU); g.fillStyle = '#3A3F46'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#FDC506'; g.stroke(); g.globalAlpha = 1; g.fillStyle = '#FFF'; g.fillRect(pb.x - pb.r * 0.35, pb.y - pb.r * 0.4, pb.r * 0.25, pb.r * 0.8); g.fillRect(pb.x + pb.r * 0.1, pb.y - pb.r * 0.4, pb.r * 0.25, pb.r * 0.8);
        [['fire', '#E5322D'], ['use', '#3A3F46'], ['swap', '#3A3F46']].forEach(function (b) {
          var o = btn[b[0]];
          g.globalAlpha = held.touchFire && b[0] === 'fire' ? 0.9 : 0.55;
          g.beginPath(); g.arc(o.x, o.y, o.r, 0, TAU); g.fillStyle = b[1]; g.fill(); g.lineWidth = 3; g.strokeStyle = '#FDC506'; g.stroke();
          g.globalAlpha = 1;
          g.fillStyle = '#FFF'; g.font = '800 ' + Math.round(o.r * (b[0] === 'fire' ? 0.42 : 0.5)) + 'px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          g.fillText(b[0] === 'fire' ? 'FEUER' : b[0] === 'use' ? '✋' : '⇄', o.x, o.y + 1);
        });
        if (joy) {
          g.globalAlpha = 0.5; g.beginPath(); g.arc(joy.cx, joy.cy, joy.r, 0, TAU); g.lineWidth = 3; g.strokeStyle = '#FDC506'; g.stroke();
          g.beginPath(); g.arc(joy.cx + joy.dx * joy.r, joy.cy + joy.dy * joy.r, joy.r * 0.45, 0, TAU); g.fillStyle = '#FDC506'; g.fill(); g.globalAlpha = 1;
        } else if (st.t < 8) {
          var vh = cssH - hudH; g.globalAlpha = 0.6; g.fillStyle = '#FFF'; g.font = '700 13px Poppins, sans-serif'; g.textAlign = 'center';
          g.fillText('Daumen hier: laufen', set.joyLeft ? cssW * 0.22 : cssW * 0.78, vh * 0.72); g.fillText('Wischen: umsehen', cssW * 0.5, vh * 0.3); g.globalAlpha = 1;
        }
      }

      /* ---------------------------------------------------------------- Titel, Menüs, Auswertung (gestochen scharf auf der großen Leinwand) */
      var FW = 120, FH = 70, fireBuf = new Uint8Array(FW * FH), fc = document.createElement('canvas'), fg = fc.getContext('2d'), fimg = null, PAL = [];
      fc.width = FW; fc.height = FH;
      (function () { for (var i = 0; i < 37; i++) { var t = i / 36; PAL.push(rgb(Math.round(clamp(t * 3, 0, 1) * 255), Math.round(clamp(t * 3 - 1, 0, 1) * 220), Math.round(clamp(t * 3 - 2, 0, 1) * 160))); } PAL[0] = rgb(8, 6, 6); })();
      function fireStep() {
        if (!fimg) fimg = fg.createImageData(FW, FH);
        for (var x = 0; x < FW; x++) fireBuf[(FH - 1) * FW + x] = 36;
        for (var x2 = 0; x2 < FW; x2++) for (var y = 1; y < FH; y++) {
          var src = y * FW + x2, p = fireBuf[src];
          if (!p) { fireBuf[src - FW] = 0; continue; }
          var r = (Math.random() * 3.3) | 0, dst = src - r + 1;
          fireBuf[Math.max(0, dst - FW)] = Math.max(0, p - (r & 1) - (Math.random() < 0.38 ? 1 : 0));
        }
        var b32 = new Uint32Array(fimg.data.buffer);
        for (var i = 0; i < FW * FH; i++) b32[i] = PAL[fireBuf[i]];
        fg.putImageData(fimg, 0, 0);
      }
      function logo(cx, cy, size) {
        g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(size) + 'px Poppins, sans-serif';
        g.lineJoin = 'round';
        var gr = g.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
        gr.addColorStop(0, '#FFF3A0'); gr.addColorStop(0.35, '#FDC506'); gr.addColorStop(0.7, '#FF7A1A'); gr.addColorStop(1, '#B3261E');
        g.save(); g.translate(cx, cy); g.scale(1.12, 1); g.transform(1, 0, -0.12, 1, 0, 0);
        g.lineWidth = size * 0.16; g.strokeStyle = '#120806'; g.strokeText('BOOM', 0, 0);
        g.lineWidth = size * 0.06; g.strokeStyle = '#5A1A08'; g.strokeText('BOOM', 0, 0);
        g.fillStyle = gr; g.fillText('BOOM', 0, 0);
        g.globalAlpha = 0.45; g.fillStyle = '#FFFFFF'; g.fillRect(-size * 1.4, -size * 0.36, size * 2.8, size * 0.05); g.globalAlpha = 1;
        g.restore();
        g.font = '900 ' + Math.round(size * 0.34) + 'px Poppins, sans-serif';
        g.lineWidth = size * 0.06; g.strokeStyle = '#120806'; g.strokeText('2026', cx + size * 1.2, cy + size * 0.5);
        g.fillStyle = '#E5322D'; g.fillText('2026', cx + size * 1.2, cy + size * 0.5);
        g.restore();
      }
      function menuItems() {
        var m = st.menu;
        if (m === 'main') return [{ t: 'Neues Spiel', go: function () { st.menu = 'diff'; st.sel = 1; } }, { t: 'Level-Code eingeben', go: function () { st.menu = 'code'; st.sel = 0; st.codeMsg = ''; showCodeInput(true); } }, { t: 'Steuerung', go: function () { st.menu = 'controls'; st.sel = 0; } }, { t: 'Einstellungen', go: function () { st.menu = 'settings'; st.sel = 0; } }, { t: 'Kumpel-Look', go: function () { st.menu = 'skin'; st.sel = 0; } }, { t: 'Mitwirkende', go: function () { st.menu = 'credits'; st.sel = 0; } }];
        if (m === 'diff') {
          var l = DIFFS.map(function (d, i) { return { t: d.name, sub: d.sub, go: function () { startGame(i); } }; });
          if (!unlocked.malocher) l.pop();
          l.push({ t: 'Zurück', go: back });
          return l;
        }
        if (m === 'pause') return [{ t: 'Weiter', go: resume }].concat(settingRows(false)).concat([skinRow(), { t: 'Hauptmenü (Runde abbrechen)', go: toTitle }]);
        if (m === 'settings') return settingRows().concat([{ t: 'Zurück', go: back }]);
        if (m === 'skin') return [skinRow(), { t: 'Zurück', go: back }];
        if (m === 'code') return [{ t: 'Code prüfen', go: checkCode }, { t: 'Zurück', go: function () { showCodeInput(false); back(); } }];
        return [{ t: 'Zurück', go: back }];
      }
      function skinRow() {
        var keys = Object.keys(SKINS), names = { braun: 'Braun', honig: 'Honig', hell: 'Hell' };
        var step = function (d) { set.skin = keys[(keys.indexOf(set.skin) + d + keys.length) % keys.length]; };
        return { t: 'Hautfarbe: ' + names[set.skin], go: function () { step(1); }, adj: step };
      }
      function settingRows() {
        return [
          { t: 'Maus-Tempo: ' + set.sens.toFixed(1).replace('.', ','), adj: function (d) { set.sens = clamp(Math.round((set.sens + d * 0.1) * 10) / 10, 0.2, 3); } },
          { t: 'Maus umkehren: ' + (set.invert ? 'An' : 'Aus'), go: function () { set.invert = !set.invert; }, adj: function () { set.invert = !set.invert; } },
          { t: 'Musik: ' + bar(set.music), adj: function (d) { set.music = clamp(Math.round((set.music + d * 0.1) * 10) / 10, 0, 1); au.settings(); } },
          { t: 'Effekte: ' + bar(set.sfx), adj: function (d) { set.sfx = clamp(Math.round((set.sfx + d * 0.1) * 10) / 10, 0, 1); au.settings(); } },
          { t: 'Handy-Knöpfe: ' + (set.joyLeft ? 'Stick links' : 'Stick rechts'), go: function () { set.joyLeft = !set.joyLeft; }, adj: function () { set.joyLeft = !set.joyLeft; } }
        ];
      }
      function openPause() {
        if (st.phase !== 'play' || P.dead || st.menuOpen) return;
        st.menuOpen = true; st.menu = 'pause'; st.sel = 0;
        held = {}; joy = null; look = null;
        releaseMouse(); au.menu();
      }
      function resume() {
        st.menuOpen = false; st.menu = 'main'; st.sel = 0; st.last = performance.now();
        lockMouse();
      }
      function toTitle() {
        st.menuOpen = false; st.phase = 'title'; st.menu = 'main'; st.sel = 0;
        releaseMouse(); au.music('title'); ctx.setScore(0);
      }
      function bar(v) { var n = Math.round(v * 10), s = ''; for (var i = 0; i < 10; i++) s += i < n ? '▮' : '▯'; return s; }
      function back() { showCodeInput(false); st.menu = 'main'; st.sel = 0; au.menu(); }
      var PAGES = {
        controls: [['PC', 'W A S D laufen · Maus umsehen und zielen (ins Bild klicken)', 'Klick oder Strg schießen · E oder Leertaste benutzen', '1 2 3, Q oder Mausrad: Waffe wechseln · Shift: langsam', 'Ohne Maus: Pfeiltasten drehen · + und − : Maus-Tempo · Esc: Pause'], ['Handy (quer halten!)', 'Linker Daumen: Stick zum Laufen', 'Rechts wischen: umsehen (nach oben/unten zielt das Spiel selbst)', 'FEUER halten: schießen · ✋ benutzen · ⇄ Waffe wechseln'], ['Tipp', 'Verdächtige Wände mit Riss? Benutzen! Dahinter liegen Geheimnisse.']],
        credits: [['BOOM 2026', 'Eine MediaBees-Produktion. Glück auf!'], ['Crew', 'Sprücheklopfer · Die Maschine · Allesmacher', 'und der Rest vom Bienenstock'], ['Sound', 'Alle Riffs selbst gebaut, live im Browser erzeugt'], ['Danke', 'an alle Kumpel, die sich in die Zeche trauen']]
      };
      function drawMenu() {
        fireStep();
        g.fillStyle = '#080606'; g.fillRect(0, 0, cssW, cssH);
        g.imageSmoothingEnabled = false;
        g.globalAlpha = 0.85; g.drawImage(fc, 0, cssH * 0.45, cssW, cssH * 0.55); g.globalAlpha = 1;
        var vg = g.createLinearGradient(0, 0, 0, cssH); vg.addColorStop(0, 'rgba(8,6,6,1)'); vg.addColorStop(0.45, 'rgba(8,6,6,0.6)'); vg.addColorStop(1, 'rgba(8,6,6,0)'); g.fillStyle = vg; g.fillRect(0, 0, cssW, cssH);
        var small = cssH < 420, ls = Math.min(cssW / 6.2, cssH * (small ? 0.16 : 0.2));
        logo(cssW / 2 - ls * 0.15, cssH * (small ? 0.14 : 0.17), ls);
        var m = st.menu, items = menuItems(), u = clamp(cssH / 560, 0.62, 1.15), y0 = cssH * (small ? 0.31 : 0.36);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        if (PAGES[m]) {
          var y = y0;
          PAGES[m].forEach(function (sec) {
            g.font = '900 ' + Math.round(16 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#FDC506'; g.fillText(sec[0].toUpperCase(), cssW / 2, y); y += 22 * u;
            g.font = '600 ' + Math.round(13.5 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0';
            sec.slice(1).forEach(function (line) { g.fillText(line, cssW / 2, y, cssW - 30); y += 19 * u; });
            y += 10 * u;
          });
          y0 = Math.max(y, cssH * 0.82);
        }
        if (m === 'skin') {
          /* Große Vorschau, wechselt durch die Gesichtsausdrücke */
          var ex = [{}, { smirk: true }, { grin: true }, { hurt: 2, look: -1 }, { pain: true, hurt: 1 }][Math.floor(st.titleT / 1.2) % 5];
          var fs = Math.min(cssH * 0.16, 90) / 24;
          g.fillStyle = '#0D0E10'; art.rrect(g, cssW / 2 - fs * 26, y0 - 6, fs * 52, fs * 54, 12); g.fill();
          drawFace(g, cssW / 2, y0 + fs * 28, fs, Object.assign({ look: Math.sin(st.titleT * 1.5), hurt: 0, skin: set.skin }, ex));
          g.font = '600 ' + Math.round(12 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(242,233,208,0.7)';
          g.fillText('So siehst du unten in der Statusleiste aus. ◀ ▶ oder antippen zum Wechseln.', cssW / 2, y0 + fs * 54 + 14 * u, cssW - 30);
          y0 += fs * 54 + 44 * u;
        }
        if (m === 'code') {
          g.font = '700 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0';
          g.fillText('Code von der Auswertung eintippen, z. B. KOHLE-ABCDE-FGHJK', cssW / 2, y0, cssW - 30);
          if (st.codeMsg) { g.fillStyle = st.codeOk ? '#7CFF8A' : '#FF7A6B'; g.font = '800 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; wrap(st.codeMsg, cssW / 2, y0 + 92 * u, cssW - 40, 19 * u); }
          y0 += 130 * u;
        }
        drawItems(items, y0, u, m === 'main' || m === 'diff');
        if (m === 'main') { g.font = '600 ' + Math.round(11.5 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(242,233,208,0.55)'; g.fillText(ctx.touch() ? 'Antippen zum Auswählen · Handy quer halten' : 'Pfeiltasten + Enter oder Maus · Ton an für die volle Dröhnung', cssW / 2, cssH - 16); }
      }
      function drawItems(items, y0, u, big) {
        g.textAlign = 'center'; g.textBaseline = 'middle';
        st.hits = [];
        var ih = 40 * u;
        var yy = y0;
        items.forEach(function (it, i) {
          var y = yy, on = i === st.sel;
          yy += it.sub ? ih * 1.25 : ih;
          g.font = (on ? '900 ' : '800 ') + Math.round((big ? 22 : 17) * u) + 'px Poppins, sans-serif';
          var tw = g.measureText(it.t).width;
          if (on) {
            g.fillStyle = 'rgba(253,197,6,0.14)'; art.rrect(g, cssW / 2 - tw / 2 - 40, y - ih * 0.42, tw + 80, ih * (it.sub ? 1.1 : 0.84), 10); g.fill();
            drawFace(g, cssW / 2 - tw / 2 - (it.adj ? 52 : 22), y + 1, 0.42 * u, { look: Math.sin(st.titleT * 2), hurt: 0, smirk: true, skin: set.skin });
          }
          g.lineWidth = 5; g.strokeStyle = '#120806'; g.strokeText(it.t, cssW / 2, y);
          g.fillStyle = on ? '#FDC506' : '#E9DFC8'; g.fillText(it.t, cssW / 2, y);
          if (it.sub) { g.font = '600 ' + Math.round(12 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(242,233,208,0.7)'; g.fillText(it.sub, cssW / 2, y + 18 * u); }
          if (it.adj && on) { g.fillStyle = '#FDC506'; g.font = '900 ' + Math.round(18 * u) + 'px Poppins, sans-serif'; g.fillText('◀', cssW / 2 - tw / 2 - 26, y); g.fillText('▶', cssW / 2 + tw / 2 + 26, y); }
          st.hits.push({ x: cssW / 2 - Math.max(tw, 160) / 2 - 40, y: y - ih * 0.45, w: Math.max(tw, 160) + 80, h: ih * (it.sub ? 1.15 : 0.9), i: i, tw: tw, cy: y });
        });
      }
      /* Pausenmenü halb durchsichtig über dem Spiel */
      function drawPauseOverlay() {
        g.fillStyle = 'rgba(8,6,6,0.66)'; g.fillRect(0, 0, cssW, cssH);
        var items = menuItems(), u = clamp(Math.min(cssH / (items.length * 46 + 120), cssH / 560), 0.55, 1.1);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(34 * u) + 'px Poppins, sans-serif'; g.lineWidth = 7; g.strokeStyle = '#120806';
        var ty = Math.max(30, cssH * 0.08);
        g.strokeText('PAUSE', cssW / 2, ty); g.fillStyle = '#FDC506'; g.fillText('PAUSE', cssW / 2, ty);
        g.font = '600 ' + Math.round(12 * u) + 'px Poppins, sans-serif'; g.fillStyle = 'rgba(242,233,208,0.7)';
        g.fillText(touchMode ? 'Antippen: wählen · ◀ ▶ links/rechts tippen' : '↑ ↓ wählen · ← → ändern · Enter · Esc: weiter', cssW / 2, ty + 26 * u);
        drawItems(items, ty + 64 * u, u, false);
      }
      function wrap(text, x, y, maxW, lh) {
        var words = text.split(' '), line = '', lines = [];
        words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
        lines.push(line);
        lines.forEach(function (l, i) { g.fillText(l, x, y + i * lh); });
      }

      /* ---------------------------------------------------------------- Code-Eingabe (echtes Eingabefeld, damit das Handy eine Tastatur zeigt) */
      var codeInput = document.createElement('input');
      codeInput.type = 'text'; codeInput.maxLength = 24; codeInput.autocomplete = 'off'; codeInput.spellcheck = false;
      codeInput.setAttribute('aria-label', 'Level-Code');
      codeInput.placeholder = 'KOHLE-ABCDE-FGHJK';
      codeInput.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);width:min(340px,80%);padding:10px 14px;border-radius:10px;border:3px solid #FDC506;background:#120806;color:#FDC506;font:800 18px Poppins,monospace;text-align:center;letter-spacing:2px;text-transform:uppercase;z-index:5;display:none';
      ctx.stage.appendChild(codeInput);
      codeInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkCode(); } else if (e.key === 'Escape') { showCodeInput(false); back(); } e.stopPropagation(); });
      function showCodeInput(on) {
        codeInput.style.display = on ? 'block' : 'none';
        if (on) { var u = clamp(cssH / 560, 0.62, 1.15); codeInput.style.top = Math.round(cssH * (cssH < 420 ? 0.31 : 0.36) + 22 * u) + 'px'; codeInput.value = ''; setTimeout(function () { try { codeInput.focus({ preventScroll: true }); } catch (e) {} }, 30); }
      }
      function checkCode() {
        var d = readCode(codeInput.value);
        if (!d) { st.codeOk = false; st.codeMsg = 'Der Code stimmt nicht. Genau abschreiben: Die Buchstaben I und O und die Ziffern 0 und 1 kommen darin nicht vor.'; au.locked(); return; }
        st.codeOk = true;
        if (d.unlock && !unlocked.malocher) { unlocked.malocher = true; st.codeMsg = 'Code gilt! „Malocher!“ ist freigeschaltet (Neues Spiel). '; }
        else st.codeMsg = 'Code gilt! ';
        if (d.level > LEVELS.length) st.codeMsg += 'Sohle ' + d.level + ' wird gerade noch gegraben, kommt bald. Heb dir den Code auf!';
        au.select();
      }

      /* ---------------------------------------------------------------- Auswertung */
      function finishLevel() {
        st.phase = 'tally'; st.tallyT = 0;
        releaseMouse();
        var t = L.time, par = L.lv.par;
        var bonus = { level: 3000, time: Math.max(0, Math.round((par - t) * 10)), kills: L.kills >= L.killsTotal ? 2000 : 0, secrets: L.secrets >= L.secretsTotal ? 2000 : 0, nodmg: P.dmgTaken === 0 ? 3000 : 0 };
        st.bonus = bonus;
        addScore(bonus.level + bonus.time + bonus.kills + bonus.secrets + bonus.nodmg);
        st.code = makeCode({ level: L.n + 2, diff: st.diff, weapons: 1 | (P.has[2] ? 2 : 0), hp: Math.max(1, Math.round(P.hp)), ar: Math.round(P.ar), sta: P.ammo.sta, pol: P.ammo.pol, unlock: st.diff >= 2 });
        au.music('win');
        quip('SOHLE GESCHAFFT!', '#FDC506');
      }
      function drawTally() {
        fireStep();
        g.fillStyle = '#0A0808'; g.fillRect(0, 0, cssW, cssH);
        g.imageSmoothingEnabled = false; g.globalAlpha = 0.5; g.drawImage(fc, 0, cssH * 0.6, cssW, cssH * 0.4); g.globalAlpha = 1;
        var u = clamp(cssH / 560, 0.62, 1.15), t = st.tallyT, y = cssH * 0.1;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(30 * u) + 'px Poppins, sans-serif'; g.lineWidth = 6; g.strokeStyle = '#120806'; g.strokeText(L.lv.name.toUpperCase(), cssW / 2, y, cssW - 20); g.fillStyle = '#FDC506'; g.fillText(L.lv.name.toUpperCase(), cssW / 2, y, cssW - 20);
        g.font = '700 ' + Math.round(14 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0'; g.fillText('Geschafft auf „' + DIFFS[st.diff].name + '“', cssW / 2, y + 30 * u);
        var pct = function (a, b) { return b ? Math.round(a / b * 100) : 100; };
        var rows = [['Wespen', pct(L.kills, L.killsTotal) + '%'], ['Gegenstände', pct(L.itemsGot, L.itemsTotal) + '%'], ['Geheimnisse', pct(L.secrets, L.secretsTotal) + '%'], ['Zeit', fmtT(L.time)], ['Vorgabe', fmtT(L.lv.par)]];
        var s = Math.max(2, Math.round(3 * u)), ry = y + 64 * u;
        rows.forEach(function (r, i) {
          if (t < 0.4 + i * 0.35) return;
          pixText(g, r[0], cssW / 2 - 12, ry + i * 9 * s, s, '#E9DFC8', 'right');
          pixText(g, r[1], cssW / 2 + 12, ry + i * 9 * s, s, '#E5322D');
        });
        var by = ry + rows.length * 9 * s + 14 * u;
        if (t > 2.3) {
          var b = st.bonus, parts = [];
          if (b.time) parts.push('Tempo +' + b.time); if (b.kills) parts.push('Alle Wespen +2000'); if (b.secrets) parts.push('Alle Geheimnisse +2000'); if (b.nodmg) parts.push('Ohne Kratzer +3000');
          g.font = '700 ' + Math.round(13 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#7CFF8A'; g.fillText(parts.join(' · ') || 'Sohle geschafft +3000', cssW / 2, by, cssW - 20);
          g.font = '900 ' + Math.round(26 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#FDC506'; g.fillText(Math.round(st.score * DIFFS[st.diff].mult).toLocaleString('de-DE') + ' Punkte', cssW / 2, by + 34 * u);
        }
        if (t > 2.9) {
          g.font = '700 ' + Math.round(12.5 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0'; g.fillText('Dein Code für Sohle 2 (kommt bald):', cssW / 2, by + 70 * u);
          g.font = '900 ' + Math.round(22 * u) + 'px Poppins, monospace'; g.fillStyle = '#FFFFFF'; g.fillText(st.code, cssW / 2, by + 96 * u);
          g.font = '800 ' + Math.round(15 * u) + 'px Poppins, sans-serif'; g.fillStyle = Math.floor(st.t * 3) % 2 ? '#FDC506' : '#E9DFC8';
          g.fillText(ctx.touch() ? 'Antippen: weiter zur Rangliste' : 'Enter oder Klick: weiter zur Rangliste', cssW / 2, cssH - 24 * u);
        }
      }
      function fmtT(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
      function drawDeadText() {
        var vh = cssH - hudH, u = clamp(cssH / 560, 0.62, 1.15);
        if (P.deadT < 0.6) return;
        g.globalAlpha = Math.min(1, (P.deadT - 0.6) * 2);
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + Math.round(40 * u) + 'px Poppins, sans-serif'; g.lineWidth = 8; g.strokeStyle = '#120806';
        g.strokeText(st.deadLine, cssW / 2, vh * 0.4, cssW - 30); g.fillStyle = '#FDC506'; g.fillText(st.deadLine, cssW / 2, vh * 0.4, cssW - 30);
        g.font = '700 ' + Math.round(15 * u) + 'px Poppins, sans-serif'; g.fillStyle = '#F2E9D0';
        g.fillText('Die Wespen feiern. Noch eine Schicht?', cssW / 2, vh * 0.4 + 40 * u, cssW - 30);
        g.globalAlpha = 1;
      }

      function endRound() {
        if (st.ended) return;
        st.ended = true;
        var won = st.phase === 'tally';
        stopLoop();
        ctx.finish(Math.round(st.score * DIFFS[st.diff].mult), { won: won, diff: st.diff, kills: L.kills, killsTotal: L.killsTotal, secrets: L.secrets, secretsTotal: L.secretsTotal, time: L.time, code: won ? st.code : '' });
      }

      /* ---------------------------------------------------------------- Spiel starten */
      function startGame(diff) {
        st.diff = diff; st.score = 0; st.ended = false; st.msg = []; st.t = 0; st.lockMsgT = 0; st.killWin = 0; st.killWinT = 0; st.lightFlash = 0; st.exitT = 0;
        ctx.setScore(0);
        loadLevel(0);
        showCodeInput(false);
        st.phase = 'play';
        au.select(); au.music('level');
        ctx.fx.banner(LEVELS[0].name.toUpperCase(), '#FDC506');
        msg('Glück auf, Kumpel! Finde den Förderkorb nach oben.', '#FDC506');
        lockMouse();
      }
      function lockMouse() {
        if (touchMode || !cv.requestPointerLock || locked) return;
        try { var pr = cv.requestPointerLock(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {}
      }
      function releaseMouse() {
        held.mouse = false;
        if (document.pointerLockElement === cv) { selfUnlock = true; try { document.exitPointerLock(); } catch (e) {} }
      }
      function onLockChange() {
        locked = document.pointerLockElement === cv;
        if (!locked) {
          held.mouse = false;
          /* Esc gibt die Maus frei (der Browser schluckt dabei die Taste) → eigenes Pausenmenü */
          if (!selfUnlock && st.on && !st.paused && st.phase === 'play') openPause();
          selfUnlock = false;
        }
      }
      document.addEventListener('pointerlockchange', onLockChange);

      /* ---------------------------------------------------------------- Schleife */
      function update(dt) {
        st.titleT += dt;
        au.update();
        if (st.phase === 'play' && !st.menuOpen) updatePlay(dt);
        else if (st.phase === 'dead') { P.deadT += dt; updatePlay(dt); if (P.deadT > 3.4) endRound(); }
        else if (st.phase === 'tally') { st.tallyT += dt; st.t += dt; }
      }
      function draw() {
        if (!cssW) return;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (st.phase === 'play' || st.phase === 'dead') { drawPlay(); if (st.menuOpen) drawPauseOverlay(); }
        else if (st.phase === 'tally') drawTally();
        else drawMenu();
      }
      function frame(now) {
        if (!st.on) return;
        var dt = Math.min(0.05, (now - st.last) / 1000);
        st.last = now;
        if (!st.paused) update(dt);
        draw();
        raf = requestAnimationFrame(frame);
      }
      function stopLoop() { st.on = false; cancelAnimationFrame(raf); held = {}; joy = null; look = null; releaseMouse(); au.stop(); }

      /* ---------------------------------------------------------------- Eingabe */
      function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function activate(i, dir) {
        var items = menuItems(), it = items[i];
        if (!it) return;
        st.sel = i;
        if (it.adj && dir) { it.adj(dir); au.menu(); return; }
        if (it.go) { au.select(); it.go(); }
        else if (it.adj) { it.adj(1); au.menu(); }
      }
      var touches = {};
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      cv.addEventListener('pointerdown', function (e) {
        if (!st.on || st.paused) return;
        e.preventDefault();
        if (e.pointerType === 'touch' || e.pointerType === 'pen') touchMode = true; else if (e.pointerType === 'mouse' && !ctx.touch()) touchMode = false;
        var p = local(e);
        if (st.phase === 'title' || st.menuOpen) {
          var hit = (st.hits || []).filter(function (h) { return p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h; })[0];
          if (hit) { var items = menuItems(), it = items[hit.i]; activate(hit.i, it && it.adj ? (p.x < hit.x + hit.w / 2 ? -1 : 1) : 0); }
          return;
        }
        if (st.phase === 'tally') { if (st.tallyT > 2.9) endRound(); else st.tallyT = 3; return; }
        if (st.phase === 'dead') { if (P.deadT > 1.2) endRound(); return; }
        if (touchMode) {
          touchLayout();
          try { cv.setPointerCapture(e.pointerId); } catch (err) {}
          var vh = cssH - hudH;
          if (Math.hypot(p.x - btn.pause.x, p.y - btn.pause.y) < btn.pause.r * 1.5) { touches[e.pointerId] = 'tap'; openPause(); return; }
          if (Math.hypot(p.x - btn.fire.x, p.y - btn.fire.y) < btn.fire.r * 1.3) { touches[e.pointerId] = 'fire'; held.touchFire = true; return; }
          if (Math.hypot(p.x - btn.use.x, p.y - btn.use.y) < btn.use.r * 1.35) { touches[e.pointerId] = 'tap'; useAction(); return; }
          if (Math.hypot(p.x - btn.swap.x, p.y - btn.swap.y) < btn.swap.r * 1.35) { touches[e.pointerId] = 'tap'; cycleWeapon(1); return; }
          if (p.y > vh) { touches[e.pointerId] = 'tap'; var hw = st.hudWeapons; if (hw && p.x >= hw.x && p.x <= hw.x + hw.w) cycleWeapon(1); return; }
          var joySide = set.joyLeft ? p.x < cssW * 0.45 : p.x > cssW * 0.55;
          if (joySide && !joy) { var r = clamp(Math.min(cssW, vh) * 0.13, 36, 70); joy = { id: e.pointerId, cx: p.x, cy: p.y, r: r, dx: 0, dy: 0 }; touches[e.pointerId] = 'joy'; return; }
          look = { id: e.pointerId, x: p.x, y: p.y }; touches[e.pointerId] = 'look';
          return;
        }
        if (!locked) { lockMouse(); return; }
        if (e.button === 0) held.mouse = true;
        else if (e.button === 2) useAction();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!st.on) return;
        if ((st.phase === 'title' || st.menuOpen) && e.pointerType === 'mouse') {
          var p0 = local(e), h = (st.hits || []).filter(function (h2) { return p0.x >= h2.x && p0.x <= h2.x + h2.w && p0.y >= h2.y && p0.y <= h2.y + h2.h; })[0];
          if (h && h.i !== st.sel) { st.sel = h.i; au.menu(); }
          cv.style.cursor = h ? 'pointer' : 'default';
          return;
        }
        if (st.paused || st.phase !== 'play') return;
        if (locked && e.pointerType === 'mouse') {
          P.a += (e.movementX || 0) * 0.0012 * set.sens;
          P.pitch = clamp(P.pitch - (e.movementY || 0) * 0.18 * set.sens * (set.invert ? -1 : 1) * (Hv / 200), -Hv * 0.42, Hv * 0.42);
          return;
        }
        var kind = touches[e.pointerId], p = local(e);
        if (kind === 'joy' && joy) {
          var dx = (p.x - joy.cx) / joy.r, dy = (p.y - joy.cy) / joy.r, l = Math.hypot(dx, dy);
          if (l > 1) { dx /= l; dy /= l; }
          joy.dx = Math.abs(dx) < 0.12 ? 0 : dx; joy.dy = Math.abs(dy) < 0.12 ? 0 : dy;
        } else if (kind === 'look' && look) {
          P.a += (p.x - look.x) * 0.0065 * set.sens; look.x = p.x;
        }
      });
      function pUp(e) {
        var kind = touches[e.pointerId];
        if (kind === 'fire') held.touchFire = false;
        if (kind === 'joy') joy = null;
        if (kind === 'look') look = null;
        delete touches[e.pointerId];
        if (e.pointerType === 'mouse' && e.button === 0) held.mouse = false;
      }
      cv.addEventListener('pointerup', pUp);
      cv.addEventListener('pointercancel', pUp);
      cv.addEventListener('wheel', function (e) { if (st.on && !st.paused && st.phase === 'play') { e.preventDefault(); cycleWeapon(e.deltaY > 0 ? 1 : -1); } }, { passive: false });
      /* Strg kommt beim Kern nicht an, also selbst lauschen. Losgelassene Tasten ebenso */
      function onKeyDown(e) { if ((e.code === 'ControlLeft' || e.code === 'ControlRight') && st.on && !st.paused && st.phase === 'play') { held[e.code] = true; e.preventDefault(); } }
      function onKeyUp(e) { delete held[e.code]; if (e.key === 'Control') { delete held.ControlLeft; delete held.ControlRight; } }
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);

      function key(e) {
        var c = e.code, k = e.key;
        if (st.menuOpen && (k === 'Escape' || k === 'Backspace')) { resume(); return true; }
        if (st.phase === 'title' || st.menuOpen) {
          var n = menuItems().length;
          if (c === 'ArrowUp' || c === 'KeyW') { st.sel = (st.sel - 1 + n) % n; au.menu(); return true; }
          if (c === 'ArrowDown' || c === 'KeyS') { st.sel = (st.sel + 1) % n; au.menu(); return true; }
          if (c === 'ArrowLeft' || c === 'KeyA') { activate(st.sel, -1); return true; }
          if (c === 'ArrowRight' || c === 'KeyD') { activate(st.sel, 1); return true; }
          if (k === 'Enter' || c === 'Space') { if (!e.repeat) activate(st.sel, 0); return true; }
          if (k === 'Backspace') { back(); return true; }
          return false;
        }
        if (st.phase === 'tally') { if ((k === 'Enter' || c === 'Space') && !e.repeat) { if (st.tallyT > 2.9) endRound(); else st.tallyT = 3; } return true; }
        if (st.phase === 'dead') { if ((k === 'Enter' || c === 'Space') && P.deadT > 1.2) endRound(); return true; }
        if (st.phase !== 'play') return false;
        if (k === 'Escape') { openPause(); return true; }
        if (/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|ShiftLeft|ShiftRight)$/.test(c)) { held[c] = true; return true; }
        if (c === 'Digit1' || c === 'Numpad1') { selectWeapon(0); return true; }
        if (c === 'Digit2' || c === 'Numpad2') { selectWeapon(1); return true; }
        if (c === 'Digit3' || c === 'Numpad3') { selectWeapon(2); return true; }
        if (c === 'KeyQ') { cycleWeapon(1); return true; }
        if ((c === 'KeyE' || c === 'Space') && !e.repeat) { useAction(); return true; }
        if (c === 'KeyF') { held.KeyF = true; return true; }
        /* Maus-Tempo direkt im Spiel: + schneller, − langsamer */
        if (c === 'Equal' || c === 'NumpadAdd' || c === 'BracketRight' || k === '+') { set.sens = clamp(Math.round((set.sens + 0.1) * 10) / 10, 0.2, 3); msg('Maus-Tempo: ' + set.sens.toFixed(1).replace('.', ',')); return true; }
        if (c === 'Minus' || c === 'NumpadSubtract' || c === 'Slash' || k === '-') { set.sens = clamp(Math.round((set.sens - 0.1) * 10) / 10, 0.2, 3); msg('Maus-Tempo: ' + set.sens.toFixed(1).replace('.', ',')); return true; }
        return false;
      }

      layout();
      draw();

      return {
        start: function () {
          cancelAnimationFrame(raf);
          st = fresh(); st.on = true; st.last = performance.now();
          held = {}; touches = {}; joy = null; look = null; touchMode = ctx.touch();
          layout(); ensureArt();
          ctx.setScore(0);
          au.music('title');
          ctx.stage.focus({ preventScroll: true });
          raf = requestAnimationFrame(frame);
        },
        setPaused: function (on) {
          st.paused = on; held = {}; touches = {}; joy = null; look = null;
          if (on) releaseMouse();
          else { st.last = performance.now(); ctx.stage.focus({ preventScroll: true }); if (st.phase === 'play' && !st.menuOpen) lockMouse(); }
        },
        abort: function () { stopLoop(); showCodeInput(false); st = fresh(); L = null; draw(); },
        unmount: function () {
          stopLoop(); showCodeInput(false);
          document.removeEventListener('pointerlockchange', onLockChange);
          document.removeEventListener('keydown', onKeyDown);
          document.removeEventListener('keyup', onKeyUp);
          if (codeInput.parentNode) codeInput.parentNode.removeChild(codeInput);
        },
        resize: function () { layout(); if (st.phase === 'title' && st.menu === 'code') showCodeInput(true); draw(); },
        key: key,
        _debug: function () {
          return {
            st: st, P: function () { return P; }, L: function () { return L; }, startGame: startGame, fire: fire, useAction: useAction, finishLevel: finishLevel, set: set, unlocked: unlocked,
            tp: function (x, y, a) { P.x = x; P.y = y; if (a !== undefined) P.a = a; }, hold: held,
            give: function () { P.has = [true, true, true]; P.ammo.sta = 200; P.ammo.pol = 50; P.keys.red = true; P.lamp = true; },
            god: function () { P.hp = 999999; }, drawFace: drawFace
          };
        }
      };
    }
  });
})();

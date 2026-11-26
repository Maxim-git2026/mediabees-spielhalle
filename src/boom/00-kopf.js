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

  /* Intro (Story vom Nutzer, überarbeitet): s = Stil (head, em, big), sfx = Geräusch beim Erscheinen */
  var STORY = [
    { t: 'Ruhrgebiet, 2026.', s: 'head' },
    { t: 'Die letzte Zeche im Revier soll dichtmachen. Ein Konzern hat sie für ’n Appel und ’n Ei gekauft: die Gelb-Schwarz AG. Feine Anzüge, große Versprechen, alle haben unterschrieben.' },
    { t: 'Nur einer nicht. Du bist der letzte Steiger im Revier. Du hast von Anfang an gerochen, dass da was faul ist. Die wollen das Revier nicht retten. Die wollen die Kohle. Alles. Für sich.' },
    { t: 'Nach der Spätschicht nickst du im Förderkorb kurz ein. Als du aufwachst, steht der Korb tief unten auf Sohle 1. Das Licht flackert. Es ist still. Zu still.' },
    { t: 'Dann hörst du es: ein Summen.', s: 'em', sfx: 'buzz' },
    { t: 'Die Gelb-Schwarz AG war nie ein Konzern.', s: 'em' },
    { t: 'Glück auf, Kumpel.', s: 'big', sfx: 'riff' }
  ];

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

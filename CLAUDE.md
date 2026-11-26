# MediaBees Spielhalle – Projektwissen für Claude

WordPress-Plugin „MediaBees Spielhalle“ (früher „MediaBees Arcade (404)“, Ordner und IDs unverändert) für mediabees.de (WordPress + Elementor Pro).
Es ersetzt die 404-Seite durch eine kleine Spielhalle mit Top-10-Ranglisten wie am Automaten
und kann per Shortcode auch auf jeder anderen Seite stehen. Aktuelle Version: **2.30.6**.

## Regeln für die Zusammenarbeit (wichtig)
- **Immer auf Deutsch antworten**, auch Zwischenmeldungen.
- Spiele kommen **einzeln** dazu: bauen → Nutzer testet (Juice, Handy) → Feedback → nächstes Spiel.
- **Kein Backup bei jedem Schritt.** Ein WPvivid-Backup gibt es erst ganz am Ende.
- MediaBees-CD: Schrift Poppins, Gelb `#FDC506`, dunkle Karten. Viel Juice, Handy zuerst.
- **Auch Backend-Seiten immer gleich schön gestalten** (volle Breite, im Dunkelmodus ALLE Textfarben ausdrücklich setzen: WordPress färbt h1–h3/Labels selbst dunkel; Test-Stub mit nachgebauten WP-Admin-Regeln: `stub4.php` im Scratchpad) (Vorschauen, Karten, Schalter), nicht nur WordPress-Standardformulare. Der Nutzer will das nicht extra sagen müssen.
- Keine Original-Grafiken, -Namen oder -Figuren bekannter Spiele (Tetris, Pac-Man, Dino usw.).
  Nur das Spielprinzip übernehmen, Figuren und Namen selbst erfinden (Bienen, Käfer, Wespen, Ruhrgebiet).
- DSGVO-schlank: keine Cookies, kein localStorage, keine externen Dienste.

## Aufbau des Repos
```
src/core.js          Kern der Spielhalle (Kacheln, Overlay, Rangliste, Sound, Juice, Lazy-Load)
src/tiles/NN-<id>.js Kachel je Spiel (zweistellig nummeriert, das ist die Reihenfolge): MBArcade.tile({id, title, thumb})  -> landet in arcade.js
src/games/<id>.js    Das Spiel selbst: MBArcade.register({...})          -> wird erst beim Antippen geladen
src/boom/*.js        BOOM 2026 in Teilen (00-kopf, 10-texturen, 20-sprites, 30-audio, 40-spiel, 50-logik, 55-kampf, 60-render, 70-oberflaeche, 80-steuerung, 99-ende) -> build.sh fügt sie zu assets/games/boom.js zusammen
src/teaser.js        Knopf „Nicht drücken!“ + fliegende Biene auf allen Seiten -> assets/teaser.js (CSS: assets/teaser.css), stellt `window.MBBJTeaserBee()` (Bienen-SVG) bereit
src/admin.js         Einstellungsseite: Bienen-Vorschau, Kopier-Chips, Zeit-Zusammenfassung -> assets/admin.js (CSS: assets/admin.css, nur auf settings_page_mbbj-settings)
plugin/mediabees-bugjagd/   Das WordPress-Plugin (Ordnername bleibt so, sonst verliert WP die Zuordnung)
  mediabees-bugjagd.php     Hauptdatei: MBBJ_VERSION, mbbj_games(), REST-API, Shortcode, Admin
  templates/404.php         404-Template (Filter template_include, Elementor-Header/-Footer bleiben)
  templates/markup.php      HTML der Spielhalle
  assets/arcade.css         Styles
  assets/arcade.js          GEBAUT aus src/core.js + src/tiles/*.js – nicht direkt bearbeiten
  assets/games/*.js         GEBAUT (Kopie aus src/games)
  includes/elementor-knopf.php  Elementor-Widget „Spielhallen-Knopf“ (Klasse MBBJ_Elementor_Knopf, geladen über `elementor/widgets/register`)
  uninstall.php             Löscht beim Entfernen alle mbbj_-Optionen und Transients
  vendor/plugin-update-checker/  Holt Updates aus den GitHub-Releases (nicht bearbeiten)
  readme.txt                Changelog
build.sh             Baut assets/ aus src/ und erzeugt dist/mediabees-arcade-<version>.zip
.github/workflows/release.yml  Legt bei neuer Version auf main automatisch das GitHub-Release mit dem ZIP an
```

## Bauen und veröffentlichen (Updates kommen automatisch ins WordPress-Backend)
Der Nutzer ist kein Programmierer. Er will nur: Änderung beschreiben → in WordPress „Jetzt aktualisieren“ klicken.
1. Code in `src/` ändern.
2. `./build.sh` ausführen (prüft die Syntax mit node, baut `plugin/.../assets/` und das ZIP in `dist/`).
   Die gebauten Dateien in `plugin/mediabees-bugjagd/assets/` mit committen.
3. **Version erhöhen**, sonst gibt es kein Update (MAJOR.MINOR.PATCH, neues Spiel = MINOR, Korrektur = PATCH):
   `Version:`-Kopfzeile **und** `MBBJ_VERSION` in `mediabees-bugjagd.php`, `Stable tag` und Changelog in `readme.txt`.
   Den Changelog in einfachem Deutsch schreiben, er erscheint in WordPress als Update-Beschreibung.
4. Auf `main` bringen (Branch mergen bzw. direkt pushen, wenn der Nutzer „übernimm in main“ sagt).
5. Die GitHub Action `.github/workflows/release.yml` baut dann automatisch das Release `v<Version>` mit dem ZIP.
   Sie bricht ab, wenn Kopfzeile und `MBBJ_VERSION` nicht übereinstimmen.
6. WordPress prüft alle 12 Stunden. Sofort geht es unter Plugins → „Nach Updates suchen“ beim Plugin, danach „Jetzt aktualisieren“.
   Ranglisten bleiben erhalten (sie liegen in der Datenbank, nicht im Plugin).
7. Danach kurz die 404 aufrufen und prüfen, ob `data-ver` stimmt (WP-Optimize bündelt `arcade.js`).

Technik: `vendor/plugin-update-checker` (YahnisElsts, v5.7) liest die Releases des öffentlichen Repos
`Maxim-git2026/mediabees-spielhalle`, nur ZIPs `mediabees-arcade-<version>.zip` (Ordner im ZIP: `mediabees-bugjagd/`).
Keine Zugangsdaten nötig. Nie Tokens oder Passwörter ins Repo schreiben, das Repo ist öffentlich.

## Spiele (ID → Name)
Die IDs sind fest, weil die Ranglisten daran hängen. Nur die Titel dürfen sich ändern.
| ID | Name | Prinzip |
|---|---|---|
| bugjagd | Käfer-Jagd | 30 s Käfer klicken, Goldkäfer +3, Biene −2, Kombo, Fehlklick auf leere Wabe −1 und Kombo weg |
| wespen | Bienenstich | 60 s Moorhuhn-Prinzip, 8 Schuss, Leertaste lädt nach, Serie ab 3 = +5 |
| revier | Revierflug | Flappy-Prinzip durchs Ruhrgebiet, Ortsschilder als Meilensteine |
| polonaise | Bienentanz | Snake-Prinzip, Pollen +10, Goldblume +50, wird schneller, Start erst bei erster Eingabe |
| flitzer | A40-Flitzer | Ausweich-Racer von oben, 4 Spuren, Dortmund → Venlo, Ausfahrten je km, Strecke 1 Pkt/40 px, Honig +50, knapp vorbei +10, Wabenschild = 1 Rempler frei. Leitplanke: am Rand weiter lenken = Kratzer (Funken, 1. Mal „NICHT DER LACK!“, dann wechselnde Sprüche, Anzeige „Kratzer n/3“ neben den Punkten, 0,45 s Sperre), 3 Kratzer = Totalschaden. Handy: wischen, Maus: neben den Flitzer klicken. Anzeige oben links, kein Toast (verdeckt sonst die Straße) |
| abriss | Website-Abriss | PC-zerstören-Prinzip, 45 s, Homepages von 1999 (Kalles Trinkhalle, Kaninchenzüchter, Taubenverein, Modellbahn), pro Seite neu gemischte Web-Sünden (`NOGO`: Laufschrift, Titel, Knöpfe, Fußzeile, Baustelle, Zähler, Mail; `makeSite`), Hammer/Flammen/Bienen (Tasten 1–3), 1 Pkt je Schaden, Bonus fürs Zerlegen mit Kombo bis ×5, Seite platt = +100 × Seite |
| nester | Wespennest | Minesweeper auf Waben (6 Nachbarn), erster Klick immer frei, Wabe = 2 × Level Pkt, Feld geräumt = Bonus + nächstes Level, Markieren per Rechtsklick/F, lange drücken oder Umschalter unten |
| wacht | Wespen-Invasion (bis 2.22 „Wabenwacht“) | Space-Invaders-Prinzip, Biene schießt Stacheln, Hornisse 30 (2 Treffer), Wespe 20, Feuerwespe 10, Goldwespe 100–300, Honigwaben als Deckung (Wespen, die sie erreichen, fressen sie weg wie beim Vorbild), 3 Leben, Doppelstachel, Welle geschafft = +100 × Welle. Handy: ziehen + Dauerfeuer |
| pfad | Pollenrausch (bis 2.22 „Pollenpfad“) | Pac-Man-Prinzip mit 3 eigenen Labyrinthen (19 × 21, Wiese gelb / Zeche orange / Kanal blau, Nest in der Mitte überall gleich, rotieren pro Level), Wespen: Level 1 = 4 (wie beim Vorbild), ab Level 2 alle 5 (Rüpel, Zufall, Lauer, Zick, Brumm), Pollen 10, Honigglas 50 (Wespen werden Beute), Biene schaut ganz in Flugrichtung mit Kau-Mund, Wespen fangen 200/400/800/1.600, Blume +100 × Level, Level geschafft +500 × Level, 3 Leben. Wespen: Rüpel jagt direkt, Lauer zielt vor die Biene, Zick kommt nah und weicht aus, Zufall streut. Handy: wischen oder neben die Biene tippen. Juice: `ring`, `shakeIt`, `hitstop` (Freeze), `punch` (Zoom), `sparkle`, goldener Rand im Honig-Rausch |
| wabenbau | Wabenbau | Tetris-Prinzip mit Sechsecken: 9 senkrechte Wabenspalten × 16, Teile aus 4 Waben (7 Formen, axiale Koordinaten, Drehen in 60°-Schritten), volle Zickzack-Reihe verschwindet, 100/300/500/800 × Level, Sofort-Fallen +2 je Wabe, Level alle 10 Reihen. Tasten: A/D bzw. ← → schieben, W/↑ drehen, Q andersherum, S/Leertaste sofort fallen, ↓ schneller. Hinweis nur beim ersten Stein, Schritt für Schritt. Handy: wischen schiebt, nach unten wischen lässt fallen, tippen dreht |
| solitaer | Bienen-Solitär | Klondike, 1 Karte ziehen, eigene Farben (Blume + Wabe rot, Käfer + Klee schwarz, kein Grün!), K = Königin, D = Hummel, B = Arbeitsbiene. Ablage oben fest pro Farbe (Index = Farbe). Punkte: Ablage +10, aufdecken/vom Stapel anlegen +5, von Ablage zurück −15, Stapel neu −50, Sieg +500 + (600 − Sekunden) × 2. Antippen = bester Zug, Ziehen geht auch, Zurück-Knopf (stellt auch Punkte zurück), Aufgeben, Auto-Abschluss, Gewinn-Kaskade. Keine Züge mehr → blinkender Hinweis mit „Zug zurück“/„Runde beenden“. Löser im Hintergrund (kennt verdeckte Karten, Stapel = frei wählbar, alle Züge inkl. von der Ablage zurück, max. 40.000 Stellungen in Häppchen à 600): nur wenn die Suche vollständig ohne Sieg endet → „Kein Gewinn mehr möglich!“ (wegtippbar). Karten werden vorgezeichnet (Cache), sonst ruckelt es |
| hopser | Hummelhopser | Crossy-Road-Prinzip, 9 Spalten, endlos nach vorn: Wiese (Bäume blocken, Honigglas +5), Straße (Autos/Laster), S-Bahn (Warnlicht 1,2 s vorher), Emscher (Stämme/Kohlekähne, treiben mit, Rand = raus). +1 je neue Reihe. Kamera schiebt nach, wer zurückfällt wird von der Wespe geschnappt. Tippen = vor, Wischen = Richtung, WASD/Pfeile |
| honigdieb | Honigdieb | Flucht-Runner von der Seite: Biene mit Honigglas flieht vor dem Kammerjäger. Springen (W/↑/Leertaste, halten = höher; Handy tippen) über Tonne/Zaun/Hydrant/Gully, ducken (S/↓; Handy: linke Hälfte halten oder rechts nach unten wischen, rechte Hälfte tippen = springen; wer rechts direkt nach dem Antippen runterwischt, dessen Sprung wird zurückgenommen; `multiTouch: true`, mehrere Finger in `ptrs`) unter Spinnweben/Banner. 1 Pkt je Meter, Honigtropfen +10. Stolpern statt sofort aus: Abstand zum Kammerjäger sinkt, erholt sich langsam, zweimal kurz hintereinander = geschnappt. Stadtschild alle 250 m. Hochkant/Handy: sichtbare Breite mind. 560 Welt-Px (herausgezoomt, Himmel oben `TOPW`), Biene bei 20 % der Breite, Kammerjäger näher |
| knaller | Bombenstimmung (bis 2.22 „Honigknaller“, bis 2.29 „Bienenboom“) | Bomberman-Prinzip. Feld quer 15 × 11, hochkant 11 × 13 (Rand + Säulen fest, Wachsblöcke zufällig). Reichweite startet bei 1 (Extras erhöhen). Allein: Level mit 2 + Level Wespen und Level/2 Hornissen, Wespen starten in den drei anderen Ecken (Ecken-Zonen frei), legen ab Level 1 Bomben, wenn die Biene < 10 Felder weg ist (Hornisse alle 5–8 s, Wespe 8–13 s, nur mit Fluchtweg). Alle Bomben töten Wespen, `foe`-Bomben ohne Punkte („Gut gemacht!“). Eigene Bombe erwischt dich selbst: zufällig „Gut gemacht!“, „Selbstkill!“ oder „Peinlich!“. Wachsblock fängt die Explosion ab (keine Flamme auf/hinter ihm). Tod = alle Extras weg, alle 5 Level +1 Leben (max. 3). Wespen klauen Extras (Reichweite, Tempo, schneller nächste Bombe), Wespe 100, Hornisse 200, mehrere in einer Explosion × Kette, Block 10, Extra 50, Level geschafft +500 × Level, 3 Leben. Menü (auch Handy): 1 Allein (Rangliste), 2 Gegen 3 Bots, am PC 3 Zu zweit, 4 Zu zweit + 2 Bots. Duelle ohne Rangliste (`finish(0, {headline})`), wer zuerst 2 Runden gewinnt, Endspurt nach 40/70 s (+2 Reichweite, +1 Bombe). Bots heißen zufällig Uschi, Waldo, Wayne, Super Siggi, Ilse, Gisela, Horst (`BOT_NAMES`, Waldo und Wayne mit Gewicht 5 = deutlich öfter, bleiben im Duell gleich; „Bärbel“ nicht verwenden, Wunsch des Nutzers). Bots: Gefahrenkarte + Breitensuche, legen nur mit Fluchtweg, Schrecksekunde 0,15–0,45 s. Figuren schauen in Laufrichtung (auch hoch/runter). Handy: schwebender Joystick unten links + Bombenknopf (`multiTouch: true`) |
| flipper | Honigflipper | Flipper-Prinzip, eigener Bienenstock-Tisch (logisch 400 × 700, 10 Teilschritte Physik, mehrere Kugeln in `st.list`). 3 Honigtopf-Bumper 100, Schleudern 10, BIENE-Ziele links je 250 (alle 5 = +2.500 und Multiplikator +1), 3 Bahnen oben je 50 (alle = Multiplikator +1, max. ×5), fliegende Wespe 750 (jede 3. = Multiplikator +1), Drehtor links 25 je Umdrehung, Honigtopf-Mulde 500 (3× = Multiball, alles doppelt, Kugelverlust im Multiball kostet kein Leben). Abflüsse links/rechts außen, Rückläufe innen +100 zünden die Rettungslampe im Abfluss daneben (kickt die Kugel einmal zurück). Bonus am Kugelende. Rettung (Ball Save) nur einmal pro Kugel, 4 s. Einbahn-Tor oben an der Abschussbahn (y 204). Honigsaft 0–100: Flipperschlag −2, Treffer füllen auf (Bumper 2, kleine Kugel 4, Ziel 4, Wespe 12, Honigtopf 8, Bahn/Rücklauf 3), neue Kugel +25, leer = Flipper bewegen sich nicht. Kleine Kugel oben links (74,166) = 250. Multiplikator zurück bei Kugelverlust. 3 Kugeln. Tasten: A/D, ←/→, Shift; Abschuss Leertaste/↓/S/Enter halten und loslassen. Handy: linke/rechte Hälfte (`multiTouch: true`), Abschuss halten und loslassen |
| wurf | Haldenduell (bis 2.22 „Wurfduell“) | Artillerie-Prinzip (wie Worms), rundenbasiert. Gelände als Höhenlinie `gnd[x]` (quer 1000 × 560, hochkant 520 × 700), Krater per `carve`, Wasser (Emscher) unten = baden = raus. Wind je Zug (Pollen fliegen mit). Zielen: Schleuder (irgendwo zurückziehen und loslassen; Rechtsklick beim Ziehen oder zurück zum Startpunkt = abbrechen) oder ←/→ Winkel, ↑/↓ Kraft, Leertaste; Wabenmauer per Klick auf die gewünschte Seite; Q wechselt: Honigtopf (unbegrenzt, Aufprall, R 40, 45 Schaden) / Pollenbombe (2 pro Runde, `ammo`, hüpft, 3 s, R 34) / Wabenmauer (18 × 74 Wachs 44 px vor der Figur in Zielrichtung, `st.wax` = alte Bodenhöhe, Krater im Wachs nur halber Radius = ca. 3 Volltreffer; Bauen beendet den Zug, neue Mauer erst wenn die eigene kaputt ist: `hasWall`/`checkWalls`). Figuren prallen an Wänden ab, die mehr als 10 px höher sind als die Füße (kein Durchrutschen). Rückstoß 70 + 170 × Nähe (Wasser ist Absicht, aber nicht zu leicht). Vorschau nur kurz ohne Wind. 30 s pro Zug. Gegner-Namen zufällig aus `FOE_NAMES` (Uschi, Waldo, Wayne, Super Siggi, Ilse, Gisela, Horst; Waldo/Wayne öfter), ab Runde 3 zu 45 % Hornisse. Gegen Wespen (Rangliste): Gegner-HP 50 + 15 × Runde, rechnet alle Würfe für Topf und Pollenbombe durch (`simulateBomb` mit Abprallen), nimmt die Bombe wenn der Topf nicht durchkommt oder zu 30 % zur Abwechslung, baut bei ≤ 60 % Leben zu 50 % eine Wabenmauer (statt zu werfen), zielt mit Streuung (wird je Runde genauer; Runde 1 ×1,7, Runde 2 ×1,35 ungenauer), Schaden × 5 Pkt, Volltreffer +100, Sieg +300 × Runde, du heilst 30 je Runde. Zu zweit: Biene gegen Hummel, wer zuerst 2 Runden gewinnt, `finish(0, {headline})` |
| blitz | Bienen-Blitz | Minispiel-Sammlung (Prinzip „Dumb Ways to Die“/WarioWare). 10 Aufgaben in `GAMES` (init/update/tap/key/move/draw, `m.win`/`m.fail`, `timeout` = Ergebnis bei Zeitablauf): nopush (roter Knopf NICHT drücken, Drücken = KABOOM), wasp (antippen), catch (Honigtropfen mit Glas fangen, Maus/Finger/←→), flowers (alle antippen), pump (8 + 2 × Stufe Tipps/Leertaste), wire (Kabel nach Farbe schneiden, 1–3; eigene Zeit `time`: 5 s − 0,5 s je Stufe, min. 3 s, Bombenuhr zeigt echte Restzeit `m.left`, Zeit um = Explosion), dodge (Kohlebrocken ausweichen), count (Bienen zählen, dann 3 Antworten), findbee (Biene zwischen Wespen), stop (im gelben Feld stoppen), whack (WESPEN HAUEN: 6 Wabenlöcher, Wespen hauen, Bienen nicht, 3 + Stufe/2 Treffer, eigene Zeit 5 s → 3,5 s). Honigtropfen fällt in der halben Spielzeit. Beutel-Mischung, keine Aufgabe zweimal direkt hintereinander. Ansage groß (Intro 1,1 s → 0,6 s), Spielzeit 4,4 s → min. 2,1 s, Zündschnur als Zeitleiste. 3 Leben, Sieg 100 × Stufe, alle 5 Siege Stufe +1 und +250 × Stufe. Roter Knopf gedrückt = Atompilz als eigenes Vollbild (`drawNuke`: glühender Himmel, Skyline mit Förderturm, großer Pilz, 2,2 s). Zwischenbild nach jeder Aufgabe: tanzende Biene + Leben (`drawCard`, Phase `card`), Spielende: Biene auf dem Rücken mit Kreuzaugen, darüber zufällig einer von drei Sprüchen vom Nutzer: „DU HAST VERLOREN! (peinlich)“, „Manchmal muss man loslassen, um festzuhalten, was wirklich zählt.“, „Wo viel verloren wird, ist manches zu gewinnen.“ – Goethe (NICHT „Oh nein!“, „Das war jetzt nicht so schlau.“, „Biene k.o.!“ usw.), darunter „Alle Leben aufgebraucht …“ (`drawDead`, Phase `dead`). Bei Antipp-Aufgaben (wasp, flowers, wire, findbee, count) ist Danebentippen ein Fehler („Daneben!“), außer in der Falle. Aufgabe steht nur in der Ansage (Intro), beim Spielen nicht mehr (Wunsch: verunsichern). Fallen ab der 4. Aufgabe selten (10 % + 2 % je Stufe, max. 20 %, nie zweimal hintereinander): umgedrehte Aufgabe (`m.trap`, `trappable`), nichts tun = geschafft, normale Aufgabe erfüllen = „Reingefallen!“; beim Knopf umgekehrt „JETZT DRÜCKEN!“ (`trapSelf`), Fangen: verfehlen = geschafft (`trapFailIsWin`). Keine Falle bei Zählen und Ausweichen |
| wimmel | Wimmelpott | Wimmelbild, jede Runde zufällig gebaut (`build`): 8 Teile-Sorten in `TYPES` mit Varianten + Ansage-Text (Biene/Wespe mit Sonnenbrille/Zylinder/Krone/rotem Schal, Honigglas mit Deckelfarbe, Ballon/Auto/Blume/Schirm in Farben, Pommes mit Ketchup/Mayo/Schranke/ohne alles). 3 Ziele, je genau einmal und frei liegend, viele Ablenkungen gleicher Sorte. Themen rotieren je Level (Kirmes, Wiese, Zeche). Szene einmal vorgezeichnet (`paintScene`). 45 s je Level, falsch (auch ins Leere) −3 s mit Spruch, nur Bienen/Wespen/Autos werden gespiegelt (Ziele nie, damit das Bild unten passt), Tipp (Knopf/T) −5 s zeigt gestrichelten Kreis. Fund 100 × Level, Level geschafft + 20 je Restsekunde, Zeit um = Ende (fehlende Ziele blinken). Mehr Teile je Level. Handy: Leiste unten höher, Symbol über dem Text |

| boom | BOOM 2026 | Ich-Shooter (90er-Raycaster-Prinzip) unter Tage, Details im Abschnitt „BOOM 2026“ unten. Kein `duration`, `multiTouch: true`, eigenes Menü im Spiel, `ctx.pause()`/`ctx.audio()` (seit 2.30 im Kern) |

### Offene Playtests (Nutzer testet als Nächstes, danach Feedback einarbeiten)
- **Feedback-Paket 2.20.0 eingebaut** (Pollenpfad 4 Wespen, Solitär-Löser, Honigknaller Ecken/Bomben/Extras/Leben, Flipper Tor/Honigsaft/Kugel, Wurfduell Abbruch/Mauer-Klick): Nutzer testet nach.
- **Honigdieb** (2.19.4): Handy-Steuerung jetzt links halten = ducken, rechts = springen (Feedback). Testen, ob das so passt.
- **Bienen-Blitz** (2.21.x) und **Wimmelpott** (2.22.0): neu, Nutzer testet.
- **Käfer-Jagd**: Philipp steckt hinter keinem der Spitznamen („Die Maschine“, „Sprücheklopfer“, „Allesmacher“ bleiben). Philipp nicht in Sprüche aufnehmen. Offen: welche Kolleginnen/Kollegen neu dazukommen (Nutzer liefert Namen/Spitznamen).
- **Wespennest**: nie gezieltes Feedback bekommen.
- Frühe Spiele (Käfer-Jagd, Bienenstich, Revierflug, Bienentanz): kein Feedback seit dem Juice-Update notiert.
Feedback bisher abgeschlossen: Hummelhopser (passt), A40-Flitzer, Pollenpfad, Wabenbau, Bienen-Solitär, Wabenwacht, Website-Abriss.

### Nächste Spiele (in dieser Reihenfolge)
Offen, Nutzer entscheidet. Alternative zum Wimmelbild wäre „Finde die Unterschiede“ (auf dem Handy eng).
Ideenliste: Doodle-Jump-Prinzip.
**BOOM 2026** (Ich-Shooter) ist seit 2.30.0 gebaut: Sohle 1 als Prototyp, Nutzer testet. Weitere Sohlen (Kampagne mit 5) folgen nach Feedback.
Grundsatz (Nutzer, 2.24): lieber wenige richtig gute Spiele als viele, die keiner spielt. Lieblinge des Nutzers: Bienen-Solitär, Bienen-Blitz, Bienenboom, Pollenrausch.
Gestrichen: Bubble Ball, Schach.

## BOOM 2026 (gebaut ab 2.30.0, Sohle 1 = Prototyp)
- **Technik umgesetzt:** interne Auflösung W = Bühnenbreite/2,6–3 (200–440 px), Höhe passend, HUD gestochen scharf darunter (`hudH`). Boden/Decke je Pixel, Wände per DDA, Türen als Ebene in Feldmitte (gleiten seitlich, `open` 0–1, schließen nach 4 s), Geheimwände = Tür-Art `S` mit Riss-Textur der Nachbarwand (Nische als Hinweis), Türrahmen `J`. Licht: Zonen-Grundlicht × Farbton + Lampen (`l`, Sichtlinie) je Feld, an Ecken gemittelt, bilinear; Waschkaue flackert, Arena Alarm-Rot. Helmlampe (`P.lamp`, Item `y` in der Lampenstube) = Kegel in Bildmitte. Senkrecht zielen = Horizont verschieben (`P.pitch`), am Handy ignoriert (Auto-Zielen). Treffer per Strahl (`hitscan`) mit Höhenprüfung. Gegner: Wegekarte per Breitensuche (`computeFlow`), Sichtlinie, Lärm weckt (`noiseAlert`), öffnen normale Türen. Feuerbälle, Fass-Explosionen (Kette), Kamikaze explodiert bei Berührung oder Tod.
- **Feedback 1 (2.30.1):** Nutzer: „Holy shit ist das GEIL“, spielt nur auf Steiger. Wand-Texturen waren gespiegelt (u-Spiegelung in `render3D` war für die y-nach-unten-Welt falsch herum). Musik: ruhige Ebene läuft immer (Zupfgitarre `pluck` mit Echo, `pad`, Akkordfolge `CALM`), Metal blendet bei Gegnern darüber. Gesicht: Grundausdruck grimmig (Augenbrauen schräg, Lider halb), `smirk` ab und zu, Zähne bei hurt ≥ 2. Hautfarbe: Nutzer wollte sie im Hauptmenü wählbar → Menüpunkt „Kumpel-Look“ (`set.skin`, `SKINS`: braun, honig, hell; Standard braun; wird wie alle Einstellungen nicht gespeichert).
- **Rampage-Gesicht (2.30.2):** Dauerfeuer > 2 s (`P.holdT`) → `rampage` im Gesicht (steile Brauen, gefletschte Zähne). Wunsch des Nutzers, Detail wie beim Vorbild. Kachel-Vorschaubild = grimmiger Kumpel. **Rote Augen nur bei Gegnern**, die Biene hat immer schwarze Pupillen (auch beim Berserker).
- **Pausenmenü (2.30.3):** Spiel setzt `ownPause: true` → der Kern reicht Esc an `key()` weiter (statt eigener Pause). Esc im Spiel bzw. Verlust des Pointer-Locks (Browser schluckt Esc dabei) → `openPause()`: halb durchsichtig über dem Spiel (`drawPauseOverlay`, `st.menuOpen`, Liste über `drawItems`), Einstellungen (`settingRows`), Hautfarbe (`skinRow`), „Hauptmenü (Runde abbrechen)“ (`toTitle`, ohne Wertung). Handy: Pause-Knopf oben rechts. Fenster verlassen/Tab wechseln pausiert weiter über den Kern.
- **Story/Intro (2.30.4):** Idee vom Nutzer (letzter Steiger, wacht nach Nickerchen auf, Geräusch). Regierung/Gewerkschaften als Bösewichte bewusst NICHT (heikel auf Firmenseite im Revier) → erfundener Konzern „Gelb-Schwarz AG“, der in Wahrheit aus Wespen besteht. Text in `STORY` (`00-kopf.js`), Phase `intro` (`startGame` → Intro, `beginLevel` = Sohle starten), Schreibmaschine `INTRO_RATE` 38 Zeichen/s, Pause je Absatz, Geräusche per `sfx`. `_debug().startGame` überspringt das Intro, `_debug().intro(diff)` zeigt es.
- **Feinschliff (2.30.5):** Nutzer: „ICH LIEBS“, Sohle 1 genau richtig schwer für den Anfang. Rennen 5,8 Felder/s (vorher 3,9), Shift = gehen 2,8; Option `set.sprint` (Shift = Sprinten, normal 3,4). Kopfwippen der Kamera aus (Übelkeit), Option `set.bob`, Waffe wippt weiter. Intro schneller (`INTRO_RATE` 70). Am Handy heißt es „Wisch-Tempo“ (gleiche `set.sens`). Hände/Waffen-Grafik könnte schöner werden, Nutzer weiß aber nicht, wie er dazu Feedback gibt → später Vorschläge zeigen.
- **Kindgerecht (2.30.6):** Nutzer fand das grimmige Gesicht zu gruselig (auch Kinder spielen) → Gesicht entschlossen statt furchteinflößend: weniger steile Brauen, Augen offener, Dauerfeuer = Comic-Kampfschrei (offener Mund, eine Zahnreihe) statt gefletschter Zähne, Neue Waffe = breites Grinsen mit Zähnen + Augenbrauen nach unten (wie Dauerfeuer), genau dieses Grinsen ist auch das Kachel-Vorschaubild (Wunsch des Nutzers). Künftig alles in BOOM kindgerecht halten (kein Blut, keine Horror-Fratzen).
- **Sohle 2:** nächste Woche (Nutzer). Vorher wieder Brainstorming.
- **Schwierigkeit:** Nutzer: „Steiger ist richtig schön schwer“ → so lassen.
- **Maus:** Spielerin fand sie zu schnell → Grund-Tempo 0,0012 rad/px (vorher 0,0022), Pitch 0,18, Touch-Drehen 0,0065. Im Spiel + / − ändert `set.sens` (0,2–3).
- **Level** als Textraster in `00-kopf.js` (`LEVEL1.map`/`zone`), Generator mit Prüfung (Erreichbarkeit, roter Ausgang) im Scratchpad `boom/map.py`. Wichtig: Gegenstand vor einer Geheimwand darf den Weg nicht blockieren.
- **Zum Testen** `MBArcade.current()._debug()`: `startGame(diff)`, `tp(x,y,a)`, `give()`, `god()`, `fire()`, `useAction()`, `finishLevel()`.
- **Fallen beim Bauen:** keine doppelten Namen im mount-Bereich (eine Variable `fire` hat einmal die Funktion `fire` überschrieben); Sprite-Namen eindeutig (Gegner `flinte` vs. Item `flinteItem`). Strg erreicht `key()` nicht (Kern filtert), deshalb eigener keydown-Listener.

### Plan (Brainstorming, Stand vor dem Bau)
- **Name:** BOOM 2026 (Anspielung aufs Vorbild, aber eigenes Logo: brennende Schrift, NICHT das Original-Schriftbild nachbauen). Dafür wird **Bienenboom → „Bombenstimmung“** umbenannt (ID `knaller` bleibt, Rangliste bleibt) – erledigt in 2.30.0.
- **Umfang jetzt:** nur **Level 1** (5–10 Min.), später Kampagne mit 5 Levels. Kein Survival-Modus (Nutzer findet das lahm). Story liefert der Nutzer später.
- **Technik:** Raycaster (2,5D), kleine interne Auflösung im Pixel-Look, Gegner/Items als Billboard-Sprites, alles im Code gezeichnet (keine Bilddateien), Karten als Textraster. Türen, Grubenmarken (Schlüssel rot/gelb/blau), Geheimwände (Wand sieht minimal anders aus, „Benutzen“ schiebt sie weg, Auswertung „Geheimnisse x/y“). Dunkel unter Tage, Helmlampe als Lichtkegel.
- **Spielfigur:** Biene als Kumpel mit Grubenhelm + Helmlampe. Man sieht nur Hände (gelb-schwarze Bienenarme in Arbeitshandschuhen) und das HUD-Gesicht.
- **HUD wie im 90er-Original:** Statusleiste unten (Munition, Leben, Rüstung, Grubenmarken, Waffen), in der Mitte Bienengesicht mit Grubenhelm: schaut links/rechts, schaut bei Treffer zur Schadensrichtung, wird mit sinkendem Leben ramponierter, **fieses Grinsen bei jeder neuen Waffe** (+ gelber Blitz + Sound), Berserker = rot vor Wut, tot = Kreuzaugen (wie Bienen-Blitz `drawDead`).
- **Waffen (vorerst nur 3):** Form klassisch, Ausführung Biene (keine echten Waffen). 1 Faust (gelb-schwarzer Boxhandschuh, Berserker-Honig = ×10), 2 Pistole „Stachler“ (Wabenmuster, Honigfarbe, schießt Stachel), 3 Schrotflinte „Pollenflinte“ (doppelläufig, Holzschaft, Pollenladung). **Start: Faust + Stachler, 50 Stachel, 100 Leben, 0 Rüstung** (wie das Original).
- **Einsammeln:** Honigtropfen +1 (bis 200), Honigglas +10, Honigtopf +25; Wachsplättchen +1 Rüstung, Wachs-Panzer 100; Stachel-Bündel 10 / Kiste 50 (max 200); Pollen 4 / Schachtel 20 (max 50); Berserker-Honig.
- **Gegner Level 1:** Wespe (Nahkampf, schnell), **Wach-Wespe** (hat Stachler, schießt; lässt beim Tod den Stachler fallen = Waffe bzw. Munition, wie im Original), **Flinten-Wespe** (Streuschuss; lässt Pollenflinte fallen, danach Patronen; zur Sicherheit liegt eine Pollenflinte auch im Level), Feuerwespe (Feuerbälle), Kamikaze-Wespe (blinkt, piept, explodiert; Nutzer: „Serious Sam vibes“), Varroa-Milben (krabbelnder Schwarm). Später: Hornisse (ab Level 2), Wachsmotte, Spinne (lässt sich von der Decke fallen), Ameisen (klauen Honig), Kröte (Zunge), Zwischenbosse Bienenwolf/Bienenfresser/Honigdachs/Kammerjäger (aus Honigdieb), Endboss Wespenkönigin.
- **Level 1 grob:** Einfahrt mit Förderkorb → Waschkaue (Spinde, erste Wespen) → Lampenstube (Helmlampe, 1. Geheimnis) → Stollen mit Holzstempeln (Varroa-Hinterhalt, Pollenflinte) → rote Grubenmarke → Arena mit Kamikaze-Wespen → Förderkorb = Ausgang → Auswertung (Kills %, Geheimnisse, Zeit) + Level-Code.
- **Steuerung:** PC klassisch WASD + Maus mit Pointer-Lock, **senkrechtes Zielen per Maus** (Horizont verschieben/y-shearing, wegen fliegender Wespen) + dezente Zielhilfe; Klick = schießen, 1–3/Mausrad = Waffe, Leertaste/E = benutzen. Handy quer: Joystick links (Seite einstellbar), rechts wischen = drehen, Feuerknopf, senkrecht Auto-Zielen.
- **Hauptmenü:** Titelbild mit brennendem Logo, Glut, Musik. Neues Spiel → Schwierigkeit: Praktikant / Kumpel / Steiger / „Malocher!“ (Albtraum, erst freigeschaltet über Code nach Level 1 auf Steiger). Level-Code eingeben. Steuerung (mit Bildchen). Einstellungen (Maus-Empfindlichkeit, Maus umkehren, Musik/Sound getrennt, Joystick-Seite; werden nicht gespeichert). Mitwirkende (MediaBees-Crew mit Spitznamen/Insidern). Bedienung mit Pfeilen/Enter/Maus/Finger. Esc im Spiel = Pausenmenü (Weiter, Einstellungen, Hauptmenü).
- **Speichern:** Level-Codes wie früher (kein Cookie/localStorage), Code enthält Level, Waffen, Munition, Leben, Schwierigkeit. **Rangliste nur bei „Neues Spiel“**, Einstieg per Code = ohne Rangliste (`finish(0, …)`), Schwierigkeit als Punkte-Multiplikator. Punkte: Kills, Geheimnisse, Tempo, Treffsicherheit, Bonus ohne Schaden.
- **Musik/Sound:** alles im Browser erzeugt (WebAudio), **eigene Riffs** im Stil 90er-Shooter-Metal, keine bekannten Stücke nachbauen (auch nicht den Song, den der Nutzer erwähnt hat). Titelmusik; Level-Musik dynamisch (ruhig = Tropfen/Brummen, Gegner bemerken dich = Metal mit Gitarre + Doppelbass); Sieges-Riff. Sounds: je Waffe (+ Nachladen, leeres Klicken), je Gegner (Summen beim Entdecken, Schmerz, Zerplatzen, Feuerball, Kamikaze-Piepen, Krabbeln), Spieler (Aua, Herzklopfen bei wenig Leben, Tod), Welt (Türen, Geheimnis-Melodie, Aufsammeln, Grubenmarke, Förderkorb).
- **Juice:** Mündungsfeuer, Rückstoß, Kopfwippen, Waffe schwingt, Treffer-Blitz, roter Rand bei Schaden, Wespen zerplatzen in Wachssplitter/Honigspritzer (kein Blut, Firmenseite), Kill-Sprüche („Doppelstich!“, „Sauber, Kumpel!“, „Schicht im Schacht!“), Zeitlupe beim Boss.
- **Insider:** ja, z. B. Poster „Mitarbeiter des Monats: Sprücheklopfer“, Graffiti „Die Maschine war hier“, Spinde mit Namensschildern. Nutzer liefert weitere Spitznamen. Philipp und „Bärbel“ NICHT verwenden.
- **Vorgehen beim Bau:** erst spielbarer Prototyp (Motor, Level 1 Rohbau, 3 Waffen, Gegner, HUD, Menü, Sound), Nutzer testet am PC und Handy, dann Feinschliff in Runden. Neues Spiel = MINOR-Version. Empfehlung zum Bauen: Opus mit hohem Aufwand für den Motor, mittel für kleine Änderungen.

## Texte
Alle Texte (Ranglisten-Titel, Starttexte, Sprüche) hat der Nutzer in 2.23.0 selbst überarbeitet (Datei „Spielhalle-Sprueche“). Bei neuen Sprüchen den Ton beibehalten:
Ranglisten-Titel männlich/neutral formuliert, Bienenstich = Gamer-Sprache, Solitär = Büro, A40 = Fahrschule/Versicherung, Abriss = Baustelle,
Revierflug = Fliegerei, Bienentanz = Party, Invasion = Sci-Fi, Pollenrausch = Spielhalle/Essen, Wimmelpott = Suchen/Brille.
Die Liste lässt sich jederzeit neu erzeugen (alle `ranks`, `startText`, `cta` und Sprüche aus `src/`).

## Neues Spiel anlegen – Checkliste
1. `src/tiles/<NN>-<id>.js` (zweistellig, z. B. `11-solitaer.js`): `MBArcade.tile({ id, title, ranks: [[minPunkte, Titel, Text], ...], thumb: function (g, w, h) {...} })`.
   **8 Stufen** pro Spiel, unten fein abgestuft. Die Rangstufen stehen **in der Kachel**, weil die Ranglisten (auch „Ranglisten aller Spiele“) den Titel für jeden Eintrag aus den Punkten berechnen, ohne das Spiel zu laden.
2. `src/games/<id>.js`: `MBArcade.register({ id, title, duration (0 = ohne Zeitlimit), startText, help: {controls, legend}, cta, stats(s), mount(ctx) })`.
   - `mount(ctx)` bekommt `ctx.screen`, `ctx.stage`, `ctx.setScore`, `ctx.setTime`, `ctx.say` (Toast), `ctx.tone` (Sound),
     `ctx.reduce` (weniger Bewegung), `ctx.touch`, `ctx.finish(stats)`.
   - Rückgabe: `{ start, setPaused(on), abort, unmount, resize, key(e) }` (key gibt true zurück, wenn verarbeitet).
   - Gemeinsame Zeichenfunktionen: `MBArcade.art` (bee, queen, wasp, car, flitzer, hex, rrect …).
   - **Juice für große Momente:** `ctx.fx` (eigene Ebene über dem Spielfeld, Koordinaten in CSS-Pixeln relativ zur Bühne):
     `flash(rgb, stärke)`, `shake(sek, px)`, `ring(x, y, farbe, radius, linie, ms)`, `sparkle(x, y, farben, n, tempo)`,
     `text(x, y, text, farbe, größe)`, `banner(text, farbe)`, `boom(x, y, farbe, rgb, stärke)` = alles auf einmal, `at(element)` = Mitte eines DOM-Elements.
     `text`/`banner` brechen lange Sprüche um (max. 3 Zeilen, Schrift wird bei Bedarf kleiner), bleiben im Bild und je nach Länge länger stehen.
     Der letzte Spruch ohne Zahlen (`quote`) erscheint im Endbildschirm vor der Auswertung. Spiele sollen Sprüche über `ctx.fx.text` zeigen, keine eigenen Text-Zeichner (Wespen-Invasion, Pollenrausch, A40-Flitzer wurden umgestellt).
     Spiele mit eigenen Spielkoordinaten rechnen mit `* k` um. „Weniger Bewegung“ beachtet `ctx.fx` selbst.
     Beim A40-Flitzer keine `banner` (verdecken die Straße).
   - Icons für die Anleitung: z. B. `'kbd:Esc'`, `'tap'`, `'swipe'`.
3. In `mbbj_games()` (PHP) eintragen: `title`, `min_age` (Mindestdauer einer Runde in s), `max_score`, `sec_per_point`.
4. Testen: Desktop und Handy (Touch), Pause/Esc, Vollbild, Rangliste, „weniger Bewegung“.

## Server (REST `mb-bugjagd/v1`)
- `POST start` → signiertes Ticket `time.rand.game.hmac`. `POST score` → Eintrag. `GET top?game=<id>`.
- Prüfungen: Mindestdauer, Punkte-Obergrenze, Zeit pro Punkt, Ticket nur einmal (`mbbj_used_`), Honeypot `website`, Namensfilter.
- Limits pro IP-Hash (täglich wechselnd): Start 600/h, Eintrag 30 je 15 min, 1000/Tag. Texte freundlich halten (Büro-WLAN teilt eine IP).
- Titel in der Rangliste werden nicht gespeichert, sondern im Browser aus den Punkten und `ranks` der Kachel berechnet.
- Speicher: Option `mbbj_top_<id>` (nur Top 10, autoload no). Schreiben mit Sperre `mbbj_lock_<id>` (INSERT IGNORE, nach 5 s veraltet).
- Admin: Werkzeuge → Arcade-Rangliste (`mbbj_admin_page`, seit 2.29 im MediaBees-Look: Karten-Raster je Spiel mit Vorschaubild aus der Kachel, Titel aus `ranks`, beides über `MBArcade.tiles()` aus `arcade.js`, das dort nur dafür geladen wird; Medaillen 1–3, Suche, Filter, Löschen mit Rückfrage, Zähler). Datenschutztext über `wp_add_privacy_policy_content`.

## Sicherheit (Check 2.9.1: keine Hintertür, keine SQL-Injection, kein XSS)
- Größtes Risiko ist der Update-Kanal: Wer auf `main` pushen kann, bringt Code auf die Live-Seite. Deshalb: 2FA auf dem GitHub-Konto, Branch-Schutz für `main`, wenig Mitarbeitende.
- Updates nur aus Release-ZIPs (`REQUIRE_RELEASE_ASSETS`, Regex verankert). `actions/checkout` im Workflow ist auf eine SHA gepinnt, Werte über `env:` statt direkt in `run:`.
- Tickets werden atomar eingelöst (`mbbj_claim_ticket`, INSERT IGNORE `mbbj_used_<md5>`, alte Marken werden nach 2 h weggeräumt).
- Namen nur per `textContent` ausgeben, nie per `innerHTML`. IP nie im Klartext, IPv6 zählt pro /64.
- Fehlt beim Rundenende das Ticket (`round.token`), versucht `core.js` es während der Runde bis zu 3-mal neu und zeigt sonst im Endscreen den Grund (`round.err`) statt des Namensfelds.
- Punkte kommen aus dem Browser, Ranglisten lassen sich mit Aufwand fälschen. Gegenmittel: `max_score`/`sec_per_point` und Löschen im Admin. Nutzer (2.29): reicht für jetzt (Spaß/Easter Egg). Vor einem Gewinnspiel die Obergrenzen je Spiel an echte Bestwerte anpassen (z. B. Flipper 2 Mio. ist sehr großzügig) und Prüfvorbehalt in die Teilnahmebedingungen.
- Während einer Runde zählt nur ein Finger (`isPrimary`-Filter in `core.js`), außer das Spiel setzt `multiTouch: true` (Steuerkreuz + Knopf).
- Spiele mit eigenem Pausenmenü setzen `ownPause: true` (Kern gibt Esc an `key()`), Kern-API zusätzlich `ctx.pause()` und `ctx.audio()` (Web-Audio nur bei Ton an).
- Spiele ohne Rangliste geben `finish(0, { headline, line })` zurück: Punkte 0 = kein Eintrag, eigene Überschrift im Endscreen.

## Oberfläche
- Handy (≤ 640 px): Kacheln als Raster mit 3 Spalten (ohne Rekordzeile). Darüber Knopf `.mb4-pick` („▶ aktuelles Spiel | Alle N Spiele ▾“). Nach Antippen einer Kachel klappt das Raster ein (`.mb4-carousel.is-collapsed`), beim Aufklappen werden die Vorschaubilder neu gezeichnet. Mit `spiel=`-Startspiel startet es eingeklappt. Karussell-Pfeile/-Punkte sind per CSS aus (Code noch da).
- Sprung zum Spielfeld (`ensureVisible`): misst feste/klebende Kopfleisten der Website (`headerOffset`, `elementsFromPoint` oben), scrollt bündig darunter (+12 px) und korrigiert nach 0,5 s und 1 s nach (bricht ab, wenn der Nutzer selbst scrollt). Beim Antippen einer Kachel immer bündig (`force`), sonst nur wenn das Spielfeld nicht ganz sichtbar ist. Auf dem Handy erst Raster zuklappen, dann scrollen.
- Unter der Top 10: Knopf „Ranglisten aller Spiele“ → `[data-all]`, Handy Top 3, Desktop Top 5 je Spiel.

## Shortcode
`[mediabees_arcade]` (alter Alias `[mediabees_bugjagd]`). Option: `spiel="<id>"` = Startspiel.
Das Plugin liefert **nur die Spielhalle**, keinen eigenen 404-Text (seit 2.7.0). Den Text darüber baut der Nutzer in Elementor:
Theme Builder → Einzelbeitrag/Single → Vorlage „404-Seite“ mit eigenem Text + Shortcode-Widget `[mediabees_arcade]`.
Gibt es keine Elementor-404-Vorlage, zeigt die 404 als Rückfall nur die Spielhalle (Filter `template_include`).
Die alte Option `intro` wird ignoriert.

## Köder auf der Website (seit 2.24.0, umgebaut 2.25.0)
- **Roter Knopf** kommt als HTML aus PHP (`mbbj_knopf_html`, ein `<a>`-Link, geht auch ohne JS). Standard: **im Footer** per Shortcode `[mediabees_knopf]` (Nutzer setzt ihn in die Elementor-Footer-Vorlage), optional `stil="notaus|klappe|arcade"`. Alternativ schwebend unten links/rechts (`place`, Ausgabe in `wp_footer`). Looks: Not-Aus (gelb-schwarzer Kasten, Standard), Glasklappe (Label „Streng geheim!“, Klappe öffnet bei Hover, lugt beim Wackeln kurz auf), Arcade (Chromring). Nutzer fand den ersten schwebenden Knopf nicht gut und wollte ihn im Footer.
- **Biene**: gezeichnetes SVG (Verlauf, Streifen, flatternde Flügel), ist ein `<div role="button">`, KEIN `<button>`: Theme/Elementor-Kit stylt Buttons gelb mit Polster (Nutzer sah nur einen gelben Knopf). CSS mit doppelten Klassen + `!important` gegen Theme-Styles; getestet mit feindlichem Test-CSS (`site/t/footer.html` im Scratchpad).
- **Anpassbar (2.27)**: `k_text_mode` std|custom|none, `k_text` (max. 28), `k_size` s|m|l (0,8/1/1,25 über `--mbbj-size`), `k_colors` + `k_cap`/`k_tagbg`/`k_tagfg`/`k_accent`. PHP setzt CSS-Variablen per `style` (`mbbj_knopf_vars`, Schattierungen des Knopfs per `mbbj_hex_mix`, gleiche Rechnung in `admin.js` für die Live-Vorschau). CSS nutzt `var(--…, Standard je Look)`. Farbsets: MediaBees, Feuerwehr, Giftgrün, Eisblau, Pink, Schwarz-Weiß. Vorschau auf dunklem/hellem Footer umschaltbar.
- **Elementor-Widget „Spielhallen-Knopf“ (2.28)**: eigene Werte je Widget für Look, Text, Größe, Farben (leer = „Wie in den Einstellungen“), Ausrichtung responsiv; Position/Abstände/Geräte über Elementors „Erweitert“-Reiter (bewusst kein eigenes px-System im Backend, Elementor-Editor ist die bessere Vorschau). `mbbj_knopf_html($style, $class, $over)` nimmt Überschreibungen. Hauptschalter und „Nicht auf diesen Seiten“ gelten auch fürs Widget, im Editor wird es immer gezeigt (`mbbj_in_builder()`: ?elementor-preview, AJAX `elementor_ajax` beim Neuzeichnen, Edit-/Preview-Mode; teaser.css immer über `elementor/preview/enqueue_styles`).
- Live-Seite 2.27/2.28: `teaser.css` kam im Backend nicht an (Vorschau-Kacheln nur gelber Link), Ursache unbekannt. Seit 2.28.2 wird das Knopf-CSS auf der Einstellungsseite per `wp_add_inline_style` an `mbbj-admin` gehängt. Widget-Gruppe „MediaBees“ (`elementor/elements/categories_registered`) + „basic“, Fallback-Hook `elementor/widgets/widgets_registered` für Elementor < 3.5, Statuszeile „Elementor x erkannt“.
- Schwebend: `float_x`/`float_y` (px, 0–400), `float_hide_mobile`.
- Einstellungsseite hell/dunkel: `admin_theme` auto|light|dark (Umschalter oben rechts im Kopf, `form="mbbj-form"`), Klasse `mbbj-dark` am `<body>` per JS, Regeln am Ende von `admin.css`.
- Klick → Vollbild „STRENG GEHEIM!“ (kurzer Alarm) → Weiterleitung zur Spielhalle. Strg/Cmd-Klick öffnet normal.
- Einstellungen: Option `mbbj_teaser` (button, bee, url = `/spielhalle/`, place = footer|left|right, style, bee_first = 40 s, bee_every = 120 s, bee_max = 2 (1–20), exclude = Pfade je Zeile, Unterseiten zählen mit, `/` = nur Startseite). Zeiten ±15 % Zufall. Formular unter Einstellungen → Spielhalle (`mbbj_settings_page`, seit 2.26 im MediaBees-Look: Kopf mit Biene, 3 Einrichtungs-Schritte inkl. Prüfung ob die Seite existiert (`url_to_postid`), Knopf-Looks/Positionen als Bildkacheln mit echter Vorschau, Schalter, Kopier-Chips `mbbj_copy_chip`, klebende Speicherleiste; mit Beschreibung des Plugins, Link „Einstellungen“ in der Plugin-Liste neben „Deaktivieren“; KEIN zweiter Link hinter „Nach Updates suchen“, Nutzer fand das doppelt). Ranglisten bleiben unter Werkzeuge → Arcade-Rangliste.
- Nicht auf: 404, der Spielhallen-Adresse, Seiten mit `#mb404`, ausgeschlossenen Pfaden (Shortcode gibt dort nichts aus). In der Elementor-Vorschau zeigt der Shortcode den Knopf (nur CSS). „Weniger Bewegung“ = keine Biene. `?mbbj_biene=1` lässt die Biene sofort fliegen.
- Die eigene Seite heißt „Spielhalle“ (`/spielhalle/`), der Nutzer legt sie in Elementor an (Shortcode-Widget). Die 404 bleibt zusätzlich.

## Hinweise zur Live-Seite
- Auf mediabees.de läuft das Chat-Widget „Thor“ (`.thor-chat-host`). Die Spielhalle blendet es aus, solange das Spiel im Bild ist
  (Klasse `mb4-game-near` auf `<html>`, Regeln am Ende von `arcade.css`). Weitere Schwebe-Widgets dort ergänzen.
- Im Plugin „Admin Site Enhancements“ muss „Redirect 404 to Homepage“ **aus** sein.
- Test-URL: jede nicht vorhandene Adresse, z. B. https://mediabees.de/pollen-test-404

## Offene Idee: Monats-Gewinnspiel
Ein Honigglas pro Monat (auch für Privatpersonen). Noch nicht bauen. Voraussetzungen: Teilnahmebedingungen,
E-Mail nur zur Benachrichtigung (getrennt von der öffentlichen Rangliste, nach der Ziehung löschen, keine Newsletter-Kopplung),
Regel für Minderjährige, Prüfvorbehalt gegen Schummeln. Vorschlag: Verlosung unter allen Top-10-Einträgen des Monats.

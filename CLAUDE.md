# MediaBees Spielhalle – Projektwissen für Claude

WordPress-Plugin „MediaBees Spielhalle“ (früher „MediaBees Arcade (404)“, Ordner und IDs unverändert) für mediabees.de (WordPress + Elementor Pro).
Es ersetzt die 404-Seite durch eine kleine Spielhalle mit Top-10-Ranglisten wie am Automaten
und kann per Shortcode auch auf jeder anderen Seite stehen. Aktuelle Version: **2.24.2**.

## Regeln für die Zusammenarbeit (wichtig)
- **Immer auf Deutsch antworten**, auch Zwischenmeldungen.
- Spiele kommen **einzeln** dazu: bauen → Nutzer testet (Juice, Handy) → Feedback → nächstes Spiel.
- **Kein Backup bei jedem Schritt.** Ein WPvivid-Backup gibt es erst ganz am Ende.
- MediaBees-CD: Schrift Poppins, Gelb `#FDC506`, dunkle Karten. Viel Juice, Handy zuerst.
- Keine Original-Grafiken, -Namen oder -Figuren bekannter Spiele (Tetris, Pac-Man, Dino usw.).
  Nur das Spielprinzip übernehmen, Figuren und Namen selbst erfinden (Bienen, Käfer, Wespen, Ruhrgebiet).
- DSGVO-schlank: keine Cookies, kein localStorage, keine externen Dienste.

## Aufbau des Repos
```
src/core.js          Kern der Spielhalle (Kacheln, Overlay, Rangliste, Sound, Juice, Lazy-Load)
src/tiles/NN-<id>.js Kachel je Spiel (zweistellig nummeriert, das ist die Reihenfolge): MBArcade.tile({id, title, thumb})  -> landet in arcade.js
src/games/<id>.js    Das Spiel selbst: MBArcade.register({...})          -> wird erst beim Antippen geladen
src/teaser.js        Knopf „Nicht drücken!“ + fliegende Biene auf allen Seiten -> assets/teaser.js (CSS: assets/teaser.css)
plugin/mediabees-bugjagd/   Das WordPress-Plugin (Ordnername bleibt so, sonst verliert WP die Zuordnung)
  mediabees-bugjagd.php     Hauptdatei: MBBJ_VERSION, mbbj_games(), REST-API, Shortcode, Admin
  templates/404.php         404-Template (Filter template_include, Elementor-Header/-Footer bleiben)
  templates/markup.php      HTML der Spielhalle
  assets/arcade.css         Styles
  assets/arcade.js          GEBAUT aus src/core.js + src/tiles/*.js – nicht direkt bearbeiten
  assets/games/*.js         GEBAUT (Kopie aus src/games)
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
| knaller | Bienenboom (bis 2.22 „Honigknaller“) | Bomberman-Prinzip. Feld quer 15 × 11, hochkant 11 × 13 (Rand + Säulen fest, Wachsblöcke zufällig). Reichweite startet bei 1 (Extras erhöhen). Allein: Level mit 2 + Level Wespen und Level/2 Hornissen, Wespen starten in den drei anderen Ecken (Ecken-Zonen frei), legen ab Level 1 Bomben, wenn die Biene < 10 Felder weg ist (Hornisse alle 5–8 s, Wespe 8–13 s, nur mit Fluchtweg). Alle Bomben töten Wespen, `foe`-Bomben ohne Punkte („Gut gemacht!“). Eigene Bombe erwischt dich selbst: zufällig „Gut gemacht!“, „Selbstkill!“ oder „Peinlich!“. Wachsblock fängt die Explosion ab (keine Flamme auf/hinter ihm). Tod = alle Extras weg, alle 5 Level +1 Leben (max. 3). Wespen klauen Extras (Reichweite, Tempo, schneller nächste Bombe), Wespe 100, Hornisse 200, mehrere in einer Explosion × Kette, Block 10, Extra 50, Level geschafft +500 × Level, 3 Leben. Menü (auch Handy): 1 Allein (Rangliste), 2 Gegen 3 Bots, am PC 3 Zu zweit, 4 Zu zweit + 2 Bots. Duelle ohne Rangliste (`finish(0, {headline})`), wer zuerst 2 Runden gewinnt, Endspurt nach 40/70 s (+2 Reichweite, +1 Bombe). Bots heißen zufällig Uschi, Waldo, Wayne, Super Siggi, Ilse, Gisela, Horst (`BOT_NAMES`, Waldo und Wayne mit Gewicht 5 = deutlich öfter, bleiben im Duell gleich; „Bärbel“ nicht verwenden, Wunsch des Nutzers). Bots: Gefahrenkarte + Breitensuche, legen nur mit Fluchtweg, Schrecksekunde 0,15–0,45 s. Figuren schauen in Laufrichtung (auch hoch/runter). Handy: schwebender Joystick unten links + Bombenknopf (`multiTouch: true`) |
| flipper | Honigflipper | Flipper-Prinzip, eigener Bienenstock-Tisch (logisch 400 × 700, 10 Teilschritte Physik, mehrere Kugeln in `st.list`). 3 Honigtopf-Bumper 100, Schleudern 10, BIENE-Ziele links je 250 (alle 5 = +2.500 und Multiplikator +1), 3 Bahnen oben je 50 (alle = Multiplikator +1, max. ×5), fliegende Wespe 750 (jede 3. = Multiplikator +1), Drehtor links 25 je Umdrehung, Honigtopf-Mulde 500 (3× = Multiball, alles doppelt, Kugelverlust im Multiball kostet kein Leben). Abflüsse links/rechts außen, Rückläufe innen +100 zünden die Rettungslampe im Abfluss daneben (kickt die Kugel einmal zurück). Bonus am Kugelende. Rettung (Ball Save) nur einmal pro Kugel, 4 s. Einbahn-Tor oben an der Abschussbahn (y 204). Honigsaft 0–100: Flipperschlag −2, Treffer füllen auf (Bumper 2, kleine Kugel 4, Ziel 4, Wespe 12, Honigtopf 8, Bahn/Rücklauf 3), neue Kugel +25, leer = Flipper bewegen sich nicht. Kleine Kugel oben links (74,166) = 250. Multiplikator zurück bei Kugelverlust. 3 Kugeln. Tasten: A/D, ←/→, Shift; Abschuss Leertaste/↓/S/Enter halten und loslassen. Handy: linke/rechte Hälfte (`multiTouch: true`), Abschuss halten und loslassen |
| wurf | Haldenduell (bis 2.22 „Wurfduell“) | Artillerie-Prinzip (wie Worms), rundenbasiert. Gelände als Höhenlinie `gnd[x]` (quer 1000 × 560, hochkant 520 × 700), Krater per `carve`, Wasser (Emscher) unten = baden = raus. Wind je Zug (Pollen fliegen mit). Zielen: Schleuder (irgendwo zurückziehen und loslassen; Rechtsklick beim Ziehen oder zurück zum Startpunkt = abbrechen) oder ←/→ Winkel, ↑/↓ Kraft, Leertaste; Wabenmauer per Klick auf die gewünschte Seite; Q wechselt: Honigtopf (unbegrenzt, Aufprall, R 40, 45 Schaden) / Pollenbombe (2 pro Runde, `ammo`, hüpft, 3 s, R 34) / Wabenmauer (18 × 74 Wachs 44 px vor der Figur in Zielrichtung, `st.wax` = alte Bodenhöhe, Krater im Wachs nur halber Radius = ca. 3 Volltreffer; Bauen beendet den Zug, neue Mauer erst wenn die eigene kaputt ist: `hasWall`/`checkWalls`). Figuren prallen an Wänden ab, die mehr als 10 px höher sind als die Füße (kein Durchrutschen). Rückstoß 70 + 170 × Nähe (Wasser ist Absicht, aber nicht zu leicht). Vorschau nur kurz ohne Wind. 30 s pro Zug. Gegner-Namen zufällig aus `FOE_NAMES` (Uschi, Waldo, Wayne, Super Siggi, Ilse, Gisela, Horst; Waldo/Wayne öfter), ab Runde 3 zu 45 % Hornisse. Gegen Wespen (Rangliste): Gegner-HP 50 + 15 × Runde, rechnet alle Würfe für Topf und Pollenbombe durch (`simulateBomb` mit Abprallen), nimmt die Bombe wenn der Topf nicht durchkommt oder zu 30 % zur Abwechslung, baut bei ≤ 60 % Leben zu 50 % eine Wabenmauer (statt zu werfen), zielt mit Streuung (wird je Runde genauer; Runde 1 ×1,7, Runde 2 ×1,35 ungenauer), Schaden × 5 Pkt, Volltreffer +100, Sieg +300 × Runde, du heilst 30 je Runde. Zu zweit: Biene gegen Hummel, wer zuerst 2 Runden gewinnt, `finish(0, {headline})` |
| blitz | Bienen-Blitz | Minispiel-Sammlung (Prinzip „Dumb Ways to Die“/WarioWare). 10 Aufgaben in `GAMES` (init/update/tap/key/move/draw, `m.win`/`m.fail`, `timeout` = Ergebnis bei Zeitablauf): nopush (roter Knopf NICHT drücken, Drücken = KABOOM), wasp (antippen), catch (Honigtropfen mit Glas fangen, Maus/Finger/←→), flowers (alle antippen), pump (8 + 2 × Stufe Tipps/Leertaste), wire (Kabel nach Farbe schneiden, 1–3; eigene Zeit `time`: 5 s − 0,5 s je Stufe, min. 3 s, Bombenuhr zeigt echte Restzeit `m.left`, Zeit um = Explosion), dodge (Kohlebrocken ausweichen), count (Bienen zählen, dann 3 Antworten), findbee (Biene zwischen Wespen), stop (im gelben Feld stoppen), whack (WESPEN HAUEN: 6 Wabenlöcher, Wespen hauen, Bienen nicht, 3 + Stufe/2 Treffer, eigene Zeit 5 s → 3,5 s). Honigtropfen fällt in der halben Spielzeit. Beutel-Mischung, keine Aufgabe zweimal direkt hintereinander. Ansage groß (Intro 1,1 s → 0,6 s), Spielzeit 4,4 s → min. 2,1 s, Zündschnur als Zeitleiste. 3 Leben, Sieg 100 × Stufe, alle 5 Siege Stufe +1 und +250 × Stufe. Roter Knopf gedrückt = Atompilz als eigenes Vollbild (`drawNuke`: glühender Himmel, Skyline mit Förderturm, großer Pilz, 2,2 s). Zwischenbild nach jeder Aufgabe: tanzende Biene + Leben (`drawCard`, Phase `card`), Spielende: Biene auf dem Rücken mit Kreuzaugen, darüber zufällig einer von drei Sprüchen vom Nutzer: „DU HAST VERLOREN! (peinlich)“, „Manchmal muss man loslassen, um festzuhalten, was wirklich zählt.“, „Wo viel verloren wird, ist manches zu gewinnen.“ – Goethe (NICHT „Oh nein!“, „Das war jetzt nicht so schlau.“, „Biene k.o.!“ usw.), darunter „Alle Leben aufgebraucht …“ (`drawDead`, Phase `dead`). Bei Antipp-Aufgaben (wasp, flowers, wire, findbee, count) ist Danebentippen ein Fehler („Daneben!“), außer in der Falle. Aufgabe steht nur in der Ansage (Intro), beim Spielen nicht mehr (Wunsch: verunsichern). Fallen ab der 4. Aufgabe selten (10 % + 2 % je Stufe, max. 20 %, nie zweimal hintereinander): umgedrehte Aufgabe (`m.trap`, `trappable`), nichts tun = geschafft, normale Aufgabe erfüllen = „Reingefallen!“; beim Knopf umgekehrt „JETZT DRÜCKEN!“ (`trapSelf`), Fangen: verfehlen = geschafft (`trapFailIsWin`). Keine Falle bei Zählen und Ausweichen |
| wimmel | Wimmelpott | Wimmelbild, jede Runde zufällig gebaut (`build`): 8 Teile-Sorten in `TYPES` mit Varianten + Ansage-Text (Biene/Wespe mit Sonnenbrille/Zylinder/Krone/rotem Schal, Honigglas mit Deckelfarbe, Ballon/Auto/Blume/Schirm in Farben, Pommes mit Ketchup/Mayo/Schranke/ohne alles). 3 Ziele, je genau einmal und frei liegend, viele Ablenkungen gleicher Sorte. Themen rotieren je Level (Kirmes, Wiese, Zeche). Szene einmal vorgezeichnet (`paintScene`). 45 s je Level, falsch (auch ins Leere) −3 s mit Spruch, nur Bienen/Wespen/Autos werden gespiegelt (Ziele nie, damit das Bild unten passt), Tipp (Knopf/T) −5 s zeigt gestrichelten Kreis. Fund 100 × Level, Level geschafft + 20 je Restsekunde, Zeit um = Ende (fehlende Ziele blinken). Mehr Teile je Level. Handy: Leiste unten höher, Symbol über dem Text |

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
**Großes Projekt in Planung: Ich-Shooter (Prinzip der 90er-Raycaster, KEIN Name/keine Grafik des Vorbilds).** Arbeitstitel „Zeche Zollstock“: Biene kämpft sich mit Honigkanone durch eine Zeche voller Wespen, Ebene für Ebene bis zum Förderkorb, Wespenkönigin als Boss. Waffen: Stachel-Pistole, Pollen-Schrotflinte, Honigkanone, Wespen-Staubsauger. Handy: Joystick links + Wischen rechts. Technik: Raycaster mit Pixel-Wänden + flachen Figuren (läuft auch auf alten Handys). Nutzer liefert noch eigene Ideen („Hirnsaft“). **Noch nicht bauen**, erst alle anderen offenen Sachen fixen; Start dann mit einer spielbaren Ebene.
Grundsatz (Nutzer, 2.24): lieber wenige richtig gute Spiele als viele, die keiner spielt. Lieblinge des Nutzers: Bienen-Solitär, Bienen-Blitz, Bienenboom, Pollenrausch.
Gestrichen: Bubble Ball, Schach.

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
- Admin: Werkzeuge → Arcade-Rangliste. Datenschutztext über `wp_add_privacy_policy_content`.

## Sicherheit (Check 2.9.1: keine Hintertür, keine SQL-Injection, kein XSS)
- Größtes Risiko ist der Update-Kanal: Wer auf `main` pushen kann, bringt Code auf die Live-Seite. Deshalb: 2FA auf dem GitHub-Konto, Branch-Schutz für `main`, wenig Mitarbeitende.
- Updates nur aus Release-ZIPs (`REQUIRE_RELEASE_ASSETS`, Regex verankert). `actions/checkout` im Workflow ist auf eine SHA gepinnt, Werte über `env:` statt direkt in `run:`.
- Tickets werden atomar eingelöst (`mbbj_claim_ticket`, INSERT IGNORE `mbbj_used_<md5>`, alte Marken werden nach 2 h weggeräumt).
- Namen nur per `textContent` ausgeben, nie per `innerHTML`. IP nie im Klartext, IPv6 zählt pro /64.
- Fehlt beim Rundenende das Ticket (`round.token`), versucht `core.js` es während der Runde bis zu 3-mal neu und zeigt sonst im Endscreen den Grund (`round.err`) statt des Namensfelds.
- Punkte kommen aus dem Browser, Ranglisten lassen sich mit Aufwand fälschen. Gegenmittel: `max_score`/`sec_per_point` und Löschen im Admin.
- Während einer Runde zählt nur ein Finger (`isPrimary`-Filter in `core.js`), außer das Spiel setzt `multiTouch: true` (Steuerkreuz + Knopf).
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

## Köder auf der Website (seit 2.24.0)
- Roter Knopf „Nicht drücken!“ unten links/rechts und eine Biene, die nach 30–60 s durchs Bild fliegt, mittendrin kurz stehen bleibt und spricht (max. 3-mal pro Seite). Klick → Vollbild „STRENG GEHEIM!“ (kurzer Alarm) → Weiterleitung zur Spielhalle.
- Einstellungen: Option `mbbj_teaser` (button, bee, url = `/spielhalle/`, side, exclude = Pfade je Zeile, Unterseiten zählen mit, `/` = nur Startseite), Formular unter Einstellungen → Spielhalle (`mbbj_settings_page`, mit Beschreibung des Plugins, Link „Einstellungen“ in der Plugin-Liste bei den Aktionen und hinter „Nach Updates suchen“ per `plugin_row_meta`). Ranglisten bleiben unter Werkzeuge → Arcade-Rangliste.
- Nicht auf: 404, der Spielhallen-Adresse, Seiten mit `#mb404`, Elementor-Vorschau, ausgeschlossenen Pfaden. „Weniger Bewegung“ = keine Biene. `?mbbj_biene=1` lässt die Biene sofort fliegen (zum Ansehen).
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

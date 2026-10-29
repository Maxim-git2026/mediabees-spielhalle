# MediaBees Spielhalle – Projektwissen für Claude

WordPress-Plugin „MediaBees Arcade (404)“ für mediabees.de (WordPress + Elementor Pro).
Es ersetzt die 404-Seite durch eine kleine Spielhalle mit Top-10-Ranglisten wie am Automaten
und kann per Shortcode auch auf jeder anderen Seite stehen. Aktuelle Version: **2.7.0**.

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
src/tiles/N-<id>.js  Kachel je Spiel: MBArcade.tile({id, title, thumb})  -> landet in arcade.js
src/games/<id>.js    Das Spiel selbst: MBArcade.register({...})          -> wird erst beim Antippen geladen
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
| flitzer | A40-Flitzer | Ausweich-Racer von oben, 4 Spuren, Dortmund → Venlo, Ausfahrten je km, Strecke 1 Pkt/40 px, Honig +50, knapp vorbei +10, Wabenschild = 1 Rempler frei |

### Nächste Spiele (in dieser Reihenfolge)
„Alte Website zerlegen“ → Minesweeper (Wespennester) → Pac-Man-Variante →
Waben-Tetris (Sechsecke) → Solitär → Wimmelbild → Flipper → Bomberman (1 Spieler + Spaß-Modus zu zweit ohne Rangliste).
Ideenliste: Doodle-Jump-Prinzip, Dino-Läufer (Chrome-offline-Prinzip), Space-Invaders-Prinzip, Crossy-Road-Prinzip.
Gestrichen: Bubble Ball, Schach.

## Neues Spiel anlegen – Checkliste
1. `src/tiles/<N>-<id>.js`: `MBArcade.tile({ id, title, thumb: function (g, w, h) {...} })`.
2. `src/games/<id>.js`: `MBArcade.register({ id, title, duration (0 = ohne Zeitlimit), startText, help: {controls, legend}, ranks: [[minPunkte, Titel, Text], ...], cta, stats(s), mount(ctx) })`.
   - `mount(ctx)` bekommt `ctx.screen`, `ctx.stage`, `ctx.setScore`, `ctx.setTime`, `ctx.say` (Toast), `ctx.tone` (Sound),
     `ctx.reduce` (weniger Bewegung), `ctx.touch`, `ctx.finish(stats)`.
   - Rückgabe: `{ start, setPaused(on), abort, unmount, resize, key(e) }` (key gibt true zurück, wenn verarbeitet).
   - Gemeinsame Zeichenfunktionen: `MBArcade.art` (bee, queen, wasp, car, flitzer, hex, rrect …).
   - Icons für die Anleitung: z. B. `'kbd:Esc'`, `'tap'`, `'swipe'`.
3. In `mbbj_games()` (PHP) eintragen: `title`, `min_age` (Mindestdauer einer Runde in s), `max_score`, `sec_per_point`.
4. Testen: Desktop und Handy (Touch), Pause/Esc, Vollbild, Rangliste, „weniger Bewegung“.

## Server (REST `mb-bugjagd/v1`)
- `POST start` → signiertes Ticket `time.rand.game.hmac`. `POST score` → Eintrag. `GET top?game=<id>`.
- Prüfungen: Mindestdauer, Punkte-Obergrenze, Zeit pro Punkt, Ticket nur einmal (`mbbj_used_`), Honeypot `website`, Namensfilter.
- Limits pro IP-Hash (täglich wechselnd): Start 600/h, Eintrag 30 je 15 min, 1000/Tag. Texte freundlich halten (Büro-WLAN teilt eine IP).
- Speicher: Option `mbbj_top_<id>` (nur Top 10, autoload no). Schreiben mit Sperre `mbbj_lock_<id>` (INSERT IGNORE, nach 5 s veraltet).
- Admin: Werkzeuge → Arcade-Rangliste. Datenschutztext über `wp_add_privacy_policy_content`.

## Shortcode
`[mediabees_arcade]` (alter Alias `[mediabees_bugjagd]`). Option: `spiel="<id>"` = Startspiel.
Das Plugin liefert **nur die Spielhalle**, keinen eigenen 404-Text (seit 2.7.0). Den Text darüber baut der Nutzer in Elementor:
Theme Builder → Einzelbeitrag/Single → Vorlage „404-Seite“ mit eigenem Text + Shortcode-Widget `[mediabees_arcade]`.
Gibt es keine Elementor-404-Vorlage, zeigt die 404 als Rückfall nur die Spielhalle (Filter `template_include`).
Die alte Option `intro` wird ignoriert.

## Hinweise zur Live-Seite
- Im Plugin „Admin Site Enhancements“ muss „Redirect 404 to Homepage“ **aus** sein.
- Test-URL: jede nicht vorhandene Adresse, z. B. https://mediabees.de/pollen-test-404

## Offene Idee: Monats-Gewinnspiel
Ein Honigglas pro Monat (auch für Privatpersonen). Noch nicht bauen. Voraussetzungen: Teilnahmebedingungen,
E-Mail nur zur Benachrichtigung (getrennt von der öffentlichen Rangliste, nach der Ziehung löschen, keine Newsletter-Kopplung),
Regel für Minderjährige, Prüfvorbehalt gegen Schummeln. Vorschlag: Verlosung unter allen Top-10-Einträgen des Monats.

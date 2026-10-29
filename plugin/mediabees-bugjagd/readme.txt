=== MediaBees Arcade (404) ===
Contributors: mediabees
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 2.8.0
License: proprietär, nur für mediabees.de

Spielhalle für die 404-Seite und für eine eigene Seite per Shortcode, mit Top-10-Rangliste pro Spiel.

== Benutzung ==

* 404-Seite: Das Plugin übernimmt die 404-Seite automatisch (Header und Footer bleiben aus Elementor). Gibt es eine Elementor-404-Vorlage, wird stattdessen die gezeigt. Dort kann der Shortcode eingesetzt werden.
* Eigene Seite: [mediabees_arcade] in ein Shortcode-Widget setzen. Auf normalen Seiten erscheint nur die Spielhalle, ohne den 404-Kopf.
* Optionen: spiel="polonaise" wählt ein Spiel vor: bugjagd (Käfer-Jagd), wespen (Bienenstich), revier (Revierflug), polonaise (Bienentanz), flitzer (A40-Flitzer), abriss (Website-Abriss), nester (Wespennest).
* Ranglisten verwalten: Werkzeuge → Arcade-Rangliste.
* Datenschutz-Text: Einstellungen → Datenschutz → Leitfaden.
* Beim Löschen des Plugins entfernt uninstall.php alle Ranglisten, Einstellungen und Zähler aus der Datenbank.

== Versionen ==

Versionsnummern: MAJOR.MINOR.PATCH. Neues Spiel oder neue Funktion = MINOR, reine Fehlerbehebung = PATCH.

= 2.8.0 – 29.10.2026 =
* Neues Spiel: Website-Abriss. Alte Homepages von 1999 in 45 Sekunden mit Hammer, Flammenwerfer und Bienenschwarm zerlegen. Ist eine Seite platt, kommt die nächste.
* Neues Spiel: Wespennest. Waben aufdecken, ohne ein Wespennest zu erwischen. Die Zahlen zeigen die Nester in den 6 Nachbarwaben. Jedes geräumte Feld bringt Bonus und ein größeres Level.
* Datenschutz-Hinweis beim Eintragen: Einen eingetragenen Namen kann man nicht selbst ändern oder löschen, sondern schreibt uns dafür.

= 2.7.1 – 29.10.2026 =
* A40-Flitzer: Punkte, Tempo und Ausfahrtsschilder stehen jetzt klein oben links und verdecken die Straße nicht mehr.
* A40-Flitzer: Auf dem Handy wechselt man die Spur jetzt durch Wischen nach links oder rechts. Ein langer Wisch geht über mehrere Spuren.
* A40-Flitzer: Keine große Einblendung mehr mitten auf der Fahrbahn.

= 2.7.0 – 29.10.2026 =
* Der 404-Kopf („Bzzzt. Hier summt nix.“ mit Buttons) ist entfernt. Das Plugin liefert nur noch die Spielhalle, den eigenen Text setzt ihr in Elementor darüber.
* Die Shortcode-Option intro="ja" wird nicht mehr gebraucht und einfach ignoriert.

= 2.6.0 – 29.10.2026 =
* Updates direkt im WordPress-Backend: Neue Versionen erscheinen unter „Plugins“ und lassen sich mit einem Klick installieren (aus den GitHub-Releases).
* Beim Löschen des Plugins wird auch der Zwischenspeicher der Update-Prüfung entfernt.

= 2.5.0 – 29.10.2026 =
* Neues Spiel: A40-Flitzer (Ausweich-Prinzip). Mit dem Bienenflitzer durch den Feierabendverkehr von Dortmund Richtung Venlo, Ausfahrten als Meilensteine, Honiggläser, Wabenschild und Bonus für knappe Manöver.

= 2.4.0 – 29.10.2026 =
* Shortcode für eine eigene Spielhallen-Seite: ohne 404-Kopf, Optionen spiel="…" und intro="ja|nein".
* uninstall.php räumt beim Löschen alles auf (Ranglisten, Version, Sperren, Spam-Zähler).
* Bug-Jagd: Fehlklick auf eine leere Wabe kostet einen Punkt und die Kombo (gegen Dauerklicken).
* readme.txt mit Changelog.
* Neue Namen: Bug-Jagd heißt jetzt Käfer-Jagd, Wespenalarm heißt Bienenstich, Pollen-Polonaise heißt Bienentanz. Ranglisten bleiben erhalten.

= 2.3.0 – 29.10.2026 =
* Neues Spiel: Pollen-Polonaise (Snake-Prinzip).
* Spiele werden erst beim Antippen der Kachel geladen.
* Rangliste lädt am Rundenende und alle 30 Sekunden neu.
* Datenbank-Sperre beim Speichern, damit gleichzeitige Einträge sich nicht überschreiben.

= 2.2.1 – 29.10.2026 =
* Eintrags-Limit für geteilte Anschlüsse (Büro-WLAN) gelockert, freundlichere Hinweise.

= 2.2.0 – 29.10.2026 =
* Mehr Effekte in allen Spielen: Partikel, Wackeln, Punkte-Pops.
* Wespenalarm: Munitionsring ums Visier, Treffer-Serie mit Bonus.
* Bug-Jagd: Kombo-Anzeige.

= 2.1.0 – 29.10.2026 =
* Spielauswahl als Kacheln, Anleitung mit Icons vor jedem Spiel.
* Pause mit Esc, Vollbild, großer Spielbildschirm, Handy-Optimierung.
* Top 3 im Endscreen, Top 10 unter dem Spiel.
* Wespenalarm: mehr Insektentypen, Sofort-Nachladen mit der Leertaste.

= 2.0.0 – 28.10.2026 =
* Spielhalle mit Bug-Jagd, Wespenalarm und Revierflug.
* Top-10-Rangliste pro Spiel wie am Automaten, Spam-Schutz, Datenschutz-Hinweis.

= 1.0.0 – 28.10.2026 =
* Erste 404-Seite mit Bug-Jagd.

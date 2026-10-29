=== MediaBees Arcade (404) ===
Contributors: mediabees
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 2.4.0
License: proprietär, nur für mediabees.de

Spielhalle für die 404-Seite und für eine eigene Seite per Shortcode, mit Top-10-Rangliste pro Spiel.

== Benutzung ==

* 404-Seite: Das Plugin übernimmt die 404-Seite automatisch (Header und Footer bleiben aus Elementor). Gibt es eine Elementor-404-Vorlage, wird stattdessen die gezeigt. Dort kann der Shortcode eingesetzt werden.
* Eigene Seite: [mediabees_arcade] in ein Shortcode-Widget setzen. Auf normalen Seiten erscheint nur die Spielhalle, ohne den 404-Kopf.
* Optionen: spiel="polonaise" wählt ein Spiel vor: bugjagd (Käfer-Jagd), wespen (Bienenstich), revier (Revierflug), polonaise (Bienentanz). intro="ja" zeigt den 404-Kopf auch auf normalen Seiten, intro="nein" blendet ihn auf der 404 aus.
* Ranglisten verwalten: Werkzeuge → Arcade-Rangliste.
* Datenschutz-Text: Einstellungen → Datenschutz → Leitfaden.
* Beim Löschen des Plugins entfernt uninstall.php alle Ranglisten, Einstellungen und Zähler aus der Datenbank.

== Versionen ==

Versionsnummern: MAJOR.MINOR.PATCH. Neues Spiel oder neue Funktion = MINOR, reine Fehlerbehebung = PATCH.

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

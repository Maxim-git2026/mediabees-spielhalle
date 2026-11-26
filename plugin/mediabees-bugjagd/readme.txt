=== MediaBees Spielhalle ===
Contributors: mediabees
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 2.28.2
License: proprietär, nur für mediabees.de

Spielhalle für die 404-Seite und für eine eigene Seite per Shortcode, mit Top-10-Rangliste pro Spiel.

== Benutzung ==

* 404-Seite: Das Plugin übernimmt die 404-Seite automatisch (Header und Footer bleiben aus Elementor). Gibt es eine Elementor-404-Vorlage, wird stattdessen die gezeigt. Dort kann der Shortcode eingesetzt werden.
* Eigene Seite: [mediabees_arcade] in ein Shortcode-Widget setzen. Auf normalen Seiten erscheint nur die Spielhalle, ohne den 404-Kopf.
* Optionen: spiel="polonaise" wählt ein Spiel vor: bugjagd (Käfer-Jagd), wespen (Bienenstich), revier (Revierflug), polonaise (Bienentanz), flitzer (A40-Flitzer), abriss (Website-Abriss), nester (Wespennest), wacht (Wespen-Invasion), pfad (Pollenrausch), wabenbau (Wabenbau), solitaer (Bienen-Solitär), hopser (Hummelhopser), honigdieb (Honigdieb), knaller (Bienenboom), flipper (Honigflipper), wurf (Haldenduell), blitz (Bienen-Blitz), wimmel (Wimmelpott).
* Einstellungen (Knopf und Biene): Einstellungen → Spielhalle. Knopf im Footer: Shortcode [mediabees_knopf] (optional stil="notaus|klappe|arcade").
* Ranglisten verwalten: Werkzeuge → Arcade-Rangliste.
* Datenschutz-Text: Einstellungen → Datenschutz → Leitfaden.
* Beim Löschen des Plugins entfernt uninstall.php alle Ranglisten, Einstellungen und Zähler aus der Datenbank.

== Versionen ==

Versionsnummern: MAJOR.MINOR.PATCH. Neues Spiel oder neue Funktion = MINOR, reine Fehlerbehebung = PATCH.

= 2.28.2 – 26.11.2026 =
* Einstellungen → Spielhalle: Die Knopf-Vorschauen bei „Aussehen“ waren leer (nur ein gelber Link). Jetzt werden die Knöpfe dort wieder richtig gezeigt.
* Elementor: Das Widget „Spielhallen-Knopf“ steht jetzt in einer eigenen Gruppe „MediaBees“ ganz oben in der Widget-Liste (und zusätzlich bei „Basis“). Funktioniert auch mit älteren Elementor-Versionen.
* Die Einstellungsseite zeigt an, ob Elementor erkannt wurde.

= 2.28.1 – 26.11.2026 =
* Elementor: Der Spielhallen-Knopf (Widget und Shortcode) wird im Editor jetzt immer angezeigt, auch direkt nach dem Einfügen und nach jeder Änderung. Vorher blieb die Vorschau dort leer.

= 2.28.0 – 26.11.2026 =
* Neu in Elementor: das Widget „Spielhallen-Knopf“. Einfach reinziehen und nur für diesen Knopf Look, Text, Größe und Farben einstellen. Frei verschieben mit px oder % geht über Elementor (Erweitert → Positionierung), für PC, Tablet und Handy getrennt.
* Schwebender Knopf: Abstand zum Rand und nach unten in Pixeln einstellbar, dazu „Auf dem Handy ausblenden“.

= 2.27.0 – 26.11.2026 =
* Roter Knopf zum Anpassen: Standardtext, eigener Text (bis 28 Zeichen) oder ganz ohne Schild, drei Größen und eigene Farben für Knopf, Schild, Schrift und Akzent. Dazu fertige Farbsets (MediaBees, Feuerwehr, Giftgrün, Eisblau, Pink, Schwarz-Weiß).
* Die Vorschau zeigt jede Änderung sofort, wahlweise auf dunklem oder hellem Footer.
* Die Einstellungsseite gibt es jetzt auch dunkel: oben rechts Hell, Auto (wie das Gerät) oder Dunkel wählen.

= 2.26.0 – 26.11.2026 =
* Einstellungen → Spielhalle im neuen MediaBees-Look: Knopf-Looks und Positionen als Bilder zum Anklicken, animierte Bienen-Vorschau, Schalter zum An- und Ausschalten, Shortcodes mit einem Klick kopieren.
* Die Seite zeigt jetzt, ob es die Spielhallen-Seite schon gibt, und erklärt die Einrichtung in drei Schritten.
* Die Bienen-Zeiten stehen zusätzlich als Satz da, z. B. „Die erste Biene kommt nach etwa 40 Sekunden …“.

= 2.25.1 – 26.11.2026 =
* Der doppelte Link „Einstellungen (Knopf & Biene)“ hinter „Nach Updates suchen“ ist weg. Die Einstellungen erreichst du über den Link „Einstellungen“ neben „Deaktivieren“.

= 2.25.0 – 26.11.2026 =
* Der rote Knopf gehört jetzt in den Footer: Shortcode [mediabees_knopf] in der Elementor-Footer-Vorlage einsetzen. Schwebend am Bildschirmrand geht weiterhin, wenn man es in den Einstellungen wählt.
* Drei neue Knopf-Looks zur Auswahl: Not-Aus (gelb-schwarz), Geheimknopf unter Glasklappe (Klappe geht beim Drüberfahren auf) und Arcade-Knopf.
* Die Biene ist jetzt eine richtig gezeichnete Biene mit flatternden Flügeln. Vorher konnte das Theme sie zu einem gelben Knopf umstylen.
* Neu in Einstellungen → Spielhalle: wann die erste Biene kommt, wie oft danach und wie viele Bienen höchstens pro Seite.

= 2.24.2 – 26.11.2026 =
* In der Plugin-Liste steht jetzt hinter „Nach Updates suchen“ der Link „Einstellungen (Knopf & Biene)“.

= 2.24.1 – 26.11.2026 =
* Neu im Backend: Einstellungen → Spielhalle. Dort steht, was das Plugin macht, und dort stellst du den roten Knopf und die Biene ein. In der Plugin-Liste gibt es dafür jetzt auch den Link „Einstellungen“.

= 2.24.0 – 26.11.2026 =
* Neu: Auf allen Seiten der Website gibt es jetzt einen kleinen roten Knopf „Nicht drücken!“. Wer ihn drückt, sieht kurz „STRENG GEHEIM!“ und landet in der Spielhalle.
* Neu: Ab und zu fliegt eine Biene durchs Bild, bleibt kurz stehen und lädt zum Spielen ein. Antippen führt zur Spielhalle.
* Einstellungen unter Werkzeuge → Arcade-Rangliste: Knopf und Biene einzeln an/aus, Adresse der Spielhalle (Standard /spielhalle/), Knopf links oder rechts, Seiten ohne Knopf und Biene (z. B. /kontakt/).
* Auf der Spielhallen-Seite und auf der 404 erscheinen Knopf und Biene nicht. Keine Cookies, nichts wird gespeichert.

= 2.23.4 – 26.11.2026 =
* Bienen-Blitz: Am Spielende steht über der umgekippten Biene jetzt abwechselnd „DU HAST VERLOREN! (peinlich)“, „Manchmal muss man loslassen, um festzuhalten, was wirklich zählt.“ oder ein Goethe-Zitat.
* Bienenboom: Wer sich selbst wegsprengt, bekommt jetzt abwechselnd „Gut gemacht!“, „Selbstkill!“ oder „Peinlich!“.

= 2.23.3 – 26.11.2026 =
* Sprüche in allen Spielen: Lange Sprüche ragen auf dem Handy nicht mehr über den Rand. Sie werden umgebrochen und bei Bedarf etwas kleiner, und längere Sprüche bleiben länger stehen.
* Der letzte Spruch vor dem Spielende steht jetzt auch im Endbildschirm, damit man ihn in Ruhe lesen kann.

= 2.23.2 – 26.11.2026 =
* Spielhalle: Beim Antippen eines Spiels springt die Seite jetzt genau zum Spielfeld, direkt unter die Kopfleiste der Website. Vorher landete der Sprung vor allem auf dem Handy manchmal zu hoch oder zu tief, weil die Spielauswahl erst nach dem Scrollen zuklappte und die Kopfleiste fest mit 120 Pixeln angenommen war.

= 2.23.1 – 26.11.2026 =
* Wimmelpott: Auch ein Tipp ins Leere kostet jetzt 3 Sekunden, dazu kommt ein Spruch wie „Tomaten auf den Augen?“ oder „Kalt, ganz kalt!“. Die Bilder unten sehen jetzt genauso aus wie im Gewimmel (vorher war z. B. der Ballon unten gespiegelt).
* Bienen-Blitz: Wer den roten Knopf drückt, sieht jetzt ein eigenes Bild mit einer riesigen Pilzwolke über dem Ruhrpott. Der Honigtropfen fällt schneller. Neue Aufgabe „WESPEN HAUEN!“: Aus den Waben schauen Wespen und Bienen, nur die Wespen hauen.
* Haldenduell: In Runde 1 und 2 zielen die Wespen ungenauer, ab Runde 3 wie bisher.
* Honigdieb auf dem Handy: Auch rechts nach unten wischen duckt die Biene. Man kann mit zwei Fingern gleichzeitig spielen (links ducken, rechts springen).

= 2.23.0 – 26.11.2026 =
* Neue Texte in allen 18 Spielen: neue Titel in den Ranglisten und viele neue Sprüche im Spiel.
* Vier Spiele haben neue Namen: Wabenwacht heißt jetzt Wespen-Invasion, Pollenpfad heißt Pollenrausch, Honigknaller heißt Bienenboom und Wurfduell heißt Haldenduell. Die Ranglisten bleiben erhalten.
* Neue Sprüche bei Game Over: Revierflug (z. B. „Mayday!“), Bienentanz (z. B. „Der DJ hat Feierabend.“), A40-Flitzer (z. B. „Unfall auf der A40!“), Wespen-Invasion („Sie sind gelandet!“), Pollenrausch („Mampf-Pause!“), Hummelhopser je nach Ursache (Auto, S-Bahn, Emscher, Wespe).
* Bienenstich spricht jetzt Gamer-Sprache („Friendly Fire!“, „Headshot!“, „Killstreak“), Bienen-Solitär Büro-Sprache („Der Chef kommt!“).
* Bienenboom und Haldenduell: neue Gegner-Namen (Uschi, Waldo, Wayne, Super Siggi, Ilse, Gisela, Horst).

= 2.22.2 – 19.11.2026 =
* Bienen-Blitz: Die Bombenuhr beim Kabelschneiden zählt jetzt echt herunter, mit Zehntelsekunden und Ticken. Anfangs hast du 5 Sekunden, mit jeder Stufe weniger, bis nur noch 3 Sekunden bleiben. Wer nicht schneidet, dem fliegt die Bombe um die Ohren.

= 2.22.1 – 19.11.2026 =
* Bienen-Blitz: Wer etwas antippen soll (Wespe, Blumen, Kabel, Biene finden, Antwort beim Zählen), muss es auch treffen. Danebentippen kostet ein Leben.

= 2.22.0 – 19.11.2026 =
* Neues Spiel: Wimmelpott. Ein Wimmelbild aus dem Ruhrpott (Kirmes, Wiese, Zeche), jede Runde neu zusammengewürfelt. Finde die drei gesuchten Dinge im Gewimmel, zum Beispiel „Biene mit Sonnenbrille“, „Blauer Ballon“ oder „Pommes Schranke“, bevor die Zeit abläuft. Falsch tippen kostet 3 Sekunden, ein Tipp kostet 5. Mit jedem Level wird es voller.
* Bienen-Blitz: Die Aufgabe steht nur noch ganz kurz am Anfang da, beim Spielen musst du sie dir merken. Fallen wie „SCHNEIDE KEIN KABEL!“ kommen jetzt seltener und nie zweimal hintereinander.

= 2.21.1 – 19.11.2026 =
* Bienen-Blitz: Wer den roten Knopf drückt, löst jetzt eine riesige Explosion mit Pilzwolke aus. KABOOOM!
* Bienen-Blitz: Zwischen den Aufgaben tanzt kurz eine Biene, darunter siehst du, wie viele Leben du noch hast. Sind alle weg, fällt die Biene auf den Rücken, mit Kreuzaugen und einem verlegenen „Oh nein!“.
* Bienen-Blitz: Gemeine Fallen! Ab und zu kommt die Aufgabe umgedreht, zum Beispiel „SCHNEIDE KEIN KABEL!“, „NICHT PUMPEN!“ oder sogar „JETZT DRÜCKEN!“ beim roten Knopf. Genau lesen lohnt sich.

= 2.21.0 – 19.11.2026 =
* Neues Spiel: Bienen-Blitz. 10 Mini-Aufgaben von wenigen Sekunden, bunt gemischt: den roten Knopf NICHT drücken, Wespe erwischen, Honig auffangen, Blumen antippen, Honig pumpen, das richtige Kabel schneiden, Kohlebrocken ausweichen, Bienen zählen, die Biene zwischen Wespen finden und im gelben Feld stoppen. Alle 5 geschafften Aufgaben wird es schneller. Drei Fehler und es ist vorbei.

= 2.20.2 – 19.11.2026 =
* A40-Flitzer: Wer am Rand weiter lenkt, schrammt an der Leitplanke entlang. Funken, „NICHT DER LACK!“ und ein Kratzer. Beim dritten Kratzer ist Schluss.
* Website-Abriss: Die alten Homepages mischen bei jeder Seite neue Web-Sünden von früher. Zum Beispiel „Seite ausdrucken“, „Bitte Lautsprecher einschalten“, „Optimiert für Internet Explorer 5“, „Under Construction“ oder „Download (12 MB)“.

= 2.20.1 – 19.11.2026 =
* Honigknaller und Wurfduell: Die Namen der Gegner sind jetzt immer zufällig, Waldo und Wayne kommen aber deutlich öfter vor. Neu dabei: Wayne.
* Pollenpfad: Der Starttext passt jetzt zu den vier Wespen von Anfang an.

= 2.20.0 – 19.11.2026 =
* Pollenpfad: Schon in Level 1 sind 4 Wespen unterwegs, ab Level 2 alle 5.
* Bienen-Solitär: Das Spiel rechnet im Hintergrund nach, ob ein Sieg noch möglich ist. Wenn nicht, erscheint „Kein Gewinn mehr möglich!“ mit „Zug zurück“ und „Runde beenden“. Wer will, tippt daneben und spielt trotzdem weiter.
* Honigknaller allein: Die Wespen starten in den drei anderen Ecken. Alle Bomben treffen jetzt auch Wespen, auch die eigenen der Wespen (dafür gibt es keine Punkte). Wachsblöcke fangen die Explosion ab, dahinter brennt nichts mehr. Wer stirbt, verliert alle Extras. Alle 5 Level gibt es ein Extra-Leben, höchstens 3. Wespen klauen auch Extras.
* Honigflipper: Ein Tor oben an der Abschussbahn lässt die Kugel nicht mehr zurückrollen. Neu ist die Honigsaft-Anzeige: Jeder Flipperschlag kostet Saft, Treffer füllen ihn auf. Ist er leer, bewegen sich die Flipper nicht mehr. Dazu gibt es oben links eine kleine Kugel für 250 Punkte.
* Wurfduell: Rechtsklick während des Ziehens bricht den Wurf ab (auf dem Handy: zurück zum Startpunkt ziehen). Die Wabenmauer setzt man jetzt einfach mit einem Klick auf die Seite, auf der sie stehen soll.

= 2.19.4 – 19.11.2026 =
* Honigdieb auf dem Handy: neue Steuerung ohne Wischen. Linke Bildschirmhälfte halten duckt die Biene (im Sprung geht es schnell nach unten), rechte Hälfte tippen springt. Unten zeigen zwei Markierungen, welche Seite was macht. Vorher hat Runterwischen oft erst einen Sprung ausgelöst.
* Wabenwacht: Wespen, die bis zu den Honigwaben herunterkommen, fliegen nicht mehr einfach hindurch. Sie fressen die Deckung weg, wo sie sie berühren.
* Honigknaller: Ein Bot-Name wurde aus der Namensliste genommen.

= 2.19.3 – 19.11.2026 =
* Handy: Die Spielauswahl ist kein Karussell mehr. Alle Spiele stehen als kleines Raster mit drei Kacheln pro Reihe da. Nach der Wahl klappt das Raster auf eine Zeile zusammen („Alle 16 Spiele“), ein Tipp klappt es wieder auf.
* Honigknaller: Die Bots haben jetzt echte Namen wie Ilse, Uschi, Waldo oder Super Siggi. Im Wurfduell gibt es neue Gegner wie Wespe Ilse, Wespe Waldo und Hornisse Super Siggi.
* Honigdieb: Die Straßenlaternen werfen jetzt einen weichen Lichtkegel nach unten mit Lichtfleck auf der Straße, statt eines kantigen Lichtkastens.
* Wurfduell: Figuren rutschen nicht mehr durch die Wabenmauer oder steile Wände, wenn eine Explosion sie dagegen schleudert. Sie prallen jetzt ab.

= 2.19.2 – 19.11.2026 =
* Rangliste: Klappt das Eintragen beim Spielstart nicht sofort, versucht es das Spiel während der Runde noch einmal. Geht es gar nicht, steht im Endbildschirm der Grund, statt dass das Namensfeld einfach fehlt.
* Wurfduell: Die Wespen werfen jetzt auch Pollenbomben, vor allem wenn ein Hügel im Weg ist. Pollenbomben gibt es nur noch 2 pro Runde (für beide Seiten), den Honigtopf unbegrenzt. Der Knopf unten rechts zeigt, wie viele noch übrig sind.
* Wurfduell: Neue Waffe Wabenmauer. Sie setzt eine Deckung aus Wachs vor deine Figur, die etwa drei Volltreffer aushält. Bauen kostet den ganzen Zug, und eine neue Mauer gibt es erst, wenn die alte kaputt ist. Angeschlagene Wespen bauen sich auch eine.
* Wurfduell: Explosionen schubsen die Figuren nicht mehr so weit weg, man fällt seltener ins Wasser.

= 2.19.1 – 19.11.2026 =
* „Spiel starten“ steht jetzt immer direkt unter dem Spieltext, die Anleitung darunter. Auf Tablet und Handy muss man den Knopf nicht mehr im Kasten suchen.
* Der Chat-Knopf „Kann ich dir helfen?“ verschwindet, solange das Spiel im Bild ist, und verdeckt nichts mehr.

= 2.19.0 – 19.11.2026 =
* Neues Spiel: Wurfduell. Biene gegen Wespe auf den Halden im Ruhrgebiet: abwechselnd Honigtöpfe werfen, den Wind beachten und das Gelände wegsprengen. Wer ins Wasser fällt, geht baden. Allein gegen immer stärkere Wespen und Hornissen (mit Rangliste) oder zu zweit an einem Gerät. Zielen wie mit einer Schleuder: zurückziehen und loslassen. Zweites Wurfgeschoss: die hüpfende Pollenbombe.

= 2.18.1 – 05.11.2026 =
* Honigknaller allein: Schon ab Level 1 legen Wespen und Hornissen selbst Bomben, wenn die Biene in der Nähe ist. Hornissen öfter als Wespen. Ihre eigenen Bomben tun ihnen nichts, dir aber schon.

= 2.18.0 – 05.11.2026 =
* Honigknaller: Neue Spielarten „Gegen 3 Bots“ (auch auf dem Handy) und „Zu zweit + 2 Bots“. Die Bots legen selbst Bomben, sammeln Extras und jagen dich. Wird ein Duell zu lang, gibt es einen Endspurt mit mehr Wumms für alle.
* Honigknaller: Bomben explodieren am Anfang nur 1 Feld weit, mehr gibt es über die Extras. Hornissen legen ab Level 3 selbst Bomben.
* Honigknaller: Die Biene schaut jetzt auch nach oben und unten in Laufrichtung. Auf dem Handy gibt es statt Pfeilen einen Joystick: Daumen unten links auflegen und ziehen.
* Honigflipper: Die Rettung gibt es nur noch einmal pro Kugel und nur 4 Sekunden lang, Spielende ist also wieder möglich. Neu: Abflüsse links und rechts mit Rettungslampe, eine fliegende Wespe als Ziel, ein Drehtor, Multiball nach drei Treffern im Honigtopf (alles doppelt) und ein Bonus am Ende jeder Kugel.
* Honigdieb: Auf dem Handy ist das Bild etwas weiter herausgezoomt, die Biene läuft weiter links und der Kammerjäger ist näher dran. So sieht man die Hindernisse viel früher.

= 2.17.0 – 05.11.2026 =
* Neues Spiel: Honigflipper. Ein eigener Bienenstock-Flippertisch mit drei Honigtopf-Bumpern, den BIENE-Zielen, drei Bahnen oben und dem Honigtopf zum Versenken. Wer alle BIENE-Ziele oder alle drei Bahnen trifft, bekommt einen höheren Multiplikator (bis ×5). Drei Kugeln, am Anfang jeder Kugel gibt es ein paar Sekunden Rettung. Am PC A/D oder Pfeiltasten, Abschuss mit der Leertaste. Auf dem Handy linke und rechte Hälfte tippen.
* Das Plugin heißt im Backend jetzt „MediaBees Spielhalle“, die Beschreibung ist kürzer.

= 2.16.0 – 05.11.2026 =
* Neues Spiel: Honigknaller. Mit Honigbomben Wachsblöcke sprengen und Wespen erwischen, Level für Level. Extras für mehr Bomben, mehr Reichweite und mehr Tempo. Am PC auch zu zweit an einer Tastatur (Biene gegen Hummel, ohne Rangliste). Auf dem Handy mit Steuerkreuz und Bombenknopf.

= 2.15.0 – 05.11.2026 =
* Neues Spiel: Honigdieb. Die Biene flieht mit einem stibitzten Honigglas vor dem Kammerjäger durchs nächtliche Ruhrgebiet. Über Mülltonnen, Zäune und Gullys springen, unter Spinnweben und Bannern durchducken, Honigtropfen sammeln. Wer stolpert, lässt den Kammerjäger aufholen.

= 2.14.0 – 05.11.2026 =
* Neues Spiel: Hummelhopser. Die Hummel hüpft über Straßen, S-Bahn-Gleise und die Emscher, so weit sie kommt. In der Emscher nur auf Baumstämmen und Kohlekähnen stehen, Honiggläser bringen Bonus. Wer trödelt, wird von der Wespe geschnappt. Auf dem Handy tippen und wischen, am PC WASD oder Pfeiltasten.

= 2.13.1 – 05.11.2026 =
* Bienen-Solitär: Jede Ablage oben gehört jetzt fest zu ihrer Farbe. Käfer landen nur noch auf dem Käfer-Platz, Blumen nur auf dem Blumen-Platz.

= 2.13.0 – 05.11.2026 =
* Pollenpfad: Drei verschiedene Labyrinthe (Wiese, Zeche, Kanal) mit eigener Farbe. Level 1 startet mit 2 Wespen, jedes Level kommt eine dazu, ab Level 4 sind es fünf.
* Wabenbau: Steuerung mit WASD. W dreht, S lässt das Teil sofort fallen, A und D schieben. Beim ersten Stein zeigt ein Hinweis Schritt für Schritt die Steuerung.
* Bienen-Solitär: Nur noch zwei rote und zwei schwarze Farben. Läuft deutlich flüssiger. Der Knopf „Zug zurück“ ist jetzt gut sichtbar. Geht nichts mehr, blinkt „Keine Züge mehr!“ mit „Zug zurück“ und „Runde beenden“.
* Mehr Titel in allen Spielen: jetzt 8 Stufen statt 4, damit nicht alle den gleichen Titel bekommen.

= 2.12.0 – 05.11.2026 =
* Neues Spiel: Bienen-Solitär. Patience mit eigenen Karten (Blume, Wabe, Käfer, Klee, Königin, Hummel und Arbeitsbiene). Karte antippen und sie springt an den besten Platz, Ziehen geht auch. Mit Zurück-Knopf, automatischem Abschluss und springenden Karten beim Sieg.

= 2.11.0 – 05.11.2026 =
* Neues Spiel: Wabenbau. Teile aus Sechseck-Waben fallen in den Stock, volle Wabenreihen verschwinden. Bis zu vier Reihen auf einmal, mit Level, die immer schneller werden. Auf dem Handy wischen und tippen.
* Mehr Action in allen Spielen: Bei großen Momenten leuchtet der Bildschirm auf, wackelt und es gibt Druckwellen und Glitzer. Zum Beispiel Goldkäfer, Goldwespen, neue Städte, Goldblumen, Kombos, zerlegte Seiten, große aufgedeckte Felder und geschaffte Wellen.
* Bei „weniger Bewegung“ wackelt nichts und das Aufleuchten ist gedämpft.

= 2.10.2 – 05.11.2026 =
* Pollenpfad mit viel mehr Action: Honigglas lässt den Bildschirm golden aufleuchten und wackeln, mit Druckwelle und „HONIG-RAUSCH!“. Die Wespen zucken erschrocken zusammen, der Rand glüht, solange der Rausch läuft, und die Biene zieht eine Glitzerspur.
* Die Bonus-Blume erscheint mit Lichtring und Strahlen, beim Fressen blitzt es rosa.
* Wespen fangen mit kurzem Freeze-Moment und Druckwelle, jede weitere Wespe knallt stärker.
* Pollen-Serien lassen den Ton ansteigen, Level-Ende mit Konfetti. Bei „weniger Bewegung“ bleiben Wackeln und Zoom aus.

= 2.10.1 – 05.11.2026 =
* Pollenpfad: Die Biene schaut jetzt immer ganz in Flugrichtung, auch nach oben und unten, und ihr Mund geht beim Fliegen auf und zu.
* Pollenpfad: Statt Gelée royale gibt es jetzt Honiggläser, mit denen man die Wespen jagen kann.

= 2.10.0 – 05.11.2026 =
* Neues Spiel: Pollenpfad. Die Biene sammelt alle Pollen im Waben-Labyrinth, vier Wespen jagen sie. Mit Gelée royale dreht sich der Spieß um und man kann die Wespen kurz fangen. Dazu Bonus-Blumen, 3 Leben und Level, die immer schneller werden. Auf dem Handy per Wischen.

= 2.9.1 – 29.10.2026 =
* Handy: Namensfeld und „Eintragen“-Knopf stehen jetzt untereinander und sind groß genug. Solange man sich einträgt, treten Statistik und Top 3 zurück.
* Handy: „Ranglisten aller Spiele“ passt jetzt auch auf schmale Bildschirme.
* Fair wie am PC: Während einer Runde zählt nur noch ein Finger, Tippen mit mehreren Fingern gleichzeitig bringt nichts mehr.
* Wabenwacht: Auf dem Handy nur noch zwei Wabenwände, damit genug Platz zum Schießen bleibt.
* Sicherheit: Updates werden nur noch aus dem fertigen Release-ZIP installiert. Jede Runde kann garantiert nur einmal eingetragen werden, auch bei gleichzeitigen Anfragen. Strengere Prüfung der Eingaben und faire Limits auch für IPv6-Anschlüsse.

= 2.9.0 – 29.10.2026 =
* Neues Spiel: Wabenwacht. Die Biene verteidigt den Stock mit Stacheln gegen anrückende Wespen und Hornissen, hinter Honigwaben gibt es Deckung. Mit Goldwespe als Bonus und Doppelstachel.
* Handy: Die Spielauswahl zeigt zwei Spiele nebeneinander. Mit Wischen oder den Pfeilen geht es zu den anderen, Punkte darunter zeigen, wo man ist.
* Ranglisten zeigen jetzt unter jedem Namen den erreichten Titel, zum Beispiel „Blechschaden“.
* Neuer Knopf „Ranglisten aller Spiele“: eine Übersicht mit den besten Plätzen jedes Spiels.

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

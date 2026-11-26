#!/bin/sh
# Baut die Spielhalle aus src/ ins Plugin und erzeugt das Upload-ZIP in dist/.
#   src/core.js + src/tiles/*.js  ->  plugin/mediabees-bugjagd/assets/arcade.js
#   src/games/*.js                ->  plugin/mediabees-bugjagd/assets/games/
#   src/boom/*.js                 ->  plugin/mediabees-bugjagd/assets/games/boom.js (zusammengefügt)
#   src/teaser.js                 ->  plugin/mediabees-bugjagd/assets/teaser.js (Knopf + Biene auf allen Seiten)
set -e
cd "$(dirname "$0")"
OUT=plugin/mediabees-bugjagd/assets
mkdir -p "$OUT/games" dist
cat src/core.js src/tiles/*.js > "$OUT/arcade.js"
rm -f "$OUT/games/"*.js
cp src/games/*.js "$OUT/games/"
cp src/teaser.js "$OUT/teaser.js"
cat src/boom/*.js > "$OUT/games/boom.js"   # BOOM 2026 besteht aus mehreren Teilen
cp src/admin.js "$OUT/admin.js"
for f in "$OUT/arcade.js" "$OUT/teaser.js" "$OUT/admin.js" "$OUT/games/"*.js; do node -e "new Function(require('fs').readFileSync('$f','utf8'))"; done
VER=$(grep -m1 "define( 'MBBJ_VERSION'" plugin/mediabees-bugjagd/mediabees-bugjagd.php | sed "s/.*'\([0-9.]*\)'.*/\1/")
rm -f "dist/mediabees-arcade-$VER.zip"
(cd plugin && zip -qr -9 "../dist/mediabees-arcade-$VER.zip" mediabees-bugjagd)
echo "Fertig: dist/mediabees-arcade-$VER.zip"

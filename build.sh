#!/bin/sh
# Baut die Spielhalle aus src/ ins Plugin und erzeugt das Upload-ZIP in dist/.
#   src/core.js + src/tiles/*.js  ->  plugin/mediabees-bugjagd/assets/arcade.js
#   src/games/*.js                ->  plugin/mediabees-bugjagd/assets/games/
set -e
cd "$(dirname "$0")"
OUT=plugin/mediabees-bugjagd/assets
mkdir -p "$OUT/games" dist
cat src/core.js src/tiles/*.js > "$OUT/arcade.js"
rm -f "$OUT/games/"*.js
cp src/games/*.js "$OUT/games/"
for f in "$OUT/arcade.js" "$OUT/games/"*.js; do node -e "new Function(require('fs').readFileSync('$f','utf8'))"; done
VER=$(grep -m1 "define( 'MBBJ_VERSION'" plugin/mediabees-bugjagd/mediabees-bugjagd.php | sed "s/.*'\([0-9.]*\)'.*/\1/")
rm -f "dist/mediabees-arcade-$VER.zip"
(cd plugin && zip -qr -9 "../dist/mediabees-arcade-$VER.zip" mediabees-bugjagd)
echo "Fertig: dist/mediabees-arcade-$VER.zip"

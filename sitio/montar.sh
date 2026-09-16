#!/bin/sh
# Monta el sitio en una carpeta a partir de los subproyectos.
#
#   sh sitio/montar.sh [DESTINO] [MODO]     DESTINO: _site (defecto)
#                                          MODO: dev (defecto) | publico
#
# Lo usa el flujo de GitHub Actions (.github/workflows/publicar.yml), que
# monta la rama `publico` en la raíz y `master` en dev/; y sirve igual en
# local:  sh sitio/montar.sh && python -m http.server -d _site
#
#   DESTINO/
#     index.html   portada (sitio/index.html)
#     app/         ejercicios (app/public/), con app/modo.js según MODO
#     apuntes/     apuntes renderizados (apuntes/build/sitio/, cuando exista)
set -e
DEST=${1:-_site}; MODO=${2:-dev}
case "$MODO" in dev|publico) ;; *) echo "MODO debe ser dev o publico" >&2; exit 1;; esac
mkdir -p "$DEST"; DEST=$(cd "$DEST" && pwd)          # absoluta, antes del cd
cd "$(dirname "$0")/.."

rm -rf "$DEST"
mkdir -p "$DEST"
cp sitio/index.html sitio/qr-armonia.svg "$DEST/"
cp -r app/public "$DEST/app"
if [ -d apuntes/build/sitio ]; then
  cp -r apuntes/build/sitio "$DEST/apuntes"
fi
# Modo de la app: el repo lleva 'dev'; la versión pública lo sobrescribe.
printf "window.ARMONIA_MODO = '%s';\n" "$MODO" > "$DEST/app/modo.js"
# La copia de desarrollo no se indexa.
if [ "$MODO" = dev ]; then
  find "$DEST" -name '*.html' -exec sed -i 's#<head>#<head>\n<meta name="robots" content="noindex">#' {} +
fi
# Sin Jekyll: que Pages sirva los ficheros tal cual.
touch "$DEST/.nojekyll"
echo "$DEST montado en modo $MODO:"
find "$DEST" -maxdepth 2 -type d

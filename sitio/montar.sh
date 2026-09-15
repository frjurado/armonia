#!/bin/sh
# Monta el sitio publicado en _site/ a partir de los subproyectos.
# Lo usa el flujo de GitHub Actions (.github/workflows/publicar.yml) y
# sirve igual en local:  sh sitio/montar.sh && python -m http.server -d _site
#
#   _site/
#     index.html   portada (sitio/index.html)
#     app/         ejercicios (app/public/)
#     apuntes/     apuntes renderizados (apuntes/build/sitio/, cuando exista)
set -e
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site
cp sitio/index.html sitio/qr-armonia.svg _site/
cp -r app/public _site/app
if [ -d apuntes/build/sitio ]; then
  cp -r apuntes/build/sitio _site/apuntes
fi
# Sin Jekyll: que Pages sirva los ficheros tal cual.
touch _site/.nojekyll
echo "_site/ montado:"
find _site -maxdepth 2 -type d

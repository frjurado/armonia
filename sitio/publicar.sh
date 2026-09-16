#!/bin/sh
# Suelta a los alumnos lo que hay en master: fusiona master en la rama
# `publico` y la sube. GitHub Actions monta entonces la raíz del sitio
# desde `publico` (y dev/ desde master, como siempre).
#
#   sh sitio/publicar.sh
#
# Requiere el árbol limpio y estar en master con todo subido.
set -e
cd "$(dirname "$0")/.."
[ -z "$(git status --porcelain)" ] || { echo "Hay cambios sin confirmar; confirma o guarda antes." >&2; exit 1; }
rama=$(git rev-parse --abbrev-ref HEAD)
[ "$rama" = master ] || { echo "Ejecutar desde master (estás en $rama)." >&2; exit 1; }
git push -q origin master
git checkout -q publico
git merge --no-edit master
git push -q origin publico
git checkout -q master
echo "publico = master ($(git rev-parse --short master)). Pages lo publica en uno o dos minutos:"
echo "  https://frjurado.github.io/armonia/"

# vendor/ — bibliotecas de terceros empaquetadas

Copias literales, sin modificar, para no depender de un CDN en el aula.
Actualizar a mano: descargar el fichero nuevo, sustituir, anotar la versión.

| Biblioteca | Versión | Origen | Licencia |
|---|---|---|---|
| `verovio/verovio-toolkit-wasm.js` | 6.3.0 | `https://cdn.jsdelivr.net/npm/verovio@6.3.0/dist/verovio-toolkit-wasm.js` | LGPL-3.0 |
| `soundfont-player/soundfont-player.min.js` | 0.12.0 | `https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js` | MIT |

Verovio pesa 7,3 MB (el WASM va incrustado en el `.js`); el navegador lo
cachea tras la primera visita. Los **samples de piano** de soundfont-player
no están aquí: se descargan de `gleitz.github.io/midi-js-soundfonts` al
primer «Escuchar». Empaquetarlos es el paso que falta para el uso offline.

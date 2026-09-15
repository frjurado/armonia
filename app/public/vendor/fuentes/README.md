# fuentes/ — alteraciones en el texto

`leland-alteraciones.woff2` (4,6 KB) es un **subconjunto de Leland Text**
(MuseScore, OFL 1.1 — `OFL-Leland.txt`) con solo cinco glifos, mapeados a
sus puntos Unicode: ♭ U+266D · ♮ U+266E · ♯ U+266F · 𝄪 U+1D12A · 𝄫 U+1D12B.
Leland Text los tiene únicamente en el área privada SMuFL (U+E260–E264);
el subconjunto los remapea, porque Source Serif 4 y Source Sans 3 no
incluyen esos caracteres y sin esto caen a la fuente de símbolos del
sistema, distinta en cada dispositivo.

Se declara con `@font-face` y `unicode-range` limitado a esos cinco
códigos, antepuesta a las pilas `--serif` y `--sans`: el navegador solo la
usa para ellos y el resto del texto no cambia. Va con `size-adjust: 112%`
porque los glifos de Leland Text son pequeños para el cuerpo del texto.

Es la misma familia que usa Verovio para las partituras (`font: 'Leland'`
en `ejercicios/comun.js`), para que alteraciones en texto y en pentagrama
sean del mismo diseño. Si se cambia una, cambiar la otra (Verovio también
trae Bravura, y el subconjunto se rehace igual a partir de Bravura Text).

Regenerar (fontTools): abrir `LelandText.otf`, crear una tabla cmap
formato 12 con el mapa Unicode → glifo SMuFL, subconjuntar a esos códigos
y guardar como woff2.

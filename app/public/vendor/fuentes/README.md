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
usa para ellos y el resto del texto no cambia.

Los contornos **no son los originales tal cual**: Leland Text los dibuja
pequeños y alzados, pensados para cifrados («B♭»), y en texto corrido
parecían superíndices. `regenerar.py` los reescala ×1,4 y los apoya en la
línea base (♯ ♮ ♭ 𝄫 de ≈ −30 a ≈ 700 unidades, la altura de las
mayúsculas de las Source; 𝄪 centrado a media altura de x) con 18 unidades
de margen a cada lado.

Es la misma familia que usa Verovio para las partituras (`font: 'Leland'`
en `ejercicios/comun.js`), para que alteraciones en texto y en pentagrama
sean del mismo diseño. Si se cambia una, cambiar la otra (Verovio también
trae Bravura, y el subconjunto se rehace igual a partir de Bravura Text).

Regenerar: `pip install fonttools brotli`, descargar `LelandText.otf`
del repositorio de Leland y ejecutar `python regenerar.py LelandText.otf`.
Para Bravura Text valdría el mismo script cambiando escala y desplazamientos
(sus glifos ya vienen a tamaño de texto y mapeados a Unicode).

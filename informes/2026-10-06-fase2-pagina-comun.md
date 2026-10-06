# Fase 2: la página común de ejercicio

*6 de octubre de 2026. Segunda fase del plan de
[la revisión tras el uso en clase](2026-10-05-revision-tras-clase.md). Commits `577e90a`
(capa común y 4.º) y el siguiente (3.º UD 0).*

## Qué se ha hecho

Todo lo publicado en la app pasa a una **página común** (`ArmoniaEj.ejercicio` en
`comun.js`, `app/docs/Modelo-ejercicios.md` §2): Bajo cifrado, Cadencias (3), Prolongación
(3), Intervalos (3) y Acordes (3). Cada página aporta su marcado y cómo se generan su
partitura, su respuesta y su audio; nivel, revelado y audio son comunes. Armaduras no la
usa (son series en tira, con su propio flujo) pero toma la pregunta visible.

Lo que ve el alumno:

- **La pregunta, encima de la partitura** y siempre visible.
- **El nivel**, con un selector en la cabecera (se elige antes de empezar y se puede
  bajar) y una línea bajo la partitura que dice qué incluye. Desaparece «Más difícil»;
  «Similar» pasa a llamarse **«Otro»** y está siempre visible.
- **Revelar no mueve nada**: ni la tarjeta, ni la partitura, ni el panel, ni los botones.
- En Acordes, **fuera el sentido *construir***: siempre se ve el acorde y se nombra.
- En las variantes *Con grados*, la tonalidad pasa a la partitura como dato, como en 4.º.

## Decisiones tomadas al implementar

- **Revelado por máscara.** La partitura se dibuja completa una sola vez; lo que es
  respuesta lleva `@type="resp"` en el MEI, que Verovio vuelca como clase al SVG
  (comprobado en capas, notas, acordes, `<harm>` y `<reh>`, también con varias clases), y
  el CSS lo oculta hasta revelar. Lo que solo es pregunta lleva `preg` (las cifras solas
  de Bajo cifrado, que al revelar ceden el sitio al romano con cifras, superpuestas en el
  mismo lugar). Se oculta con `visibility`, no con `display`, para que las medidas tras el
  render (cifras apiladas, círculos, corchetes) sigan funcionando.
- **Líneas adicionales.** Verovio las dibuja por pentagrama, fuera de la nota: ocultar una
  nota dejaba las suyas a la vista. Una función común marca, tras cada render, las que
  solo necesitan notas ocultas.
- **Los textos de los niveles, solo en `curriculum-data.js`.** Se quitaron de los cores;
  la página los busca por su nombre de fichero.
- **`?nivel=N`** en la URL, adelantado de la fase 3 porque costaba muy poco: fija el nivel
  inicial y el selector lo reescribe, así que recargar lo conserva.
- **La pregunta se estila por su posición** (primer elemento de la columna), no por la
  máscara, para que valga también en Armaduras.

## Cómo se ha validado

- **En Chrome** (sin interfaz, por el protocolo de depuración, con un script desechable):
  todas las páginas, varios niveles, escritorio y móvil; medidas antes y después de
  revelar (nada se mueve), recuento de lo visible y lo oculto, capturas, y sin errores de
  JavaScript. Las páginas sin migrar siguen funcionando.
- **Validaciones masivas** (`tests/masivo-*.js`): 0 fallos, 0 infracciones; y ahora
  también renderizan con máscara y comprueban que no se pierde ninguna nota y que todo lo
  que es respuesta lleva `resp`.

## Corregido de paso

- En el titular de Bajo cifrado, las cifras salían bajas y separadas del romano («II ₆»):
  el titular es flex, que ignora `vertical-align` y mete su `gap` entre romano y cifra.
- En *Intervalos con grados*, en el unísono el grado de arriba se colocaba como el de
  abajo y caía dentro del pentagrama.

## Queda

- Las familias ocultas de 3.º UD 1 (Intervalos, Movimiento armónico), al rediseñarlas.
- Observado sin resolver: en las capturas, el ♯ y el ♭ del cifrado americano salen con
  otra fuente y color; viene de antes. Comprobar en la pizarra.
- Siguiente: fase 3 (un solo esquema en `curriculum-data.js`, menú en filas, renombrado
  por material, `?oir`, enlaces cruzados).

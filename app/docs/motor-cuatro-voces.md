# Motor a cuatro voces (`ejercicios/cuatro-voces-core.js`)

> Procede de `Generador-ejercicios.md` §5.3 (dividido el 2026-10-05). Motor compartido por todas las familias a cuatro voces; las normas y preferencias que aplica están en `../../curriculum/Minimos-conduccion.md`.

⟶ DECIDIDO: las realizaciones **no se escriben a mano** (ni siquiera «una o dos
disposiciones por acorde»): se **buscan** bajo las normas de `Minimos-conduccion.md` y se
eligen por sus preferencias. Es el motor de todo 4.º (Cadencias, Bajo dado, Canto dado,
y después 7.ª diatónicas, modulación…), análogo a `contrapunto-core.js` para 3.º. Sin DOM,
cargable en Node. Tres partes:

**Modelo de acorde.** Un acorde es `{grado, inversión, tonos, duplicación, tendencias}`:
los tonos como grados de la escala con alteración (la sensible en menor), el bajo como uno
de ellos, la duplicación según la tabla §4 de los mínimos, y las tendencias como pares
«este tono debe ir a aquel grado en el acorde siguiente» (N7, N8, N9). Se construye desde
la tonalidad con los auxiliares de deletreo que ya usan las otras familias (letra +
alteración, armadura, escala por letras): las alturas **nunca son MIDI** salvo para el audio.

**Realizador.** Entrada: tonalidad, secuencia de acordes, tesituras, y opcionalmente una voz
fijada (la soprano en Canto dado; el bajo lo fija siempre el acorde). Por acorde se
**enumeran** las disposiciones candidatas: octava del bajo dentro de N1, y toda asignación
de soprano/contralto/tenor a tonos del acorde que cumpla N1–N3 y la duplicación (decenas
por acorde, no miles). Entre acordes consecutivos se **filtra** por N4–N13 y se **puntúa**
por P1–P9 más las cláusulas de `familias/cadencias.md` §4. Búsqueda en profundidad con **orden aleatorio
ponderado por puntuación** y reinicios: devuelve la primera solución completa que supera un
umbral, o la mejor de k. La aleatoriedad ponderada, no una lista fija, es lo que da variedad
sin perder idiomatismo. Semilla opcional para pruebas reproducibles.

**Comprobador independiente** (`ejercicios/cuatro-voces-check.js`). `comprobar(voces,
acordes, tonalidad)` devuelve la lista de infracciones `{regla:'N4', voces:[0,3], evento:2,
texto}`. Se escribe **aparte del realizador y sin compartir con él las funciones de
transición** (solo la aritmética de alturas), para que la validación masiva no sea
tautológica. Segundo uso previsto: la familia de **detección de faltas** de 3.º UD 1
(`familias/movimientos.md`, faltas) puede corromper una realización correcta y pedir la infracción; el identificador de
regla es la respuesta.

**Salida.** El motor devuelve alturas (`{abs, alter, letter, oct, midi, deg, rol}` por voz
y evento) y `token()` para el mini-LilyPond; el JSON de `Modelo-ejercicios.md` §5 —`voices[]` = cuatro cadenas
(soprano, contralto, tenor, bajo), `context.time` y `context.partial`, y anotaciones por
evento `{romano, cifras, americano}` y la cadencia— lo compone la familia. **MEI:** dos
pentagramas con dos capas cada uno; cifrado americano como `<harm place="above">`, romanos
con cifras como `<harm place="below">` con texto y `<fb>`.

⟶ HECHO (2026-09-19): `cuatro-voces-core.js` (global `CuatroVoces`: `acorde`,
`candidatos`, `realizar`, `escala`, `token`…), `cuatro-voces-check.js` (global
`CuatroVocesCheck`: `comprobar`) y `tonalidades.js`. Detalles que fija el código:
- **Modelo de acorde**: `acorde(key, {grado, inv, septima, dup?, cadencial64?, id?})`;
  las duplicaciones por defecto salen de la tabla §4 de los mínimos por (grado, inversión,
  calidad); la familia sobrescribe con `dup` (VI tras V: `{oblig:'3'}`; I final tras V7:
  `{omitir:'5'}`). Nombres: ⟶ DECIDIDO romanos **en mayúscula siempre y sin marca de
  calidad** (ni `°`): `II6`, `I6/4`, `V7`; la calidad la da la tonalidad. El cifrado
  americano sí la lleva, con barra en las inversiones (`Dm/F`, `F°/A`, `G7`).
- **Búsqueda**: `reinicios` 6 (cada uno, la primera solución de una búsqueda en
  profundidad con orden aleatorio ponderado por `exp(-beta·pen)`, `beta` 0,8, tope
  `maxNodos` 5000) y elección final por el mismo softmax entre las soluciones. `seed`
  para reproducir. Penalizaciones: duplicación (pref 0 / adm 1 / sin listar 2), P1 1,
  P2 3 (0,5 tenor–bajo), P3 1, P4 1 por voz, P5 0,5 por grado en cada interna, P6 2,
  P7 0,25·d·(d−1) por salto de d grados en la soprano (3.ª 0,5 · 5.ª 3) y 3 por segundo
  salto, P8 2, P9 1,5 (y 2 más si la soprano sigue en la dirección del salto), P10 0,4
  por acorde en zona extrema y 1 más a partir del tercero seguido, P11 2, P12 −4 (una
  bonificación: el salto de 8.ª descendente del bajo en I6/4 → V). Se revisan a la vista
  de lo generado, no a priori.
- **Ganchos**: `filtro(path, cand, k, acordes)` (norma propia de la familia: p. ej. la
  soprano de una CAP acaba en 1̂) y `puntuar(...)` (preferencia propia: las cláusulas de
  `familias/cadencias.md` §4). `fija: {voz, alturas}` fija una voz (Canto dado); «otros bajos posibles» es
  relanzar con la misma soprano sobre las otras fórmulas del tipo y quedarse con las que
  devuelven realización.
⟶ PENDIENTE: comprobar en Verovio 6.3 que un `<harm>` admite texto y `<fb>` a la vez;
si no, dos `<harm>` o cifras en Unicode (⁶₅).

# Disposición — diseño

> Decidido el 2026-10-09 (`../../../informes/2026-10-09-plan-ud1.md`). ⟶ HECHO (fase 5c,
> 2026-10-09): `disposicion-core.js` + `disposicion-dos-voces.html` y
> `disposicion-cuatro-voces.html`, sobre la página común; en el menú, familia
> *Disposición* de 3.º UD 1, con `publico:false` hasta revisarla. Lo común —faltas
> inyectadas, comprobador general— está en `../motor-contrapunto.md`.

Apuntes: c3u1 §2.1 *Coro mixto* (tesitura; distancias y disposición; cruces y unísonos).
Reglas: N1, N2, N3 (sin la superposición) y P2, que por eso entran en la UD 1
(`../../../curriculum/Minimos-conduccion.md` §6). Sin niveles.

**Terminología, la de los apuntes.** *Disposición*: cerrada, abierta o mixta, según la
distancia entre tenor y soprano (menos de una 8.ª, más, o exactamente una 8.ª). No es la
*posición*, que es la nota del acorde que lleva la soprano. (El informe del 2026-10-09
dice «posición» por error.)

## Cómo se genera (las dos consignas)

Se enumeran las colocaciones posibles —también un poco fuera de tesitura (hasta 3 pasos) o
cruzadas— y se elige una cuyas faltas, **según el comprobador independiente**, sean
exactamente las buscadas: ninguna, o una sola del tipo pedido. La respuesta es lo que dice
el comprobador. Entre las válidas se prefiere el **registro central** de cada voz (P10),
como en el motor de contrapunto. **Blancas**, no redondas: la plica dice qué voz es cuál
(la aguda de cada pentagrama, arriba; la grave, abajo), y sin ella un cruce no se ve.
Cada elemento, en su compás, separado por **barra doble** (dos líneas iguales): son sueltos,
sin conducción entre ellos.

**Rótulos de respuesta.** No van en el MEI como `<harm>`: Verovio ensancha el compás según
el texto, y eso desigualaba los compases y delataba dónde estaba la falta antes de revelar.
Los dibuja la página con `ArmoniaEj.rotulosBajo` (`comun.js`) después del render, sobre una
**línea base común** bajo el sistema, centrados en las notas de cada compás, con la clase
`resp` (ocultos hasta revelar). Letra: la serif del sitio en cursiva seminegrita
(600: se lee mejor de lejos, en la pizarra), a 1,9 veces la altura de una cabeza de nota; la
falta en el color de la respuesta (`.dis`), el aviso en gris y entre paréntesis (`.aviso`).

## Entre dos voces

- **5 sonoridades sueltas** (sin conducción entre ellas), de una pareja **soprano–contralto**
  (las dos en el pentagrama de Sol) o **contralto–tenor** (una en cada pentagrama); el
  nombre de la pareja, como dato sobre la partitura. T–B no tiene límite de 8.ª, así que no
  aporta.
- **Cada sonoridad**: bien (~45 %; 3.ª, 4.ª, 5.ª, 6.ª u 8.ª) o con **una** falta (~22 %):
  distancia de más de una 8.ª (N2; 10.ª a 13.ª) o cruce (N3; la aguda, una 3.ª a una 6.ª por
  debajo); o bien un **unísono** (P2, ~11 %), que no es falta sino aviso. Las notas, siempre
  en su tesitura.
- **Intervalos**: siempre consonantes o 4.ª justa (nada de 2.ª, 7.ª, aumentados o
  disminuidos, que distraen de lo que se pregunta), y **ninguno repetido** en el ejercicio
  (el cruzado cuenta aparte; el unísono, como mucho uno).
- **Respuesta**: bajo cada sonoridad, «✓» o la falta («> 8.ª», «cruce») en color; el
  unísono, «(unís.)» en gris. Titular: «Faltas en 2, 3 y 5.» / «Falta en 4.» / «Sin
  faltas.» (solo las normas); el unísono, en el detalle («cuidado: unísono en 1»).
- **Fuera por ahora**: la superposición entre una sonoridad y la siguiente (parte de N3);
  sin cadena no tiene sentido.

## A cuatro voces

- **3 tríadas** diatónicas en estado fundamental, **de grados distintos** (sin VII; en menor, tampoco II ni III),
  soprano y contralto en el pentagrama de Sol, tenor y bajo en el de Fa.
- **Cada acorde**: bien (~60 %) o con **una** falta (~13–14 % cada una): voz fuera de
  tesitura (N1), más de una 8.ª entre soprano y contralto o entre contralto y tenor —o de
  una 15.ª entre tenor y bajo— (N2), o cruce (N3). **Sin ningún unísono**: aquí no se
  pregunta, y en un pentagrama compartido las cabezas se solapan y una voz desaparece.
- **Disposición** de los acordes bien: cerrada (~45 %), abierta (~42 %) o **mixta** (~13 %).
  No se piden duplicaciones, pero se respetan: cerrada y abierta, con la **fundamental**
  duplicada; mixta (soprano y tenor a una 8.ª), con la **3.ª o la 5.ª**.
- **Pregunta**, en este orden: primero las faltas; si no hay, la disposición.
- **Respuesta**: bajo cada acorde, **una** cosa: la falta en color («tesitura (T)», «> 8.ª
  (A–T)», «> 15.ª (T–B)», «cruce (A/T)») o, si está bien, su disposición («Abierta»,
  «Cerrada», «Mixta»). Titular como en dos voces; en el detalle, la tonalidad y los grados.

## Validación

`../../tests/masivo-disposicion.js`, 3000 instancias de cada consigna, 0 fallos. Recalcula
aparte, con reglas propias, las faltas de cada sonoridad y acorde, y además: tríada
completa con el bajo en la fundamental, disposición por la distancia tenor–soprano y
duplicación según la disposición; intervalos consonantes y sin repetir (dos voces), ningún
unísono ni grado repetido (cuatro voces); un rótulo por elemento. Reparto medido: dos voces, bien ~45 %, N2
~22 %, N3 ~22 %, unísono ~11 %; cuatro voces, cerrada ~27 %, abierta ~26 %, mixta ~8 %, N1
~11 %, N2 ~15 %, N3 ~13 %. Render sin `<harm>`, y prueba en Chrome (escritorio y móvil):
compases iguales, rótulos alineados, nada se mueve al revelar.

Al pintarlo se vio que hacía falta **estirar el sistema** a todo el ancho (`breaks:'auto'`
con `minLastJustification:0`; con `breaks:'none'` Verovio lo ajusta al contenido y los
rótulos de debajo se tocan), dejar **margen a la izquierda** para el nombre de la pareja y
**margen abajo** (`pageMarginBottom`) para los rótulos.

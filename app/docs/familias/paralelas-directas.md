# Paralelas y directas — diseño

> Decidido el 2026-10-09 (`../../../informes/2026-10-09-plan-ud1.md`). ⟶ HECHO (fase 5e,
> 2026-10-10): `paralelas-directas-core.js` + `paralelas-directas.html`, con `publico:false`
> hasta revisarla. Lo común —faltas inyectadas, comprobador general, pareja resaltada— está en
> `../motor-contrapunto.md`.

Hoy en el plan: 3.º UD 1, familia *Paralelas y directas*, una consigna con niveles.
Apuntes: c3u1 §2.4 *Quintas y octavas paralelas* y §2.5 *Quintas y octavas directas*. Va
detrás de *Movimientos · Armónicos*: una directa es un movimiento directo que llega a 5.ª u
8.ª, así que primero se identifica el movimiento y después a qué llega.

- **Se señalan** las faltas de cada paso, con sus voces: «5.as paralelas (S–B)», «8.ª
  directa (S–B): movimiento directo a 8.ª, soprano por salto».
- **Reglas**: N4 (5.as, 8.as y unísonos paralelos, también por movimiento contrario) y N5
  (directas de 5.ª y 8.ª entre extremas, salvo soprano por grado conjunto). N6, fuera.
- **Niveles** (el paso del 2 al 3 es la transición de que te digan dónde mirar a buscar
  solo):

| Nivel | Voces | Reglas |
|---|---|---|
| 1 | dos | N4. **N5 se ignora**: a dos voces no se generan directas de 5.ª u 8.ª |
| 2 | cuatro, con la pareja resaltada (el resto en gris) | N4, N5 |
| 3 | cuatro, sin resaltar | N4, N5 |

- Una parte de las instancias, sin faltas.

⟶ DECIDIDO (2026-10-10, al empezar la fase 5e):

- **8 sonoridades**, como *Movimientos*; **0–2 faltas** (~25 % sin ninguna), en pasos
  distintos.
- **Se revela de una vez** (al buscar faltas, revelar paso a paso delataría los pasos
  limpios).
- **Nivel 2**: las faltas, **solo en la pareja resaltada**; las otras voces, siempre
  limpias. Las dos que no se preguntan, en gris, y también sus líneas adicionales (salvo
  la que comparta una nota en tinta: `ArmoniaEj.lineasAdicionales`). (Una directa es siempre entre soprano y bajo: si la hay, esa es la pareja.)
- **Rótulo** bajo el paso, corto: «5.as par.», «8.as par. contr.» si es por movimiento
  contrario, «8.ª dir.»; a cuatro voces, con las voces **en una segunda línea** («(S–B)»;
  en una sola, los rótulos de pasos cercanos chocaban); a dos voces, sin ellas (se
  sobreentienden). Y una raya de color en las dos voces implicadas. El texto largo, en el detalle de la respuesta. Titular: «Faltas en 2–3
  y 5–6.» (las sonoridades de cada paso, contadas desde 1) / «Sin faltas.».

## Cómo se genera

- **Nivel 1**: un contrapunto correcto del motor (una pareja del coro, como en
  *Consonancia*) al que se le cambia una nota interior por otra cercana de la escala que
  siga formando consonancia, de modo que el comprobador encuentre exactamente una falta
  nueva, N4. Si aparece una directa (N5), la instancia no vale.
- **Niveles 2 y 3**: una sucesión de *Bajo cifrado* realizada por el motor a cuatro voces
  (como *Armónicos*, nivel 2), sin faltas según los dos comprobadores; se cambia una nota de
  soprano, contralto o tenor por **otra nota del mismo acorde** (el bajo no se toca: es el
  del cifrado), de modo que el comprobador general encuentre exactamente una falta nueva
  (N4 o N5) y el de 4.º, ninguna otra (ni duplicaciones, ni acorde incompleto, ni nada
  más): la realización sigue siendo correcta salvo por lo inyectado.
- La partitura, el audio y la pareja en gris, los de `movimientos-core.js`.
- Ni dos faltas en el mismo paso ni en pasos contiguos (compartirían sonoridad y los
  rótulos se apilarían).

## Validación

`../../tests/masivo-paralelas-directas.js`, 2000 instancias de cada nivel, 0 fallos.
Recalcula aparte las paralelas (también por movimiento contrario) y las directas, y
comprueba: nivel 1, siempre consonante y sin directas; nivel 2, las faltas en la pareja
resaltada; niveles 2 y 3, la realización limpia según el comprobador de 4.º fuera de lo
inyectado; render (todas las notas con su id, las grises donde tocan, sin `<harm>`).
Reparto: sin faltas ~25 %, una ~44 %, dos ~31 % en los tres niveles. Nivel 1, 5.as ~34 %
de las faltas (8.as, el resto); niveles 2 y 3, 5.as ~45 %, 8.as ~30 %, directas ~22 %.

Lo que hubo que ajustar al medir: las 8.as caben mucho más a menudo que las 5.as, así que
se sortea antes cuál de las dos (si caben ambas); y a dos voces casi nunca hay ya una 5.ª
al lado de donde se quiere poner otra (el motor prefiere 3.as y 6.as): la inyección puede
cambiar dos notas seguidas de una voz, a una 5.ª u 8.ª de la otra en las dos sonoridades,
siempre que sigan siendo justas. La directa también cabe menos: se intenta primero más a
menudo.

## Enlazar acordes (2.ª consigna)

> Decidido el 2026-10-24. ⟶ HECHO el mismo día: `enlace-core.js` + `enlace-notas-comunes.html`,
> oculta con la familia.

**Lo que se da**: un bajo de 8 notas, todo en estado fundamental, y el primer acorde completo
(disposición cerrada o abierta a partes iguales, nunca mixta; siempre con la fundamental
duplicada). **Lo que se pide**: enlazar los siete acordes siguientes con la consigna básica
(c3u1, final de §2.5; Minimos P4): **si hay notas comunes, se mantienen** (y las demás voces van
por grado a las notas que faltan); **si no las hay, las tres voces superiores van por movimiento
contrario al bajo**, cada una a la nota más cercana del acorde siguiente en esa dirección.

- La consigna da **una sola solución** desde el primer acorde, y en estado fundamental
  conserva la fundamental duplicada y la disposición. La genera la propia consigna (no el
  motor a cuatro voces); los dos comprobadores (general y de 4.º) vigilan que sea correcta.
- **El bajo**: la gramática de *Morfología* (`bajo-cifrado-core.js`, opción `fundamental`):
  I, II, III, IV, V, VI (en menor, sin II ni III); empieza en I y acaba en V–I o en un
  predominante–V. **Fuera V–VI y VI–V**: con la consigna, la sensible bajaría (y en menor habría
  2.ª aumentada); **y III–IV**, por lo mismo (la sensible del III bajaría al la, N7).
- **Niveles**: 1, tonalidades mayores; 2, también menores (las del 1.er trimestre, como
  *Morfología*).
- **Paso a paso** (modo por pasos de la página común): «Siguiente» muestra el acorde siguiente
  y hace sonar el enlace; «Respuesta», todos. Bajo cada enlace, un rótulo abreviado —«1 n.c.»,
  «2 n.c.» o «contr.»: así caben en una sola fila entre blancas seguidas (con «m. contr.», no)— y rayas: en terroso, la que une
  cada nota mantenida; en azul (como su rótulo), en el movimiento contrario, una por voz, también
  la del bajo, para que se vea la dirección.
- Partitura de *Movimientos* (`Movimientos.toMEI`, blancas en un compás sin métrica, S–A en
  clave de Sol y T–B en clave de Fa), con las voces superiores de los acordes 2–8 como
  respuesta (`resp`, con su `data-paso`).

Validación: `../../tests/masivo-enlace.js [n]` (por nivel): la solución sigue la consigna
(recalculada aparte), cero faltas en los dos comprobadores, el primer acorde con la fundamental
duplicada y la disposición sorteada, sin las sucesiones vetadas, y el render con máscara.

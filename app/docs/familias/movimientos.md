# Movimientos — diseño

> Decidido el 2026-10-09 (`../../../informes/2026-10-09-plan-ud1.md`; los detalles, al
> empezar la fase 5d). ⟶ HECHO (fase 5d, 2026-10-09), con `publico:false` hasta revisarla.
> Lo común —faltas inyectadas, comprobador general, parejas del coro, pareja resaltada—
> está en `../motor-contrapunto.md`.

Familia *Movimientos* de 3.º UD 1, con dos consignas; sustituye a la antigua *Movimiento
armónico* (id/au/ct), que se retira: **Canto** queda aparcado como ejercicio independiente
y **Oído** («movimiento predominante»), pospuesto. Núcleo: `ejercicios/movimientos-core.js`
(global `Movimientos`). Páginas: `movimientos-melodicos.html`, `movimientos-armonicos.html`.

## Melódicos

Apuntes c3u1 §2.2. Reglas: N12, N13, **N15** (añadida a los mínimos para esta consigna) y P9.
Sin niveles.

- **Material**: una voz del coro (soprano, contralto, tenor o bajo; su nombre, encima, como
  dato), **8 notas** en blancas, sin compás, en su clave (soprano y contralto en Sol, tenor
  y bajo en Fa); tonalidades del 1.er trimestre, mayores y menores (con la sensible: en
  menor, la 2.ª aumentada 6̂–7̂ es una de las faltas posibles).
- **Generación**: una línea **correcta** (en su tesitura, termina en la tónica, con dos a
  cuatro saltos y sin ninguna de las faltas siguientes), escrita aquí nota a nota y
  validada por el comprobador; después se inyectan **0–2 defectos** (~25 % sin ninguno)
  cambiando una nota interior. Lo que hay de verdad lo dice el comprobador.
- **Defectos**:
  - **Faltas**: intervalo aumentado o disminuido (N12: 4.ª aum., 5.ª dism. sin resolver
    hacia dentro, 2.ª aum. en menor…); salto excesivo (N13, con el **tope de cuatro
    voces**: 6.ª en las voces superiores, 8.ª en el bajo; nunca 7.ª ni más de 8.ª), y dos
    saltos seguidos en la misma dirección que **suman 7.ª o 9.ª** (N15).
  - **Mejorable**: salto de 4.ª o mayor **no compensado** (P9).
- **Respuesta**: bajo cada defecto, un **corchete** que abarca sus notas y el rótulo
  («4.ª aum.», «salto de 7.ª», «suman 7.ª»), en el color de la falta; el no compensado,
  «(sin compensar)», en gris. Titular: «Faltas en 3–4 y 6–8.» / «Sin faltas.» (notas
  contadas desde 1); lo mejorable, en el detalle.

## Armónicos

Apuntes c3u1 §2.3. Sin faltas: se pregunta el **tipo de movimiento** de cada paso
(oblicuo, contrario, directo, paralelo; `ConduccionCheck.movimiento`, con el paralelo por
amplitud diatónica).

- **Nivel 1**: dos voces, de cualquier pareja del coro, **8 sonoridades** del motor de
  contrapunto (como Consonancia: S–A en Sol, T–B en Fa, las demás repartidas). Se pide
  variedad: al menos tres tipos de movimiento.
- **Nivel 2**: **una pareja resaltada entre cuatro voces** (las otras dos, en gris): 8
  acordes de una sucesión de *Bajo cifrado* realizada por el motor a cuatro voces
  (`cuatro-voces-core.js`, sin faltas). La pareja se elige entre las que dan variedad (al
  menos tres tipos y como mucho un paso sin movimiento).
- **Revelado paso a paso** (modo nuevo de la página común, `pasos`): todas las notas a la
  vista desde el principio; **«Siguiente»** revela el movimiento de un paso (rótulo y rayas)
  y suenan sus dos sonoridades; **«Respuesta»** los revela todos. Con el último paso, la
  respuesta queda revelada.
- **Respuesta**: entre cada dos sonoridades, el tipo abreviado («contr.», «obl.», «dir.»,
  «par.»; «—» si ninguna voz se mueve) y una raya por voz entre sus dos notas (voz aguda y
  voz grave en colores distintos). Titular: el recuento («Contrario 3 · Oblicuo 2 ·
  Paralelo 2»).

## Validación

`../../tests/masivo-movimientos.js`, 2000 instancias de cada consigna (Armónicos, de cada
nivel), 0 fallos. Recalcula aparte, con reglas propias, los defectos de cada voz (N12, N13,
N15, P9) y el movimiento de cada paso; comprueba tesitura, final en la tónica, que los
defectos no se solapan, la variedad de Armónicos y, en el nivel 2, la realización entera con
el comprobador de 4.º; y el render (todas las notas con su id, sin `<harm>`). Reparto medido:

- Melódicos: sin defectos ~25 %, uno ~44 %, dos ~30 %; por ejercicio, N12 ~34 %, N13 ~30 %,
  N15 ~17 %, P9 ~24 %; las cuatro voces, ~25 % cada una.
- Armónicos 1: contrario ~51 %, paralelo ~24 %, directo ~14 %, oblicuo ~11 %.
- Armónicos 2: oblicuo ~33 %, contrario ~29 %, paralelo ~18 %, directo ~17 %, sin
  movimiento ~3 %.

Dos cosas que hubo que ajustar al medir: inyectar una 7.ª o un tritono cambiando una sola
nota dejaba casi siempre el salto **también sin compensar** (dos defectos en el mismo
sitio, y la instancia se descartaba), así que la inyección puede mover también la nota
siguiente, para compensarlo; y si el tipo sorteado no cabe se prueban los demás en orden
sorteado, con P9 —el que más fácil cabe— con poco peso. Prueba en Chrome (escritorio y
móvil): nada se mueve al revelar ni al avanzar por pasos.

Fuera, por ahora: el perfil de la línea (ápice único, P8) no se pregunta.

## Historia: el diseño original

Lo que sigue es el diseño original, con el reparto antiguo en tres tipos (ya retirado).

El esquema original de la UD 1 tenía cuatro familias y un andamiaje de tipos: la 1.ª, solo identificación; la 2.ª añadía audición; la 3.ª, canto; la 4.ª (faltas) reutilizaba los tipos ya introducidos.

## Movimiento armónico (antigua «familia 3»)

- Pequeños fragmentos a dos voces, en clave de Sol, de Fa o **repartidas** entre ambas.
- Generados **a partir de modelos registrados** o **algorítmicamente**.
- Objetivo: identificar los **intervalos** entre voces y/o los **movimientos** (oblicuo,
  contrario, directo).
- **Encadenado:** una respuesta por cada nuevo intervalo/movimiento del fragmento.
- **Canto:** se añade aquí; ejercicio **similar o quizás idéntico** al de identificación.
- **Versión auditiva:** se **muestra solo para la respuesta**; quizás fragmentos **más breves**
  o con **situación repetida** (p. ej. un fragmento en el que **todos** los movimientos son
  contrarios).
- **Generación (implementada):** motor genérico de contrapunto de 1.ª especie
  (`app/public/ejercicios/contrapunto-core.js`, reutilizable para variantes con faltas y para la
  versión a tres voces). Fragmentos de **10 sonoridades**; solo consonancias (sin 4.ª sobre
  el bajo); extremos en 8.ª/unísono sobre la tónica; sin paralelas/directas ni sensible
  doblada; **cadencia fija**: penúltimo intervalo 3.ª (7̂ abajo / 2̂ arriba → unísono) o 6.ª
  (2̂ abajo / 7̂ arriba → 8.ª). Melódicamente: salto máximo de 5.ª, nunca aumentado ni
  disminuido; dos saltos seguidos en la misma dirección no suman 7.ª ni 9.ª; tras un salto
  de 4.ª o mayor se prefiere el giro por grado conjunto en dirección contraria.

## Detección de faltas (antigua «familia 4»)

- Similar a las anteriores, pero el objetivo es identificar **faltas** (p. ej. **5.ª paralelas**).
⟶ ABIERTO: ¿qué faltas entran en UD 1 (5.ª/8.ª paralelas, directas…)? ¿Mismos tipos
(id/audición/canto) que la familia 3?

## Variante a tres voces

- Tres voces: **dos en clave de Sol, una en Fa**.
- Se **resaltan dos voces** (cualquier combinación) → mismo planteamiento que a dos voces,
  pero con una **voz distractora**.

## Resumen de tipos por familia (modelo antiguo)

| Familia | Identificación | Audición | Canto | Variante 3 voces |
|---------|:---:|:---:|:---:|:---:|
| 1. Tríadas | ✓ | — | — | — |
| 2. Intervalos | ✓ | ✓ | — | ✓ |
| 3. Fragmentos | ✓ | ✓ | ✓ | ✓ |
| 4. Faltas | ✓ | ✓ (?) | ✓ (?) | ✓ |

⟶ ABIERTO: confirmar las casillas con "(?)" de la familia 4.

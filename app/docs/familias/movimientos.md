# Movimiento armónico y contrapunto a dos voces — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 3.º UD 1, familia *Movimiento armónico*, oculta (`publico:false`), con
las consignas id/au/ct del modelo antiguo. Motor: `ejercicios/contrapunto-core.js`.

⟶ DECIDIDO (2026-10-09, `../../../informes/2026-10-09-plan-ud1.md`), ⟶ PENDIENTE (fase 5d):
la familia pasa a llamarse **Movimientos**, con dos consignas, sobre lo común de
`../motor-contrapunto.md` (faltas inyectadas, comprobador general, parejas del coro,
pareja resaltada). Apuntes: c3u1 §2.2 y §2.3.

- **Melódicos**: una voz, en clave de Sol o de Fa, con el **nombre de la voz** como dato
  (N13 depende de ella; a dos voces, máximo 5.ª). Se señalan **solo los defectos**:
  intervalos aumentados y disminuidos (N12) y saltos excesivos (N13) como faltas, y el
  **salto no compensado (P9) como «mejorable»**. Nombrar cada intervalo ya es UD 0.
- **Armónicos**: dos voces de cualquier pareja, o **una pareja resaltada entre cuatro**
  (el resto en gris; las cuatro voces, realizaciones del motor a cuatro voces sobre las
  sucesiones de *Bajo cifrado*). Se marca el tipo de movimiento de cada paso (oblicuo,
  directo, contrario, paralelo), **revelando paso a paso** como ahora.
- **Canto**: aparcado como ejercicio independiente; en clase se valorará qué se adapta.
  **Oído** (el «movimiento predominante»): pospuesto hasta ver dónde encaja.
- *Paralelas y directas* va en su propia familia (`paralelas-directas.md`), detrás.

Lo que sigue es el diseño original, con el reparto antiguo en tres tipos.

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

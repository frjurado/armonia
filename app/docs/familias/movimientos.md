# Movimiento armónico y contrapunto a dos voces — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 3.º UD 1, familia *Movimiento armónico*, oculta (`publico:false`), con los modos id/au/ct del modelo antiguo. Motor: `ejercicios/contrapunto-core.js`.

⟶ APLAZADO (2026-10-05): se rediseña con el modelo de `../Modelo-ejercicios.md` **después** de mejorar el motor (preferencias puntuadas, como `cuatro-voces-core.js`: hoy los contrapuntos son correctos pero sosos). Orientación: identificación encadenada con la presentación «Oír»; el movimiento uniforme de oído es **otra consigna** (la pregunta cambia: qué movimiento predomina); el canto, otra consigna. Lo que sigue es el diseño original, con el reparto antiguo en tres tipos.

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

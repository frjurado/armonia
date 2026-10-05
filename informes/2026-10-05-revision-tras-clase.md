# Revisión del modelo de ejercicios tras usarlos en clase

*5 de octubre de 2026. Estado de partida: `b74346d` (3.º UD 0 y UD 1-Morfología, 4.º UD 0
publicadas en la app).*

## Contexto

Tras probar la app en clase, el diseño de los ejercicios se veía improvisado: cada familia
había resuelto a su manera el formato (series o sin fin), los niveles, la presentación de
la pregunta y la audición. Antes de seguir añadiendo familias se revisó el conjunto, sin
tocar código.

## Diagnóstico

| Familia | Formato | Niveles | Qué gradúa el nivel | Pregunta visible |
|---|---|---|---|---|
| Armaduras (3.º UD 0) | series de 12 | — | — | no (en Ayuda) |
| Intervalos (3.º UD 0) | sin fin | — | — | no |
| Acordes (3.º UD 0) | sin fin; ver o construir al 50 % | 3 | clave y disposición | no |
| Morfología (3.º UD 1) | sin fin | 2 | modo | sí, debajo |
| Intervalos, Mov. armónico (3.º UD 1, ocultas) | modos id/au/ct | 3 | clave + modo | no |
| Cadencias, Prolongación (4.º UD 0) | sin fin | 3 | contenido | sí, debajo |

- **Niveles**: siempre empiezan en 1, solo suben y solo tras revelar; lo que implican está
  dentro de la Ayuda plegada, que nadie abre. El texto de cada nivel está duplicado
  (`curriculum-data.js` y `LVL_NOTES` de los cores).
- **Revelar mueve la página**: el panel de respuesta aparece (`display:none` → visible) y
  el SVG se vuelve a renderizar más alto.
- **id / au**: páginas casi idénticas (unas 30 líneas de diferencia); el reparto en
  identificación / audición / canto no encajaba en casi ninguna familia, y las variantes
  reales acabaron en un esquema aparte (`tipos`) que pasó de excepción a regla.
- **Bidireccionalidad** de *Acordes*: cambiar de tarea al azar resultaba confuso.
- **Documentación**: la parte general de `Generador-ejercicios.md` describía el modelo
  original; las secciones de familia estaban al día pero ordenadas por unidad, como los
  nombres de fichero, lo que acopla cada ejercicio a su ubicación actual.
- **Apuntes**: la Morfología de c3u1 (salvo quizá consonancia/disonancia) encajaría mejor
  en la UD 0. Es una revisión para el curso que viene, que obliga a pensar cómo se mueven
  los ejercicios cuando cambian los apuntes.

## Decisiones

Del profesor, a propuesta del análisis:

1. **Cuatro ejes** para describir un ejercicio: **material** (qué se genera), **consigna**
   (qué se pregunta; es la entrada del menú), **presentación** (qué se ve o se oye antes de
   la respuesta; conmutador dentro del ejercicio) y **nivel** (qué contenido puede salir).
   Sustituye a los tres tipos id/au/ct. Cambia `Plan-Armonia.md` §5.1.
2. **Fuera el sentido *construir*** de *Acordes*, del todo.
3. **Menú en filas** (una por familia, con sus consignas como botones), en lugar de tres
   columnas fijas. No se fuerza un número de consignas por familia.
4. **Nombres de fichero por material**, sin curso ni unidad. La convención `c<curso>u<ud>-`
   queda para los apuntes.
5. **`Generador-ejercicios.md` se divide**: `Modelo-ejercicios.md` (lo común) y un
   documento por material en `app/docs/familias/`, más `motor-cuatro-voces.md`.
6. **Consonancia** es, de momento, la 2.ª variante de *Morfología* (3.º UD 1). El curso que
   viene se verá.
7. La presentación **«Oír»** se ofrece en *Cadencias · Tipo*; no en Bajo dado, Canto dado
   ni Prolongación. (Y en Consonancia, por la naturaleza de la pregunta.)
8. Se abre esta carpeta, `informes/`, y `HISTORIA.md` entra en ella.

Propuestas del análisis aceptadas sin objeción (revisables al implementarlas):

- **Niveles solo donde crece el contenido**; la notación no es nivel. La UD 0 de 3.º, sin
  niveles: *Intervalos* (Identificación y Con grados) y *Acordes* en **pentagrama doble**;
  *Intervalos · Con inversión* en un pentagrama.
- **Pregunta encima de la partitura**, siempre visible; **selector de nivel** visible con
  una línea que dice qué incluye (sustituye a «Más difícil»); la **Ayuda** sigue plegada,
  con enlace al apunte.
- **Revelar sin mover nada**: la partitura se renderiza completa una vez y lo que es
  respuesta se oculta con CSS; el texto de la respuesta se reserva invisible.
- **Series** solo donde el orden es contenido o hay que cubrirlo todo: *Armaduras*, tal
  como está.
- La familia oculta *Intervalos* de la UD 1 se funde con la de la UD 0 (mismo generador) y
  se queda en su única consigna propia, la consonancia.
- *Movimiento armónico*: aplazado hasta mejorar `contrapunto-core.js` (preferencias
  puntuadas); luego, rediseño con el modelo.

## Plan por fases

| Fase | Qué | Cuándo |
|---|---|---|
| 1 | **Documentos**: este informe; Plan §5.1; `Generador-ejercicios.md` dividido en `Modelo-ejercicios.md`, `familias/*.md` y `motor-cuatro-voces.md`; referencias del código y de `CLAUDE.md` al día. | ⟶ HECHO (2026-10-05) |
| 2 | **Página común** en `comun.js`/`comun.css` (pregunta arriba, nivel visible, respuesta reservada, revelado por máscara) y migración familia a familia, empezando por las que están en uso (Bajo cifrado, Cadencias, Prolongación). Quitar *construir* de *Acordes*. | pronto |
| 3 | **Estructura**: un solo esquema en `curriculum-data.js` (consignas + presentaciones), menú en filas, renombrado por material, parámetros en la URL, enlaces cruzados apunte ↔ ejercicio. | después |
| 4 | **Contenido**: Intervalos y Acordes de la UD 0 en pentagrama doble y sin niveles, generador de intervalos único, consigna Consonancia, «Oír» en Cadencias · Tipo; Movimiento armónico tras mejorar el motor de contrapunto. | después |
| 5 | **Curso que viene**: reorganizar los apuntes (Morfología a la UD 0); los ejercicios se mueven solo con datos. | 2027-28 |

Cada fase se publica por separado. Los alumnos solo notan la 2 y la 3, como mejoras.

## Consecuencias

- `Generador-ejercicios.md` deja de existir; su texto sigue en la historia de git (la
  discusión de formatos de entrada para Verovio, antiguo §5.1, solo está ahí).
- `app/CLAUDE.md` describe todavía el código actual (modos id/au/ct, nombres `unidad0-`…);
  remite a `Modelo-ejercicios.md` para lo decidido y pendiente.
- La regla de nombres de fichero por unidad (`c<curso>u<ud>-`, decidida el 2026-09-19)
  queda revocada para la app antes de haberse aplicado a los ficheros antiguos.

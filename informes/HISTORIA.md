# Historia del desarrollo — `armonia/`

*Reconstruido a partir de la historia de commits de `armonia/` (53 commits, del 4 de
septiembre al 5 de octubre de 2026) y de las notas de trabajo. Estado a 5 de octubre de
2026. Vive en `informes/` desde esa fecha y se actualiza con cada informe (ver
`README.md`).*

---

## Resumen

En un mes, el proyecto ha pasado de un conjunto de documentos normativos a un sitio
publicado y en uso por los alumnos, con dos patas que derivan del mismo plan de la
asignatura:

- **App de ejercicios breves** (HTML/JS estático, para pizarra táctil y móvil): UD 0
  de 3.º y 4.º completas, 3.º UD 1 con su primera familia, y un motor de conducción
  de voces a cuatro partes que genera y comprueba realizaciones.
- **Apuntes** (Markdown + LilyPond → HTML y PDF con Pandoc y Typst): c3u0, c3u1 y
  c4u0 publicados, con ejemplos para clase y fichas de ejercicios en papel.

Cifras orientativas: unas 21 000 líneas añadidas y 2 200 borradas; ~135 ficheros
versionados (61 en `app/`, 64 en `apuntes/`). Los días más intensos fueron el 23 de
septiembre (14 commits) y el 16 (9).

| Fase | Fechas | Qué |
|---|---|---|
| 1. Fundación | 4–7 sep | Reglas antes que código; app inicial; pipeline de apuntes; capa visual |
| 2. Al aula | 15–16 sep | GitHub Pages, robustez de Verovio, tipografía musical, móvil y pizarra, rama `publico` |
| 3. El motor a cuatro voces | 18–22 sep | Reorganización 0–6, Acordes, Cadencias (Tipo, Bajo dado, Canto dado) |
| 4. Los apuntes en serio | 22–25 sep | `construir.py`, fuente propia, c3u0 y c4u0 publicados, ESTILO, cifrado francés |
| 5. Ampliación de materiales | 28–30 sep | c3u1, ejemplos para clase, fichas, familia Prolongación |
| 6. Granularidad fina | 5 oct | Visibilidad por familia/ejercicio; 3.º UD 1 en la app con Morfología |
| 7. Revisión del modelo | 5 oct | Tras el uso en clase: cuatro ejes de ejercicio, plan por fases, documentación dividida, `informes/` |

---

## Fase 1 — Fundación (4–7 de septiembre)

**4 sep · `0af5e45` — Primer commit: solo documentación.** Antes de una línea de
código, el repositorio fija sus reglas: README y CLAUDE.md raíz, `curriculum/Plan-Armonia.md`
como fuente de verdad (ápice de la jerarquía documental), especificaciones de la app
en `app/docs/`, tokens visuales y el pipeline previsto para los apuntes. Es la
decisión fundacional del proyecto: **diseñar antes de codificar**, y que el plan
gobierne tanto la app como los apuntes sin que ninguno de los dos lo gobierne a él.

**7 sep · tres commits.**
- `a4847ea` — **La app**, de golpe (~4 700 líneas): menú y vista de currículum sobre
  `curriculum-data.js` como fuente única; un `-core.js` sin DOM por familia; un
  parser propio de un subconjunto de LilyPond con exportador a MEI para Verovio;
  validación de que ese subconjunto compila en LilyPond real.
  *Ese «de golpe» se debe a la reorganización, no al ritmo de trabajo:* la app ya
  se había empezado a desarrollar por separado, y al integrarla en el proyecto
  común su historial de git se perdió. Este commit recoge, por tanto, el estado al
  que había llegado entonces, no su comienzo.
- `af34220` — **Andamiaje de los apuntes**: ejemplos `.ly` aparte compilados a SVG,
  Makefile, una plantilla Typst y un `hacer-html.py` provisionales «que sustituirá
  Quarto» (no lo hizo; ver fase 4).
- `5e2a845` — **Capa visual «editorial entintada»**: tinta verde `#2f4f42` y acierto
  en terroso para no competir con ella.

## Fase 2 — Al aula (15–16 de septiembre)

**Publicación.** `d01c3b0` separa en `app/public/` lo publicable, añade `sitio/`
(portada + `montar.sh`) y el flujo de GitHub Actions que despliega en Pages. Al día
siguiente, la portada lleva un **QR** para escanear desde la pizarra.

**Primeros fallos reales, ya con el sitio publicado:**
- Verovio se servía desde `verovio.org/latest` (7,3 MB, sin CDN, versión rodante) y
  en el aula fallaba a menudo. Pasa a `vendor/` local, fijado en 6.3.0.
- Aun en local seguía fallando: la build 6.x ya no expone `Module.calledRun` y, si
  el WASM arrancaba antes de engancharse al evento, la página esperaba 90 s para
  nada. Se diagnosticó reproduciéndolo en headless y se resolvió detectando el
  runtime por sus exports (`75543da`). Uno de los bugs más finos del proyecto.
- En móvil, los ejercicios de armaduras salían en blanco por un `align-items` en
  columna que medía los 5 000 px de la tira.

**Tipografía musical.** Ni Source Serif ni Source Sans tienen ♯/♭: caían a la fuente
del sistema, distinta en cada dispositivo. Se crea un subconjunto de **Leland**
(MuseScore, OFL) remapeado a Unicode, y Verovio pasa a la misma familia para que el
cifrado y la partitura dibujen la misma alteración. Un segundo pase reescala los
contornos para el texto corrido (con un tropiezo con `nominalWidthX` de CFF que
hacía avanzar 207 unidades de más por glifo).

**Tres entornos de uso.** Modo compacto para móvil (< 720 px) solo con CSS; modo
pizarra (contenido más ancho, partitura ×1,5). Este último disparaba también en
monitores de 1920 px: se corrigió exigiendo además `pointer: coarse` (`e026e24`).

**Desarrollo y público (`a4f2680`).** Los alumnos empiezan a usar el sitio, y lo que
ven no puede cambiar con cada commit. Se crea la rama **`publico`** (raíz del sitio,
la URL del QR) frente a `master` (publicada en `/dev/`, sin enlazar), un flag
`publico:true` por unidad y un `modo.js` que el montaje sobrescribe. El primer push
a `publico` falló porque el entorno de Pages solo admitía la rama principal.

**Coherencia con el plan.** Títulos de unidad literales del plan; ordinales
normalizados («7.ª», «1.ª inversión») primero en el plan y de ahí hacia abajo.

## Fase 3 — El motor a cuatro voces (18–22 de septiembre)

**Reestructuración (`7e57d5a`).** 4.º adopta la estructura de 3.º: UD 0 de repaso y
seis unidades de contenido, numeradas 0–6 en ambos cursos.

**Acordes (`4bc6753`).** La familia se reorganiza en paralelo a Intervalos (simple ·
inversión · grados), con una variante nueva «Con grados». Validada por generación
masiva: 180 000 instancias sin fallos.

**Cadencias (`ca478af`, 19 sep) — el hito técnico del proyecto.** Precedido de
diseño (`docs/Generador-ejercicios.md`) y de un documento nuevo de **mínimos de
conducción de voces** (normas N1–N13 y preferencias P1–P12 con identificador estable
y vigencia por unidad):
- `cuatro-voces-core.js`: motor SATB genérico. Las realizaciones **se buscan, no se
  escriben**: enumeración de disposiciones, normas de transición, preferencias
  puntuadas, búsqueda aleatoria ponderada con reinicios.
- `cuatro-voces-check.js`: comprobador **independiente**, que no comparte funciones
  con el motor, más pruebas de sensibilidad con faltas deliberadas.
- Catálogo de cadencias (CAP/CAI/SC/SC frigia/CR), plantillas rítmicas, salida a
  MEI y MIDI.

**Bajo dado y Canto dado (`07144fd`).** Antes de programarlas se enumeró el catálogo
entero para **medir la ambigüedad real**: las lecturas de un bajo son elecciones
independientes por casilla, nunca más de dos; el bajo determina siempre la
tonalidad, pero la soprano se lee en la relativa hasta un 41 % de las veces, así que
esas instancias se descartan. Resultado: 0 ambiguas en las pruebas masivas.

## Fase 4 — Los apuntes en serio (22–25 de septiembre)

**`construir.py` (`35c103d`).** Sustituye todo el andamiaje provisional por un único
script Python con **Pandoc y Typst**. Dos descartes razonados: Quarto (dependencia
grande para lo que hace Pandoc solo) y `make` (no viene con Windows, de modo que el
Makefile nunca pudo ejecutarse). Nomenclatura `c<curso>u<ud>` común con la app.

**Dificultades de entorno que costaron:**
- Los grados (1̂, ♯7̂) son cifra + circunflejo combinante, y casi ninguna fuente los
  compone bien. Se acabó creando **«Armonia Serif»** (`3c7304b`), una fuente propia
  con el circunflejo recolocado y las alteraciones de Leland *dentro* de la propia
  fuente: anteponer otra no sirve porque Typst y los navegadores eligen fuente por
  clúster. Más tarde (25 sep) pasó a basarse en Source Serif 4, la serifa del sitio,
  y ganó la «↔», el tachado de cifra y los grados en círculo.
- La carpeta de trabajo lleva tilde («Armonía») y `pdftocairo` no abre rutas
  absolutas con caracteres no ASCII: las herramientas se llaman con rutas
  relativas, y LilyPond usa la fuente desde una copia en ruta sin tildes.

**23 sep: el día más largo (14 commits).** c3u0 redactada con sus siete ejemplos;
composición de página; el ancho de las figuras calculado por el script en vez de a
mano (la regla manual se había «podrido» sin que nada avisara: escalas efectivas de
0,89 a 1,72). Y **publicación de los apuntes** (`9709031`): el flujo de Pages instala
LilyPond, Pandoc, poppler y Typst; `publico: true` en el YAML de cada unidad; el
índice se genera leyendo las tablas del plan. La primera publicación falló dos
veces seguidas:
1. La cabecera SVG de `pdftocairo` difiere entre la versión local y la de Ubuntu →
   lectura robusta del ancho (atributo o `viewBox`).
2. El Pandoc 3.1.3 de Ubuntu produce Typst que Typst 0.14 rechaza → Pandoc 3.10
   fijado junto con Typst 0.14.2, comentados como pareja.

En paralelo, en la app, el dato de las cadencias pasa dentro de la partitura (como
`<reh>`, la marca de ensayo, que Verovio coloca siempre encima: 1 080 renders de
comprobación), y el sitio unifica cabecera, botones y banda verde entre app y
apuntes.

**25 sep: c4u0 publicada y convenciones fijadas.**
- c4u0 con siete ejemplos nuevos, rótulos ✓/✗ legibles en blanco y negro, licencia
  **CC BY-NC-SA 4.0**, portada y pie del PDF con QR, figuras desplazables en móvil.
- **`apuntes/ESTILO.md`**: guía de notación y redacción.
- **Cifrado francés apilado** (como Pascual-Diego) desde una tabla única
  `curriculum/cifrado.json`: en las fuentes se escribe el código anglosajón y la
  tabla decide el dibujo, igual en texto (filtro Lua) y en partituras.
- Grados del bajo en círculo (①, ♯⑦); circunflejo para soprano y melodía.

## Fase 5 — Ampliación de materiales (28–30 de septiembre)

**c3u1 (`fea5042`, `eee9e60`, `13205b5`).** Primera unidad nueva (no de repaso), con
cambio de registro deliberado: prosa explicada, menos telegráfica que las UD 0. Diez
ejemplos y cierre con Chopin (Nocturno op. 37 n.º 1). Publicada el 28.

**Dos productos nuevos derivados de las mismas fuentes:**
- **Ejemplos para clase**: las figuras marcadas `.aula` se reúnen en un PDF sin
  análisis (interruptor `ARMONIA_SIN_ANALISIS`), con sitio para anotar.
- **Fichas de ejercicios en papel**: catálogo de tipos en
  `curriculum/Ejercicios-papel.md`, plantillas LilyPond por tipo, y cada ficha lleva
  su solución dentro (de un solo material salen ficha y soluciones). c3u1-f1 y
  c4u0-f1 (realizar un bajo + análisis de Beethoven op. 2 n.º 1). Sin enlace en la
  web, por decisión expresa.

**Prolongación (`eb8aeee`).** Familia nueva en 4.º UD 0 sobre bajos sin cifrar, en
tres extensiones (prolongación, frase, periodo), con las lecturas alternativas
obtenidas analizando el bajo con la misma gramática. El motor gana la norma N14
(6/4 de paso y de bordadura) y varias excepciones; 0 infracciones en las pruebas
masivas.

## Fase 6 — Granularidad fina (5 de octubre)

**`b74346d`.** La visibilidad pasa de la unidad a la **cascada unidad → familia →
ejercicio**: una familia con `publico:false` se oculta; un ejercicio, sale como
«próximamente». Con ello, **3.º UD 1 se publica en la app** con su primera familia,
**Morfología** (variante *Bajo cifrado*: bajos generados por gramática de sucesiones
y normas melódicas, grados en círculo como en los apuntes), mientras Intervalos y
Movimiento armónico siguen ocultas.

## Fase 7 — Revisión del modelo (5 de octubre)

Tras probar la app en clase, revisión del diseño de conjunto **sin código**
([informe](2026-10-05-revision-tras-clase.md)). El reparto de cada familia en
identificación / audición / canto se sustituye por **cuatro ejes**: material,
consigna, presentación (ver u oír, como conmutador) y nivel (solo donde crece el
contenido). Se decide quitar el sentido *construir* de Acordes, el menú en filas, los
nombres de fichero por material y la pregunta encima de la partitura con la respuesta
en espacio reservado. `Generador-ejercicios.md` se divide en `Modelo-ejercicios.md` y
un documento por material, y nace esta carpeta de informes. La implementación queda
en cuatro fases más (página común, estructura, contenido, y la reorganización de los
apuntes del curso que viene).

---

## Lo que ha funcionado

- **La jerarquía documental.** El plan manda; los cambios bajan de él a los datos y
  al código (ordinales, títulos, índice de apuntes generado desde sus tablas). Ha
  evitado que app y apuntes acaben diciendo cosas distintas.
- **Medir antes de programar.** La ambigüedad de Bajo dado/Canto dado se enumeró
  antes de escribir las variantes, y cada familia tiene su validación masiva.
- **Motor y comprobador independientes.** Un error compartido no se valida a sí
  mismo; las pruebas de sensibilidad comprueban que el comprobador detecta faltas.
- **Fuentes únicas para varias salidas.** Un `.md` → HTML y PDF; un `.ly` → apunte,
  ejemplo para clase y ficha con o sin solución; una tabla de cifrado → texto y
  partitura.
- **Separar desarrollo y público** pronto, en cuanto hubo alumnos usando el sitio.
- **Tecnología mínima.** App sin build ni backend; apuntes sin Quarto ni make.

## Dificultades recurrentes

- **Tipografía musical**: alteraciones, grados con circunflejo, cifrado apilado,
  flechas. Ha sido el frente más largo y ha acabado en una fuente propia.
- **Verovio**: carga del WASM, posicionamiento de `<dir>`/`<harm>`/`<reh>`, SVG
  anidados que recortan, `tspan` que hay que crear con `createElementNS`.
- **Diferencias de entorno** Windows local / Ubuntu en CI: rutas con tilde, versiones
  de cairo, Pandoc y Typst desacompasados.
- **Tres pantallas muy distintas** (pizarra táctil, escritorio, móvil) para la misma
  partitura.
- Detalles de flujo: finales de línea que hacen aparecer `c3u1.md` como modificado,
  un `__pycache__` colado.

## Estado actual (5 de octubre de 2026)

Árbol de trabajo limpio; `master` y `publico` en el mismo commit (`b74346d`).

| | App (ejercicios) | Apuntes |
|---|---|---|
| **3.º UD 0** Preliminares | Pública (armaduras, intervalos, acordes) | Publicada |
| **3.º UD 1** Morfología. Conducción de voces | Pública con Morfología; Intervalos y Mov. armónico ocultas | Publicada + ejemplos para clase + ficha f1 |
| **3.º UD 2** Tónica y dominante | — | Guion de trabajo |
| **4.º UD 0** Repaso | Pública (Cadencias ×3, Prolongación) | Publicada + ejemplos para clase + ficha f1 |
| Resto (3.º UD 3–6, 4.º UD 1–6) | — | — |

## Pendientes conocidos

- Segunda variante de Morfología (por diseñar) y decidir si el romano revelado lleva
  la alteración del cifrado («V♯»).
- Llevar el cifrado francés y los grados en círculo al resto de la app, que en
  parte sigue con cifrado anglosajón y circunflejo.
- Redactar c3u2 a partir de su guion.
- Prueba de impresión de los ejemplos para clase para ajustar `ESCALA_AULA`.
- Tira deslizante para las partituras largas de la UD 1 en la app.
- Samples de piano todavía cargados desde la red.
- Enlaces cruzados apunte ↔ ejercicio (la disposición del sitio ya los permite).

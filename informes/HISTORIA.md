# Historia del desarrollo — `armonia/`

*Reconstruido a partir de la historia de commits de `armonia/` (85 commits, del 4 de
septiembre al 16 de noviembre de 2026) y de las notas de trabajo. Estado a 16 de
noviembre de 2026. Vive en `informes/` desde el 5 de octubre y se actualiza con cada
informe (ver `README.md`).*

---

## Resumen

En dos meses y medio, el proyecto ha pasado de un conjunto de documentos normativos a un
sitio publicado y en uso por los alumnos, con tres clases de material que derivan del
mismo plan de la asignatura:

- **App de ejercicios breves** (HTML/JS estático, para pizarra táctil y móvil): UD 0 y
  UD 1 de 3.º y de 4.º completas y públicas, sobre una página común de ejercicio, un
  motor de conducción de voces a cuatro partes y otro de contrapunto, cada uno con su
  comprobador independiente.
- **Apuntes** (Markdown + LilyPond → HTML y PDF con Pandoc y Typst): c3u0, c3u1, c4u0 y
  c4u1 publicados, con sus ejemplos para clase.
- **Fichas en papel**: once hechas a mano (para clase, sin enlazar en la web) y dos
  bancos de veinte fichas de repaso generadas (c3u1 y c4u1), con su solución y su página
  «Fichas» en el sitio.

Cifras orientativas: ~270 ficheros versionados (105 en `app/`, 144 en `apuntes/`). Los
días más intensos fueron el 23 de septiembre (14 commits) y el 16 (9).

| Fase | Fechas | Qué |
|---|---|---|
| 1. Fundación | 4–7 sep | Reglas antes que código; app inicial; pipeline de apuntes; capa visual |
| 2. Al aula | 15–16 sep | GitHub Pages, robustez de Verovio, tipografía musical, móvil y pizarra, rama `publico` |
| 3. El motor a cuatro voces | 18–22 sep | Reorganización 0–6, Acordes, Cadencias (Tipo, Bajo dado, Canto dado) |
| 4. Los apuntes en serio | 22–25 sep | `construir.py`, fuente propia, c3u0 y c4u0 publicados, ESTILO, cifrado francés |
| 5. Ampliación de materiales | 28–30 sep | c3u1, ejemplos para clase, fichas, familia Prolongación |
| 6. Granularidad fina | 5 oct | Visibilidad por familia/ejercicio; 3.º UD 1 en la app con Morfología |
| 7. Revisión del modelo | 5 oct | Tras el uso en clase: cuatro ejes de ejercicio, plan por fases, documentación dividida, `informes/` |
| 8. La página común | 6 oct | Pregunta arriba, nivel visible, revelado por máscara sin movimiento, en todo lo publicado |
| 9. Estructura | 6 oct | Nombres por material, un solo esquema, menú en filas, enlaces apuntes ↔ ejercicios |
| 10. Plan de la UD 1 y UD 0 | 9 oct | Plan completo de la UD 1; «Oír»; Intervalos y Acordes en pentagrama doble |
| 11. La UD 1 | 9–10 oct | Comprobador general; Consonancia, Disposición, Movimientos, Paralelas y directas (ocultas, para revisar) |
| 12. 4.º UD 1 y cierre de 3.º UD 1 | 13–28 oct | Secuencia; c4u1 con 7.ª diatónica y Secuencias; Enlazar acordes; todo lo oculto, público; fichas a mano en serie y variantes |
| 13. Fichas generadas | 29 oct – 4 nov | Verificador de fichas, modelos, generador por lotes, bancos versionados (c3u1, c4u1) y página «Fichas» por unidad |
| 14. Mínimos, exámenes y sitio | desde 17 nov | Plan: ejercicios mínimos, modelos de examen y un solo inicio por unidad |

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

## Fase 8 — La página común (6 de octubre)

Segunda fase del plan ([informe](2026-10-06-fase2-pagina-comun.md)). Todo lo publicado
—salvo las series de Armaduras— pasa a una página común: la pregunta encima de la
partitura, el nivel en un selector de la cabecera con una línea que dice qué incluye, y
un **revelado por máscara**: la partitura se dibuja completa una vez, lo que es
respuesta va marcado en el MEI y el CSS lo oculta hasta revelar, así que nada se mueve.
Verovio pone las líneas adicionales fuera de la nota, y hubo que ocultar a mano las de
las notas ocultas. Los textos de los niveles quedan solo en `curriculum-data.js`, y
Acordes pierde el sentido *construir*. Se valida en un Chrome sin interfaz manejado
desde Node, midiendo antes y después de revelar.

## Fase 9 — Estructura (6 de octubre)

Tercera fase del plan ([informe](2026-10-06-fase3-estructura.md)). Los ficheros de la app
pasan a nombrarse por material (`acordes-tipo.html`, `cadencias-core.js`), porque la
unidad en que sale un ejercicio es un dato, no un nombre; `curriculum-data.js` queda con
un solo esquema (consignas) y el menú, en filas. Y por fin los **enlaces entre apuntes y
ejercicios**: se declaran una vez, en cada consigna del currículo; la construcción de los
apuntes los lee con Node, pone en el sitio «Ejercicios» y «Para practicar», y publica un
pequeño `enlaces.js` del que la app saca el botón «Apuntes» de cada ejercicio. Si un
título cambia y rompe un ancla, la construcción avisa.

## Fase 10 — Plan de la UD 1 y cierre de la UD 0 (9 de octubre)

El profesor trae el plan completo de ejercicios de la UD 1 de 3.º
([informe](2026-10-09-plan-ud1.md)): Morfología (Bajo cifrado y una Consonancia que pasa
a ser una cadena a dos voces), Disposición, Movimientos y Paralelas y directas, apoyados
en una idea común —material correcto, faltas inyectadas a propósito y la respuesta dada
por el comprobador independiente—. Las fases se replantean: la 4 cierra la UD 0 y la 5
será la UD 1 entera. La fase 4 ([informe](2026-10-09-fase4-ud0.md)) trae «Oír» a la
página común, funde los dos generadores de intervalos y pone Intervalos y Acordes en
pentagrama doble y sin niveles, con un criterio para los aumentados y disminuidos: solo
los que aparecen en la escala.

## Fase 11 — La UD 1 (9–10 de octubre)

La UD 1 de 3.º entera, en cinco pasos ([informe](2026-10-10-fase5-ud1.md)): primero lo
común —un **comprobador general** de una a cuatro voces sin acordes, que da la respuesta
de todos los ejercicios, y el motor de contrapunto con parejas reales del coro y
preferencias como pesos—; después, una familia tras otra: *Consonancia*, *Disposición*,
*Movimientos* (melódicos y armónicos) y *Paralelas y directas*, con niveles que van de dos
voces a una pareja resaltada entre cuatro y a cuatro sin resaltar. La revisión de
*Disposición* en clase sacó lo más visible de la fase: los rótulos de respuesta no
pueden ir como `<harm>` (Verovio ensancha el compás y delata la falta), así que la
página común los dibuja aparte. De paso entra una regla en los mínimos, **N15** (la suma
de saltos), y la página común gana un modo por pasos. Todo queda oculto
(`publico:false`) hasta que el profesor lo revise.

## Fase 12 — 4.º UD 1 y cierre de 3.º UD 1 (13–28 de octubre)

Sin informe propio: el detalle está en los commits y en `app/docs/familias/`.

**4.º.** La UD 0 gana su tercera familia, **Secuencia** (`b0c98ef`): círculo de 5.as y
romanesca sobre las frases de Prolongación, con la secuencia realizada **como un modelo
trasladado** y con licencias (N7, N10, N12) que el motor concede y el comprobador
conoce; y «Oír» con bajo dado (las cuatro voces, el bajo destacado). Los apuntes de
**c4u1** (séptimas diatónicas; dieciséis ejemplos, tres de repertorio: Bach, Mozart,
Corelli) se publican el 13, y la app los sigue con dos familias: **7.ª diatónica**
(`2f8d219`; norma nueva **N16**, la preparación de la 7.ª) y **Secuencias** (`95b1e40`;
el círculo de 5.as con 7.as, en estado fundamental y con inversiones). El 18, la unidad
es pública.

**3.º.** Lo que la fase 11 dejó oculto se revisa en clase y sale por partes:
Consonancia y Disposición el 14 (`d1f7701`), Movimientos el 17 (`f81418b`) y Paralelas
y directas el 24 (`4242d12`), ya con una segunda consigna, **Enlazar acordes**
(`a5de868`): un bajo en estado fundamental que se realiza acorde a acorde por notas
comunes o por movimiento contrario. Desde ese día no queda nada oculto en la UD 1.

**Fichas a mano.** Crecen a la vez que los ejercicios: las **series** (varios apartados
en un ejercicio, `f4a82cb`), diez tipos nuevos en `curriculum/Ejercicios-papel.md`
—entre ellos los de séptimas y secuencias de 4.º—, y la convención de **variantes**
(`c3u1-f3b`: mismo diseño, otras tonalidades). Once fichas en total, todas para clase y
sin enlace en la web. Y una lista viva de cambios aplazados en los apuntes
(`apuntes/README.md`, «Revisión para el curso 2027-28»), porque los alumnos de este
curso ya los tienen.

## Fase 13 — Fichas generadas (29 de octubre – 4 de noviembre)

Con las fichas en papel creciendo a mano (fase 12), llega la pregunta de si la máquina
que ya genera y comprueba los ejercicios de la app puede hacer también fichas. El plan
([informe](2026-10-29-plan-fichas-generadas.md)) va en cinco fases, cada una revisada
antes del commit ([cierre](2026-11-03-fichas-generadas.md)): un **verificador** que
contrasta las fichas con los comprobadores de la app —y que de paso encuentra
discrepancias de criterio en fichas ya repartidas—; **modelos** de ficha con condiciones
en lugar de material; un **generador** que, ejercicio a ejercicio, pide el material a los
núcleos de la app y solo da por bueno lo que el verificador acepta; y un **banco** fijo
de 20 repasos de c3u1, versionado, con una página «Fichas» por unidad y la solución
detrás de un freno. Lo más instructivo fue lo que la revisión del profesor sacó a la luz
del material generado: correcto no basta (la conducción alrededor de las faltas tiene
que ser buena, y eso limita cuántas caben), y la variedad hay que medirla (en menor, el
bajo de enlazar acordes apenas tiene treinta caminos, y el generador repetía).

El 4 de noviembre llega el segundo banco, el **repaso de c4u1** (`9e6d843`): dos bajos
de cuatro compases para realizar, sacados de las frases de Secuencia y de 7.ª diatónica
de la app. Los dos repasos están publicados. Y el camino se recorre también al revés: el
16 de noviembre, el Bajo cifrado de la app pasa a ocho acordes con al menos cuatro
invertidos, «como en las fichas» (`e290f8a`).

## Fase 14 — Mínimos, exámenes y sitio (desde el 17 de noviembre)

Con el sitio crecido a base de enlaces entre dos índices paralelos (ejercicios y
apuntes) y dos materiales nuevos en camino, el profesor replantea la estructura
([plan](2026-11-17-plan-minimos-examenes-sitio.md)): un solo inicio con la **unidad como
eje** (apuntes, ejercicios y papel en el mismo acordeón), **ejercicios mínimos**
—consignas de la app marcadas, que se hacen en papel, dos por A4— y **modelos de
examen** trimestrales generados como los repasos. Con el primer examen a dos o tres
semanas, el orden lo marca la urgencia: mínimos, examen, y después el sitio.

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

## Estado actual (16 de noviembre de 2026)

Árbol de trabajo limpio; `publico` lleva todo `master` (`e290f8a`, fusionado el 16 de
noviembre). No hay nada oculto en las unidades publicadas.

| | App (ejercicios) | Apuntes | Papel |
|---|---|---|---|
| **3.º UD 0** Preliminares | Armaduras, Intervalos, Acordes | Publicada | — |
| **3.º UD 1** Morfología. Conducción de voces | Morfología, Disposición, Movimientos, Paralelas y directas | Publicada + ejemplos para clase | Fichas f1–f6 y f3b (clase); repaso (banco de 20, en la web) |
| **3.º UD 2** Tónica y dominante | — | Guion de trabajo | — |
| **4.º UD 0** Repaso | Cadencias, Prolongación, Secuencia | Publicada + ejemplos para clase | Fichas f1 y f2 (clase) |
| **4.º UD 1** Séptimas diatónicas | 7.ª diatónica, Secuencias | Publicada + ejemplos para clase | Fichas f1 y f2 (clase); repaso (banco de 20, en la web) |
| Resto (3.º UD 3–6, 4.º UD 2–6) | — | — | — |

## Pendientes conocidos

Las listas vivas están en los documentos vigentes, y son las que valen:
`app/docs/Modelo-ejercicios.md` §8 (app), `apuntes/README.md` («Estado», «Revisión para
el curso 2027-28», «Discrepancias de criterio por resolver», «Fichas: pendiente de
probar»), `curriculum/Plan-Armonia.md` §8 y el «Pendiente» del
[cierre de las fichas generadas](2026-11-03-fichas-generadas.md). Lo más grueso:

- Redactar c3u2 a partir de su guion, y sus ejercicios.
- Modelos de examen y ejercicios mínimos exigibles (*hard gates*, Plan §7.2, sin definir).
- Repasos de otras unidades; análisis en las fichas generadas.
- Tira deslizante para las partituras largas en la app.
- Samples de piano todavía cargados desde la red; funcionamiento sin conexión.
- Revisar en clase las familias de 4.º UD 1 y los pesos del motor.

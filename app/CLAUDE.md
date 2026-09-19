# CLAUDE.md — app de ejercicios

Reglas propias de la app. Las que valen para todo el repositorio (idioma,
jerarquía documental, los dos motores de render) están en `../CLAUDE.md`, que
se carga junto a este; aquí **no se repiten**.

Cómo ejecutar la app está en `../README.md`.

## Principio de diseño

La app es deliberadamente **plana**: sin backend, sin login, sin registro de
resultados. Generación, render y audio ocurren en el cliente; el objetivo a
largo plazo es que funcione offline. Pensada para **pizarra digital táctil**,
no para ratón.

No hay `package.json`, build, linter ni test runner. HTML/JS vanilla estático,
y conviene que siga así.

## Cómo validar un cambio

- **El parser** (`ejercicios/mini-lilypond-parser.js`) funciona en navegador
  (global `MiniLily`) y con `require()` en Node. Los tests históricos fueron
  scripts ad hoc; no hay suite en el repo.
- **La generación** se valida por **generación masiva** en un script
  desechable (p. ej. "no salen intervalos imposibles en el nivel 1"). Es el
  patrón a seguir ante cualquier cambio en un `-core.js`: generar miles de
  instancias y comprobar invariantes, no inspeccionar una a mano.
- **El motor a cuatro voces** tiene sus scripts en `tests/` (Node, sin
  dependencias): `masivo-cadencias.js [nivel] [n]` (miles de realizaciones
  pasadas por el comprobador independiente, frecuencia de fórmulas y
  variedad) y `sensibilidad-comprobador.js` (faltas deliberadas: prueba de
  que el comprobador detecta cada norma). **Al tocar una regla en
  `curriculum/Minimos-conduccion.md`, cambiar realizador y comprobador y
  añadir un caso de sensibilidad**; sin ese caso, «cero infracciones» no
  demuestra nada.

## Los documentos de diseño mandan

`docs/` va **por delante** del código. Ante una duda de comportamiento,
consultarlos; al implementar algo, actualizar su estado (`⟶ PENDIENTE`,
`⟶ ABIERTO`, `⟶ EN CURSO`, `⟶ HECHO`):

- `docs/Generador-ejercicios.md` — diseño del generador: jerarquía
  UD → familia → tipo → instancia, dinámica de UI (generar → escuchar →
  «Respuesta» → «Otro similar» / «Más difícil»), y su índice de decisiones
  abiertas (§6).
- `docs/Gramatica-mini-lilypond.md` — gramática EBNF del mini-LilyPond.
- `tests/validacion-lilypond.ly` — prueba de que el subconjunto compila en
  LilyPond real. Verificado con 2.24.3: sin errores ni avisos.
- `../curriculum/Plan-Armonia.md` §2 — tonalidades válidas por trimestre.

## Pipeline de render

```
generación (core.js) → cadena mini-LilyPond → MiniLily.parseVoice()
  → modelo interno de eventos → exportador a MEI → Verovio → SVG
```

- **mini-LilyPond**: solo notas/acordes/silencios de UNA voz, alteraciones
  inglesas (`cs` = do♯, `cf` = do♭), octava **absoluta** (`c'` = C4, do
  central), duraciones con arrastre, ligadura `~` y bar check `|`. Clave,
  tonalidad y compás **no** van en la cadena: son campos del JSON envolvente
  (`context`, `voices[i].clef`).
- Cada ejercicio es un objeto JSON con `voices[]` (una cadena `music` por
  voz), contexto, consigna y respuesta. Las anotaciones direccionan notas por
  **posición** (`voices[i]`, evento `j`), no por identificador.
- Las alturas se manejan como **letra + alteración + octava**, no MIDI, para
  preservar la enarmonía. MIDI solo para el audio.
- **Audio:** samples de piano vía soundfont-player
  (`ArmoniaEj.tocar([{midi, at, dur}])`, en `comun.js`).
- **Terceros en `public/vendor/`** (Verovio 6.3.0, soundfont-player, la
  fuente de alteraciones), no por CDN: copias literales, versión y origen
  en `vendor/README.md`.
  No volver a enlazar `verovio.org/javascript/latest`: es una build rodante
  de 7 MB sin CDN, y el plazo de carga fallaba en el aula.

## Estructura y patrón por familia

- `public/` es la raíz de lo que se publica (se copia tal cual a
  `_site/app/`); `docs/`, `design/` y `tests/` se quedan fuera. **Las rutas
  de este fichero y de `docs/` van relativas a `public/`.**
- `index.html` — menú principal. `curriculum.html` — vista de desarrollo de
  los mismos datos.
- `curriculum-data.js` — **fuente única del currículo** para ambas vistas.
  Para publicar un ejercicio se pone su URL en el modo (`id`/`au`/`ct`) de su
  familia; `null` = no disponible. **Qué ven los alumnos lo decide
  `publico:true` por unidad**: sin él, en la versión pública la unidad sale
  como «próximamente» aunque tenga ejercicios. `modo.js` (`'dev'` en el repo;
  `'publico'` lo escribe `sitio/montar.sh`) es lo único que distingue ambas
  versiones: **nunca ramificar comportamiento por URL ni por rama**, y no
  mantener diferencias de contenido entre `master` y `publico` (se fusionan
  enteras con `sitio/publicar.sh`). Excepción: las familias de las **unidades
  de repaso (UD 0 de ambos cursos)** no tienen modos sino un array `tipos`
  (variantes de identificación, cada una con su icono).
- `ejercicios/`, un patrón por familia:
  - `<familia>-core.js` — IIFE que expone un global (`Familia2`, `Familia3`,
    `U0Armaduras`, `U0Intervalos`, `U0Acordes`, `Contrapunto`) con TODA la
    lógica musical: generación, cálculo de respuestas, exportador a MEI.
    **Sin DOM.**
  - Una página HTML por variante/modo (`-id`, `-au`, `-ct`, o las variantes de
    la UD 0) que solo contiene UI: carga scripts, pinta, escucha botones.
  - `comun.js` (`ArmoniaEj`: init robusto de Verovio + audio) y `comun.css`,
    compartidos por todas las páginas. En `comun.css`, la fila
    partitura + acciones pasa a columna por debajo de 860 px **con
    `align-items:stretch`**: con `flex-start`, cada hijo tomaría el ancho de
    su contenido y la tira de armaduras (5000 px) desbordaba en móvil.
  - `tira-partitura.js` (`TiraPartitura`) — tira deslizante para series
    encadenadas: la serie entera se renderiza como un solo sistema
    (`breaks:none` + `adjustPageWidth`) y se centra un compás/glifo cada vez
    (anclas configurables), con velos y capas de respuesta en CSS (`.tira*`).
    Ojo: Verovio solo renderiza cambios de armadura vía
    `scoreDef/staffGrp/staffDef@keysig`.
  - `contrapunto-core.js` — motor genérico de contrapunto de 1.ª especie
    (reglas melódicas y armónicas), reutilizado por la familia 3 y pensado
    para las variantes con faltas y a tres voces.
  - `cuatro-voces-core.js` (`CuatroVoces`) — motor genérico SATB para todo
    4.º: modelo de acorde, enumeración de disposiciones y búsqueda bajo las
    normas/preferencias de `curriculum/Minimos-conduccion.md`. Las
    realizaciones **se buscan, no se escriben**. `cuatro-voces-check.js`
    (`CuatroVocesCheck`) es el comprobador independiente: **no comparte con
    el motor las funciones de transición**, a propósito.
  - `c4u0-cadencias-core.js` (`Cadencias`) — familia Cadencias de 4.º UD 0
    sobre el motor: catálogo de fórmulas, cláusulas de soprano, plantillas
    rítmicas (con anacrusa: `partial` en el JSON y en el parser), JSON, MEI
    y MIDI. Verovio descarta `<fb>` dentro de un `<harm>` con texto: los
    romanos con cifras van como `<rend>` + `<rend rend="sup|sub">`, y como
    Verovio los escribe en diagonal, cada página llama a
    `ArmoniaEj.apilarCifras(contenedor)` justo después de insertar el SVG.
  - `tonalidades.js` (en `public/`, global `TONALIDADES`) — tabla única de
    tonalidades por trimestre. Los cores nuevos la usan; los de 3.º UD 0
    aún llevan sus 4 tonalidades dentro (migración pendiente).
  - Ficheros **sin prefijo de curso/unidad = compartidos**; las familias
    nuevas van como `c<curso>u<ud>-<familia>-…` (`docs/Generador-ejercicios.md`
    §5.4). Los nombres antiguos (`unidad0-`, `familia2-`…) se renombrarán en
    una pasada aparte.

## Convenciones de dominio

- Las **tonalidades disponibles** dependen del trimestre; la UD 0 de 3.º queda fuera
  de esa progresión (su familia de armaduras recorre las 24 por diseño).
- Niveles de dificultad 1–3 por familia (cuando los hay); «Más difícil» sube
  de nivel.
- **Nunca 7 alteraciones** en armadura: se prefiere la enarmónica de 5.
- Tesitura controlada por líneas adicionales (`MAX_LEDGER_LINES`), calculadas
  por **pasos diatónicos** (letra + octava), no por semitonos.

## Capa visual ("editorial entintada")

`design/` contiene los mockups hi-fi (`mockup-menu.html`,
`mockup-ejercicio.html`) y un `README.md` de handoff con los tokens: verde
tinta `#2f4f42` (hover `#264137`), acierto terroso `#8f4a22`, serif Source
Serif 4 + sans Source Sans 3, radios 12–14 px, objetivos táctiles ≥56 px,
**sin sombras ni píldoras**. **Los mockups están en la tinta azul original
(`#31506e`)**: valen como referencia de todo menos del color.

Esa capa **ya está aplicada**: el menú vive en `index.html` (pestañas de curso
+ unidades acordeón) y las páginas de ejercicio se estilan íntegramente desde
`comun.css` — la barra superior entintada se consigue recolocando con grid la
cabecera plana `h1`/`.sub`/`a.back`/`.level`, sin tocar el HTML de las
páginas. `curriculum.html` usa los mismos tokens con densidad de inventario.
Ante cambios visuales, respetar los tokens de `design/README.md`.

**Móvil** (`design/RESPONSIVE.md`): un bloque `@media(max-width:719.98px)` al
final de `comun.css` y de `index.html` reorganiza sin tocar el marcado — en
ejercicios, `.ej-row` se disuelve con `display:contents` para que partitura,
ayuda y barra de acciones sean hijos de `main` y la barra (`order:1`,
`position:sticky`) quede pegada abajo; en el menú, el envoltorio de
`.ud-open` se disuelve igual para poner el numeral junto al título. Por
encima de 720 px no cambia nada. Los `:hover` van bajo `@media(hover:hover)`
(en táctil se quedarían pegados); el feedback táctil es `:active`.

**Pizarra** (≥ 1700 px **y** `pointer: coarse`, las dos): `initVerovio`
multiplica el `scale` de cada página por `VRV_FACTOR_PIZARRA` (1,5). Solo el
ancho no sirve de criterio: un monitor de 1920 px con ratón no es la pizarra.
Una página nunca debe compensar el factor por su cuenta. El ancho de
contenido (1240 px) no cambia con el dispositivo.

El color de tinta y sus derivados viven **solo en los bloques `:root`** de
`index.html`, `curriculum.html` y `ejercicios/comun.css`: tres sitios, ningún
hex suelto en el resto del CSS. Mantenerlo así.

**Alteraciones en texto**: siempre ♯ ♭ ♮ Unicode (nunca `#`/`b`). Source
Serif/Sans no traen esos glifos; los pone `vendor/fuentes/` (subconjunto de
Leland Text, `@font-face` con `unicode-range`, antepuesto a `--serif` y
`--sans` en los tres `:root`). Verovio usa la misma familia (`font:'Leland'`
en `comun.js`): **si se cambia la fuente musical, cambiar las dos**.

# Modelo de los ejercicios breves

> **Estado.** Sustituye a la parte general de `Generador-ejercicios.md` (§1–3, §5, §6),
> dividido el 2026-10-05 tras la revisión de uso en clase
> (`../../informes/2026-10-05-revision-tras-clase.md`). Lo propio de cada material está en
> `familias/`; el motor a cuatro voces, en `motor-cuatro-voces.md`. Marcas de estado:
> **`⟶ HECHO`**, **`⟶ PENDIENTE`** (con la fase del plan del informe), **`⟶ ABIERTO`**.

---

## 1. Cuatro ejes: material, consigna, presentación, nivel

El modelo de partida (cada familia con tipos *identificación / audición / canto*) se quedó
estrecho: casi ninguna familia encajaba en las tres casillas, las variantes id y au eran la
misma página con media docena de líneas cambiadas, y las variantes reales (Por quintas,
Bajo dado, Con grados…) acabaron en un esquema aparte, `tipos`, que pasó de excepción a
regla. ⟶ DECIDIDO (2026-10-05): un ejercicio se describe por **cuatro ejes
independientes**.

### 1.1. Material

**Qué se genera**: un intervalo, una tríada, un bajo cifrado, una cadencia, un
contrapunto. Es el `<material>-core.js` (sin DOM) y su documento en `familias/`. **No
depende de la unidad**: el mismo material sirve a consignas de unidades distintas.

### 1.2. Consigna

**Qué se pregunta** sobre ese material. Es la unidad del menú: cada botón es una consigna
(*Por quintas*, *Con grados*, *Bajo dado*, *Consonancia*…). Una **familia** es solo la
agrupación de consignas que el menú muestra junta dentro de una unidad, y es un dato de
`curriculum-data.js` (§3), no un fichero.

El mismo material con consignas distintas da ejercicios de unidades distintas: el
intervalo sirve a la UD 0 de 3.º (nombrar, invertir, grados) y a la UD 1 (consonancia).
Es lo que ya decía `Plan-Armonia.md` §5.1.

### 1.3. Presentación

**Qué se ve o se oye antes de la respuesta.** La instancia se genera **siempre completa**,
y la presentación es una **máscara** sobre ella: revelar es quitar la máscara (§2.4).

- **Ver** (por defecto): la partitura, con el dato si lo hay.
- **Oír**: solo audio; la partitura aparece al revelar. Es un **conmutador dentro del
  ejercicio**, no una entrada del menú, y solo existe **donde la pregunta es la misma**
  de oído. Si la pregunta cambia (el movimiento uniforme: «¿qué movimiento predomina?»),
  es otra consigna.

Dónde se ofrece «Oír» ⟶ DECIDIDO (2026-10-05; corregido el 2026-10-09): *Cadencias ·
Tipo*. No en *Bajo dado*, *Canto dado* ni *Prolongación*; tampoco, de momento, en
*Consonancia* (ahora una cadena: clasificar de oído diez intervalos seguidos es demasiado).
Lo demás, al diseñar cada material. **Se mantiene** activado de un ejercicio al siguiente
hasta que se quita, y va en la URL (`?oir=1`, §2.5).

**El canto** no es una presentación sino una actividad distinta: va como consigna donde
encaje (contrapunto a dos voces), no como casilla obligatoria.

**«Construir»** (dar el nombre y pedir el objeto, al 50 % en *Acordes*) ⟶ DECIDIDO: fuera.
Una presentación nunca cambia al azar entre una instancia y la siguiente.

### 1.4. Nivel

**Qué contenido puede salir.** Solo hay niveles donde el contenido crece de verdad
(catálogo de acordes y cadencias, modos, tonalidades): *Bajo cifrado*, *Cadencias*,
*Prolongación*, *Movimiento armónico*. La **notación** (clave, uno o dos pentagramas) no
es un nivel: se fija por consigna. ⟶ DECIDIDO (2026-10-05): **la UD 0 de 3.º, sin
niveles**; *Intervalos* y *Acordes* pasan a pentagrama doble (`familias/intervalos.md`,
`familias/acordes.md`).

Qué incluye cada nivel se escribe **una sola vez**, en el campo `niveles` de
`curriculum-data.js`; la página lo lee de ahí (`ArmoniaEj.ejercicio` busca la familia por
el nombre de fichero de la página). ⟶ HECHO (2026-10-06) en las páginas migradas (§2); solo
las familias ocultas de 3.º UD 1 siguen con su `LVL_NOTES`, hasta rediseñarlas.

### 1.5. Serie o sin fin

Por defecto un ejercicio es **sin fin**: otra instancia cada vez. Es una **serie** (N
instancias encadenadas) solo cuando el orden es contenido (el círculo de 5.as, la escala
cromática) o cuando importa cubrirlo todo sin repetir (las 12 armaduras al azar). Hoy,
solo *Armaduras*.

---

## 2. La página de ejercicio

Patrón común a todas las consignas, implementado **una vez**: `ArmoniaEj.ejercicio(cfg)` en
`comun.js` y el bloque «página común» de `comun.css`. La página aporta su marcado y cinco
funciones (generar, MEI, respuesta, audio y, si hace falta, retoques tras el render); el
nivel, el revelado y el audio son comunes.

⟶ HECHO (2026-10-06): *Bajo cifrado*, *Cadencias* (Tipo, Bajo dado, Canto dado),
*Prolongación* (los tres tipos) e *Intervalos* y *Acordes* de la UD 0 de 3.º (las seis
consignas; su contenido cambió en la fase 4 sin tocar la página). *Armaduras* no la usa —son series en tira, con su propio flujo— pero lleva la
pregunta visible encima. ⟶ PENDIENTE: las familias ocultas de 3.º UD 1, al rediseñarlas.

### 2.1. Capas, de arriba abajo

1. **Pregunta** — una línea, **encima de la tarjeta de la partitura**, siempre visible, en
   el cuerpo del texto y con las palabras clave en tinta (`.ej-main > .pregunta:first-child`:
   la regla depende de dónde está, no de la máscara, y así vale también en *Armaduras*). El orden
   de lectura es pregunta → partitura → respuesta; en la pizarra la clase lee primero qué
   se pide. (En las páginas sin migrar sigue debajo, o solo dentro de «Ayuda».)
2. **Partitura** — con el **dato** dentro (la tonalidad o el tipo como `<reh>` sobre el
   primer tiempo; `familias/cadencias.md` §7). No compite con la pregunta: está en otro
   sitio.
3. **Respuesta** — debajo, en su espacio reservado (§2.4). **No repite lo que ya está
   dibujado**: al revelar, lo que aparece en la partitura no se repite en el texto
   (`familias/cadencias.md` §7, «Tres capas»).

### 2.2. Nivel y ayuda

- **Nivel**: selector siempre visible en la cabecera («Nivel 1 2 3», botones), y bajo la
  partitura **una línea** con lo que incluye el nivel actual (`#nivelDesc`). Se puede
  elegir antes de empezar y bajar; cambiar de nivel genera otro ejercicio. Sustituye a
  «Más difícil», que solo subía, solo tras revelar, y cuyo efecto se explicaba dentro de
  la ayuda. Sin niveles, no aparece. ⟶ HECHO.
- **Ayuda**: plegada. Convenciones y cómo responder. Que no se abra ya no importa:
  pregunta y nivel están fuera, y el enlace a los apuntes va delante de ella (§3.1).

### 2.3. Botones

*Escuchar* · *Respuesta* · *Otro* (nueva instancia, mismo nivel; siempre visible, se
puede pasar sin revelar), más el conmutador «Oír» donde exista (§1.3, ⟶ HECHO 2026-10-09:
lo pone la página común si la consigna lleva `oir:true` en `curriculum-data.js`).
Táctiles, ≥ 56 px (ver `../CLAUDE.md`, capa visual). El audio: cada llamada a `tocar()` es
una reproducción completa, y *Respuesta*, *Otro* y el selector de nivel la cortan. ⟶ HECHO.

### 2.4. Revelar sin mover nada

Al revelar, la página saltaba por dos motivos: el panel de respuesta pasaba de
`display:none` a visible, y el SVG se volvía a renderizar más alto (cifrados, grados,
voces nuevas). Las dos cosas se resuelven con la máscara de §1.3. ⟶ HECHO (2026-10-06),
medido en Chrome sobre las siete páginas migradas, en escritorio y en móvil: ni la
tarjeta, ni la partitura, ni el panel, ni los botones se mueven un píxel.

- **Partitura**: se renderiza **una vez y completa**. Todo lo que es respuesta lleva una
  marca en el MEI —`type="resp"`; y `type="preg"` lo que solo se ve **antes** de revelar,
  como las cifras solas de *Bajo cifrado*, que al revelar ceden el sitio al romano con
  cifras— y se oculta con `visibility:hidden`; revelar es poner la clase `revelado` en
  `<body>`. Verovio vuelca el `@type` como **clase** en capas, notas, acordes, `<harm>` y
  `<reh>` (comprobado, también con varias: `type="americano resp"`). Los cores lo emiten
  con la opción `mascara` de su `toMEI` (las voces de `ocultas` pasan de `<space>` a una
  capa `resp`). `apilarCifras`, `circularGrados` y `corchetesTramo` miden igual con los
  elementos ocultos (`visibility:hidden` conserva la caja; `display:none`, no).
- **Líneas adicionales**: Verovio las dibuja **por pentagrama**, fuera de la nota
  (`g.ledgerLines`), así que una nota oculta dejaría las suyas a la vista.
  `ArmoniaEj.lineasAdicionales` marca `resp`, tras cada render, las que solo necesitan
  notas ocultas.
- **Texto**: la respuesta real se escribe al generar, **invisible** (`visibility:hidden`,
  que también la saca del árbol de accesibilidad), así que ocupa exactamente su tamaño
  aunque varíe (la lista de bajos de *Canto dado*).
- **Oír**: la máscara oculta la partitura entera; la tarjeta conserva su tamaño.

### 2.5. Parámetros en la URL

`?nivel=2` y `?oir=1` fijan el estado inicial. Sirven para enlazar desde los apuntes y las
fichas a un ejercicio concreto. ⟶ HECHO `?nivel` (2026-10-06): lo lee `ArmoniaEj.ejercicio`,
y el selector lo reescribe en la URL (`history.replaceState`), así que recargar conserva el
nivel. `?oir=1`, igual (⟶ HECHO 2026-10-09).

### 2.6. Sin registro de aciertos

La app es **plana**: no puntúa, no guarda resultados, no conoce a los alumnos. El
seguimiento se hace aparte, con tokens físicos en clase (`Plan-Armonia.md` §7). El nivel
y el conmutador pueden recordarse en `localStorage` como comodidad, nunca como dato.

---

## 3. Menú y datos

- **`curriculum-data.js`** es la fuente única: unidades (con `id`, el del apunte) →
  familias → **consignas**. ⟶ HECHO (2026-10-06): **un solo esquema**, `consignas` (una
  entrada por botón, con su icono y sus `apuntes`), sin `modos` id/au/ct; la familia lleva
  sus `niveles`. Cada consigna declara si admite «Oír» (`oir:true`).
- **Dónde está un ejercicio es un dato**, no un nombre de fichero: mover una familia a otra
  unidad (la Morfología a la UD 0 de 3.º, el curso que viene) es mover un bloque de
  `curriculum-data.js`, sin renombrar nada y sin cambiar URL.
- **Visibilidad** en cascada unidad → familia → consigna (`publico`), ⟶ HECHO; detalle en
  `../CLAUDE.md`.
- **Menú en filas** ⟶ HECHO (2026-10-06): cada familia es una fila —su nombre a la
  izquierda, sus consignas como botones a la derecha, que bajan de línea si no caben—, en
  lugar de tres columnas fijas. Admite cualquier número de familias y de consignas sin
  columnas cojas ni forzar tres por familia. En móvil, el nombre encima y los botones
  apilados, como antes. El menú se abre en una unidad con `#ud=c3u1` (desde los apuntes)
  o `#de=<fichero>` (al volver de un ejercicio).

### 3.1. Enlaces entre apuntes y ejercicios

⟶ DECIDIDO y HECHO (2026-10-06).

- **Granularidad.** Del ejercicio al apunte, **por consigna**: al subepígrafe que la explica
  (nivel «1.2»; el epígrafe «2» si no hay subepígrafe), a veces a dos. Del apunte al
  ejercicio, **en dos niveles**: «Ejercicios» en la cabecera de la unidad (abre el menú en
  ella) y, al final de cada epígrafe citado, una línea «Para practicar → Familia: consigna,
  consigna…».
- **Dónde se ven.** En el ejercicio, un botón «Apuntes · 1.2 Cifrado de grados» delante de
  «Ayuda», en la misma fila (no dentro: la ayuda no se abre); en el móvil, «Apuntes · 1.2»,
  para que la fila quepa. En el menú, «Apuntes →» junto al título de cada unidad. En la
  cabecera de los apuntes, textos cortos para que quepan en el móvil —«Ejercicios», y las
  dos descargas con su icono: «PDF», «Ejemplos»— y el nombre largo como `title`; si no
  caben, bajan a una segunda línea, sin menú desplegable. **El PDF, sin enlaces.** Todo se
  abre en la misma pestaña.
- **Una sola declaración**: `apuntes` de cada consigna en `curriculum-data.js`. La relación
  natural es «este ejercicio se explica aquí»; la inversa se deduce. El primer epígrafe de
  la lista es el del botón del ejercicio; todos reciben su «Para practicar».
- **Cómo llega a cada lado.** `construir.py` lee `curriculum-data.js` con Node; en las
  copias publicadas (`build/sitio/`, no en `build/` ni en el PDF) pone «Ejercicios» y los
  «Para practicar», y escribe `enlaces.js`: las unidades publicadas y el título de cada
  epígrafe citado. La app lo carga si existe: de ahí saca el texto del botón y sabe si la
  unidad está publicada. Sin él no pinta enlaces, así que **nunca enlaza a una página que
  no existe**, y la app sigue funcionando sola.
- **Publicación.** Un «Para practicar» solo enlaza consignas publicadas (la cascada de
  `publico`); «Ejercicios», solo si la app publica algo de la unidad; el botón «Apuntes»,
  solo si la unidad de apuntes está publicada.
- **Que no se rompa sin avisar.** Las anclas salen del título del epígrafe; si cambia,
  `construir.py` avisa de cada consigna que cite un ancla inexistente (en cualquier unidad,
  publicada o no). Al reorganizar los apuntes el curso que viene, el enlace se corrige en
  un solo sitio.

---

## 4. Arquitectura

**Cliente puro, sin backend**: generación, render y audio en el navegador. Es viable porque
no hay datos de usuario (§2.6).

- **Una página por consigna** sobre una capa común (`comun.js`, `comun.css`). No una app de
  una sola página: cada página es pequeña, se enlaza directamente y falla sola. Lo que se
  repite entre consignas de un material va a una UI compartida, como ya hace
  `prolongacion` (`prolongacion-ui.js`, y cada página solo fija su tipo).
- **Render**: Verovio (WASM) en el navegador, desde MEI generado (`../CLAUDE.md`, pipeline).
- **Audio**: samples de piano con soundfont-player. ⟶ PENDIENTE: empaquetar los samples
  (hoy se descargan de la red) y, con ello, el uso **offline** (¿PWA, *service worker*?).
- **Generación al vuelo**, no pregenerada: las combinaciones son demasiadas.

---

## 5. Representación: JSON + mini-LilyPond

⟶ DECIDIDO (y en uso). Cada instancia es un **objeto JSON** con el **contenido musical en
cadenas de mini-LilyPond**, un subconjunto estricto de LilyPond real
(`Gramatica-mini-lilypond.md`). Se descartaron MEI, MusicXML (verbosos, incómodos de
generar a mano), ABC y Plaine & Easie (cortos para la polifonía); el MEI es solo la
**salida** hacia Verovio. La discusión completa está en la historia de git de
`Generador-ejercicios.md` §5.1.

**En campos JSON** (contexto y semántica, no notación): clave, armadura y tonalidad,
compás y anacrusa (`context.partial`); familia, nivel, consigna; respuesta y anotaciones;
restricciones (tesitura, alteraciones).

**En cadenas mini-LilyPond**: alturas, duraciones, acordes, silencios, barras de compás;
**una cadena por voz** (`voices[i].music`, cada una con su `clef`), sin la polifonía
anidada de LilyPond. Al ser LilyPond válido, una cadena generada se pega en un `.ly` de
los apuntes sin retocarla (verificado: `../tests/validacion-lilypond.ly`).

- **Octava absoluta** como forma canónica: generación, tesitura y anotaciones sin estado
  previo.
- **Alturas como letra + alteración + octava**, no MIDI, para conservar la enarmonía; MIDI
  solo para el audio.
- **Anotaciones por posición** (`voices[i]`, evento `j`), estables porque música y
  anotaciones se generan a la vez.

```json
{
  "family": "triadas",
  "level": 1,
  "context": { "key": {"tonic": "a", "mode": "minor"}, "time": null },
  "voices": [ { "clef": "treble", "music": "<a c' e'>1" } ],
  "prompt": "¿Qué tipo de tríada es?",
  "answer": { "quality": "menor", "inversion": 0 }
}
```

---

## 6. Nombres de ficheros

⟶ DECIDIDO (2026-10-05): **por material**, sin curso ni unidad. Sustituye a la convención
`c<curso>u<ud>-` (antiguo §5.4), que **queda para los apuntes**, donde sí se corresponde
con una unidad. La ubicación en el menú es un dato (§3), así que el nombre no debe
llevarla: una URL que no cambia cuando se reorganiza el curso.

- Material: `<material>-core.js`, `<material>-<consigna>.html`, y su documento
  `familias/<material>.md`. Global en PascalCase.
- Motores y datos compartidos, como hasta ahora: `contrapunto-core.js`,
  `cuatro-voces-core.js`, `cuatro-voces-check.js`, `tonalidades.js`, `comun.js`.

⟶ HECHO (2026-10-06), en una pasada, con sus URL en `curriculum-data.js`, `../CLAUDE.md` y
los documentos (`familia2-intervalos-*` se fundió con `intervalos-*` y se retiró en la fase 4;
la página de *Bajo cifrado* es `bajo-cifrado-lectura.html`, y su validación,
`tests/masivo-bajo-cifrado.js`):

| Hoy | Después | Global |
|-----|---------|--------|
| `unidad0-armaduras-*` | `armaduras-*` | `U0Armaduras` → `Armaduras` |
| `unidad0-intervalos-*`, `familia2-intervalos-*` | `intervalos-*` (un solo core) | `U0Intervalos`, `Familia2` → `Intervalos` |
| `unidad0-acordes-*` | `acordes-*` | `U0Acordes` → `Acordes` |
| `c3u1-morfologia-*` | `bajo-cifrado-*` | `Morfologia` → `BajoCifrado` |
| `familia3-movimientos-*` | `movimientos-*` | `Familia3` → `Movimientos` |
| `c4u0-cadencias-*` | `cadencias-*` | `Cadencias` |
| `c4u0-prolongacion-*` | `prolongacion-*` | `Prolongacion` |

Cambian las URL públicas de las páginas; el QR apunta a la raíz y no le afecta.

---

## 7. Documentos

- **`Modelo-ejercicios.md`** (este) — lo común a todos los ejercicios. Corto: si crece por
  un material, eso va a su fichero.
- **`familias/<material>.md`** — diseño de cada material y sus consignas: qué se da, qué se
  pide, generación, niveles, validación. Con el mismo nombre que su código (§6). La
  unidad en la que aparece se menciona como dato, no organiza el documento.
- **`motor-cuatro-voces.md`**, **`motor-contrapunto.md`** (lo común a la conducción de la
  UD 1: faltas inyectadas, comprobador general, parejas del coro) y
  **`Gramatica-mini-lilypond.md`** — piezas compartidas.
- Las familias de la UD 1 que no son un solo material (`disposicion.md`,
  `paralelas-directas.md`, `consonancia.md`) llevan el nombre de la familia o la consigna.
- **`../../informes/`** — registro fechado de hitos y decisiones; no se reescribe. Los
  documentos de aquí, en cambio, describen el estado vigente y se reescriben.

---

## 8. Decisiones abiertas (índice)

Las cerradas están en los informes y en la historia de git; aquí solo las vivas.

**Comunes**
- [x] ~~Página común (§2)~~ → hecha, con todo lo publicado migrado salvo *Armaduras*,
      que solo toma la pregunta visible (2026-10-06).
- [ ] Migrar a la página común las familias ocultas de 3.º UD 1 (al rediseñarlas,
      fase 5).
- [x] ~~Un solo esquema, menú en filas, renombrado, enlaces con los apuntes (§3, §6)~~
      → hechos (2026-10-06).
- [x] ~~«Oír» y `?oir` (§1.3, §2.5)~~ → hechos (2026-10-09), en *Cadencias · Tipo*.
- [ ] Empaquetar los samples; mecanismo offline (§4).
- [x] ~~Migrar los cores de 3.º UD 0 a `tonalidades.js`~~ → hecho (2026-10-09).

**Por material**
- [x] ~~*Intervalos* (un generador, pentagrama doble, alterados de la escala), *Acordes*
      (sin niveles, pentagrama doble) y *Bajo cifrado* (romano sin alteración)~~ → hechos
      en la fase 4 (2026-10-09).
- [ ] *Cadencias*: «Oír» en Tipo; pesos y vetos de fórmulas; gesto no cadencial;
      revisar niveles en clase (`familias/cadencias.md` §3, §2, §8).
- [ ] *Prolongación*: revisar a ojo y oído realizaciones y pesos de la soprano
      (`familias/prolongacion.md` §6).
- [ ] **La UD 1 de 3.º** (fase 5; plan en `../../informes/2026-10-09-plan-ud1.md`):
      ~~5a motor (`motor-contrapunto.md`)~~ · ~~5b *Consonancia*
      (`familias/consonancia.md`)~~ · ~~5c *Disposición* (`familias/disposicion.md`)~~
      (hechos, 2026-10-09) · 5d *Movimientos*
      (`familias/movimientos.md`) · 5e *Paralelas y directas*
      (`familias/paralelas-directas.md`). Canto y oído, aparcados.
- [ ] Motor: revisar penalizaciones a ojo y oído (`motor-cuatro-voces.md`).

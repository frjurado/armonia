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

Dónde se ofrece «Oír» ⟶ DECIDIDO (2026-10-05): *Cadencias · Tipo* y *Consonancia*.
No en *Bajo dado*, *Canto dado* ni *Prolongación*. Lo demás, al diseñar cada material.

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
el nombre de fichero de la página). ⟶ HECHO (2026-10-06) en las páginas migradas (§2); las
demás siguen con el `LVL_NOTES` de su core hasta migrarlas.

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

⟶ HECHO (2026-10-06): *Bajo cifrado*, *Cadencias* (Tipo, Bajo dado, Canto dado) y
*Prolongación* (los tres tipos). ⟶ PENDIENTE: la UD 0 de 3.º (con los cambios de contenido
de la fase 4) y las familias ocultas de 3.º UD 1, que se rediseñan antes.

### 2.1. Capas, de arriba abajo

1. **Pregunta** — una línea, **encima de la tarjeta de la partitura**, siempre visible, en
   el cuerpo del texto y con las palabras clave en tinta (`.mascara .pregunta`). El orden
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
- **Ayuda**: plegada. Convenciones, cómo responder, y un enlace al apartado de los apuntes
  que lo explica. Que no se abra ya no importa: pregunta y nivel están fuera.

### 2.3. Botones

*Escuchar* · *Respuesta* · *Otro* (nueva instancia, mismo nivel; siempre visible, se
puede pasar sin revelar), más el conmutador «Oír» donde exista (§1.3, ⟶ PENDIENTE, fase 4).
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
nivel. `?oir`, con «Oír» (fase 4).

### 2.6. Sin registro de aciertos

La app es **plana**: no puntúa, no guarda resultados, no conoce a los alumnos. El
seguimiento se hace aparte, con tokens físicos en clase (`Plan-Armonia.md` §7). El nivel
y el conmutador pueden recordarse en `localStorage` como comodidad, nunca como dato.

---

## 3. Menú y datos

- **`curriculum-data.js`** es la fuente única del menú: unidades → familias → consignas.
  ⟶ PENDIENTE (fase 3): **un solo esquema**, el de `tipos` (una entrada por consigna, con
  su icono), y fuera los `modos` id/au/ct; cada consigna declara si admite «Oír» y la
  familia, sus `niveles`.
- **Dónde está un ejercicio es un dato**, no un nombre de fichero: mover una familia a otra
  unidad (la Morfología a la UD 0 de 3.º, el curso que viene) es mover un bloque de
  `curriculum-data.js`, sin renombrar nada y sin cambiar URL.
- **Visibilidad** en cascada unidad → familia → consigna (`publico`), ⟶ HECHO; detalle en
  `../CLAUDE.md`.
- **Menú en filas** ⟶ DECIDIDO (2026-10-05), ⟶ PENDIENTE (fase 3): cada familia es una
  fila —nombre y descripción a la izquierda, sus consignas como botones a la derecha, que
  bajan de línea si no caben—, en lugar de tres columnas fijas. Admite cualquier número
  de familias y de consignas sin columnas cojas ni forzar tres por familia. En móvil, como
  hoy.

---

## 4. Arquitectura

**Cliente puro, sin backend**: generación, render y audio en el navegador. Es viable porque
no hay datos de usuario (§2.6).

- **Una página por consigna** sobre una capa común (`comun.js`, `comun.css`). No una app de
  una sola página: cada página es pequeña, se enlaza directamente y falla sola. Lo que se
  repite entre consignas de un material va a una UI compartida, como ya hace
  `prolongacion` (`c4u0-prolongacion-ui.js`, y cada página solo fija su tipo).
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

⟶ PENDIENTE (fase 3), en una pasada, con sus URL en `curriculum-data.js`, `../CLAUDE.md` y
los documentos:

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
- **`motor-cuatro-voces.md`** y **`Gramatica-mini-lilypond.md`** — piezas compartidas.
- **`../../informes/`** — registro fechado de hitos y decisiones; no se reescribe. Los
  documentos de aquí, en cambio, describen el estado vigente y se reescriben.

---

## 8. Decisiones abiertas (índice)

Las cerradas están en los informes y en la historia de git; aquí solo las vivas.

**Comunes**
- [x] ~~Página común (§2)~~ → hecha, con *Bajo cifrado*, *Cadencias* y *Prolongación*
      migradas (2026-10-06).
- [ ] Migrar a la página común la UD 0 de 3.º (fase 4, con sus cambios de contenido) y
      las familias ocultas de 3.º UD 1 (al rediseñarlas).
- [ ] Un solo esquema en `curriculum-data.js`, menú en filas, renombrado (§3, §6). (fase 3)
- [ ] `?oir` y enlaces cruzados apunte ↔ ejercicio (§2.5; `?nivel` ya está). (fase 3)
- [ ] Empaquetar los samples; mecanismo offline (§4).
- [ ] Migrar los cores de 3.º UD 0 a `tonalidades.js` (se hace al fundirlos, fase 4).

**Por material**
- [ ] *Intervalos*: fundir los dos generadores; pentagrama doble; consigna Consonancia
      (`familias/intervalos.md`). (fase 4)
- [ ] *Acordes*: quitar *construir* y los niveles (`familias/acordes.md`). (fase 2 / 4)
- [ ] *Bajo cifrado*: romano al revelar con o sin la alteración del cifrado
      (`familias/bajo-cifrado.md` §1).
- [ ] *Cadencias*: «Oír» en Tipo; pesos y vetos de fórmulas; gesto no cadencial;
      revisar niveles en clase (`familias/cadencias.md` §3, §2, §8).
- [ ] *Prolongación*: revisar a ojo y oído realizaciones y pesos de la soprano
      (`familias/prolongacion.md` §6).
- [ ] *Movimiento armónico*: preferencias puntuadas en `contrapunto-core.js` y rediseño con
      este modelo; faltas de la UD 1 (`familias/movimientos.md`). (fase 4)
- [ ] Motor: revisar penalizaciones a ojo y oído (`motor-cuatro-voces.md`).

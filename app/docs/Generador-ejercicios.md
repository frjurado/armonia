# Generador de ejercicios breves — Diseño

> **Estado.** Borrador de diseño. Complementa `Plan-Armonia.md` (§5) y desarrolla el modelo
> de ejercicios breves hacia una herramienta concreta. Las decisiones abiertas y los agujeros
> de diseño se marcan con **`⟶ ABIERTO`** y se recopilan al final (§6).

---

## 1. Jerarquía de conceptos

```
Unidad Didáctica
  └─ Familia de ejercicios        (un esquema/escenario concreto)
       └─ Tipo(s): identificación / audición / canto
            └─ Instancia generada  (aleatoria o secuencial, transportada)
```

- **Familia:** un escenario de ejercicio bien definido (p. ej. "identificar tríadas",
  "intervalos a dos voces"). Una UD puede tener **varias familias**.
- **Tipos:** cada familia puede ofrecer variantes de **identificación**, **audición** y/o
  **canto**, pero **no todas incluyen los tres**. La selección de tipos es propia de cada familia.
- **Andamiaje:** dentro de una UD, las familias se ordenan de modo que los **tipos de
  actividad van entrando de forma progresiva**. En la UD 1, el andamiaje recorre las **tres
  primeras** familias: la 1.ª es solo identificación; la 2.ª añade audición; la 3.ª añade
  canto. La 4.ª familia (faltas) ya no introduce un tipo nuevo, sino que reutiliza los tipos
  ya disponibles aplicándolos a un objetivo distinto. (Ver §4.)
- **Instancia:** un ejercicio concreto, generado al vuelo y transportado a una de las
  tonalidades válidas en ese momento del curso (según `Plan-Armonia.md` §2).

---

## 2. Parámetros comunes de generación

Parámetros que combinan las familias para producir variantes e instancias:

- **Número de voces:** 2 a 4 (se empieza por 2).
- **Disposición / clave:** un solo pentagrama (Sol o Fa) o dos (Sol/Fa); voces repartidas
  entre claves.
- **Tonalidad:** restringida a las **válidas en cada momento** (trimestre actual y anteriores).
- **Accidentales permitidos:** limitados según la UD (en UD 1, solo la **sensible del modo
  menor**).
- **Voces resaltadas / distractoras:** en variantes a 3+ voces, se resaltan las voces sobre
  las que se pregunta y el resto actúa de distractor.
- **Longitud:** nº de acordes/notas del fragmento (afecta a los encadenados).

⟶ ABIERTO: lista cerrada de parámetros y sus rangos por familia. Esto será la base del
"formato de modelos" pendiente en `Plan-Armonia.md` §5.

---

## 3. Dinámica de interacción (UI)

Patrón común a todas las familias:

1. Se **genera** una instancia aleatoria y se **muestra** (partitura vía Verovio; en audición,
   solo suena).
2. Un botón **"Mostrar respuesta"** revela la solución.
   - En audición, además, se **muestra la partitura** al revelar.
   - En ejercicios **encadenados** (un fragmento de N notas con una respuesta por cada nuevo
     intervalo/movimiento), las respuestas se revelan **una a una**.
3. Cuando está resuelto, aparecen dos botones:
   - **(a) Otro similar** — nueva instancia del mismo nivel.
   - **(b) Otro más difícil** — instancia similar pero de mayor dificultad.

**Dificultad (botón b):** se sube por "escalas" de dificultad.
⟶ ABIERTO: definir los **ejes/escalas de dificultad** (¿nº de voces? ¿amplitud de intervalos?
¿más accidentales? ¿fragmentos más largos? ¿tonalidades más lejanas?) y cómo se combinan.

**Sin registro de aciertos.** La aplicación es **plana**: no puntúa, no guarda resultados, no
conoce a los alumnos. Es una herramienta de práctica/proyección. El seguimiento se hace
**aparte**, con **tokens físicos** repartidos en clase, cuyo conteo vive en otra app de tablet
que sí tiene a los alumnos registrados (ver `Plan-Armonia.md` §7).

---

## 4. Ejemplo: Unidad 1 (movimientos entre voces y faltas)

Cuatro familias. La práctica arranca a **dos voces**; las familias 2-4 añaden una **variante
a tres voces** (ver §4.5).

### 4.1. Familia 1 — Identificación de tríadas *(solo identificación)*

> **Reubicada.** Esta familia se trasladó a la **Unidad 0** como familia *Acordes*
> (§4 bis.3), generalizada: dos sentidos (ver/construir), cifrado americano e
> inversiones como variantes, y niveles por clave/disposición.

- Un solo pentagrama (clave de Sol **o** de Fa).
- Tonalidad entre las válidas; accidentales solo la **sensible del modo menor**.
- Se muestra un **acorde tríada** → identificar **mayor / menor / disminuido / aumentado**.
- **Variante:** mostrar la tríada **invertida** → identificar **tipo + inversión**.

### 4.2. Familia 2 — Intervalos a dos voces *(identificación + audición)*

- Clave de sol, luego de fa, luego las dos; tonalidades válidas; accidentales limitados (sensible).
- Se muestra un **intervalo a dos voces** → indicar **amplitud** (p. ej. "3.ª Mayor") y
  **tipo** (consonancia perfecta / imperfecta / disonancia). Respecto a la amplitud, pueden ser
  intervalos compuestos (9.ª, 10.ª...): a partir de la 10.ª, mostrar primero su versión simple (3.ª), 
  y en menor tamaño/color secundario el intervalo completo.
- **Versión auditiva:** suena **sin mostrar**; se muestra **después**, al revelar la solución. 
  En el caso auditivo, mostrar primero/más resaltado el tipo (consonancia, etc.) que la amplitud.

### 4.3. Familia 3 — Fragmentos a dos voces *(identificación + audición + canto)*

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

### 4.4. Familia 4 — Detección de faltas

- Similar a las anteriores, pero el objetivo es identificar **faltas** (p. ej. **5.ª paralelas**).
⟶ ABIERTO: ¿qué faltas entran en UD 1 (5.ª/8.ª paralelas, directas…)? ¿Mismos tipos
(id/audición/canto) que la familia 3?

### 4.5. Variante a tres voces (familias 2-4)

- Tres voces: **dos en clave de Sol, una en Fa**.
- Se **resaltan dos voces** (cualquier combinación) → mismo planteamiento que a dos voces,
  pero con una **voz distractora**.

### Resumen de tipos por familia

| Familia | Identificación | Audición | Canto | Variante 3 voces |
|---------|:---:|:---:|:---:|:---:|
| 1. Tríadas | ✓ | — | — | — |
| 2. Intervalos | ✓ | ✓ | — | ✓ |
| 3. Fragmentos | ✓ | ✓ | ✓ | ✓ |
| 4. Faltas | ✓ | ✓ (?) | ✓ (?) | ✓ |

⟶ ABIERTO: confirmar las casillas con "(?)" de la familia 4.

---

## 4 bis. Unidad 0 — preliminares (armaduras, intervalos, acordes)

Unidad «0» de repaso, previa a la UD 1 del curso 3.º. Difiere del esquema general (§1):
**no hay tipos de audición ni canto** —todo es identificación implícita— y, a cambio, cada
familia ofrece **tres variantes** de ejercicio, cada una con su icono propio en el menú
(campo `tipos` en `curriculum-data.js`, en lugar de `modos`). Ficheros:
`ejercicios/unidad0-<familia>-core.js` (globales `U0Armaduras`, `U0Intervalos`,
`U0Acordes`) + una página HTML por variante. Solo la familia de acordes tiene niveles de
dificultad.

### 4b.1. Armaduras *(sin niveles)*

Series **encadenadas de 12 armaduras** (siempre las 12 clases de altura, sin repetir), en
clave de Sol, desveladas una a una («Respuesta» → «Siguiente»; en *Por quintas*, ya como
tira deslizante con avance automático — ver abajo). Conmutadores **inclusivos**
de mayor/menor (al menos uno activo). Nunca se usan 7 alteraciones: se prefiere siempre la
enarmónica de 5 (Re♭ mayor antes que Do♯ mayor); el caso de 6 se decide por variante.

- **Por quintas** (icono de reloj sin manecillas, evocando el círculo): se parte de 2–5
  bemoles y se avanza hacia los sostenidos, o al revés (2–5 sostenidos y de vuelta); se
  muestra la **armadura** y se pide la **tonalidad** (mayor y/o menor según los
  conmutadores). Con 6 alteraciones: sostenidos en sentido horario, bemoles en antihorario.
  **Presentación en tira** (implementada): la serie entera se renderiza de una vez como
  **tira continua** —un solo sistema, un compás vacío por armadura— y se desliza centrando
  la armadura actual, con lo anterior/posterior oculto tras velos laterales; la respuesta
  se superpone en capas HTML absolutas (mayor **encima** del pentagrama, menor **debajo**),
  no en el SVG, y tras una pausa la tira avanza sola al siguiente compás. El deslizamiento
  vive encapsulado en `ejercicios/tira-partitura.js` (módulo `TiraPartitura`, reutilizable
  para otras series encadenadas, p. ej. la variante cromática). Nota técnica: Verovio solo
  renderiza el cambio de armadura si va como `scoreDef/staffGrp/staffDef@keysig` (las
  formas `scoreDef@keysig` y `scoreDef/keySig` se ignoran), y el cambio a 0 alteraciones
  produce un `g.keySig` vacío (sin becuadros de cortesía) cuya ancla se interpola.
- **Cromático** (icono de escalones): **doble escala cromática** — la tónica mayor parte
  de una nota blanca y asciende o desciende por semitonos toda la octava, con su relativa
  menor en paralelo (Do M/La m, Re♭ M/Si♭ m…). Se muestran los **nombres** (mayor y/o
  menor según los conmutadores, que ya no cambian la serie) y se pide la **armadura**,
  dibujada al revelar. Subiendo se prefieren tónicas con sostenido hasta un máximo de 6
  alteraciones; bajando, con bemol. **Presentación en tira** invertida respecto a las otras
  variantes: los nombres van superpuestos (pregunta, en tinta) y las armaduras viajan
  **ocultas** en la tira (`visibility:hidden` sobre su `g.keySig`, para no ver nunca las
  siguientes antes de tiempo); «Respuesta» hace visible la del compás centrado (para
  Do M/La m, sin glifo, se muestra el rótulo «sin alteraciones») y tras la pausa se
  desliza a la siguiente.
- **Aleatorio** (icono de dado): las 12 armaduras barajadas, sin repetición; se muestra
  la **armadura** y se pide la **tonalidad**, como en *Por quintas* —solo cambia el
  orden— y con la misma presentación en tira deslizante (con 6 alteraciones, enarmónico
  al azar). *(Simplificado: antes cada paso preguntaba tonalidad o armadura al azar.)*

### 4b.2. Intervalos *(sin niveles)*

Intervalos **armónicos** en clave de Sol, del unísono a la 8.ª (sin compuestos), escritos
**a dos voces** en un pentagrama (dos capas: plicas arriba/abajo, en blancas). Fuera de
tonalidad: alteraciones sueltas de **un solo ♯/♭** (sin dobles) y **sin intervalos doble
aumentados/disminuidos**; los aumentados/disminuidos simples sí salen, amortiguados a ~25 %
de los casos (sin amortiguar dominarían la generación libre).

- **Identificación** (icono de dos notas simultáneas con plicas hacia fuera: la superior
  arriba, la inferior abajo): nombrar amplitud y calidad («3.ª menor»).
- **Con inversión** (icono de flechas cruzadas): amplitudes de 2.ª a 7.ª; se pide la
  inversión y, al revelar, aparecen las notas invertidas —segundo compás, oculto como
  `<space>` hasta entonces (layout estable)— y el intervalo resultante (do–mi → mi–do,
  6.ª menor).
- **Con grados** (icono de número con circunflejo): el intervalo pertenece a una
  tonalidad (armadura + nombre; las 4 del trimestre 1); se piden el intervalo y el
  **grado** de cada nota, que al revelar se escriben encima/debajo del pentagrama
  (`<dir>` de MEI, «4̂»). Único accidental posible: la sensible del menor.

### 4b.3. Acordes *(niveles por clave/disposición)*

Reubica la antigua **familia 1** (tríadas de la UD 1). Tres variantes, paralelas a las de
Intervalos (simple · inversión · grados). En las dos primeras, tríadas **aisladas**, sin
tonalidad: fundamental libre con alteración simple (se rechazan los acordes que exigirían
dobles alteraciones, y las fundamentales Mi♯/Si♯/Fa♭/Do♭), y **dos sentidos** al 50 %:
*ver* el acorde y nombrarlo, o *construirlo* mentalmente a partir del dato y comprobarlo
al revelar (en este sentido el audio se retiene hasta la respuesta).
Niveles: **1** clave de Sol y **2** clave de Fa (posición cerrada); **3** posición abierta
en pentagrama doble: el bajo en clave de Fa y las otras dos notas en clave de Sol, apiladas
ascendentes desde Do4, de modo que **nunca distan más de una 8.ª entre sí** (la distancia
grande, si la hay, queda entre el bajo y ellas).

- **Tipo y cifrado** (icono de tríada: tres notas apiladas con plica arriba): tríada en
  estado fundamental → tipo (mayor / menor / aumentada / disminuida) **y** cifrado
  americano (D♭m, F°, C+…); o cifrado (texto grande en la tarjeta) → acorde. Fusiona las
  antiguas variantes *tipo* y *cifrado*: el cifrado no es más que fundamental + tipo.
  **En el nivel 3 solo hay sentido *ver***: el sentido *construir* tiene sentido cuando
  la disposición revelada es la única posible (posición cerrada); en posición abierta es
  arbitraria y solo se podrían contrastar nombres de notas, con lo que las dos claves no
  añadirían dificultad, solo ruido.
- **Inversiones** (icono textual 6/4 apilado, como el bajo cifrado): acorde (cualquier
  estado) → inversión + cifrado («1.ª inversión · 6/3»; en el detalle, el cifrado americano
  con el bajo tras la barra, C/E); o bajo dibujado con sus cifras (`<harm><fb>` de MEI;
  solo 6/3 o 6/4) **más el tipo de tríada** → el resto del acorde. El tipo es necesario
  para que el ejercicio tenga respuesta única: un 6/3 sobre Mi, sin tonalidad, puede ser
  Do mayor, Do♯ menor o Do♯ disminuido. Se mantienen los dos sentidos en los tres niveles:
  leer un bajo cifrado en clave de Fa es precisamente el ejercicio, y el pentagrama doble
  es su medio natural.
- **Con grados** (icono «IV»: aquí el grado se nombra en romanos): tríada diatónica en **estado
  fundamental** dentro de una tonalidad (armadura en la partitura + nombre; las 4 del
  trimestre 1, como en Intervalos con grados) → modo, grado de la fundamental y tipo
  («Modo mayor · II grado · Tríada menor»; en el detalle, cifrado y nombres). Solo sentido
  *ver*. En **menor, la sensible aparece solo en V y VII** (mayor y disminuida); **el III se
  toma de la escala natural** (mayor), no aumentado: es lo que verán en 3.º y evita
  explicar el III+. Es la única variante de la familia con armadura en el MEI (`keysig`),
  y en ella solo llevan accidental las notas ajenas a la armadura (la sensible).
  ⟶ ABIERTO: ampliar a inversiones (habría que hallar la fundamental antes; hoy es tarea
  de la variante *Inversiones*).

---

## 5. Esbozo técnico (muy preliminar)

Arquitectura: **app web única, de cliente puro, sin backend y offline**. Es viable porque
**no hay datos de usuario** (la app es plana, §3): nada que persistir en servidor, ninguna
sesión, ningún login. Todo —generación, render y audio— ocurre en el navegador.

- **Renderizado de partitura:** Verovio (toolkit JS/WASM) → SVG en la página. Verovio acepta
  varios formatos de entrada; la elección condiciona todo el pipeline (ver §5.1).
- **Audio: samples.** Reproducción basada en muestras reales (no síntesis MIDI básica), por
  calidad de timbre para los ejercicios de audición.
  ⟶ ABIERTO: librería/banco de samples concreto (p. ej. soundfont vía WebAudio) y peso de los
  assets para el empaquetado offline.
- **Motor de generación (JS, en cliente):** las combinaciones posibles en la práctica son
  **múltiples**, así que se generan **al vuelo en el cliente**, no por pre-generación.
  - **Modelos** registrados en la **representación propia ligera tipo LilyPond** (ver §5.1) +
    sus anotaciones (familia, parámetros, consigna, restricciones tonales, respuesta).
  - **Generación algorítmica** para las familias que no usan modelos fijos.
  - **Transporte** a las tonalidades válidas como paso común tras generar.
  - **Exportador a MEI** para alimentar Verovio en vivo. El **exportador a LilyPond/Typst**
    (papel) es un camino aparte y **posterior**: ahí los ejemplos serán **muchos menos** y no
    necesitan generación en cliente.
- **Estado / UI: una sola app** que engloba todas las familias y UD (selector interno), con
  los botones de §3. No piezas HTML independientes por familia.
- **Offline:** sí. Al ser cliente puro + WASM y sin datos de usuario, se puede empaquetar para
  uso sin red. Coincide con las versiones sin pantalla de `Plan-Armonia.md` §5/§7.
  ⟶ ABIERTO: mecanismo concreto de empaquetado (¿app instalable/PWA, bundle local, *service
  worker* para cachear WASM + samples?).

### 5.1. Formato de entrada para Verovio

Verovio renderiza desde varios formatos. La decisión importa porque el formato es a la vez
(a) lo que **generamos por código**, (b) lo que **almacenamos como "modelo"**, y (c)
potencialmente el **origen único** que también alimente el render para papel. Opciones:

- **MEI** (formato nativo de Verovio). XML musicológico muy expresivo: cubre todo lo que
  podamos necesitar (varias voces, articulaciones, anotaciones, *control events*) y es lo que
  Verovio entiende mejor, sin conversión interna. A favor: máxima fidelidad y capacidad de
  **adjuntar metadatos/etiquetas** (útil para marcar la voz a resaltar, la respuesta, el tipo
  de movimiento…). En contra: **muy verboso**, incómodo de generar/editar a mano; conviene
  generarlo programáticamente.
- **MusicXML.** XML estándar de intercambio, muy soportado por editores (MuseScore, Finale,
  Sibelius). A favor: interoperable, podrías **componer modelos en un editor visual** y
  exportarlos. En contra: también verboso; Verovio lo **convierte a MEI internamente**, así
  que añade una capa; menos cómodo para incrustar metadatos propios.
- **ABC.** Notación de texto compacta y legible por humanos. A favor: **muy fácil de generar
  y de leer**, ideal para fragmentos cortos; cómodo de teclear. En contra: pensado sobre todo
  para melodía monódica + acordes de cifrado; la **polifonía a varias voces y el control fino**
  (claves repartidas, resaltados) resultan torpes o limitados.
- **Plaine & Easie (PAE).** Formato **ultracompacto para incipits** (una línea de texto por
  voz). A favor: **idóneo para fragmentos breves** como los nuestros; trivial de generar
  algorítmicamente. En contra: pensado para **incipits monódicos**; el soporte multivoz es
  limitado, así que probablemente solo sirva para los casos más simples (familia 1, intervalos
  sueltos).
- **Humdrum (**\*\*kern).** Formato columnar orientado a análisis. A favor: potente para
  **análisis y para razonar sobre intervalos/movimientos** (que es justo lo que preguntan
  nuestros ejercicios), y Verovio lo renderiza. En contra: menos habitual, curva de entrada
  algo mayor.

**Sobre el origen único.** Es un objetivo deseable: un solo dato que alimente **Verovio (web)**
y el **render para papel**. Aquí hay dos familias de estrategias:

1. **Origen = formato musical estándar** (MEI o MusicXML) y dos renderizadores que lo consuman:
   Verovio para web, y para papel un camino tipo MusicXML→LilyPond (o MEI→…). Encaja con
   editores visuales; el reto es que el **pipeline de papel actual es Typst + LilyPond**, cuya
   entrada natural no es MEI/MusicXML.
2. **Origen = representación propia y neutra** del que **generamos cada salida**: MEI/ABC/PAE
   para Verovio **y** LilyPond para Typst. Más trabajo inicial (escribir los "exportadores"),
   pero **encaja mejor** con el modelo de generación de §5 y con tu pipeline de papel, y
   permite incrustar la lógica del ejercicio (qué se resalta, cuál es la respuesta) sin
   pelearse con un formato ajeno.

**Decisión: opción 2 — representación propia.** El contenido musical de estos ejercicios es
**sencillo** (tríadas, intervalos sueltos, fragmentos breves a 2-3 voces: acordes y melodías
superpuestas), así que no hace falta una estructura rica como MEI/MusicXML.

- **Sintaxis:** una representación de texto **ligera, tipo LilyPond** (o un *mock* inspirado
  en ella), en vez de estructuras JSON excesivamente anidadas. Cómoda de escribir, de leer y
  de generar algorítmicamente; cercana al pipeline de papel.
- **Etiquetas del ejercicio** (voz a resaltar, respuesta esperada, tipo de movimiento…) se
  adjuntan como **anotaciones ligeras** sobre esa misma representación.
- **Exportadores** desde la representación propia hacia: (a) **MEI** como salida principal
  para Verovio (web), reservando PAE/ABC para los casos más simples si compensa; y
  (b) **LilyPond** para Typst (papel).

⟶ ABIERTO: definir la **gramática concreta** de la sintaxis ligera (qué subconjunto de
LilyPond se imita, cómo se marcan voces/claves/resaltados/respuestas).
⟶ ABIERTO: decidir si se **reutiliza LilyPond directamente** como representación propia (con
un subconjunto acotado) o se usa un *mock* propio inspirado en su sintaxis pero más restringido.
⟶ HECHO (y reubicado): el prototipo de la familia 1 (`familia1-triadas.html`, núcleo
inline) implementó el pipeline **representación ligera tipo LilyPond → exportador a MEI →
Verovio**, audio por samples y los botones "otro similar / más difícil". Hoy vive,
generalizado, en la familia **Acordes de la Unidad 0** (§4 bis.3:
`ejercicios/unidad0-acordes-core.js` + páginas `-tipo` / `-inversion` / `-grados`);
la página original se retiró.
⟶ EN CURSO: prototipo de la familia 2 (intervalos a dos voces, §4.2) en
`ejercicios/familia2-intervalos-id.html` (identificación) y `ejercicios/familia2-intervalos-au.html`
(audición), con la lógica de generación compartida en `ejercicios/familia2-intervalos-core.js`.
Mismo pipeline que la familia 1, generalizado a **varios pentagramas** (`voices[]`, como prevé
§5.2) para el nivel 3. La versión de audición no muestra la partitura hasta revelar la
respuesta, como pide §4.2; en su respuesta se invierte el orden respecto a la de
identificación (tipo grande primero, amplitud pequeña después). Amplitud + calidad + categoría
(perfecta/imperfecta/disonancia) verificadas por generación masiva, incluidos los intervalos
compuestos. Enlazado en el menú (`index.html`).

**Niveles de la familia 2** (ajustados tras revisión):
- **Nivel 1** — modo mayor, clave de Sol; amplitudes 1.ª a 8.ª (unísono a octava incluidos).
  Únicos intervalos aumentado/disminuido posibles: 4.ª aumentada / 5.ª disminuida (el único
  tritono de la escala mayor natural). Verificado por generación masiva: no aparece ningún otro.
- **Nivel 2** — añade el modo menor (con la sensible: pueden salir otros intervalos
  aumentados/disminuidos, p. ej. 2.ª aumentada) y la clave de Fa. Amplitudes hasta la **12.ª**
  (intervalos compuestos): la respuesta muestra la forma reducida en grande (p. ej. "5.ª justa")
  y, si es compuesto, la amplitud real en pequeño y en gris al lado (p. ej. "(12.ª justa)").
- **Nivel 3** — **dos claves a la vez**: una nota en clave de Fa y otra en clave de Sol, cada
  una con su propia tesitura. Incluye el unísono entre claves distintas (misma altura real,
  notada de dos formas). Se evitan los cruces (la voz en Fa nunca puede sonar más aguda que la
  de Sol). Al usar dos pentagramas independientes, la mayoría de los intervalos resultan
  compuestos, a veces muy amplios.

**Tesitura / líneas adicionales:** la familia 1 (tríadas) limita a **1 línea adicional** por
encima/debajo del pentagrama. La familia 2 necesita más margen —desde el nivel 2 hay intervalos
compuestos hasta la 12.ª, y en el nivel 3 cada nota vive en su propio pentagrama— así que el
límite aquí es de **2 líneas adicionales** (`MAX_LEDGER_LINES` en
`familia2-intervalos-core.js`), calculado por pasos diatónicos (letra+octava) desde la línea
límite de cada clave, no por semitonos, ya que eso es lo que determina cuántas líneas ocupa
realmente una nota en el pentagrama.

### 5.2. Estructura de la representación interna (JSON + mini-LilyPond)

Tras el prototipo, la dirección recomendada es **híbrida**: un **objeto JSON** que envuelve
los datos del ejercicio, con el **contenido musical como cadena de texto en un subconjunto
acotado de LilyPond** ("mini-LilyPond"). Cada parte va donde es más cómoda de generar, anotar
y exportar.

**Qué va como campo JSON (estructura/contexto), no en la cadena musical:**

- **Clave, armadura/tonalidad y compás (métrica).** Son contexto, los necesita el generador
  (para restringir tonalidades, transportar) y ambos exportadores los emiten de forma trivial
  (`\clef`, `\key`, `\time` para LilyPond; atributos de `scoreDef` para MEI). Meterlos en la
  cadena obligaría a parsearlos de vuelta.
- **Metadatos del ejercicio:** familia, nivel, **consigna**, y **respuesta/anotaciones**
  (calidad, inversión, voces resaltadas, intervalos/movimientos esperados…). Es semántica del
  ejercicio, no notación; debe poder **referenciar notas o voces por índice/id**.
- **Restricciones:** tesitura (rango), accidentales permitidos, etc.

**Qué va como cadena mini-LilyPond (contenido musical):**

- **Alturas, duraciones, acordes y silencios**, p. ej. `<a c' e'>1`, `e'4 f'4 g'2`, `r4`.
- Para varias voces, **un campo por voz** (array `voices`), cada uno con su clave y su cadena;
  evita la sintaxis de polifonía anidada de LilyPond (`<< { } \\ { } >>`), más difícil de
  generar y de anotar.

**Por qué un subconjunto de LilyPond real (y no un *mock* libre):** si la cadena es **LilyPond
válido**, el **exportador a papel es casi gratis** —se envuelve con el `\clef`/`\key`/`\time`
de los campos JSON y se pasa a LilyPond/Typst—. El subconjunto se limita al **núcleo de
notación** (notas, alteraciones `is`/`es`, octavas, duraciones, `<>` acordes, `r` silencios,
barras); **se excluye** todo lo "de programa" de LilyPond (variables, `\override`, `\markup`,
includes). Para la web, un **parser pequeño** convierte ese mini-LilyPond al modelo interno de
notas, que alimenta el exportador a MEI (ya implementado en el prototipo).

**Notación absoluta como forma canónica.** Internamente, **absoluta** (cada nota lleva su
octava explícita), no relativa (`\relative`):

- La generación aleatoria y el cálculo de tesitura/voces son más simples sin estado previo.
- Las **anotaciones** pueden **direccionar notas concretas** (índice/id) sin depender de la
  nota anterior.
- El **transporte** sigue siendo directo (desplazar intervalo + ajustar la tonalidad del campo
  JSON), y conviene guardar las alturas como **letra + alteración** (no MIDI) para **preservar
  el enarmonizado** correcto.
- La **relativa** puede admitirse como *azúcar* de entrada para modelos escritos a mano, que se
  **normaliza a absoluta** al cargarse.

Esquema orientativo de un modelo/instancia:

```json
{
  "family": "triadas",
  "level": 1,
  "context": { "key": {"tonic": "a", "mode": "minor"}, "time": null },
  "voices": [ { "clef": "treble", "music": "<a c' e'>1" } ],
  "prompt": "¿Qué tipo de tríada es?",
  "answer": { "quality": "menor", "inversion": 0 },
  "constraints": { "rangeMidi": [60, 81], "accidentals": "soloSensibleMenor" }
}
```

⟶ EN CURSO: gramática especificada en `Gramatica-mini-lilypond.md` (EBNF, tablas léxicas,
ejemplos). Falta escribir el parser web.
⟶ DECIDIDO: anotaciones por **direccionamiento posicional** (`voices[i]`, evento `j`), estable
por construcción al generar música y anotaciones a la vez; ids explícitos solo si hicieran falta
(detalle en `Gramatica-mini-lilypond.md` §8).
⟶ ABIERTO: validar que el subconjunto elegido es **LilyPond compilable** sin retoques (test del
camino a papel).

---

## 6. Decisiones abiertas (índice)

- [x] ~~Estatus de la 4.ª familia~~ → es una familia más; reutiliza tipos ya disponibles (§1, §4.4).
- [x] ~~Registro de aciertos~~ → la app es plana, sin registro; seguimiento aparte vía tokens (§3).
- [ ] Lista cerrada de parámetros de generación y sus rangos por familia (§2).
- [ ] Ejes y escalas de dificultad para el botón "más difícil" (§3).
- [ ] Faltas concretas de UD 1 y sus tipos (§4.4).
- [ ] Casillas dudosas de la tabla de tipos (§4, familia 4).
- [x] ~~Formato de entrada para Verovio~~ → representación propia ligera (tipo LilyPond) +
      exportadores; MEI como salida principal a Verovio, LilyPond a Typst (§5.1).
- [x] ~~¿LilyPond acotado o *mock* propio?~~ → **subconjunto acotado de LilyPond real**, en
      estructura **híbrida JSON + mini-LilyPond**, notación **absoluta** canónica (§5.2).
- [x] ~~Gramática del mini-LilyPond + parser + integración~~ → gramática en
      `Gramatica-mini-lilypond.md`, parser en `ejercicios/mini-lilypond-parser.js` (25 tests OK),
      integrado en el prototipo (notas → mini-LilyPond → parser → modelo → MEI → Verovio).
- [x] ~~Convención de id/índices para anotar~~ → **posicional** (`voices[i]`, evento `j`) (§5.2).
- [ ] Validar que el subconjunto es LilyPond compilable sin retoques (camino a papel) (§5.2).
- [x] ~~Motor de audio~~ → **samples** (no síntesis MIDI básica) (§5).
- [ ] Librería/banco de samples concreto y su peso para offline (§5).
- [ ] Formato de las **anotaciones** del ejercicio (calidad, inversión, voces resaltadas…) →
      como campos JSON que referencian notas/voces por id; detalle por familia (§5.2).
- [x] ~~Generación en cliente vs. pre-generación~~ → **generación al vuelo en cliente**; el
      camino a LilyPond/Typst (papel) es posterior y con muchos menos ejemplos (§5, §5.1).
- [x] ~~Arquitectura: app única vs. piezas independientes~~ → **app única** de cliente puro (§5).
- [x] ~~¿Offline viable?~~ → **sí**, sin backend (no hay datos de usuario) (§5).
- [ ] Mecanismo concreto de empaquetado offline (PWA / bundle / *service worker*) (§5).

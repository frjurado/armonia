# Cadencias — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 4.º UD 0, familia *Cadencias* (consignas Tipo, Bajo dado, Canto dado). La ubicación es un dato de `curriculum-data.js`.

⟶ DECIDIDO (2026-10-05): la presentación «Oír» (solo audio, misma pregunta) se ofrece **solo en Tipo**; en Bajo dado y Canto dado, no. ⟶ PENDIENTE.

Unidad de repaso al comienzo de 4.º (trimestre 4). Tres familias —**Cadencias**, **Bajo
dado** y **Canto dado**— que comparten el **motor a cuatro voces** (`../motor-cuatro-voces.md`) y las reglas de
`../curriculum/Minimos-conduccion.md`. Como la UD 0 de 3.º, cada familia ofrece
**variantes** (`tipos` en `curriculum-data.js`) en lugar de modos id/au/ct, y niveles 1–3.
Esta sección diseña la primera familia; las otras dos se diseñarán sobre el mismo motor.

Ficheros (convención de `../Modelo-ejercicios.md` §6): `ejercicios/c4u0-cadencias-core.js` (global `Cadencias`)
y páginas `c4u0-cadencias-tipo.html`, `-bajo.html`, `-canto.html`.

## 1. Alcance: esqueleto general, contenido de ahora

⟶ DECIDIDO. Se diseñan **en general** solo las dos cosas que costaría rehacer: el **modelo
de acorde** del motor (cualquier acorde de 3 o 4 sonidos, con alteraciones, duplicaciones y
tendencias propias) y la **fórmula por casillas** de §3. El **contenido** —qué acordes,
qué cadencias, con qué pesos— se limita a lo que se repasa en esta unidad. Napolitana,
6.ª aumentada, dominantes secundarias o la cadencia plagal serán **filas nuevas** en las
tablas de §2 y §3 cuando se enseñen, con sus restricciones escritas entonces y no
adivinadas ahora; la columna *desde* de cada tabla es la que capa lo que sale en cada nivel.

## 2. Catálogo de cadencias

Criterio CAP/CAI: **solo la soprano** (Caplin). V y I van siempre en estado fundamental
por construcción (§3), así que la distinción no depende de nada más.

| Sigla | Nombre | Fórmula | Condición | Desde |
|-------|--------|---------|-----------|-------|
| **CAP** | Auténtica perfecta | [T] [PD] [I6/4] V(7) I | soprano acaba en **1̂** | nivel 1 |
| **CAI** | Auténtica imperfecta | [T] [PD] [I6/4] V(7) I | soprano acaba en **3̂ o 5̂** | nivel 1 |
| **SC** | Semicadencia | [T] [PD] [I6/4] V | V **sin 7.ª**; al menos un acorde antes | nivel 1 |
| **SC (frigia)** | Semicadencia frigia | [T] IV6 V | solo **menor** (bajo 6̂–5̂) | nivel 2 |
| **CR** | Rota | [T] [PD] [I6/4] V(7) VI | VI con 3.ª duplicada (N7, `Minimos-conduccion.md` §4) | nivel 2 |
| **CR** | Rota sobre IV6 | [T] [PD] [I6/4] V(7) IV6 | — | nivel 3 |
| *(no cad.)* | Gesto no cadencial | [T] V6 · V6/5 · V4/3 · V4/2 → I / I6 | solo variante *Tipo*, como distractor | ⟶ APLAZADO |

En **menor**, IV6 justo antes de V es **siempre la frigia**: la SC común no ofrece IV6 en
esa posición, para que los mismos acordes no salgan con dos etiquetas (§7 bis). La sigla
**CA** («Cadencia Auténtica», sin decidir P/I) **no es un tipo**: es solo la respuesta de
*Bajo dado*, donde la soprano no se ve.

Corchetes = casilla opcional. **Plagal: fuera** por ahora. Otras resoluciones de la rota,
más adelante. ⟶ APLAZADO: el gesto no cadencial (dominante invertida → I, contraste con la
cadencia; respuesta «no es cadencia») se decide **después de ver qué genera** el motor con
el catálogo actual; no entra en ningún nivel por ahora.

## 3. Casillas, acordes y pesos

Cinco casillas en orden fijo: **T0** (tónica inicial), **PD** (predominante), **D64** (6/4
cadencial), **D** (dominante) y **TF** (meta). D es obligatoria; TF falta en SC.

| Casilla | Acorde | Bajo | Peso mayor | Peso menor | Desde | Notas |
|---------|--------|------|-----------:|-----------:|-------|-------|
| T0 | I | 1̂ | 3 | 3 | 1 | |
| T0 | I6 | 3̂ | 6 | 6 | 1 | |
| T0 | VI | 6̂ | 1 | 1 | 3 | |
| PD | IV | 4̂ | 3 | 3 | 1 | menor: iv |
| PD | II6 | 4̂ | 5 | 5 | 1 | en menor, disminuido |
| PD | II | 2̂ | 1 | **0** | 2 | en menor, II° solo invertido (N10) |
| PD | IV6 | 6̂ | 1 | 3 | 2 (menor) · 3 (mayor) | en menor ante V sin 7.ª = SC frigia |
| D64 | I6/4 | 5̂ | — | — | 2 | presencia 60 % desde el nivel 2 |
| D | V | 5̂ | 2 | 2 | 1 | única opción en SC |
| D | V7 | 5̂ | 3 | 3 | 1 | |
| TF | I | 1̂ | — | — | 1 | |
| TF | VI | 6̂ | — | — | 2 | solo CR |
| TF | IV6 | 6̂ | — | — | 3 | solo CR |

**Presencia de las casillas opcionales:** T0 80 %, PD 90 %, D64 60 % (0 % en nivel 1).
Se rechaza la instancia si quedan menos de dos acordes, o si es SC con solo V. La fórmula
de dos acordes (V–I) queda así por debajo del 10 %.

**Encadenamientos.** Con este catálogo todo par T0 → PD → D64 → D es correcto; no hace
falta tabla de transiciones, solo los pesos. **Guardas contra cadencias raras:** (a) el
espacio de fórmulas es pequeño y enumerable (menos de 200 combinaciones), así que el script
de generación masiva (§9) **imprime la frecuencia de cada fórmula** para vetar a ojo;
(b) una lista `FORMULAS_VETADAS` en el core recoge esos vetos explícitamente, como
**pares de acordes consecutivos**. Vetos actuales: **VI–IV6** (el bajo repite 6̂ entre dos
casillas; en general, dos casillas seguidas no comparten bajo), **I6–IV6** (bajo 3̂–6̂ sin
sentido) e **I–II** (fuera del estilo).
⟶ ABIERTO: ajustar pesos y vetos a la vista de esa tabla (la tabla actual está en la
salida de `tests/masivo-cadencias.js`; con los pesos de arriba ninguna fórmula supera el
5 % en el nivel 1 ni el 3,5 % en el 3).

## 4. Soprano: cláusulas preferidas

⟶ DECIDIDO: sí, se definen líneas de soprano preferidas, **como pesos, no como normas**
(P8 de los mínimos). Las normas solas producen escritura correcta pero atípica —es
exactamente lo que pasa con los contrapuntos de 3.º—, y la cadencia se reconoce por su
cláusula. El mecanismo «normas duras + preferencias puntuadas» es general: lo reutilizan
Bajo dado, Canto dado y, pendiente, `contrapunto-core.js`.

**Cláusulas como líneas de 2 a 5 grados**, alineadas al **final** de la fórmula (la última
nota cae en el último acorde): cada línea tiene un peso de 1 a 4, y la puntuación busca la
línea **más larga** que coincide con la soprano. Una línea corta (2̂→1̂) vale como
respaldo cuando ninguna larga encaja; si ninguna encaja, la penalización es alta pero no
invalida (P8, no norma). El grado **final** sí es norma de cada tipo (Caplin): CAP 1̂; CAI
3̂ o 5̂; SC 2̂, 7̂ o 5̂; frigia 5̂ o 7̂; CR 1̂ o 3̂. La búsqueda puntúa también las
coincidencias **parciales** en cada acorde (la mitad), para encaminar la soprano antes de
llegar al final.

⟶ PROPUESTA (2026-09-19, borrador para revisar; los pesos, en `CLAUSULA` del core):

| Cadencia | Líneas de soprano (peso) |
|----------|--------------------------|
| CAP | 4̂–3̂–2̂–1̂ (4) · 3̂–2̂–1̂ (4) · 5̂–4̂–3̂–2̂–1̂ (4) · 5̂–4̂–2̂–1̂ (3) · 3̂–2̂–1̂–7̂–1̂ (4) · 3̂–2̂–7̂–1̂ (3) · 1̂–7̂–1̂ (3) · 1̂–1̂–7̂–1̂ (2) · 3̂–3̂–2̂–1̂ (2) · 3̂–4̂–2̂–1̂ (2) · 3̂–4̂–3̂–2̂–1̂ (2) · 2̂–1̂ (3) · 1̂–2̂–7̂–1̂ (2) · 7̂–1̂ (2) |
| CAI | 1̂–2̂–3̂ (3) · 5̂–4̂–3̂ (4, exige V7) · 6̂–5̂–4̂–3̂ (4) · 6̂–5̂–3̂ (4) · 3̂–2̂–3̂ (3) · 3̂–4̂–4̂–3̂ (2) · 5̂–6̂–5̂ (2) · 5̂–5̂–5̂ (1) · 2̂→3̂ (4) · 4̂→3̂ (3) · 5̂→3̂ (2) · 5̂→5̂ (1) |
| SC | 4̂–3̂–2̂ (3) · 5̂–4̂–3̂–2̂ (4) · 1̂–1̂–2̂ (3) · 3̂–3̂–2̂ (3) · 3̂–4̂–2̂ (2) · 3̂–2̂–1̂–7̂ (4) · 1̂–1̂–7̂ (2) · 3̂–4̂–5̂ (1) · 5̂–6̂–5̂ (1) · 1̂→2̂ (3) · 3̂→2̂ (3) · 1̂→7̂ (2) · 6̂→5̂ (1) · 4̂→5̂ (1) |
| SC (frigia) | 3̂–4̂–5̂ (3) · 1̂–1̂–7̂ (2) · 5̂–4̂–5̂ (2) · 4̂→5̂ (3) · 1̂→7̂ (3) |
| CR | 4̂–3̂–2̂–1̂ (4) · 3̂–2̂–1̂ (4) · 1̂–7̂–1̂ (3) · 1̂–1̂–7̂–1̂ (2) · 2–1̂–7̂–1̂ (2) · 5̂–4̂–3̂ (2, exige V7) · 6̂–5̂–4̂–3̂ (2) · 2̂–2̂–1̂ (2) · 2̂→1̂ (2) · 7̂→1̂ (3) · 4̂→3̂ (1) |

Criterios del boceto: (a) las líneas largas son las **descendentes por grado hacia la
meta** (4̂–3̂–2̂–1̂, 6̂–5̂–4̂–3̂) y las de **bordadura de la tónica** (1̂–7̂–1̂, 3̂–2̂–3̂),
que son las que hacen reconocible la cadencia; (b) las líneas con nota repetida
(1̂–1̂–7̂–1̂, 3̂–3̂–2̂) pesan menos; (c) las que exigen V7 (4̂ sobre la dominante) solo
casan si la fórmula lo lleva; (d) qué grado cabe sobre cada acorde lo decide el motor
(1̂ sobre II6 no existe), así que una línea puede no ser realizable en una fórmula y
entonces manda la siguiente. Los ejemplos de dos notas se mantienen como respaldo.
⟶ ABIERTO: revisar líneas y pesos a la vista de la tabla de sopranos que imprime
`tests/masivo-cadencias.js`.

Antes de la cláusula, la soprano se rige por P7/P8 (grado conjunto, un ápice, sin
repeticiones largas). La posición del primer acorde (1̂, 3̂ o 5̂ en la soprano) se reparte
al azar: es la principal fuente de variedad junto con la disposición.

## 5. Ritmo: tabla de plantillas, no reglas

Qué significa «tabla, no reglas»: el generador **no calcula** duraciones a partir de
reglas métricas (meta en parte fuerte, 6/4 más fuerte que su V…). Elige una **plantilla
escrita a mano** de una lista indexada por (compás, número de acordes); cada plantilla ya
es válida por construcción y lleva marcada la fuerza de cada casilla. Solo queda una
comprobación: el par I6/4–V debe caer en dos casillas del **mismo compás** con la primera
**más fuerte** que la segunda; si la plantilla no lo permite, se elige otra. Menos variedad
rítmica que con un generador, pero la variedad rítmica no es el objetivo, y la lista se
amplía añadiendo líneas.

Invariante de todas las plantillas: el último acorde (TF, o la V de una SC) cae en **parte
fuerte del último compás y lo ocupa entero**. Duraciones en mini-LilyPond; `|` compás;
`↑` anacrusa (compás inicial incompleto).

| Compás | 2 acordes | 3 acordes | 4 acordes | 5 acordes |
|--------|-----------|-----------|-----------|-----------|
| 4/4 | `1 \| 1` · `↑2 \| 1` | `2 2 \| 1` · `↑4 4 \| 1` | `1 \| 2 2 \| 1` · `2 4 4 \| 1` · `↑4 \| 2 2 \| 1` | `1 \| 2 4 4 \| 1` · `2 2 \| 2 2 \| 1` · `↑4 \| 2 4 4 \| 1` |
| 3/4 | `2. \| 2.` · `↑4 \| 2.` | `2 4 \| 2.` · `↑4 4 \| 2.` | `4 4 4 \| 2.` · `2. \| 2 4 \| 2.` · `↑4 \| 2 4 \| 2.` | `2. \| 4 4 4 \| 2.` · `2 4 \| 2 4 \| 2.` · `↑4 \| 4 4 4 \| 2.` |
| 2/4 | `2 \| 2` · `↑4 \| 2` | `4 4 \| 2` · `↑4 \| 2 \| 2` | `2 \| 4 4 \| 2` · `↑4 \| 4 4 \| 2` | `4 4 \| 4 4 \| 2` · `↑4 \| 2 \| 4 4 \| 2` |

**Excepción: semicadencia con 6/4 cadencial.** La V es el último acorde, así que no puede
ocupar el último compás entero y a la vez seguir al 6/4 dentro de él: en ese caso (y solo en
él) el 6/4 y la V **comparten el último compás**, el 6/4 en la parte fuerte:

| Compás | 2 acordes | 3 acordes | 4 acordes |
|--------|-----------|-----------|-----------|
| 4/4 | `2 2` | `1 \| 2 2` · `↑4 \| 2 2` | `2 2 \| 2 2` · `↑4 \| 1 \| 2 2` |
| 3/4 | `2 4` | `2. \| 2 4` · `↑4 \| 2 4` | `2 4 \| 2 4` · `↑4 \| 2. \| 2 4` |
| 2/4 | `4 4` | `2 \| 4 4` · `↑4 \| 4 4` | `4 4 \| 4 4` · `↑4 \| 2 \| 4 4` |

**N9 en ternario** (⟶ DECIDIDO 2026-09-30): en 3/4 con tres negras, el 6/4 cadencial puede
ir en el 2.º tiempo y la V en el 3.º, aunque pesen lo mismo (`n9Ternario()` en el core).
Es una posibilidad, no la norma: esas plantillas pesan 0,3 frente a 1 (`W_N9_TERNARIO`),
y así salen en torno al 22 % de las cadencias en 3/4 con 6/4; con peso 1 eran el 42 %.

Nivel 1: sin anacrusa. La anacrusa va como campo `partial` en el `context` del JSON y el
parser exige que el primer compás sume exactamente esa duración (⟶ HECHO, gramática §6).
En el MEI, el compás de anacrusa lleva `metcon="false"` y numera desde 0.

## 6. Tonalidades y modo menor

- ⟶ DECIDIDO: la tabla de tonalidades por trimestre (`Plan-Armonia.md` §2) sale del código
  de cada core a un fichero de datos compartido, `public/tonalidades.js` (global
  `TONALIDADES`: tónica, armadura, modo, nombre, trimestre; y una función «acumuladas
  hasta el trimestre t»). Los cores de 3.º UD 0 que hoy llevan las 4 del trimestre 1
  escritas dentro migran después. ⟶ PENDIENTE.
- Niveles 1–2: las **12** tonalidades de 3.º (trimestres 1–3). Nivel 3: **16** (+ trimestre 4).
- **Menor: escala armónica** como colección (V y V7 con sensible, II6 disminuido, IV menor, VI mayor,
  I6/4 natural). N12 (sin 2.ª aumentada) es norma del motor: el único riesgo es 6̂→7̂ en una
  voz superior al pasar de IV/VI/II6 a V, y la búsqueda lo descarta.

## 7. Las tres variantes

Presentación común: **pentagrama doble**; soprano y contralto en clave de Sol (capas 1 y 2,
plicas arriba/abajo), tenor y bajo en Fa (igual). Armadura y compás siempre. Cifrados al
revelar: **cifrado americano encima** del pentagrama superior (C, G7, Am, F/A…) y **grados
romanos con cifras debajo** del inferior (I, II6, I6/4, V7, V6/5…). Audio a cuatro voces.
El americano va **en segundo plano** (⟶ HECHO 2026-09-30): más pequeño (`<rend
fontsize="80%">` en el MEI, para que Verovio reserve el espacio justo) y en gris medio
(`<harm type="americano">` → clase `americano`, `--muted` en `comun.css`). Aquí es
información añadida; donde el americano **es** lo que se pregunta (3.º UD 0, *Acordes*) no
se marca y sigue en primer plano.

**Tres capas, cada una en su sitio** (⟶ HECHO 2026-09-23). Lo que se ve se reparte en
dato → pregunta → respuesta, y **nada se dice dos veces**:

1. **El dato de partida va en la partitura**, no en el enunciado: un `<reh type="dato">`
   anclado al **primer tiempo**, o sea alineado con el comienzo de la música
   (`toMEI(…,{dato})`). Entintado y en serif (`comun.css`, `.reh.dato`) para no
   confundirlo ni con el cifrado ni con la respuesta. Va como **marca de ensayo** (`<reh>`)
   y no como `<dir>` **a propósito**: al revelar tiene que quedar **por encima de la fila
   del americano**, y `<reh>` es el elemento al que Verovio da la franja más alta sobre el
   pentagrama. Con `<dir>` cae por debajo y subirlo exige un `vo` a ojo que depende de la
   altura de la soprano (medido: holgura de 49–97 unidades y ajustado a mano, frente a
   396–439 con `<reh>` sin tocar nada). `<reh>` se **centra** sobre el primer tiempo
   —Verovio ignora `halign` aquí—; con los nombres más largos («Sol♭ mayor») el borde
   izquierdo llega justo al comienzo del pentagrama, y aún quedan 600 unidades de margen
   de página, así que no se recorta. Comprobado en 1080 render: las tres variantes, los
   tres niveles, antes y después de revelar.
2. *(Revisado el 2026-10-06: la pregunta pasa **encima** de la partitura y con más peso,
   `../Modelo-ejercicios.md` §2.1. Lo que sigue es la decisión original.)*
   **La pregunta va debajo de la partitura** (`.pregunta`), en una línea y con menos peso
   que el dato y que la respuesta. El enunciado largo sigue dentro de «Ayuda».
3. **La respuesta no repite lo que ya está dibujado.** Al revelar, los cifrados aparecen
   en la partitura; el texto solo lleva lo que ahí **no** se lee. Excepción: la **línea de
   bajo en grados** de *Canto dado*, que en la partitura está implícita (se ven las notas,
   no los grados).

Qué da cada variante, por tanto: *Tipo* → la **tonalidad**; *Bajo dado* → **nada** (solo
el bajo escrito); *Canto dado* → el **tipo de cadencia**. El **compás no se escribe nunca**
en texto: está en la partitura.

- **Tipo** (icono: la sigla «CAP»): se muestra la realización completa, con la
  **tonalidad como dato sobre el primer tiempo**; se pide el **tipo de cadencia**.
  Respuesta: sigla y nombre en grande, el nombre en Title Case («CAP · Cadencia Auténtica
  Perfecta») y nada más: la sucesión de acordes se lee en los cifrados que aparecen al
  revelar. ⟶ HECHO (2026-09-19):
  `c4u0-cadencias-core.js` (global `Cadencias`) + `c4u0-cadencias-tipo.html`; en el menú,
  4.º UD 0 con `publico:false`.
- **Bajo dado** (icono: clave de Fa; ⟶ HECHO 2026-09-22, `c4u0-cadencias-bajo.html` +
  `Cadencias.generarBajo()`): se muestra **solo el bajo** (pentagrama
  superior con `<space>`, como en Intervalos con inversión), armadura y compás, **sin dato
  ninguno**; se piden **tonalidad, tipo y acordes** (grado e inversión).
  - **Respuesta principal** (texto): tonalidad + tipo. Como el bajo nunca decide CAP/CAI
    (§7 bis), el tipo se responde con la sigla **CA · Cadencia Auténtica**, y en el
    detalle «aquí, CAP» por la realización mostrada. «CA» es una etiqueta **solo de
    respuesta de esta variante**, no un tipo del catálogo (§2). Los demás tipos se dan
    con su sigla normal; la única otra indecisión del bajo es 6̂–5̂ en menor, que se
    responde «SC (frigia) o SC» con las dos lecturas. Los **acordes no se listan en
    texto**: son justo lo que dibuja la partitura al revelar, con su fila de alternativas.
  - **Respuesta en la partitura**: se dibuja **una** realización con sus cifrados, y bajo
    ella, en **filas secundarias**, los acordes que también habrían cabido en esa casilla
    con ese bajo. Las filas las hace Verovio: varios `<harm place="below">` con `n="1"`,
    `n="2"`… se apilan alineados bajo la misma nota (comprobado; sin `n` se superponen).
    Fila 1 = la realización; fila 2 = la alternativa. **Nunca más de una alternativa por
    casilla** (§7 bis), así que bastan dos filas. La fila de alternativas se distingue
    como en el texto: **en gris** (el MEI la marca `type="alt"`, que Verovio vuelca a la
    clase del SVG, y `comun.css` la pinta con `--soft`) y **algo más separada** de la
    principal (`vo` negativo en el `<harm>`, que en `place="below"` empuja hacia abajo).
  - La **tonalidad es única**: comprobado por enumeración exhaustiva (§7 bis).
- **Canto dado** (icono: clave de Sol; ⟶ HECHO 2026-09-22, `c4u0-cadencias-canto.html` +
  `Cadencias.generarCanto()`): se muestra **solo la soprano**, con armadura, compás
  y **el tipo** como dato sobre el primer tiempo, con su sigla exacta («CAP»); se piden
  **tonalidad y línea del bajo**.
  - El tipo **se da** porque sin él la soprano no distingue CA de CR (ambas pueden acabar
    en 1̂) y porque acota las líneas de bajo posibles a unas pocas (§7 bis).
  - **Respuesta**: la realización completa con sus cifrados (el bajo es lo pedido; las voces
    internas vienen de propina) y, en texto, la tonalidad y la **línea de bajo en grados**
    —el único caso en que el texto repite algo dibujado, porque los grados no están
    escritos en la partitura—. **«Otros bajos posibles»**: se
    relanza el motor con la soprano fijada sobre todas las fórmulas del tipo y la longitud,
    y se listan las **secuencias de grados del bajo** distintas que tienen realización
    válida, cada una con su lectura de acordes («1̂–4̂–5̂–1̂ · I–IV–V–I o I–II6–V–I»), hasta
    **tres** y «y N más» si sobran. Van como lista de texto, no en pentagrama: lo que se
    compara es la línea, y tres pentagramas más no caben en pizarra.
  - **Guarda de tonalidad**: al revés que en Bajo dado, la soprano **sí** puede leerse en la
    relativa (§7 bis: SC hasta el 41 %, CR hasta el 18 %). Se **descarta la instancia**
    si la misma soprano escrita admite una realización con la **misma sigla** en la
    tonalidad relativa. Solo así «se pide tonalidad» tiene respuesta única.

En las dos últimas variantes la soprano/el bajo mostrados **se generan primero como
realización completa**; no se generan sueltos. Así lo mostrado siempre tiene solución.
El **audio** sigue a lo que se ve: antes de revelar suena solo la voz mostrada; al revelar,
las cuatro. En las dos, la tonalidad **no** se nombra hasta la respuesta.

Al implementarlas apareció un detalle de presentación: las lecturas de una línea de bajo
**no se escriben nunca como fórmulas enteras** tampoco en el texto de la respuesta (serían
ocho: «I–IV–I6/4–V–VI o I–IV–I6/4–V–IV6 o …»), sino comprimidas por casilla, igual que en
la partitura: «I · IV (o II6) · I6/4 · V7 (o V) · VI (o IV6)». Lo hace
`comprimeLecturas()`, y la primera fila es siempre el acorde de la realización dibujada.
Los grados con circunflejo (1̂) no componen bien en el titular de la respuesta (serif, 30 px):
ahí va la tonalidad, y la línea de bajo baja al detalle.

## 7 bis. Cuánta ambigüedad hay (medida, no estimada)

El catálogo es pequeño y enumerable, así que antes de programar las dos variantes se
contaron **todas** sus fórmulas y se agruparon por línea de bajo (script de medida, no
incluido en la app; resultados de 2026-09-22).

| Nivel | Fórmulas (CAP/CAI unidas) | Líneas de bajo | Lecturas por línea |
|-------|--------------------------:|---------------:|--------------------|
| 1 (mayor) | 26 | 11 | 1 (2 líneas) · 2 (6) · 4 (3) |
| 2 (mayor) | 109 | 47 | 1 (9) · 2 (26) · 4 (12) |
| 3 (menor) | 197 | 53 | 1 (6) · 2 (18) · 3 (1) · 4 (18) · 8 (10) |

Lo que importa no es el número de lecturas, sino su **forma**: son siempre el producto de
elecciones **independientes casilla a casilla**, y cada casilla tiene **a lo sumo dos**
acordes con el mismo bajo:

| Bajo | Casilla | Alternativas | Desde |
|------|---------|--------------|-------|
| 4̂ | PD | IV · II6 | nivel 1 |
| 5̂ | D | V · V7 | nivel 1 |
| 6̂ | TF (rota) | VI · IV6 | nivel 3 |
| 6̂ | T0 / PD | VI · IV6 | nivel 3 (menor: PD desde el 2) |

Por eso las ocho lecturas de una línea del nivel 3 **no se listan como ocho fórmulas**
(ilegible), sino como **una alternativa bajo cada casilla que la tenga**: dos filas de
cifrado bastan siempre.

**Tipo a partir del bajo.** Enumerando los tres niveles, ninguna línea de bajo admite dos
tipos distintos, salvo: (a) **CAP/CAI**, que el bajo *nunca* distingue (es cosa de la
soprano, §2); y (b) en **menor**, el bajo 6̂–5̂, que es **IV6–V** (frigia) o **VI–V** (SC).

**Tonalidad a partir del bajo: siempre única.** Comprobado sobre todas las líneas de bajo
de los tres niveles y los dos modos (0 choques de 22, 94 y 124 líneas): leída en la
relativa, ninguna da otra cadencia válida. La razón es estructural: la casilla D exige
bajo 5̂, que en la relativa es 7̂ o 3̂, y ninguno de los dos es bajo de la casilla D. Al
ampliar el catálogo (napolitana, dominantes secundarias…), **rehacer esta medida**.

**Tonalidad a partir de la soprano: NO es única.** Con la sigla exacta dada, el porcentaje
de instancias cuya soprano escrita admite también una realización del mismo tipo en la
tonalidad relativa es: CAP 0 % · CAI 0 % · SC (frigia) 0 % · **CR 12–18 %** · **SC 19–41 %**.
De ahí la guarda de Canto dado. (CAP es inmune porque su soprano acaba en la tónica.)

**Cuántas líneas de bajo caben bajo una soprano dada**, con el tipo dado: nivel 1, una o
dos; nivel 2, entre una y tres (máximo medido 7); nivel 3, tres o cuatro (máximo 6). Es una
lista corta, que es lo que hace viable mostrar «otros bajos posibles».

**Fleco detectado al medir.** En menor, la fórmula `[T0] IV6 V` se generaba con **dos
etiquetas**: como SC (con IV6 de predominante) y como SC frigia, siendo los mismos acordes.
⟶ DECIDIDO: en menor, IV6 inmediatamente antes de V es **siempre** la frigia; la casilla PD
no ofrece IV6 a la SC común (sí con I6/4 por medio, que ya no es la frigia).

## 8. Niveles

| Nivel | Cadencias | T0 | PD | D | Otros |
|-------|-----------|----|----|---|-------|
| 1 | CAP, CAI, SC | I, I6 | IV, II6 | V, V7 | sin I6/4; 12 tonalidades; 2/4, 3/4, 4/4 sin anacrusa |
| 2 | + CR (VI), SC frigia | = | + II (mayor), IV6 (menor) | = | + I6/4 cadencial; anacrusa |
| 3 | + CR sobre IV6 | + VI | + IV6 (mayor) | = | 16 tonalidades |

«Más difícil» sube de nivel, como en las demás familias. ⟶ ABIERTO: revisar el reparto tras
usarlo en clase.

## 9. Validación por generación masiva

Script desechable (patrón de `CLAUDE.md`), por nivel, variante y tonalidad:

1. **Cero infracciones** según el comprobador independiente (`../motor-cuatro-voces.md`), sobre miles de instancias.
2. **Tabla de frecuencia de fórmulas** (para vetar, §3).
3. **Variedad:** para cada (fórmula, tonalidad), número de realizaciones distintas en 200
   extracciones; objetivo: ninguna realización supera el 25 % de su fórmula.
4. **Bajo dado:** unicidad de tonalidad (§7) y porcentaje de descartes.
5. **Tipo:** la clasificación CAP/CAI recalculada desde la soprano coincide con la etiqueta.
6. **Cuadre rítmico:** cada voz pasa el bar check del parser con el compás y `partial`.

7. **Render real:** una muestra de instancias se carga en Verovio (que funciona también en
   Node desde `vendor/`) y se cuentan notas, cifrados y compases en el SVG.

8. **Bajo dado:** la tonalidad es la única posible —comprobado **leyendo el bajo escrito
   en la relativa** con una enumeración propia del script, no con la del core— y ninguna
   casilla ofrece más de una alternativa.
9. **Canto dado:** ninguna instancia superviviente se lee en la relativa con la misma sigla.

⟶ HECHO (2026-09-22) los puntos 8 y 9, con 150 instancias de cada variante por nivel:
**0 tonalidades ambiguas** en las dos, **0 casillas con más de una alternativa** (la
afirmación de §7 bis, ahora verificada también en el nivel 3) y «otros bajos» de media
0,8 · 1,5 · 2,3 por nivel, con máximo 7. Coste: unos 10 ms por instancia de Bajo dado y
25 ms de Canto dado (enumeran el catálogo entero), frente a 1,7 ms de *Tipo*; imperceptible
al pulsar un botón, pero por eso la validación usa 150 y no miles.

⟶ HECHO (2026-09-19): `tests/masivo-cadencias.js [nivel] [n]` sobre el core de la familia
(puntos 1, 2, 3, 5, 6 y 7; el 4 es por construcción). Resultado: **0 infracciones**,
**0 errores de cuadre** y **0 problemas de render** en 2000 instancias por nivel, 0,4 ms por
instancia; ninguna realización por encima del 18 % de su fórmula salvo V7–I a secas (23 %).
El punto 6 pilló un error real de la tabla rítmica (un compás de 2/4 con una sola negra) y
el 2 explicó por qué faltaban semicadencias con 6/4 (§5, excepción). Complemento
imprescindible: `tests/sensibilidad-comprobador.js` demuestra que el comprobador **detecta**
cada norma con un caso de falta deliberada (19/19); sin eso, «cero infracciones» no
probaría nada.

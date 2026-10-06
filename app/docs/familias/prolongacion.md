# Prolongación — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 4.º UD 0, familia *Prolongación* (consignas Prolongación, Frase, Periodo).

Segunda familia de la UD 0 de 4.º, sobre el mismo motor (`../motor-cuatro-voces.md`) y los mismos mínimos. Todo
son **bajos sin cifrar**, y a las cadencias se suma la **progresión de prolongación**
(apuntes c4u0 §2.2–2.3): prolongaciones de **I** o de **V** hechas con la regla de la 8.ª,
por bordadura o por paso. Los `tipos` de la familia **no son variantes de presentación**
(como en Cadencias) sino de **extensión**:

| Tipo | Clave | Extensión | Contenido |
|------|-------|-----------|-----------|
| 1 | `prol` | 2–3 cc., hasta 5 acordes | una prolongación que empieza y acaba en la misma armonía |
| 2 | `frase` | 4 cc. | prolongación + cadencia (CA o SC) |
| 3 | `periodo` | 8 cc. | prolongación + SC ‖ prolongación + CA |

Ficheros: `ejercicios/prolongacion-core.js` (global `Prolongacion`; usa de
`cadencias-core.js` las casillas, los vetos, las cláusulas y el lector de plantillas),
`prolongacion-ui.js` (la UI, **común a los tres tipos**: las páginas solo cambian en
el tipo y el texto de ayuda) y `prolongacion-prol.html`, `-frase.html`,
`-periodo.html`. ⟶ DECIDIDO (2026-09-29) todo lo que sigue, salvo lo marcado.

## 1. Qué se muestra, qué se pide, qué se responde

- **Se muestra** solo el bajo (como Bajo dado, `cadencias.md` §7), con armadura y compás. En el tipo 1,
  además, la **tonalidad como dato** sobre el primer tiempo: sin cadencia ni V en estado
  fundamental, el bajo solo no la decide.
- **Se pide** tonalidad (tipos 2 y 3), **acordes** (grado e inversión) y **segmentación**:
  qué tramo prolonga qué armonía y dónde está la cadencia.
- **Al revelar**: una realización a cuatro voces; los romanos con los **acordes
  subordinados entre paréntesis** —«I (V6) I», como en los apuntes—; las **alternativas**
  en filas de cifrado (§7); y encima del pentagrama superior, una **etiqueta por
  tramo** al comienzo de cada uno («Prol. I», «Prol. V», «SC», «CA») con un **corchete**
  de línea continua hasta su último acorde («Prol. I ────┐»); cuando el tramo **solapa**
  con el siguiente (la bisagra: último acorde de la prolongación = primero de la
  cadencia), la línea **no se cierra** con el gancho y enlaza con la etiqueta siguiente. Orden vertical, de arriba
  abajo, por alcance: **tonalidad** (todo el ejercicio), **tramo** (una parte),
  **americano** (un acorde, en segundo plano, `cadencias.md` §7). Detalles de Verovio que lo hacen
  posible: `<reh>` es lo único que sube por encima de los `<harm>` (con `<dir>`, `<tempo>`
  o un segundo `<harm>`, la etiqueta cae entre el americano y el pentagrama), así que el
  tramo va como `<reh type="tramo" xml:id="tramo{i}">`; entre dos `<reh>` en el mismo
  tiempo, el que se escribe **después** queda más arriba, así que el dato va al final del
  compás. La línea de extensión de Verovio (`dir@extender`) sale como guiones sueltos y
  sin gancho: el corchete lo dibuja la página tras el render (`ArmoniaEj.corchetesTramo`,
  medido sobre la etiqueta y la última nota del tramo; si la etiqueta siguiente está más
  cerca —la bisagra es final de un tramo y comienzo del otro—, la línea se para antes de
  ella). En texto:
  tonalidad y resumen de la forma («Prol. I + SC ‖ Prol. V + CA»); en el detalle, por
  tramo, la técnica de cada célula («bordadura inferior; paso ascendente»).
- La cadencia auténtica se responde **CA**, como en Bajo dado: el bajo no decide CAP/CAI.

## 2. Células de prolongación

Una prolongación es una **cadena de células**. Cada célula es un gesto de bajo de 2 o 3
notas, escrito a mano, con sus lecturas por posición. Los extremos son siempre la armonía
prolongada (I, I6, V o V6: **acordes principales**); lo de en medio es el **acorde
subordinado**. Dos células se encadenan **compartiendo el acorde de unión**: el último de
una es el primero de la siguiente, con la misma inversión (I–V6–I + I–VII6–I6 =
①–⑦–①–②–③, la figura de los apuntes).

| Id | Prolonga | Técnica | Bajo | Acordes (lecturas del subordinado, con nivel) | Peso |
|----|----------|---------|------|-----------------------------------------------|-----:|
| `bord-inf` | I | bordadura inferior | ①–⑦–① | I – **V6** (1) · V6/5 (2) – I | 3 |
| `bord-sup` | I | bordadura superior | ①–②–① | I – **VII6** (1) · V4/3 (2) – I | 3 |
| `bord-3` | I | bordadura de ③ | ③–④–③ | I6 – **IV** (1) · V4/2 (2) – I6 | 2 |
| `paso-asc` | I | paso ascendente | ①–②–③ | I – **VII6** (1) · V4/3 (2) · V6/4 (3) – I6 | 4 |
| `paso-desc` | I | paso descendente | ③–②–① | I6 – **VII6** (1) · V4/3 (2) · V6/4 (3) – I | 3 |
| `salto-143` | I | paso sin paso en el bajo | ①–④–③ | I – **IV** (1) · V4/2 (2) – I6 | 1,5 |
| `salto-371` | I | paso sin paso en el bajo | ③–⑦–① | I6 – **V6** (1) · V6/5 (2) – I · *solo mayor* | 1,5 |
| `pedal-IV` | I | bordadura (6/4) | ①–①–① | I – **IV6/4** (3) – I | 1,5 |
| `arp-asc` | I | arpegio | ①–③ | I – I6 | 1 |
| `arp-desc` | I | arpegio | ③–① | I6 – I | 1 |
| `paso-V` | V | paso ascendente | ⑤–⑥–⑦ | V – **IV6** (1) – V6 · *en menor, ♯⑥ (melódica)* | 3 |
| `bord-V` | V | bordadura (6/4) | ⑤–⑤–⑤ | V – **I6/4** (3) – V | 1,5 |
| `arp-V-asc` | V | arpegio | ⑤–⑦ | V – V6 | 1 |
| `arp-V-desc` | V | arpegio | ⑦–⑤ | V6 – V | 1 |

Reglas de la cadena:

- **Solo dominantes invertidas** dentro de una prolongación de I: el V en estado
  fundamental queda para la cadencia. Con el bajo solo, ①–⑤–① no se distingue de una
  cadencia; con esta regla, «V invertido → I» es siempre prolongación y el análisis es
  decidible.
- **Veto: células inmediatamente repetidas** (I–V6–I–V6–I).
- **Veto: pares de notas del bajo repetidos seguidos** dentro de una misma prolongación
  (①–②–①–②–③, ③–⑦–①–⑦–①…), aunque las células sean distintas (⟶ DECIDIDO 2026-09-30).
  Entre procedimientos distintos sí se admite (el IV de la prolongación y el de la
  cadencia). Se aplica igual al generar y al analizar el bajo (§7).
- Toda prolongación lleva **al menos una célula que no sea arpegio**.
- `salto-371` no existe en menor: ③–♯⑦ es una 4.ª disminuida en el bajo.
- **Fuera, a propósito:** ⑤–⑥–⑤ (V–IV6–V, confuso y poco común); ⑦–⑥–⑤ descendente
  (en menor pide el V6 menor de la escala natural, que no es dominante; en mayor, lo propio
  es una dominante secundaria, que aún no toca); en general, **la escala natural
  descendente** en menor. La melódica ascendente, sí (`paso-V`).
- Cuántas células lleva cada prolongación **no se fija**: sale del ritmo (§5). Con 2–3
  compases y unos dos acordes por compás, son una o dos.

## 3. Enlaces y cadencias

- **Bisagra.** Una prolongación de I desemboca en la cadencia por un **I o I6 que es a la
  vez el último acorde de la prolongación y la T0 de la cadencia**. Que la prolongación
  acabe en I y la cadencia empiece en I6 (o al revés) no es un caso aparte: es una célula
  de arpegio al final de la cadena.
- **De la prolongación de V a la tónica**, dos enlaces: **V6 → I** (bajo ⑦–①) y
  **V – V4/2 – I6** (bajo ⑤–④–③, desde el nivel 2). El I o I6 de llegada es la bisagra.
  Tras el enlace puede ir aún una célula de arpegio (I → I6).
- **Cadencias: CA y SC** por ahora (sin rota ni frigia). **La PD es obligatoria**: sin
  ella, bisagra–V–I sería el I–V–I que la prolongación ha evitado. Casillas, pesos y vetos
  de PD, 6/4 cadencial y D, los de Cadencias (`cadencias.md` §3), **sin IV6** (en menor sería la
  frigia; en mayor, un 6̂ en el bajo que se confunde con `paso-V`). En el nivel 1, la D es
  solo V (el nivel 1 va entero en tríadas).
- El 6/4 cadencial, como en Cadencias: mismo compás que su V y en parte más fuerte (N9).

## 4. La forma de cada tipo

- **Tipo 1** — Prol. I (70 %) o Prol. V (30 %), sola. Empieza y acaba en la misma armonía
  (la inversión puede cambiar: el paso acaba en I6). Como mucho **5 acordes**: dos células
  de tres con un acorde común, y el último compás solo lleva la llegada.
- **Tipo 2** — 4 cc. **Comienzo en la tónica** (75 %): Prol. I + cadencia. **Comienzo en
  la dominante** (25 %): Prol. V + enlace + cadencia. Cadencia: CA 60 %, SC 40 %.
- **Tipo 3** — 8 cc., **siempre SC–CA, nunca al revés**. Antecedente (cc. 1–4): Prol. I +
  SC. Consecuente (cc. 5–8): Prol. I (60 %) o Prol. V tras la SC —«estar en la dominante»—
  + enlace (40 %), y CA. Si el consecuente prolonga I, **puede** repetir las células del
  antecedente (40 % de esos casos): es lo musicalmente común, pero no se exige, porque lo
  contrario hace el ejercicio más rico. La CA del final se realiza como **CAP**.

## 5. Ritmo armónico

Principio: **el acorde subordinado va en parte débil; los principales, en fuerte**. Una
bordadura X–s–X cruza la barra: `X s | X`. El ritmo se elige **después** de la cadena de
acordes: se enumeran todas las sucesiones de patrones de compás que cuadran con el número de
acordes y el número de compases del tipo (pocas decenas), se filtran por las reglas y se
elige una al azar ponderado; si ninguna vale, se genera otra cadena.

| Compás | 1 acorde | 2 acordes | 3 acordes |
|--------|----------|-----------|-----------|
| 4/4 | `1` | `2 2` | `2 4 4` |
| 3/4 | `2.` | `2 4` · `4 2` | `4 4 4` |
| 2/4 | `2` | `4 4` | — |

Reglas:

1. Un **subordinado nunca en la parte fuerte** del compás. Eso incluye los 6/4 de paso y de
   bordadura.
2. **1 acorde por compás** solo para la llegada (el último acorde de la frase, en fuerte y
   de compás entero; en la SC, la V, sola o tras su 6/4 en el mismo compás) y para la D de
   la cadencia (`… | V7 | I`).
3. **3 acordes por compás** (`2 4 4`, `4 4 4`) solo en el compás de la bisagra o de la
   cadencia: el acorde principal puede caer entonces en parte débil si enlaza directamente
   con la cadencia (3/4: `① ⑦ | ① ② ③ | ④ ⑤ ⑤ | ①`).
4. **Negra–blanca** (3/4 `4 2`) solo con el subordinado en la blanca: síncopa débil,
   poco peso, y más si el compás anterior tiene el ritmo contrario (`2 4 | 4 2`).
5. 6/4 cadencial: N9 (mismo compás que la V y en parte más fuerte).
6. Sin anacrusa: pediría células que empiezan por el subordinado (⑦–①, ④–③), y no hace
   falta.

Pesos: 2 acordes 3; 3 acordes 1; `4 2`, 1 (3 tras `2 4`). En el tipo 3 el ritmo se elige
por frases (cc. 1–4 y 5–8), y la SC acaba exactamente en el c. 4.

⟶ DECIDIDO (2026-09-30): el ejemplo de la regla 3, `④ ⑤ ⑤` en 3/4, pone el 6/4 cadencial
en el 2.º tiempo y la V en el 3.º; N9 lo admite ahora en ternario (`cadencias.md` §5).

El **periodo** va en dos sistemas, uno por frase (`<sb/>`), y **del mismo ancho**: Verovio
solo justifica el último sistema si ya ocupa el 80 % de la línea, así que la página pone
`minLastJustification: 0`.

## 6. Soprano

Mismo mecanismo que `cadencias.md` §4: **líneas preferidas como pesos**, aquí **por célula** (grados de
la soprano sobre las posiciones de la célula) y, en la cadencia, las cláusulas de Cadencias
alineadas al final (CAP/CAI para la CA, SC para la SC), con su grado final como norma.

| Célula | Líneas de soprano (peso) |
|--------|--------------------------|
| `bord-inf` ①–⑦–① | 1̂–2̂–1̂ (3) · 3̂–4̂–3̂ (3, solo V6/5) · 5̂–5̂–5̂ (2) · 3̂–2̂–1̂ (2) · 1̂–2̂–3̂ (2) |
| `bord-sup` ①–②–① | 1̂–7̂–1̂ (3) · 3̂–4̂–3̂ (3) · 5̂–4̂–3̂ (2) · 3̂–2̂–3̂ (1) |
| `bord-3` ③–④–③ | 5̂–6̂–5̂ (3) · 1̂–7̂–1̂ (3) · 1̂–1̂–1̂ (2) · 5̂–5̂–5̂ (1) |
| `paso-asc` ①–②–③ | **3̂–2̂–1̂ (4, intercambio de voces)** · 3̂–4̂–5̂ (3, 10.as con el bajo) · 5̂–4̂–3̂ (2) |
| `paso-desc` ③–②–① | **1̂–2̂–3̂ (4)** · 5̂–4̂–3̂ (3, 10.as) · 3̂–4̂–5̂ (2) |
| `salto-143` ①–④–③ | 3̂–2̂–1̂ (2) · 5̂–6̂–5̂ (2) · 1̂–1̂–1̂ (1) |
| `salto-371` ③–⑦–① | 1̂–2̂–3̂ (2) · 5̂–5̂–5̂ (2) · 3̂–2̂–1̂ (2) |
| `pedal-IV` ①–①–① | 5̂–6̂–5̂ (4) · 3̂–4̂–3̂ (4) · 1̂–1̂–1̂ (1) |
| `paso-V` ⑤–⑥–⑦ | **7̂–1̂–2̂ (4, 10.as)** · 2̂–1̂–2̂ (2) · 5̂–4̂–5̂ (2) |
| `bord-V` ⑤–⑤–⑤ | 2̂–3̂–2̂ (4) · 7̂–1̂–7̂ (4) |

Sin línea que case, penalización 3; antes del final de la célula, la mitad según el mejor
prefijo que coincida (la búsqueda elige nota a nota, como en `cadencias.md` §4). Son preferencias:
las normas siguen mandando y el resto lo deciden las preferencias generales (P7–P9).

## 7. Lecturas alternativas y guardas

- **Lecturas.** El bajo escrito se **analiza** con la misma gramática que lo generó (células,
  enlaces, cadencia, forma del tipo): se enumeran todos los análisis posibles del bajo en la
  tonalidad, y por cada nota se reúnen los acordes que aparecen en alguno. Así las
  alternativas salen de la gramática y no de una lista aparte.
- **Presentación.** Como en Bajo dado, en filas de cifrado bajo la principal, en gris. ②
  admite **tres** lecturas en el nivel 3 (VII6 · V4/3 · V6/4): se usa una **tercera fila**
  y no dos cifrados seguidos en la misma, porque las cifras apiladas de dos acordes en una
  misma línea se leen mal. Es el único caso.
- **Tonalidad única** (tipos 2 y 3): se descarta la instancia si su bajo admite algún
  análisis en la tonalidad relativa. En el tipo 1 la tonalidad se da.
- **Segmentación.** Si hay varios análisis con distinta segmentación, se muestra el
  generado; la medida de §9 dice cuántas veces pasa.

## 8. Niveles

| Nivel | Contenido | Tonalidades |
|-------|-----------|-------------|
| 1 | **Solo tríadas** (se dice en la ayuda: si no, el alumno no entiende por qué no sale su V4/3). Células con V6, VII6 e IV; `paso-V` y arpegios; enlace V6 → I. Cadencias con IV/II6 y V. | 6 mayores (trimestres 1–3) |
| 2 | + inversiones de V7 (V6/5, V4/3, V4/2), enlace V–V4/2–I6, V7 en la cadencia, II (mayor), 6/4 cadencial; **menor** (con ♯⑥ ascendente en `paso-V`) | 12 (trimestres 1–3) |
| 3 | + 6/4 de paso (V6/4) y de bordadura (IV6/4, I6/4 sobre V) | 16 (+ trimestre 4) |

## 9. Validación por generación masiva

`tests/masivo-prolongacion.js [nivel] [tipo] [n]`, sobre el patrón de `cadencias.md` §9:

1. **Cero infracciones** del comprobador independiente.
2. **Ritmo:** ningún subordinado en parte fuerte, llegada en compás entero, 6/4 cadencial
   según N9, cuadre de cada voz con el parser (compás y número de compases del tipo).
3. **Gramática:** ninguna célula repetida seguida, ningún V en estado fundamental fuera de
   la cadencia, tipo 3 siempre SC–CA con la SC en el c. 4.
4. **Lecturas:** el análisis del bajo recupera la realización generada; frecuencia de
   notas con 2 y 3 lecturas; frecuencia de segmentaciones múltiples.
5. **Tonalidad única** en los tipos 2 y 3.
6. **Frecuencias** de células, formas y cadencias (para ajustar pesos) y **render** de una
   muestra en Verovio.

⟶ HECHO (2026-09-29): core, UI y las tres páginas; en el menú, 4.º UD 0. Con 800
instancias por tipo y nivel: **0 infracciones**, **0 fallos** de ritmo, gramática, lectura y
tonalidad, y 0 problemas de render en 120 por combinación; de 1 a 6 ms por instancia. Todas
las notas tienen 1–3 lecturas (3 solo en ② del nivel 3) y **ningún bajo admite dos
segmentaciones**. Las formas salen en la proporción de §4 porque se eligen **antes** de
los reintentos (si no, la prolongación de V, con menos combinaciones válidas, bajaba al
10 %). Consecuencia del ritmo, no un veto: en el nivel 1 no sale «Prol. V + SC» en el tipo
2 (sin V4/2 no cabe en cuatro compases). Las normas nuevas (N14, excepción de N8, N11 en
las inversiones de V7) tienen sus casos en `tests/sensibilidad-comprobador.js` (28/28), y
Cadencias sigue con 0 infracciones tras los cambios del motor.
⟶ ABIERTO: revisar a ojo y oído las realizaciones y los pesos de §6; las líneas de
soprano preferidas se imponen bien en el tipo 1 (3̂–2̂–1̂ en `paso-asc`, 56 %) y menos en el
periodo, donde compiten con P7 (un solo salto en toda la soprano).

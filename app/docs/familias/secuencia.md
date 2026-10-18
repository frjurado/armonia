# Secuencia — diseño

> Decidido el 2026-10-10 (con el profesor, al proponerla). ⟶ HECHO (2026-10-10), pública
> desde el 2026-10-14. El modelo común
> —material, consigna, presentación, nivel; la página de ejercicio— está en
> `../Modelo-ejercicios.md`; lo que se reutiliza de Prolongación, en `prolongacion.md`.

Tercera familia de la UD 0 de 4.º, sobre el modelo de *Prolongación*: **bajos sin cifrar**
con **progresiones secuenciales** (apuntes c4u0 §2.4), solas o con cadencia y
prolongación. Mismo motor (`../motor-cuatro-voces.md`), mismos mínimos.

| Tipo | Clave | Extensión | Contenido |
|------|-------|-----------|-----------|
| 1 | `sec` | 3–4 cc. | la secuencia sola; la tonalidad, como dato |
| 2 | `frase` | 4 cc. | secuencia + cadencia (CA o SC) |
| 3 | `periodo` | 8 cc. | … SC ‖ … CA: Sec. + Sec., Prol. + Sec. o Sec. + Prol. |

Ficheros: `ejercicios/secuencia-core.js` (global `Secuencia`; usa de `prolongacion-core.js`
las frases de prolongación, la cadencia, el ritmo y el análisis del bajo),
`secuencia-ui.js` (UI común a los tres tipos) y `secuencia-sec.html`, `-frase.html`,
`-periodo.html`.

## 1. Catálogo

Solo las dos secuencias de los apuntes, en tríadas (la variante con 7.as es de 4.º UD 1),
cada una en dos variantes. El **módulo** son dos acordes; cada repetición, un grado más
abajo (círculo) o una 3.ª más abajo (romanesca).

| Secuencia | Variante | Acordes | Bajo |
|---|---|---|---|
| Círculo de 5.as | fundamental | I–IV · VII–III · VI–II · (V–I) | ①④⑦③⑥②⑤① |
| | alternando 1.ª inv. | I–IV6 · VII–III6 · VI–II6 · (V–I) | ①⑥⑦⑤⑥④⑤① |
| Romanesca | fundamental | I–V · VI–III · IV–I | ①⑤⑥③④① |
| | alternando 1.ª inv. | I–V6 · VI–III6 · IV–I6 | ①⑦⑥⑤④③ |

- Solo la alternancia de §2.4 (5/3–6/3). La inversa (6/3–5/3, la de la síntesis de los
  apuntes) queda fuera por ahora.
- **Círculo**: completo desde I, o empezando en el VII (VII–III · VI–II · V–I) solo en el
  tipo 1; termina siempre en II–V–I, que es a la vez fin de la secuencia y cadencia.
  (Empezar en el VI dejaría un solo módulo: ya no sería secuencia.)
- **Romanesca**: sitio fijo en la escala, de I a I (o I6).
- **Modo**: mayor y menor. Más círculo en menor (70 %) y más romanesca en mayor (55 %);
  la romanesca en menor, ~25 % de las romanescas. **En menor, dentro de la secuencia, los
  acordes de la menor natural**: VII y III mayores (sin sensible), y v menor en la
  romanesca (bajo ①–♮⑦–⑥ en la variante invertida). Solo el V final del círculo lleva la
  sensible. Los romanos, en mayúscula como siempre (la calidad la da la tonalidad; el
  americano la dice).

## 2. Realización: modelo y licencias

- **Un modelo, transportado.** El motor a cuatro voces busca la realización con una
  condición más: dentro de la secuencia, cada acorde es el de dos posiciones antes
  **trasladado** (un grado o una 3.ª abajo, en las cuatro voces). Así la secuencia lo es de
  verdad: la misma conducción en todas las voces. «Si el modelo y el enlace con el
  siguiente están bien, toda la secuencia está bien» (apuntes). **Exacto en las cuatro
  voces, también el bajo**, que sigue el movimiento secuencial (4.ª abajo, 2.ª arriba…).
  Solo si así no cabe (la romanesca en estado fundamental en Re: re2 queda por debajo de
  la tesitura del bajo), su **primera o su última nota** pueden ir a otra 8.ª: se intenta
  primero la realización sin ello, y solo si no la hay se admite (revisión del
  2026-10-10: antes, el bajo octavaba de módulo a módulo sin necesidad). El modelo solo se acepta si, trasladado por los
  módulos que quedan, las voces superiores siguen en su tesitura: si no, la búsqueda lo
  descubriría tarde y agotaría su presupuesto (el 85 % de las realizaciones fallaba antes
  de esta poda).
- **Licencias, solo dentro de la secuencia** (apuntes §2.4): tríada disminuida en estado
  fundamental (N10), sensible duplicada o sin resolver (N7) y 4.ª aumentada / 5.ª
  disminuida melódicas (N12). Las 5.as y 8.as (N4, N5) siguen prohibidas, y fuera de la
  secuencia no cambia nada. Las admiten el motor (`realizar`, opción `licencia`) y el
  comprobador (`comprobar`, opción `licencias`), para el tramo de la secuencia.

## 3. Formas

- **Tipo 1** — la secuencia sola, **un módulo por compás**, con el primer acorde del módulo
  en la parte fuerte (4/4 `2 2`, 3/4 `2 4`, 2/4 `4 4`):
  - círculo: `I IV | VII III | VI II | V I` (o desde el VII, 3 cc.). El V–I va **dentro
    del tramo de la secuencia**, sin marcar cadencia (es ambiguo: fin de la secuencia y
    cadencia a la vez; la cadencia explícita queda para la frase), aunque fuera de sus
    módulos: sin licencias ni traslado, el V con la sensible, que resuelve;
  - romanesca: `I V | VI III | IV I` (3 cc.).
- **Tipo 2** — 4 cc., secuencia + cadencia (CA o SC, a partes iguales):
  - círculo + CA: `I IV | VII III | VI II V | I` (el II es la PD de la cadencia);
  - círculo + SC: `I IV | VII III | VI II | (I6/4) V`;
  - romanesca + SC: `I V | VI III | IV I PD | (I6/4) V` (el I —o I6— final de la
    romanesca, bisagra hacia la cadencia);
  - romanesca + CA, **truncada**: `I V | VI III | IV (I6/4) V | I` (su IV hace de PD).
- **Tipo 3** — 8 cc., **SC ‖ CA** como en Prolongación. Tres combinaciones a partes
  iguales: Sec. + SC ‖ Sec. + CA, Prol. + SC ‖ Sec. + CA, Sec. + SC ‖ Prol. + CA. Si las dos
  mitades son secuencia, **de tipos distintos** (círculo y romanesca).
- **Ritmo**: el de Prolongación (`prolongacion.md` §5), con una regla más: el primer acorde
  de cada módulo, al principio de compás. Los acordes de la secuencia no son
  subordinados.

## 4. Qué se muestra, qué se pide, qué se responde

Como en Prolongación (§1 de `prolongacion.md`): solo el bajo (en el tipo 1, con la
tonalidad como dato); se pide la secuencia (cuál y en qué variante), los acordes con su
inversión y, en los tipos 2 y 3, la tonalidad y las cadencias. Al revelar: la realización,
los romanos y una **etiqueta de tramo** («C. de 5.as», «Romanesca», «Prol. I», «SC»,
«CA»; en la partitura, abreviadas) con su línea; dentro de la secuencia, **un corchete por
módulo**, sin texto, como en la figura de los apuntes; el del último, **abierto por la
derecha** si el módulo está incompleto (la romanesca truncada, que enlaza con la cadencia).
Encima de la partitura, de arriba abajo y en **filas fijas por sistema**: tonalidad (el
dato, en el tipo 1), tramos, módulos y, ya pegado a la música, el americano. Todo eso
(salvo el americano) lo dibuja la página tras el render (`ArmoniaEj.rotulosEncima`), no
Verovio: con `<reh>`, cada etiqueta cae donde cabe, y una de tramo acababa a veces en otra
fila o bajo el americano (revisión del 2026-10-10). El sitio lo reservan `pageMarginTop` y,
en el periodo, `spacingSystem`. La línea de un tramo se para antes de la etiqueta
siguiente de su fila (en la bisagra comparten acorde). En el texto, el tipo y la variante
(«Romanesca, alternando 1.ª inversión»). Las lecturas alternativas, solo en las mitades de
prolongación del periodo (el análisis de Prolongación); en la secuencia, el patrón decide.

## 5. Niveles

| Nivel | Secuencias | Lo demás (cadencia, prolongación) | Tonalidades |
|---|---|---|---|
| 1 | variantes en estado fundamental, solo mayor | como Prolongación, nivel 1 (tríadas) | mayores (trimestres 1–3) |
| 2 | + variantes alternando 1.ª inversión, + menor | + V7 e inversiones, 6/4 cadencial | 12 (trimestres 1–3) |
| 3 | igual | + 6/4 de paso y de bordadura | 16 |

## 6. Oír: las cuatro voces, con el bajo destacado

Para *Secuencia · Secuencia* y *Prolongación · Prolongación* (los tipos 1), el conmutador
«Oír» de la página común (`../Modelo-ejercicios.md` §1.3). Con el bajo solo falta la
referencia tonal; con «Oír»:

- suenan **las cuatro voces**, con el **bajo destacado** por volumen (las superiores, a
  ~55 %);
- un botón **«Solo el bajo»**, visible solo con «Oír», para la segunda escucha (primero
  todo, después el bajo, como en el dictado);
- la **tonalidad**, en el aviso «Escucha» (es el dato que en la partitura está oculto).

Sin «Oír», como hasta ahora: antes de revelar suena solo el bajo (las cuatro voces darían
la respuesta). Si el volumen no basta para destacar el bajo, lo siguiente sería un timbre
propio para él (otro instrumento del soundfont).

## 7. Pendiente: el cifrado de Caplin

⟶ ABIERTO (2026-10-10, propuesta del profesor, no urgente): cifrar la secuencia como Caplin,
igual que en Prolongación los subordinados van entre paréntesis: el primer acorde con
«sec.» («I sec.»), el resto del fragmento entre paréntesis, salvo típicamente el último
acorde. Hay que estudiarlo (dónde se cierra el paréntesis en cada secuencia, cómo convive con
la cadencia en el círculo) y tratarlo también en los apuntes antes de llevarlo a la app.

## 8. Validación

`tests/masivo-secuencia.js [nivel] [tipo] [n]`, con reglas escritas aparte: cero faltas
del comprobador de 4.º con las licencias, y sin ellas solo N7, N10 o N12 dentro de la
secuencia; el bajo de cada acorde, el grado del catálogo; el traslado, exacto en las voces
superiores (el bajo, también a la 8.ª); en menor, VII, III y v sin sensible; ritmo (cada
módulo, al principio de compás y entero en él); periodo SC ‖ CA y, con dos secuencias, de
tipos distintos; render. Con 300 instancias por tipo y nivel: **0 fallos**, ninguna sin
instancia, de 1 a 40 ms por instancia. Reparto: en el tipo 1, círculo ~45–60 % (un cuarto
de ellos desde el VII); en el 2, CA y SC a medias; en el 3, las seis combinaciones entre
30 y 70 de cada 300. Prueba en Chrome (escritorio y móvil, con y sin «Oír»): nada se
mueve al revelar.

Tras los cambios del motor (licencias, `baja`), Cadencias, Prolongación y Bajo cifrado
siguen con 0 infracciones y 0 fallos, y `sensibilidad-comprobador.js` 29/29.

## 9. Con 7.as: familia *Secuencias* de 4.º UD 1

> Decidido el 2026-10-17 con el usuario. ⟶ HECHO (2026-10-17), pública desde el 2026-10-18. Apuntes:
> c4u1 §3.1–3.2.

El mismo material, con `generar(tipo, nivel, {septimas:true})` y las páginas
`secuencia-septimas-circulo.html` (tipo 1), `-frase.html` y `-periodo.html`, sobre
`secuencia-ui.js` con `window.SEC_SEPTIMAS`. `nivel` es el de esta familia (1–2); lo demás va
con el **nivel 2 de la UD 0** (mayor y menor, V7, 6/4 cadencial, 12 tonalidades), y las
cadencias y prolongaciones admiten las 7.as de predominante (`septimas.md` §5: el perfil de
Prolongación, sin exigirlas).

| Variante (`SECUENCIAS7`) | Acordes | Bajo | Nivel | Frase y periodo |
|---|---|---|---|---|
| `quintas7` | I · IV7 · VII7–III7 · VI7–II7 · (V7–I) | ①④⑦③⑥②⑤① | 1 | sí |
| `quintas7_65` | I–IV6/5 · VII–III6/5 · VI–II6/5 · (V–I) | ①⑥⑦⑤⑥④⑤① | 2 | sí |
| `quintas7_42` | I6 · IV4/2–VII6 · III4/2–VI6 · II4/2–V6 · I | ③③②②①①⑦① | 2 | sí, con anacrusa (ver abajo) |
| `quintas7_4265` | I6 · IV4/2–VII6/5 · III4/2–VI6/5 · II4/2–V6/5 · I | el mismo | 2 | sí, con anacrusa |

- **Qué decide el bajo.** En estado fundamental, solo la cadena con todas las 7.as (la
  alternada 5/3–7 de A/S 24-6 queda fuera: los apuntes no la dan en el texto). Las dos de
  4/2 tienen el **mismo bajo**: las dos lecturas valen, y la otra sale como alternativa bajo
  cada 6/x (un spec, no un id del catálogo: `Prolongacion.toMEI` acepta los dos).
- Las de 4/2 empiezan en **I6** (`pre`): el bajo prepara la 7.ª del primer 4/2. Acaban en
  V6 → I, que no es cadencia: así solo en el tipo 1 (5 cc., el I6 y el I final en compases
  enteros).
- **Traslado** de módulo a módulo solo entre acordes de la misma forma (inversión, 7.ª): en
  `quintas7`, el I inicial no tiene 7.ª y el VII7 no lo traslada.
- **Licencias**, las de §2 (N7, N10, N12), también con 7.as: el VII7 incompleto dobla la
  sensible en mayor. N8 y **N16** (preparación de la 7.ª) siguen vigentes.
- **Cadencia** tras el círculo: II7 → V7 (3) o V (1); tras el II6/5, V (2) o V7 (1).
- **Formas.** Tipo 1: el primer acorde (sin 7.ª) a la vista (`dada`). Se pide **en qué voz**
  va la 7.ª de cada acorde y, en el nivel 2, en qué inversión está (la pregunta cambia con el
  nivel: la página la toma de `respuesta`, id `preg`). Tipo 2, como §3, con `quintas7` o `quintas7_65`.
  Tipo 3, SC ‖ CA: una mitad, el círculo con 7.as; la otra, prolongación (2), romanesca en
  tríadas (1) u otro círculo con 7.as de otra variante (1, en el nivel 2), en cualquier orden.
- **Al revelar**, además de lo de §4: cada 7.ª en el color de la respuesta (`destaca`) con su
  **ligadura de preparación** (también la del bajo en los 4/2, y hasta el 6/4 si se
  mantiene) y, en el texto, la voz de cada 7.ª y por qué van donde van (`septimasDe`).
- **Variedad ante la cadencia** (revisión del 2026-10-17): en frase y periodo, el último
  módulo puede salir del patrón (40 %): VI **sin 7.ª** (su 7.ª resolvería en 4̂, el bajo del
  II6/5) y II6/5 —o II7, si el patrón daba II6/5— como PD (`pdLibre`). La frase admite
  además la **cadencia rota** (CA 40 %, SC 35 %, CR 25 %: … II7 – V7 – VI, VI con la 3.ª
  doblada). Las de **4/2**, también en frase y periodo (en el periodo, solo como primera
  mitad): **↑I6 | IV4/2 VII6 | III4/2 VI6 | II6/5 V | I** (SC: | II6/5 | I6/4 V), con el 4/2
  en parte fuerte y el VI sin 7.ª (`fraseCuatroDos`, ritmo fijo; `compasDe` de Prolongación
  cuenta la anacrusa como c. 1, y el MEI numera el compás incompleto como 0).
- **Rótulos encima** (`ArmoniaEj.rotulosEncima`, también para la UD 0): el techo de cada
  sistema se mide sobre notas, ligaduras, pentagrama y la línea base de los cifrados (la
  caja de la clave de sol y la de un ♭ en la fuente musical llegaban muy arriba: filas
  despegadas o fuera del margen); en cada sistema, solo las filas que tienen algo; y se
  recolocan al cargar las fuentes.
- Pesos: en el nivel 2, las inversiones pesan 1,25 frente a 1 (se realizan peor y se
  reintentan más). Reparto: tipo 1, ~20 % en estado fundamental y ~27 % cada inversión;
  tipo 2, ~45/55.
- Validación: `tests/masivo-septimas.js`: 0 faltas con licencias, ninguna ajena a N7, N10 y
  N12 sin ellas, ninguna 7.ª de la secuencia sin preparar, cuadre del parser, render.

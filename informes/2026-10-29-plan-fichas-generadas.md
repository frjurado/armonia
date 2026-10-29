# Plan: verificador de fichas y fichas de repaso generadas

*29 de octubre de 2026. Parte de la primera variante a mano (`c3u1-f3b`, commit 66141c1) y
de su convención (apuntes/README.md, «Variantes»).*

## Contexto

Al hacer `c3u1-f3b` se vieron dos cosas:

- **La validación de las fichas no se puede repetir.** Los guiones dicen «comprobado con
  ConduccionCheck» o «con CuatroVocesCheck», pero los scripts que lo hicieron eran de una
  sola sesión y no están en el repo (`c4u1-f1`, además, se comprobó a mano). El de
  `c3u1-f3b` tuvo dos errores (orden de los rótulos, nombres de nota holandeses) que solo
  se vieron porque los resultados no cuadraban.
- **La app ya genera casi todo el material de las fichas.** Los núcleos `*-core.js`
  producen instancias de casi todos los tipos de `curriculum/Ejercicios-papel.md`, y
  `conduccion-check.js` y `cuatro-voces-check.js` las comprueban de forma independiente.

De ahí salen dos piezas que dependen una de otra: un **verificador de fichas**, y
**fichas de repaso generadas en lote**, en PDF y con su solución, que el alumno descarga
desde la web para practicar cuanto quiera. Es lo que ya preveía `Plan-Armonia.md` §4
(«Exámenes: modelos generados por script, Typst + LilyPond»).

## Decisiones del profesor

- **Generación en lote, por ahora.** Las variantes se generan de antemano con el proceso
  de siempre (LilyPond + Typst), no en el navegador.
- **Primera ficha: un repaso de 3.º UD 1** con cuatro ejercicios (§1).
- **Se enlazan desde la web, ficha y solución.** Hay que pensar dónde encaja en el diseño
  general (§4), sabiendo que más adelante podría extenderse al resto de fichas.
- **Se admiten ejercicios con «una solución posible»**, con dos salvaguardas:
  1. Como en la app, si hay alternativas fáciles de indicar («otros acordes posibles»),
     se indican.
  2. Se dice de forma clara que es *una* solución posible, y se marca a la vista: la
     parte de la solución que podría ser otra se imprime en gris.
- **El análisis, aplazado.** No se genera, y reunir un banco de fragmentos es un trabajo
  lento.

## 1. La ficha de repaso de c3u1

Cuatro ejercicios, cada uno sacado de una ficha de clase. Las condiciones son las de la
ficha original (su guion), puestas por escrito para que el generador las cumpla y el
verificador las compruebe.

| | Tipo | Original | Generador de la app | Condiciones | Solución |
|---|---|---|---|---|---|
| 1 | `grados-bajo-cifrado` | f2, un solo apartado | `bajo-cifrado-core` (`generar(nivel, {key, n})`) | 8 acordes, al menos 4 invertidos; 6/4 solo cadencial o de paso; en menor, sin III ni II en estado fundamental; el primero, resuelto como modelo | Única (salvo la colocación del acorde escrito, que no se corrige) |
| 2 | `construir-acordes`, `pide="mixta"` | f3, ejercicio 3 | `disposicion-core` (`colocaciones`), sin faltas | 8 acordes: 4 mixtos (2 con la 5.ª duplicada, en I, IV o V; 2 con la 3.ª, en II o VI), 2 cerrados, 2 abiertos, en orden aleatorio; el primero, dado | **Una posible** (la soprano es libre) |
| 3 | `faltas-paralelas`, a cuatro voces | f5, apartado d) | `paralelas-directas-core` (`generar4`) | 10 sonoridades; de 2 a 4 paralelas y de 1 a 2 directas entre extremas; todas consonantes; CuatroVocesCheck, sin más faltas que las buscadas; la nota de las directas tras la consigna | Única |
| 4 | `enlazar-acordes`, sin el primer acorde | f6, apartado c) | `enlace-core` (`enlazar`) sobre un bajo de `bajo-cifrado-core` con `fundamental` y `evita` | 10 acordes; sin V–VI, VI–V ni III–IV; las tres clases de enlace (1 n.c., 2 n.c., contrario) | **Una posible**: depende del primer acorde. Alternativas: los primeros acordes válidos, que se calculan probándolos todos con `enlazar` y los comprobadores (como en el guion de f6) |

En los ejercicios 2 y 4, la solución lleva la marca «Una solución posible», con las
voces superiores en gris. En el 4 se añade la lista de primeros acordes válidos. El gris
es un nuevo recurso de presentación en `ejemplos/etiquetas.ily`: hoy `\analitico`
imprime en negro.

**Tonalidades**, en todos los ejercicios: las del 1.er trimestre, y al menos una en menor
en cada ficha.

**Rótulos del ejercicio 1 (cambio también en f2).** El grado del bajo en círculo pasa a ir
*entre* los pentagramas. De arriba abajo: cifrado americano, acorde en clave de Sol,
grado del bajo, nota del bajo, cifrado y romano. Afecta a la plantilla
`grados-bajo-cifrado.ly`, y por tanto también a `c3u1-f2`; se hace en la fase 3.

**Una cara.** La ficha tiene que caber en una hoja. Con un sistema por ejercicio debería
caber, pero el ancho varía de una variante a otra (alteraciones, líneas adicionales). Se
comprueba al generar: la variante que no quepa se descarta. Si se descartan muchas,
se revisa el plan antes que aceptar dos caras.

## 2. Arquitectura

```
modelo (condiciones) ─► generador (núcleos de la app) ─► ficha .md ─► verificador ─► construir.py ─► PDF + soluciones
                                                            ▲
                                       fichas a mano ───────┘
```

- **Una ficha generada es una ficha como las demás.** Usa el mismo `.md`, los mismos
  comandos y las mismas plantillas. Todo lo que ya hace `construir.py` (series, rótulos,
  `\analitico`, una hoja) sirve sin cambios.
- **El verificador no es circular.** Los comprobadores se escribieron aparte de los
  generadores (principio de la app: `cuatro-voces-check.js`, cabecera). Que una ficha
  generada pase el verificador es una prueba real.
- **El modelo y el «perfil de diseño» son lo mismo.** Las condiciones de un ejercicio
  sirven para tres cosas: generar, comprobar que una variante a mano respeta la original
  (convención de `c3u1-f3b`) y documentar el diseño, que hoy está en prosa en el guion.

### 2.1. El verificador

`apuntes/herramientas/comprobar-fichas.js`. Usa piezas de la app, igual que
`construir.py` ya lee `curriculum-data.js`.

- **Lector de fichas.** Bloques `::: {.ejercicio}`, atributos, bloques ```` ```lilypond ````
  de una serie, voces y, para cada acorde o paso, sus rótulos (`\falta`, `\grado`,
  `\rotulo`, `\paso`, `\sinFalta`, `\acorde`, `\figuras`…). Separa lo que se da de lo que
  es solución (`\analitico`). Las notas las lee `mini-lilypond-parser.js`, el de la app,
  después de quitar y guardar los comandos de ficha: así no hay un segundo analizador de
  notas.
- **Comprobación por tipo**, registrada en un mapa `tipo → función`. Cada función
  comprueba dos cosas:
  - que la solución no tenga faltas que no se pretendían;
  - que lo anotado sea lo que hay (la falta escrita es la que encuentra el comprobador;
    la disposición pedida es la de la solución; el grado y la cifra corresponden al
    bajo).

  Un tipo sin función sale en el informe como **«sin comprobar»**, nunca como «bien».
- **Comprobación contra un modelo o contra la original.** Si la ficha es una variante
  (`cXuY-fNb`), su perfil (tipos, número de acordes o pasos, clases de faltas y
  disposiciones, `pide=`) se compara con el de la original. Si es generada, con las
  condiciones del modelo.
- **Salida:** una línea por acorde o paso, para que se pueda revisar con criterio
  musical, y un código de error si hay discrepancias.

### 2.2. El modelo

Propuesta, que se decide en la fase 2: un fichero
`apuntes/fichas/modelos/c3u1-repaso.md` con la misma forma que una ficha (cabecera YAML,
guion, bloques `::: {.ejercicio tipo=…}`), pero que, en lugar de material LilyPond, lleva
un bloque de condiciones:

````
::: {.ejercicio tipo="construir-acordes" pide="mixta"}
```condiciones
tono: mayor
acordes: 8
disposiciones: mixta-5 ×2, mixta-3 ×2, cerrada ×2, abierta ×2
orden: aleatorio
dado: primero
```
:::
````

Las condiciones son pocas y tienen nombre, para que usted pueda leerlas y cambiarlas.
Las que admite cada tipo se documentan junto al tipo, en `Ejercicios-papel.md`.

### 2.3. El generador

`apuntes/herramientas/generar-fichas.js`, con un adaptador por tipo, que hace tres cosas:

1. Llama al núcleo de la app con las opciones que ya admite (`key`, `n`, `fundamental`,
   `evita`…).
2. Si hace falta, genera y descarta hasta que se cumplan las condiciones. Es lo más
   sencillo para empezar. Solo si resulta lento, se añaden opciones nuevas al núcleo,
   sin cambiar lo que hace la app.
3. Convierte la instancia al bloque `.md`, con los comandos de ficha.

**Requisito previo: una semilla.** Los núcleos usan `Math.random`. Para poder regenerar
una variante idéntica, los núcleos implicados (`bajo-cifrado`, `disposicion`,
`paralelas-directas`, `enlace`, `cuatro-voces`, `contrapunto`, `movimientos`) deben
aceptar un generador aleatorio inyectable, por defecto `Math.random`. Es un cambio
mecánico y la app no nota la diferencia; las pruebas `masivo-*.js` lo confirman.

### 2.4. El banco

- **Un banco fijo, versionado en el repo.** Las variantes se generan cuando usted lo pide
  (`construir.py --generar c3u1-repaso`, 20 al principio), se verifican y se guardan como
  `.md` en `apuntes/fichas/banco/c3u1-repaso/01.md`, `02.md`… La publicación (Actions)
  solo las compila.
- **Por qué fijo.** Si un núcleo cambia, no cambia en silencio la variante n.º 17 que ya
  tiene un alumno. Además, cada variante se puede revisar en el diff, igual que una ficha
  a mano. Pesa poco: unos kB por variante.
- **Salida:** `build/c3u1-repaso-17.pdf` y `build/c3u1-repaso-17-soluciones.pdf`, unos
  120 kB por pareja. Con 20 variantes, unos 2,5 MB por modelo. El título dice curso,
  unidad y número («3.º — UD 1 · Repaso n.º 17»), para poder hablar de ella en clase.

## 3. Soluciones con alternativas

- **Rótulo.** En la solución, encima del ejercicio y bien visible: «Una solución
  posible». La consigna de la ficha no cambia.
- **Gris.** Las notas que podrían ser otras (voces superiores en los ejercicios 2 y 4)
  van en gris. Lo que es único (el bajo, los grados, las faltas) sigue en negro o en el
  color de siempre.
- **Alternativas.** Si se pueden enumerar con poco texto, se enumeran. En el ejercicio 4,
  los primeros acordes válidos («También valen: do–sol–mi, sol–mi–do…»). En el 2 no se
  enumeran: las sopranos posibles son demasiadas para listarlas con poco texto.
- Más adelante, para `realizar-bajo`: las lecturas alternativas por casilla que ya
  calcula `cadencias-core.js` («otros acordes posibles», como en la app).

## 4. La web

Hoy las fichas no se enlazan. Lo que se enlaza es esto:

- en los apuntes, la cabecera de la unidad: «Ejercicios», «PDF», «Ejemplos»;
- en la app, el menú por unidades, con «Apuntes →».

Todo se declara en un solo sitio (`apuntes` de cada consigna, en `curriculum-data.js`),
y nunca se enlaza a una página que no existe (`Modelo-ejercicios.md` §3.1). Para no
complicar la web, la propuesta es **un solo tipo de página nuevo**, no un subsistema:

- **Una página «Fichas» por unidad** (`apuntes/c3u1-fichas.html`), que genera
  `construir.py`. Por ahora tiene una sección, «Repaso», con un botón «Otra
  ficha» que elige al azar del banco (un poco de JS, con la lista de números escrita en
  la página), el número visible y el enlace «Ficha (PDF)». La solución va **detrás de un
  clic**, con un freno explícito («¿Has hecho ya los ejercicios? Si no, ver la solución
  no te servirá de mucho.» o similar) antes del enlace «Solución (PDF)».
- **Desde dónde se llega:** «Fichas» en la cabecera de los apuntes de la unidad, junto a
  «PDF» y «Ejemplos». En el menú de la app, «Fichas →» junto a «Apuntes →». Los dos
  aparecen solo si la unidad tiene alguna ficha publicada, con la misma regla que
  «Ejercicios».
- **Cómo se publica:** con `publico: true` en la cabecera del modelo (y, en su día, de
  cada ficha de clase), en la misma cascada que el resto.
- **Ampliación prevista:** cuando usted quiera publicar fichas de clase, la misma página
  tendrá una segunda sección («Fichas de clase»), con el mismo formato de enlaces. Las
  variantes (`f3b`) aparecen junto a su original.

## 5. Fases

Cada fase termina con algo que usted puede revisar, y no se pasa a la siguiente sin su
visto bueno.

1. **Verificador: lector y comprobaciones.** Los tipos de 3.º UD 1, empezando por los
   cuatro del repaso y los de disposición. *Hecho cuando:* lee las once fichas actuales
   sin error y da un informe de cada una. Si encuentra algo en una ficha ya repartida,
   se le comunica antes de tocarla.
2. **Formato del modelo y comparación de perfiles.** El modelo de `c3u1-repaso` con sus
   condiciones; `c3u1-f3b` comprobada contra `c3u1-f3`. *Hecho cuando:* usted aprueba el
   formato de las condiciones.
3. **Semilla en los núcleos y prototipo de un tipo:** `grados-bajo-cifrado` (solución
   única, el más sencillo), con el grado del bajo entre los pentagramas (también en
   `c3u1-f2`). Diez variantes en PDF, en local. *Hecho cuando:* usted las da
   por buenas como material, o las condiciones se corrigen con lo que no le guste.
4. **Los cuatro tipos y la ficha completa:** adaptadores, gris y rótulo «Una solución
   posible», alternativas del ejercicio 4, control de una hoja. Diez repasos completos
   para revisar.
5. **Banco y web:** `--generar`, banco fijo, página «Fichas», enlaces en apuntes y app,
   README, `Ejercicios-papel.md` (condiciones por tipo) y un informe de cierre con
   HISTORIA.
6. *(Más adelante)* Repasos de otras unidades; modelos de examen (`Plan-Armonia.md` §4);
   banco de fragmentos para análisis; generación en el navegador, si hiciera falta.

## 6. Riesgos

- **Correcto no es lo mismo que bien diseñado.** Un generador puede dar material sin
  faltas pero soso o raro: tesituras extremas, acordes repetidos, líneas sin dirección.
  La defensa es su revisión en las fases 3 y 4. Lo que no le guste se convierte en una
  condición.
- **Los núcleos pasan a tener dos usos, la app y el papel.** Un cambio pensado para la
  pantalla puede afectar a las fichas. El banco fijo evita sorpresas, y el verificador
  lo detecta al regenerar.
- **La web.** Se añade un tipo de página. Para que no crezca sin control: una sola
  declaración (`publico` en el modelo), los mismos enlaces condicionados y nada que no
  exista.
- **Una hoja.** Si los cuatro ejercicios no caben con holgura, hay que elegir entre
  menos acordes, dos caras o un ejercicio menos.

## 7. Decisiones

Respondidas por el profesor el mismo 29 de octubre:

1. **Formato del modelo** (§2.2): **abierta**. Tras la fase 1 se exponen las ventajas e
   inconvenientes de cada opción (bloque de condiciones dentro de un `.md`, o fichero de
   datos aparte) y se decide.
2. **Tamaño del banco:** 20 variantes para empezar.
3. **Nombre visible:** «Repaso», con curso y unidad en el título.
4. **La solución:** detrás de un clic, con un freno explícito (§4).
5. **Ejercicio 1:** con el primer acorde resuelto como modelo. Además, el grado del bajo
   pasa a ir entre los pentagramas (§1).
6. **Ejercicio 3:** de 2 a 4 paralelas y de 1 a 2 directas.
7. **Tonalidades:** las del 1.er trimestre, y al menos una en menor en cada ficha.
8. **Una cara.** Si se sale a menudo, se revisa el plan o se aceptan dos caras.
9. **Verificador y construcción:** avisar en las fichas a mano; descartar en las
   generadas.

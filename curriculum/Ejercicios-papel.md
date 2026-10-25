# Ejercicios en papel — catálogo de tipos

Los ejercicios **medianos** y **extensos** del plan (`Plan-Armonia.md` §4): los
que se hacen en papel, en clase o en casa, frente a los breves de la app.
Se reparten en **fichas**, varias por unidad.

Aquí se define cada **tipo** de ejercicio: qué se da, qué se pide y con qué
consigna. El **material** concreto de cada serie (qué bajo, qué fragmento) no
va aquí, sino en las fichas: `apuntes/fichas/c3u1-f1.md`, etc. Cómo se escribe
una ficha y cómo se compila está en `apuntes/README.md`, «Fichas de
ejercicios».

Al añadir un tipo, la pregunta es la misma que para cualquier documento de
`curriculum/`: si desaparecieran los apuntes, ¿seguiría significando algo?
La consigna y lo que se pide, sí; cómo se dibuja en la partitura, no, y por
eso la plantilla LilyPond de cada tipo vive con los apuntes
(`apuntes/fichas/plantillas/<tipo>.ly`).

## Tipos

`construir.py` lee esta tabla: la primera columna es el identificador (entre
comillas invertidas, estable: las fichas lo citan) y la segunda la consigna,
que se imprime en la ficha. Las demás columnas son para quien escribe fichas.

En la consigna:

- `{tono}` (o cualquier otro `{atributo}`) se sustituye por el que lleve el
  ejercicio en la ficha.
- `[nombre: texto]` es un **fragmento opcional**: sale solo si el ejercicio
  lo pide (`pide="cadencias"`; varios, separados por espacios), y si no,
  desaparece. Así un mismo tipo vale para unidades que piden más o menos
  cosas —señalar las cadencias, cuando ya se han estudiado— sin duplicar
  filas. El texto va tal cual (con su coma o su punto delante, si los
  necesita).
- Para el caso raro que no encaje, `consigna="…"` en el ejercicio sustituye
  la consigna entera.

| Tipo | Consigna | Se da | Se pide | Desde |
|------|----------|-------|---------|-------|
| `grados-bajo-cifrado` | En {tono}. Debajo de cada nota del bajo, escribe su grado (①, ②…) y el grado del acorde (I, V…). En el pentagrama de Sol, escribe el acorde, y encima, su cifrado americano (C, Dm/F…). | Tonalidad y un bajo cifrado, nota a nota. | Grado del bajo, grado del acorde, el acorde escrito (sin enlazar) y su cifrado americano, que dice el tipo de tríada. | 3.º UD 1 |
| `faltas-disposicion` | Los acordes son independientes: no hay enlace entre ellos. Debajo de cada uno, escribe su falta, si la tiene (una voz fuera de su tesitura, más de una 8.ª entre dos voces contiguas, o un cruce); si está bien, escribe su disposición: cerrada, abierta o mixta. | Tríadas sueltas a cuatro voces, en estado fundamental. | La falta de cada acorde, o su disposición. | 3.º UD 1 |
| `construir-acordes` | En {tono}. Cada nota del bajo es la fundamental de un acorde: escribe las otras tres voces en la disposición indicada encima, duplicando la fundamental[mixta:  o, en la mixta, la nota indicada entre paréntesis]. | El bajo de tríadas sueltas en estado fundamental, y la disposición de cada una. | Las tres voces superiores, sin faltas y en la disposición pedida. | 3.º UD 1 |
| `faltas-melodicas` | Señala con un corchete, encima de las notas, cada falta de la melodía, y di cuál es: un intervalo aumentado o disminuido, un salto demasiado grande, o dos saltos seguidos en la misma dirección que sumen una 7.ª o una 9.ª. Señala también, entre paréntesis, los saltos de 4.ª o mayores que no se compensan. | Una línea melódica, sin compás. | Las faltas melódicas (N12, N13, N15) y los saltos sin compensar (P9). | 3.º UD 1 |
| `movimientos-armonicos` | Entre cada sonoridad y la siguiente, escribe debajo el movimiento armónico de las dos voces: contrario, oblicuo, directo o paralelo. | Dos voces, cada una en su pentagrama. | El movimiento de cada paso. | 3.º UD 1 |
| `paralelas` | Busca todos los movimientos paralelos entre cualquier pareja de voces. Escríbelos debajo, entre los dos acordes, con las voces y el intervalo que forman (S–A 3.as), y marca los que sean incorrectos. | Un fragmento a cuatro voces. | Cada paralela, con sus voces y su intervalo; las 5.as y 8.as, como faltas. | 3.º UD 1 |
| `faltas-paralelas` | Busca las 5.as y 8.as paralelas, también las que se forman por movimiento contrario (8.ª → 15.ª, 5.ª → 12.ª). Escribe cada una debajo, entre las dos sonoridades: el intervalo y, a tres o cuatro voces, entre qué voces (5.as par., S–B). | Fragmentos de dos a cuatro voces, sin compás. | Cada falta de N4, con sus voces; si se pide, también las directas de N5. | 3.º UD 1 |
| `enlazar-acordes` | En {tono}. Cada nota del bajo es la fundamental de un acorde. Enlázalos a cuatro voces, duplicando siempre la fundamental: si dos acordes seguidos tienen notas comunes, mantenlas en la misma voz, y lleva las demás por grado a las notas que faltan; si no las tienen, lleva las tres voces superiores por movimiento contrario al bajo, cada una a la nota más cercana del acorde siguiente. | Un bajo en estado fundamental y, si se da, el primer acorde, cerrado o abierto. | Las tres voces superiores de los demás acordes (y del primero, si no se da). | 3.º UD 1 |
| `analisis` | Analiza el fragmento: indica la tonalidad y, debajo, el grado de cada acorde con su cifra[cadencias: . Señala también las cadencias]. | Un fragmento de repertorio. | Tonalidad y grado de cada acorde. Las notas extrañas, cuando se hayan visto. | 3.º UD 1 |
| `realizar-bajo` | Armoniza el bajo dado, y realiza a cuatro voces. Indica la tonalidad, los grados y el cifrado[cadencias: , así como las cadencias que realices].[septimas:  Utiliza al menos un acorde de 7.ª distinto del V7.][secuencias:  Señala la secuencia de 7.as.] | Un bajo sin cifrar, con su ritmo. | Elegir la armonía (cadencias, prolongaciones, secuencias), escribir las tres voces superiores y cifrar. | 3.º UD 2 |
| `septima-bajo-cifrado` | Cada gesto cadencial empieza con su primer acorde escrito. Primero, escribe la 7.ª del acorde de séptima, ligada a su preparación, y su resolución; después, completa las cuatro voces. | Dos o tres gestos cadenciales en un mismo sistema, cada uno en su tonalidad: el bajo cifrado y el primer acorde. | La voz de la 7.ª, preparada y resuelta, y el resto de la realización. | 4.º UD 1 |
| `septima-ligadura` | Cada gesto cadencial empieza con su primer acorde escrito, y la ligadura señala la nota que se prepara como 7.ª. Escribe debajo del bajo el grado de cada acorde con su cifrado; después, la 7.ª y su resolución, y por último completa las cuatro voces. | Como el anterior, con el bajo sin cifrar y la ligadura de preparación. | II o IV y su inversión, la 7.ª resuelta y el resto de la realización. | 4.º UD 1 |
| `secuencia-triadas` | Di qué secuencia es cada bajo, escribe debajo los grados y realízala a cuatro voces. | Dos o tres secuencias breves en un mismo sistema, cada una con su tonalidad: solo el bajo, sin cifrar. | El tipo de secuencia, los grados y la realización. | 4.º UD 0 |

## Notas sobre cada tipo

### `grados-bajo-cifrado`

Un ejercicio de lectura, sin conducción de voces. Obliga a hacer por
separado las tres operaciones de 3.º UD 1 §1.2 sobre el mismo acorde: el
grado del bajo (①), el grado de la fundamental con su cifra (I6), y el tipo
de tríada (C/E), que es lo que el romano no dice. El acorde se escribe en
clave de Sol en cualquier disposición: aquí no se enlaza.

Material: tonalidad del trimestre; cada acorde en redonda, con su cifra. Las
alteraciones que pida la tonalidad (la sensible del menor) van en la cifra
(♯, ♯6), como en un bajo cifrado de verdad.

Va bien en serie (varios apartados con una sola consigna; ver
`apuntes/README.md`): cuatro bajos de ocho acordes caben en una hoja.

### `faltas-disposicion`

La versión en papel de Disposición › A cuatro voces de la app
(`app/docs/familias/disposicion.md`), con más acordes. Cada acorde está bien
o tiene **una** falta: voz fuera de tesitura (N1), más de una 8.ª entre
soprano y contralto o entre contralto y tenor (N2), o cruce (N3). Si está
bien, se pide su disposición (cerrada, abierta o mixta, según la distancia
tenor–soprano: 3.º UD 1 §2.1).

Material: tríadas en estado fundamental, en blancas (la plica dice qué voz
es cuál), sin unísonos. Duplicaciones como en la app: cerrada y abierta, la
fundamental; mixta, la 3.ª o la 5.ª. La falta, con las voces que la causan.

### `construir-acordes`

El ejercicio inverso del anterior: dado el bajo (la fundamental) y la
disposición, escribir el acorde. Con `pide="mixta"` entra la disposición
mixta, en la que soprano y tenor están a una 8.ª: la nota duplicada no puede
ser la fundamental (el acorde quedaría incompleto), así que se dice cuál
(«mixta (5.ª)»), y se elige según las duplicaciones de los mínimos §4: la
5.ª en I, IV y V; la 3.ª en II y VI.

Material: la solución es **una** de las posibles; la posición (la nota de la
soprano) la elige el alumno.

### `faltas-melodicas`

La versión en papel de Movimientos › Melódicos (`familias/movimientos.md`),
con una línea más larga y varios defectos: intervalos aumentados y
disminuidos (N12; la 5.ª disminuida que vuelve hacia dentro es correcta, y
conviene que aparezca alguna), saltos excesivos (N13, con el tope de cuatro
voces), saltos sumados de 7.ª o 9.ª (N15), y, como mejorable, saltos de 4.ª
o más sin compensar (P9).

Material: comprobado con el comprobador de la app (`conduccion-check.js`), que
es el que dice qué defectos hay. En menor, la 2.ª aumentada 6̂–♯7̂.

### `movimientos-armonicos`

La versión en papel de Movimientos › Armónicos, nivel 1. Las dos voces son
contrapunto consonante y sin faltas: se pregunta el movimiento, no se buscan
errores.

Material: variedad de los cuatro tipos; los directos, a consonancia
imperfecta (una 5.ª u 8.ª directa entre extremas, aunque sea correcta,
distrae de lo que se pregunta).

### `paralelas`

A cuatro voces, buscar todas las paralelas (paralelo en el sentido de 3.º
UD 1 §2.3: la misma amplitud) en las seis parejas, y distinguir las
correctas (3.as, 6.as, 10.as…) de las 5.as y 8.as (N4). Conviene incluir una
5.ª justa que pasa a disminuida (correcta, §2.4).

Material: un fragmento sin más faltas que las paralelas que se buscan,
comprobado con `conduccion-check.js`. Los intervalos, con su amplitud real
(15.as, 17.as): que el alumno los reconozca como 8.as o 3.as compuestas es
parte del ejercicio.

### `faltas-paralelas`

La versión en papel de Paralelas y directas › Buscar faltas
(`app/docs/familias/paralelas-directas.md`), con más sonoridades y la
textura creciendo de un apartado al siguiente: dos voces en un pentagrama,
dos en las dos claves, tres (dos arriba y el bajo) y cuatro. Solo se buscan
faltas: las paralelas correctas (3.as, 6.as) no se escriben, a diferencia
de `paralelas`. Las directas (N5) entran solo donde la ficha lo dice, en una
nota tras la consigna («En d), …»), y a cuatro voces.

Material: comprobado con `conduccion-check.js` (y a cuatro voces, con los
acordes, con `cuatro-voces-check.js`): sin más faltas que las buscadas. Los
rótulos, los de la app: «5.as par.», «8.as par. contr.», «8.ª dir.», con
las voces debajo a partir de tres voces («(S–B)»). Conviene que haya
distractores correctos: directas entre voces interiores, o entre las
extremas con la soprano por grado conjunto.

### `enlazar-acordes`

La versión en papel de Paralelas y directas › Enlazar acordes: la consigna
básica (apuntes c3u1, final de §2.5; Minimos P4), que desde el primer
acorde da una sola solución y conserva la disposición. Si el primer acorde
no se da, lo elige el alumno, y la solución es una de varias; no todos los
primeros acordes valen hasta el final (una voz se sale de su tesitura o se
cruza con el bajo), y eso también se aprende.

Material: el bajo con la gramática de la app (`enlace-core.js`): fuera
V–VI, VI–V y III–IV, en los que la consigna haría bajar la sensible. La
solución, calculada con `enlazar` de la app y comprobada con los dos
comprobadores; los rótulos de cada enlace («1 n.c.», «2 n.c.», «contr.»),
solo en ella.

### `analisis`

El fragmento se da tal cual está en la partitura, a su tamaño de piano. La
solución lleva los grados bajo el bajo; lo que no sea un acorde (la
semicorchea de paso de la *Marcha del soldado*) se deja sin cifrar hasta que
se vean las notas extrañas.

Material: fragmentos de repertorio de dominio público. Si la fuente es una
edición moderna con licencia (Mutopia, p. ej.), se cita en un comentario del
material.

### `realizar-bajo`

El ejercicio central de la escritura: sin cifras, el alumno decide la
armonía a partir del bajo (qué es cadencia, qué prolonga, qué es secuencia)
y la realiza a cuatro voces. El primer acorde va resuelto como modelo, con
su disposición y su cifrado.

Material: un bajo de 8 compases con su ritmo, y la solución completa, que
tiene que cumplir los mínimos de conducción (`Minimos-conduccion.md`) de la
unidad a la que va. Es **una** solución: en la corrección valen otras
igual de correctas, y conviene decirlo en clase.

Una forma cómoda de comprobarla: fijar el bajo y la soprano y dejar que el
motor a cuatro voces de la app (`cuatro-voces-core.js`) busque contralto y
tenor; el conjunto se pasa por el comprobador independiente
(`cuatro-voces-check.js`). Así se hicieron las de `c4u0-f2`.

Con `pide="septimas"` (4.º UD 1), la consigna pide además una 7.ª que no sea
la del V: el bajo tiene que dejar sitio para ella, en la prolongación (el ①
repetido que admite un II4/2) o en la cadencia (④ antes del 6/4 o del V).

Con `pide="secuencias"` (4.º UD 1), el bajo empieza con un círculo de 5.as con 7.as
(apuntes c4u1 §3.1–3.2), en una de sus variantes —estado fundamental, alternando
con 6/5, alternando con 4/2— y sigue hasta la cadencia: es la frase (tipo 2) de
Secuencias en la app. El bajo decide qué acordes llevan 7.ª, salvo en la de 4/2,
donde los 6/3 pueden ser 6/5 (las dos valen). La solución lleva las ligaduras de
preparación; la del bajo, con `\ligadura` (solo sale con el análisis).

### `secuencia-triadas`

La versión en papel de Secuencia › Secuencia (4.º UD 0, `app/docs/familias/secuencia.md`):
la secuencia sola, con la tonalidad como dato. Se pide reconocerla por el bajo
(cuál y en qué variante), cifrarla y realizarla; la realización tiene que ser
secuencia de verdad, la misma conducción trasladada en cada módulo.

Material: realizaciones del motor de la app (`secuencia-core.js`, que las busca
con el traslado exacto y las licencias de la secuencia: N7, N10, N12), en un
sistema con las armaduras y la doble barra en `global`, como `septima-bajo-cifrado`.

### `septima-bajo-cifrado`

La versión en papel de 7.ª diatónica › II grado (`app/docs/familias/septimas.md`),
terminada a cuatro voces. El orden es lo que se enseña: primero la línea de la
7.ª (preparación, 7.ª, resolución, y entre medias el 6/4 si lo hay), y el
resto de las voces alrededor. Como en la app, en el primer acorde solo **una**
voz superior lleva la nota que será la 7.ª, para que la voz sea única; en
gestos distintos, voces distintas.

Material: dos o tres gestos, mayor y menor, en un sistema (las armaduras y la
doble barra, en `global`; la tonalidad no se dice: la dan la armadura y el
primer acorde). Cifras
como en un bajo cifrado: la sensible del menor con su alteración (5/♮ tras el
6/4 en Fa menor). La solución lleva la ligadura de preparación.

### `septima-ligadura`

La versión en papel de 7.ª diatónica › II y IV grados. El bajo sin cifrar y la
nota ligada deciden el acorde: sobre ④, 1̂ ligado es II6/5 y 3̂ es IV7; sobre
⑥, II4/3 o IV6/5 (este, solo en mayor). Conviene que dos gestos compartan el
grado del bajo y difieran en la nota ligada.

Material: como el anterior; la ligadura llega a una nota oculta (`\llega` en
la plantilla), así que se ve de dónde sale pero no se lee nada más.

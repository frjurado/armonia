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
que se imprime tal cual en la ficha. En la consigna, `{tono}` (o cualquier
otro `{atributo}`) se sustituye por el que lleve el ejercicio en la ficha.
Las demás columnas son para quien escribe fichas.

| Tipo | Consigna | Se da | Se pide | Desde |
|------|----------|-------|---------|-------|
| `grados-bajo-cifrado` | En {tono}. Debajo de cada nota del bajo, escribe su grado (①, ②…) y el grado del acorde (I, V…). En el pentagrama de Sol, escribe el acorde, y encima, su cifrado americano (C, Dm/F…). | Tonalidad y un bajo cifrado, nota a nota. | Grado del bajo, grado del acorde, el acorde escrito (sin enlazar) y su cifrado americano, que dice el tipo de tríada. | 3.º UD 1 |
| `analisis` | Analiza el fragmento: indica la tonalidad y, debajo, el grado de cada acorde con su cifra. | Un fragmento de repertorio. | Tonalidad y grado de cada acorde. Las notas extrañas, cuando se hayan visto. | 3.º UD 1 |

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

### `analisis`

El fragmento se da tal cual está en la partitura, a su tamaño de piano. La
solución lleva los grados bajo el bajo; lo que no sea un acorde (la
semicorchea de paso de la *Marcha del soldado*) se deja sin cifrar hasta que
se vean las notas extrañas.

Material: fragmentos de repertorio de dominio público. Si la fuente es una
edición moderna con licencia (Mutopia, p. ej.), se cita en un comentario del
material.

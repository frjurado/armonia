# Fichas generadas: cierre del plan (fases 1–5)

*3 de noviembre de 2026. Cierra el [plan del 29 de octubre](2026-10-29-plan-fichas-generadas.md).
Commits `089ff24` (fase 1) a `eab38a0` (fase 4), y el de la fase 5.*

## Qué hay

- **Verificador** (`apuntes/herramientas/comprobar-fichas.js`). Lee las fichas y
  contrasta su material con los comprobadores de la app; da el perfil de cada ejercicio
  (cuántos acordes, de qué clase…), compara una variante con su original y una ficha con
  su modelo. Once fichas de clase sin discrepancias; los avisos que quedan son
  discrepancias de criterio, apuntadas en el README de los apuntes para resolverlas.
- **Modelos** (`apuntes/fichas/modelos/`): una ficha sin material, con las condiciones
  de cada ejercicio (formato A del plan: un bloque `condiciones` dentro del `.md`). El
  vocabulario de cada tipo está en `curriculum/Ejercicios-papel.md`, «Condiciones de
  cada tipo».
- **Generador** (`apuntes/herramientas/generar-fichas.js`). Un adaptador por tipo pide
  el material al núcleo de la app, lo escribe como bloque de ficha y lo verifica. Cuatro
  tipos: `grados-bajo-cifrado`, `construir-acordes`, `faltas-paralelas` (a cuatro voces)
  y `enlazar-acordes`. La app no cambia: la semilla sustituye a `Math.random` desde
  fuera, y las opciones nuevas del núcleo de paralelas son opcionales.
- **Banco y web.** `construir.py --generar c3u1-repaso` rehace el banco de 20 fichas en
  `apuntes/fichas/banco/c3u1-repaso/`, que se versiona. Cada unidad con banco tiene una
  página «Fichas» (`c3u1-fichas.html`), enlazada desde la cabecera de la unidad, el
  índice y el menú de la app («Fichas →»).

## Decisiones tomadas por el camino

Las del plan (§7) se mantienen; estas se añadieron o lo cambiaron:

- **Dos páginas, no una.** El repaso completo ocupa dos caras; ajustarlo a una
  obligaba a forzar el grabado, y no merece la pena.
- **Sin lista de alternativas** en el ejercicio 4 («otros primeros acordes que
  valen»): se queda «Una solución posible.» y el gris. Corrige §3 del plan.
- **Romano con las cifras del estado fundamental** (V♯, V5/3) en `grados-bajo-cifrado`,
  también en las fichas de clase f1 y f2; en el acorde de muestra, el romano sin cifras.
  Grado del bajo entre los pentagramas, algo mayor, y todos los textos centrados en la
  nota.
- **Buena conducción en el ejercicio 3**, más allá de las faltas buscadas: ni saltos
  sin compensar ni unísonos. Con ese criterio caben unas 2 paralelas y 1 directa en 10
  sonoridades (con 4 faltas o más casi nunca sale), y el modelo pasó de «2–4 / 1–2» a
  «2 / 1». No se eximió al bajo de P9: sería un criterio nuevo para Minimos.
- **Sin repeticiones en un lote.** En menor, el bajo de `enlazar-acordes` (solo I, IV,
  V y VI en estado fundamental) da para 25–30 sucesiones, y el generador concentraba la
  cuarta parte en una: de diez fichas, tres llevaban el mismo bajo. Ahora cada ejercicio
  de un lote deja su huella (modo y grados del bajo) y las tonalidades se reparten. Solo
  se evitan los bajos idénticos, no los parecidos; si molesta, se puede pedir una
  distancia mínima.
- **Nombre de las fichas del banco**: `c3u1-repaso-01.md` (no `01.md`, como decía el
  plan), para que el PDF salga con su nombre sin más reglas.

## Cómo se usa

    node herramientas/generar-fichas.js c3u1-repaso --cuantas 10   prueba, en tmp/
    python herramientas/construir.py --generar c3u1-repaso         el banco, 20

El banco se revisa en el diff y en los PDF de `build/`; la página, en
`build/c3u1-fichas.html`. Sale al sitio cuando la unidad **y el modelo** llevan
`publico: true` (el de `c3u1-repaso` lleva `false` hasta que se decida publicarlo).

## Pendiente

- Publicar el repaso de c3u1 (`publico: true` en el modelo).
- Repasos de otras unidades; modelos de examen; análisis (fase 6 del plan).
- Las discrepancias de criterio del README de los apuntes (III natural y 6/4 final en
  f1; P9 en f5).
- Pentagrama más grande en las fichas (README, «Fichas: pendiente de probar»).
- Llevar al repo, como pruebas, las comprobaciones de las fases 1 y 2 que se hicieron
  fuera (mutantes del verificador, pruebas del formato de modelo).

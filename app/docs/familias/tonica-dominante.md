# Tónica y dominante — diseño

> Decidido el 2026-11-18 (estudio de la casuística y respuestas del profesor, en la
> conversación de ese día). ⟶ HECHO el mismo día: `tonica-dominante-core.js` + tres
> páginas (`tonica-dominante-bajo.html`, `-canto.html`, `-cadencia.html`) y
> `tests/masivo-tonica-dominante.js`. Pública el 2026-11-18.

Hoy en el plan: 3.º UD 2, familia *Estado fundamental* (vendrá otra, *1.ª inversión*, con
I6, V6 y VII6). Apuntes: c3u2 §1. Reglas vigentes: las de 3.º UD 2 en
`curriculum/Minimos-conduccion.md` §6, con la licencia N11I (abajo).

## Material

- **Solo I y V** (sin 7.ª), **en estado fundamental**, **alternados** (nunca I–I ni V–V);
  de dos a cuatro acordes.
- **El bajo**: ① y ⑤, por 4.ª o 5.ª (nunca 8.ª).
- **La soprano**: por grado conjunto, en **7̂ 1̂ 2̂ 3̂** (1̂ y 3̂ sobre el I, 7̂ y 2̂ sobre el
  V); nunca en 5̂ (sería una soprano estática sobre la nota común). Sin saltos 3̂–7̂.
- Blancas, en un compás sin métrica visible, como *Enlazar acordes* (3.º UD 1).
- **Tonalidades del 1.er trimestre** (Do, Sol, La m, Re m), mayores y menores desde el
  principio (en menor, el V con la sensible).
- Se da siempre **la tonalidad**, encima del primer tiempo (la armadura no dice el modo).

## La realización «obvia» y las cesiones

La de la UD 1: **la nota común (5̂) se mantiene**, las demás voces van **por grado** a las
notas que faltan y **la sensible sube a la tónica**. Con todos los acordes completos y la
fundamental duplicada.

Cabe siempre que la soprano se mueva entre 1̂ y 7̂ o entre 3̂ y 2̂. **No cabe con 2̂–1̂ (V–I) ni
1̂–2̂ (I–V)**: si la sensible sube y 5̂ se queda, al I le falta la 3.ª (o al V la sensible).
Hay que ceder algo, y cualquiera de estas soluciones vale:

| Cesión | Ejemplo en Do (V–I, soprano 2̂–1̂) | Norma |
|---|---|---|
| **El I sin 5.ª**, con la fundamental triplicada | V Re–Si–Sol–Sol → I Do–Do–Mi–Do | licencia N11I |
| **La sensible interior baja a 5̂**, bajo el 1̂ de la soprano | V Re–Si–Sol → I Do–Sol–Mi | N7 (excepción) |
| **Un salto** (3.ª o 4.ª) en una voz interior, sin nota común | I–V, soprano 1̂–2̂: el tenor Sol–Si | — |

Por eso las líneas «difíciles» son las que tienen 2̂–1̂ o 1̂–2̂ (1–2, 2–1, 1–2–1, 3–2–1,
2–1–7, 7–1–2, 3–2–1–7, 2–1–7–1…). En el **bajo dado con el primer acorde dado** nunca
aparecen: desde un primer acorde con la soprano en 1̂/3̂ (I) o 7̂/2̂ (V), la conducción obvia
lleva a 1–7–1 o 3–2–3, nunca a 1–2.

**Licencia N11I** (`Minimos-conduccion.md` N11, añadida el 2026-11-18): el I en estado
fundamental puede ir sin 5.ª, con la fundamental triplicada. De momento, solo el I (el V
sin 5.ª solo ayudaría en casos que ya tienen solución obvia). La admiten el motor
(`normasTransicion`, con `'N11I'` en el conjunto de licencias) y el comprobador
(`licencias`), que no silencia ninguna otra falta de N11 (la 3.ª, nunca; el V, completo).
Casos de sensibilidad en `tests/sensibilidad-comprobador.js`.

**Cómo se elige.** Las realizaciones no se escriben: se **enumeran todas** (son pocas) con
los candidatos y las normas de transición del motor, se pasan por el comprobador y se
puntúa lo que ceden (`rasgos`): I sin 5.ª 3, sensible a 5̂ 2, cada salto lo que mide, nota
común perdida 1, y desempates por P1, P2 y movimiento total. La realización tiene una
**clase** según su cesión principal: obvia, I sin 5.ª, sensible, salto.

## Consignas

### Bajo dado

- **Se da**: el bajo (I–V, V–I, I–V–I o V–I–V, a partes iguales) y el **primer acorde**
  completo, con la fundamental duplicada y la soprano en 1̂ o 3̂ (I) o en 7̂ o 2̂ (V).
- **Se pide**: los demás acordes. La solución obvia **es única** (se comprueba al generar).
- **Al revelar**: las notas y los grados (I, V) bajo el bajo.
- Sin niveles.

### Canto dado

- **Se da**: la soprano y la tonalidad. **Se pide**: el bajo y las voces interiores.
- **Niveles**:

| Nivel | Líneas |
|---|---|
| 1 | dos o tres notas, con realización obvia (1–7, 3–2, 7–1, 2–3, 1–7–1, 3–2–3…) |
| 2 | dos o tres notas, con 2̂–1̂ o 1̂–2̂ (hay que ceder) |
| 3 | cuatro notas, salvo las que repiten el mismo gesto (7–1–7–1, 3–2–3–2, 1–2–1–2…) |

- La soprano, en una octava al azar de las que caben sin tocar los extremos de su tesitura.
- **Al revelar**: una realización con sus grados y, si cede, **qué cede** («el I (2.º
  acorde) sin 5.ª, con la fundamental triplicada», «la sensible de la contralto baja a 5̂»,
  «salto de 4.ª en el tenor») y **otra solución que también vale** (la mejor de otra
  clase). Si hay realización obvia, se muestra esa. Si no, se sortea entre las clases cuyo
  coste está a menos de 1,5 del mejor (en 2̂–1̂, el I sin 5.ª y la sensible a 5̂ salen más o
  menos igual), para que se vean las dos.

### Cadencia

- **Se da**: la tonalidad, el tipo y el número de acordes, en la pregunta: «Escribe una
  cadencia auténtica (CA) de tres acordes en Do mayor». CA = acaba en V–I (V–I, I–V–I);
  SC = acaba en I–V (I–V, V–I–V). **Se pide**: todo.
- **Al revelar**: una realización **obvia** (sin cesiones; la soprano, nunca en 5̂) con sus
  grados y, si es CA, si es **CAP** (soprano final en 1̂) o **CAI** (en 3̂), con la frase
  «con la soprano en 3̂ (1̂), sería CAI (CAP)».
- Antes de revelar, «Escuchar» da el acorde de tónica, de referencia.
- Sin niveles.

⟶ ABIERTO: en Cadencia, la CAP más típica es 3̂–2̂–1̂, que cede (I sin 5.ª o sensible a 5̂).
Hoy la solución mostrada es siempre obvia (1̂–7̂–1̂ o 7̂–1̂ para la CAP); se podría admitir
también la que cede, con su comentario, como en Canto dado.

## Validación

`tests/masivo-tonica-dominante.js [n]`: para las tres consignas, I y V alternados, el bajo
① ⑤ por 4.ª o 5.ª, la soprano por grado en 7̂ 1̂ 2̂ 3̂, cero faltas en el comprobador (con
N11I) y solo el I incompleto; en Bajo dado y Cadencia, la conducción obvia recalculada
desde las notas; en Canto dado, la línea del nivel, la obvia si la hay y, si no, una
cesión con otra nombrada; en Cadencia, CAP/CAI según la soprano final. Reparto, y render
con máscara (todas las notas; lo de respuesta, `resp`; los grados, `harm resp`).

## Papel

Ficha c3u2-f1: un ejercicio de cada consigna, dos casos en cada uno, en un sistema (tipos
`bajo-dado-iv`, `canto-dado-iv` y `cadencia-iv` de `curriculum/Ejercicios-papel.md`).

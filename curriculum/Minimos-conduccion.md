# Mínimos de conducción de voces

> **Estado del documento.** Borrador. Desarrolla el punto «mínimos de conducción de voces»
> de `Plan-Armonia.md` §1. Es la **fuente de verdad** de las reglas: la app las implementa
> (generador y comprobador del motor a cuatro voces, `app/docs/Generador-ejercicios.md` §5.3)
> y los apuntes las explican; ninguno de los dos las redefine. Cada regla tiene un
> **identificador estable** (`N·` norma, `P·` preferencia) que usa el código y que usarán
> los ejercicios de detección de faltas. Cambiar el sentido de una regla exige cambiar su
> identificador, no reutilizarlo.
>
> **Implementación:** `app/public/ejercicios/cuatro-voces-core.js` (realizador) y
> `cuatro-voces-check.js` (comprobador independiente); pruebas en `app/tests/`
> (`sensibilidad-comprobador.js`: un caso con falta deliberada por norma). Al cambiar una
> regla aquí, cambiar los dos ficheros y añadir su caso de sensibilidad.

## 0. Ámbito y forma

- Escritura **coral a cuatro voces** (soprano, contralto, tenor, bajo). Las reglas marcadas
  con **②** se aplican también a **dos voces** (3.º, UD 1, contrapunto 1:1).
- Dos rangos de regla:
  - **Normas (N).** No negociables. Una infracción invalida el fragmento: la app **nunca las
    genera** y el comprobador **siempre las señala**.
  - **Preferencias (P).** No invalidan, pero distinguen la escritura idiomática de la
    meramente correcta. La app las usa como **puntuación** para elegir entre soluciones
    válidas; en clase se exigen con criterio, no con lista.
- Las notas de la escala se nombran por grados con circunflejo (1̂ … 7̂). En **menor**, 7̂ es
  la sensible cuando pertenece a V o VII y 6̂ el sexto grado natural. Que la colección sea
  **estrictamente la escala armónica** no es una norma general de escritura, sino una
  **limitación buscada** en los ejercicios de cadencias de 4.º UD 0; otros contextos
  admitirán 6̂ y 7̂ ascendentes (melódica) cuando se enseñen.
- La vigencia de cada regla por curso y unidad va en §6.

## 1. Registro y disposición

| Id | Regla |
|----|-------|
| **N1** | **Tesituras.** Soprano do4–la5 · contralto fa3–re5 · tenor do3–la4 · bajo mi2–do4. Límites estrictos para la app. |
| **N2** | **Distancia entre voces contiguas.** Soprano–contralto y contralto–tenor: **≤ 8.ª**. Tenor–bajo: libre hasta la 15.ª. |
| **N3** ② | **Sin cruces ni superposiciones.** En cada acorde, cada voz está por debajo de la inmediatamente superior (unísono admitido). Al pasar de un acorde al siguiente, una voz no sobrepasa la altura que la voz contigua acaba de dejar. |
| **P1** | Tenor–bajo preferentemente **≤ 12.ª**. |
| **P2** | Evitar el **unísono** entre voces contiguas, salvo tenor–bajo ocasionalmente. |
| **P10** | Evitar los **registros extremos** de forma continuada: la 3.ª inferior y la 3.ª superior de cada tesitura (N1) se visitan, no se habitan (más de dos acordes seguidos penaliza). |

## 2. Movimiento entre voces

| Id | Regla |
|----|-------|
| **N4** ② | **5.ª y 8.ª (y unísono) paralelas prohibidas** entre cualquier par de voces. Incluye las obtenidas **por movimiento contrario** (8.ª → unísono, 5.ª → 12.ª). |
| **N5** ② | **Directas (ocultas) de 5.ª y 8.ª prohibidas entre las voces extremas**, salvo que la soprano llegue **por grado conjunto**. Entre voces internas o entre una interna y una extrema, admitidas. |
| **N6** | **5.ª disminuida → 5.ª justa prohibida** entre el bajo y cualquier otra voz. 5.ª justa → 5.ª disminuida, admitida siempre. Entre voces superiores no se exige. |
| **P3** ② | Entre **bajo y soprano**, preferir el movimiento **contrario u oblicuo**. |
| **P4** | **Notas comunes mantenidas** en la misma voz cuando el bajo salta de 4.ª o 5.ª (I–IV, II–V, V–I…). Cuando el bajo se mueve por **grado conjunto** (IV–V, VI–V…), las voces superiores van en **movimiento contrario** al bajo. |
| **P5** | **Mínimo movimiento** en las voces internas. |
| **P11** | Evitar que **las cuatro voces se muevan en la misma dirección**. |
| **P12** | En I6/4 → V, si el registro lo permite, el bajo **salta de 8.ª descendente**. |

## 3. Notas de tendencia y acordes con resolución obligada

| Id | Regla |
|----|-------|
| **N7** | **Sensible (7̂).** Nunca duplicada. En voz **extrema**, sube a 1̂. En voz **interna**, en V(7) → I puede bajar a 5̂ para completar la tónica, **solo si el 1̂ de su resolución lo da la voz inmediatamente superior**. En V(7) → VI (cadencia rota) sube **siempre**. Si el acorde siguiente también contiene la sensible (V → V7), no se exige resolución. |
| **N8** | **7.ª del acorde de dominante.** Nunca duplicada. **Resuelve descendiendo por grado** (4̂ → 3̂) en el acorde siguiente, en la misma voz; o se **mantiene** como nota común si el acorde siguiente la contiene (V7 → IV6). Complemento: si la 7.ª baja 4̂ → 3̂, **ninguna otra voz baja 5̂ → 3̂** (la fundamental no dobla la resolución). |
| **N9** | **6/4 cadencial** (I6/4 → V). El bajo (5̂) va **duplicado** y en la V **se mantiene o salta de 8.ª**; la 6.ª y la 4.ª (1̂ y 3̂) **bajan por grado** a 7̂ y 2̂ en las **mismas voces**; cae en parte métrica **más fuerte** que la V que la sigue. |
| **N10** | **Tríadas disminuidas** (II en menor, VII) **solo en 1.ª inversión**. |
| **N11** | **Acordes completos.** Toda tríada lleva sus tres notas. Excepciones: V7 puede omitir la 5.ª (fundamental duplicada); el I final tras un V7 completo puede omitir la 5.ª (fundamental triplicada). |
| **P6** | La 7.ª de V7 se toma por **nota común o grado conjunto**. |

## 4. Duplicaciones

Referidas al acorde tal como se escribe (bajo incluido). *Preferida* puntúa; *admitida*
no penaliza; *nunca* es norma (N7, N8, N9).

| Acorde | Preferida | Admitida | Nunca |
|--------|-----------|----------|-------|
| I, IV, V en fundamental | fundamental | 5.ª | 3.ª de V (sensible) |
| I6 | — | cualquiera (fundamental, 3.ª o 5.ª) | — |
| II en fundamental (solo mayor) | fundamental | 3.ª | — |
| II6 (en menor, disminuido) | el bajo (3.ª del acorde) | fundamental | — |
| IV6 | fundamental | 5.ª | el bajo (6̂), si baja a 5̂ (daría 8.as) |
| VI en fundamental | fundamental | 3.ª | — |
| VI tras V(7) (cadencia rota) | **3.ª (obligatoria)** | — | fundamental |
| I6/4 cadencial | **el bajo (obligatoria)** | — | — |
| V7 | completo, sin duplicar | fundamental (omitiendo la 5.ª) | 3.ª, 7.ª |
| I final tras V7 completo | fundamental (triple, sin 5.ª) | completo (sensible interna baja a 5̂) | — |

## 5. Conducción melódica de cada voz

| Id | Regla |
|----|-------|
| **N12** ② | **Sin intervalos melódicos aumentados** (2.ª aumentada 6̂–7̂ en menor, 4.ª aumentada) **ni disminuidos**, con una excepción: la 5.ª disminuida, solo si a continuación resuelve por grado hacia dentro (por tanto, nunca hacia el último acorde). |
| **N13** ② | **Saltos.** Voces superiores: máximo **6.ª**. Bajo: hasta la **8.ª**. **Nunca 7.ª** ni mayor que 8.ª. A dos voces (3.º UD 1): máximo 5.ª en ambas. |
| **P7** ② | Voces superiores preferentemente por **grado conjunto y notas comunes**; en la soprano, a lo sumo **un salto** por fragmento cadencial, y mejor si va en **movimiento contrario al bajo**. |
| **P8** | **Perfil de la soprano:** un solo punto culminante; no más de dos veces seguidas la misma nota; **cláusula final idiomática** según el tipo de cadencia (tabla en `Generador-ejercicios.md` §4 ter). |
| **P9** ② | Tras un salto de 4.ª o mayor, **cambio de dirección por grado conjunto**; seguir en la misma dirección es lo peor, sobre todo en la soprano. No se aplica al bajo tras un salto de 8.ª (5̂–5̂–1̂). |

## 6. Vigencia por curso y unidad

Las reglas entran cuando entra el material que las necesita, y desde entonces se exigen
siempre. La app aplica, en cada familia, las vigentes en su unidad.

| Desde | Normas | Preferencias |
|-------|--------|--------------|
| 3.º UD 1 (dos voces) | N3, N4, N5, N12, N13 | P3, P7, P9 |
| 3.º UD 2 (cuatro voces: I, V, VII6) | + N1, N2, N7, N10, N11 | + P1, P2, P4, P5, P8, P10, P11 |
| 3.º UD 3 (IV, cadencias) | + N6 | — |
| 3.º UD 4 (V7, 6/4 cadencial) | + N8, N9 | + P6, P12 |
| 3.º UD 5 (VI, II, rota) | (duplicaciones §4 completas) | — |
| 4.º UD 0 (repaso) | todas | todas |

⟶ ABIERTO: los ejemplos a dos voces de 3.º UD 1 (familia *Movimiento armónico*) cumplen
las normas pero no usan aún las preferencias; incorporar P3/P7/P9 como puntuación en
`contrapunto-core.js` es el camino para que dejen de ser sosos.

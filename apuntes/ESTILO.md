# Estilo de los apuntes

Convenciones de escritura y notación de los apuntes, para repasar una unidad
nueva antes de publicarla. Recoge lo que ya hacen c3u0 y c4u0. Si algo de aquí
choca con `curriculum/Plan-Armonia.md`, manda el plan.

## Intervalos

| Dónde | Forma | Ejemplos |
|---|---|---|
| Texto | ordinal con punto, calidad en palabra | 3.ª mayor, 2.ª aumentada, 5.ª justa |
| Texto, abreviado | ordinal con punto, espacio, abreviatura | 3.ª M, 4.ª A |
| Partitura | **sin punto ni espacio** | 3ªM, 6ªm, 5ªD, 4ªA, 12ªJ |

- Abreviaturas de calidad: **M m J A D** (disminuida, **D** mayúscula, como en
  la app).
- Plural del ordinal: 5.as, 8.as.
- En los rótulos de partitura, el ordinal también va sin punto aunque no lleve
  calidad («b) 10ª y 3ª»).

## Grados y cifrado

- **Números romanos en mayúscula siempre, sin marca de calidad** (ni °, ni
  minúscula para el menor): II, VII, no ii ni vii°. La calidad la da la
  tonalidad. Es la misma decisión que la app (`app/docs/Generador-ejercicios.md`).
- Cifras pegadas al romano: I6, I6/4, V7, V6/5, V4/3, V4/2.
- En partitura, con las macros de `ejemplos/etiquetas.ily`: `\grado`,
  `\gradoSeis`, `\cifra "V" "6" "4"`. Las cifras de un grado van **voladas**:
  la de arriba de un 6/4 a la altura del 6 de un I⁶, la de abajo debajo.
- Bajo cifrado sin grado (`\figuras "6" "4"`): cifras a tamaño de texto.
- **Todos los grados de un sistema, en la misma línea base**, y todos los
  rótulos de encima, también: altura fija, no pegados a cada nota (ver
  `etiquetas.ily`).
- Tipos de 6/4 y de 6/3 se nombran por su cifra: «el 6/4 cadencial», «cada 6/3».

## Grados de la escala

- Cifra con circunflejo: 1̂, 5̂, 7̂; alterados con la alteración delante: ♯7̂.
  Se escriben con la marca combinante U+0302; la fuente de los apuntes la
  coloca sobre la cifra.

## Notas y tonalidades

- Notas en minúscula y en solfeo: do, fa♯, si♭. Alteraciones con los
  caracteres ♯ ♭ ♮ 𝄪 𝄫, nunca # ni b.
- Tonalidades con mayúscula, mayores y menores: Do mayor, La menor, Re♯ menor
  («Do y Sol mayores, La y Re menores»). La nota suelta sigue en minúscula: «el
  la del bajo».
- Abreviada (en diagramas, donde no cabe la palabra): La m, Fa♯ m.

## Acordes (cifrado americano)

- C, Cm, C°, C+ (como en c3u0 y en la app), y la inversión con barra: C/E, C/G.
- En partitura van como `\rotulo` sobre el sistema.

## Cadencias

- Siglas: CAP (auténtica perfecta), CAI (auténtica imperfecta), SC
  (semicadencia), CR (rota).

## Puntuación

- **Raya corta (–)** para sucesiones de grados, acordes, notas y cifras: I–IV–V,
  1̂–2̂–3̂, do–mi, 6–5. No se usa guion (-) para esto.
  - **Sin espacios** entre elementos simples: I–V6–IV6–V.
  - **Con espacios** solo si algún elemento lleva espacios dentro:
    I – II6 o IV – V(7) – I; T – PD – D – T va igual por paralelismo.
- **Raya larga (—)** para incisos, pegada al texto del inciso: —como este—.
- **→** con espacios, para «pasa a» o «remite a»: do–mi → mi–do, 7̂ → 1̂,
  (→ UD 1).
- **↔** sin espacios, para intercambios: M↔m, 2.ª↔7.ª.
- El guion (-) queda para palabras compuestas y nombres de fichero.

## Epígrafes

- Numerados a mano en el .md, **sin punto tras el último número** en ningún
  nivel: «## 1 Título», «### 1.1 Título».
- **El título no empieza por cifra**: «1.3 Séptima de dominante», no «1.3 7.ª
  de dominante» (dos números seguidos). Un romano sí vale: «2.1 I6 — …».

## Ejemplos musicales

- Apartados de un ejemplo: «a)», «b)», «c)» con `\rotulo`, en negrita.
- Bien y mal: `\rotuloBien`/`\rotuloMal` y `\bien`/`\mal` (ver
  `etiquetas.ily`). Tienen que leerse también impresos en blanco y negro.
- Una línea de rótulos que no cabe: `\textLengthOn` con
  `extra-spacing-height` a cero, para que se aparten entre sí sin empujar las
  notas de debajo (ver `c3u0-dos-claves.ly`).

## Pendiente de decidir

- **Fuente de las cifras del bajo cifrado.** LilyPond trae su propia fuente
  para cifras (la de las cifras de compás y las digitaciones: negrita, con
  0–9, +, -, paréntesis) y un contexto de bajo cifrado (`\figuremode`) con ♯ ♭
  ♮, cifras tachadas (5, 6), +6, ♯4 y corchetes, que alinea solo. Probado en
  septiembre de 2026:
  - Con romano (V⁶₄), el contexto de bajo cifrado no sirve: centra las cifras
    bajo la nota, no a la derecha del romano. Lo viable sería poner solo las
    cifras de `\cifra` en esa fuente. **Descartado por ahora**: el contraste
    entre el romano (redonda con serifa) y las cifras negritas resta más que
    suma.
  - Para bajo cifrado sin romano (c3u0 §3.2), el contexto de LilyPond sí
    sería la opción natural, con cifras tachadas y alteraciones bien
    colocadas. Por decidir, junto con lo anterior.

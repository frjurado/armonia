---
title: "4.º — UD 1 · Repaso n.º 13"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1013).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Fa mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "C. de 5.as" a'2 bf'4 | g'2 a'4 | f'4 g'4 g'4 | \encima "CAI" a'2. }
contralto = \analitico { f'2 f'4 | e'2 e'4 | d'4 d'4 c'4 | c'2. }
tenor     = \analitico { c'2 d'4 | bf2 c'4 | a4 bf4 e4 | f2. }
bajo = {
  \modelo \acorde "I" \finModelo f2 \acorde "IV" bf,4 | \acorde "VII" e2 \acorde "III" a,4 | \acorde "VI" d4 \acorde "II" g,4 \acorde "V" c4 | \acorde "I" f,2. \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="La menor" pide="cadencias septimas"}
```lilypond
compas = { \time 2/4 }
soprano   = \analitico { a'4 b'4 | c''4 b'4 | b'2 | \encima "CAI" c''2 }
contralto = \analitico { c'4 d'4 | e'4 f'4 | e'2 | e'2 }
tenor     = \analitico { e4 gs4 | a4~ a4 | gs2 | a2 }
bajo = {
  \modelo \acorde "I6" \finModelo c4 \acorde "VII6" b,4 | \acorde "I" a,4 \acorde "II6/5" d4 | \acorde "V" e2 | \acorde "I" a,2 \bar "|."
}
```
:::

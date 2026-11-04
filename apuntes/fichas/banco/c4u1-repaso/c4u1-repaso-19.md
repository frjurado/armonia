---
title: "4.º — UD 1 · Repaso n.º 19"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1019).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Do mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "C. de 5.as" g''2 f''4 | f''2 e''4 | e''2 d''4 | e''2 \encima "SC" d''4 }
contralto = \analitico { c''2 a'4 | b'2 g'4 | a'2 f'4 | g'2 g'4 }
tenor     = \analitico { e'2 c'4 | d'2 b4 | c'2 a4 | c'2 b4 }
bajo = {
  \modelo \acorde "I" \finModelo c2 \acorde "IV" f4 | \acorde "VII" b,2 \acorde "III" e4 | \acorde "VI" a,2 \acorde "II" d4 | \acorde "I6/4" g,2 \acorde "V" g,4 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Do menor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { ef''4 d''2 | ef''2~ ef''4~ | ef''2 d''4 | \encima "CAP" c''2. }
contralto = \analitico { g'4 g'2 | g'2 af'4 | g'2 f'4 | ef'2. }
tenor     = \analitico { g4 b2 | c'2 c'4 | c'2 b4 | c'2. }
bajo = {
  \modelo \acorde "I" \finModelo c4 \acorde "V4/2" f2 | \acorde "I6" ef2 \acorde "IV7" f4 | \acorde "I6/4" g2 \acorde "V7" g4 | \acorde "I" c2. \bar "|."
}
```
:::

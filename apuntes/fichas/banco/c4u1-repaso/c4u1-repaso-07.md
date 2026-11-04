---
title: "4.º — UD 1 · Repaso n.º 07"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1007).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Do menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "C. de 5.as" ef''2 f''2 | d''2 ef''2 | c''2 d''4 b'4 | \encima "CAP" c''1 }
contralto = \analitico { g'2 f'2 | f'2 ef'2 | ef'2 d'4 d'4 | c'1 }
tenor     = \analitico { c'2 c'2 | bf2 bf2 | af2 af4 f4 | ef1 }
bajo = {
  \modelo \acorde "I" \finModelo c2 \acorde "IV6" af,2 | \acorde "VII" bf,2 \acorde "III6" g,2 | \acorde "VI" af,2 \acorde "II6" f,4 \acorde "V7" g,4 | \acorde "I" c1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Re mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { d''2 b'2 | d''2 e''2 | fs''2 e''2 | fs''2 \encima "SC" e''2 }
contralto = \analitico { a'2 g'2 | a'2 g'2 | a'2 g'2 | a'2 a'2 }
tenor     = \analitico { d'2 d'2 | d'2 cs'2 | d'2~ d'2~ | d'2 cs'2 }
bajo = {
  \modelo \acorde "I6" \finModelo fs2 \acorde "IV" g2 | \acorde "I6" fs2 \acorde "VII6" e2 | \acorde "I" d2 \acorde "II7" e2 | \acorde "I6/4" a,2 \acorde "V" a,2 \bar "|."
}
```
:::

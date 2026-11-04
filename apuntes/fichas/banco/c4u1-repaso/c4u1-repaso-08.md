---
title: "4.º — UD 1 · Repaso n.º 08"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1008).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="La mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "Romanesca" a''2 gs''4 | fs''2 e''4 | d''4 cs''4 d''4 | cs''2 \encima "SC" b'4 }
contralto = \analitico { cs''2 b'4 | a'2 gs'4 | fs'4 e'4 fs'4 | e'2 e'4 }
tenor     = \analitico { e'2 e'4 | cs'2 cs'4 | a4 a4 a4 | a2 gs4 }
bajo = {
  \modelo \acorde "I" \finModelo a2 \acorde "V" e4 | \acorde "VI" fs2 \acorde "III" cs4 | \acorde "IV" d4 \acorde "I" a,4 \acorde "IV" d4 | \acorde "I6/4" e2 \acorde "V" e,4 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Si menor" pide="cadencias septimas"}
```lilypond
compas = { \time 2/4 }
soprano   = \analitico { fs'4 e'4 | fs'4 g'4 | b'4~ b'4 | \encima "SC" as'2 }
contralto = \analitico { d'4 cs'4 | d'4 e'4 | fs'4 g'4 | fs'2 }
tenor     = \analitico { b4 as4 | b4 b4 | d'4 cs'4 | cs'2 }
bajo = {
  \modelo \acorde "I" \finModelo b,4 \acorde "VII6" cs4 | \acorde "I" b,4 \acorde "IV" e4 | \acorde "I6" d4 \acorde "II6/5" e4 | \acorde "V" fs2 \bar "|."
}
```
:::

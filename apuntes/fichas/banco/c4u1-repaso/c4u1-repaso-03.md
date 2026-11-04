---
title: "4.º — UD 1 · Repaso n.º 03"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1003).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Fa mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "Romanesca" c''2 c''2 | a'2 a'2 | f'2 f'4 g'4 | \encima "SC" g'1 }
contralto = \analitico { a'2 g'2 | f'2 e'2 | d'2 c'4 d'4 | e'1 }
tenor     = \analitico { f'2 e'2 | d'2 c'2 | bf2 a4 g4 | g1 }
bajo = {
  \modelo \acorde "I" \finModelo f2 \acorde "V" c2 | \acorde "VI" d2 \acorde "III" a,2 | \acorde "IV" bf,2 \acorde "I" f,4 \acorde "II6" bf,4 | \acorde "V" c1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="La menor" pide="cadencias septimas"}
```lilypond
compas = { \time 2/4 }
soprano   = \analitico { e''4 d''4 | e''4 d''4 | e''4 f''4 | e''4 \encima "SC" e''4 }
contralto = \analitico { a'4 f'4 | e'4 gs'4 | a'4~ a'4~ | a'4 gs'4 }
tenor     = \analitico { c'4 a4 | a4 b4 | c'4 b4 | c'4 b4 }
bajo = {
  \modelo \acorde "I6" \finModelo c4 \acorde "IV" d4 | \acorde "I6" c4 \acorde "VII6" b,4 | \acorde "I" a,4 \acorde "II6/5" d4 | \acorde "I6/4" e4 \acorde "V" e,4 \bar "|."
}
```
:::

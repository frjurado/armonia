---
title: "4.º — UD 1 · Repaso n.º 14"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1014).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Do menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "Romanesca" c''2 bf'4 | af'2 g'4 | f'2 f'4 | \encima "CAI" ef'2. }
contralto = \analitico { g'2 g'4 | ef'2 ef'4 | c'2 b4 | c'2. }
tenor     = \analitico { ef'2 d'4 | c'2 bf4 | af2 g4 | g2. }
bajo = {
  \modelo \acorde "I" \finModelo c'2 \acorde "V" g4 | \acorde "VI" af2 \acorde "III" ef4 | \acorde "IV" f2 \acorde "V7" g4 | \acorde "I" c2. \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Re menor" pide="cadencias septimas"}
```lilypond
compas = { \time 2/4 }
soprano   = \analitico { a'4 g'4 | a'4 cs''4 | d''4~ d''4 | \encima "SC" cs''2 }
contralto = \analitico { f'4 d'4 | f'4 g'4 | a'4 bf'4 | a'2 }
tenor     = \analitico { a4 bf4 | d'4 e'4 | f'4 e'4 | e'2 }
bajo = {
  \modelo \acorde "I" \finModelo d4 \acorde "IV" g4 | \acorde "I6" f4 \acorde "VII6" e4 | \acorde "I" d4 \acorde "II6/5" g4 | \acorde "V" a2 \bar "|."
}
```
:::

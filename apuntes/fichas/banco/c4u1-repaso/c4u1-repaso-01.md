---
title: "4.º — UD 1 · Repaso n.º 01"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1001).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Sol mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "Romanesca" d''2 d''4 | b'2 b'4 | g'2 fs'4 | \encima "CAP" g'2. }
contralto = \analitico { g'2 fs'4 | e'2 d'4 | c'2 c'4 | b2. }
tenor     = \analitico { b2 a4 | g2 fs4 | e2 a4 | g2. }
bajo = {
  \modelo \acorde "I" \finModelo g2 \acorde "V" d4 | \acorde "VI" e2 \acorde "III" b,4 | \acorde "IV" c2 \acorde "V7" d4 | \acorde "I" g,2. \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Re menor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { d''2 cs''4 | d''4 e''2 | f''4 e''4 e''4 | \encima "CAP" d''2. }
contralto = \analitico { a'2 e'4 | f'4 g'2 | a'4 bf'4 g'4 | f'2. }
tenor     = \analitico { a2 a4 | a4 cs'2 | d'4~ d'4 cs'4 | d'2. }
bajo = {
  \modelo \acorde "I6" \finModelo f2 \acorde "V4/2" g4 | \acorde "I6" f4 \acorde "VII6" e2 | \acorde "I" d4 \acorde "II6/5" g4 \acorde "V7" a4 | \acorde "I" d2. \bar "|."
}
```
:::

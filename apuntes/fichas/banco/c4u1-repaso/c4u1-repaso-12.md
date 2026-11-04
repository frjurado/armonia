---
title: "4.º — UD 1 · Repaso n.º 12"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1012).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Si menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "C. de 5.as" b'2 b'2 | a'2 a'2 | g'2 g'2 | b'2 \encima "SC" as'2 }
contralto = \analitico { fs'2 g'2 | e'2 fs'2 | d'2 e'2 | d'2 cs'2 }
tenor     = \analitico { d'2 b2 | cs'2 a2 | b2 g2 | fs2 fs2 }
bajo = {
  \modelo \acorde "I" \finModelo b,2 \acorde "IV" e2 | \acorde "VII" a,2 \acorde "III" d2 | \acorde "VI" g,2 \acorde "II" cs2 | \acorde "I6/4" fs,2 \acorde "V" fs,2 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Re mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { fs'2 g'4 | a'4 g'2 | fs'2 e'4 | fs'2 \encima "SC" e'4 }
contralto = \analitico { d'2 d'4 | d'4 cs'2 | d'2~ d'4~ | d'2 cs'4 }
tenor     = \analitico { a2 b4 | a4 a2 | a2 b4 | a2 a4 }
bajo = {
  \modelo \acorde "I" \finModelo d2 \acorde "IV" g4 | \acorde "I6" fs4 \acorde "V4/3" e2 | \acorde "I" d2 \acorde "II6/5" g4 | \acorde "I6/4" a2 \acorde "V" a,4 \bar "|."
}
```
:::

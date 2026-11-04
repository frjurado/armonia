---
title: "4.º — UD 1 · Repaso n.º 18"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1018).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Mi menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "Romanesca" g''2 fs''2 | e''2 d''2 | c''2 b'4 a'4 | \encima "CAI" g'1 }
contralto = \analitico { b'2 b'2 | g'2 g'2 | e'2 e'4 ds'4 | e'1 }
tenor     = \analitico { e'2 d'2 | c'2 b2 | a2 g4 fs4 | e1 }
bajo = {
  \modelo \acorde "I" \finModelo e2 \acorde "V" b,2 | \acorde "VI" c2 \acorde "III" g,2 | \acorde "IV" a,2 \acorde "I6/4" b,4 \acorde "V7" b,4 | \acorde "I" e1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Si menor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { b'2 as'2 | b'2~ b'2~ | b'2 as'2 | \encima "CAP" b'1 }
contralto = \analitico { fs'2 e'2 | fs'2 g'2 | fs'2 e'2 | d'1 }
tenor     = \analitico { d'2 cs'2 | d'2 cs'2 | d'2 cs'2 | b1 }
bajo = {
  \modelo \acorde "I" \finModelo b,2 \acorde "VII6" cs2 | \acorde "I" b,2 \acorde "II6/5" e2 | \acorde "I6/4" fs2 \acorde "V7" fs,2 | \acorde "I" b,1 \bar "|."
}
```
:::

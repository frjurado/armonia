---
title: "4.º — UD 1 · Repaso n.º 02"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1002).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Re mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "Romanesca" d''2 cs''2 | b'2 a'2 | g'2 fs'4 e'4 | \encima "CAP" d'1 }
contralto = \analitico { fs'2 e'2 | d'2 cs'2 | b2 d'4 cs'4 | a1 }
tenor     = \analitico { a2 a2 | fs2 fs2 | d2 a4 g4 | fs1 }
bajo = {
  \modelo \acorde "I" \finModelo d2 \acorde "V" a,2 | \acorde "VI" b,2 \acorde "III" fs,2 | \acorde "IV" g,2 \acorde "I6/4" a,4 \acorde "V7" a,4 | \acorde "I" d1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Mi menor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { b'2 a'2 | g'2 a'2 | b'2 c''2 | \encima "SC" b'1 }
contralto = \analitico { b2 ds'2 | e'2 fs'2 | g'2 fs'2 | fs'1 }
tenor     = \analitico { g2 a2 | b2 ds'2 | e'2~ e'2 | ds'1 }
bajo = {
  \modelo \acorde "I" \finModelo e2 \acorde "VII6" fs2 | \acorde "I6" g2 \acorde "VII6" fs2 | \acorde "I" e2 \acorde "II6/5" a,2 | \acorde "V" b,1 \bar "|."
}
```
:::

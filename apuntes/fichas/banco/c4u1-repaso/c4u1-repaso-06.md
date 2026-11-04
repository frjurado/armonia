---
title: "4.º — UD 1 · Repaso n.º 06"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1006).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Mi menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "Romanesca" g''2 fs''2 | e''2 d''2 | c''2 b'4 a'4 | g'2 \encima "SC" fs'2 }
contralto = \analitico { b'2 b'2 | g'2 g'2 | e'2 e'4 e'4 | e'2 ds'2 }
tenor     = \analitico { e'2 d'2 | c'2 b2 | a2 g4 c'4 | b2 b2 }
bajo = {
  \modelo \acorde "I" \finModelo e2 \acorde "V" b,2 | \acorde "VI" c2 \acorde "III" g,2 | \acorde "IV" a,2 \acorde "I" e,4 \acorde "IV" a,4 | \acorde "I6/4" b,2 \acorde "V" b,2 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Sol mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { d''2 c''4 | b'2 a'4 | a'2. | \encima "CAP" g'2. }
contralto = \analitico { b'2 a'4 | g'2~ g'4 | fs'2. | d'2. }
tenor     = \analitico { g'2 fs'4 | d'2 e'4 | c'2. | b2. }
bajo = {
  \modelo \acorde "I" \finModelo g,2 \acorde "VII6" a,4 | \acorde "I6" b,2 \acorde "II6/5" c4 | \acorde "V7" d2. | \acorde "I" g2. \bar "|."
}
```
:::

---
title: "4.º — UD 1 · Repaso n.º 16"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1016).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Do mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "Romanesca" g''2 d''4 | e''2 b'4 | c''4 g'4 a'4 | c''2 \encima "SC" b'4 }
contralto = \analitico { g'2 g'4 | e'2 e'4 | c'4 c'4 f'4 | e'2 d'4 }
tenor     = \analitico { e'2 d'4 | c'2 b4 | a4 g4 f4 | g2 g4 }
bajo = {
  \modelo \acorde "I" \finModelo c'2 \acorde "V6" b4 | \acorde "VI" a2 \acorde "III6" g4 | \acorde "IV" f4 \acorde "I6" e4 \acorde "II" d4 | \acorde "I6/4" g,2 \acorde "V" g,4 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Sol menor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { g'2 a'2 | bf'2 a'2 | bf'2 a'2 | bf'2 \encima "SC" a'2 }
contralto = \analitico { d'2 fs'2 | g'2 fs'2 | g'2~ g'2~ | g'2 fs'2 }
tenor     = \analitico { bf2 c'2 | d'2 d'2 | d'2 ef'2 | d'2 d'2 }
bajo = {
  \modelo \acorde "I6" \finModelo bf,2 \acorde "VII6" a,2 | \acorde "I" g,2 \acorde "V4/2" c2 | \acorde "I6" bf,2 \acorde "II6/5" c2 | \acorde "I6/4" d2 \acorde "V" d2 \bar "|."
}
```
:::

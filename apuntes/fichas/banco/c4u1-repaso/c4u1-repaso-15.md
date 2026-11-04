---
title: "4.º — UD 1 · Repaso n.º 15"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1015).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Si♭ mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "Romanesca" f''2 c''4 | d''2 a'4 | bf'2 a'4 | \encima "CAP" bf'2. }
contralto = \analitico { f'2 f'4 | d'2 d'4 | bf2 ef'4 | d'2. }
tenor     = \analitico { d'2 c'4 | bf2 a4 | g2 f4 | f2. }
bajo = {
  \modelo \acorde "I" \finModelo bf2 \acorde "V6" a4 | \acorde "VI" g2 \acorde "III6" f4 | \acorde "IV" ef2 \acorde "V7" f4 | \acorde "I" bf,2. \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="La menor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { a'2 b'4 | c''4 d''4 c''4 | b'4 c''4 b'4 | \encima "CAP" a'2. }
contralto = \analitico { e'2 gs'4 | a'4 b'4 a'4~ | a'4~ a'4 gs'4 | e'2. }
tenor     = \analitico { c'2 d'4 | e'4 e'4 e'4 | d'4 e'4 d'4 | c'2. }
bajo = {
  \modelo \acorde "I6" \finModelo c'2 \acorde "VII6" b4 | \acorde "I" a4 \acorde "V6/5" gs4 \acorde "I" a4 | \acorde "II7" b4 \acorde "I6/4" e4 \acorde "V7" e4 | \acorde "I" a2. \bar "|."
}
```
:::

---
title: "4.º — UD 1 · Repaso n.º 05"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1005).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Sol menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "C. de 5.as" d''2 ef''4 | c''2 d''4 | bf'2 c''4 | bf'2 \encima "SC" a'4 }
contralto = \analitico { g'2 g'4 | f'2 f'4 | ef'2 ef'4 | d'2 d'4 }
tenor     = \analitico { bf2 c'4 | a2 bf4 | g2 a4 | g2 fs4 }
bajo = {
  \modelo \acorde "I" \finModelo g2 \acorde "IV6" ef4 | \acorde "VII" f2 \acorde "III6" d4 | \acorde "VI" ef2 \acorde "II6" c4 | \acorde "I6/4" d2 \acorde "V" d4 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="La mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 2/4 }
soprano   = \analitico { e''4 d''4 | cs''4 d''4 | cs''4 b'4 | cs''4 \encima "SC" b'4 }
contralto = \analitico { a'4 gs'4 | a'4 b'4 | a'4~ a'4~ | a'4 gs'4 }
tenor     = \analitico { e'4 e'4 | e'4 e'4 | e'4 d'4 | e'4 e'4 }
bajo = {
  \modelo \acorde "I6" \finModelo cs'4 \acorde "V4/3" b4 | \acorde "I" a4 \acorde "V6/5" gs4 | \acorde "I" a4 \acorde "II7" b4 | \acorde "I6/4" e4 \acorde "V" e4 \bar "|."
}
```
:::

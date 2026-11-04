---
title: "4.º — UD 1 · Repaso n.º 17"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1017).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Re menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "Romanesca" f''2 e''2 | d''2 c''2 | bf'2 a'4 bf'4 | \encima "SC" a'1 }
contralto = \analitico { a'2 a'2 | f'2 f'2 | d'2 d'4 e'4 | cs'1 }
tenor     = \analitico { d'2 c'2 | bf2 a2 | g2 f4 g4 | e1 }
bajo = {
  \modelo \acorde "I" \finModelo d2 \acorde "V" a,2 | \acorde "VI" bf,2 \acorde "III" f,2 | \acorde "IV" g,2 \acorde "I" d4 \acorde "II6" g,4 | \acorde "V" a,1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Do mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { e'2 g'2 | g'2 f'2 | e'2 f'2 | e'2 \encima "SC" d'2 }
contralto = \analitico { c'2 d'2 | c'2 b2 | c'2~ c'2~ | c'2 b2 }
tenor     = \analitico { g2 g2 | e2 f2 | g2 a2 | g2 g2 }
bajo = {
  \modelo \acorde "I" \finModelo c2 \acorde "V6" b,2 | \acorde "I" c2 \acorde "VII6" d2 | \acorde "I6" e2 \acorde "II7" d2 | \acorde "I6/4" g2 \acorde "V" g,2 \bar "|."
}
```
:::

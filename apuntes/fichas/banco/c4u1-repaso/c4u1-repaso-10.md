---
title: "4.º — UD 1 · Repaso n.º 10"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1010).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Si♭ mayor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "C. de 5.as" f''2 ef''2 | ef''2 d''2 | d''2 c''4 c''4 | \encima "CAP" bf'1 }
contralto = \analitico { bf'2 bf'2 | a'2 a'2 | g'2 g'4 ef'4 | d'1 }
tenor     = \analitico { d'2 ef'2 | c'2 d'2 | bf2 c'4 a4 | bf1 }
bajo = {
  \modelo \acorde "I" \finModelo bf2 \acorde "IV6" g2 | \acorde "VII" a2 \acorde "III6" f2 | \acorde "VI" g2 \acorde "II6" ef4 \acorde "V7" f4 | \acorde "I" bf,1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Do menor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { g'2 g'2 | g'2 af'2 | f'1 | \encima "CAI" ef'1 }
contralto = \analitico { ef'2 d'2 | ef'2 d'2 | d'1 | c'1 }
tenor     = \analitico { c'2 b2 | c'2~ c'2 | b1 | g1 }
bajo = {
  \modelo \acorde "I" \finModelo c2 \acorde "V4/2" f,2 | \acorde "I6" ef,2 \acorde "II6/5" f,2 | \acorde "V7" g,1 | \acorde "I" c1 \bar "|."
}
```
:::

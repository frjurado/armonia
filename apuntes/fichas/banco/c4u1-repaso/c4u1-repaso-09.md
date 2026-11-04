---
title: "4.º — UD 1 · Repaso n.º 09"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1009).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Re menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "C. de 5.as" a'2 g'2 | g'2 f'2 | f'2 e'4 cs'4 | \encima "CAP" d'1 }
contralto = \analitico { f'2 d'2 | e'2 c'2 | d'2 bf4 a4 | a1 }
tenor     = \analitico { d'2 bf2 | c'2 a2 | bf2 g4 g4 | f1 }
bajo = {
  \modelo \acorde "I" \finModelo d2 \acorde "IV" g2 | \acorde "VII" c2 \acorde "III" f2 | \acorde "VI" bf,2 \acorde "II" e4 \acorde "V7" a,4 | \acorde "I" d1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Sol menor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { d''2 c''2 | bf'2 a'2 | bf'2 a'2 | \encima "CAI" bf'1 }
contralto = \analitico { bf'2 a'2 | g'2~ g'2~ | g'2 fs'2 | g'1 }
tenor     = \analitico { g'2 fs'2 | d'2 ef'2 | d'2 d'2 | d'1 }
bajo = {
  \modelo \acorde "I" \finModelo g,2 \acorde "VII6" a,2 | \acorde "I6" bf,2 \acorde "II6/5" c2 | \acorde "I6/4" d2 \acorde "V" d2 | \acorde "I" g1 \bar "|."
}
```
:::

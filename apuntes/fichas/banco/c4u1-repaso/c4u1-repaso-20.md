---
title: "4.º — UD 1 · Repaso n.º 20"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1020).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Sol menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 2/4 }
soprano   = \analitico { \encima "C. de 5.as" g'4 g'4 | f'4 f'4 | ef'4 ef'4 | \encima "SC" d'2 }
contralto = \analitico { d'4 ef'4 | c'4 d'4 | bf4 c'4 | a2 }
tenor     = \analitico { bf4 c'4 | a4 bf4 | g4 a4 | fs2 }
bajo = {
  \modelo \acorde "I" \finModelo g4 \acorde "IV" c4 | \acorde "VII" f4 \acorde "III" bf,4 | \acorde "VI" ef4 \acorde "II" a,4 | \acorde "V" d2 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Fa mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { a'2 g'2 | f'2 g'2 | a'2~ a'4 g'4 | \encima "CAP" f'1 }
contralto = \analitico { c'2 e'2 | c'2 e'2 | f'2 f'4 e'4 | c'1 }
tenor     = \analitico { f2 bf2 | a2 bf2 | c'2 d'4 bf4 | a1 }
bajo = {
  \modelo \acorde "I" \finModelo f,2 \acorde "VII6" g,2 | \acorde "I6" a,2 \acorde "VII6" g,2 | \acorde "I" f,2 \acorde "IV7" bf,4 \acorde "V7" c4 | \acorde "I" f1 \bar "|."
}
```
:::

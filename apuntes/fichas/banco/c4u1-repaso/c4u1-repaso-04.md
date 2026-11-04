---
title: "4.º — UD 1 · Repaso n.º 04"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1004).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="La menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 4/4 }
soprano   = \analitico { \encima "C. de 5.as" a'2 a'2 | g'2 g'2 | f'2 f'2 | \encima "SC" e'1 }
contralto = \analitico { e'2 f'2 | d'2 e'2 | c'2 d'2 | b1 }
tenor     = \analitico { c'2 d'2 | b2 c'2 | a2 b2 | gs1 }
bajo = {
  \modelo \acorde "I" \finModelo a2 \acorde "IV6" f2 | \acorde "VII" g2 \acorde "III6" e2 | \acorde "VI" f2 \acorde "II6" d2 | \acorde "V" e1 \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Fa mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { c''2 bf'4 | c''4 c''2 | c''2 d''4 | \encima "SC" c''2. }
contralto = \analitico { f'2 e'4 | f'4 g'2 | f'2~ f'4 | e'2. }
tenor     = \analitico { a2 g4 | a4 bf2 | a2 g4 | g2. }
bajo = {
  \modelo \acorde "I" \finModelo f2 \acorde "VII6" g4 | \acorde "I" f4 \acorde "V6/5" e2 | \acorde "I" f2 \acorde "II6/5" bf,4 | \acorde "V" c2. \bar "|."
}
```
:::

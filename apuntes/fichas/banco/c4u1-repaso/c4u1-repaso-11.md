---
title: "4.º — UD 1 · Repaso n.º 11"
subtitle: "Secuencia, prolongación y cadencia"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c4u1-repaso (semilla 1011).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="realizar-bajo" tono="Si menor" pide="cadencias secuencia"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { \encima "Romanesca" d''2 cs''4 | b'2 a'4 | g'2 fs'4 | \encima "CAI" d'2. }
contralto = \analitico { b'2 fs'4 | g'2 d'4 | e'2 cs'4 | b2. }
tenor     = \analitico { fs'2 cs'4 | d'2 a4 | b2 as4 | fs2. }
bajo = {
  \modelo \acorde "I" \finModelo b,2 \acorde "V6" a,4 | \acorde "VI" g,2 \acorde "III6" fs,4 | \acorde "IV" e,2 \acorde "V" fs,4 | \acorde "I" b,2. \bar "|."
}
```
:::

::: {.ejercicio tipo="realizar-bajo" tono="Si♭ mayor" pide="cadencias septimas"}
```lilypond
compas = { \time 3/4 }
soprano   = \analitico { d''4 c''2 | d''4 f''2 | f''4 g''4 ef''4 | \encima "CAI" d''2. }
contralto = \analitico { bf'4 a'2 | bf'4 a'2 | bf'4 bf'4 a'4 | bf'2. }
tenor     = \analitico { f'4 f'2 | f'4 ef'2 | d'4~ d'4 c'4 | bf2. }
bajo = {
  \modelo \acorde "I" \finModelo bf,4 \acorde "V4/2" ef2 | \acorde "I6" d4 \acorde "V4/3" c2 | \acorde "I" bf,4 \acorde "IV7" ef,4 \acorde "V7" f,4 | \acorde "I" bf,2. \bar "|."
}
```
:::

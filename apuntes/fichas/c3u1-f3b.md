---
title: "3.º — UD 1 · Ficha 3b"
subtitle: "Disposición"
---

<!-- guion:inicio -->

> Variante de c3u1-f3: mismo diseño (véase su guion); cambian las
> tonalidades (Fa mayor, Mi menor, Re mayor), los grados y el orden de los
> acordes. Ejercicio 1: S–A, cerrada, bajo, mixta, A/T, abierta, cerrada,
> A–T. Todo comprobado con ConduccionCheck (N1, N2, N3, P2), acorde a acorde.

<!-- guion:fin -->

::: {.ejercicio tipo="faltas-disposicion" tono="Fa mayor"}
```lilypond
soprano = {
  d''2 \bar "||" a'2 \bar "||" c''2 \bar "||" bf'2 \bar "||"
  a'2 \bar "||" e''2 \bar "||" a'2 \bar "||" a''2 \bar "|."
}
contralto = { bf2 f' e' d' d' g' e' c'' }
tenor     = { f2 c' g bf f' c' c' f }
bajo = {
  \falta "> 8.ª" "S–A"          bf,2
  \grado "cerrada"              f,
  \falta "tesitura" "B"         c,
  \grado "mixta"                g,
  \falta "cruce" "A/T"          d
  \grado "abierta"              c
  \grado "cerrada"              a,
  \falta "> 8.ª" "A–T"          f,
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Mi menor"}
```lilypond
soprano = {
  \rotulo "abierta" c''2 \bar "||"
  \rotulo "cerrada" \analitico a'2 \bar "||"
  \rotulo "cerrada" \analitico fs'2 \bar "||"
  \rotulo "abierta" \analitico e''2 \bar "||"
  \rotulo "cerrada" \analitico c''2 \bar "||"
  \rotulo "abierta" \analitico e''2 \bar "||"
  \rotulo "cerrada" \analitico b'2 \bar "||"
  \rotulo "abierta" \analitico b'2 \bar "|."
}
contralto = { e'2 \analitico { e'2 ds' g' a' g' fs' e' } }
tenor     = { g2 \analitico { c'2 b b e' c' ds' g } }
bajo      = { c2 a, b, e a, c b, e, }
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Re mayor" pide="mixta"}
```lilypond
soprano = {
  \rotulo "mixta (5.ª)" d''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "||"
  \rotulo "abierta"     \analitico g''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e''2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "|."
}
contralto = { b'2 \analitico { e'2 fs' b' b' fs' cs'' fs' } }
tenor     = { d'2 \analitico { cs'2 d' d' g' d' e' a } }
bajo      = { g,2 a, b, g, e d a, d }
```
:::

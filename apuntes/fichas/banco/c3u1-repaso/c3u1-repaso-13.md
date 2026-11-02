---
title: "3.º — UD 1 · Repaso n.º 13"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1013).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Do mayor"}
```lilypond
arriba = {
  \modelo \encima "C" \analitico <c'' e'' g''>1 \finModelo
  \encima "G/B" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
  \encima "F" \analitico <f' a' c''>1
  \encima "C/G" \analitico <c'' e'' g''>1
  \encima "F/A" \analitico <f' a' c''>1
  \encima "C/G" \analitico <c'' e'' g''>1
  \encima "G" \analitico <g' b' d''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo c1
  \figuras "6" \gradoBajo "⑦" \acorde "V6" b,1
  \gradoBajo "①" \acorde "I" c1
  \gradoBajo "④" \acorde "IV" f,1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" g,1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" a,1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" g,1
  \figuras "5/3" \gradoBajo "⑤" \acorde "V5/3" g,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Do mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     e''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d'2 \bar "||"
  \rotulo "cerrada"     \analitico e'2 \bar "||"
  \rotulo "abierta"     \analitico a''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico f''2 \bar "||"
  \rotulo "abierta"     \analitico b'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico g'2 \bar "|."
}
contralto = { c''2 \analitico { b2 c' d'' e' a' e' e' } }
tenor     = { g'2 \analitico { d2 a f' c' f' g g } }
bajo      = { c2 g, a, d a d e c }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Do mayor"}
```lilypond
soprano   = { e''2 c'' e'' f'' f'' b' c'' c'' b' c'' }
contralto = { g'2 a' g' a' a' g' g' c' d' e' }
tenor     = { c'2 c' c' c' d' d' c' a g g }
bajo      = { c2 f, g, a, f, g, e, f, g, c }
respuestas = {
  \falta "5.ª dir./(S–B)" \sinFalta \falta "8.as par./(A–B)" \sinFalta \sinFalta \sinFalta \sinFalta \falta "5.as par./(A–B)" \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Re menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { f'2 g' e' f' g' f' f' g' e' f' }
contralto = \analitico { d'2 d' cs' d' d' d' d' d' cs' d' }
tenor     = \analitico { a2 bf a a bf a bf bf a a }
bajo      = { d2 g, a, d g, d bf, g, a, d }
respuestas = {
  \paso "1 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

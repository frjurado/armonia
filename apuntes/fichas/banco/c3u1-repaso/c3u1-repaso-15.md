---
title: "3.º — UD 1 · Repaso n.º 15"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1015).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Sol mayor"}
```lilypond
arriba = {
  \modelo \encima "G/B" \analitico <g' b' d''>1 \finModelo
  \encima "F♯°/A" \analitico <fs' a' c''>1
  \encima "G/B" \analitico <g' b' d''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "Bm" \analitico <b' d'' fs''>1
  \encima "C" \analitico <c'' e'' g''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "D" \analitico <d'' fs'' a''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo b,1
  \figuras "6" \gradoBajo "②" \acorde "VII6" a,1
  \figuras "6" \gradoBajo "③" \acorde "I6" b,1
  \gradoBajo "①" \acorde "I" g,1
  \gradoBajo "③" \acorde "III" b,1
  \gradoBajo "④" \acorde "IV" c1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" e1
  \gradoBajo "⑤" \acorde "V" d1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="La menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (5.ª)" b'2 \bar "||"
  \rotulo "cerrada"     \analitico d'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico a''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "||"
  \rotulo "cerrada"     \analitico f'2 \bar "||"
  \rotulo "abierta"     \analitico gs'2 \bar "|."
}
contralto = { gs'2 \analitico { a2 c' c' c'' c' d' b } }
tenor     = { b2 \analitico { f2 e a e' a a e } }
bajo      = { e2 d a, f, a f d e, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Do mayor"}
```lilypond
soprano   = { c''2 f'' e'' d'' e'' d'' d'' e'' d'' d'' }
contralto = { g'2 a' g' g' e' f' g' g' f' d' }
tenor     = { c'2 c' c' b c' a b c' a b }
bajo      = { e2 f g g a f g e f g }
respuestas = {
  \falta "8.ª dir./(S–B)" \sinFalta \sinFalta \falta "5.as par./(S–B)" \sinFalta \falta "8.as par./(A–B)" \sinFalta \sinFalta \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Sol mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { b'2 b' c'' b' a' a' b' a' a' b' }
contralto = \analitico { d'2 e' e' d' c' d' d' c' d' d' }
tenor     = \analitico { g2 g g g e fs g e fs g }
bajo      = { g,2 e, c g, a, d g, a, d g, }
respuestas = {
  \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

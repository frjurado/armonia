---
title: "3.º — UD 1 · Repaso n.º 04"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1004).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Sol mayor"}
```lilypond
arriba = {
  \modelo \encima "G" \analitico <g' b' d''>1 \finModelo
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "Am/C" \analitico <a' c'' e''>1
  \encima "F♯°/A" \analitico <fs' a' c''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "G/B" \analitico <g' b' d''>1
  \encima "D" \analitico <d'' fs'' a''>1
  \encima "G" \analitico <g' b' d''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo g,1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" e,1
  \figuras "6" \gradoBajo "④" \acorde "II6" c1
  \figuras "6" \gradoBajo "②" \acorde "VII6" a,1
  \gradoBajo "①" \acorde "I" g,1
  \figuras "6" \gradoBajo "③" \acorde "I6" b,1
  \gradoBajo "⑤" \acorde "V" d1
  \gradoBajo "①" \acorde "I" g,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="La menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     e''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a''2 \bar "||"
  \rotulo "abierta"     \analitico a'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico e''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e''2 \bar "|."
}
contralto = { c''2 \analitico { c''2 d' c' f' b' f' c'' } }
tenor     = { a'2 \analitico { a'2 f a a gs' a e' } }
bajo      = { a2 f d f d e d a, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Do mayor"}
```lilypond
soprano   = { c''2 b' c'' a' d'' c'' b' c'' f' g' }
contralto = { g'2 g' g' f' g' e' d' e' d' d' }
tenor     = { c'2 d' g a g g f g a b }
bajo      = { e2 g e d b, c d e f g }
respuestas = {
  \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \sinFalta \falta "8.as par./(A–B)" \sinFalta \falta "8.as par./(S–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Do mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { c''2 b' c'' c'' c'' b' c'' c'' b' c'' }
contralto = \analitico { g'2 g' g' a' a' g' g' a' g' g' }
tenor     = \analitico { e'2 d' e' e' f' d' e' f' d' e' }
bajo      = { c'2 g c' a f g c' f g c' }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

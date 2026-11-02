---
title: "3.º — UD 1 · Repaso n.º 09"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1009).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="La menor"}
```lilypond
arriba = {
  \modelo \encima "Am/C" \analitico <a' c'' e''>1 \finModelo
  \encima "B°/D" \analitico <b' d'' f''>1
  \encima "Am/E" \analitico <a' c'' e''>1
  \encima "E" \analitico <e' gs' b'>1
  \encima "F" \analitico <f' a' c''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "E" \analitico <e' gs' b'>1
  \encima "Am" \analitico <a' c'' e''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo c1
  \figuras "6" \gradoBajo "④" \acorde "II6" d1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" e1
  \figuras "5/♯" \gradoBajo "⑤" \acorde "V5/♯" e1
  \gradoBajo "⑥" \acorde "VI" f1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" f1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" e1
  \gradoBajo "①" \acorde "I" a1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="La menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (3.ª)" a''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico gs'2 \bar "||"
  \rotulo "cerrada"     \analitico c'2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e'2 \bar "|."
}
contralto = { c''2 \analitico { c''2 f' b a f' c' c' } }
tenor     = { a'2 \analitico { e'2 d' e e a a e } }
bajo      = { f2 a d e, a, d f a, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Sol mayor"}
```lilypond
soprano   = { d''2 b' e'' d'' a' b' c'' c'' e'' a' }
contralto = { g'2 g' g' g' fs' g' e' c' e' d' }
tenor     = { b2 d' c' b a g g g a fs }
bajo      = { g2 b, c d d e c e c d }
respuestas = {
  \falta "8.ª dir./(S–B)" \sinFalta \sinFalta \sinFalta \falta "5.as par./(S–B)" \sinFalta \sinFalta \falta "8.as par./(S–A)" \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Sol mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { d'2 d' d' e' e' fs' g' e' fs' g' }
contralto = \analitico { b2 a b c' c' d' d' c' d' d' }
tenor     = \analitico { g2 fs g g a a b a a b }
bajo      = { g,2 d g, c a, d g, a, d g, }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

---
title: "3.º — UD 1 · Repaso n.º 19"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1019).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Sol mayor"}
```lilypond
arriba = {
  \modelo \encima "G" \analitico <g' b' d''>1 \finModelo
  \encima "F♯°/A" \analitico <fs' a' c''>1
  \encima "G/B" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
  \encima "G/D" \analitico <g' b' d''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "G/D" \analitico <g' b' d''>1
  \encima "D" \analitico <d'' fs'' a''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo g,1
  \figuras "6" \gradoBajo "②" \acorde "VII6" a,1
  \figuras "6" \gradoBajo "③" \acorde "I6" b,1
  \gradoBajo "④" \acorde "IV" c1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" d1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" e1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" d1
  \figuras "5/3" \gradoBajo "⑤" \acorde "V5/3" d1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="La menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "abierta"     a''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico b'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "||"
  \rotulo "cerrada"     \analitico b'2 \bar "||"
  \rotulo "cerrada"     \analitico c''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico b'2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "|."
}
contralto = { c''2 \analitico { gs'2 c' gs' a' gs' f' c' } }
tenor     = { f'2 \analitico { b2 a e' e' b a a } }
bajo      = { f,2 e, f, e a e d f }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Re menor"}
```lilypond
soprano   = { f''2 e'' f'' d'' cs'' d'' e'' f'' d'' cs'' }
contralto = { a'2 a' a' g' e' f' a' f' g' e' }
tenor     = { a2 cs' d' bf g a a a bf a }
bajo      = { d2 e f g e d cs d g, a, }
respuestas = {
  \sinFalta \falta "8.as par./(S–B)" \sinFalta \falta "8.as par./(A–B)" \sinFalta \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Do mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { e'2 d' e' f' d' e' e' f' f' g' }
contralto = \analitico { c'2 b c' c' b c' c' c' d' d' }
tenor     = \analitico { g2 g g a g g a a a b }
bajo      = { c2 g, c f, g, c a, f d g }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "2 n.c." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

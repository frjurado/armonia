---
title: "3.º — UD 1 · Repaso n.º 17"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1017).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Do mayor"}
```lilypond
arriba = {
  \modelo \encima "C" \analitico <c'' e'' g''>1 \finModelo
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "B°/D" \analitico <b' d'' f''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "Dm" \analitico <d'' f'' a''>1
  \encima "C/G" \analitico <c'' e'' g''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo c1
  \figuras "6" \gradoBajo "④" \acorde "II6" f1
  \figuras "6" \gradoBajo "②" \acorde "VII6" d1
  \figuras "6" \gradoBajo "③" \acorde "I6" e1
  \gradoBajo "②" \acorde "II" d1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" g1
  \figuras "5/3" \gradoBajo "⑤" \acorde "V5/3" g1
  \gradoBajo "①" \acorde "I" c'1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Do mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     g'2 \bar "||"
  \rotulo "abierta"     \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico g''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico f'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico c'2 \bar "||"
  \rotulo "cerrada"     \analitico e'2 \bar "|."
}
contralto = { e'2 \analitico { c'2 c'' e' a b a b } }
tenor     = { c'2 \analitico { f2 e' c' f d c g } }
bajo      = { c2 f, c' a, d g, f, e, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Do mayor"}
```lilypond
soprano   = { e''2 c'' e'' c'' d'' e'' d'' c'' b' c'' }
contralto = { g'2 a' g' f' g' g' f' c' d' e' }
tenor     = { c'2 c' c' a b c' b g g g }
bajo      = { c'2 f g a g e d e g c }
respuestas = {
  \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \falta "5.as par./(S–A)" \sinFalta \falta "8.as par./(S–B)" \sinFalta \sinFalta \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Re menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { d''2 cs'' d'' d'' d'' d'' d'' d'' cs'' d'' }
contralto = \analitico { a'2 a' a' bf' bf' a' bf' bf' a' a' }
tenor     = \analitico { f'2 e' f' f' g' f' f' g' e' f' }
bajo      = { d2 a, d bf, g, d bf, g, a, d }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

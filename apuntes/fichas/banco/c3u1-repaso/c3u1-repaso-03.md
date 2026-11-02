---
title: "3.º — UD 1 · Repaso n.º 03"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1003).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Do mayor"}
```lilypond
arriba = {
  \modelo \encima "C/E" \analitico <c'' e'' g''>1 \finModelo
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "C/G" \analitico <c'' e'' g''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "F" \analitico <f' a' c''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo e1
  \figuras "6" \gradoBajo "④" \acorde "II6" f1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" g1
  \figuras "5/3" \gradoBajo "⑤" \acorde "V5/3" g1
  \figuras "6" \gradoBajo "③" \acorde "I6" e1
  \gradoBajo "④" \acorde "IV" f1
  \gradoBajo "⑤" \acorde "V" g1
  \gradoBajo "①" \acorde "I" c'1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Sol mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "abierta"     d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "cerrada"     \analitico d''2 \bar "||"
  \rotulo "abierta"     \analitico b'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico g'2 \bar "||"
  \rotulo "cerrada"     \analitico g'2 \bar "|."
}
contralto = { fs'2 \analitico { b2 e' b' e' fs' e' d' } }
tenor     = { a2 \analitico { g2 c' fs' g a g b } }
bajo      = { d2 e a, b e d c g, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Sol mayor"}
```lilypond
soprano   = { b'2 a' d'' c'' d'' c'' d'' d'' c'' d'' }
contralto = { d'2 d' d' fs' g' a' a' d' e' fs' }
tenor     = { g2 a b c' d' e' d' b a a }
bajo      = { b,2 fs, g, a, b, a, fs, g, a, d }
respuestas = {
  \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \falta "8.as par./(S–T)" \sinFalta \sinFalta \sinFalta \falta "5.as par./(A–B)" \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="La menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { e''2 f'' f'' e'' e'' f'' e'' f'' f'' e'' }
contralto = \analitico { a'2 a' a' gs' a' a' a' a' a' gs' }
tenor     = \analitico { c'2 c' d' b c' d' c' c' d' b }
bajo      = { a,2 f d e a, d a, f d e }
respuestas = {
  \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

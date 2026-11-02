---
title: "3.º — UD 1 · Repaso n.º 08"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1008).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Do mayor"}
```lilypond
arriba = {
  \modelo \encima "C/E" \analitico <c'' e'' g''>1 \finModelo
  \encima "Dm" \analitico <d'' f'' a''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "C/G" \analitico <c'' e'' g''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo e1
  \gradoBajo "②" \acorde "II" d1
  \gradoBajo "⑤" \acorde "V" g1
  \figuras "6" \gradoBajo "③" \acorde "I6" e1
  \figuras "6" \gradoBajo "④" \acorde "II6" f1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" g1
  \figuras "5/3" \gradoBajo "⑤" \acorde "V5/3" g1
  \gradoBajo "①" \acorde "I" c1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Re menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d'2 \bar "||"
  \rotulo "abierta"     \analitico g'2 \bar "||"
  \rotulo "cerrada"     \analitico d''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d''2 \bar "||"
  \rotulo "abierta"     \analitico a''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e''2 \bar "|."
}
contralto = { a'2 \analitico { f2 bf bf' bf' cs'' f cs'' } }
tenor     = { f'2 \analitico { d2 d f' d' e' d e' } }
bajo      = { d2 bf, g, bf, g, a bf, a }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Sol mayor"}
```lilypond
soprano   = { b'2 a' b' a' b' g' b' g' b' a' }
contralto = { d'2 d' d' d' b c' d' e' d' d' }
tenor     = { g2 fs g fs g g g g g fs }
bajo      = { g,2 a, b, d e e d c d d }
respuestas = {
  \sinFalta \falta "8.as par./(S–B)" \sinFalta \falta "5.as par./(S–B)" \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Sol mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { d''2 c'' d'' d'' d'' e'' e'' d'' c'' d'' }
contralto = \analitico { g'2 e' fs' g' fs' g' g' g' e' fs' }
tenor     = \analitico { b2 a a b b b c' b a a }
bajo      = { g,2 a, d g, b, e, c g, a, d }
respuestas = {
  \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

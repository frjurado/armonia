---
title: "3.º — UD 1 · Repaso n.º 14"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1014).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Do mayor"}
```lilypond
arriba = {
  \modelo \encima "C/E" \analitico <c'' e'' g''>1 \finModelo
  \encima "G/D" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "B°/D" \analitico <b' d'' f''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "C" \analitico <c'' e'' g''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo e1
  \figuras "6/4" \gradoBajo "②" \acorde "V6/4" d1
  \gradoBajo "①" \acorde "I" c1
  \figuras "6" \gradoBajo "④" \acorde "II6" f1
  \figuras "6" \gradoBajo "②" \acorde "VII6" d1
  \figuras "6" \gradoBajo "③" \acorde "I6" e1
  \gradoBajo "⑤" \acorde "V" g1
  \gradoBajo "①" \acorde "I" c1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Re menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "abierta"     d''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "cerrada"     \analitico d''2 \bar "||"
  \rotulo "abierta"     \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico bf'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "|."
}
contralto = { g'2 \analitico { f'2 bf' d' bf f' g' f' } }
tenor     = { bf2 \analitico { a2 g' f d d' d' d' } }
bajo      = { g2 d g, d g, bf, g bf }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="La menor"}
```lilypond
soprano   = { a'2 c'' b' c'' b' e'' d'' e'' f'' e'' }
contralto = { c'2 c' e' e' e' e' gs' a' a' gs' }
tenor     = { e2 a gs a b c' b c' d' b }
bajo      = { a,2 f, e, a, gs, a, b, a, f e }
respuestas = {
  \sinFalta \falta "5.as par./(S–B)" \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \sinFalta \falta "8.as par./(S–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="La menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { c''2 b' c'' d'' c'' b' c'' c'' d'' b' }
contralto = \analitico { e'2 e' e' f' e' e' e' f' f' e' }
tenor     = \analitico { a2 gs a a a gs a a a gs }
bajo      = { a,2 e a, d a, e a, f d e }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

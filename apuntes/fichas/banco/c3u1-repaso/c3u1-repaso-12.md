---
title: "3.º — UD 1 · Repaso n.º 12"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1012).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Re menor"}
```lilypond
arriba = {
  \modelo \encima "Dm" \analitico <d'' f'' a''>1 \finModelo
  \encima "A/C♯" \analitico <a' cs'' e''>1
  \encima "Dm" \analitico <d'' f'' a''>1
  \encima "A/E" \analitico <a' cs'' e''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "Gm" \analitico <g' bf' d''>1
  \encima "Dm/A" \analitico <d'' f'' a''>1
  \encima "A" \analitico <a' cs'' e''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo d1
  \figuras "6" \gradoBajo "♯⑦" \acorde "V6" cs1
  \gradoBajo "①" \acorde "I" d1
  \figuras "♯6/4" \gradoBajo "②" \acorde "V6/4" e1
  \figuras "6" \gradoBajo "③" \acorde "I6" f1
  \gradoBajo "④" \acorde "IV" g1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" a1
  \figuras "5/♯" \gradoBajo "⑤" \acorde "V5/♯" a1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Sol mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     g'2 \bar "||"
  \rotulo "cerrada"     \analitico g'2 \bar "||"
  \rotulo "abierta"     \analitico a''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico c''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g''2 \bar "|."
}
contralto = { e'2 \analitico { e'2 c'' b fs' e' b' b' } }
tenor     = { c'2 \analitico { b2 e' g a a d' g' } }
bajo      = { c2 e, a e, d a, g, e }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Re menor"}
```lilypond
soprano   = { f''2 d'' f'' d'' d'' cs'' a' a' d'' cs'' }
contralto = { a'2 bf' a' g' f' e' e' f' g' e' }
tenor     = { d'2 d' d' bf a a a a bf a }
bajo      = { d2 g, a, bf, a, a, cs d bf, a, }
respuestas = {
  \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \falta "8.as par./(T–B)" \sinFalta \sinFalta \sinFalta \sinFalta \falta "8.as par./(T–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Do mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { c''2 b' c'' c'' c'' c'' b' c'' c'' b' }
contralto = \analitico { e'2 d' e' e' f' e' d' e' f' d' }
tenor     = \analitico { g2 g g a a g g g a g }
bajo      = { c2 g, c a, f, c g, c f, g, }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

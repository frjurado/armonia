---
title: "3.º — UD 1 · Repaso n.º 07"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1007).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Re menor"}
```lilypond
arriba = {
  \modelo \encima "Dm/F" \analitico <d'' f'' a''>1 \finModelo
  \encima "C♯°/E" \analitico <cs'' e'' g''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "A" \analitico <a' cs'' e''>1
  \encima "B♭" \analitico <bf' d'' f''>1
  \encima "Gm" \analitico <g' bf' d''>1
  \encima "Dm/A" \analitico <d'' f'' a''>1
  \encima "A" \analitico <a' cs'' e''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo f,1
  \figuras "♯6" \gradoBajo "②" \acorde "VII6" e,1
  \figuras "6" \gradoBajo "③" \acorde "I6" f,1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" a,1
  \gradoBajo "⑥" \acorde "VI" bf,1
  \gradoBajo "④" \acorde "IV" g,1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" a,1
  \figuras "5/♯" \gradoBajo "⑤" \acorde "V5/♯" a,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Sol mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     d'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico g'2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g'2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico g'2 \bar "||"
  \rotulo "abierta"     \analitico e'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g'2 \bar "|."
}
contralto = { a2 \analitico { e'2 e' b fs' e' a b } }
tenor     = { fs2 \analitico { g2 c' g a g c g } }
bajo      = { d2 c a, e, d c a, e }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Do mayor"}
```lilypond
soprano   = { e''2 f'' d'' c'' f'' e'' d'' e'' d'' d'' }
contralto = { g'2 f' g' e' a' g' g' e' f' g' }
tenor     = { c'2 a b c' c' c' b c' a b }
bajo      = { c2 d g, a, f, g, g, a, f, g, }
respuestas = {
  \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \sinFalta \sinFalta \falta "5.as par./(S–B)" \sinFalta \falta "8.as par./(A–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Do mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { g''2 g'' a'' a'' g'' a'' a'' g'' a'' g'' }
contralto = \analitico { c''2 b' c'' c'' c'' c'' c'' c'' c'' b' }
tenor     = \analitico { e'2 e' e' f' e' e' f' e' f' d' }
bajo      = { c2 e, a, f, c a, f, c f, g, }
respuestas = {
  \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "1 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

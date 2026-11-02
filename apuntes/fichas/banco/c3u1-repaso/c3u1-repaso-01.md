---
title: "3.º — UD 1 · Repaso n.º 01"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1001).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="La menor"}
```lilypond
arriba = {
  \modelo \encima "Am/C" \analitico <a' c'' e''>1 \finModelo
  \encima "G♯°/B" \analitico <gs' b' d''>1
  \encima "Am" \analitico <a' c'' e''>1
  \encima "B°/D" \analitico <b' d'' f''>1
  \encima "G♯°/B" \analitico <gs' b' d''>1
  \encima "Am" \analitico <a' c'' e''>1
  \encima "E" \analitico <e' gs' b'>1
  \encima "Am" \analitico <a' c'' e''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo c1
  \figuras "♯6" \gradoBajo "②" \acorde "VII6" b,1
  \gradoBajo "①" \acorde "I" a,1
  \figuras "6" \gradoBajo "④" \acorde "II6" d1
  \figuras "♯6" \gradoBajo "②" \acorde "VII6" b,1
  \gradoBajo "①" \acorde "I" a,1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" e1
  \gradoBajo "①" \acorde "I" a,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Re menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "abierta"     a''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico d'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "|."
}
contralto = { cs''2 \analitico { f'2 cs'' f' e' f' bf f' } }
tenor     = { e'2 \analitico { a2 e' d' cs' bf g d' } }
bajo      = { a2 d a, bf, a bf, g, bf, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="La menor"}
```lilypond
soprano   = { c''2 d'' c'' b' e'' d'' e'' c'' d'' e'' }
contralto = { c'2 d' e' e' e' a' gs' a' a' gs' }
tenor     = { e2 gs a b c' a b c' a b }
bajo      = { a,2 b, a, gs, a, f, e, f, f, e, }
respuestas = {
  \falta "8.as par./(S–A)" \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \falta "5.as par./(T–B)" \sinFalta \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Re menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { f''2 g'' f'' e'' f'' g'' f'' f'' g'' e'' }
contralto = \analitico { a'2 bf' a' a' a' bf' a' bf' bf' a' }
tenor     = \analitico { d'2 d' d' cs' d' d' d' d' d' cs' }
bajo      = { d2 g d a d g d bf g a }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

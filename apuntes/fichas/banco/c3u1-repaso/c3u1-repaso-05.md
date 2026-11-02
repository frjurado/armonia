---
title: "3.º — UD 1 · Repaso n.º 05"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1005).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Sol mayor"}
```lilypond
arriba = {
  \modelo \encima "G/B" \analitico <g' b' d''>1 \finModelo
  \encima "C" \analitico <c'' e'' g''>1
  \encima "C/E" \analitico <c'' e'' g''>1
  \encima "Am/C" \analitico <a' c'' e''>1
  \encima "F♯°/A" \analitico <fs' a' c''>1
  \encima "G/B" \analitico <g' b' d''>1
  \encima "D" \analitico <d'' fs'' a''>1
  \encima "G" \analitico <g' b' d''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo b,1
  \gradoBajo "④" \acorde "IV" c1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" e,1
  \figuras "6" \gradoBajo "④" \acorde "II6" c1
  \figuras "6" \gradoBajo "②" \acorde "VII6" a,1
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
  \rotulo "abierta"     f'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico e''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a''2 \bar "||"
  \rotulo "cerrada"     \analitico d'2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico gs'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico a'2 \bar "|."
}
contralto = { a2 \analitico { c''2 c'' a f' b f' c' } }
tenor     = { c2 \analitico { e'2 a' f c' e a a } }
bajo      = { f,2 a, f d f e, d f }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="La menor"}
```lilypond
soprano   = { a'2 c'' c'' b' c'' b' e'' d'' e'' e'' }
contralto = { a2 c' c' e' e' e' e' a' gs' a' }
tenor     = { e2 e a gs a b c' d' b c' }
bajo      = { c2 a, f, e, a, gs, a, f, e, a, }
respuestas = {
  \falta "8.as par./(S–A)" \sinFalta \falta "5.as par./(S–B)" \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="La menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { a'2 gs' a' a' a' a' a' a' a' gs' }
contralto = \analitico { e'2 e' e' f' e' f' f' e' f' e' }
tenor     = \analitico { c'2 b c' d' c' c' d' c' d' b }
bajo      = { a,2 e a, d a, f d a d e }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "1 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

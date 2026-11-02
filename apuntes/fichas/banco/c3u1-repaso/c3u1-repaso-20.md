---
title: "3.º — UD 1 · Repaso n.º 20"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1020).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="La menor"}
```lilypond
arriba = {
  \modelo \encima "Am" \analitico <a' c'' e''>1 \finModelo
  \encima "Am/C" \analitico <a' c'' e''>1
  \encima "E/B" \analitico <e' gs' b'>1
  \encima "Am" \analitico <a' c'' e''>1
  \encima "E/G♯" \analitico <e' gs' b'>1
  \encima "Am" \analitico <a' c'' e''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "E" \analitico <e' gs' b'>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo a,1
  \figuras "6" \gradoBajo "③" \acorde "I6" c1
  \figuras "♯6/4" \gradoBajo "②" \acorde "V6/4" b,1
  \gradoBajo "①" \acorde "I" a,1
  \figuras "6" \gradoBajo "♯⑦" \acorde "V6" gs,1
  \gradoBajo "①" \acorde "I" a,1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" f,1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" e,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Sol mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (5.ª)" d'2 \bar "||"
  \rotulo "abierta"     \analitico a''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "cerrada"     \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico g'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico g'2 \bar "||"
  \rotulo "abierta"     \analitico g''2 \bar "|."
}
contralto = { b2 \analitico { d''2 e' b' b' b e' b' } }
tenor     = { d2 \analitico { fs'2 c' fs' g' g g d' } }
bajo      = { g,2 d a b g, e c g }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Sol mayor"}
```lilypond
soprano   = { b'2 a' g' c'' b' c'' c'' b' d'' g' }
contralto = { d'2 d' d' e' d' e' e' d' fs' d' }
tenor     = { g2 fs g g g g g g a b }
bajo      = { g,2 a, b, c d e c d d g }
respuestas = {
  \sinFalta \sinFalta \falta "8.ª dir./(S–B)" \sinFalta \falta "8.as par./(A–B)" \sinFalta \sinFalta \sinFalta \falta "8.as par./contr./(S–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="La menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { a'2 a' a' a' a' gs' a' a' a' gs' }
contralto = \analitico { e'2 f' e' f' f' e' e' f' f' e' }
tenor     = \analitico { c'2 d' c' c' d' b c' c' d' b }
bajo      = { a,2 d a, f d e a f d e }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

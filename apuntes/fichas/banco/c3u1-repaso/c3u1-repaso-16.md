---
title: "3.º — UD 1 · Repaso n.º 16"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1016).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="La menor"}
```lilypond
arriba = {
  \modelo \encima "Am/C" \analitico <a' c'' e''>1 \finModelo
  \encima "Am" \analitico <a' c'' e''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "Am/E" \analitico <a' c'' e''>1
  \encima "E" \analitico <e' gs' b'>1
  \encima "Am/C" \analitico <a' c'' e''>1
  \encima "Dm" \analitico <d'' f'' a''>1
  \encima "E" \analitico <e' gs' b'>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo c1
  \gradoBajo "①" \acorde "I" a,1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" f1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" e1
  \figuras "5/♯" \gradoBajo "⑤" \acorde "V5/♯" e1
  \figuras "6" \gradoBajo "③" \acorde "I6" c1
  \gradoBajo "④" \acorde "IV" d1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" e1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Do mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (5.ª)" c''2 \bar "||"
  \rotulo "abierta"     \analitico f''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico b'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico f'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico c'2 \bar "|."
}
contralto = { a'2 \analitico { a'2 e' d' e' a b' g } }
tenor     = { c'2 \analitico { d'2 c' g c' f d' e } }
bajo      = { f2 d a, g, a, d g, c }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Sol mayor"}
```lilypond
soprano   = { d''2 b' c'' c'' d'' g' a' b' c'' a' }
contralto = { g'2 g' g' fs' g' e' fs' g' e' fs' }
tenor     = { b2 d' e' c' d' c' c' d' c' d' }
bajo      = { g2 b c' a b c' a g a d }
respuestas = {
  \sinFalta \falta "8.as par./(S–B)" \sinFalta \falta "8.as par./(S–T)" \sinFalta \sinFalta \sinFalta \sinFalta \falta "5.ª dir./(S–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Do mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { c''2 b' c'' c'' c'' b' c'' c'' c'' b' }
contralto = \analitico { g'2 g' g' a' a' g' g' a' a' g' }
tenor     = \analitico { e'2 d' e' e' f' d' e' e' f' d' }
bajo      = { c'2 g c' a f g c' a f g }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

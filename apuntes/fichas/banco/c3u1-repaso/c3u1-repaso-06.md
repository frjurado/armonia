---
title: "3.º — UD 1 · Repaso n.º 06"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1006).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="La menor"}
```lilypond
arriba = {
  \modelo \encima "Am" \analitico <a' c'' e''>1 \finModelo
  \encima "E/G♯" \analitico <e' gs' b'>1
  \encima "Am" \analitico <a' c'' e''>1
  \encima "E/B" \analitico <e' gs' b'>1
  \encima "Am/C" \analitico <a' c'' e''>1
  \encima "B°/D" \analitico <b' d'' f''>1
  \encima "E" \analitico <e' gs' b'>1
  \encima "Am" \analitico <a' c'' e''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo a,1
  \figuras "6" \gradoBajo "♯⑦" \acorde "V6" gs,1
  \gradoBajo "①" \acorde "I" a,1
  \figuras "♯6/4" \gradoBajo "②" \acorde "V6/4" b,1
  \figuras "6" \gradoBajo "③" \acorde "I6" c1
  \figuras "6" \gradoBajo "④" \acorde "II6" d1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" e1
  \gradoBajo "①" \acorde "I" a,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Do mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (5.ª)" c'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d''2 \bar "||"
  \rotulo "abierta"     \analitico g'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "abierta"     \analitico g''2 \bar "||"
  \rotulo "cerrada"     \analitico f'2 \bar "|."
}
contralto = { a2 \analitico { b'2 b e' f' e' b' d' } }
tenor     = { c2 \analitico { d'2 e c' c' c' d' a } }
bajo      = { f,2 g e, a f, a g d }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Re menor"}
```lilypond
soprano   = { a'2 a' d'' cs'' d'' e'' f'' f'' a'' a'' }
contralto = { d'2 e' f' e' f' g' a' d'' cs'' d'' }
tenor     = { f2 a a a a cs' d' f' e' f' }
bajo      = { d2 cs d e f e d bf a d }
respuestas = {
  \sinFalta \falta "8.ª dir./(S–B)" \sinFalta \falta "8.as par./(A–B)" \sinFalta \sinFalta \sinFalta \falta "5.as par./(T–B)" \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Re menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { a'2 a' a' bf' bf' a' a' bf' a' a' }
contralto = \analitico { f'2 e' f' f' g' e' f' g' e' f' }
tenor     = \analitico { d'2 cs' d' d' d' cs' d' d' cs' d' }
bajo      = { d2 a, d bf, g, a, d g, a, d }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

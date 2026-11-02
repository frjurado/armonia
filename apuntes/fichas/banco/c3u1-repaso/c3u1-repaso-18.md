---
title: "3.º — UD 1 · Repaso n.º 18"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1018).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Re menor"}
```lilypond
arriba = {
  \modelo \encima "Dm" \analitico <d'' f'' a''>1 \finModelo
  \encima "E°/G" \analitico <e' g' bf'>1
  \encima "C♯°/E" \analitico <cs'' e'' g''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "Gm" \analitico <g' bf' d''>1
  \encima "E°/G" \analitico <e' g' bf'>1
  \encima "A" \analitico <a' cs'' e''>1
  \encima "Dm" \analitico <d'' f'' a''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo d1
  \figuras "6" \gradoBajo "④" \acorde "II6" g1
  \figuras "♯6" \gradoBajo "②" \acorde "VII6" e1
  \figuras "6" \gradoBajo "③" \acorde "I6" f1
  \gradoBajo "④" \acorde "IV" g1
  \figuras "6" \gradoBajo "④" \acorde "II6" g1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" a1
  \gradoBajo "①" \acorde "I" d1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Re menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (3.ª)" d'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d'2 \bar "||"
  \rotulo "cerrada"     \analitico cs''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "abierta"     \analitico bf'2 \bar "||"
  \rotulo "abierta"     \analitico g''2 \bar "||"
  \rotulo "cerrada"     \analitico bf'2 \bar "|."
}
contralto = { f2 \analitico { bf2 a' f f' d' bf' f' } }
tenor     = { d2 \analitico { d2 e' d a f d' d' } }
bajo      = { bf,2 g, a, bf, d bf, g bf }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="La menor"}
```lilypond
soprano   = { e''2 d'' b' e'' d'' e'' e'' e'' a' b' }
contralto = { a'2 a' gs' a' gs' a' gs' a' f' e' }
tenor     = { c'2 a b a b c' b c' a gs }
bajo      = { a,2 f, e, c b, a, b, c d e }
respuestas = {
  \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \sinFalta \sinFalta \falta "8.as par./(T–B)" \sinFalta \falta "5.as par./(S–B)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Sol mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { g''2 fs'' g'' fs'' g'' g'' g'' e'' fs'' g'' }
contralto = \analitico { b'2 a' b' b' b' c'' b' a' a' b' }
tenor     = \analitico { d'2 d' d' d' e' e' d' c' d' d' }
bajo      = { g,2 d g, b, e, c g, a, d g, }
respuestas = {
  \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

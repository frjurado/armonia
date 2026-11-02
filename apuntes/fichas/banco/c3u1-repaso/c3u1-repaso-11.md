---
title: "3.º — UD 1 · Repaso n.º 11"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1011).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Re menor"}
```lilypond
arriba = {
  \modelo \encima "Dm" \analitico <d'' f'' a''>1 \finModelo
  \encima "E°/G" \analitico <e' g' bf'>1
  \encima "C♯°/E" \analitico <cs'' e'' g''>1
  \encima "Dm/F" \analitico <d'' f'' a''>1
  \encima "A/E" \analitico <a' cs'' e''>1
  \encima "Dm" \analitico <d'' f'' a''>1
  \encima "Gm/B♭" \analitico <g' bf' d''>1
  \encima "A" \analitico <a' cs'' e''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo d1
  \figuras "6" \gradoBajo "④" \acorde "II6" g1
  \figuras "♯6" \gradoBajo "②" \acorde "VII6" e1
  \figuras "6" \gradoBajo "③" \acorde "I6" f1
  \figuras "♯6/4" \gradoBajo "②" \acorde "V6/4" e1
  \gradoBajo "①" \acorde "I" d1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" bf1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" a1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Sol mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "mixta (5.ª)" g'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "abierta"     \analitico e''2 \bar "||"
  \rotulo "abierta"     \analitico b'2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico c''2 \bar "||"
  \rotulo "cerrada"     \analitico b'2 \bar "||"
  \rotulo "cerrada"     \analitico e'2 \bar "|."
}
contralto = { e'2 \analitico { fs'2 e' g' d' e' fs' c' } }
tenor     = { g2 \analitico { a2 c' c' g c' d' a } }
bajo      = { c2 d a c g, a, b a, }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="La menor"}
```lilypond
soprano   = { a'2 b' c'' c'' b' c'' b' e'' d'' e'' }
contralto = { c'2 b c' c' e' e' e' e' a' gs' }
tenor     = { e2 e e a gs a b c' a b }
bajo      = { a,2 gs, a, f, e, a, gs, a, f, e, }
respuestas = {
  \sinFalta \falta "8.as par./(S–A)" \sinFalta \falta "5.as par./(S–B)" \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Re menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { f'2 f' g' e' f' f' g' f' e' f' }
contralto = \analitico { d'2 d' d' cs' d' d' d' d' cs' d' }
tenor     = \analitico { a2 bf bf a a bf bf a a a }
bajo      = { d2 bf, g, a, d bf, g, d a, d }
respuestas = {
  \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "1 n.c." \paso "1 n.c."
}
```

Elige tú el primer acorde.
:::

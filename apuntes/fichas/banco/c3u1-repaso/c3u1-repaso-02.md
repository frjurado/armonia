---
title: "3.º — UD 1 · Repaso n.º 02"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1002).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Re menor"}
```lilypond
arriba = {
  \modelo \encima "Dm" \analitico <d'' f'' a''>1 \finModelo
  \encima "Gm/B♭" \analitico <g' bf' d''>1
  \encima "Dm/A" \analitico <d'' f'' a''>1
  \encima "A" \analitico <a' cs'' e''>1
  \encima "Dm" \analitico <d'' f'' a''>1
  \encima "Gm/B♭" \analitico <g' bf' d''>1
  \encima "E°/G" \analitico <e' g' bf'>1
  \encima "A" \analitico <a' cs'' e''>1
}
abajo = {
  \modelo \gradoBajo "①" \acorde "I" \finModelo d1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" bf,1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" a,1
  \figuras "5/♯" \gradoBajo "⑤" \acorde "V5/♯" a,1
  \gradoBajo "①" \acorde "I" d1
  \figuras "6" \gradoBajo "⑥" \acorde "IV6" bf,1
  \figuras "6" \gradoBajo "④" \acorde "II6" g,1
  \figuras "♯" \gradoBajo "⑤" \acorde "V♯" a,1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Do mayor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     f'2 \bar "||"
  \rotulo "abierta"     \analitico g''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico f''2 \bar "||"
  \rotulo "cerrada"     \analitico e''2 \bar "||"
  \rotulo "abierta"     \analitico e''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico c'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico f''2 \bar "|."
}
contralto = { c'2 \analitico { b'2 a' b' g' a b' a' } }
tenor     = { a2 \analitico { e'2 f' g' c' c d' f' } }
bajo      = { f2 e, d e c f, g d }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Re menor"}
```lilypond
soprano   = { f''2 g'' f'' d'' f'' e'' d'' d'' d'' cs'' }
contralto = { a'2 g' a' bf' a' e' f' g' d' e' }
tenor     = { d'2 d' d' d' d' cs' d' bf g a }
bajo      = { d2 bf, a, g, a, a, bf, g, bf, a, }
respuestas = {
  \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \sinFalta \falta "5.as par./(A–B)" \sinFalta \sinFalta \falta "5.as par./(A–T)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="Sol mayor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { d''2 c'' d'' d'' d'' e'' e'' d'' e'' d'' }
contralto = \analitico { b'2 a' a' b' b' b' c'' b' c'' a' }
tenor     = \analitico { g'2 e' fs' g' fs' g' g' g' g' fs' }
bajo      = { g2 a d g b, e c g c d }
respuestas = {
  \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "1 n.c." \paso "1 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::

---
title: "3.º — UD 1 · Repaso n.º 10"
subtitle: "Morfología y conducción de voces"
---

<!-- guion:inicio -->

> Generada con herramientas/generar-fichas.js del modelo c3u1-repaso (semilla 1010).
> No se edita a mano: se regenera.

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado" tono="Sol mayor"}
```lilypond
arriba = {
  \modelo \encima "G/B" \analitico <g' b' d''>1 \finModelo
  \encima "D/F♯" \analitico <d'' fs'' a''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "F♯°/A" \analitico <fs' a' c''>1
  \encima "G" \analitico <g' b' d''>1
  \encima "Am" \analitico <a' c'' e''>1
  \encima "G/D" \analitico <g' b' d''>1
  \encima "D" \analitico <d'' fs'' a''>1
}
abajo = {
  \figuras "6" \modelo \gradoBajo "③" \acorde "I6" \finModelo b,1
  \figuras "6" \gradoBajo "⑦" \acorde "V6" fs,1
  \gradoBajo "①" \acorde "I" g,1
  \figuras "6" \gradoBajo "②" \acorde "VII6" a,1
  \gradoBajo "①" \acorde "I" g,1
  \gradoBajo "②" \acorde "II" a,1
  \figuras "6/4" \gradoBajo "⑤" \acorde "I6/4" d1
  \figuras "5/3" \gradoBajo "⑤" \acorde "V5/3" d1
}
```
:::

::: {.ejercicio tipo="construir-acordes" tono="Re menor" pide="mixta"}
```lilypond
solucionPosible = ##t
soprano = {
  \rotulo "cerrada"     d''2 \bar "||"
  \rotulo "abierta"     \analitico f''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "||"
  \rotulo "abierta"     \analitico d''2 \bar "||"
  \rotulo "mixta (3.ª)" \analitico d''2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico a'2 \bar "||"
  \rotulo "mixta (5.ª)" \analitico d''2 \bar "||"
  \rotulo "cerrada"     \analitico a'2 \bar "|."
}
contralto = { bf'2 \analitico { a'2 f' f' f' f' bf' e' } }
tenor     = { g'2 \analitico { d'2 d' a d' a d' cs' } }
bajo      = { g,2 d bf, d bf, d g, a }
```
:::

::: {.ejercicio tipo="faltas-paralelas" tono="Re menor"}
```lilypond
soprano   = { f''2 e'' f'' d'' cs'' d'' d'' d'' d'' cs'' }
contralto = { a'2 a' f' g' e' f' g' f' d' e' }
tenor     = { a2 a a bf a f bf a g a }
bajo      = { d2 cs d g, a, bf, g, a, bf, a, }
respuestas = {
  \sinFalta \sinFalta \falta "5.ª dir./(S–B)" \sinFalta \falta "5.as par./(A–B)" \sinFalta \sinFalta \sinFalta \falta "5.as par./(A–T)"
}
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes" tono="La menor"}
```lilypond
solucionPosible = ##t
soprano   = \analitico { a'2 a' a' a' a' a' gs' a' a' gs' }
contralto = \analitico { e'2 f' f' e' f' f' e' e' f' e' }
tenor     = \analitico { c'2 c' d' c' c' d' b c' d' b }
bajo      = { a2 f d a f d e a d e }
respuestas = {
  \paso "2 n.c." \paso "2 n.c." \paso "1 n.c." \paso "2 n.c." \paso "2 n.c." \paso "contr." \paso "1 n.c." \paso "1 n.c." \paso "contr."
}
```

Elige tú el primer acorde.
:::
